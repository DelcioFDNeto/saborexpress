<?php

namespace App\Repositories\OrderItems;

use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class EloquentOrderItemRepository implements OrderItemRepositoryInterface
{
    public function paginateWithProduct(int $perPage = 15): LengthAwarePaginator
    {
        return OrderItem::with('product.category')->latest()->paginate($perPage);
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

    public function delete(OrderItem $orderItem): void
    {
        $orderItem->delete();
    }
}
