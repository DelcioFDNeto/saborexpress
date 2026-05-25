<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\OrderItemController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\TableController;

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
        Route::get('tables/{table}/active-order', [OrderController::class, 'activeForTable']);
        Route::apiResource('orders', OrderController::class)->only(['index', 'show', 'update']);
        Route::post('orders/{order}/items', [OrderController::class, 'addItem']);
        Route::apiResource('order-items', OrderItemController::class)->only(['index', 'show', 'update', 'destroy']);
    });
});
