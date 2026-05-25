import React, { useEffect, useState } from 'react';
import axios from 'axios';

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
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCheckout, setIsCheckout] = useState(false);
  
  // Form State
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
        const [catRes, prodRes] = await Promise.all([
          axios.get(`${apiUrl}/api/categories`),
          axios.get(`${apiUrl}/api/products`)
        ]);
        setCategories(catRes.data.data || catRes.data || []);
        setProducts(prodRes.data.data || prodRes.data || []);
      } catch (err) {
        console.error('Failed to fetch menu', err);
      }
    };
    fetchMenu();
  }, []);

  const addToCart = (product: Product) => {
    const existing = cart.find(item => item.product.id === product.id);
    if (existing) {
      setCart(cart.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, { product, quantity: 1, notes: '' }]);
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
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      await axios.post(`${apiUrl}/api/orders/delivery`, {
        customer_name: customerName,
        customer_phone: customerPhone,
        delivery_address: deliveryAddress,
        items: cart.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity,
          notes: item.notes
        }))
      });
      setSuccess(true);
      setCart([]);
    } catch (err) {
      console.error(err);
      alert('Erro ao processar pedido. Verifique os dados e tente novamente.');
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
      <div className="min-h-screen bg-emerald-50 flex items-center justify-center p-6">
        <div className="bg-white p-10 rounded-3xl shadow-xl text-center max-w-md w-full">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-2">Pedido Recebido!</h2>
          <p className="text-gray-600 mb-8">Seu pedido foi enviado para o restaurante. Aguarde nossa confirmação.</p>
          <button 
            onClick={() => { setSuccess(false); setIsCheckout(false); }}
            className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors"
          >
            Fazer Novo Pedido
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Left Area: Menu */}
      <div className="flex-1 p-6 md:p-10 max-h-screen overflow-y-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">SaborExpress <span className="text-emerald-600">Delivery</span></h1>
          <p className="text-gray-500 font-medium mt-2">Os melhores pratos diretamente na sua casa.</p>
        </div>

        {/* Categories */}
        <div className="flex gap-3 mb-8 overflow-x-auto pb-2 shrink-0 custom-scrollbar">
          <button 
            onClick={() => setActiveCategory(null)}
            className={`whitespace-nowrap px-5 py-2.5 rounded-full font-bold transition-all ${activeCategory === null ? 'bg-gray-900 text-white shadow-lg' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:shadow'}`}
          >
            Todos
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`whitespace-nowrap px-5 py-2.5 rounded-full font-bold transition-all ${activeCategory === cat.id ? 'bg-gray-900 text-white shadow-lg' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:shadow'}`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 pb-24 md:pb-0">
          {filteredProducts.map(product => (
            <div key={product.id} className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm hover:shadow-xl transition-all flex flex-col h-full group">
              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg text-gray-900 leading-tight group-hover:text-emerald-600 transition-colors">{product.name}</h3>
                </div>
                <p className="text-gray-500 text-sm mb-4 line-clamp-3">{product.description}</p>
              </div>
              <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                <span className="font-black text-xl text-gray-900">R$ {Number(product.price).toFixed(2)}</span>
                <button 
                  onClick={() => addToCart(product)}
                  disabled={!product.is_available}
                  className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold hover:bg-emerald-600 hover:text-white transition-all shadow-sm hover:shadow-md disabled:opacity-50"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"></path></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Area: Cart & Checkout */}
      <div className={`fixed inset-0 md:static md:w-96 bg-white border-l border-gray-100 flex flex-col shadow-2xl md:shadow-none z-50 transition-transform ${cart.length === 0 && !isCheckout ? 'translate-y-full md:translate-y-0' : 'translate-y-0'}`}>
        
        {/* Cart Header */}
        <div className="p-6 border-b border-gray-100 bg-gray-900 text-white flex justify-between items-center">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
            Seu Pedido
          </h2>
          <span className="bg-emerald-500 text-white px-3 py-1 rounded-full text-sm font-black">{cart.length} itens</span>
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
                    <span className="font-black text-emerald-600">R$ {(Number(item.product.price) * item.quantity).toFixed(2)}</span>
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
                <h3 className="font-bold text-gray-900 border-b pb-2">Dados de Entrega</h3>
                <input 
                  required
                  type="text" 
                  placeholder="Nome Completo" 
                  value={customerName} onChange={e => setCustomerName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
                />
                <input 
                  required
                  type="tel" 
                  placeholder="Telefone (WhatsApp)" 
                  value={customerPhone} onChange={e => setCustomerPhone(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
                />
                <textarea 
                  required
                  placeholder="Endereço Completo (Rua, Número, Bairro, Ref)" 
                  value={deliveryAddress} onChange={e => setDeliveryAddress(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all h-24 resize-none"
                />
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setIsCheckout(false)} className="px-6 py-4 rounded-xl font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors">Voltar</button>
                  <button type="submit" disabled={loading} className="flex-1 py-4 bg-emerald-600 text-white rounded-xl font-black text-lg shadow-lg shadow-emerald-600/30 hover:bg-emerald-700 hover:shadow-xl hover:-translate-y-1 transition-all disabled:opacity-50">
                    {loading ? 'Enviando...' : 'Confirmar Pedido'}
                  </button>
                </div>
              </form>
            ) : (
              <button 
                onClick={() => setIsCheckout(true)}
                className="w-full py-4 bg-emerald-600 text-white rounded-xl font-black text-lg shadow-lg shadow-emerald-600/30 hover:bg-emerald-700 hover:shadow-xl hover:-translate-y-1 transition-all"
              >
                Avançar para Entrega
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
