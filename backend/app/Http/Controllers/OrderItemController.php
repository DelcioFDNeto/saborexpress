<?php

namespace App\Http\Controllers;

use App\Actions\Orders\RemoveOrderItemAction;
use App\Actions\Orders\UpdateOrderItemAction;
use App\Http\Requests\Orders\UpdateOrderItemRequest;
use App\Http\Resources\OrderItemResource;
use App\Http\Resources\OrderResource;
use App\Models\OrderItem;
use App\Repositories\OrderItems\OrderItemRepositoryInterface;

class OrderItemController extends Controller
{
    public function __construct(
        private readonly OrderItemRepositoryInterface $orderItems,
    ) {
    }

    public function index()
    {
        return OrderItemResource::collection($this->orderItems->paginateWithProduct());
    }

    public function store()
    {
        abort(405, 'Order items are created through orders.');
    }

    public function show(OrderItem $orderItem)
    {
        return new OrderItemResource($this->orderItems->loadProduct($orderItem));
    }

    public function update(
        UpdateOrderItemRequest $request,
        OrderItem $orderItem,
        UpdateOrderItemAction $updateOrderItem,
    ) {
        $order = $updateOrderItem->execute($orderItem, $request->validated());

        return new OrderResource($order);
    }

    public function destroy(OrderItem $orderItem, RemoveOrderItemAction $removeOrderItem)
    {
        $order = $removeOrderItem->execute($orderItem);

        return new OrderResource($order);
    }
}
