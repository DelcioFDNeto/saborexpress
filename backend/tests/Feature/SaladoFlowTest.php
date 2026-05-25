<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Table;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class SaladoFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_complete_salon_flow()
    {
        // 1. Create a user (Waiter)
        $waiter = User::factory()->create(['role' => 'waiter', 'is_active' => true]);
        Sanctum::actingAs($waiter);

        // 2. Create a table
        $table = Table::factory()->create(['number' => '15', 'status' => 'Livre', 'capacity' => 4]);

        // 3. Open the table
        $response = $this->postJson("/api/tables/{$table->id}/open", [
            'customer_name' => 'Alice',
            'customer_phone' => '91999999999'
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('tables', [
            'id' => $table->id,
            'status' => 'Ocupada'
        ]);

        // Alice's active order should be created
        $order = Order::where('table_id', $table->id)->where('status', 'Aberta')->first();
        $this->assertNotNull($order);
        $this->assertEquals('Alice', $order->customer_name);

        // 4. Create a product
        $category = Category::factory()->create();
        $product = Product::factory()->create([
            'category_id' => $category->id,
            'price' => 49.90,
            'stock_quantity' => 10,
            'is_available' => true
        ]);

        // 5. Add item to the order
        $itemResponse = $this->postJson("/api/orders/{$order->id}/items", [
            'product_id' => $product->id,
            'quantity' => 2,
            'notes' => 'Com jambu extra'
        ]);

        $itemResponse->assertStatus(201);

        // Check if price snapshot and stock quantities were calculated correctly
        $this->assertDatabaseHas('order_items', [
            'order_id' => $order->id,
            'product_id' => $product->id,
            'quantity' => 2,
            'unit_price' => 49.90,
            'status' => 'Pendente'
        ]);

        $this->assertDatabaseHas('products', [
            'id' => $product->id,
            'stock_quantity' => 8
        ]);

        // Recalculated total
        $order->refresh();
        $this->assertEquals(99.80, $order->total_amount);

        // 5.5. Deliver the item to allow comanda closing
        $orderItem = OrderItem::where('order_id', $order->id)->first();
        $orderItem->status = 'Entregue';
        $orderItem->save();

        // 6. Request closing (pre-fechamento)
        $closingResponse = $this->postJson("/api/orders/{$order->id}/request-closing");
        $closingResponse->assertStatus(200);

        $order->refresh();
        $this->assertEquals('Fechamento', $order->status);

        $table->refresh();
        $this->assertEquals('Fechamento', $table->status);
    }
}
