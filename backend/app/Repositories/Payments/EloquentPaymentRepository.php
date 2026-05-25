<?php

namespace App\Repositories\Payments;

use App\Enums\PaymentStatus;
use App\Models\Order;
use App\Models\Payment;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class EloquentPaymentRepository implements PaymentRepositoryInterface
{
    public function paginateWithDetails(int $perPage = 15): LengthAwarePaginator
    {
        return Payment::with(['order.table', 'user'])
            ->latest()
            ->paginate($perPage);
    }

    public function loadDetails(Payment $payment): Payment
    {
        return $payment->load(['order.table', 'user']);
    }

    public function create(array $data): Payment
    {
        return Payment::create($data);
    }

    public function paidTotalForOrder(Order $order): string
    {
        $total = Payment::where('order_id', $order->id)
            ->where('status', PaymentStatus::Paid->value)
            ->selectRaw('COALESCE(SUM(amount), 0) as total')
            ->value('total');

        return number_format((float) $total, 2, '.', '');
    }

    public function hasPaidPayment(Order $order): bool
    {
        return Payment::where('order_id', $order->id)
            ->where('status', PaymentStatus::Paid->value)
            ->exists();
    }
}
