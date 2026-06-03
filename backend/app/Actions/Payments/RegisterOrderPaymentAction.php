<?php

namespace App\Actions\Payments;

use App\Actions\Orders\RecalculateOrderTotalAction;
use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Models\CashMovement;
use App\Models\Order;
use App\Models\Payment;
use App\Models\User;
use App\Repositories\Orders\OrderRepositoryInterface;
use App\Repositories\Payments\PaymentRepositoryInterface;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

class RegisterOrderPaymentAction
{
    public function __construct(
        private readonly RecalculateOrderTotalAction $recalculateOrderTotal,
        private readonly OrderRepositoryInterface $orders,
        private readonly PaymentRepositoryInterface $payments,
    ) {}

    /**
     * Register a payment for an order, creating the corresponding CashMovement
     * and releasing the table when the order is fully paid.
     *
     * Supports both full and partial (split) payments.
     *
     * @param bool $recalculate Whether to recalculate order total from items before payment.
     *                          Set to false for split-payment flows where total is already known.
     */
    public function execute(Order $order, User $cashier, array $data, bool $recalculate = true): Payment
    {
        return DB::transaction(function () use ($order, $cashier, $data, $recalculate) {
            $lockedOrder = $this->orders->lockById($order->id);

            if ($lockedOrder->status === OrderStatus::Paid->value) {
                throw new ConflictHttpException('Este pedido já foi pago.');
            }

            if ($lockedOrder->status === OrderStatus::Canceled->value) {
                throw new ConflictHttpException('Pedidos cancelados não podem ser pagos.');
            }

            if ($recalculate) {
                $lockedOrder = $this->recalculateOrderTotal->execute($lockedOrder);
            }

            $receivedAmount = number_format((float) $data['amount'], 2, '.', '');

            // Create the payment record
            $payment = $this->payments->create([
                'order_id' => $lockedOrder->id,
                'user_id' => $cashier->id,
                'method' => $data['method'],
                'status' => PaymentStatus::Paid->value,
                'amount' => $receivedAmount,
                'installments' => $data['installments'] ?? 1,
                'paid_at' => now(),
                'notes' => $data['notes'] ?? null,
            ]);

            // Create corresponding CashMovement for financial tracking
            CashMovement::create([
                'user_id' => $cashier->id,
                'type' => 'Sale',
                'amount' => $receivedAmount,
                'method' => $data['method'],
                'order_id' => $lockedOrder->id,
                'description' => 'Pagamento de Comanda #' . $lockedOrder->id,
            ]);

            // Check if the order is now fully paid (supports split payments)
            $subtotal = (float) $lockedOrder->total_amount;
            $serviceFee = (float) $lockedOrder->service_fee;
            $discount = (float) $lockedOrder->discount;
            $total = $subtotal + $serviceFee - $discount;
            $paid = (float) $this->payments->paidTotalForOrder($lockedOrder);

            if ($paid >= $total - 0.01) {
                $this->orders->updateStatus($lockedOrder, OrderStatus::Paid->value);

                // Release the table when the order is fully paid
                if ($lockedOrder->table_id) {
                    $lockedOrder->table()->update(['status' => 'Livre']);
                }
            }

            return $this->payments->loadDetails($payment->fresh());
        });
    }
}
