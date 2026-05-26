<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_access_dashboard_and_get_correct_statistics()
    {
        // 1. Create admin user and authenticate
        $admin = User::factory()->create(['role' => 'administrator', 'is_active' => true]);
        Sanctum::actingAs($admin);

        // 2. Create products, orders and payments
        $category = Category::factory()->create();
        $product1 = Product::factory()->create(['category_id' => $category->id, 'price' => 20.00]);
        $product2 = Product::factory()->create(['category_id' => $category->id, 'price' => 50.00]);

        // A paid order
        $orderPaid = Order::factory()->create([
            'user_id' => $admin->id,
            'type' => 'Mesa',
            'status' => 'Paga',
            'total_amount' => 90.00,
            'service_fee' => 9.00,
            'discount' => 0.00
        ]);

        OrderItem::factory()->create([
            'order_id' => $orderPaid->id,
            'product_id' => $product1->id,
            'quantity' => 2,
            'unit_price' => 20.00
        ]);

        OrderItem::factory()->create([
            'order_id' => $orderPaid->id,
            'product_id' => $product2->id,
            'quantity' => 1,
            'unit_price' => 50.00
        ]);

        // Create payments for the paid order directly
        Payment::create([
            'order_id' => $orderPaid->id,
            'user_id' => $admin->id,
            'amount' => 45.00,
            'method' => 'Pix',
            'status' => 'Pago',
            'paid_at' => now()
        ]);

        Payment::create([
            'order_id' => $orderPaid->id,
            'user_id' => $admin->id,
            'amount' => 45.00,
            'method' => 'Cartao',
            'status' => 'Pago',
            'paid_at' => now()
        ]);

        // An active order (Aberta)
        Order::factory()->create([
            'user_id' => $admin->id,
            'type' => 'Mesa',
            'status' => 'Aberta',
            'total_amount' => 30.00
        ]);

        // 3. Make request to the Dashboard
        $response = $this->getJson('/api/dashboard?period=today');

        $response->assertStatus(200);

        // Verify KPIs using standard numeric values
        $response->assertJsonPath('kpis.gross_revenue', 90);
        $response->assertJsonPath('kpis.completed_orders', 1);
        $response->assertJsonPath('kpis.active_orders', 1);
        $response->assertJsonPath('kpis.average_ticket', 90);

        // Verify top products (Curva ABC)
        $response->assertJsonFragment([
            'name' => $product1->name,
            'total_sold' => 2
        ]);

        // Verify payment methods breakdown (Cartao converted to Cartão)
        $response->assertJsonFragment([
            'method' => 'Cartão',
            'total' => 45.0
        ]);
        $response->assertJsonFragment([
            'method' => 'Pix',
            'total' => 45.0
        ]);
    }

    public function test_non_admin_cannot_access_dashboard()
    {
        $waiter = User::factory()->create(['role' => 'waiter', 'is_active' => true]);
        Sanctum::actingAs($waiter);

        $response = $this->getJson('/api/dashboard');
        $response->assertStatus(403);
    }
}
