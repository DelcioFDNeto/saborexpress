<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::apiResource('categories', \App\Http\Controllers\CategoryController::class);
Route::apiResource('products', \App\Http\Controllers\ProductController::class);

Route::apiResource('tables', \App\Http\Controllers\TableController::class);
Route::post('tables/{table}/open', [\App\Http\Controllers\TableController::class, 'openTable']);
