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
use App\Models\Product;
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
    ) {}

    public function index()
    {
        return OrderResource::collection($this->orders->paginateWithDetails());
    }

    public function store()
    {
        abort(405, 'Orders are opened through table operations.');
    }

    /**
     * Portal simplificado (Delivery) - Store order from external cart.
     */
    public function storeDelivery(Request $request)
    {
        $validated = $request->validate([
            'customer_name' => 'required|string|max:255',
            'customer_phone' => 'required|string|max:30',
            'delivery_address' => 'required|string|max:500',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.notes' => 'nullable|string',
        ]);

        $order = DB::transaction(function () use ($validated) {
            $order = $this->orders->create([
                'type' => 'Delivery',
                'status' => OrderStatus::Open->value,
                'delivery_status' => 'Aguardando',
                'customer_name' => $validated['customer_name'],
                'customer_phone' => $validated['customer_phone'],
                'delivery_address' => $validated['delivery_address'],
                'user_id' => 1,
            ]);

            $totalAmount = 0;

            foreach ($validated['items'] as $itemData) {
                $product = Product::findOrFail($itemData['product_id']);

                $order->items()->create([
                    'product_id' => $product->id,
                    'quantity' => $itemData['quantity'],
                    'unit_price' => $product->price,
                    'notes' => $itemData['notes'] ?? null,
                    'status' => 'Pendente',
                ]);

                $totalAmount += ($product->price * $itemData['quantity']);
            }

            $order->total_amount = $totalAmount;
            $order->save();

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

