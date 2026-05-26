<?php

namespace App\Http\Controllers;

use App\Actions\CashMovements\CreateCashMovementAction;
use App\Repositories\CashMovements\CashMovementRepositoryInterface;
use Carbon\Carbon;
use Illuminate\Http\Request;

class CashMovementController extends Controller
{
    public function __construct(
        private readonly CashMovementRepositoryInterface $cashMovements,
        private readonly CreateCashMovementAction $createCashMovement,
    ) {}

    public function index(Request $request)
    {
        $movements = $this->cashMovements->todayMovements();

        $balanceIn = $movements->whereIn('type', ['Sale', 'Suprimento'])->sum('amount');
        $balanceOut = $movements->whereIn('type', ['Sangria', 'Refund'])->sum('amount');
        $cashBalance = $balanceIn - $balanceOut;

        return response()->json([
            'data' => $movements,
            'summary' => [
                'total_in' => round($balanceIn, 2),
                'total_out' => round($balanceOut, 2),
                'balance' => round($cashBalance, 2),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'type' => ['required', 'in:Sangria,Suprimento'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'description' => ['required', 'string', 'max:255'],
        ]);

        $movement = $this->createCashMovement->execute([
            'user_id' => $request->user()->id,
            'type' => $validated['type'],
            'amount' => $validated['amount'],
            'description' => $validated['description'],
        ]);

        return response()->json($movement, 201);
    }

    public function report(Request $request)
    {
        $today = Carbon::today();
        $movements = $this->cashMovements->todayMovements();

        $sales = (float) $movements->where('type', 'Sale')->sum('amount');
        $suprimentos = (float) $movements->where('type', 'Suprimento')->sum('amount');
        $sangrias = (float) $movements->where('type', 'Sangria')->sum('amount');
        $refunds = (float) $movements->where('type', 'Refund')->sum('amount');

        $pixSales = (float) $movements->where('type', 'Sale')->where('method', 'Pix')->sum('amount');
        $cardSales = (float) $movements->where('type', 'Sale')->where('method', 'Cartao')->sum('amount');
        $cashSales = (float) $movements->where('type', 'Sale')->where('method', 'Dinheiro')->sum('amount');

        $totalIn = $sales + $suprimentos;
        $totalOut = $sangrias + $refunds;

        $cashRefunds = $movements->where('type', 'Refund')->where('method', 'Dinheiro')->sum('amount');
        $cashBalance = $suprimentos + $cashSales - $sangrias - $cashRefunds;

        return response()->json([
            'date' => $today->toDateString(),
            'sales' => round($sales, 2),
            'suprimentos' => round($suprimentos, 2),
            'sangrias' => round($sangrias, 2),
            'refunds' => round($refunds, 2),
            'methods' => [
                'pix' => round($pixSales, 2),
                'card' => round($cardSales, 2),
                'cash' => round($cashSales, 2),
            ],
            'total_in' => round($totalIn, 2),
            'total_out' => round($totalOut, 2),
            'drawer_cash_balance' => round(max(0, $cashBalance), 2),
        ]);
    }
}
