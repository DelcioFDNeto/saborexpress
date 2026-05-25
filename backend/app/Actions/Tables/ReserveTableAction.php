<?php

namespace App\Actions\Tables;

use App\Enums\TableStatus;
use App\Models\Table;
use App\Repositories\Orders\OrderRepositoryInterface;
use App\Repositories\Tables\TableRepositoryInterface;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;

class ReserveTableAction
{
    public function __construct(
        private readonly TableRepositoryInterface $tables,
        private readonly OrderRepositoryInterface $orders,
    ) {}

    public function execute(Table $table, array $data = []): Table
    {
        return DB::transaction(function () use ($table, $data) {
            $lockedTable = $this->tables->lockById($table->id);

            if ($this->orders->findActiveForTableId($lockedTable->id, lock: true)) {
                throw new ConflictHttpException('Table has an active order and cannot be reserved.');
            }

            if ($lockedTable->status !== TableStatus::Free->value) {
                throw new ConflictHttpException('Only free tables can be reserved.');
            }

            return $this->tables->update($lockedTable, array_merge($data, [
                'status' => TableStatus::Reserved->value,
            ]));
        });
    }
}
