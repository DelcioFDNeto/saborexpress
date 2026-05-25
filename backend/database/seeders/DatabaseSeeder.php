<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

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
            User::updateOrCreate(
                ['email' => $email],
                [
                    'name' => ucfirst($role).' User',
                    'password' => bcrypt('password'),
                    'role' => $role,
                    'is_active' => true,
                ]
            );
        }

        $this->call([
            TableSeeder::class,
            CategorySeeder::class,
            ProductSeeder::class,
        ]);
    }
}
