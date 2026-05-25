<?php

namespace App\Http\Controllers;

use App\Models\CashMovement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class CashMovementController extends Controller
{
    public function index(Request $request)
    {
        $today = Carbon::today();
        
        $movements = CashMovement::with('user')
            ->whereDate('created_at', $today)
            ->orderBy('created_at', 'desc')
            ->get();

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

        if ($validated['type'] === 'Sangria') {
            // Check if there is enough cash
            $today = Carbon::today();
            $movements = CashMovement::whereDate('created_at', $today)->get();
            $balanceIn = $movements->whereIn('type', ['Sale', 'Suprimento'])->sum('amount');
            $balanceOut = $movements->whereIn('type', ['Sangria', 'Refund'])->sum('amount');
            $cashBalance = $balanceIn - $balanceOut;

            if ($validated['amount'] > $cashBalance) {
                return response()->json(['message' => 'Saldo insuficiente em caixa para a sangria.'], 422);
            }
        }

        $movement = CashMovement::create([
            'user_id' => $request->user()->id,
            'type' => $validated['type'],
            'amount' => $validated['amount'],
            'description' => $validated['description'],
        ]);

        return response()->json($movement->load('user'), 201);
    }
}
