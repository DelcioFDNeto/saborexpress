<?php

namespace App\Http\Controllers;

use App\Actions\Audit\RecordAuditEventAction;
use App\Actions\Orders\CancelOrderItemAction;
use App\Actions\Orders\DeliverOrderItemAction;
use App\Actions\Orders\RemoveOrderItemAction;
use App\Actions\Orders\UpdateOrderItemAction;
use App\Enums\AuditEventType;
use App\Http\Requests\Orders\UpdateOrderItemRequest;
use App\Http\Resources\OrderItemResource;
use App\Http\Resources\OrderResource;
use App\Models\OrderItem;
use App\Repositories\OrderItems\OrderItemRepositoryInterface;
use Illuminate\Http\Request;

class OrderItemController extends Controller
{
    public function __construct(
        private readonly OrderItemRepositoryInterface $orderItems,
        private readonly RecordAuditEventAction $recordAuditEvent,
    ) {}

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
        $this->recordAuditEvent->execute($request->user(), AuditEventType::OrderItemUpdated, $orderItem, $request->validated());

        return new OrderResource($order);
    }

    public function destroy(Request $request, OrderItem $orderItem, RemoveOrderItemAction $removeOrderItem)
    {
        $order = $removeOrderItem->execute($orderItem);
        $this->recordAuditEvent->execute($request->user(), AuditEventType::OrderItemRemoved, $orderItem, [
            'order_id' => $order->id,
        ]);

        return new OrderResource($order);
    }

    public function deliver(Request $request, OrderItem $orderItem, DeliverOrderItemAction $deliverOrderItem)
    {
        $orderItem = $deliverOrderItem->execute($orderItem);
        $this->recordAuditEvent->execute($request->user(), AuditEventType::OrderItemDelivered, $orderItem, [
            'order_id' => $orderItem->order_id,
        ]);

        return new OrderItemResource($orderItem);
    }

    public function cancel(Request $request, OrderItem $orderItem, CancelOrderItemAction $cancelOrderItem)
    {
        $order = $cancelOrderItem->execute($orderItem);
        $this->recordAuditEvent->execute($request->user(), AuditEventType::OrderItemCanceled, $orderItem, [
            'order_id' => $order->id,
        ]);

        return new OrderResource($order);
    }
}
