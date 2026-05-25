<?php

namespace App\Actions\Orders;

use App\Enums\OrderItemStatus;
use App\Enums\OrderStatus;
use App\Enums\TableStatus;
use App\Models\Order;
use App\Repositories\OrderItems\OrderItemRepositoryInterface;
use App\Repositories\Orders\OrderRepositoryInterface;
use App\Repositories\Tables\TableRepositoryInterface;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;

class RequestOrderClosingAction
{
    public function __construct(
        private readonly RecalculateOrderTotalAction $recalculateOrderTotal,
        private readonly OrderRepositoryInterface $orders,
        private readonly OrderItemRepositoryInterface $orderItems,
        private readonly TableRepositoryInterface $tables,
    ) {}

    public function execute(Order $order): Order
    {
        return DB::transaction(function () use ($order) {
            $lockedOrder = $this->orders->lockById($order->id);

            if (in_array($lockedOrder->status, OrderStatus::terminalValues(), true)) {
                throw new ConflictHttpException('Order is already closed.');
            }

            $lockedOrder = $this->recalculateOrderTotal->execute($lockedOrder);

            if ($this->orderItems->hasStatusesForOrder($lockedOrder, OrderItemStatus::unfinishedKitchenValues())) {
                throw new ConflictHttpException('Order has kitchen items pending or in preparation.');
            }

            if ($lockedOrder->status === OrderStatus::Open->value) {
                $lockedOrder = $this->orders->updateStatus($lockedOrder, OrderStatus::Closing->value);
            }

            if ($lockedOrder->table_id) {
                $table = $this->tables->lockById($lockedOrder->table_id);
                $this->tables->update($table, ['status' => TableStatus::Closing->value]);
            }

            return $this->orders->loadDetails($lockedOrder->fresh());
        });
    }
}
