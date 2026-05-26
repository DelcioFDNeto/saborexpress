<?php

namespace App\Repositories\Dashboard;

use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class EloquentDashboardRepository implements DashboardRepositoryInterface
{
    /**
     * Get aggregated dashboard data.
     *
     * @param array $filters
     * @return array
     */
    public function getDashboardData(array $filters): array
    {
        $period = $filters['period'] ?? 'all';
        $operatorId = $filters['operator_id'] ?? null;
        $paymentMethod = $filters['payment_method'] ?? null;
        $channel = $filters['channel'] ?? null;

        // Base dates for period filtering
        $startDate = null;
        $endDate = null;

        if ($period === 'today') {
            $startDate = Carbon::today()->startOfDay();
            $endDate = Carbon::today()->endOfDay();
        } elseif ($period === '7d') {
            $startDate = Carbon::today()->subDays(6)->startOfDay();
            $endDate = Carbon::today()->endOfDay();
        } elseif ($period === '30d') {
            $startDate = Carbon::today()->subDays(29)->startOfDay();
            $endDate = Carbon::today()->endOfDay();
        }

        // 1. KPI Queries - Base query
        $paymentsQuery = DB::table('payments')
            ->where('payments.status', 'Pago')
            ->join('orders', 'payments.order_id', '=', 'orders.id')
            ->leftJoin('users', 'payments.user_id', '=', 'users.id');

        if ($startDate && $endDate) {
            $paymentsQuery->whereBetween('payments.paid_at', [$startDate, $endDate]);
        }
        if ($operatorId) {
            $paymentsQuery->where('payments.user_id', $operatorId);
        }
        if ($paymentMethod) {
            $paymentsQuery->where('payments.method', $paymentMethod);
        }
        if ($channel) {
            $paymentsQuery->where('orders.type', $channel);
        }

        $faturamentoBruto = (float) $paymentsQuery->sum('payments.amount');

        $ordersQuery = DB::table('orders')
            ->where('orders.status', 'Paga');

        if ($startDate && $endDate) {
            $ordersQuery->whereBetween('orders.updated_at', [$startDate, $endDate]);
        }
        if ($channel) {
            $ordersQuery->where('orders.type', $channel);
        }
        
        $totalComandasFinalizadas = $ordersQuery->count();

        $comandasAtivas = DB::table('orders')
            ->whereIn('status', ['Aberta', 'Fechamento'])
            ->when($channel, fn($q) => $q->where('type', $channel))
            ->count();

        $ticketMedio = $totalComandasFinalizadas > 0
            ? round($faturamentoBruto / $totalComandasFinalizadas, 2)
            : 0;

        // 2. Curva ABC (Top Products)
        $abcQuery = DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->select(
                'products.id',
                'products.name',
                DB::raw('SUM(order_items.quantity) as total_sold'),
                DB::raw('SUM(order_items.quantity * order_items.unit_price) as total_revenue')
            )
            ->where('orders.status', 'Paga')
            ->groupBy('products.id', 'products.name')
            ->orderByDesc('total_sold')
            ->limit(10);

        if ($startDate && $endDate) {
            $abcQuery->whereBetween('orders.created_at', [$startDate, $endDate]);
        }
        if ($channel) {
            $abcQuery->where('orders.type', $channel);
        }
        $curvaABC = $abcQuery->get()->toArray();

        // 3. Faturamento sobre tempo (Revenue Chart) - Database Agnostic PHP Grouping
        $chartQuery = clone $paymentsQuery;
        $rawPayments = $chartQuery->select('payments.paid_at', 'payments.amount')->get();
        
        $revenueChart = [];
        if ($period === 'today') {
            $grouped = [];
            foreach ($rawPayments as $payment) {
                $hour = Carbon::parse($payment->paid_at)->format('H:00');
                $grouped[$hour] = ($grouped[$hour] ?? 0) + (float) $payment->amount;
            }
            
            for ($h = 0; $h < 24; $h++) {
                $hourStr = sprintf('%02d:00', $h);
                if (isset($grouped[$hourStr]) || count($rawPayments) > 0) {
                    $revenueChart[] = [
                        'date' => $hourStr,
                        'revenue' => round($grouped[$hourStr] ?? 0, 2)
                    ];
                }
            }
        } else {
            $grouped = [];
            foreach ($rawPayments as $payment) {
                $dateStr = Carbon::parse($payment->paid_at)->format('d/m');
                $grouped[$dateStr] = ($grouped[$dateStr] ?? 0) + (float) $payment->amount;
            }
            
            foreach ($grouped as $date => $rev) {
                $revenueChart[] = [
                    'date' => $date,
                    'revenue' => round($rev, 2)
                ];
            }
            // Sort by date key string
            usort($revenueChart, fn($a, $b) => strcmp($a['date'], $b['date']));
        }

        // 4. Payment Methods Breakdown
        $methodsQuery = clone $paymentsQuery;
        $rawMethods = $methodsQuery->select('payments.method', DB::raw('SUM(payments.amount) as total'))
            ->groupBy('payments.method')
            ->get();
        
        $paymentMethodsBreakdown = [];
        foreach ($rawMethods as $row) {
            $paymentMethodsBreakdown[] = [
                'method' => $row->method === 'Cartao' ? 'Cartão' : $row->method,
                'total' => round((float) $row->total, 2),
            ];
        }

        // 5. Channels Breakdown
        $channelsQuery = clone $paymentsQuery;
        $rawChannels = $channelsQuery->select('orders.type as channel', DB::raw('SUM(payments.amount) as total'))
            ->groupBy('orders.type')
            ->get();
            
        $channelsBreakdown = [];
        foreach ($rawChannels as $row) {
            $channelsBreakdown[] = [
                'channel' => $row->channel,
                'total' => round((float) $row->total, 2),
            ];
        }

        // 6. Operator Sales Ranking
        $operatorsQuery = clone $paymentsQuery;
        $rawOperators = $operatorsQuery->select('users.name as operator', DB::raw('SUM(payments.amount) as total'))
            ->whereNotNull('users.name')
            ->groupBy('users.name')
            ->orderByDesc('total')
            ->limit(5)
            ->get();

        $operatorsBreakdown = [];
        foreach ($rawOperators as $row) {
            $operatorsBreakdown[] = [
                'operator' => $row->operator,
                'total' => round((float) $row->total, 2),
            ];
        }

        return [
            'kpis' => [
                'gross_revenue' => round($faturamentoBruto, 2),
                'average_ticket' => round($ticketMedio, 2),
                'completed_orders' => $totalComandasFinalizadas,
                'active_orders' => $comandasAtivas,
            ],
            'abc_curve' => $curvaABC,
            'revenue_chart' => $revenueChart,
            'payment_methods' => $paymentMethodsBreakdown,
            'channels' => $channelsBreakdown,
            'operators' => $operatorsBreakdown,
        ];
    }
}
