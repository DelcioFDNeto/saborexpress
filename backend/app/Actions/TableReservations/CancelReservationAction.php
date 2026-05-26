<?php

namespace App\Actions\TableReservations;

use App\Models\TableReservation;
use App\Models\User;
use App\Repositories\TableReservations\TableReservationRepositoryInterface;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

class CancelReservationAction
{
    public function __construct(
        private readonly TableReservationRepositoryInterface $reservations,
    ) {}

    /**
     * Cancel a reservation after verifying ownership for client users.
     */
    public function execute(TableReservation $reservation, User $user): void
    {
        if ($user->role === 'client' && $reservation->user_id !== $user->id) {
            throw new AccessDeniedHttpException('Não autorizado.');
        }

        $this->reservations->cancel($reservation);
    }
}
