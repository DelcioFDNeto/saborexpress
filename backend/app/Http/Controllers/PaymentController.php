<?php

namespace App\Http\Controllers;

use App\Actions\Payments\RegisterOrderPaymentAction;
use App\Actions\Tables\ReleaseTableAction;
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

    /**
     * Motor de Divisão Matemático (Simulação de split de conta)
     */
    public function simulateSplit(Request $request, Order $order)
    {
        $validated = $request->validate([
            'split_type' => 'required|in:integral,equal,items',
            'num_people' => 'required_if:split_type,equal|integer|min:1',
        ]);

        $subtotal = (float) $order->total_amount;
        $serviceFee = (float) $order->service_fee;
        $discount = (float) $order->discount;
        $total = $subtotal + $serviceFee - $discount;

        $paid = (float) $this->payments->paidTotalForOrder($order);
        $remaining = $total - $paid;

        if ($remaining <= 0) {
            return response()->json(['message' => 'Conta já está paga.', 'remaining' => 0]);
        }

        if ($validated['split_type'] === 'integral') {
            return response()->json([
                'type' => 'integral',
                'installments' => [$remaining],
            ]);
        }

        if ($validated['split_type'] === 'equal') {
            $numPeople = $validated['num_people'];

            // Tratamento de Dízimas Periódicas e Rateio de Centavos
            $remainingCents = (int) round($remaining * 100);
            $baseShareCents = (int) floor($remainingCents / $numPeople);
            $remainderCents = $remainingCents % $numPeople;

            $installments = [];
            for ($i = 0; $i < $numPeople; $i++) {
                $share = $baseShareCents;
                if ($i < $remainderCents) {
                    $share += 1;
                }
                $installments[] = round($share / 100, 2);
            }

            return response()->json([
                'type' => 'equal',
                'installments' => $installments,
            ]);
        }

        if ($validated['split_type'] === 'items') {
            $itemIds = $request->input('item_ids', []);
            if (empty($itemIds)) {
                return response()->json([
                    'type' => 'items',
                    'installments' => [0],
                ]);
            }

            $itemsSubtotal = DB::table('order_items')
                ->where('order_id', $order->id)
                ->whereIn('id', $itemIds)
                ->get()
                ->sum(function ($item) {
                    return $item->unit_price * $item->quantity;
                });

            $hasServiceFee = $order->service_fee > 0;
            $itemsServiceFee = $hasServiceFee ? ($itemsSubtotal * 0.10) : 0;
            $itemsTotal = $itemsSubtotal + $itemsServiceFee;
            $finalAmount = min($itemsTotal, $remaining);

            return response()->json([
                'type' => 'items',
                'installments' => [round($finalAmount, 2)],
            ]);
        }

        return response()->json(['error' => 'Split type not fully implemented'], 501);
    }

    /**
     * Registrar Recebimento simplificado (PIX/Cartão/Dinheiro)
     * Este método é usado pelo fluxo simplificado do frontend Cashier.
     */
    public function pay(Request $request, Order $order)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'method' => 'required|in:Pix,Cartao,Dinheiro',
        ]);

        DB::transaction(function () use ($order, $validated, $request) {
            $this->payments->create([
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
                    $table = $order->table;
                    $table->status = 'Livre';
                    $table->save();
                }
            }
        });

        return response()->json([
            'message' => 'Pagamento registrado com sucesso',
            'order_status' => $order->fresh()->status,
        ]);
    }
}

