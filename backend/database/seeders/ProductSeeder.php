<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $productsByCategory = [
            'Entradas' => [
                ['name' => 'Batata Frita', 'description' => 'Porção de batata frita crocante.', 'price' => 24.90, 'stock_quantity' => null],
                ['name' => 'Bruschetta', 'description' => 'Pão italiano com tomate, manjericão e azeite.', 'price' => 21.90, 'stock_quantity' => null],
            ],
            'Pizzas' => [
                ['name' => 'Pizza Margherita', 'description' => 'Molho de tomate, muçarela, tomate e manjericão.', 'price' => 48.90, 'stock_quantity' => null],
                ['name' => 'Pizza Calabresa', 'description' => 'Molho de tomate, muçarela, calabresa e cebola.', 'price' => 52.90, 'stock_quantity' => null],
                ['name' => 'Pizza Portuguesa', 'description' => 'Muçarela, presunto, ovo, cebola, pimentão e azeitona.', 'price' => 56.90, 'stock_quantity' => null],
            ],
            'Lanches' => [
                ['name' => 'Burger da Casa', 'description' => 'Hambúrguer artesanal, queijo, alface, tomate e molho da casa.', 'price' => 34.90, 'stock_quantity' => null],
                ['name' => 'Chicken Sandwich', 'description' => 'Frango empanado, queijo, salada e maionese temperada.', 'price' => 31.90, 'stock_quantity' => null],
            ],
            'Bebidas' => [
                ['name' => 'Refrigerante Lata', 'description' => 'Lata 350 ml.', 'price' => 7.90, 'stock_quantity' => 48],
                ['name' => 'Suco Natural', 'description' => 'Suco natural do dia.', 'price' => 11.90, 'stock_quantity' => 25],
                ['name' => 'Água Mineral', 'description' => 'Garrafa 500 ml.', 'price' => 5.90, 'stock_quantity' => 60],
            ],
            'Sobremesas' => [
                ['name' => 'Pudim', 'description' => 'Pudim de leite condensado.', 'price' => 14.90, 'stock_quantity' => 18],
                ['name' => 'Brownie com Sorvete', 'description' => 'Brownie quente com sorvete de creme.', 'price' => 22.90, 'stock_quantity' => 12],
            ],
        ];

        foreach ($productsByCategory as $categoryName => $products) {
            $category = Category::where('name', $categoryName)->firstOrFail();

            foreach ($products as $product) {
                Product::updateOrCreate(
                    [
                        'category_id' => $category->id,
                        'name' => $product['name'],
                    ],
                    [
                        'description' => $product['description'],
                        'price' => $product['price'],
                        'is_available' => true,
                        'stock_quantity' => $product['stock_quantity'],
                    ]
                );
            }
        }
    }
}
