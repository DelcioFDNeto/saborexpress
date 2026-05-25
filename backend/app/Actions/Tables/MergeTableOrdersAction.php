<?php

namespace App\Actions\Tables;

use App\Actions\Orders\RecalculateOrderTotalAction;
use App\Enums\OrderStatus;
use App\Enums\TableStatus;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Table;
use App\Repositories\Orders\OrderRepositoryInterface;
use App\Repositories\Payments\PaymentRepositoryInterface;
use App\Repositories\Tables\TableRepositoryInterface;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;

class MergeTableOrdersAction
{
    public function __construct(
        private readonly RecalculateOrderTotalAction $recalculateOrderTotal,
        private readonly TableRepositoryInterface $tables,
        private readonly OrderRepositoryInterface $orders,
        private readonly PaymentRepositoryInterface $payments,
    ) {}

    public function execute(Table $sourceTable, int $targetTableId): Order
    {
        return DB::transaction(function () use ($sourceTable, $targetTableId) {
            if ($sourceTable->id === $targetTableId) {
                throw new ConflictHttpException('Source and target tables must be different.');
            }

            $source = $this->tables->lockById($sourceTable->id);
            $target = $this->tables->lockById($targetTableId);

            $sourceOrder = $this->orders->findActiveForTableId($source->id, lock: true);
            $targetOrder = $this->orders->findActiveForTableId($target->id, lock: true);

            if (! $sourceOrder || ! $targetOrder) {
                throw new ConflictHttpException('Both tables must have active orders to be merged.');
            }

            if ($sourceOrder->status !== OrderStatus::Open->value || $targetOrder->status !== OrderStatus::Open->value) {
                throw new ConflictHttpException('Only open orders can be merged.');
            }

            if ($this->payments->hasPaidPayment($sourceOrder)) {
                throw new ConflictHttpException('Source order has paid payments and cannot be merged.');
            }

            OrderItem::where('order_id', $sourceOrder->id)
                ->lockForUpdate()
                ->update(['order_id' => $targetOrder->id]);

            $sourceOrder->update(['status' => OrderStatus::Canceled->value]);

            $this->tables->update($source, ['status' => TableStatus::Cleaning->value]);
            $this->tables->update($target, ['status' => TableStatus::Occupied->value]);

            return $this->recalculateOrderTotal->execute($targetOrder->fresh());
        });
    }
}
