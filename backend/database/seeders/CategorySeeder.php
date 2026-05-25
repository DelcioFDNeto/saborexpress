<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            ['name' => 'Entradas', 'description' => 'Porções e itens para iniciar o atendimento.'],
            ['name' => 'Pizzas', 'description' => 'Pizzas tradicionais e especiais.'],
            ['name' => 'Lanches', 'description' => 'Hambúrgueres e sanduíches.'],
            ['name' => 'Bebidas', 'description' => 'Bebidas frias e sucos.'],
            ['name' => 'Sobremesas', 'description' => 'Doces e sobremesas da casa.'],
        ];

        foreach ($categories as $category) {
            Category::updateOrCreate(
                ['name' => $category['name']],
                $category
            );
        }
    }
}
