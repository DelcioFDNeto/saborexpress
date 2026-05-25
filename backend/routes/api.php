<?php

use App\Http\Controllers\AuditEventController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\KitchenController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\OrderItemController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\TableController;
use App\Http\Controllers\TableReservationController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\CashMovementController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::apiResource('categories', CategoryController::class)->only(['index', 'show']);
Route::apiResource('products', ProductController::class)->only(['index', 'show']);
Route::get('orders/{order}/track', [OrderController::class, 'show']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Rotas exclusivas de autoatendimento e controle de reservas do Cliente
    Route::middleware('role:client')->group(function () {
        Route::get('client/reservations', [TableReservationController::class, 'index']);
        Route::post('client/reservations', [TableReservationController::class, 'store']);
        Route::delete('client/reservations/{tableReservation}', [TableReservationController::class, 'destroy']);
        Route::get('client/tables', [TableController::class, 'index']);
        
        // Pedidos de Delivery e Retirada protegidos para clientes logados
        Route::post('orders/delivery', [OrderController::class, 'storeDelivery']);
        Route::post('orders/takeout', [OrderController::class, 'storeTakeout']);
        Route::get('client/orders', [OrderController::class, 'myOrders']);
    });

    Route::middleware('role:administrator')->group(function () {
        Route::apiResource('users', UserController::class);
        Route::apiResource('audit-events', AuditEventController::class)
            ->parameters(['audit-events' => 'auditEvent'])
            ->only(['index', 'show']);
        Route::patch('users/{user}/password', [UserController::class, 'changePassword']);
        Route::patch('users/{user}/activate', [UserController::class, 'activate']);
        Route::patch('users/{user}/deactivate', [UserController::class, 'deactivate']);
        Route::apiResource('categories', CategoryController::class)->except(['index', 'show']);
        Route::apiResource('products', ProductController::class)->except(['index', 'show']);
        Route::patch('products/{product}/availability', [ProductController::class, 'updateAvailability']);
        Route::apiResource('tables', TableController::class)->only(['store', 'update', 'destroy']);
        Route::get('dashboard', [DashboardController::class, 'index']);
    });

    Route::middleware('role:administrator,waiter,cashier')->group(function () {
        Route::apiResource('tables', TableController::class)->only(['index', 'show']);
        Route::post('tables/{table}/open', [TableController::class, 'openTable']);
        Route::patch('tables/{table}/reserve', [TableController::class, 'reserve']);
        Route::patch('tables/{table}/cancel-reservation', [TableController::class, 'cancelReservation']);
        Route::post('tables/{table}/release', [TableController::class, 'release']);
        Route::patch('tables/{table}/mark-free', [TableController::class, 'markFree']);
        Route::post('tables/{table}/transfer-order', [TableController::class, 'transferOrder']);
        Route::post('tables/{table}/merge-order', [TableController::class, 'mergeOrder']);
        Route::get('tables/{table}/active-order', [OrderController::class, 'activeForTable']);
        Route::apiResource('orders', OrderController::class)->only(['update']);
        Route::post('orders/{order}/request-closing', [OrderController::class, 'requestClosing']);
        Route::post('orders/{order}/cancel', [OrderController::class, 'cancel']);
        Route::post('orders/{order}/items', [OrderController::class, 'addItem']);
        Route::apiResource('order-items', OrderItemController::class)->only(['index', 'show', 'update', 'destroy']);
        Route::patch('order-items/{orderItem}/deliver', [OrderItemController::class, 'deliver']);
        Route::patch('order-items/{orderItem}/cancel', [OrderItemController::class, 'cancel']);
    });

    Route::middleware('role:administrator,waiter,cashier,delivery')->group(function () {
        Route::get('orders', [OrderController::class, 'index']);
        Route::get('orders/{order}', [OrderController::class, 'show']);
        Route::put('orders/{order}/delivery-status', [OrderController::class, 'updateDeliveryStatus']);
        Route::patch('orders/{order}/assign-driver', [OrderController::class, 'assignDriver']);
    });

    Route::middleware('role:administrator,cashier')->group(function () {
        Route::apiResource('payments', PaymentController::class)->only(['index', 'show']);
        Route::post('orders/{order}/payments', [PaymentController::class, 'store']);
        Route::post('orders/{order}/split', [PaymentController::class, 'simulateSplit']);
        Route::post('orders/{order}/pay', [PaymentController::class, 'pay']);
        Route::post('payments/{payment}/refund', [PaymentController::class, 'refund']);

        Route::get('cash/movements', [CashMovementController::class, 'index']);
        Route::post('cash/movements', [CashMovementController::class, 'store']);
        Route::get('cash/report', [CashMovementController::class, 'report']);
    });

    Route::middleware('role:administrator,kitchen')->group(function () {
        Route::get('kitchen/orders', [KitchenController::class, 'orders']);
        Route::get('kitchen/order-items', [KitchenController::class, 'orderItems']);
        Route::patch('kitchen/order-items/{orderItem}/start', [KitchenController::class, 'startOrderItem']);
        Route::patch('kitchen/order-items/{orderItem}/mark-ready', [KitchenController::class, 'markOrderItemReady']);
        Route::patch('kitchen/order-items/{orderItem}/deliver', [KitchenController::class, 'deliverOrderItem']);
        Route::patch('kitchen/order-items/{orderItem}/cancel', [KitchenController::class, 'cancelOrderItem']);
    });
});
