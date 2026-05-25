import React, { useEffect, useState } from 'react';
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {    
    // 1. Try to load cached data for instant (0ms) render
    const cachedCategories = localStorage.getItem('saborexpress_categories');
    const cachedProducts = localStorage.getItem('saborexpress_products');
    
    if (cachedCategories && cachedProducts) {
      setCategories(JSON.parse(cachedCategories));
      setProducts(JSON.parse(cachedProducts));
      setLoading(false);
    }

    // 2. Fetch fresh data in the background (SWR pattern)
    Promise.all([
      api.get(`/categories`),
      api.get(`/products`)
    ]).then(([catRes, prodRes]) => {
      const freshCategories = catRes.data.data || [];
      const freshProducts = prodRes.data.data || [];
      
      setCategories(freshCategories);
      setProducts(freshProducts);
      setLoading(false);
      
      // Update cache
      localStorage.setItem('saborexpress_categories', JSON.stringify(freshCategories));
      localStorage.setItem('saborexpress_products', JSON.stringify(freshProducts));
    }).catch(err => {
      console.error('Error fetching fresh menu data:', err);
      setLoading(false);
    });
  }, []);

  const filteredProducts = activeCategory
    ? products.filter(p => p.category_id === activeCategory)
    : products;

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto font-sans">
      <div className="mb-8">
        <span className="text-xs md:text-sm font-bold text-sabor-dark uppercase tracking-wider block mb-2">😋 Nossas Delícias</span>
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight">Cardápio Oficial</h1>
      </div>
      
      {/* Category Filter */}
      <div className="flex gap-3 mb-8 overflow-x-auto pb-2 scrollbar-thin">
        {loading && categories.length === 0 ? (
          // Skeleton pills
          <>
            <div className="h-10 w-20 bg-gray-200 rounded-full animate-pulse shrink-0"></div>
            <div className="h-10 w-28 bg-gray-200 rounded-full animate-pulse shrink-0"></div>
            <div className="h-10 w-32 bg-gray-200 rounded-full animate-pulse shrink-0"></div>
            <div className="h-10 w-24 bg-gray-200 rounded-full animate-pulse shrink-0"></div>
          </>
        ) : (
          <>
            <button 
              onClick={() => setActiveCategory(null)}
              className={`px-5 py-2.5 rounded-full font-bold text-sm shrink-0 transition-all ${
                activeCategory === null 
                  ? 'bg-sabor-primary text-sabor-dark shadow-[0_4px_12px_rgba(74,222,128,0.25)]' 
                  : 'bg-white hover:bg-gray-100 text-gray-600 border border-gray-100'
              }`}
            >
              Todos os Pratos
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-5 py-2.5 rounded-full font-bold text-sm shrink-0 transition-all ${
                  activeCategory === cat.id 
                    ? 'bg-sabor-primary text-sabor-dark shadow-[0_4px_12px_rgba(74,222,128,0.25)]' 
                    : 'bg-white hover:bg-gray-100 text-gray-600 border border-gray-100'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </>
        )}
      </div>

      {/* Product List / Skeletons */}
      {loading && products.length === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-3xl border border-gray-100 overflow-hidden flex flex-col h-[380px] shadow-sm">
              <div className="h-48 bg-gray-200 animate-pulse w-full"></div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="h-6 bg-gray-200 rounded animate-pulse w-2/3 mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-4/5"></div>
                </div>
                <div className="h-10 bg-gray-200 rounded-xl animate-pulse w-full mt-4"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map(product => (
              <div key={product.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group">
                <div className="h-48 bg-gray-50 w-full overflow-hidden flex items-center justify-center relative">
                  {product.image_url ? (
                    <img 
                      src={product.image_url} 
                      alt={product.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      loading="lazy"
                    />
                  ) : (
                    <div className="text-sabor-primary bg-sabor-light w-full h-full flex items-center justify-center">
                      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                      </svg>
                    </div>
                  )}
                  {!product.is_available && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-xs flex items-center justify-center">
                      <span className="bg-rose-100 text-rose-700 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-sm">
                        Esgotado
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-3 gap-2">
                    <h3 className="font-extrabold text-gray-900 text-lg leading-snug group-hover:text-sabor-dark transition-colors">{product.name}</h3>
                    <span className="font-black text-sabor-dark bg-sabor-light px-2.5 py-1 rounded-xl text-sm shrink-0">R$ {Number(product.price).toFixed(2)}</span>
                  </div>
                  <p className="text-gray-500 text-sm mb-6 line-clamp-2 leading-relaxed">{product.description || 'Sem descrição cadastrada.'}</p>
                  
                  <div className="mt-auto">
                    <button 
                      disabled={!product.is_available}
                      className="w-full py-3 rounded-2xl text-sm font-bold transition-all bg-sabor-light text-sabor-dark hover:bg-sabor-primary hover:shadow-[0_4px_12px_rgba(74,222,128,0.2)] disabled:opacity-40 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed disabled:shadow-none"
                    >
                      Adicionar ao Pedido
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center text-gray-400 mt-16 p-8 border border-dashed border-gray-200 rounded-3xl max-w-md mx-auto">
              <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <h3 className="font-bold text-gray-700 text-lg mb-1">Nenhum prato disponível</h3>
              <p className="text-sm">Tente escolher outra categoria de produtos acima.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
