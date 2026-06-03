<?php

namespace App\Actions\Kitchen;

use App\Enums\OrderItemStatus;
use App\Enums\OrderStatus;
use App\Models\OrderItem;
use App\Repositories\OrderItems\OrderItemRepositoryInterface;
use App\Repositories\Orders\OrderRepositoryInterface;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;

class StartOrderItemPreparationAction
{
    public function __construct(
        private readonly OrderItemRepositoryInterface $orderItems,
        private readonly OrderRepositoryInterface $orders,
    ) {}

    public function execute(OrderItem $orderItem): OrderItem
    {
        $result = DB::transaction(function () use ($orderItem) {
            $lockedItem = $this->orderItems->lockById($orderItem->id);
            $order = $this->orders->lockById($lockedItem->order_id);

            if ($order->status !== OrderStatus::Open->value && $order->status !== OrderStatus::Paid->value) {
                throw new ConflictHttpException('Order is not open for kitchen updates.');
            }

            if ($lockedItem->status !== OrderItemStatus::Pending->value) {
                throw new ConflictHttpException('Only pending items can start preparation.');
            }

            $item = $this->orderItems->update($lockedItem, [
                'status' => OrderItemStatus::Preparing->value,
            ]);

            return $this->orderItems->loadProduct($item)->load('order.table');
        });
        
        event(new \App\Events\OrderUpdated());
        
        return $result;
    }
}
