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

class PaymentsTest extends TestCase
{
    use RefreshDatabase;

    public function test_cashier_and_payments_flow()
    {
        // 1. Create cashier user
        $cashier = User::factory()->create(['role' => 'cashier', 'is_active' => true]);
        Sanctum::actingAs($cashier);

        // 2. Create and prepare an open order with items
        $table = Table::factory()->create(['status' => 'Ocupada']);
        $order = Order::factory()->create([
            'table_id' => $table->id,
            'status' => 'Fechamento',
            'type' => 'Mesa',
            'total_amount' => 150.00
        ]);

        // 3. Make a partial payment (Valor Avulso) of R$ 100 via PIX
        $payment1Response = $this->postJson("/api/orders/{$order->id}/pay", [
            'amount' => 100.00,
            'method' => 'Pix'
        ]);

        $payment1Response->assertStatus(200);

        // Order should remain open/Fechamento since there is a R$ 50 balance
        $order->refresh();
        $this->assertEquals('Fechamento', $order->status);

        // 4. Pay the remaining R$ 50 via Dinheiro
        $payment2Response = $this->postJson("/api/orders/{$order->id}/pay", [
            'amount' => 50.00,
            'method' => 'Dinheiro'
        ]);

        $payment2Response->assertStatus(200);

        // Order should transition to Paga and Table should be free (or Clean)
        $order->refresh();
        $this->assertEquals('Paga', $order->status);

        // 5. Register manual Cash Movements (Suprimento and Sangria)
        // Suprimento
        $suprimentoResponse = $this->postJson('/api/cash/movements', [
            'type' => 'Suprimento',
            'amount' => 200.00,
            'description' => 'Adicionar troco inicial'
        ]);
        $suprimentoResponse->assertStatus(201);

        // Sangria
        $sangriaResponse = $this->postJson('/api/cash/movements', [
            'type' => 'Sangria',
            'amount' => 80.00,
            'description' => 'Sangria de segurança'
        ]);
        $sangriaResponse->assertStatus(201);

        // 6. Access Cash Closing Report
        $reportResponse = $this->getJson('/api/cash/report');
        $reportResponse->assertStatus(200);

        // PIX should be 100, Dinheiro should be 50, Suprimento should be 200, Sangria should be 80
        $data = $reportResponse->json('data') ?? $reportResponse->json();
        $this->assertEquals(100.00, (float) $data['methods']['pix']);
        $this->assertEquals(50.00, (float) $data['methods']['cash']);
        $this->assertEquals(200.00, (float) $data['suprimentos']);
        $this->assertEquals(80.00, (float) $data['sangrias']);

        // Drawer balance = cash_payments (50) + suprimentos (200) - sangrias (80) = 170
        $this->assertEquals(170.00, (float) $data['drawer_cash_balance']);
    }
}
