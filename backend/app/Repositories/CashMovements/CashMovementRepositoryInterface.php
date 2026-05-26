<?php

namespace App\Repositories\CashMovements;

use App\Models\CashMovement;
use Illuminate\Database\Eloquent\Collection;

interface CashMovementRepositoryInterface
{
    public function todayMovements(): Collection;

    public function create(array $data): CashMovement;

    public function todayCashBalance(): float;
}
