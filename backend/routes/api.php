<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\KitchenController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\OrderItemController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\TableController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login']);
Route::apiResource('categories', CategoryController::class)->only(['index', 'show']);
Route::apiResource('products', ProductController::class)->only(['index', 'show']);

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
    });

    Route::middleware('role:administrator,waiter,cashier')->group(function () {
        Route::apiResource('tables', TableController::class)->only(['index', 'show']);
        Route::post('tables/{table}/open', [TableController::class, 'openTable']);
        Route::post('tables/{table}/release', [TableController::class, 'release']);
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
    });

    Route::middleware('role:administrator,kitchen')->group(function () {
        Route::get('kitchen/order-items', [KitchenController::class, 'orderItems']);
        Route::patch('kitchen/order-items/{orderItem}/start', [KitchenController::class, 'startOrderItem']);
        Route::patch('kitchen/order-items/{orderItem}/mark-ready', [KitchenController::class, 'markOrderItemReady']);
    });
});
