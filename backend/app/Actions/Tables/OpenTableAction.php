<?php

namespace App\Actions\Tables;

use App\Enums\OrderStatus;
use App\Enums\OrderType;
use App\Enums\TableStatus;
use App\Models\Order;
use App\Models\Table;
use App\Models\User;
use App\Repositories\Orders\OrderRepositoryInterface;
use App\Repositories\Tables\TableRepositoryInterface;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

class OpenTableAction
{
    public function __construct(
        private readonly TableRepositoryInterface $tables,
        private readonly OrderRepositoryInterface $orders,
    ) {}

    public function execute(Table $table, User $user, array $data): Order
    {
        return DB::transaction(function () use ($table, $user, $data) {
            $lockedTable = $this->tables->lockById($table->id);

            if (! in_array($lockedTable->status, [TableStatus::Free->value, TableStatus::Reserved->value], true)) {
                throw new UnprocessableEntityHttpException('Table is not available for opening.');
            }

            if ($this->orders->findActiveForTableId($lockedTable->id, lock: true)) {
                throw new ConflictHttpException('Table already has an active order.');
            }

            $lockedTable = $this->tables->update($lockedTable, [
                'status' => TableStatus::Occupied->value,
                'reservation_name' => null,
                'reservation_phone' => null,
                'reserved_at' => null,
            ]);

            $order = $this->orders->create([
                'table_id' => $lockedTable->id,
                'user_id' => $user->id,
                'customer_name' => $data['customer_name'] ?? null,
                'customer_phone' => $data['customer_phone'] ?? null,
                'status' => OrderStatus::Open->value,
                'type' => OrderType::Table->value,
                'total_amount' => 0,
            ]);

            return $this->orders->loadDetails($order);
        });
    }
}
