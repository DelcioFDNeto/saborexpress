<?php

namespace App\Http\Controllers;

use App\Actions\Audit\RecordAuditEventAction;
use App\Actions\Payments\RegisterOrderPaymentAction;
use App\Enums\AuditEventType;
use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Http\Requests\Payments\RegisterPaymentRequest;
use App\Http\Resources\PaymentResource;
use App\Models\Order;
use App\Models\Payment;
use App\Repositories\Orders\OrderRepositoryInterface;
use App\Repositories\Payments\PaymentRepositoryInterface;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

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

    public function simulateSplit(Request $request, Order $order)
    {
        $validated = $request->validate([
            'split_type' => ['required', 'in:integral,equal,items'],
            'num_people' => ['required_if:split_type,equal', 'integer', 'min:1'],
        ]);

        $subtotal = (float) $order->total_amount;
        $serviceFee = (float) $order->service_fee;
        $discount = (float) $order->discount;
        $total = $subtotal + $serviceFee - $discount;
        $paid = (float) $this->payments->paidTotalForOrder($order);
        $remaining = $total - $paid;

        if ($remaining <= 0) {
            return response()->json(['message' => 'Conta ja esta paga.', 'remaining' => 0]);
        }

        if ($validated['split_type'] === 'integral') {
            return response()->json([
                'type' => 'integral',
                'installments' => [$remaining],
            ]);
        }

        if ($validated['split_type'] === 'equal') {
            $numPeople = $validated['num_people'];
            $remainingCents = (int) round($remaining * 100);
            $baseShareCents = (int) floor($remainingCents / $numPeople);
            $remainderCents = $remainingCents % $numPeople;

            $installments = [];

            for ($i = 0; $i < $numPeople; $i++) {
                $share = $baseShareCents;

                if ($i < $remainderCents) {
                    $share++;
                }

                $installments[] = round($share / 100, 2);
            }

            return response()->json([
                'type' => 'equal',
                'installments' => $installments,
            ]);
        }

        $itemIds = $request->input('item_ids', []);

        if ($itemIds === []) {
            return response()->json([
                'type' => 'items',
                'installments' => [0],
            ]);
        }

        $itemsSubtotal = DB::table('order_items')
            ->where('order_id', $order->id)
            ->whereIn('id', $itemIds)
            ->get()
            ->sum(fn ($item) => $item->unit_price * $item->quantity);

        $itemsServiceFee = $order->service_fee > 0 ? $itemsSubtotal * 0.10 : 0;
        $finalAmount = min($itemsSubtotal + $itemsServiceFee, $remaining);

        return response()->json([
            'type' => 'items',
            'installments' => [round($finalAmount, 2)],
        ]);
    }

    public function pay(Request $request, Order $order)
    {
        $validated = $request->validate([
            'amount' => ['required', 'numeric', 'min:0.01'],
            'method' => ['required', 'in:Pix,Cartao,Cartão,Dinheiro'],
        ]);

        $validated['method'] = $validated['method'] === 'Cartão' ? 'Cartao' : $validated['method'];

        DB::transaction(function () use ($order, $validated, $request) {
            $payment = $this->payments->create([
                'order_id' => $order->id,
                'user_id' => $request->user()->id,
                'amount' => $validated['amount'],
                'method' => $validated['method'],
                'status' => PaymentStatus::Paid->value,
                'paid_at' => now(),
            ]);

            $subtotal = (float) $order->total_amount;
            $serviceFee = (float) $order->service_fee;
            $discount = (float) $order->discount;
            $total = $subtotal + $serviceFee - $discount;
            $paid = (float) $this->payments->paidTotalForOrder($order);

            if ($paid >= $total - 0.01) {
                $this->orders->updateStatus($order, OrderStatus::Paid->value);

                if ($order->table_id) {
                    $order->table()->update(['status' => 'Livre']);
                }
            }

            $this->recordAuditEvent->execute($request->user(), AuditEventType::PaymentRegistered, $payment, [
                'order_id' => $payment->order_id,
                'amount' => $payment->amount,
                'method' => $payment->method,
            ]);
        });

        return response()->json([
            'message' => 'Pagamento registrado com sucesso',
            'order_status' => $order->fresh()->status,
        ]);
    }
}
