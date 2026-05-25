<?php

namespace App\Actions\Orders;

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\OrderItem;
use App\Repositories\OrderItems\OrderItemRepositoryInterface;
use App\Repositories\Orders\OrderRepositoryInterface;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;

class RemoveOrderItemAction
{
    public function __construct(
        private readonly RecalculateOrderTotalAction $recalculateOrderTotal,
        private readonly OrderRepositoryInterface $orders,
        private readonly OrderItemRepositoryInterface $orderItems,
    ) {
    }

    public function execute(OrderItem $orderItem): Order
    {
        return DB::transaction(function () use ($orderItem) {
            $lockedItem = $this->orderItems->lockById($orderItem->id);

            $order = $this->orders->lockById($lockedItem->order_id);

            if (!in_array($order->status, OrderStatus::activeValues(), true)) {
                throw new ConflictHttpException('Order is not open for item changes.');
            }

            $this->orderItems->delete($lockedItem);

            return $this->recalculateOrderTotal->execute($order);
        });
    }
}
