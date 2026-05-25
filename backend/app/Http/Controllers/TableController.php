<?php

namespace App\Http\Controllers;

use App\Actions\Tables\ReleaseTableAction;
use App\Models\Table;
use App\Repositories\Orders\OrderRepositoryInterface;
use App\Repositories\Tables\TableRepositoryInterface;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TableController extends Controller
{
    public function __construct(
        private readonly TableRepositoryInterface $tables,
        private readonly OrderRepositoryInterface $orders,
    ) {}

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return response()->json($this->tables->allOrdered());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'number' => 'required|string|unique:tables,number',
            'capacity' => 'required|integer|min:1',
            'status' => 'in:Livre,Ocupada,Reservada,Fechamento',
        ]);

        $table = $this->tables->create($validated);

        return response()->json($table, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Table $table)
    {
        $activeOrder = null;
        if ($table->status === 'Ocupada' || $table->status === 'Fechamento') {
            $activeOrder = $this->orders->findActiveForTableId($table->id);
        }

        return response()->json([
            'table' => $table,
            'active_order' => $activeOrder,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Table $table)
    {
        $validated = $request->validate([
            'number' => 'string|unique:tables,number,'.$table->id,
            'capacity' => 'integer|min:1',
            'status' => 'in:Livre,Ocupada,Reservada,Fechamento',
        ]);

        return response()->json($this->tables->update($table, $validated));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Table $table)
    {
        $this->tables->delete($table);

        return response()->json(null, 204);
    }

    /**
     * Atomic method to Open a Table and link it to a new Order.
     */
    public function openTable(Request $request, Table $table)
    {
        $validated = $request->validate([
            'customer_name' => 'nullable|string|max:255',
            'customer_phone' => 'nullable|string|max:30',
        ]);

        $result = DB::transaction(function () use ($request, $table, $validated) {
            $lockedTable = $this->tables->lockById($table->id);

            if ($lockedTable->status !== 'Livre' && $lockedTable->status !== 'Reservada') {
                return [
                    'status' => 422,
                    'body' => ['message' => 'Table is not available for opening.'],
                ];
            }

            $activeOrder = $this->orders->findActiveForTableId($lockedTable->id, lock: true);

            if ($activeOrder) {
                return [
                    'status' => 409,
                    'body' => ['message' => 'Table already has an active order.'],
                ];
            }

            $lockedTable = $this->tables->update($lockedTable, ['status' => 'Ocupada']);

            $order = $this->orders->create([
                'table_id' => $lockedTable->id,
                'user_id' => $request->user()->id,
                'customer_name' => $validated['customer_name'] ?? null,
                'customer_phone' => $validated['customer_phone'] ?? null,
                'status' => 'Aberta',
                'type' => 'Mesa',
                'total_amount' => 0,
            ]);

            return [
                'status' => 201,
                'body' => [
                    'message' => 'Table opened successfully.',
                    'table' => $lockedTable,
                    'order' => $order,
                ],
            ];
        });

        return response()->json($result['body'], $result['status']);
    }

    public function release(Table $table, ReleaseTableAction $releaseTable)
    {
        return response()->json($releaseTable->execute($table));
    }
}
