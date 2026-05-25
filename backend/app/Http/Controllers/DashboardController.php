<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Recupera os dados consolidados do painel gerencial.
     * KPIs e Curva ABC.
     */
    public function index(Request $request)
    {
        // 6.1 Faturamento Bruto (Soma dos pagamentos realizados com sucesso)
        // Para simplificar, pegaremos o faturamento total da loja.
        // Num cenário real, poderia ser filtrado por datas (e.g. hoje, mês atual).
        $faturamentoBruto = DB::table('payments')->sum('amount');

        // Total de comandas finalizadas
        $totalComandasFinalizadas = DB::table('orders')->where('status', 'Finalizada')->count();

        // Total de comandas ativas no momento (para overview gerencial)
        $comandasAtivas = DB::table('orders')->whereIn('status', ['Aberta', 'Fechada'])->count();

        // 6.2 Indicador de Ticket Médio por Comanda
        $ticketMedio = $totalComandasFinalizadas > 0
            ? round($faturamentoBruto / $totalComandasFinalizadas, 2)
            : 0;

        // 6.3 Ranking Volumétrico de Itens mais Vendidos (Curva ABC)
        // Apenas contabiliza itens de comandas 'Finalizada' (pagas) para consistência real
        $curvaABC = DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->select(
                'products.id',
                'products.name',
                DB::raw('SUM(order_items.quantity) as total_sold'),
                DB::raw('SUM(order_items.quantity * order_items.unit_price) as total_revenue')
            )
            ->where('orders.status', 'Finalizada')
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
