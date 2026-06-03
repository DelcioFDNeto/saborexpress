import { useEffect, useState, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../lib/api';
import { toast } from 'sonner';
import { AuthContext } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import type { CartItem, CartProduct } from '../contexts/CartContext';

interface Category {
  id: number;
  name: string;
  description: string;
}

interface Product extends CartProduct {
  id: number;
  name: string;
  description: string;
  price: string;
  category_id: number;
  is_available: boolean;
  image_url: string | null;
}

export default function Menu() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchParam = searchParams.get('search') || '';
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useContext(AuthContext);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { cart, setCart } = useCart();

  useEffect(() => {    
    Promise.all([
      api.get(`/categories`),
      api.get(`/products`)
    ]).then(([catRes, prodRes]) => {
      const freshCategories = catRes.data.data || catRes.data || [];
      const freshProducts = prodRes.data.data || prodRes.data || [];
      
      setCategories(freshCategories);
      setProducts(freshProducts);
      setLoading(false);
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

  const updateQuantity = (productId: number, delta: number) => {
    const updated = cart.map(item => {
      if (item.product.id === productId) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : null;
      }
      return item;
    }).filter((item): item is CartItem => item !== null);
    setCart(updated);
  };

  const updateNotes = (productId: number, notes: string) => {
    const updated = cart.map(item => {
      if (item.product.id === productId) {
        return { ...item, notes };
      }
      return item;
    });
    setCart(updated);
  };

  const removeFromCart = (productId: number) => {
    const updated = cart.filter(item => item.product.id !== productId);
    setCart(updated);
    toast.error('Item removido da sacola.');
  };

  // Filtro de pratos (compara categoria selecionada e texto da busca)
  const filteredProducts = products.filter(p => {
    const matchesCategory = activeCategory ? p.category_id === activeCategory : true;
    const matchesSearch = searchParam
      ? p.name.toLowerCase().includes(searchParam.toLowerCase()) ||
        p.description.toLowerCase().includes(searchParam.toLowerCase())
      : true;
    return matchesCategory && matchesSearch;
  });

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + (Number(item.product.price) * item.quantity), 0);

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto font-sans relative pb-24 animate-fade-in">
      
      {/* Banner Superior */}
      <div className="mb-8 bg-linear-to-r from-sabor-dark to-emerald-950 p-6 md:p-10 rounded-3xl text-white shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-sabor-primary/10 rounded-full blur-[100px] pointer-events-none"></div>
        <span className="text-xs md:text-sm font-bold text-sabor-primary uppercase tracking-widest flex items-center gap-1.5 mb-2">
          <svg className="w-3.5 h-3.5 fill-sabor-primary stroke-none" viewBox="0 0 24 24">
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
          </svg>
          CARDÁPIO SELECIONADO
        </span>
        <h1 className="text-3xl md:text-4xl font-black leading-tight mb-2">Experimente a Amazônia em Cada Garfada</h1>
        <p className="text-gray-300 text-xs md:text-sm max-w-2xl font-light">
          Navegue pelas nossas categorias, adicione pratos exóticos e combos promocionais à sua sacola, e finalize para receber quentinho em sua casa!
        </p>
      </div>

      {/* Informativo amigável sobre resultados da busca */}
      {searchParam && (
        <div className="mb-8 flex items-center justify-between bg-emerald-50 border border-emerald-100 p-4 rounded-2xl animate-fade-in">
          <p className="text-xs font-semibold text-emerald-800">
            🔎 Pratos correspondentes à busca: <span className="font-extrabold text-emerald-950">"{searchParam}"</span>
          </p>
          <button 
            onClick={() => setSearchParams({})} 
            className="text-xs font-black text-emerald-700 hover:text-emerald-950 transition-colors"
          >
            Limpar Filtro ×
          </button>
        </div>
      )}
      
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
                    <span className="absolute top-4 left-4 z-10 bg-amber-500 text-white text-[9px] font-black uppercase px-2.5 py-1 rounded-full shadow-md tracking-wider flex items-center gap-0.5">
                      <svg className="w-2.5 h-2.5 stroke-white fill-none" viewBox="0 0 24 24" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z" />
                      </svg>
                      PROMOÇÃO
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
                      <div className="text-sabor-primary bg-sabor-light w-full h-full flex items-center justify-center">
                        <svg className="w-12 h-12 stroke-sabor-primary fill-none opacity-30" viewBox="0 0 24 24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 2v4M17 2v4M7 2v4M2 12c0 4.418 4.477 8 10 8s10-3.582 10-8H2z"></path>
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
                        <svg className="w-4 h-4 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
                        </svg>
                        <span>Adicionar à Sacola</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center text-gray-400 mt-16 p-8 border border-dashed border-gray-200 rounded-3xl max-w-md mx-auto flex flex-col items-center justify-center animate-fade-in">
              <svg className="w-12 h-12 stroke-gray-300 fill-none mb-4" viewBox="0 0 24 24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v4M17 2v4M7 2v4M2 12c0 4.418 4.477 8 10 8s10-3.582 10-8H2z"></path>
              </svg>
              <h3 className="font-bold text-gray-700 text-base mb-1">
                {searchParam ? 'Nenhum prato encontrado' : 'Nenhum prato disponível'}
              </h3>
              <p className="text-xs leading-relaxed">
                {searchParam 
                  ? `Não localizamos itens para "${searchParam}". Que tal tentar outro ingrediente ou prato regional?`
                  : 'Tente escolher outra categoria de produtos acima.'}
              </p>
              {searchParam && (
                <button 
                  onClick={() => setSearchParams({})} 
                  className="mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-black rounded-xl transition-all"
                >
                  Limpar Busca
                </button>
              )}
            </div>
          )}
        </>
      )}

      {/* Floating Cart Indicator Bar */}
      {totalItems > 0 && (
        <div 
          onClick={() => setIsCartOpen(true)}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 max-w-md w-[92%] bg-sabor-dark/95 backdrop-blur-md text-white border border-sabor-primary/30 p-4 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] z-90 flex items-center justify-between gap-4 cursor-pointer hover:bg-sabor-dark transition-all duration-300 transform hover:scale-[1.02] animate-scale-in"
        >
          <div>
            <p className="text-xs font-bold text-sabor-primary uppercase tracking-wider">Sua Sacola</p>
            <p className="text-sm font-black mt-0.5">
              {totalItems} {totalItems === 1 ? 'item' : 'itens'} <span className="text-gray-400">|</span> R$ {totalPrice.toFixed(2)}
            </p>
          </div>
          
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setIsCartOpen(true);
            }}
            className="px-5 py-2.5 bg-sabor-primary hover:bg-sabor-primary/90 text-sabor-dark font-black text-xs rounded-xl shadow-md transition-all hover:scale-102 flex items-center gap-1 shrink-0"
          >
            <span>Ver Sacola</span>
            <svg className="w-4 h-4 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </button>
        </div>
      )}

      {/* Cart Drawer / Side Panel */}
      {isCartOpen && (
        <div className="fixed inset-0 z-100 flex justify-end">
          {/* Backdrop Overlay */}
          <div 
            onClick={() => setIsCartOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 animate-fade-in"
          ></div>
          
          {/* Drawer Content */}
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 transition-transform duration-300 animate-slide-in-right">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div>
                <h2 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                  <span>Sua Sacola</span>
                  <span className="bg-sabor-light text-sabor-dark px-2.5 py-0.5 rounded-full text-xs font-black">
                    {totalItems}
                  </span>
                </h2>
                <p className="text-xs text-gray-500 font-medium mt-0.5">Revise seus pratos antes do checkout.</p>
              </div>
              <button 
                onClick={() => setIsCartOpen(false)} 
                className="w-10 h-10 bg-white border border-gray-200 rounded-full hover:bg-gray-100 transition-colors flex items-center justify-center text-gray-600 shadow-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            {/* List of Cart Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin">
              {cart.map((item) => (
                <div key={item.product.id} className="bg-gray-50 border border-gray-100 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    {item.product.image_url ? (
                      <img 
                        src={item.product.image_url} 
                        alt={item.product.name} 
                        className="w-14 h-14 object-cover rounded-xl shadow-sm border border-gray-200 shrink-0" 
                      />
                    ) : (
                      <div className="w-14 h-14 bg-sabor-light text-sabor-dark rounded-xl flex items-center justify-center font-bold text-lg border border-gray-200 shrink-0">
                        🥣
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-extrabold text-gray-900 text-sm tracking-tight truncate">{item.product.name}</h4>
                      <p className="text-xs text-sabor-dark font-black mt-0.5">R$ {Number(item.product.price).toFixed(2)}</p>
                    </div>

                    {/* Quantity selectors */}
                    <div className="flex items-center gap-2 bg-white rounded-lg p-0.5 border border-gray-200 shadow-sm shrink-0">
                      <button 
                        onClick={() => updateQuantity(item.product.id, -1)} 
                        className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-50 rounded-md font-bold text-xs"
                      >
                        -
                      </button>
                      <span className="font-black w-4 text-center text-xs text-gray-900">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.product.id, 1)} 
                        className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-50 rounded-md font-bold text-xs"
                      >
                        +
                      </button>
                    </div>

                    {/* Delete button */}
                    <button 
                      onClick={() => removeFromCart(item.product.id)}
                      className="p-2 hover:bg-rose-50 rounded-xl text-rose-500 hover:text-rose-700 transition-colors shrink-0"
                      title="Remover Item"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                  </div>

                  {/* Item Preparation Notes */}
                  <div className="pt-2 border-t border-gray-200/50">
                    <input 
                      type="text" 
                      placeholder="Observações (ex: sem cebola, ponto da carne...)" 
                      value={item.notes}
                      onChange={e => updateNotes(item.product.id, e.target.value)}
                      className="w-full text-[11px] border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-sabor-primary focus:border-sabor-primary transition-all font-medium"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Footer Summary & Checkout */}
            <div className="p-6 border-t border-gray-100 bg-gray-50 space-y-4">
              <div className="space-y-1.5 text-xs text-gray-600 font-medium">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-extrabold text-gray-900">R$ {totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxa de Entrega:</span>
                  <span className="text-gray-400 text-right">Calculada no checkout</span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                  <span className="font-black text-gray-900">Total:</span>
                  <span className="font-black text-sabor-dark text-base">R$ {totalPrice.toFixed(2)}</span>
                </div>
              </div>

              {/* Checkout CTA Button */}
              {isAuthenticated ? (
                <button 
                  onClick={() => {
                    setIsCartOpen(false);
                    navigate('/delivery');
                  }}
                  className="w-full py-3.5 bg-sabor-primary hover:bg-sabor-primary/95 text-sabor-dark font-black text-sm rounded-2xl shadow-md transition-all hover:scale-[1.02] flex items-center justify-center gap-1"
                >
                  <span>Confirmar e Ir para o Checkout</span>
                  <svg className="w-4 h-4 stroke-current fill-none animate-bounce" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              ) : (
                <button 
                  onClick={() => {
                    setIsCartOpen(false);
                    toast.info('Faça login ou crie uma conta para finalizar seu pedido! 🛵');
                    navigate('/login?redirect=%2Fdelivery');
                  }}
                  className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-black text-sm rounded-2xl shadow-md transition-all hover:scale-[1.02] flex items-center justify-center gap-1.5"
                >
                  <span>Entrar e Finalizar Pedido</span>
                  <svg className="w-4 h-4 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </button>
              )}

              <button 
                onClick={() => setIsCartOpen(false)}
                className="w-full text-center text-xs font-bold text-gray-500 hover:text-gray-800 py-1 transition-colors"
              >
                Continuar Comprando
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
