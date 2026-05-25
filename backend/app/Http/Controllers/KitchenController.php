<?php

namespace App\Http\Controllers;

use App\Actions\Audit\RecordAuditEventAction;
use App\Actions\Kitchen\MarkOrderItemReadyAction;
use App\Actions\Kitchen\StartOrderItemPreparationAction;
use App\Actions\Orders\CancelOrderItemAction;
use App\Actions\Orders\DeliverOrderItemAction;
use App\Enums\AuditEventType;
use App\Http\Requests\Kitchen\ListKitchenOrderItemsRequest;
use App\Http\Requests\Kitchen\ListKitchenOrdersRequest;
use App\Http\Resources\OrderItemResource;
use App\Http\Resources\OrderResource;
use App\Models\OrderItem;
use App\Repositories\OrderItems\OrderItemRepositoryInterface;
use Illuminate\Http\Request;

class KitchenController extends Controller
{
    public function __construct(
        private readonly OrderItemRepositoryInterface $orderItems,
        private readonly RecordAuditEventAction $recordAuditEvent,
    ) {}

    public function orderItems(ListKitchenOrderItemsRequest $request)
    {
        $validated = $request->validated();
        $perPage = (int) ($validated['per_page'] ?? 15);

        return OrderItemResource::collection(
            $this->orderItems->paginateForKitchen($validated, $perPage)
        );
    }

    public function orders(ListKitchenOrdersRequest $request)
    {
        $validated = $request->validated();
        $perPage = (int) ($validated['per_page'] ?? 15);

        return OrderResource::collection(
            $this->orderItems->paginateGroupedOrdersForKitchen($validated, $perPage)
        );
    }

    public function startOrderItem(Request $request, OrderItem $orderItem, StartOrderItemPreparationAction $startOrderItemPreparation)
    {
        $orderItem = $startOrderItemPreparation->execute($orderItem);
        $this->recordAuditEvent->execute($request->user(), AuditEventType::KitchenItemStarted, $orderItem, [
            'order_id' => $orderItem->order_id,
        ]);

        return new OrderItemResource($orderItem);
    }

    public function markOrderItemReady(Request $request, OrderItem $orderItem, MarkOrderItemReadyAction $markOrderItemReady)
    {
        $orderItem = $markOrderItemReady->execute($orderItem);
        $this->recordAuditEvent->execute($request->user(), AuditEventType::KitchenItemReady, $orderItem, [
            'order_id' => $orderItem->order_id,
        ]);

        return new OrderItemResource($orderItem);
    }

    public function deliverOrderItem(Request $request, OrderItem $orderItem, DeliverOrderItemAction $deliverOrderItem)
    {
        $orderItem = $deliverOrderItem->execute($orderItem);
        $this->recordAuditEvent->execute($request->user(), AuditEventType::OrderItemDelivered, $orderItem, [
            'order_id' => $orderItem->order_id,
        ]);

        return new OrderItemResource($orderItem);
    }

    public function cancelOrderItem(Request $request, OrderItem $orderItem, CancelOrderItemAction $cancelOrderItem)
    {
        $order = $cancelOrderItem->execute($orderItem);
        $this->recordAuditEvent->execute($request->user(), AuditEventType::OrderItemCanceled, $orderItem, [
            'order_id' => $order->id,
        ]);

        return new OrderResource($order);
    }
}
