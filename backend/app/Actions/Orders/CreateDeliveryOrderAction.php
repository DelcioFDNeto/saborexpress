<?php

namespace App\Actions\Orders;

use App\Actions\Orders\AddOrderItemAction;
use App\Enums\OrderStatus;
use App\Models\Order;
use App\Repositories\Orders\OrderRepositoryInterface;
use App\Repositories\Payments\PaymentRepositoryInterface;
use App\Repositories\CashMovements\CashMovementRepositoryInterface;
use Illuminate\Support\Facades\DB;

class CreateDeliveryOrderAction
{
    public function __construct(
        private readonly OrderRepositoryInterface $orders,
        private readonly PaymentRepositoryInterface $payments,
        private readonly CashMovementRepositoryInterface $cashMovements,
        private readonly AddOrderItemAction $addOrderItem,
    ) {}

    /**
     * Create a Delivery Order transactionally.
     *
     * @param array $validated
     * @param int $userId
     * @return Order
     */
    public function execute(array $validated, int $userId): Order
    {
        return DB::transaction(function () use ($validated, $userId) {
            $order = $this->orders->create([
                'type' => 'Delivery',
                'status' => OrderStatus::Open->value,
                'delivery_status' => 'Aguardando',
                'customer_name' => $validated['customer_name'],
                'customer_phone' => $validated['customer_phone'],
                'delivery_address' => $validated['delivery_address'],
                'street' => $validated['street'] ?? null,
                'number' => $validated['number'] ?? null,
                'neighborhood' => $validated['neighborhood'] ?? null,
                'cep' => $validated['cep'] ?? null,
                'reference' => $validated['reference'] ?? null,
                'user_id' => $userId,
            ]);

            foreach ($validated['items'] as $itemData) {
                $order = $this->addOrderItem->execute($order, [
                    'product_id' => $itemData['product_id'],
                    'quantity' => $itemData['quantity'],
                    'notes' => $itemData['notes'] ?? null,
                ]);
            }

            // Register online payment if chosen
            if ($validated['payment_type'] === 'online') {
                $this->payments->create([
                    'order_id' => $order->id,
                    'user_id' => $userId,
                    'amount' => $order->total_amount,
                    'method' => $validated['payment_method'],
                    'status' => 'Paga',
                    'paid_at' => now(),
                ]);

                $this->cashMovements->create([
                    'user_id' => $userId,
                    'type' => 'Sale',
                    'amount' => $order->total_amount,
                    'method' => $validated['payment_method'],
                    'order_id' => $order->id,
                    'description' => 'Pagamento Online de Pedido Delivery #' . $order->id,
                ]);

                $order->status = OrderStatus::Paid->value;
                $order->save();
            }

            return $order;
        });
    }
}
