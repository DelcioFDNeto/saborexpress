<?php

namespace App\Actions\TableReservations;

use App\Models\TableReservation;
use App\Repositories\TableReservations\TableReservationRepositoryInterface;
use Carbon\Carbon;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;

class CreateReservationAction
{
    public function __construct(
        private readonly TableReservationRepositoryInterface $reservations,
    ) {}

    /**
     * Create a new table reservation after checking for time conflicts.
     */
    public function execute(array $data): TableReservation
    {
        $date = Carbon::parse($data['reservation_date']);

        if ($this->reservations->hasConflict($data['table_id'], $date)) {
            throw new ConflictHttpException('Esta mesa já possui uma reserva próxima a este horário.');
        }

        $reservation = $this->reservations->create($data);

        return $reservation->load(['table', 'user']);
    }
}
