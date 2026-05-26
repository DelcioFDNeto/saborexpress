<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class DeliveryFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_complete_delivery_flow()
    {
        // 1. Create a category and product
        $category = Category::factory()->create();
        $product = Product::factory()->create([
            'category_id' => $category->id,
            'price' => 35.00,
            'stock_quantity' => 15,
            'is_available' => true
        ]);

        // 1.5 Create and authenticate client user
        $client = User::factory()->create(['role' => 'client', 'is_active' => true]);
        Sanctum::actingAs($client);

        // 2. Place a delivery order (authenticated endpoint)
        $deliveryResponse = $this->postJson('/api/orders/delivery', [
            'customer_name' => 'John Doe',
            'customer_phone' => '91988888888',
            'street' => 'Av. Governador Jose Malcher',
            'number' => '1200',
            'neighborhood' => 'Nazare',
            'cep' => '66055-260',
            'reference' => 'Ao lado do banco',
            'delivery_address' => 'Av. Governador Jose Malcher, 1200 - Nazare',
            'payment_type' => 'delivery',
            'payment_method' => 'Dinheiro',
            'items' => [
                [
                    'product_id' => $product->id,
                    'quantity' => 3,
                    'notes' => 'Sem pimenta'
                ]
            ]
        ]);

        $deliveryResponse->assertStatus(201);
        
        $orderId = $deliveryResponse->json('data.id') ?? $deliveryResponse->json('id');
        $this->assertNotNull($orderId);

        // Assert database has delivery order with structured address details
        $this->assertDatabaseHas('orders', [
            'id' => $orderId,
            'type' => 'Delivery',
            'customer_name' => 'John Doe',
            'cep' => '66055-260',
            'street' => 'Av. Governador Jose Malcher',
            'number' => '1200',
            'neighborhood' => 'Nazare',
            'total_amount' => 105.00
        ]);

        // Assert items were added and stock was decremented
        $this->assertDatabaseHas('order_items', [
            'order_id' => $orderId,
            'product_id' => $product->id,
            'quantity' => 3,
            'unit_price' => 35.00
        ]);

        $this->assertDatabaseHas('products', [
            'id' => $product->id,
            'stock_quantity' => 12
        ]);

        // 3. Track the order (public endpoint - no auth required)
        $trackResponse = $this->getJson("/api/orders/{$orderId}/track");
        $trackResponse->assertStatus(200);
        $this->assertEquals('John Doe', $trackResponse->json('data.customer_name') ?? $trackResponse->json('customer_name'));

        // 4. Create a driver and assign the driver
        $driver = User::factory()->create(['role' => 'delivery', 'is_active' => true]);
        Sanctum::actingAs($driver);

        $assignResponse = $this->patchJson("/api/orders/{$orderId}/assign-driver");
        $assignResponse->assertStatus(200);

        // Check if assigned
        $this->assertDatabaseHas('orders', [
            'id' => $orderId,
            'delivery_driver_id' => $driver->id,
        ]);

        // Transition status to Em Rota
        $statusResponse = $this->putJson("/api/orders/{$orderId}/delivery-status", [
            'delivery_status' => 'Em Rota'
        ]);
        $statusResponse->assertStatus(200);

        // Check if status is now Em Rota
        $this->assertDatabaseHas('orders', [
            'id' => $orderId,
            'delivery_status' => 'Em Rota'
        ]);
    }
}
