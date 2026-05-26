<?php

namespace Tests\Feature;

use App\Models\Table;
use App\Models\TableReservation;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ReservationTest extends TestCase
{
    use RefreshDatabase;

    private User $client;
    private Table $table;

    protected function setUp(): void
    {
        parent::setUp();

        $this->client = User::factory()->create(['role' => 'client', 'is_active' => true]);
        $this->table = Table::factory()->create(['number' => '10', 'capacity' => 4, 'status' => 'Livre']);
    }

    public function test_client_can_create_reservation()
    {
        Sanctum::actingAs($this->client);

        $response = $this->postJson('/api/client/reservations', [
            'table_id' => $this->table->id,
            'reservation_date' => now()->addDays(2)->format('Y-m-d H:i:s'),
            'guests' => 3,
            'special_requests' => 'Mesa perto da janela'
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('table_reservations', [
            'table_id' => $this->table->id,
            'user_id' => $this->client->id,
            'guests' => 3,
            'status' => 'Confirmed'
        ]);
    }

    public function test_client_can_list_only_their_reservations()
    {
        $otherClient = User::factory()->create(['role' => 'client']);
        
        // Reservation for our client
        $res1 = TableReservation::create([
            'table_id' => $this->table->id,
            'user_id' => $this->client->id,
            'reservation_date' => now()->addDays(1),
            'guests' => 2,
            'status' => 'Confirmed'
        ]);

        // Reservation for another client
        $res2 = TableReservation::create([
            'table_id' => $this->table->id,
            'user_id' => $otherClient->id,
            'reservation_date' => now()->addDays(2),
            'guests' => 4,
            'status' => 'Confirmed'
        ]);

        Sanctum::actingAs($this->client);
        $response = $this->getJson('/api/client/reservations');

        $response->assertStatus(200);
        $response->assertJsonCount(1);
        $response->assertJsonPath('0.id', $res1->id);
    }

    public function test_client_can_cancel_their_reservation()
    {
        $reservation = TableReservation::create([
            'table_id' => $this->table->id,
            'user_id' => $this->client->id,
            'reservation_date' => now()->addDays(1),
            'guests' => 2,
            'status' => 'Confirmed'
        ]);

        Sanctum::actingAs($this->client);
        $response = $this->deleteJson("/api/client/reservations/{$reservation->id}");

        $response->assertStatus(200);
        $this->assertDatabaseHas('table_reservations', [
            'id' => $reservation->id,
            'status' => 'Cancelled'
        ]);
    }
}
