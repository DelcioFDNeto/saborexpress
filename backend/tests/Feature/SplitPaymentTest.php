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

class SplitPaymentTest extends TestCase
{
    use RefreshDatabase;

    private User $cashier;
    private Order $order;
    private OrderItem $item1;
    private OrderItem $item2;

    protected function setUp(): void
    {
        parent::setUp();

        $this->cashier = User::factory()->create(['role' => 'cashier', 'is_active' => true]);
        Sanctum::actingAs($this->cashier);

        $category = Category::factory()->create();
        $product1 = Product::factory()->create(['category_id' => $category->id, 'price' => 30.00]);
        $product2 = Product::factory()->create(['category_id' => $category->id, 'price' => 70.00]);

        $this->order = Order::factory()->create([
            'user_id' => $this->cashier->id,
            'type' => 'Mesa',
            'status' => 'Fechamento',
            'total_amount' => 100.00,
            'service_fee' => 10.00, // 10% service fee
            'discount' => 0.00
        ]);

        $this->item1 = OrderItem::factory()->create([
            'order_id' => $this->order->id,
            'product_id' => $product1->id,
            'quantity' => 1,
            'unit_price' => 30.00
        ]);

        $this->item2 = OrderItem::factory()->create([
            'order_id' => $this->order->id,
            'product_id' => $product2->id,
            'quantity' => 1,
            'unit_price' => 70.00
        ]);
    }

    public function test_simulate_split_integral()
    {
        $response = $this->postJson("/api/orders/{$this->order->id}/split", [
            'split_type' => 'integral'
        ]);

        $response->assertStatus(200);
        $response->assertJson([
            'type' => 'integral',
            'installments' => [110.00] // total_amount (100) + service_fee (10) - discount (0)
        ]);
    }

    public function test_simulate_split_equal_for_three_people()
    {
        $response = $this->postJson("/api/orders/{$this->order->id}/split", [
            'split_type' => 'equal',
            'num_people' => 3
        ]);

        $response->assertStatus(200);
        // 110.00 / 3 = 36.6666...
        // 11000 cents: base 3666 cents (36.66) and 2 cents remainder distributed to first two
        $response->assertJson([
            'type' => 'equal',
            'installments' => [36.67, 36.67, 36.66]
        ]);
    }

    public function test_simulate_split_by_items()
    {
        $response = $this->postJson("/api/orders/{$this->order->id}/split", [
            'split_type' => 'items',
            'item_ids' => [$this->item1->id]
        ]);

        $response->assertStatus(200);
        // item 1 total: 30.00 + 10% (3.00) = 33.00
        $response->assertJson([
            'type' => 'items',
            'installments' => [33.00]
        ]);
    }

    public function test_refund_payment_reopens_order_and_creates_cash_movement()
    {
        // 1. Fully pay the order
        $payment = Payment::create([
            'order_id' => $this->order->id,
            'user_id' => $this->cashier->id,
            'amount' => 110.00,
            'method' => 'Pix',
            'status' => 'Pago',
            'paid_at' => now()
        ]);

        $this->order->update(['status' => 'Paga']);

        // 2. Refund the payment
        $response = $this->postJson("/api/payments/{$payment->id}/refund");

        $response->assertStatus(200);
        $response->assertJson(['message' => 'Estorno realizado com sucesso.']);

        // Check payment status is Refunded
        $this->assertDatabaseHas('payments', [
            'id' => $payment->id,
            'status' => 'Estornado'
        ]);

        // Check order is back to Open (or Fechamento/Aberta)
        $this->order->refresh();
        $this->assertEquals('Aberta', $this->order->status);

        // Check CashMovement was created with type Refund
        $this->assertDatabaseHas('cash_movements', [
            'order_id' => $this->order->id,
            'type' => 'Refund',
            'amount' => 110.00
        ]);
    }

    public function test_cannot_refund_payment_twice()
    {
        $payment = Payment::create([
            'order_id' => $this->order->id,
            'user_id' => $this->cashier->id,
            'amount' => 50.00,
            'method' => 'Pix',
            'status' => 'Estornado',
            'paid_at' => now()
        ]);

        $response = $this->postJson("/api/payments/{$payment->id}/refund");
        $response->assertStatus(422);
    }
}
