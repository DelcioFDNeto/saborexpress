import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { toast } from 'sonner';

interface Category {
  id: number;
  name: string;
  description: string;
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

interface CartItem {
  product: Product;
  quantity: number;
  notes: string;
}

export default function Menu() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // Guest Cart State
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('saborexpress_cart');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('saborexpress_cart', JSON.stringify(cart));
  }, [cart]);

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
      const freshCategories = catRes.data.data || catRes.data || [];
      const freshProducts = prodRes.data.data || prodRes.data || [];
      
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

  const addToCart = (product: Product) => {
    const existing = cart.find(item => item.product.id === product.id);
    let newCart;
    if (existing) {
      newCart = cart.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
    } else {
      newCart = [...cart, { product, quantity: 1, notes: '' }];
    }
    setCart(newCart);
    toast.success(`${product.name} adicionado à sua sacola! 🛍️`);
  };

  const filteredProducts = activeCategory
    ? products.filter(p => p.category_id === activeCategory)
    : products;

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + (Number(item.product.price) * item.quantity), 0);

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto font-sans relative pb-24 animate-fade-in">
      
      {/* Banner Superior */}
      <div className="mb-8 bg-gradient-to-r from-sabor-dark to-emerald-950 p-6 md:p-10 rounded-3xl text-white shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-sabor-primary/10 rounded-full blur-[100px] pointer-events-none"></div>
        <span className="text-xs md:text-sm font-bold text-sabor-primary uppercase tracking-widest block mb-2">⭐ CARDÁPIO SELECIONADO</span>
        <h1 className="text-3xl md:text-4xl font-black leading-tight mb-2">Experimente a Amazônia em Cada Garfada</h1>
        <p className="text-gray-300 text-xs md:text-sm max-w-2xl font-light">
          Navegue pelas nossas categorias, adicione pratos exóticos e combos promocionais à sua sacola, e finalize para receber quentinho em sua casa!
        </p>
      </div>
      
      {/* Category Filter */}
      <div className="flex gap-3 mb-8 overflow-x-auto pb-2 scrollbar-none">
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
                  : 'bg-white hover:bg-gray-100 text-gray-600 border border-gray-100 shadow-sm'
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
                    : 'bg-white hover:bg-gray-100 text-gray-600 border border-gray-100 shadow-sm'
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
            <div key={i} className="bg-white rounded-3xl border border-gray-100 overflow-hidden flex flex-col h-[380px] shadow-sm animate-pulse">
              <div className="h-48 bg-gray-200 w-full"></div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="h-6 bg-gray-200 rounded w-2/3 mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-4/5"></div>
                </div>
                <div className="h-10 bg-gray-200 rounded-xl w-full mt-4"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map(product => {
              const isCombo = categories.find(c => c.id === product.category_id)?.name === 'Combos e Promoções';
              return (
                <div 
                  key={product.id} 
                  className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group relative"
                >
                  {/* Badge Exclusivo de Promoção */}
                  {isCombo && (
                    <span className="absolute top-4 left-4 z-10 bg-amber-500 text-white text-[9px] font-black uppercase px-3 py-1 rounded-full shadow-md tracking-wider">
                      PROMOÇÃO 🔥
                    </span>
                  )}

                  <div className="h-48 bg-gray-50 w-full overflow-hidden flex items-center justify-center relative">
                    {product.image_url ? (
                      <img 
                        src={product.image_url} 
                        alt={product.name} 
                        className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500" 
                        loading="lazy"
                      />
                    ) : (
                      <div className="text-sabor-primary bg-sabor-light w-full h-full flex items-center justify-center font-bold">
                        🥣
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
                      <h3 className="font-extrabold text-gray-900 text-base leading-snug group-hover:text-sabor-dark transition-colors">{product.name}</h3>
                      <span className="font-black text-sabor-dark bg-sabor-light px-2.5 py-1 rounded-xl text-sm shrink-0">R$ {Number(product.price).toFixed(2)}</span>
                    </div>
                    <p className="text-gray-500 text-xs mb-5 line-clamp-2 leading-relaxed">{product.description || 'Sem descrição cadastrada.'}</p>
                    
                    <div className="mt-auto">
                      <button 
                        disabled={!product.is_available}
                        onClick={() => addToCart(product)}
                        className="w-full py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all bg-sabor-light text-sabor-dark hover:bg-sabor-primary hover:text-sabor-dark hover:shadow-[0_4px_12px_rgba(74,222,128,0.2)] disabled:opacity-40 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-1.5"
                      >
                        <span>🛒</span> Adicionar à Sacola
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center text-gray-400 mt-16 p-8 border border-dashed border-gray-200 rounded-3xl max-w-md mx-auto">
              <span className="text-4xl block mb-4">🥣</span>
              <h3 className="font-bold text-gray-700 text-base mb-1">Nenhum prato disponível</h3>
              <p className="text-xs">Tente escolher outra categoria de produtos acima.</p>
            </div>
          )}
        </>
      )}

      {/* Floating Cart Indicator Bar for Unauthenticated Users (Guest Flow) */}
      {totalItems > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 max-w-md w-[92%] bg-sabor-dark/95 backdrop-blur-md text-white border border-sabor-primary/30 p-4 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] z-50 flex items-center justify-between gap-4 animate-scale-in">
          <div>
            <p className="text-xs font-bold text-sabor-primary uppercase tracking-wider">Sua Sacola</p>
            <p className="text-sm font-black mt-0.5">
              {totalItems} {totalItems === 1 ? 'item' : 'itens'} <span className="text-gray-400">|</span> R$ {totalPrice.toFixed(2)}
            </p>
          </div>
          
          <button 
            onClick={() => navigate('/delivery')}
            className="px-5 py-2.5 bg-sabor-primary hover:bg-sabor-primary/90 text-sabor-dark font-black text-xs rounded-xl shadow-md transition-all hover:scale-102 flex items-center gap-1 shrink-0"
          >
            Finalizar Pedido 🛵
          </button>
        </div>
      )}

    </div>
  );
}
