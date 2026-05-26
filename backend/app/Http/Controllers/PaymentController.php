<?php

namespace App\Http\Controllers;

use App\Actions\Audit\RecordAuditEventAction;
use App\Actions\Payments\RefundPaymentAction;
use App\Actions\Payments\RegisterOrderPaymentAction;
use App\Actions\Payments\SimulatePaymentSplitAction;
use App\Enums\AuditEventType;
use App\Http\Requests\Payments\PayRequest;
use App\Http\Requests\Payments\RegisterPaymentRequest;
use App\Http\Requests\Payments\SimulateSplitRequest;
use App\Http\Resources\PaymentResource;
use App\Models\Order;
use App\Models\Payment;
use App\Repositories\Orders\OrderRepositoryInterface;
use App\Repositories\Payments\PaymentRepositoryInterface;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    public function __construct(
        private readonly PaymentRepositoryInterface $payments,
        private readonly OrderRepositoryInterface $orders,
        private readonly RecordAuditEventAction $recordAuditEvent,
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
        $this->recordAuditEvent->execute($request->user(), AuditEventType::PaymentRegistered, $payment, [
            'order_id' => $payment->order_id,
            'amount' => $payment->amount,
            'method' => $payment->method,
        ]);

        return (new PaymentResource($payment))->response()->setStatusCode(201);
    }

    public function show(Payment $payment)
    {
        return new PaymentResource($this->payments->loadDetails($payment));
    }

    public function simulateSplit(
        SimulateSplitRequest $request,
        Order $order,
        SimulatePaymentSplitAction $simulateSplit
    ) {
        $result = $simulateSplit->execute($order, $request->validated());

        return response()->json($result);
    }

    /**
     * Simplified payment endpoint for the cashier split-payment flow.
     * Delegates to RegisterOrderPaymentAction for unified logic.
     */
    public function pay(
        PayRequest $request,
        Order $order,
        RegisterOrderPaymentAction $registerOrderPayment
    ) {
        $payment = $registerOrderPayment->execute($order, $request->user(), $request->validated(), recalculate: false);

        $this->recordAuditEvent->execute($request->user(), AuditEventType::PaymentRegistered, $payment, [
            'order_id' => $payment->order_id,
            'amount' => $payment->amount,
            'method' => $payment->method,
        ]);

        return response()->json([
            'message' => 'Pagamento registrado com sucesso',
            'order_status' => $order->fresh()->status,
        ]);
    }

    public function refund(
        Request $request,
        Payment $payment,
        RefundPaymentAction $refundPayment
    ) {
        $refundPayment->execute($payment, $request->user());

        return response()->json(['message' => 'Estorno realizado com sucesso.']);
    }
}
