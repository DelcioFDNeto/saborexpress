<?php

namespace App\Http\Controllers;

use App\Actions\Orders\AddOrderItemAction;
use App\Actions\Orders\CancelOrderAction;
use App\Actions\Orders\RequestOrderClosingAction;
use App\Enums\OrderStatus;
use App\Http\Requests\Orders\AddOrderItemRequest;
use App\Http\Requests\Orders\UpdateOrderStatusRequest;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Models\Table;
use App\Repositories\Orders\OrderRepositoryInterface;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class OrderController extends Controller
{
    public function __construct(
        private readonly OrderRepositoryInterface $orders,
    ) {}

    public function index()
    {
        return OrderResource::collection($this->orders->paginateWithDetails());
    }

    public function store()
    {
        abort(405, 'Orders are opened through table operations.');
    }

    public function activeForTable(Table $table)
    {
        $order = $this->orders->findActiveForTable($table);

        if (! $order) {
            throw new NotFoundHttpException('Table does not have an active order.');
        }

        return new OrderResource($order);
    }

    public function addItem(
        AddOrderItemRequest $request,
        Order $order,
        AddOrderItemAction $addOrderItem,
    ) {
        $order = $addOrderItem->execute($order, $request->validated());

        return (new OrderResource($order))->response()->setStatusCode(201);
    }

    public function show(Order $order)
    {
        return new OrderResource($this->orders->loadDetails($order));
    }

    public function update(
        UpdateOrderStatusRequest $request,
        Order $order,
        RequestOrderClosingAction $requestOrderClosing,
        CancelOrderAction $cancelOrder,
    ) {
        $status = $request->validated('status');

        if ($status === OrderStatus::Closing->value) {
            return new OrderResource($requestOrderClosing->execute($order));
        }

        if ($status === OrderStatus::Canceled->value) {
            return new OrderResource($cancelOrder->execute($order));
        }

        throw new ConflictHttpException('Use dedicated operations to change this order status.');
    }

    public function requestClosing(Order $order, RequestOrderClosingAction $requestOrderClosing)
    {
        return new OrderResource($requestOrderClosing->execute($order));
    }

    public function cancel(Order $order, CancelOrderAction $cancelOrder)
    {
        return new OrderResource($cancelOrder->execute($order));
    }

    public function destroy(Order $order)
    {
        abort(405, 'Orders are closed or canceled by dedicated operations.');
    }
}
