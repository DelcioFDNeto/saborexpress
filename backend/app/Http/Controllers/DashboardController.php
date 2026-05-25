<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $faturamentoBruto = DB::table('payments')->sum('amount');

        $totalComandasFinalizadas = DB::table('orders')->where('status', 'Paga')->count();

        $comandasAtivas = DB::table('orders')->whereIn('status', ['Aberta', 'Fechamento'])->count();

        $ticketMedio = $totalComandasFinalizadas > 0
            ? round($faturamentoBruto / $totalComandasFinalizadas, 2)
            : 0;

        $curvaABC = DB::table('order_items')
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
            ->limit(10) // Top 10
            ->get();

        return response()->json([
            'kpis' => [
                'gross_revenue' => $faturamentoBruto,
                'average_ticket' => $ticketMedio,
                'completed_orders' => $totalComandasFinalizadas,
                'active_orders' => $comandasAtivas,
            ],
            'abc_curve' => $curvaABC,
        ]);
    }
}
