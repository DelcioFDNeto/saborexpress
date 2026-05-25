<?php

namespace App\Actions\Tables;

use App\Enums\TableStatus;
use App\Models\Table;
use App\Repositories\Tables\TableRepositoryInterface;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;

class CancelTableReservationAction
{
    public function __construct(
        private readonly TableRepositoryInterface $tables,
    ) {}

    public function execute(Table $table): Table
    {
        return DB::transaction(function () use ($table) {
            $lockedTable = $this->tables->lockById($table->id);

            if ($lockedTable->status !== TableStatus::Reserved->value) {
                throw new ConflictHttpException('Only reserved tables can have reservation canceled.');
            }

            return $this->tables->update($lockedTable, [
                'status' => TableStatus::Free->value,
                'reservation_name' => null,
                'reservation_phone' => null,
                'reserved_at' => null,
            ]);
        });
    }
}
