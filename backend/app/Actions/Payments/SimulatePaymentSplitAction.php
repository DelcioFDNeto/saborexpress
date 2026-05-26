<?php

namespace App\Actions\Payments;

use App\Models\Order;
use App\Repositories\Payments\PaymentRepositoryInterface;
use Illuminate\Support\Facades\DB;

class SimulatePaymentSplitAction
{
    public function __construct(
        private readonly PaymentRepositoryInterface $payments,
    ) {}

    /**
     * Simulate a split payment calculation.
     *
     * @param Order $order
     * @param array $validated
     * @return array
     */
    public function execute(Order $order, array $validated): array
    {
        $subtotal = (float) $order->total_amount;
        $serviceFee = (float) $order->service_fee;
        $discount = (float) $order->discount;
        $total = $subtotal + $serviceFee - $discount;
        $paid = (float) $this->payments->paidTotalForOrder($order);
        $remaining = $total - $paid;

        if ($remaining <= 0) {
            return ['message' => 'Conta já está paga.', 'remaining' => 0];
        }

        if ($validated['split_type'] === 'integral') {
            return [
                'type' => 'integral',
                'installments' => [$remaining],
            ];
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

            return [
                'type' => 'equal',
                'installments' => $installments,
            ];
        }

        // Split by items
        $itemIds = $validated['item_ids'] ?? [];

        if (empty($itemIds)) {
            return [
                'type' => 'items',
                'installments' => [0],
            ];
        }

        $itemsSubtotal = DB::table('order_items')
            ->where('order_id', $order->id)
            ->whereIn('id', $itemIds)
            ->get()
            ->sum(fn ($item) => $item->unit_price * $item->quantity);

        $itemsServiceFee = $order->service_fee > 0 ? $itemsSubtotal * 0.10 : 0;
        $finalAmount = min($itemsSubtotal + $itemsServiceFee, $remaining);

        return [
            'type' => 'items',
            'installments' => [round($finalAmount, 2)],
        ];
    }
}
