<?php

namespace App\Actions\Orders;

use App\Enums\OrderItemStatus;
use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\OrderItem;
use App\Repositories\OrderItems\OrderItemRepositoryInterface;
use App\Repositories\Orders\OrderRepositoryInterface;
use App\Repositories\Products\ProductRepositoryInterface;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

class UpdateOrderItemAction
{
    public function __construct(
        private readonly RecalculateOrderTotalAction $recalculateOrderTotal,
        private readonly OrderRepositoryInterface $orders,
        private readonly OrderItemRepositoryInterface $orderItems,
        private readonly ProductRepositoryInterface $products,
    ) {}

    public function execute(OrderItem $orderItem, array $data): Order
    {
        return DB::transaction(function () use ($orderItem, $data) {
            $lockedItem = $this->orderItems->lockById($orderItem->id);

            $order = $this->orders->lockById($lockedItem->order_id);

            if (! in_array($order->status, OrderStatus::itemEditableValues(), true)) {
                throw new ConflictHttpException('Order is not open for item changes.');
            }

            if (($data['status'] ?? null) === OrderItemStatus::Canceled->value) {
                throw new ConflictHttpException('Use the dedicated operation to cancel order items.');
            }

            if (array_key_exists('quantity', $data)) {
                $product = $this->products->lockById($lockedItem->product_id);
                $difference = (int) $data['quantity'] - (int) $lockedItem->quantity;

                if ($difference > 0) {
                    if ($product->stock_quantity !== null && $product->stock_quantity < $difference) {
                        throw new UnprocessableEntityHttpException('Product does not have enough stock.');
                    }

                    $this->products->decrementStock($product, $difference);
                }

                if ($difference < 0) {
                    $this->products->incrementStock($product, abs($difference));
                }
            }

            $this->orderItems->update($lockedItem, $data);

            return $this->recalculateOrderTotal->execute($order);
        });
    }
}
