<?php

namespace App\Actions\Orders;

use App\Enums\OrderItemStatus;
use App\Enums\OrderStatus;
use App\Models\Order;
use App\Repositories\OrderItems\OrderItemRepositoryInterface;
use App\Repositories\Orders\OrderRepositoryInterface;
use App\Repositories\Products\ProductRepositoryInterface;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

class AddOrderItemAction
{
    public function __construct(
        private readonly RecalculateOrderTotalAction $recalculateOrderTotal,
        private readonly OrderRepositoryInterface $orders,
        private readonly OrderItemRepositoryInterface $orderItems,
        private readonly ProductRepositoryInterface $products,
    ) {}

    public function execute(Order $order, array $data): Order
    {
        $result = DB::transaction(function () use ($order, $data) {
            $lockedOrder = $this->orders->lockById($order->id);

            if (! in_array($lockedOrder->status, OrderStatus::itemEditableValues(), true)) {
                throw new ConflictHttpException('Order is not open for item changes.');
            }

            $product = $this->products->lockById($data['product_id']);

            if (! $product->is_available) {
                throw new UnprocessableEntityHttpException('Product is not available.');
            }

            if ($product->stock_quantity !== null && $product->stock_quantity < $data['quantity']) {
                throw new UnprocessableEntityHttpException('Product does not have enough stock.');
            }

            $this->orderItems->createForOrder($lockedOrder, [
                'product_id' => $product->id,
                'quantity' => $data['quantity'],
                'unit_price' => $product->price,
                'notes' => $data['notes'] ?? null,
                'status' => OrderItemStatus::Pending->value,
            ]);

            $this->products->decrementStock($product, $data['quantity']);

            return $this->recalculateOrderTotal->execute($lockedOrder);
        });
        
        event(new \App\Events\OrderUpdated());
        
        return $result;
    }
}
