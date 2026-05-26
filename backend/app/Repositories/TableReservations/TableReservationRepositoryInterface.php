<?php

namespace App\Repositories\TableReservations;

use App\Models\TableReservation;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;

interface TableReservationRepositoryInterface
{
    public function listForUser(User $user): Collection;

    public function listAll(): Collection;

    public function create(array $data): TableReservation;

    public function findOrFail(int $id): TableReservation;

    public function cancel(TableReservation $reservation): void;

    public function hasConflict(int $tableId, Carbon $date): bool;
}
