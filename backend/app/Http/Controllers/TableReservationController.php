<?php

namespace App\Http\Controllers;

use App\Models\TableReservation;
use App\Models\Table;
use Illuminate\Http\Request;
use Carbon\Carbon;

class TableReservationController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        
        $query = TableReservation::with(['table', 'user']);

        if ($user->role === 'client') {
            $query->where('user_id', $user->id);
        }

        return response()->json($query->orderBy('reservation_date', 'asc')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'table_id' => ['required', 'exists:tables,id'],
            'reservation_date' => ['required', 'date', 'after:now'],
            'guests' => ['required', 'integer', 'min:1'],
            'special_requests' => ['nullable', 'string', 'max:255'],
        ]);

        // Check if table is available for that date (simplified check: no other reservation within 2 hours)
        $date = Carbon::parse($validated['reservation_date']);
        $conflict = TableReservation::where('table_id', $validated['table_id'])
            ->where('status', '!=', 'Cancelled')
            ->whereBetween('reservation_date', [
                $date->copy()->subHours(2),
                $date->copy()->addHours(2)
            ])->exists();

        if ($conflict) {
            return response()->json(['message' => 'Esta mesa já possui uma reserva próxima a este horário.'], 422);
        }

        $reservation = TableReservation::create([
            'table_id' => $validated['table_id'],
            'user_id' => $request->user()->id,
            'reservation_date' => $validated['reservation_date'],
            'guests' => $validated['guests'],
            'status' => 'Confirmed', // We auto-confirm for simplicity in this project
            'special_requests' => $validated['special_requests'],
        ]);

        return response()->json($reservation->load(['table', 'user']), 201);
    }

    public function destroy(Request $request, $id)
    {
        $reservation = TableReservation::findOrFail($id);
        
        $user = $request->user();
        if ($user->role === 'client' && $reservation->user_id !== $user->id) {
            return response()->json(['message' => 'Não autorizado.'], 403);
        }

        $reservation->update(['status' => 'Cancelled']);

        return response()->json(['message' => 'Reserva cancelada com sucesso.']);
    }
}
