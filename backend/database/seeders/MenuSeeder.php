<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;

class MenuSeeder extends Seeder
{
    public function run(): void
    {
        // Limpar os produtos e categorias existentes para garantir um menu limpo
        Product::truncate();
        Category::truncate();

        // 1. Bebidas Regionais
        $bebidas = Category::create(['name' => 'Bebidas Regionais', 'description' => 'Sucos, refrescos e bebidas típicas da Amazônia.']);
        Product::create([
            'category_id' => $bebidas->id, 
            'name' => 'Açaí Grosso (Na Tigela)', 
            'description' => 'Açaí puro batido na hora, acompanha farinha d\'água ou tapioca.', 
            'price' => 25.00,
            'image_url' => 'https://images.unsplash.com/photo-1590301157890-4810ed352733?q=80&w=600&auto=format&fit=crop'
        ]);
        Product::create([
            'category_id' => $bebidas->id, 
            'name' => 'Suco de Cupuaçu', 
            'description' => 'Jarra 1L de suco natural de cupuaçu bem gelado.', 
            'price' => 18.00,
            'image_url' => 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?q=80&w=600&auto=format&fit=crop'
        ]);
        Product::create([
            'category_id' => $bebidas->id, 
            'name' => 'Suco de Bacuri', 
            'description' => 'Jarra 1L do saboroso e exótico fruto do bacurizeiro.', 
            'price' => 20.00,
            'image_url' => 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=600&auto=format&fit=crop'
        ]);
        Product::create([
            'category_id' => $bebidas->id, 
            'name' => 'Cerveja Cerpa Export (Long Neck)', 
            'description' => 'Cerveja tradicional e geladíssima do Pará.', 
            'price' => 12.00,
            'image_url' => 'https://images.unsplash.com/photo-1608270586620-248524c67de9?q=80&w=600&auto=format&fit=crop'
        ]);
        Product::create([
            'category_id' => $bebidas->id, 
            'name' => 'Guaraná Cerpa', 
            'description' => 'Lata 350ml.', 
            'price' => 6.00,
            'image_url' => 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=600&auto=format&fit=crop'
        ]);

        // 2. Petiscos & Entradas
        $petiscos = Category::create(['name' => 'Petiscos e Entradas', 'description' => 'Delícias perfeitas para abrir o apetite.']);
        Product::create([
            'category_id' => $petiscos->id, 
            'name' => 'Unha de Caranguejo', 
            'description' => 'Massa crocante por fora e recheio cremoso e farto de carne de caranguejo (Unidade).', 
            'price' => 15.00,
            'image_url' => 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?q=80&w=600&auto=format&fit=crop'
        ]);
        Product::create([
            'category_id' => $petiscos->id, 
            'name' => 'Bolinho de Piracuí', 
            'description' => 'Porção com 6 unidades de bolinho de farinha de peixe salgado.', 
            'price' => 28.00,
            'image_url' => 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?q=80&w=600&auto=format&fit=crop'
        ]);
        Product::create([
            'category_id' => $petiscos->id, 
            'name' => 'Isca de Filhote Crocante', 
            'description' => 'Iscas empanadas do nobre peixe amazônico. Acompanha molho tártaro de tucupi.', 
            'price' => 55.00,
            'image_url' => 'https://images.unsplash.com/photo-1562967914-6c8273929e2d?q=80&w=600&auto=format&fit=crop'
        ]);
        Product::create([
            'category_id' => $petiscos->id, 
            'name' => 'Casquinha de Caranguejo', 
            'description' => 'Casquinha recheada com carne de caranguejo refogada e gratinada.', 
            'price' => 22.00,
            'image_url' => 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?q=80&w=600&auto=format&fit=crop'
        ]);

        // 3. Pratos Principais
        $principais = Category::create(['name' => 'Pratos Principais', 'description' => 'A verdadeira gastronomia de raiz do Pará.']);
        Product::create([
            'category_id' => $principais->id, 
            'name' => 'Tacacá Tradicional', 
            'description' => 'Caldo quente de tucupi, goma de tapioca, jambu e camarão seco. (Cuia Grande).', 
            'price' => 30.00,
            'image_url' => 'https://images.unsplash.com/photo-1547592180-85f173990554?q=80&w=600&auto=format&fit=crop'
        ]);
        Product::create([
            'category_id' => $principais->id, 
            'name' => 'Maniçoba (A Feijoada Paraense)', 
            'description' => 'Folha da mandioca brava cozida por 7 dias com carnes suínas defumadas. Acompanha arroz e farinha.', 
            'price' => 45.00,
            'image_url' => 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=600&auto=format&fit=crop'
        ]);
        Product::create([
            'category_id' => $principais->id, 
            'name' => 'Pato no Tucupi', 
            'description' => 'Pato assado e depois cozido no tucupi com folhas de jambu. Acompanha arroz branco.', 
            'price' => 65.00,
            'image_url' => 'https://images.unsplash.com/photo-1516685018646-549198525c1b?q=80&w=600&auto=format&fit=crop'
        ]);
        Product::create([
            'category_id' => $principais->id, 
            'name' => 'Vatapá Paraense', 
            'description' => 'Creme de camarão sem amendoim ou azeite de dendê (estilo paraense). Acompanha arroz.', 
            'price' => 35.00,
            'image_url' => 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?q=80&w=600&auto=format&fit=crop'
        ]);
        Product::create([
            'category_id' => $principais->id, 
            'name' => 'Filhote na Brasa', 
            'description' => 'Posta de Filhote assada na brasa. Acompanha arroz de jambu e vinagrete.', 
            'price' => 85.00,
            'image_url' => 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=600&auto=format&fit=crop'
        ]);
        Product::create([
            'category_id' => $principais->id, 
            'name' => 'Chapa Mista Paraense', 
            'description' => 'Carne de sol, calabresa, queijo coalho e macaxeira frita. Serve 3 pessoas.', 
            'price' => 95.00,
            'image_url' => 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=600&auto=format&fit=crop'
        ]);

        // 4. Sobremesas
        $sobremesas = Category::create(['name' => 'Sobremesas', 'description' => 'Adoce o seu dia com sabores da nossa floresta.']);
        Product::create([
            'category_id' => $sobremesas->id, 
            'name' => 'Creme de Cupuaçu', 
            'description' => 'Creme gelado e aerado de polpa de cupuaçu.', 
            'price' => 15.00,
            'image_url' => 'https://images.unsplash.com/photo-1488477181946-6428a0291777?q=80&w=600&auto=format&fit=crop'
        ]);
        Product::create([
            'category_id' => $sobremesas->id, 
            'name' => 'Sorvete Cairu - Sabor Mestiço', 
            'description' => 'Taça com 2 bolas do famoso sorvete de açaí com tapioca.', 
            'price' => 20.00,
            'image_url' => 'https://images.unsplash.com/photo-1560008511-11c63416e52d?q=80&w=600&auto=format&fit=crop'
        ]);
        Product::create([
            'category_id' => $sobremesas->id, 
            'name' => 'Pudim de Tapioca', 
            'description' => 'Pudim cremoso feito com farinha de tapioca e calda de caramelo.', 
            'price' => 16.00,
            'image_url' => 'https://images.unsplash.com/photo-1528975604071-b4dc52a2d18c?q=80&w=600&auto=format&fit=crop'
        ]);
        Product::create([
            'category_id' => $sobremesas->id, 
            'name' => 'Doce de Bacuri', 
            'description' => 'Doce em compota de bacuri.', 
            'price' => 12.00,
            'image_url' => 'https://images.unsplash.com/photo-1587314168485-3236d6710814?q=80&w=600&auto=format&fit=crop'
        ]);
    }
}
