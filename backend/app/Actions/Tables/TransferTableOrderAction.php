<?php

namespace App\Actions\Tables;

use App\Enums\TableStatus;
use App\Models\Order;
use App\Models\Table;
use App\Repositories\Orders\OrderRepositoryInterface;
use App\Repositories\Tables\TableRepositoryInterface;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;

class TransferTableOrderAction
{
    public function __construct(
        private readonly TableRepositoryInterface $tables,
        private readonly OrderRepositoryInterface $orders,
    ) {}

    public function execute(Table $sourceTable, int $targetTableId): Order
    {
        return DB::transaction(function () use ($sourceTable, $targetTableId) {
            if ($sourceTable->id === $targetTableId) {
                throw new ConflictHttpException('Source and target tables must be different.');
            }

            $source = $this->tables->lockById($sourceTable->id);
            $target = $this->tables->lockById($targetTableId);

            $order = $this->orders->findActiveForTableId($source->id, lock: true);

            if (! $order) {
                throw new ConflictHttpException('Source table does not have an active order.');
            }

            if ($this->orders->findActiveForTableId($target->id, lock: true)) {
                throw new ConflictHttpException('Target table already has an active order.');
            }

            if (! in_array($target->status, [TableStatus::Free->value, TableStatus::Reserved->value], true)) {
                throw new ConflictHttpException('Target table is not available.');
            }

            $order->update(['table_id' => $target->id]);

            $this->tables->update($source, ['status' => TableStatus::Cleaning->value]);
            $this->tables->update($target, ['status' => TableStatus::Occupied->value]);

            return $this->orders->loadDetails($order->fresh());
        });
    }
}
