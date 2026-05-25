<?php

namespace App\Actions\Tables;

use App\Enums\TableStatus;
use App\Models\Table;
use App\Repositories\Orders\OrderRepositoryInterface;
use App\Repositories\Tables\TableRepositoryInterface;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;

class ReleaseTableAction
{
    public function __construct(
        private readonly OrderRepositoryInterface $orders,
        private readonly TableRepositoryInterface $tables,
    ) {}

    public function execute(Table $table): Table
    {
        return DB::transaction(function () use ($table) {
            $lockedTable = $this->tables->lockById($table->id);
            $activeOrder = $this->orders->findActiveForTableId($lockedTable->id, lock: true);

            if ($activeOrder) {
                throw new ConflictHttpException('Table still has an active order.');
            }

            if ($lockedTable->status === TableStatus::Free->value) {
                return $lockedTable;
            }

            return $this->tables->update($lockedTable, ['status' => TableStatus::Free->value]);
        });
    }
}
