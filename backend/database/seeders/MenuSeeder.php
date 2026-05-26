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

        // 1. Bebidas Regionais e Exóticas
        $bebidas = Category::create(['name' => 'Bebidas Regionais', 'description' => 'Sucos refrescantes, caipirinhas com tremor e elixires sagrados da Amazônia.']);
        
        Product::create([
            'category_id' => $bebidas->id, 
            'name' => 'Açaí Grosso (Na Tigela)', 
            'description' => 'Açaí puro batido na hora, acompanha farinha d\'água ou tapioca.', 
            'price' => 25.00,
            'image_url' => 'https://images.unsplash.com/photo-1590301157890-4810ed352733?q=80&w=600&auto=format&fit=crop'
        ]);
        Product::create([
            'category_id' => $bebidas->id, 
            'name' => 'Elixir da Floresta (Energético Natural)', 
            'description' => 'Bebida energética natural batida com polpa de açaí grosso, xarope de guaraná da Amazônia e gotas de jambu treme-treme.', 
            'price' => 19.90,
            'image_url' => 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?q=80&w=600&auto=format&fit=crop'
        ]);
        Product::create([
            'category_id' => $bebidas->id, 
            'name' => 'Caipirinha Treme-Treme de Bacuri', 
            'description' => 'Cachaça artesanal de alambique, polpa cremosa de bacuri e borda da cuia banhada com flor de jambu treme.', 
            'price' => 24.90,
            'image_url' => 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=600&auto=format&fit=crop'
        ]);
        Product::create([
            'category_id' => $bebidas->id, 
            'name' => 'Sinfonia de Taperebá com Mel de Jataí', 
            'description' => 'Refresco gelado de taperebá (cajá) adoçado com mel silvestre de abelhas jataí sem ferrão.', 
            'price' => 16.50,
            'image_url' => 'https://images.unsplash.com/photo-1536935338788-846bb9981813?q=80&w=600&auto=format&fit=crop'
        ]);
        Product::create([
            'category_id' => $bebidas->id, 
            'name' => 'Lágrimas de Iara (Smoothie de Cacau)', 
            'description' => 'Delicioso smoothie cremoso de cacau amazônico puro batido com cupuaçu refrescante e hortelã.', 
            'price' => 18.00,
            'image_url' => 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?q=80&w=600&auto=format&fit=crop'
        ]);
        Product::create([
            'category_id' => $bebidas->id, 
            'name' => 'Cerveja Cerpa Export (Long Neck)', 
            'description' => 'Cerveja tradicional e geladíssima do Pará.', 
            'price' => 12.00,
            'image_url' => 'https://images.unsplash.com/photo-1608270586620-248524c67de9?q=80&w=600&auto=format&fit=crop'
        ]);

        // 2. Petiscos & Entradas Criativas
        $petiscos = Category::create(['name' => 'Petiscos e Entradas', 'description' => 'Delícias crocantes e petiscos regionais perfeitos para abrir o apetite.']);
        
        Product::create([
            'category_id' => $petiscos->id, 
            'name' => 'Unha de Caranguejo Imperial', 
            'description' => 'Massa crocante por fora e recheio cremoso e farto de carne de caranguejo selecionada com ervas finas da floresta (Unidade).', 
            'price' => 16.90,
            'image_url' => 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?q=80&w=600&auto=format&fit=crop'
        ]);
        Product::create([
            'category_id' => $petiscos->id, 
            'name' => 'Bolinho de Piracuí das Águas Doces', 
            'description' => 'Porção com 6 unidades de bolinho crocante de farinha de peixe salgado defumado com especiarias e vinagrete regional.', 
            'price' => 29.90,
            'image_url' => 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?q=80&w=600&auto=format&fit=crop'
        ]);
        Product::create([
            'category_id' => $petiscos->id, 
            'name' => 'Isca de Filhote ao Molho Tártaro de Jambu', 
            'description' => 'Iscas empanadas na panko do nobre peixe amazônico Filhote. Acompanha molho tártaro artesanal com folhas de jambu treme-treme.', 
            'price' => 59.90,
            'image_url' => 'https://images.unsplash.com/photo-1562967914-6c8273929e2d?q=80&w=600&auto=format&fit=crop'
        ]);
        Product::create([
            'category_id' => $petiscos->id, 
            'name' => 'Casquinha de Caranguejo da Ilha de Marajó', 
            'description' => 'Casquinha recheada com carne de caranguejo desfiada, refogada no leite de coco e gratinada com queijo de búfala marajoara.', 
            'price' => 26.00,
            'image_url' => 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?q=80&w=600&auto=format&fit=crop'
        ]);

        // 3. Pratos Principais Exóticos
        $principais = Category::create(['name' => 'Pratos Principais', 'description' => 'A verdadeira gastronomia de raiz e alta culinária amazônica paraense.']);
        
        Product::create([
            'category_id' => $principais->id, 
            'name' => 'Tacacá Vulcânico com Camarões Gigantes', 
            'description' => 'Caldo quente de tucupi fervente, goma de mandioca artesanal, folhas generosas de jambu vulcânico treme-treme e camarões rosa gigantes grelhados. (Cuia Grande).', 
            'price' => 38.00,
            'image_url' => 'https://images.unsplash.com/photo-1547592180-85f173990554?q=80&w=600&auto=format&fit=crop'
        ]);
        Product::create([
            'category_id' => $principais->id, 
            'name' => 'Maniçoba Celestial do Pajé', 
            'description' => 'A famosa feijoada paraense. Folha da mandioca brava cozida pacientemente por 7 dias com carnes suínas defumadas finas. Acompanha arroz branco e farinha de Bragança.', 
            'price' => 48.00,
            'image_url' => 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=600&auto=format&fit=crop'
        ]);
        Product::create([
            'category_id' => $principais->id, 
            'name' => 'Pato no Tucupi Real', 
            'description' => 'Tenro pato assado lentamente e cozido em tucupi perfumado com folhas de jambu treme-treme e chicória. Acompanha arroz branco de alho.', 
            'price' => 69.90,
            'image_url' => 'https://images.unsplash.com/photo-1516685018646-549198525c1b?q=80&w=600&auto=format&fit=crop'
        ]);
        Product::create([
            'category_id' => $principais->id, 
            'name' => 'Pirarucu de Casaca com Néctar de Taperebá', 
            'description' => 'Lascas de Pirarucu defumado salteadas, banana da terra frita, passas, azeitonas, batata palha e farinha de Uarini hidratada, regado com emulsão de taperebá.', 
            'price' => 54.00,
            'image_url' => 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?q=80&w=600&auto=format&fit=crop'
        ]);
        Product::create([
            'category_id' => $principais->id, 
            'name' => 'Filhote Encantado em Crosta de Castanha', 
            'description' => 'Lombo de Filhote assado em crosta crocante de castanha-do-Pará. Acompanha risoto cremoso de arroz arbóreo com folhas frescas de jambu e vinagrete regional.', 
            'price' => 89.90,
            'image_url' => 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=600&auto=format&fit=crop'
        ]);
        Product::create([
            'category_id' => $principais->id, 
            'name' => 'Risoto da Tribo com Jambu e Pirarucu', 
            'description' => 'Arroz arbóreo cozido lentamente no caldo de tucupi com folhas frescas de jambu e lascas de pirarucu defumado artesanalmente.', 
            'price' => 62.00,
            'image_url' => 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=600&auto=format&fit=crop'
        ]);

        // 4. Sobremesas dos Deuses da Floresta
        $sobremesas = Category::create(['name' => 'Sobremesas', 'description' => 'Adoce o seu paladar com a riqueza de cremes, manjares e sorvetes Cairu.']);
        
        Product::create([
            'category_id' => $sobremesas->id, 
            'name' => 'O Segredo da Floresta (Mousse Trio)', 
            'description' => 'Mousse trufado de cacau amazônico 70% com recheio aveludado de creme de cupuaçu e farofa crocante de castanha-do-Pará.', 
            'price' => 19.90,
            'image_url' => 'https://images.unsplash.com/photo-1488477181946-6428a0291777?q=80&w=600&auto=format&fit=crop'
        ]);
        Product::create([
            'category_id' => $sobremesas->id, 
            'name' => 'Manjar de Pupunha com Caramelo de Jambu', 
            'description' => 'Manjar cremoso de pupunha cozida com leite de coco fresco, regado com um caramelo translúcido de flor de jambu.', 
            'price' => 17.50,
            'image_url' => 'https://images.unsplash.com/photo-1528975604071-b4dc52a2d18c?q=80&w=600&auto=format&fit=crop'
        ]);
        Product::create([
            'category_id' => $sobremesas->id, 
            'name' => 'Sorvete Cairu - Sabor Mestiço (Tapioca + Açaí)', 
            'description' => 'Taça com 2 bolas do premiado e famoso sorvete de açaí com tapioca.', 
            'price' => 20.00,
            'image_url' => 'https://images.unsplash.com/photo-1560008511-11c63416e52d?q=80&w=600&auto=format&fit=crop'
        ]);
        Product::create([
            'category_id' => $sobremesas->id, 
            'name' => 'Suspiro de Iara com Creme de Bacuri', 
            'description' => 'Merengue assado e leve recheado com compota cremosa artesanal de bacuri e pérolas de tapioca hidratadas.', 
            'price' => 18.90,
            'image_url' => 'https://images.unsplash.com/photo-1587314168485-3236d6710814?q=80&w=600&auto=format&fit=crop'
        ]);

        // 5. Combos & Promoções Exclusivas
        $combos = Category::create(['name' => 'Combos e Promoções', 'description' => 'Aproveite nossas seleções especiais e combos promocionais com descontos irresistíveis.']);
        
        Product::create([
            'category_id' => $combos->id, 
            'name' => 'Combo Pajé Guerreiro (Tacacá + Cerpa)', 
            'description' => 'Super promoção de happy hour: 1 Tacacá Vulcânico com Camarões Gigantes + 1 Cerveja Cerpa Export geladíssima por um preço especial.', 
            'price' => 45.00, // 38 + 12 = 50 (10% desconto)
            'image_url' => 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=600&auto=format&fit=crop'
        ]);
        Product::create([
            'category_id' => $combos->id, 
            'name' => 'Banquete da Tribo (Serve 2 Pessoas)', 
            'description' => 'Banquete completo: 1 Isca de Filhote Crocante (Entrada) + 2 Maniçobas Celestiais do Pajé (Principal) + 1 O Segredo da Floresta para compartilhar!', 
            'price' => 129.90, // 59.90 + 96 + 19.90 = 175.80 (26% de desconto!)
            'image_url' => 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=600&auto=format&fit=crop'
        ]);
        Product::create([
            'category_id' => $combos->id, 
            'name' => 'Combo Casal Amazônico', 
            'description' => 'Dois Tacacás Vulcânicos com Camarões Gigantes + 1 Taça de Sorvete Cairu Mestiço para finalizar a noite perfeita de forma doce.', 
            'price' => 79.90, // 38*2 + 20 = 96 (17% de desconto)
            'image_url' => 'https://images.unsplash.com/photo-1488477181946-6428a0291777?q=80&w=600&auto=format&fit=crop'
        ]);
        Product::create([
            'category_id' => $combos->id, 
            'name' => 'Promoção Treme e Adoça', 
            'description' => 'O clássico de Belém: 1 Tacacá Vulcânico Individual + 1 Creme Manjar de Pupunha com Caramelo de Jambu.', 
            'price' => 49.00, // 38 + 17.50 = 55.50 (12% de desconto)
            'image_url' => 'https://images.unsplash.com/photo-1547592180-85f173990554?q=80&w=600&auto=format&fit=crop'
        ]);
    }
}
