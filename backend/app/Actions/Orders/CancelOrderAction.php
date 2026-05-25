<?php

namespace App\Actions\Orders;

use App\Enums\OrderStatus;
use App\Enums\TableStatus;
use App\Models\Order;
use App\Repositories\Orders\OrderRepositoryInterface;
use App\Repositories\Payments\PaymentRepositoryInterface;
use App\Repositories\Tables\TableRepositoryInterface;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;

class CancelOrderAction
{
    public function __construct(
        private readonly OrderRepositoryInterface $orders,
        private readonly PaymentRepositoryInterface $payments,
        private readonly TableRepositoryInterface $tables,
    ) {}

    public function execute(Order $order): Order
    {
        return DB::transaction(function () use ($order) {
            $lockedOrder = $this->orders->lockById($order->id);

            if ($lockedOrder->status === OrderStatus::Paid->value) {
                throw new ConflictHttpException('Paid orders cannot be canceled.');
            }

            if ($lockedOrder->status === OrderStatus::Canceled->value) {
                return $this->orders->loadDetails($lockedOrder);
            }

            if ($this->payments->hasPaidPayment($lockedOrder)) {
                throw new ConflictHttpException('Order has paid payments and cannot be canceled.');
            }

            $lockedOrder = $this->orders->updateStatus($lockedOrder, OrderStatus::Canceled->value);

            if ($lockedOrder->table_id) {
                $table = $this->tables->lockById($lockedOrder->table_id);
                $this->tables->update($table, ['status' => TableStatus::Closing->value]);
            }

            return $this->orders->loadDetails($lockedOrder->fresh());
        });
    }
}
