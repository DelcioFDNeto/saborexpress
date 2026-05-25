<?php

namespace App\Repositories\OrderItems;

use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface OrderItemRepositoryInterface
{
    public function paginateWithProduct(int $perPage = 15): LengthAwarePaginator;

    public function loadProduct(OrderItem $orderItem): OrderItem;

    public function createForOrder(Order $order, array $data): OrderItem;

    public function lockById(int $id): OrderItem;

    public function update(OrderItem $orderItem, array $data): OrderItem;

    public function delete(OrderItem $orderItem): void;
}
