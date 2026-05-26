<?php

namespace App\Repositories\CashMovements;

use App\Models\CashMovement;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;

class EloquentCashMovementRepository implements CashMovementRepositoryInterface
{
    public function todayMovements(): Collection
    {
        return CashMovement::with('user')
            ->whereDate('created_at', Carbon::today())
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function create(array $data): CashMovement
    {
        return CashMovement::create($data);
    }

    public function todayCashBalance(): float
    {
        $movements = CashMovement::whereDate('created_at', Carbon::today())->get();

        $balanceIn = $movements->whereIn('type', ['Sale', 'Suprimento'])->sum('amount');
        $balanceOut = $movements->whereIn('type', ['Sangria', 'Refund'])->sum('amount');

        return (float) ($balanceIn - $balanceOut);
    }
}
