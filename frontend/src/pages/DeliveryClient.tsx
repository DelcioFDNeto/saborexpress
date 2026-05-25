import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { api } from '../lib/api';
import { toast } from 'sonner';

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
  image_url?: string | null;
}

interface CartItem {
  product: Product;
  quantity: number;
  notes: string;
}

export default function DeliveryClient() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [menuLoading, setMenuLoading] = useState(true);
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCheckout, setIsCheckout] = useState(false);
  const [orderType, setOrderType] = useState<'delivery' | 'takeout'>('delivery');
  
  // Form State
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [cep, setCep] = useState('');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [reference, setReference] = useState('');
  const [addressLoading, setAddressLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleCepBlur = async () => {
    if (orderType === 'takeout') return;
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length !== 8) return;
    
    setAddressLoading(true);
    try {
      const res = await axios.get(`https://viacep.com.br/ws/${cleanCep}/json/`);
      if (res.data && !res.data.erro) {
        setStreet(res.data.logradouro);
        setNeighborhood(res.data.bairro);
        toast.success('Endereço encontrado!');
      } else {
        toast.error('CEP não encontrado.');
      }
    } catch (err) {
      toast.error('Erro ao buscar CEP.');
    } finally {
      setAddressLoading(false);
    }
  };

  useEffect(() => {    
    // 1. Try to load cached data for instant render
    const cachedCategories = localStorage.getItem('saborexpress_categories');
    const cachedProducts = localStorage.getItem('saborexpress_products');
    
    if (cachedCategories && cachedProducts) {
      setCategories(JSON.parse(cachedCategories));
      setProducts(JSON.parse(cachedProducts));
      setMenuLoading(false);
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
      setMenuLoading(false);
      
      // Update cache
      localStorage.setItem('saborexpress_categories', JSON.stringify(freshCategories));
      localStorage.setItem('saborexpress_products', JSON.stringify(freshProducts));
    }).catch(err => {
      console.error('Failed to fetch menu', err);
      setMenuLoading(false);
    });
  }, []);

  const addToCart = (product: Product) => {
    const existing = cart.find(item => item.product.id === product.id);
    if (existing) {
      setCart(cart.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, { product, quantity: 1, notes: '' }]);
      toast.success(`${product.name} adicionado à sacola`);
    }
  };

  const removeFromCart = (productId: number) => {
    setCart(cart.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: number, q: number) => {
    if (q <= 0) return removeFromCart(productId);
    setCart(cart.map(item => item.product.id === productId ? { ...item, quantity: q } : item));
  };

  const submitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (orderType === 'takeout') {
        await api.post(`/orders/takeout`, {
          customer_name: customerName,
          customer_phone: customerPhone,
          items: cart.map(item => ({
            product_id: item.product.id,
            quantity: item.quantity,
            notes: item.notes
          }))
        });
      } else {
        await api.post(`/orders/delivery`, {
          customer_name: customerName,
          customer_phone: customerPhone,
          delivery_address: `${street}, ${number} - ${neighborhood} (${reference}) CEP: ${cep}`,
          items: cart.map(item => ({
            product_id: item.product.id,
            quantity: item.quantity,
            notes: item.notes
          }))
        });
      }
      setSuccess(true);
      setCart([]);
    } catch (err) {
      console.error(err);
      toast.error('Erro ao processar pedido. Verifique os dados e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = activeCategory
    ? products.filter(p => p.category_id === activeCategory)
    : products;

  const totalCart = cart.reduce((acc, item) => acc + (Number(item.product.price) * item.quantity), 0);

  if (success) {
    return (
      <div className="min-h-screen bg-sabor-light flex items-center justify-center p-6">
        <div className="bg-white p-10 rounded-3xl shadow-xl text-center max-w-md w-full">
          <div className="w-20 h-20 bg-sabor-light text-sabor-primary rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-2">Pedido Recebido!</h2>
          <p className="text-gray-600 mb-8">
            {orderType === 'takeout' 
              ? 'Seu pedido de retirada foi enviado para a nossa cozinha. Aguarde nossa notificação para vir buscar.' 
              : 'Seu pedido de entrega expressa foi enviado para o restaurante. Aguarde nossa confirmação.'}
          </p>
          <button 
            onClick={() => { setSuccess(false); setIsCheckout(false); }}
            className="w-full py-4 bg-sabor-primary text-white rounded-xl font-bold hover:bg-sabor-dark transition-colors"
          >
            Fazer Novo Pedido
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans">
      
      {/* Left Area: Menu */}
      <div className="flex-1 p-6 md:p-10 max-h-screen overflow-y-auto">
        <div className="mb-8">
          <div className="flex items-center justify-center gap-3">
            <img src="/logo-horizontal.png" alt="SaborExpress" className="h-16 md:h-20 object-contain" />
            <h1 className="text-4xl font-black text-sabor-primary tracking-tight">Faça seu Pedido</h1>
          </div>
          <p className="text-gray-500 font-medium mt-2 text-center">Peça para receber em casa ou retire fresquinho no nosso balcão!</p>
        </div>

        {/* Categories */}
        <div className="flex gap-3 mb-8 overflow-x-auto pb-2 shrink-0 custom-scrollbar">
          {menuLoading && categories.length === 0 ? (
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
                className={`whitespace-nowrap px-5 py-2.5 rounded-full font-bold transition-all ${
                  activeCategory === null 
                    ? 'bg-sabor-primary text-sabor-dark shadow-lg shadow-sabor-primary/10' 
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                Todos
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`whitespace-nowrap px-5 py-2.5 rounded-full font-bold transition-all ${
                    activeCategory === cat.id 
                      ? 'bg-sabor-primary text-sabor-dark shadow-lg shadow-sabor-primary/10' 
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </>
          )}
        </div>

        {/* Products Grid */}
        {menuLoading && products.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 pb-24 md:pb-0">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm flex flex-col h-[340px]">
                <div className="h-40 bg-gray-200 animate-pulse w-full"></div>
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="h-6 bg-gray-200 rounded animate-pulse w-2/3 mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-full mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6"></div>
                  </div>
                  <div className="h-10 bg-gray-200 rounded-xl animate-pulse w-full mt-4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 pb-24 md:pb-0">
            {filteredProducts.map(product => (
              <div key={product.id} className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full group">
                <div className="h-40 bg-gray-50 w-full overflow-hidden flex items-center justify-center relative">
                  {product.image_url ? (
                    <img 
                      src={product.image_url} 
                      alt={product.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      loading="lazy"
                    />
                  ) : (
                    <div className="text-sabor-primary bg-sabor-light w-full h-full flex items-center justify-center">
                      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                      </svg>
                    </div>
                  )}
                  {!product.is_available && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-xs flex items-center justify-center">
                      <span className="bg-rose-100 text-rose-700 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm">
                        Esgotado
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-extrabold text-base text-gray-900 leading-snug group-hover:text-sabor-dark transition-colors mb-2">{product.name}</h3>
                    <p className="text-gray-500 text-xs mb-4 line-clamp-2 leading-relaxed">{product.description || 'Sem descrição cadastrada.'}</p>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                    <span className="font-black text-lg text-sabor-dark">R$ {Number(product.price).toFixed(2)}</span>
                    <button 
                      onClick={() => addToCart(product)}
                      disabled={!product.is_available}
                      className="w-10 h-10 bg-sabor-light text-sabor-dark rounded-full flex items-center justify-center font-bold hover:bg-sabor-primary hover:text-white transition-all shadow-sm hover:shadow-md disabled:opacity-40"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"></path></svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right Area: Cart & Checkout */}
      <div className={`fixed inset-0 md:static md:w-96 bg-white border-l border-gray-100 flex flex-col shadow-2xl md:shadow-none z-50 transition-transform ${cart.length === 0 && !isCheckout ? 'translate-y-full md:translate-y-0' : 'translate-y-0'}`}>
        
        {/* Cart Header */}
        <div className="p-6 border-b border-gray-100 bg-gray-900 text-white flex justify-between items-center">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
            Seu Pedido
          </h2>
          <span className="bg-sabor-primary text-white px-3 py-1 rounded-full text-sm font-black">{cart.length} itens</span>
        </div>

        {/* Cart Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
              <p className="font-medium">Sua sacola está vazia.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map(item => (
                <div key={item.product.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm relative group">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-bold text-gray-800 pr-6">{item.product.name}</h4>
                    <button onClick={() => removeFromCart(item.product.id)} className="text-gray-300 hover:text-rose-500 absolute top-4 right-4">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-3 bg-gray-100 rounded-lg p-1">
                      <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="w-7 h-7 flex items-center justify-center bg-white text-gray-600 rounded shadow-sm hover:bg-gray-50">-</button>
                      <span className="font-bold text-sm w-4 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="w-7 h-7 flex items-center justify-center bg-white text-gray-600 rounded shadow-sm hover:bg-gray-50">+</button>
                    </div>
                    <span className="font-black text-sabor-primary">R$ {(Number(item.product.price) * item.quantity).toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer actions */}
        {cart.length > 0 && (
          <div className="p-6 bg-white border-t border-gray-100 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)]">
            <div className="flex justify-between items-center mb-6">
              <span className="text-gray-500 font-medium">Total do Pedido</span>
              <span className="text-3xl font-black text-gray-900">R$ {totalCart.toFixed(2)}</span>
            </div>

            {isCheckout ? (
              <form onSubmit={submitOrder} className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                
                {/* Checkout Mode Toggle */}
                <div className="grid grid-cols-2 p-1 bg-gray-100 rounded-xl border border-gray-200">
                  <button 
                    type="button"
                    onClick={() => setOrderType('delivery')}
                    className={`py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                      orderType === 'delivery' 
                        ? 'bg-white text-sabor-dark shadow-sm' 
                        : 'text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    🚚 Entrega
                  </button>
                  <button 
                    type="button"
                    onClick={() => setOrderType('takeout')}
                    className={`py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                      orderType === 'takeout' 
                        ? 'bg-white text-sabor-dark shadow-sm' 
                        : 'text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    🛍️ Retirada
                  </button>
                </div>

                <h3 className="font-bold text-gray-900 border-b pb-2">
                  {orderType === 'takeout' ? 'Dados para Retirada' : 'Dados de Entrega'}
                </h3>
                
                <input 
                  required
                  type="text" 
                  placeholder="Nome Completo" 
                  value={customerName} onChange={e => setCustomerName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-sabor-primary focus:outline-none transition-all"
                />
                
                <input 
                  required
                  type="tel" 
                  placeholder="Telefone (WhatsApp)" 
                  value={customerPhone} onChange={e => setCustomerPhone(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-sabor-primary focus:outline-none transition-all"
                />

                {/* Conditional Fields: Render only for Delivery */}
                {orderType === 'delivery' && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="grid grid-cols-2 gap-3">
                      <input 
                        required={orderType === 'delivery'}
                        type="text" 
                        placeholder="CEP" 
                        value={cep} onChange={e => setCep(e.target.value)} onBlur={handleCepBlur}
                        className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-sabor-primary focus:outline-none transition-all"
                      />
                      {addressLoading && <div className="text-sm text-sabor-primary font-bold flex items-center">Buscando...</div>}
                    </div>
                    <input 
                      required={orderType === 'delivery'}
                      type="text" 
                      placeholder="Rua" 
                      value={street} onChange={e => setStreet(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-sabor-primary focus:outline-none transition-all"
                    />
                    <div className="grid grid-cols-3 gap-3">
                      <input 
                        required={orderType === 'delivery'}
                        type="text" 
                        placeholder="Número" 
                        value={number} onChange={e => setNumber(e.target.value)}
                        className="col-span-1 w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-sabor-primary focus:outline-none transition-all"
                      />
                      <input 
                        required={orderType === 'delivery'}
                        type="text" 
                        placeholder="Bairro" 
                        value={neighborhood} onChange={e => setNeighborhood(e.target.value)}
                        className="col-span-2 w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-sabor-primary focus:outline-none transition-all"
                      />
                    </div>
                    <input 
                      type="text" 
                      placeholder="Complemento / Ponto de Referência" 
                      value={reference} onChange={e => setReference(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-sabor-primary focus:outline-none transition-all"
                    />
                  </div>
                )}

                {orderType === 'takeout' && (
                  <div className="p-4 bg-sabor-light text-sabor-dark border border-sabor-primary/20 rounded-2xl text-xs font-bold leading-relaxed space-y-1">
                    <p>📍 Retirada grátis no Balcão!</p>
                    <p className="text-gray-600 font-normal">Av. Nazaré, 452 - Nazaré. Seu pedido estará pronto em 25-35 min.</p>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setIsCheckout(false)} className="px-6 py-4 rounded-xl font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors">Voltar</button>
                  <button type="submit" disabled={loading} className="flex-1 py-4 bg-sabor-primary text-white rounded-xl font-black text-lg shadow-lg shadow-sabor-primary/30 hover:bg-sabor-dark hover:shadow-xl hover:-translate-y-1 transition-all disabled:opacity-50">
                    {loading ? 'Enviando...' : 'Confirmar Pedido'}
                  </button>
                </div>
              </form>
            ) : (
              <button 
                onClick={() => setIsCheckout(true)}
                className="w-full py-4 bg-sabor-primary text-white rounded-xl font-black text-lg shadow-lg shadow-sabor-primary/30 hover:bg-sabor-dark hover:shadow-xl hover:-translate-y-1 transition-all"
              >
                Avançar para Checkout
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
