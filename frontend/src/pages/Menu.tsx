import { useEffect, useState } from 'react';
import { api } from '../lib/api';

interface Category {
  id: number;
  name: string;
}

interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  category_id: number;
  is_available: boolean;
  image_url: string | null;
}

export default function Menu() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);

  useEffect(() => {
    api.get('/categories').then(res => {
      setCategories(res.data.data || []);
    }).catch(err => console.error(err));

    api.get('/products').then(res => {
      setProducts(res.data.data || []);
    }).catch(err => console.error(err));
  }, []);

  const filteredProducts = activeCategory
    ? products.filter(p => p.category_id === activeCategory)
    : products;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Cardápio</h1>
      
      <div className="flex gap-4 mb-8 overflow-x-auto">
        <button 
          onClick={() => setActiveCategory(null)}
          className={`px-4 py-2 rounded-full font-medium ${activeCategory === null ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}
        >
          Todos
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-4 py-2 rounded-full font-medium ${activeCategory === cat.id ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map(product => (
          <div key={product.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
            <div className="h-48 bg-gray-100 w-full overflow-hidden flex items-center justify-center relative">
              {product.image_url ? (
                <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="text-emerald-200">
                  <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                </div>
              )}
              {!product.is_available && (
                <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center">
                  <span className="bg-rose-100 text-rose-700 px-3 py-1 rounded-full text-sm font-bold uppercase tracking-wider">
                    Esgotado
                  </span>
                </div>
              )}
            </div>
            <div className="p-5 flex flex-col flex-1">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-gray-900 text-lg leading-tight">{product.name}</h3>
                <span className="font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">R$ {Number(product.price).toFixed(2)}</span>
              </div>
              <p className="text-gray-500 text-sm mb-4 line-clamp-2">{product.description || 'Sem descrição.'}</p>
              
              <div className="mt-auto">
                <button 
                  disabled={!product.is_available}
                  className="w-full py-2.5 rounded-xl text-sm font-medium transition-colors bg-emerald-50 text-emerald-700 hover:bg-emerald-100 disabled:opacity-50 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  Adicionar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center text-muted-foreground mt-12">
          Nenhum produto encontrado.
        </div>
      )}
    </div>
  );
}
