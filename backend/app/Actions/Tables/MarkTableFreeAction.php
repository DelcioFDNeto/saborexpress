<?php

namespace App\Actions\Tables;

use App\Enums\TableStatus;
use App\Models\Table;
use App\Repositories\Orders\OrderRepositoryInterface;
use App\Repositories\Tables\TableRepositoryInterface;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;

class MarkTableFreeAction
{
    public function __construct(
        private readonly TableRepositoryInterface $tables,
        private readonly OrderRepositoryInterface $orders,
    ) {}

    public function execute(Table $table): Table
    {
        return DB::transaction(function () use ($table) {
            $lockedTable = $this->tables->lockById($table->id);

            if ($this->orders->findActiveForTableId($lockedTable->id, lock: true)) {
                throw new ConflictHttpException('Table still has an active order.');
            }

            if ($lockedTable->status !== TableStatus::Cleaning->value) {
                throw new ConflictHttpException('Only tables in cleaning can be marked as free.');
            }

            return $this->tables->update($lockedTable, ['status' => TableStatus::Free->value]);
        });
    }
}
