<?php

namespace App\Http\Controllers;

use App\Actions\TableReservations\CancelReservationAction;
use App\Actions\TableReservations\CreateReservationAction;
use App\Repositories\TableReservations\TableReservationRepositoryInterface;
use Illuminate\Http\Request;

class TableReservationController extends Controller
{
    public function __construct(
        private readonly TableReservationRepositoryInterface $reservations,
        private readonly CreateReservationAction $createReservation,
        private readonly CancelReservationAction $cancelReservation,
    ) {}

    public function index(Request $request)
    {
        $user = $request->user();

        $reservations = $user->role === 'client'
            ? $this->reservations->listForUser($user)
            : $this->reservations->listAll();

        return response()->json($reservations);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'table_id' => ['required', 'exists:tables,id'],
            'reservation_date' => ['required', 'date', 'after:now'],
            'guests' => ['required', 'integer', 'min:1'],
            'special_requests' => ['nullable', 'string', 'max:255'],
        ]);

        $reservation = $this->createReservation->execute([
            'table_id' => $validated['table_id'],
            'user_id' => $request->user()->id,
            'reservation_date' => $validated['reservation_date'],
            'guests' => $validated['guests'],
            'status' => 'Confirmed',
            'special_requests' => $validated['special_requests'],
        ]);

        return response()->json($reservation, 201);
    }

    public function destroy(Request $request, $id)
    {
        $reservation = $this->reservations->findOrFail($id);

        $this->cancelReservation->execute($reservation, $request->user());

        return response()->json(['message' => 'Reserva cancelada com sucesso.']);
    }
}
