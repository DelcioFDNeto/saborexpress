<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $roles = [
            'administrator' => 'admin@saborexpress.com',
            'waiter' => 'waiter@saborexpress.com',
            'kitchen' => 'kitchen@saborexpress.com',
            'cashier' => 'cashier@saborexpress.com',
            'delivery' => 'delivery@saborexpress.com',
            'client' => 'client@saborexpress.com',
        ];

        foreach ($roles as $role => $email) {
            \App\Models\User::factory()->create([
                'name' => ucfirst($role) . ' User',
                'email' => $email,
                'password' => bcrypt('password'),
                'role' => $role,
            ]);
        }

        $this->call([
            TableSeeder::class,
            MenuSeeder::class,
        ]);
    }
}
