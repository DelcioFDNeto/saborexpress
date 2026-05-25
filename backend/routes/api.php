<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\TableController;
use App\Http\Controllers\OrderItemController;
use App\Http\Controllers\OrderController;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::apiResource('categories', CategoryController::class);
    Route::apiResource('products', ProductController::class);

    Route::apiResource('tables', TableController::class);
    Route::post('tables/{table}/open', [TableController::class, 'openTable']);

    Route::apiResource('order-items', OrderItemController::class);

    Route::patch('orders/{order}', [OrderController::class, 'update']); // <--- 2. ADICIONE ESSA LINHA AQUI
});
