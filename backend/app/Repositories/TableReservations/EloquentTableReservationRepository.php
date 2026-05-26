<?php

namespace App\Repositories\TableReservations;

use App\Models\TableReservation;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;

class EloquentTableReservationRepository implements TableReservationRepositoryInterface
{
    public function listForUser(User $user): Collection
    {
        return TableReservation::with(['table', 'user'])
            ->where('user_id', $user->id)
            ->orderBy('reservation_date', 'asc')
            ->get();
    }

    public function listAll(): Collection
    {
        return TableReservation::with(['table', 'user'])
            ->orderBy('reservation_date', 'asc')
            ->get();
    }

    public function create(array $data): TableReservation
    {
        return TableReservation::create($data);
    }

    public function findOrFail(int $id): TableReservation
    {
        return TableReservation::findOrFail($id);
    }

    public function cancel(TableReservation $reservation): void
    {
        $reservation->update(['status' => 'Cancelled']);
    }

    public function hasConflict(int $tableId, Carbon $date): bool
    {
        return TableReservation::where('table_id', $tableId)
            ->where('status', '!=', 'Cancelled')
            ->whereBetween('reservation_date', [
                $date->copy()->subHours(2),
                $date->copy()->addHours(2),
            ])->exists();
    }
}
