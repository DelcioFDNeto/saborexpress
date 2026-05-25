<?php

namespace App\Http\Controllers;

use App\Actions\Kitchen\MarkOrderItemReadyAction;
use App\Actions\Kitchen\StartOrderItemPreparationAction;
use App\Http\Requests\Kitchen\ListKitchenOrderItemsRequest;
use App\Http\Resources\OrderItemResource;
use App\Models\OrderItem;
use App\Repositories\OrderItems\OrderItemRepositoryInterface;

class KitchenController extends Controller
{
    public function __construct(
        private readonly OrderItemRepositoryInterface $orderItems,
    ) {}

    public function orderItems(ListKitchenOrderItemsRequest $request)
    {
        $validated = $request->validated();
        $perPage = (int) ($validated['per_page'] ?? 15);

        return OrderItemResource::collection(
            $this->orderItems->paginateForKitchen($validated, $perPage)
        );
    }

    public function startOrderItem(OrderItem $orderItem, StartOrderItemPreparationAction $startOrderItemPreparation)
    {
        return new OrderItemResource($startOrderItemPreparation->execute($orderItem));
    }

    public function markOrderItemReady(OrderItem $orderItem, MarkOrderItemReadyAction $markOrderItemReady)
    {
        return new OrderItemResource($markOrderItemReady->execute($orderItem));
    }
}
