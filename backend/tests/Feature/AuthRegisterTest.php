<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthRegisterTest extends TestCase
{
    use RefreshDatabase;

    public function test_register_creates_client_user_and_returns_token(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Cliente Teste',
            'email' => 'cliente@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('token_type', 'Bearer')
            ->assertJsonPath('user.email', 'cliente@example.com')
            ->assertJsonStructure(['access_token']);

        $this->assertDatabaseHas('users', [
            'email' => 'cliente@example.com',
            'role' => 'client',
        ]);

        $this->assertTrue(User::where('email', 'cliente@example.com')->value('is_active'));
    }

    public function test_register_requires_password_confirmation(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Cliente Teste',
            'email' => 'cliente@example.com',
            'password' => 'password123',
        ]);

        $response
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['password']);
    }
}
