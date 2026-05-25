<?php

namespace App\Http\Controllers;

use App\Actions\Audit\RecordAuditEventAction;
use App\Actions\Orders\AddOrderItemAction;
use App\Actions\Orders\CancelOrderAction;
use App\Actions\Orders\RequestOrderClosingAction;
use App\Enums\AuditEventType;
use App\Enums\OrderStatus;
use App\Http\Requests\Orders\AddOrderItemRequest;
use App\Http\Requests\Orders\UpdateOrderStatusRequest;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Models\Table;
use App\Repositories\Orders\OrderRepositoryInterface;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class OrderController extends Controller
{
    public function __construct(
        private readonly OrderRepositoryInterface $orders,
        private readonly RecordAuditEventAction $recordAuditEvent,
    ) {}

    public function index()
    {
        return OrderResource::collection($this->orders->paginateWithDetails());
    }

    public function store()
    {
        abort(405, 'Orders are opened through table operations.');
    }

    public function storeDelivery(Request $request, AddOrderItemAction $addOrderItem)
    {
        $validated = $request->validate([
            'customer_name' => ['required', 'string', 'max:255'],
            'customer_phone' => ['required', 'string', 'max:30'],
            'delivery_address' => ['required', 'string', 'max:500'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'exists:products,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'items.*.notes' => ['nullable', 'string'],
        ]);

        $order = DB::transaction(function () use ($validated, $addOrderItem) {
            $order = $this->orders->create([
                'type' => 'Delivery',
                'status' => OrderStatus::Open->value,
                'delivery_status' => 'Aguardando',
                'customer_name' => $validated['customer_name'],
                'customer_phone' => $validated['customer_phone'],
                'delivery_address' => $validated['delivery_address'],
            ]);

            foreach ($validated['items'] as $itemData) {
                $order = $addOrderItem->execute($order, [
                    'product_id' => $itemData['product_id'],
                    'quantity' => $itemData['quantity'],
                    'notes' => $itemData['notes'] ?? null,
                ]);
            }

            return $order;
        });

        return (new OrderResource($this->orders->loadDetails($order)))->response()->setStatusCode(201);
    }

    public function storeTakeout(Request $request, AddOrderItemAction $addOrderItem)
    {
        $validated = $request->validate([
            'customer_name' => ['required', 'string', 'max:255'],
            'customer_phone' => ['required', 'string', 'max:30'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'exists:products,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'items.*.notes' => ['nullable', 'string'],
        ]);

        $order = DB::transaction(function () use ($validated, $addOrderItem) {
            $order = $this->orders->create([
                'type' => 'Takeout',
                'status' => OrderStatus::Open->value,
                'delivery_status' => 'Aguardando Retirada',
                'customer_name' => $validated['customer_name'],
                'customer_phone' => $validated['customer_phone'],
                'delivery_address' => 'Retirada no Estabelecimento',
            ]);

            foreach ($validated['items'] as $itemData) {
                $order = $addOrderItem->execute($order, [
                    'product_id' => $itemData['product_id'],
                    'quantity' => $itemData['quantity'],
                    'notes' => $itemData['notes'] ?? null,
                ]);
            }

            return $order;
        });

        return (new OrderResource($this->orders->loadDetails($order)))->response()->setStatusCode(201);
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
        $this->recordAuditEvent->execute($request->user(), AuditEventType::OrderItemAdded, $order, [
            'product_id' => $request->validated('product_id'),
            'quantity' => $request->validated('quantity'),
        ]);

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
            $order = $requestOrderClosing->execute($order);
            $this->recordAuditEvent->execute($request->user(), AuditEventType::OrderClosingRequested, $order);

            return new OrderResource($order);
        }

        if ($status === OrderStatus::Canceled->value) {
            $order = $cancelOrder->execute($order);
            $this->recordAuditEvent->execute($request->user(), AuditEventType::OrderCanceled, $order);

            return new OrderResource($order);
        }

        throw new ConflictHttpException('Use dedicated operations to change this order status.');
    }

    public function updateDeliveryStatus(Request $request, Order $order)
    {
        $validated = $request->validate([
            'delivery_status' => ['required', 'in:Aguardando,Em Rota,Entregue'],
        ]);

        if ($order->type !== 'Delivery') {
            abort(400, 'This order is not a delivery order.');
        }

        $order->delivery_status = $validated['delivery_status'];
        $order->save();

        // Broadcast Reverb Update!
        event(new \App\Events\OrderUpdated());

        return new OrderResource($this->orders->loadDetails($order));
    }

    public function assignDriver(Request $request, Order $order)
    {
        if ($order->type !== 'Delivery') {
            abort(400, 'This order is not a delivery order.');
        }

        $user = $request->user();
        if ($user->role !== 'delivery' && $user->role !== 'administrator') {
            abort(403, 'Only delivery drivers and administrators can assign drivers.');
        }

        $driverId = $user->role === 'administrator' && $request->has('driver_id')
            ? $request->input('driver_id')
            : $user->id;

        $driver = \App\Models\User::findOrFail($driverId);
        if ($driver->role !== 'delivery' && $driver->role !== 'administrator') {
            abort(422, 'The assigned user must be a delivery driver.');
        }

        $order->delivery_driver_id = $driver->id;
        $order->save();

        // Broadcast Reverb Update!
        event(new \App\Events\OrderUpdated());

        return new OrderResource($this->orders->loadDetails($order));
    }

    public function requestClosing(Request $request, Order $order, RequestOrderClosingAction $requestOrderClosing)
    {
        $order = $requestOrderClosing->execute($order);
        $this->recordAuditEvent->execute($request->user(), AuditEventType::OrderClosingRequested, $order);

        return new OrderResource($order);
    }

    public function cancel(Request $request, Order $order, CancelOrderAction $cancelOrder)
    {
        $order = $cancelOrder->execute($order);
        $this->recordAuditEvent->execute($request->user(), AuditEventType::OrderCanceled, $order);

        return new OrderResource($order);
    }

    public function destroy(Order $order)
    {
        abort(405, 'Orders are closed or canceled by dedicated operations.');
    }
}
