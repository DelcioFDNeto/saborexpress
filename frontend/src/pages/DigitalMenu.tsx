import React, { useEffect, useState, useContext } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../lib/api';
import { AuthContext } from '../contexts/AuthContext';
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

interface OrderItem {
  id: number;
  quantity: number;
  unit_price: string;
  notes: string | null;
  status: string;
  product: {
    name: string;
  };
}

interface Order {
  id: number;
  status: string;
  total_amount: string;
  items: OrderItem[];
}

interface Table {
  id: number;
  number: string;
  capacity: number;
  status: string;
}

export default function DigitalMenu() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tableNumberFromUrl = searchParams.get('table');

  const { user, isAuthenticated, isLoading: authLoading } = useContext(AuthContext);

  // Core Data
  const [tables, setTables] = useState<Table[]>([]);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  // UI State
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [customerName, setCustomerName] = useState('');
  const [openingComanda, setOpeningComanda] = useState(false);

  // Cart/OrderItem placement state
  const [targetProduct, setTargetProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [submittingItem, setSubmittingItem] = useState(false);

  // Check if current session belongs to restaurant staff
  const isStaff = isAuthenticated && (user?.role === 'administrator' || user?.role === 'waiter' || user?.role === 'cashier');

  // Load basic tables (only fetched if the user is authenticated as staff)
  const fetchAllTables = async () => {
    if (!isStaff) {
      setLoading(false);
      return;
    }
    
    try {
      const res = await api.get('/tables');
      const allTables: Table[] = res.data.data ? res.data.data : res.data || [];
      setTables(allTables);

      // Sincronizar mesa travada no local storage ou na URL
      const savedTable = localStorage.getItem('saborexpress_tablet_table');
      if (savedTable) {
        try {
          const parsed = JSON.parse(savedTable) as Table;
          setSelectedTable(parsed);
          fetchActiveOrderForTable(parsed.id);
        } catch {
          localStorage.removeItem('saborexpress_tablet_table');
        }
      } else if (tableNumberFromUrl) {
        const found = allTables.find(t => t.number === tableNumberFromUrl);
        if (found) {
          setSelectedTable(found);
          fetchActiveOrderForTable(found.id);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error('Erro ao carregar mesas de salão.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch active comanda for a table
  const fetchActiveOrderForTable = async (tableId: number) => {
    try {
      const res = await api.get(`/tables/${tableId}/active-order`);
      setActiveOrder(res.data.data || res.data);
    } catch {
      // 404 is normal if the table is free/clean
      setActiveOrder(null);
    }
  };

  // Load categories and products (cached SWR)
  const fetchMenu = async () => {
    const cachedCategories = localStorage.getItem('saborexpress_categories');
    const cachedProducts = localStorage.getItem('saborexpress_products');
    
    if (cachedCategories && cachedProducts) {
      setCategories(JSON.parse(cachedCategories));
      setProducts(JSON.parse(cachedProducts));
    }

    try {
      const [catRes, prodRes] = await Promise.all([
        api.get('/categories'),
        api.get('/products')
      ]);
      const freshCat = catRes.data.data || catRes.data || [];
      const freshProd = prodRes.data.data || prodRes.data || [];
      
      setCategories(freshCat);
      setProducts(freshProd);
      localStorage.setItem('saborexpress_categories', JSON.stringify(freshCat));
      localStorage.setItem('saborexpress_products', JSON.stringify(freshProd));
    } catch (err) {
      console.error(err);
    }
  };

  // On mount, check locked storage first
  useEffect(() => {
    if (authLoading) return;

    const savedTable = localStorage.getItem('saborexpress_tablet_table');
    if (savedTable) {
      try {
        const parsed = JSON.parse(savedTable) as Table;
        setSelectedTable(parsed);
        fetchActiveOrderForTable(parsed.id);
        setLoading(false);
      } catch {
        localStorage.removeItem('saborexpress_tablet_table');
      }
    }
    
    // Fetch fresh table metadata in background
    fetchAllTables();
    fetchMenu();
  }, [tableNumberFromUrl, isAuthenticated, authLoading]);

  // Handle table selection and lock it to tablet storage
  const selectLocalTable = (table: Table) => {
    localStorage.setItem('saborexpress_tablet_table', JSON.stringify(table));
    setSelectedTable(table);
    setSearchParams({ table: table.number });
    toast.success(`Este tablet foi vinculado e travado na Mesa ${table.number}! ⚙️`);
  };

  // Open active comanda
  const handleOpenComanda = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTable) return;
    setOpeningComanda(true);

    try {
      await api.post(`/tables/${selectedTable.id}/open`, {
        customer_name: customerName || `Mesa ${selectedTable.number}`,
        customer_phone: null
      });

      toast.success(`Comanda da Mesa ${selectedTable.number} aberta!`);
      // Update local state status and fetch comanda
      setSelectedTable({ ...selectedTable, status: 'Ocupada' });
      await fetchActiveOrderForTable(selectedTable.id);
      setCustomerName('');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e.response?.data?.message || 'Erro ao abrir comanda.');
    } finally {
      setOpeningComanda(false);
    }
  };

  // Launch item to the table comanda directly
  const handleLaunchItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrder || !targetProduct) return;
    setSubmittingItem(true);

    try {
      await api.post(`/orders/${activeOrder.id}/items`, {
        product_id: targetProduct.id,
        quantity,
        notes: notes || null
      });

      toast.success(`${quantity}x ${targetProduct.name} enviados para a cozinha! 🍳`);
      
      // Refresh order to see new items and kitchen states
      await fetchActiveOrderForTable(selectedTable!.id);
      setTargetProduct(null);
      setQuantity(1);
      setNotes('');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e.response?.data?.message || 'Erro ao lançar item na mesa.');
    } finally {
      setSubmittingItem(false);
    }
  };

  // Sincronizar Fila button
  const handleSync = () => {
    if (selectedTable) {
      fetchActiveOrderForTable(selectedTable.id);
      toast.success('Comanda atualizada em tempo real! 🔄');
    }
  };

  // Lock configuration release
  const handleReleaseConfig = () => {
    if (isStaff) {
      if (confirm('Deseja realmente desvincular este dispositivo e liberar a mesa?')) {
        localStorage.removeItem('saborexpress_tablet_table');
        setSelectedTable(null);
        setSearchParams({});
        toast.info('Tablet desvinculado. Redirecionando para seletor administrativo.');
      }
    } else {
      toast.error('Acesso Negado: Apenas garçons ou administradores autenticados podem reconfigurar este tablet.');
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sabor-primary"></div>
      </div>
    );
  }

  // 1. Selector view if no table is selected and locked
  if (!selectedTable) {
    // SECURITY LOCK: If not staff, block setup configuration screen completely!
    if (!isStaff) {
      return (
        <div className="max-w-md mx-auto p-6 md:p-10 font-sans min-h-[75vh] flex flex-col justify-center animate-fade-in">
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-rose-100 text-center flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mb-6 border border-rose-100 shadow-inner">
              <svg className="w-10 h-10 stroke-rose-500 fill-none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
            </div>
            
            <h1 className="text-2xl font-black text-gray-900 mb-2">Tablet Bloqueado</h1>
            <p className="text-gray-500 text-sm mb-6 leading-relaxed">
              Este dispositivo de autoatendimento ainda não foi configurado e vinculado a uma mesa física pelo restaurante.
            </p>
            
            <div className="bg-amber-50 border border-amber-100 text-amber-800 text-xs font-bold p-4 rounded-xl leading-relaxed mb-6 flex items-start gap-2.5">
              <svg className="w-4 h-4 stroke-amber-700 fill-none shrink-0 mt-0.5" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <span>Apenas garçons, gerentes ou administradores com credenciais ativas podem vincular este tablet a uma mesa.</span>
            </div>

            <Link 
              to="/login?redirect=/cardapio-digital" 
              className="w-full py-4 bg-sabor-primary hover:bg-sabor-primary/95 text-sabor-dark font-black text-base rounded-2xl transition-all shadow-[0_8px_25px_rgba(74,222,128,0.2)] flex items-center justify-center gap-2"
            >
              <span>Fazer Login de Garçom</span>
              <svg className="w-5 h-5 stroke-sabor-dark fill-none" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
              </svg>
            </Link>
          </div>
        </div>
      );
    }

    // If logged in as staff, display the administrative table binder
    return (
      <div className="max-w-5xl mx-auto p-6 md:p-12 font-sans animate-fade-in">
        <header className="text-center mb-10 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <span className="bg-sabor-light text-sabor-dark border border-sabor-primary/30 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 max-w-fit mx-auto">
            <svg className="w-3.5 h-3.5 stroke-sabor-dark fill-none" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
            </svg>
            <span>Painel do Garçom: Configuração</span>
          </span>
          <h1 className="text-3xl font-black text-gray-900 mt-3">Vincular Tablet a uma Mesa</h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-2 max-w-lg mx-auto">
            Olá, <span className="font-extrabold text-sabor-dark">{user?.name}</span>! Selecione abaixo em qual mesa física você deseja fixar este dispositivo. O cliente só poderá pedir para esta mesa.
          </p>
        </header>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {tables.map(t => (
            <div 
              key={t.id}
              onClick={() => selectLocalTable(t)}
              className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-sabor-primary/30 hover:-translate-y-1 transition-all duration-300 text-center cursor-pointer flex flex-col items-center justify-center"
            >
              <div className="w-16 h-16 rounded-full bg-sabor-light text-sabor-dark font-black text-2xl flex items-center justify-center mb-4 border border-sabor-primary/10">
                {t.number}
              </div>
              <h3 className="font-extrabold text-gray-900 text-base">Mesa {t.number}</h3>
              <p className="text-xs text-gray-400 font-semibold mt-1 flex items-center justify-center gap-1">
                <svg className="w-3 h-3 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 00-3-3.87" />
                  <path d="M16 3.13a4 4 0 010 7.75" />
                </svg>
                <span>{t.capacity} lugares</span>
              </p>
              
              <div className="mt-4">
                {t.status === 'Livre' ? (
                  <span className="px-3 py-1 bg-sabor-primary/20 text-sabor-dark text-[9px] font-black uppercase rounded-full tracking-wider border border-sabor-primary/20">
                    Livre
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-amber-100 text-amber-800 text-[9px] font-black uppercase rounded-full tracking-wider border border-amber-200">
                    Ocupada
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 2. Open Comanda screen if the table has no active comanda
  if (!activeOrder) {
    return (
      <div className="max-w-md mx-auto p-6 md:p-10 font-sans min-h-[70vh] flex flex-col justify-center animate-fade-in">
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 text-center flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-sabor-light text-sabor-dark font-black text-3xl flex items-center justify-center mb-6 border border-sabor-primary/20">
            {selectedTable.number}
          </div>
          
          <h1 className="text-2xl font-black text-gray-900 mb-2">Comanda Fechada</h1>
          <p className="text-gray-500 text-sm mb-6 leading-relaxed">
            A comanda da **Mesa {selectedTable.number}** está encerrada no momento. Para iniciar o seu pedido direto da mesa, informe seu nome para abrir a mesa no salão.
          </p>

          <form onSubmit={handleOpenComanda} className="w-full space-y-4">
            <div>
              <label className="block text-left text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Seu Nome (Opcional)</label>
              <input 
                type="text" 
                placeholder="Ex: Carlos Silva"
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                className="w-full border-gray-200 rounded-xl focus:ring-sabor-primary focus:border-sabor-primary text-sm font-semibold p-3"
              />
            </div>
            
            <button 
              type="submit"
              disabled={openingComanda}
              className="w-full py-4 bg-sabor-primary hover:bg-sabor-primary/95 text-sabor-dark font-black text-base rounded-2xl transition-all shadow-[0_8px_25px_rgba(74,222,128,0.2)] disabled:opacity-50"
            >
              {openingComanda ? 'Abrindo...' : 'Abrir Mesa e Ver Cardápio 🍽️'}
            </button>
          </form>

          {/* Configuration button (only visible/functional for staff) */}
          <button 
            onClick={handleReleaseConfig}
            className="text-gray-400 hover:text-rose-500 text-xs font-bold mt-6 underline transition-colors"
          >
            Configurar Tablet ⚙️
          </button>
        </div>
      </div>
    );
  }

  // 3. Active Digital Menu View (Tablet view)
  const filteredProducts = activeCategory
    ? products.filter(p => p.category_id === activeCategory)
    : products;

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 font-sans animate-fade-in">
      
      {/* Visual Header */}
      <header className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-sabor-dark text-sabor-primary font-black text-2xl flex items-center justify-center border border-sabor-primary/30 shrink-0">
            {selectedTable.number}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-sabor-light text-sabor-dark border border-sabor-primary/30 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">
                Mesa Ativa
              </span>
              <span className="bg-purple-100 text-purple-900 border border-purple-200 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">
                Comanda #{activeOrder.id}
              </span>
            </div>
            <h1 className="text-2xl font-black text-gray-900 mt-1">Faça seu Pedido</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleSync}
            className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-extrabold text-sm rounded-xl transition-all flex items-center gap-1.5"
          >
            🔄 Atualizar Comanda
          </button>
          
          {/* Release device binder: Admin locked */}
          <button 
            onClick={handleReleaseConfig}
            className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-extrabold text-sm rounded-xl transition-all flex items-center gap-1"
          >
            ⚙️ Configurar
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Product Grid (span 8) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Category Tabs */}
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
            <button 
              onClick={() => setActiveCategory(null)}
              className={`px-5 py-2.5 rounded-full font-bold text-sm shrink-0 transition-all ${
                activeCategory === null 
                  ? 'bg-sabor-primary text-sabor-dark shadow-md' 
                  : 'bg-white hover:bg-gray-100 text-gray-600 border border-gray-100 shadow-sm'
              }`}
            >
              Todos
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-5 py-2.5 rounded-full font-bold text-sm shrink-0 transition-all ${
                  activeCategory === cat.id 
                    ? 'bg-sabor-primary text-sabor-dark shadow-md' 
                    : 'bg-white hover:bg-gray-100 text-gray-600 border border-gray-100 shadow-sm'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Product list */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {filteredProducts.map(product => {
              const isCombo = categories.find(c => c.id === product.category_id)?.name === 'Combos e Promoções';
              return (
                <div 
                  key={product.id} 
                  className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col group relative"
                >
                  {isCombo && (
                    <span className="absolute top-4 left-4 z-10 bg-amber-500 text-white text-[9px] font-black uppercase px-2.5 py-1 rounded-full shadow-md tracking-wider flex items-center gap-0.5">
                      <svg className="w-2.5 h-2.5 stroke-white fill-none" viewBox="0 0 24 24" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z" />
                      </svg>
                      PROMOÇÃO
                    </span>
                  )}

                  <div className="h-44 bg-gray-50 w-full overflow-hidden flex items-center justify-center relative">
                    {product.image_url ? (
                      <img 
                        src={product.image_url} 
                        alt={product.name} 
                        className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500" 
                        loading="lazy"
                      />
                    ) : (
                      <div className="text-sabor-primary bg-sabor-light w-full h-full flex items-center justify-center">
                        <svg className="w-10 h-10 stroke-sabor-primary fill-none opacity-30" viewBox="0 0 24 24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 2v4M17 2v4M7 2v4M2 12c0 4.418 4.477 8 10 8s10-3.582 10-8H2z"></path>
                        </svg>
                      </div>
                    )}
                    {!product.is_available && (
                      <div className="absolute inset-0 bg-white/80 backdrop-blur-xs flex items-center justify-center">
                        <span className="bg-rose-100 text-rose-700 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">
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
                    <p className="text-gray-400 text-xs mb-5 line-clamp-2 leading-relaxed">{product.description || 'Delicioso prato típico paraense.'}</p>
                    
                    <button 
                      disabled={!product.is_available}
                      onClick={() => setTargetProduct(product)}
                      className="w-full py-3 bg-sabor-light text-sabor-dark font-extrabold text-sm rounded-xl hover:bg-sabor-primary hover:text-sabor-dark transition-all disabled:opacity-45 mt-auto flex items-center justify-center gap-1.5"
                    >
                      <svg className="w-4 h-4 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                      </svg>
                      <span>Pedir Prato</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center text-gray-400 py-16 bg-white rounded-3xl border border-gray-100 shadow-sm">
              Nenhum prato disponível nesta categoria.
            </div>
          )}

        </div>

        {/* Right Side: Active Comanda Cart & Timeline (span 4) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Active Items in Kitchen status card */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col">
            <h2 className="text-lg font-black text-gray-900 mb-4 pb-2 border-b flex items-center gap-2">
              <span>🍳</span> Seu Pedido Atual
            </h2>

            {activeOrder.items.length === 0 ? (
              <div className="text-center p-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-gray-400 font-semibold text-xs leading-relaxed">
                Você ainda não fez nenhum pedido nesta mesa. Adicione delícias regionais ao lado! 😋
              </div>
            ) : (
              <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1 custom-scrollbar">
                {activeOrder.items.map(item => (
                  <div key={item.id} className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 flex justify-between items-start gap-2">
                    <div className="flex-1">
                      <p className="font-extrabold text-gray-800 text-xs">
                        <span className="text-sabor-dark font-black mr-1">{item.quantity}x</span>
                        {item.product.name}
                      </p>
                      {item.notes && <p className="text-[10px] text-amber-600 font-semibold mt-0.5">⚠️ {item.notes}</p>}
                      <p className="text-[10px] text-gray-400 mt-1">R$ {(Number(item.unit_price) * item.quantity).toFixed(2)}</p>
                    </div>

                    {/* Kitchen Status Badge */}
                    <div className="shrink-0">
                      {item.status === 'Pendente' ? (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[9px] font-black uppercase rounded-full border border-gray-200">
                          Pendente
                        </span>
                      ) : item.status === 'Em Preparo' ? (
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[9px] font-black uppercase rounded-full border border-amber-200 animate-pulse">
                          Preparando
                        </span>
                      ) : item.status === 'Pronto' ? (
                        <span className="px-2 py-0.5 bg-sky-100 text-sky-800 text-[9px] font-black uppercase rounded-full border border-sky-200 animate-bounce">
                          Pronto!
                        </span>
                      ) : item.status === 'Cancelado' ? (
                        <span className="px-2 py-0.5 bg-rose-100 text-rose-800 text-[9px] font-black uppercase rounded-full border border-rose-200">
                          Cancelado
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[9px] font-black uppercase rounded-full border border-emerald-200">
                          Entregue
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Total balance section */}
            {activeOrder.items.length > 0 && (
              <div className="border-t border-dashed border-gray-200 pt-4 mt-6 space-y-2">
                <div className="flex justify-between text-xs font-semibold text-gray-500">
                  <span>Subtotal Consumido</span>
                  <span>R$ {Number(activeOrder.total_amount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs font-semibold text-gray-500">
                  <span>Taxa de Serviço (10%)</span>
                  <span>R$ {(Number(activeOrder.total_amount) * 0.1).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-end border-t border-gray-100 pt-3">
                  <span className="text-xs font-extrabold text-gray-900 uppercase">Conta Parcial</span>
                  <span className="text-lg font-black text-gray-900">
                    R$ {(Number(activeOrder.total_amount) * 1.1).toFixed(2)}
                  </span>
                </div>
                
                <p className="text-[10px] text-gray-400 font-semibold text-center mt-4">
                  A conta poderá ser dividida ou quitada no caixa ao final da sua refeição.
                </p>
              </div>
            )}

          </div>

        </div>

      </div>

      {/* Floating Add Item Modal */}
      {targetProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-[200] animate-fade-in">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl border border-gray-100 animate-scale-in">
            <h3 className="text-lg font-black text-gray-900 mb-4 pb-2 border-b flex justify-between items-center">
              <span>🥣 Adicionar à Mesa {selectedTable.number}</span>
              <button 
                onClick={() => { setTargetProduct(null); setQuantity(1); setNotes(''); }}
                className="text-gray-400 hover:text-gray-600 font-black text-sm"
              >
                ✕
              </button>
            </h3>

            <div className="flex items-center gap-3 mb-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <div className="w-12 h-12 rounded-full bg-sabor-light text-sabor-dark font-black text-lg flex items-center justify-center border border-sabor-primary/20 shrink-0">
                ⭐
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-gray-900 leading-tight">{targetProduct.name}</h4>
                <p className="text-[10px] text-gray-400 font-semibold mt-1">R$ {Number(targetProduct.price).toFixed(2)} / unidade</p>
              </div>
            </div>

            <form onSubmit={handleLaunchItem} className="space-y-5">
              
              {/* Quantity selectors */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Quantidade</span>
                <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-3 py-1.5">
                  <button 
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="text-gray-500 hover:text-gray-700 font-extrabold text-sm"
                  >
                    －
                  </button>
                  <span className="text-sm font-black text-gray-900 w-6 text-center">{quantity}</span>
                  <button 
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="text-gray-500 hover:text-gray-700 font-extrabold text-sm"
                  >
                    ＋
                  </button>
                </div>
              </div>

              {/* Special Requests/Notes */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Observações do Preparo</label>
                <input 
                  type="text" 
                  placeholder="Ex: Sem cebola, bem passado..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full border-gray-200 rounded-xl focus:ring-sabor-primary focus:border-sabor-primary text-sm font-semibold p-3"
                />
              </div>

              <div className="border-t border-gray-100 pt-4 flex items-center justify-between text-sm">
                <span className="font-bold text-gray-500">Valor Total</span>
                <span className="font-black text-gray-900 text-lg">R$ {(Number(targetProduct.price) * quantity).toFixed(2)}</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button 
                  type="button"
                  onClick={() => { setTargetProduct(null); setQuantity(1); setNotes(''); }}
                  className="w-full py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-600 font-extrabold text-sm rounded-xl transition-all"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={submittingItem}
                  className="w-full py-3.5 bg-sabor-primary hover:bg-sabor-primary/95 text-sabor-dark font-black text-sm rounded-xl transition-all shadow-[0_6px_18px_rgba(74,222,128,0.2)] disabled:opacity-50"
                >
                  {submittingItem ? 'Enviando...' : 'Fazer Pedido 🍳'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
