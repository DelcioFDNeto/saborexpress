<?php

namespace App\Http\Controllers;

use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Http\Request;

class OrderItemController extends Controller
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
        $validated = $request->validate([
            'order_id' => 'required|exists:orders,id',
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
            'notes' => 'nullable|string'
        ]);

        $product = Product::findOrFail($validated['product_id']);

        $orderItem = OrderItem::create([
            'order_id' => $validated['order_id'],
            'product_id' => $validated['product_id'],
            'quantity' => $validated['quantity'],
            'notes' => $validated['notes'] ?? null,
            'unit_price' => $product->price,
            'status' => 'Pendente'
        ]);

        return response()->json([
            'message' => 'Order item created successfully.',
            'data' => $orderItem
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(OrderItem $orderItem)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, OrderItem $orderItem)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(OrderItem $orderItem)
    {
        //
    }
}
