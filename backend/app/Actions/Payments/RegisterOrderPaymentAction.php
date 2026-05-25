<?php

namespace App\Actions\Payments;

use App\Actions\Orders\RecalculateOrderTotalAction;
use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
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

    public function execute(Order $order, User $cashier, array $data): Payment
    {
        return DB::transaction(function () use ($order, $cashier, $data) {
            $lockedOrder = $this->orders->lockById($order->id);

            if ($lockedOrder->status === OrderStatus::Paid->value) {
                throw new ConflictHttpException('Order is already paid.');
            }

            if ($lockedOrder->status === OrderStatus::Canceled->value) {
                throw new ConflictHttpException('Canceled orders cannot be paid.');
            }

            if ($lockedOrder->status !== OrderStatus::Closing->value) {
                throw new ConflictHttpException('Order must be in closing before payment.');
            }

            $lockedOrder = $this->recalculateOrderTotal->execute($lockedOrder);

            if ($this->payments->hasPaidPayment($lockedOrder)) {
                throw new ConflictHttpException('Order already has a paid payment.');
            }

            $expectedAmount = number_format((float) $lockedOrder->total_amount, 2, '.', '');
            $receivedAmount = number_format((float) $data['amount'], 2, '.', '');

            if ($expectedAmount !== $receivedAmount) {
                throw new UnprocessableEntityHttpException('Payment amount must match the order total.');
            }

            $payment = $this->payments->create([
                'order_id' => $lockedOrder->id,
                'user_id' => $cashier->id,
                'method' => $data['method'],
                'status' => PaymentStatus::Paid->value,
                'amount' => $receivedAmount,
                'paid_at' => now(),
                'notes' => $data['notes'] ?? null,
            ]);

            $this->orders->updateStatus($lockedOrder, OrderStatus::Paid->value);

            return $this->payments->loadDetails($payment->fresh());
        });
    }
}
