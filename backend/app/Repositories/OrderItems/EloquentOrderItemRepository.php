<?php

namespace App\Repositories\OrderItems;

use App\Enums\OrderItemStatus;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class EloquentOrderItemRepository implements OrderItemRepositoryInterface
{
    public function paginateWithProduct(int $perPage = 15): LengthAwarePaginator
    {
        return OrderItem::with('product.category')->latest()->paginate($perPage);
    }

    public function paginateForKitchen(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $statuses = $filters['status'] ?? OrderItemStatus::kitchenQueueValues();
        $statuses = is_array($statuses) ? $statuses : [$statuses];

        return OrderItem::query()
            ->with(['product.category', 'order.table'])
            ->whereIn('status', $statuses)
            ->when(isset($filters['order_id']), fn ($query) => $query->where('order_id', $filters['order_id']))
            ->latest()
            ->paginate($perPage);
    }

    public function loadProduct(OrderItem $orderItem): OrderItem
    {
        return $orderItem->load('product.category');
    }

    public function createForOrder(Order $order, array $data): OrderItem
    {
        return $order->items()->create($data);
    }

    public function lockById(int $id): OrderItem
    {
        return OrderItem::whereKey($id)->lockForUpdate()->firstOrFail();
    }

    public function update(OrderItem $orderItem, array $data): OrderItem
    {
        $orderItem->update($data);

        return $orderItem->fresh();
    }

    public function hasStatusesForOrder(Order $order, array $statuses): bool
    {
        return $order->items()
            ->whereIn('status', $statuses)
            ->exists();
    }

    public function delete(OrderItem $orderItem): void
    {
        $orderItem->delete();
    }
}
