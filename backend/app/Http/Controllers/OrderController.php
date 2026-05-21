<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // ... (Order creation logic will go here in M02/M03)
    }

    /**
     * Add an item to an existing order (M03 overlap).
     * This method captures the current product price to ensure it is immutable for this order.
     */
    public function addItem(Request $request, Order $order)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
            'notes' => 'nullable|string'
        ]);

        $product = \App\Models\Product::findOrFail($validated['product_id']);

        // Snapshot Imutável de Preço: Gravando o preço atual na tabela intermediária
        $orderItem = $order->items()->create([
            'product_id' => $product->id,
            'quantity' => $validated['quantity'],
            'unit_price' => $product->price, // Captura o snapshot do preço
            'notes' => $validated['notes'] ?? null,
            'status' => 'Pendente'
        ]);

        return response()->json($orderItem, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Order $order)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Order $order)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Order $order)
    {
        //
    }
}
