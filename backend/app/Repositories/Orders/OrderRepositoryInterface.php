<?php

namespace App\Repositories\Orders;

use App\Models\Order;
use App\Models\Table;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface OrderRepositoryInterface
{
    public function paginateWithDetails(int $perPage = 15): LengthAwarePaginator;

    public function loadDetails(Order $order): Order;

    public function findActiveForTable(Table $table): ?Order;

    public function findActiveForTableId(int $tableId, bool $lock = false): ?Order;

    public function create(array $data): Order;

    public function updateStatus(Order $order, string $status): Order;

    public function lockById(int $id): Order;

    public function recalculateTotal(Order $order): Order;
}
