<?php

namespace Database\Factories;

use App\Models\Order;
use App\Models\Table;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class OrderFactory extends Factory
{
    protected $model = Order::class;

    public function definition(): array
    {
        return [
            'table_id' => null,
            'user_id' => User::factory(),
            'status' => 'Aberta',
            'type' => 'Mesa',
            'customer_name' => $this->faker->name(),
            'customer_phone' => $this->faker->phoneNumber(),
            'total_amount' => 0.00,
            'discount' => 0.00,
            'service_fee' => 0.00,
        ];
    }

    public function delivery(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'Delivery',
            'delivery_status' => 'Aguardando',
            'street' => $this->faker->streetName(),
            'number' => $this->faker->buildingNumber(),
            'neighborhood' => $this->faker->word(),
            'cep' => '66035-100',
            'delivery_address' => $this->faker->address(),
        ]);
    }
}
