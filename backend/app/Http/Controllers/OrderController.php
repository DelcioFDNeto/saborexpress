<?php

namespace App\Http\Controllers;

use App\Actions\Orders\AddOrderItemAction;
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
    ) {
    }

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

        if (!$order) {
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

    public function update(UpdateOrderStatusRequest $request, Order $order)
    {
        if (in_array($order->status, [OrderStatus::Paid->value, OrderStatus::Canceled->value], true)) {
            throw new ConflictHttpException('Order status can no longer be changed.');
        }

        return new OrderResource(
            $this->orders->updateStatus($order, $request->validated('status'))
        );
    }

    public function destroy(Order $order)
    {
        abort(405, 'Orders are closed or canceled by dedicated operations.');
    }
}
