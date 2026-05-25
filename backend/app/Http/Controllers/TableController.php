<?php

namespace App\Http\Controllers;

use App\Actions\Tables\ReleaseTableAction;
use App\Enums\OrderStatus;
use App\Enums\TableStatus;
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

    /**
     * Pré-fechamento de conta (Req 5.1)
     */
    public function closeRequest(Request $request, Table $table)
    {
        $activeOrder = $this->orders->findActiveForTableId($table->id);
        if (!$activeOrder) {
            return response()->json(['message' => 'Mesa não possui comanda ativa'], 400);
        }

        if ($activeOrder->status !== OrderStatus::Open->value) {
            return response()->json(['message' => 'Comanda já está em processo de fechamento ou finalizada'], 400);
        }

        DB::transaction(function () use ($activeOrder, $table) {
            $this->orders->recalculateTotal($activeOrder);
            $activeOrder->service_fee = number_format((float) $activeOrder->total_amount * 0.10, 2, '.', '');
            $activeOrder->save();

            $this->orders->updateStatus($activeOrder, OrderStatus::Closing->value);
            $this->tables->update($table, ['status' => TableStatus::Closing->value]);
        });

        return response()->json(['message' => 'Pré-fechamento solicitado', 'order' => $activeOrder->fresh()]);
    }

    /**
     * Transferir mesa (Req 2.4)
     */
    public function transfer(Request $request, Table $table)
    {
        $validated = $request->validate([
            'target_table_id' => 'required|exists:tables,id',
        ]);

        if ($table->id == $validated['target_table_id']) {
            return response()->json(['message' => 'Mesa de destino deve ser diferente da atual'], 400);
        }

        $result = DB::transaction(function () use ($table, $validated) {
            $sourceTable = $this->tables->lockById($table->id);
            $targetTable = $this->tables->lockById($validated['target_table_id']);

            if ($targetTable->status !== TableStatus::Free->value) {
                return ['status' => 400, 'body' => ['message' => 'Mesa de destino não está livre']];
            }

            $order = $this->orders->findActiveForTableId($sourceTable->id, lock: true);
            if (!$order) {
                return ['status' => 400, 'body' => ['message' => 'Mesa atual não possui comanda ativa']];
            }

            $this->tables->update($targetTable, ['status' => TableStatus::Occupied->value]);
            $this->tables->update($sourceTable, ['status' => TableStatus::Free->value]);

            $order->table_id = $targetTable->id;
            $order->save();

            return ['status' => 200, 'body' => ['message' => 'Mesa transferida com sucesso', 'new_table_id' => $targetTable->id]];
        });

        return response()->json($result['body'], $result['status']);
    }

    /**
     * Agrupar mesas / Juntar comandas (Req 2.4)
     */
    public function merge(Request $request, Table $table)
    {
        $validated = $request->validate([
            'target_table_id' => 'required|exists:tables,id',
        ]);

        if ($table->id == $validated['target_table_id']) {
            return response()->json(['message' => 'Mesa de destino deve ser diferente da atual'], 400);
        }

        $result = DB::transaction(function () use ($table, $validated) {
            $sourceTable = $this->tables->lockById($table->id);
            $targetTable = $this->tables->lockById($validated['target_table_id']);

            if ($targetTable->status !== TableStatus::Occupied->value && $targetTable->status !== TableStatus::Closing->value) {
                return ['status' => 400, 'body' => ['message' => 'Mesa de destino deve estar ocupada para agrupar']];
            }

            $sourceOrder = $this->orders->findActiveForTableId($sourceTable->id, lock: true);
            $targetOrder = $this->orders->findActiveForTableId($targetTable->id, lock: true);

            if (!$sourceOrder || !$targetOrder) {
                return ['status' => 400, 'body' => ['message' => 'Ambas as mesas devem possuir comandas ativas para agrupar']];
            }

            // Transfere itens da comanda de origem para a de destino
            DB::table('order_items')
                ->where('order_id', $sourceOrder->id)
                ->update(['order_id' => $targetOrder->id]);

            // Recalcula totais
            $this->orders->recalculateTotal($targetOrder);

            // Cancela comanda de origem e libera mesa
            $this->orders->updateStatus($sourceOrder, OrderStatus::Canceled->value);
            $this->tables->update($sourceTable, ['status' => TableStatus::Free->value]);

            return ['status' => 200, 'body' => ['message' => 'Mesas agrupadas com sucesso', 'new_table_id' => $targetTable->id]];
        });

        return response()->json($result['body'], $result['status']);
    }
}

