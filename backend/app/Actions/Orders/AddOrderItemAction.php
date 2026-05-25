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
    ) {
    }

    public function execute(Order $order, array $data): Order
    {
        return DB::transaction(function () use ($order, $data) {
            $lockedOrder = $this->orders->lockById($order->id);

            if (!in_array($lockedOrder->status, OrderStatus::activeValues(), true)) {
                throw new ConflictHttpException('Order is not open for item changes.');
            }

            $product = $this->products->findOrFail($data['product_id']);

            if (!$product->is_available) {
                throw new UnprocessableEntityHttpException('Product is not available.');
            }

            $this->orderItems->createForOrder($lockedOrder, [
                'product_id' => $product->id,
                'quantity' => $data['quantity'],
                'unit_price' => $product->price,
                'notes' => $data['notes'] ?? null,
                'status' => OrderItemStatus::Pending->value,
            ]);

            return $this->recalculateOrderTotal->execute($lockedOrder);
        });
    }
}
