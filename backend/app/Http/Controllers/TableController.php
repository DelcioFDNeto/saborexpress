<?php

namespace App\Http\Controllers;

use App\Actions\Audit\RecordAuditEventAction;
use App\Actions\Tables\CancelTableReservationAction;
use App\Actions\Tables\MarkTableFreeAction;
use App\Actions\Tables\MergeTableOrdersAction;
use App\Actions\Tables\OpenTableAction;
use App\Actions\Tables\ReleaseTableAction;
use App\Actions\Tables\ReserveTableAction;
use App\Actions\Tables\TransferTableOrderAction;
use App\Enums\AuditEventType;
use App\Enums\TableStatus;
use App\Http\Requests\Tables\MoveTableOrderRequest;
use App\Http\Requests\Tables\OpenTableRequest;
use App\Http\Requests\Tables\ReserveTableRequest;
use App\Http\Requests\Tables\StoreTableRequest;
use App\Http\Requests\Tables\UpdateTableRequest;
use App\Http\Resources\OrderResource;
use App\Http\Resources\TableResource;
use App\Models\Table;
use App\Repositories\Orders\OrderRepositoryInterface;
use App\Repositories\Tables\TableRepositoryInterface;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class TableController extends Controller
{
    public function __construct(
        private readonly TableRepositoryInterface $tables,
        private readonly OrderRepositoryInterface $orders,
        private readonly RecordAuditEventAction $recordAuditEvent,
    ) {}

    public function index()
    {
        return TableResource::collection($this->tables->allOrdered());
    }

    public function store(StoreTableRequest $request)
    {
        $table = $this->tables->create($request->validated());
        $this->recordAuditEvent->execute($request->user(), AuditEventType::TableCreated, $table);

        return (new TableResource($table))
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }

    public function show(Table $table)
    {
        $activeOrder = null;

        if (in_array($table->status, [TableStatus::Occupied->value, TableStatus::Closing->value], true)) {
            $activeOrder = $this->orders->findActiveForTable($table);
        }

        return response()->json([
            'table' => new TableResource($table),
            'active_order' => $activeOrder ? new OrderResource($activeOrder) : null,
        ]);
    }

    public function update(UpdateTableRequest $request, Table $table)
    {
        $table = $this->tables->update($table, $request->validated());
        $this->recordAuditEvent->execute($request->user(), AuditEventType::TableUpdated, $table);

        return new TableResource($table);
    }

    public function destroy(Request $request, Table $table)
    {
        $this->recordAuditEvent->execute($request->user(), AuditEventType::TableDeleted, $table, [
            'number' => $table->number,
        ]);
        $this->tables->delete($table);

        return response()->json(null, Response::HTTP_NO_CONTENT);
    }

    public function openTable(OpenTableRequest $request, Table $table, OpenTableAction $openTable)
    {
        $order = $openTable->execute($table, $request->user(), $request->validated());
        $this->recordAuditEvent->execute($request->user(), AuditEventType::TableOpened, $order, [
            'table_id' => $order->table_id,
            'customer_name' => $order->customer_name,
        ]);

        return (new OrderResource($order))
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }

    public function reserve(ReserveTableRequest $request, Table $table, ReserveTableAction $reserveTable)
    {
        $table = $reserveTable->execute($table, $request->validated());
        $this->recordAuditEvent->execute($request->user(), AuditEventType::TableReserved, $table, [
            'reservation_name' => $table->reservation_name,
            'reserved_at' => $table->reserved_at,
        ]);

        return new TableResource($table);
    }

    public function cancelReservation(Request $request, Table $table, CancelTableReservationAction $cancelTableReservation)
    {
        $table = $cancelTableReservation->execute($table);
        $this->recordAuditEvent->execute($request->user(), AuditEventType::TableReservationCanceled, $table);

        return new TableResource($table);
    }

    public function release(Request $request, Table $table, ReleaseTableAction $releaseTable)
    {
        $table = $releaseTable->execute($table);
        $this->recordAuditEvent->execute($request->user(), AuditEventType::TableReleased, $table);

        return new TableResource($table);
    }

    public function markFree(Request $request, Table $table, MarkTableFreeAction $markTableFree)
    {
        $table = $markTableFree->execute($table);
        $this->recordAuditEvent->execute($request->user(), AuditEventType::TableMarkedFree, $table);

        return new TableResource($table);
    }

    public function transferOrder(
        MoveTableOrderRequest $request,
        Table $table,
        TransferTableOrderAction $transferTableOrder,
    ) {
        $order = $transferTableOrder->execute($table, $request->validated('target_table_id'));
        $this->recordAuditEvent->execute($request->user(), AuditEventType::TableOrderTransferred, $order, [
            'source_table_id' => $table->id,
            'target_table_id' => $request->validated('target_table_id'),
        ]);

        return new OrderResource($order);
    }

    public function mergeOrder(
        MoveTableOrderRequest $request,
        Table $table,
        MergeTableOrdersAction $mergeTableOrders,
    ) {
        $order = $mergeTableOrders->execute($table, $request->validated('target_table_id'));
        $this->recordAuditEvent->execute($request->user(), AuditEventType::TableOrdersMerged, $order, [
            'source_table_id' => $table->id,
            'target_table_id' => $request->validated('target_table_id'),
        ]);

        return new OrderResource($order);
    }
}
