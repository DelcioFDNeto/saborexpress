<?php

namespace App\Repositories\Payments;

use App\Models\Order;
use App\Models\Payment;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface PaymentRepositoryInterface
{
    public function paginateWithDetails(int $perPage = 15): LengthAwarePaginator;

    public function loadDetails(Payment $payment): Payment;

    public function create(array $data): Payment;

    public function paidTotalForOrder(Order $order): string;

    public function hasPaidPayment(Order $order): bool;
}
