<?php

namespace App\Repositories\Orders;

use App\Models\Order;
use App\Models\Table;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class EloquentOrderRepository implements OrderRepositoryInterface
{
    public function paginateWithDetails(int $perPage = 15): LengthAwarePaginator
    {
        return Order::with(['table', 'items.product.category', 'payments.user'])
            ->latest()
            ->paginate($perPage);
    }

    public function loadDetails(Order $order): Order
    {
        return $order->load(['table', 'items.product.category', 'payments.user']);
    }

    public function findActiveForTable(Table $table): ?Order
    {
        return Order::active()
            ->where('table_id', $table->id)
            ->with(['table', 'items.product.category', 'payments.user'])
            ->first();
    }

    public function findActiveForTableId(int $tableId, bool $lock = false): ?Order
    {
        $query = Order::active()->where('table_id', $tableId);

        if ($lock) {
            $query->lockForUpdate();
        }

        return $query->first();
    }

    public function create(array $data): Order
    {
        return Order::create($data);
    }

    public function updateStatus(Order $order, string $status): Order
    {
        $order->update(['status' => $status]);

        return $this->loadDetails($order->fresh());
    }

    public function lockById(int $id): Order
    {
        return Order::whereKey($id)->lockForUpdate()->firstOrFail();
    }

    public function recalculateTotal(Order $order): Order
    {
        $itemsTotal = $order->items()
            ->selectRaw('COALESCE(SUM(quantity * unit_price), 0) as total')
            ->value('total');

        $order->total_amount = max(
            0,
            (float) $itemsTotal + (float) $order->service_fee - (float) $order->discount
        );
        $order->save();

        return $order->fresh(['table', 'items.product.category', 'payments.user']);
    }
}
