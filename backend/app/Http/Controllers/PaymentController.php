<?php

namespace App\Http\Controllers;

use App\Actions\Payments\RegisterOrderPaymentAction;
use App\Http\Requests\Payments\RegisterPaymentRequest;
use App\Http\Resources\PaymentResource;
use App\Models\Order;
use App\Models\Payment;
use App\Repositories\Payments\PaymentRepositoryInterface;

class PaymentController extends Controller
{
    public function __construct(
        private readonly PaymentRepositoryInterface $payments,
    ) {}

    public function index()
    {
        return PaymentResource::collection($this->payments->paginateWithDetails());
    }

    public function store(
        RegisterPaymentRequest $request,
        Order $order,
        RegisterOrderPaymentAction $registerOrderPayment,
    ) {
        $payment = $registerOrderPayment->execute($order, $request->user(), $request->validated());

        return (new PaymentResource($payment))->response()->setStatusCode(201);
    }

    public function show(Payment $payment)
    {
        return new PaymentResource($this->payments->loadDetails($payment));
    }
}
