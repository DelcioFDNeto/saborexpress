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

class CancelOrderItemAction
{
    public function __construct(
        private readonly RecalculateOrderTotalAction $recalculateOrderTotal,
        private readonly OrderRepositoryInterface $orders,
        private readonly OrderItemRepositoryInterface $orderItems,
        private readonly ProductRepositoryInterface $products,
    ) {}

    public function execute(OrderItem $orderItem): Order
    {
        return DB::transaction(function () use ($orderItem) {
            $lockedItem = $this->orderItems->lockById($orderItem->id);
            $order = $this->orders->lockById($lockedItem->order_id);

            if ($order->status !== OrderStatus::Open->value) {
                throw new ConflictHttpException('Order is not open for item cancellation.');
            }

            if (in_array($lockedItem->status, [OrderItemStatus::Delivered->value, OrderItemStatus::Canceled->value], true)) {
                throw new ConflictHttpException('Delivered or canceled items cannot be canceled.');
            }

            $product = $this->products->lockById($lockedItem->product_id);

            $this->orderItems->update($lockedItem, [
                'status' => OrderItemStatus::Canceled->value,
            ]);
            $this->products->incrementStock($product, (int) $lockedItem->quantity);

            return $this->recalculateOrderTotal->execute($order);
        });
    }
}
