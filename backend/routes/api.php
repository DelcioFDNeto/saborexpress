<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\KitchenController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\OrderItemController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\TableController;
use App\Http\Controllers\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::apiResource('categories', CategoryController::class)->only(['index', 'show']);
Route::apiResource('products', ProductController::class)->only(['index', 'show']);

// Delivery (Public creation and Status Update)
Route::post('orders/delivery', [OrderController::class, 'storeDelivery']);
Route::put('orders/{order}/delivery-status', [OrderController::class, 'updateDeliveryStatus']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::middleware('role:administrator')->group(function () {
        Route::apiResource('categories', CategoryController::class)->except(['index', 'show']);
        Route::apiResource('products', ProductController::class)->except(['index', 'show']);
        Route::apiResource('tables', TableController::class)->only(['store', 'update', 'destroy']);
        Route::apiResource('users', UserController::class)->only(['index', 'store']);
        Route::get('dashboard', [DashboardController::class, 'index']);
    });

    Route::middleware('role:administrator,waiter,cashier')->group(function () {
        Route::apiResource('tables', TableController::class)->only(['index', 'show']);
        Route::post('tables/{table}/open', [TableController::class, 'openTable']);
        Route::post('tables/{table}/release', [TableController::class, 'release']);
        Route::post('tables/{table}/close-request', [TableController::class, 'closeRequest']);
        Route::post('tables/{table}/transfer', [TableController::class, 'transfer']);
        Route::post('tables/{table}/merge', [TableController::class, 'merge']);
        Route::get('tables/{table}/active-order', [OrderController::class, 'activeForTable']);
        Route::apiResource('orders', OrderController::class)->only(['index', 'show', 'update']);
        Route::post('orders/{order}/request-closing', [OrderController::class, 'requestClosing']);
        Route::post('orders/{order}/cancel', [OrderController::class, 'cancel']);
        Route::post('orders/{order}/items', [OrderController::class, 'addItem']);
        Route::apiResource('order-items', OrderItemController::class)->only(['index', 'show', 'update', 'destroy']);
    });

    Route::middleware('role:administrator,cashier')->group(function () {
        Route::apiResource('payments', PaymentController::class)->only(['index', 'show']);
        Route::post('orders/{order}/payments', [PaymentController::class, 'store']);
        Route::post('orders/{order}/split', [PaymentController::class, 'simulateSplit']);
        Route::post('orders/{order}/pay', [PaymentController::class, 'pay']);
    });

    Route::middleware('role:administrator,kitchen')->group(function () {
        Route::get('kitchen/order-items', [KitchenController::class, 'orderItems']);
        Route::patch('kitchen/order-items/{orderItem}/start', [KitchenController::class, 'startOrderItem']);
        Route::patch('kitchen/order-items/{orderItem}/mark-ready', [KitchenController::class, 'markOrderItemReady']);
    });
});

