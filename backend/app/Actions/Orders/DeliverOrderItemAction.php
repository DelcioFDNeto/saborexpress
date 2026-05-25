<?php

namespace App\Actions\Orders;

use App\Enums\OrderItemStatus;
use App\Enums\OrderStatus;
use App\Models\OrderItem;
use App\Repositories\OrderItems\OrderItemRepositoryInterface;
use App\Repositories\Orders\OrderRepositoryInterface;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;

class DeliverOrderItemAction
{
    public function __construct(
        private readonly OrderItemRepositoryInterface $orderItems,
        private readonly OrderRepositoryInterface $orders,
    ) {}

    public function execute(OrderItem $orderItem): OrderItem
    {
        return DB::transaction(function () use ($orderItem) {
            $lockedItem = $this->orderItems->lockById($orderItem->id);
            $order = $this->orders->lockById($lockedItem->order_id);

            if ($order->status !== OrderStatus::Open->value) {
                throw new ConflictHttpException('Order is not open for item delivery.');
            }

            if ($lockedItem->status !== OrderItemStatus::Ready->value) {
                throw new ConflictHttpException('Only ready items can be delivered.');
            }

            $item = $this->orderItems->update($lockedItem, [
                'status' => OrderItemStatus::Delivered->value,
            ]);

            return $this->orderItems->loadProduct($item)->load('order.table');
        });
    }
}
