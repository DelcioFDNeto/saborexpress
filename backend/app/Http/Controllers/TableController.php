<?php

namespace App\Http\Controllers;

use App\Models\Table;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TableController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return response()->json(Table::all());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'number' => 'required|string|unique:tables,number',
            'capacity' => 'required|integer|min:1',
            'status' => 'in:Livre,Ocupada,Reservada,Fechamento'
        ]);

        $table = Table::create($validated);
        return response()->json($table, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Table $table)
    {
        // Load active order if table is occupied
        $activeOrder = null;
        if ($table->status === 'Ocupada' || $table->status === 'Fechamento') {
            $activeOrder = Order::where('table_id', $table->id)
                ->where('status', '!=', 'Pago')
                ->where('status', '!=', 'Cancelado')
                ->first();
        }

        return response()->json([
            'table' => $table,
            'active_order' => $activeOrder
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Table $table)
    {
        $validated = $request->validate([
            'number' => 'string|unique:tables,number,' . $table->id,
            'capacity' => 'integer|min:1',
            'status' => 'in:Livre,Ocupada,Reservada,Fechamento'
        ]);

        $table->update($validated);
        return response()->json($table);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Table $table)
    {
        $table->delete();
        return response()->json(null, 204);
    }

    /**
     * Atomic method to Open a Table and link it to a new Order.
     */
    public function openTable(Request $request, Table $table)
    {
        $validated = $request->validate([
            'customer_name' => 'nullable|string',
            'customer_phone' => 'nullable|string'
        ]);

        if ($table->status !== 'Livre' && $table->status !== 'Reservada') {
            return response()->json(['message' => 'Table is not available for opening.'], 422);
        }

        try {
            DB::beginTransaction();

            // 1. Change table status
            $table->status = 'Ocupada';
            $table->save();

            // 2. Create the Order
            $order = Order::create([
                'table_id' => $table->id,
                'customer_name' => $validated['customer_name'] ?? null,
                'customer_phone' => $validated['customer_phone'] ?? null,
                'status' => 'Aberto',
                'total_amount' => 0
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Table opened successfully.',
                'table' => $table,
                'order' => $order
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to open table due to an internal error.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
