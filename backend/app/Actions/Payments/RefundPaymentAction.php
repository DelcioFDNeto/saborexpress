<?php

namespace App\Actions\Payments;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Enums\AuditEventType;
use App\Models\Payment;
use App\Models\User;
use App\Repositories\CashMovements\CashMovementRepositoryInterface;
use App\Repositories\Orders\OrderRepositoryInterface;
use App\Actions\Audit\RecordAuditEventAction;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

class RefundPaymentAction
{
    public function __construct(
        private readonly OrderRepositoryInterface $orders,
        private readonly CashMovementRepositoryInterface $cashMovements,
        private readonly RecordAuditEventAction $recordAuditEvent,
    ) {}

    /**
     * Refund a payment transactionally.
     *
     * @param Payment $payment
     * @param User $user
     * @return Payment
     */
    public function execute(Payment $payment, User $user): Payment
    {
        if ($payment->status === PaymentStatus::Refunded->value) {
            throw new UnprocessableEntityHttpException('Pagamento já foi estornado.');
        }

        return DB::transaction(function () use ($payment, $user) {
            $payment->update(['status' => PaymentStatus::Refunded->value]);

            $this->cashMovements->create([
                'user_id' => $user->id,
                'type' => 'Refund',
                'amount' => $payment->amount,
                'method' => $payment->method,
                'order_id' => $payment->order_id,
                'description' => 'Estorno de Pagamento #' . $payment->id,
            ]);

            $order = $payment->order;
            if ($order && $order->status === OrderStatus::Paid->value) {
                $this->orders->updateStatus($order, OrderStatus::Open->value);
            }

            $this->recordAuditEvent->execute($user, AuditEventType::PaymentRegistered, $payment, [
                'action' => 'refund',
                'payment_id' => $payment->id,
            ]);

            return $payment;
        });
    }
}
