import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, 
  AreaChart, Area, CartesianGrid 
} from 'recharts';
import { toast } from 'sonner';

interface KPIs {
  gross_revenue: number;
  average_ticket: number;
  completed_orders: number;
  active_orders: number;
}

interface ABCItem {
  id: number;
  name: string;
  total_sold: number;
  total_revenue: number;
}

interface RevenuePoint {
  date: string;
  revenue: number;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
}

interface Category {
  id: number;
  name: string;
  description: string;
  products_count?: number;
}

interface Product {
  id: number;
  category_id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  is_available: boolean;
  stock_quantity: number | null;
  category?: {
    id: number;
    name: string;
  };
}

interface Table {
  id: number;
  number: number;
  capacity: number;
  status: string;
}

interface AuditEvent {
  id: number;
  event: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
  auditable_type: string;
  auditable_id: number;
  description: string;
  metadata: any;
  created_at: string;
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'indicators' | 'menu' | 'tables' | 'team' | 'audit'>('indicators');
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('all');

  // Tab 1: Indicators State
  const [kpis, setKpis] = useState<KPIs | null>(null);
  const [abcCurve, setAbcCurve] = useState<ABCItem[]>([]);
  const [revenueChart, setRevenueChart] = useState<RevenuePoint[]>([]);
  const [channelsData, setChannelsData] = useState<any[]>([]);
  const [methodsData, setMethodsData] = useState<any[]>([]);
  const [operatorsData, setOperatorsData] = useState<any[]>([]);

  // Tab 2: Menu (Categories & Products) State
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | 'all'>('all');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // Category Form State
  const [catName, setCatName] = useState('');
  const [catDescription, setCatDescription] = useState('');
  const [showCatForm, setShowCatForm] = useState(false);

  // Product Form State
  const [prodName, setProdName] = useState('');
  const [prodDescription, setProdDescription] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodImageUrl, setProdImageUrl] = useState('');
  const [prodCategoryId, setProdCategoryId] = useState<string>('');
  const [prodStockQuantity, setProdStockQuantity] = useState('');
  const [prodIsAvailable, setProdIsAvailable] = useState(true);
  const [showProdForm, setShowProdForm] = useState(false);

  // Tab 3: Tables State
  const [tables, setTables] = useState<Table[]>([]);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [tableNumber, setTableNumber] = useState('');
  const [tableCapacity, setTableCapacity] = useState('');
  const [showTableForm, setShowTableForm] = useState(false);

  // Tab 4: Team/Users State
  const [users, setUsers] = useState<User[]>([]);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState('waiter');
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userPasswordChange, setUserPasswordChange] = useState('');

  // Tab 5: Audit Events State
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [auditFilterEvent, setAuditFilterEvent] = useState('');
  const [auditFilterUser, setAuditFilterUser] = useState('');
  const [auditDateFrom, setAuditDateFrom] = useState('');
  const [auditDateTo, setAuditDateTo] = useState('');
  const [auditPage, setAuditPage] = useState(1);
  const [auditPagination, setAuditPagination] = useState<any>(null);

  // Load Indicator Data
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/dashboard?period=${period}`);
      setKpis(res.data.kpis);
      setAbcCurve(res.data.abc_curve || []);
      setRevenueChart(res.data.revenue_chart || []);
      setChannelsData(res.data.channels || []);
      setMethodsData(res.data.payment_methods || []);
      setOperatorsData(res.data.operators || []);
    } catch (err: any) {
      console.error(err);
      toast.error('Erro ao carregar dados dos indicadores.');
    } finally {
      setLoading(false);
    }
  };

  // Load Menu Data
  const fetchMenuData = async () => {
    setLoading(true);
    try {
      const catRes = await api.get('/categories');
      setCategories(catRes.data.data || catRes.data);
      
      const prodRes = await api.get('/products?per_page=100');
      setProducts(prodRes.data.data || prodRes.data);
    } catch (err) {
      console.error(err);
      toast.error('Erro ao carregar dados do cardápio.');
    } finally {
      setLoading(false);
    }
  };

  // Load Tables
  const fetchTablesData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/tables');
      setTables(res.data.data || res.data);
    } catch (err) {
      console.error(err);
      toast.error('Erro ao carregar mesas.');
    } finally {
      setLoading(false);
    }
  };

  // Load Users
  const fetchUsersData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users');
      setUsers(res.data.data || res.data);
    } catch (err) {
      console.error(err);
      toast.error('Erro ao carregar equipe.');
    } finally {
      setLoading(false);
    }
  };

  // Load Audit Events
  const fetchAuditData = async () => {
    setLoading(true);
    try {
      let url = `/audit-events?page=${auditPage}`;
      if (auditFilterEvent) url += `&event=${auditFilterEvent}`;
      if (auditFilterUser) url += `&user_id=${auditFilterUser}`;
      if (auditDateFrom) url += `&date_from=${auditDateFrom}`;
      if (auditDateTo) url += `&date_to=${auditDateTo}`;
      
      const res = await api.get(url);
      setAuditEvents(res.data.data || res.data);
      setAuditPagination(res.data.meta || null);
    } catch (err) {
      console.error(err);
      toast.error('Erro ao carregar log de auditoria.');
    } finally {
      setLoading(false);
    }
  };

  // Tab switcher loader
  useEffect(() => {
    if (activeTab === 'indicators') {
      fetchDashboardData();
    } else if (activeTab === 'menu') {
      fetchMenuData();
    } else if (activeTab === 'tables') {
      fetchTablesData();
    } else if (activeTab === 'team') {
      fetchUsersData();
    } else if (activeTab === 'audit') {
      fetchAuditData();
    }
  }, [activeTab, period, auditPage]);

  const formatCurrency = (value: number) => {
    return `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // ==========================================
  // Tab 2: Category Action Handlers
  // ==========================================
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await api.put(`/categories/${editingCategory.id}`, { name: catName, description: catDescription });
        toast.success('Categoria atualizada com sucesso!');
      } else {
        await api.post('/categories', { name: catName, description: catDescription });
        toast.success('Categoria adicionada com sucesso!');
      }
      setCatName('');
      setCatDescription('');
      setEditingCategory(null);
      setShowCatForm(false);
      fetchMenuData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Falha ao salvar categoria.');
    }
  };

  const handleEditCategory = (cat: Category) => {
    setEditingCategory(cat);
    setCatName(cat.name);
    setCatDescription(cat.description);
    setShowCatForm(true);
  };

  const handleDeleteCategory = async (id: number) => {
    if (!confirm('Deseja realmente excluir esta categoria? Os produtos associados podem ficar órfãos.')) return;
    try {
      await api.delete(`/categories/${id}`);
      toast.success('Categoria excluída com sucesso!');
      fetchMenuData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao excluir categoria.');
    }
  };

  // ==========================================
  // Tab 2: Product Action Handlers
  // ==========================================
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: prodName,
      description: prodDescription,
      price: parseFloat(prodPrice),
      image_url: prodImageUrl,
      category_id: parseInt(prodCategoryId),
      stock_quantity: prodStockQuantity ? parseInt(prodStockQuantity) : null,
      is_available: prodIsAvailable
    };

    try {
      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, payload);
        toast.success('Produto atualizado com sucesso!');
      } else {
        await api.post('/products', payload);
        toast.success('Produto criado com sucesso!');
      }
      resetProductForm();
      fetchMenuData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Falha ao salvar produto.');
    }
  };

  const resetProductForm = () => {
    setProdName('');
    setProdDescription('');
    setProdPrice('');
    setProdImageUrl('');
    setProdCategoryId('');
    setProdStockQuantity('');
    setProdIsAvailable(true);
    setEditingProduct(null);
    setShowProdForm(false);
  };

  const handleEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setProdName(prod.name);
    setProdDescription(prod.description);
    setProdPrice(prod.price.toString());
    setProdImageUrl(prod.image_url || '');
    setProdCategoryId(prod.category_id.toString());
    setProdStockQuantity(prod.stock_quantity ? prod.stock_quantity.toString() : '');
    setProdIsAvailable(prod.is_available);
    setShowProdForm(true);
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm('Tem certeza que deseja remover este produto do cardápio?')) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Produto removido do cardápio com sucesso!');
      fetchMenuData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao deletar produto.');
    }
  };

  const handleToggleAvailability = async (prod: Product) => {
    try {
      const nextAvailability = !prod.is_available;
      await api.patch(`/products/${prod.id}/availability`, { is_available: nextAvailability });
      toast.success(`${prod.name} agora está ${nextAvailability ? 'Disponível' : 'Indisponível'}`);
      
      // Update local state without full reload
      setProducts(prev => prev.map(p => p.id === prod.id ? { ...p, is_available: nextAvailability } : p));
    } catch (err: any) {
      toast.error('Erro ao atualizar disponibilidade.');
    }
  };

  // ==========================================
  // Tab 3: Table Action Handlers
  // ==========================================
  const handleSaveTable = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        number: parseInt(tableNumber),
        capacity: parseInt(tableCapacity)
      };

      if (editingTable) {
        await api.put(`/tables/${editingTable.id}`, payload);
        toast.success('Mesa atualizada com sucesso!');
      } else {
        await api.post('/tables', payload);
        toast.success('Nova mesa criada com sucesso!');
      }
      setTableNumber('');
      setTableCapacity('');
      setEditingTable(null);
      setShowTableForm(false);
      fetchTablesData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao salvar mesa.');
    }
  };

  const handleEditTable = (table: Table) => {
    setEditingTable(table);
    setTableNumber(table.number.toString());
    setTableCapacity(table.capacity.toString());
    setShowTableForm(true);
  };

  const handleDeleteTable = async (id: number) => {
    if (!confirm('Deseja deletar esta mesa do sistema?')) return;
    try {
      await api.delete(`/tables/${id}`);
      toast.success('Mesa removida com sucesso!');
      fetchTablesData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao deletar mesa.');
    }
  };

  // ==========================================
  // Tab 4: Team/Users Action Handlers
  // ==========================================
  const handleCreateUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingUser(true);
    try {
      await api.post(`/users`, {
        name: newUserName,
        email: newUserEmail,
        password: newUserPassword,
        role: newUserRole
      });
      toast.success('Novo funcionário criado com sucesso!');
      setNewUserName('');
      setNewUserEmail('');
      setNewUserPassword('');
      fetchUsersData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Falha ao registrar colaborador.');
    } finally {
      setIsCreatingUser(false);
    }
  };

  const handleToggleUserStatus = async (u: User) => {
    try {
      if (u.is_active) {
        await api.patch(`/users/${u.id}/deactivate`);
        toast.warning(`Colaborador ${u.name} inativado!`);
      } else {
        await api.patch(`/users/${u.id}/activate`);
        toast.success(`Colaborador ${u.name} ativado com sucesso!`);
      }
      fetchUsersData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao alterar status.');
    }
  };

  const handleDeleteUser = async (u: User) => {
    if (!confirm(`Deseja excluir permanentemente a conta de ${u.name}?`)) return;
    try {
      await api.delete(`/users/${u.id}`);
      toast.success('Conta excluída com sucesso!');
      fetchUsersData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao excluir conta.');
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      await api.patch(`/users/${editingUser.id}/password`, { password: userPasswordChange });
      toast.success(`Senha de ${editingUser.name} alterada com sucesso!`);
      setUserPasswordChange('');
      setEditingUser(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao alterar senha.');
    }
  };

  // Filter products by selected category
  const filteredProducts = selectedCategoryId === 'all' 
    ? products 
    : products.filter(p => p.category_id === selectedCategoryId);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans">
      
      {/* Dynamic Left Sidebar on Desktop */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-300 md:min-h-screen flex flex-col border-r border-slate-800">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sabor-primary flex items-center justify-center font-black text-sabor-dark text-lg">S</div>
            <span className="font-extrabold text-white text-lg tracking-tight">SaborExpress</span>
          </div>
          <span className="bg-sabor-primary/10 text-sabor-primary border border-sabor-primary/20 px-2 py-0.5 rounded text-[10px] font-black uppercase">Gerencial</span>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible p-4 gap-1.5 scrollbar-none shrink-0">
          <button 
            onClick={() => setActiveTab('indicators')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all duration-200 whitespace-nowrap md:w-full ${
              activeTab === 'indicators' 
                ? 'bg-sabor-primary text-sabor-dark shadow-lg shadow-sabor-primary/10' 
                : 'hover:bg-slate-800 hover:text-white'
            }`}
          >
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2"></path></svg>
            Indicadores
          </button>
          
          <button 
            onClick={() => setActiveTab('menu')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all duration-200 whitespace-nowrap md:w-full ${
              activeTab === 'menu' 
                ? 'bg-sabor-primary text-sabor-dark shadow-lg shadow-sabor-primary/10' 
                : 'hover:bg-slate-800 hover:text-white'
            }`}
          >
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
            Cardápio
          </button>

          <button 
            onClick={() => setActiveTab('tables')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all duration-200 whitespace-nowrap md:w-full ${
              activeTab === 'tables' 
                ? 'bg-sabor-primary text-sabor-dark shadow-lg shadow-sabor-primary/10' 
                : 'hover:bg-slate-800 hover:text-white'
            }`}
          >
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
            Mesas
          </button>

          <button 
            onClick={() => setActiveTab('team')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all duration-200 whitespace-nowrap md:w-full ${
              activeTab === 'team' 
                ? 'bg-sabor-primary text-sabor-dark shadow-lg shadow-sabor-primary/10' 
                : 'hover:bg-slate-800 hover:text-white'
            }`}
          >
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
            Equipe
          </button>

          <button 
            onClick={() => setActiveTab('audit')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all duration-200 whitespace-nowrap md:w-full ${
              activeTab === 'audit' 
                ? 'bg-sabor-primary text-sabor-dark shadow-lg shadow-sabor-primary/10' 
                : 'hover:bg-slate-800 hover:text-white'
            }`}
          >
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
            Auditoria
          </button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 max-h-screen overflow-y-auto">
        
        {/* ========================================== */}
        {/* TAB 1: INDICATORS */}
        {/* ========================================== */}
        {activeTab === 'indicators' && (
          <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
              <div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">Painel de Indicadores</h1>
                <p className="text-gray-500 font-medium mt-1">Dados consolidados de faturamento, tickets e vendas.</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Período:</span>
                <select 
                  value={period} 
                  onChange={e => setPeriod(e.target.value)}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-bold text-gray-700 focus:ring-sabor-primary focus:border-sabor-primary shadow-sm cursor-pointer"
                >
                  <option value="today">Hoje</option>
                  <option value="7d">Últimos 7 Dias</option>
                  <option value="30d">Últimos 30 Dias</option>
                  <option value="all">Todo o Período</option>
                </select>
              </div>
            </div>

            {loading && !kpis ? (
              <div className="flex justify-center items-center py-24"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sabor-primary"></div></div>
            ) : (
              <>
                {kpis && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-sabor-light rounded-bl-full -mr-4 -mt-4 opacity-50 z-0"></div>
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 z-10">Faturamento Bruto</span>
                      <span className="text-3xl font-black text-gray-900 z-10">{formatCurrency(kpis.gross_revenue)}</span>
                      <div className="mt-4 text-xs font-bold text-sabor-primary bg-sabor-light w-fit px-2 py-1 rounded-md z-10">Total recebido</div>
                    </div>

                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-bl-full -mr-4 -mt-4 opacity-50 z-0"></div>
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 z-10">Ticket Médio</span>
                      <span className="text-3xl font-black text-gray-900 z-10">{formatCurrency(kpis.average_ticket)}</span>
                      <div className="mt-4 text-xs font-bold text-indigo-600 bg-indigo-50 w-fit px-2 py-1 rounded-md z-10">Por comanda fechada</div>
                    </div>

                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-4 -mt-4 opacity-50 z-0"></div>
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 z-10">Comandas Pagas</span>
                      <span className="text-3xl font-black text-gray-900 z-10">{kpis.completed_orders}</span>
                      <div className="mt-4 text-xs font-bold text-blue-600 bg-blue-50 w-fit px-2 py-1 rounded-md z-10">Finalizadas com sucesso</div>
                    </div>

                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-bl-full -mr-4 -mt-4 opacity-50 z-0"></div>
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 z-10">Contas Ativas</span>
                      <span className="text-3xl font-black text-gray-900 z-10">{kpis.active_orders}</span>
                      <div className="mt-4 text-xs font-bold text-amber-600 bg-amber-50 w-fit px-2 py-1 rounded-md z-10">Mesas & Entregas abertas</div>
                    </div>
                  </div>
                )}

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900 mb-6">Faturamento Recente</h2>
                    {revenueChart.length > 0 ? (
                      <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={revenueChart} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#059669" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                            <XAxis dataKey="date" tick={{fontSize: 12, fill: '#6b7280'}} axisLine={false} tickLine={false} />
                            <YAxis tick={{fontSize: 12, fill: '#6b7280'}} axisLine={false} tickLine={false} tickFormatter={val => `R$${val}`} />
                            <Tooltip formatter={(value: any) => [formatCurrency(value), 'Faturamento']} labelFormatter={l => `Data: ${l}`} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                            <Area type="monotone" dataKey="revenue" stroke="#059669" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="h-72 flex items-center justify-center text-gray-400 font-medium bg-gray-50 rounded-2xl">Nenhum faturamento registrado.</div>
                    )}
                  </div>

                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900 mb-6">Mais Vendidos (Top 10)</h2>
                    {abcCurve.length > 0 ? (
                      <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={abcCurve} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f3f4f6" />
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" width={120} tick={{fontSize: 11, fill: '#374151', fontWeight: 600}} axisLine={false} tickLine={false} />
                            <Tooltip formatter={(value: any, name: any) => name === 'total_revenue' ? [formatCurrency(value), 'Receita'] : [value, 'Qtd']} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                            <Bar dataKey="total_revenue" radius={[0, 4, 4, 0]} maxBarSize={24}>
                              {abcCurve.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={index < 3 ? '#fbbf24' : '#10b981'} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="h-72 flex items-center justify-center text-gray-400 font-medium bg-gray-50 rounded-2xl">Nenhum produto vendido.</div>
                    )}
                  </div>
                </div>

                {/* Advanced Breakdown Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                  {/* Channels Breakdown */}
                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-gray-900 mb-6">Faturamento por Canal</h2>
                      <div className="space-y-4">
                        {channelsData.map((c: any) => {
                          const totalChannels = channelsData.reduce((acc, curr) => acc + parseFloat(curr.total), 0);
                          const percent = totalChannels > 0 ? (parseFloat(c.total) / totalChannels) * 100 : 0;
                          return (
                            <div key={c.channel}>
                              <div className="flex justify-between text-sm font-semibold text-gray-700 mb-1.5">
                                <span className="flex items-center gap-1.5">
                                  {c.channel === 'Mesa' ? '🍽️' : c.channel === 'Delivery' ? '🚚' : '🛍️'} {c.channel}
                                </span>
                                <span>{formatCurrency(c.total)} ({percent.toFixed(0)}%)</span>
                              </div>
                              <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full ${
                                    c.channel === 'Mesa' ? 'bg-blue-500' : c.channel === 'Delivery' ? 'bg-purple-500' : 'bg-amber-500'
                                  }`}
                                  style={{ width: `${percent}%` }}
                                ></div>
                              </div>
                            </div>
                          );
                        })}
                        {channelsData.length === 0 && <p className="text-center text-gray-400 py-6 text-sm">Nenhum canal registrado.</p>}
                      </div>
                    </div>
                  </div>

                  {/* Payment Methods Breakdown */}
                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-gray-900 mb-6">Meios de Pagamento</h2>
                      <div className="space-y-4">
                        {methodsData.map((m: any) => {
                          const totalMethods = methodsData.reduce((acc, curr) => acc + parseFloat(curr.total), 0);
                          const percent = totalMethods > 0 ? (parseFloat(m.total) / totalMethods) * 100 : 0;
                          return (
                            <div key={m.method}>
                              <div className="flex justify-between text-sm font-semibold text-gray-700 mb-1.5">
                                <span className="flex items-center gap-1.5">
                                  {m.method === 'Pix' ? '📱' : m.method === 'Dinheiro' ? '💵' : '💳'} {m.method}
                                </span>
                                <span>{formatCurrency(m.total)} ({percent.toFixed(0)}%)</span>
                              </div>
                              <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full ${
                                    m.method === 'Pix' ? 'bg-emerald-500' : m.method === 'Dinheiro' ? 'bg-amber-500' : 'bg-indigo-500'
                                  }`}
                                  style={{ width: `${percent}%` }}
                                ></div>
                              </div>
                            </div>
                          );
                        })}
                        {methodsData.length === 0 && <p className="text-center text-gray-400 py-6 text-sm">Nenhum pagamento registrado.</p>}
                      </div>
                    </div>
                  </div>

                  {/* Operator Ranking */}
                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-gray-900 mb-6">Ranking de Operadores</h2>
                      <div className="space-y-3">
                        {operatorsData.map((o: any, idx: number) => (
                          <div key={o.operator} className="flex justify-between items-center p-3 bg-gray-50 rounded-2xl border border-gray-100">
                            <div className="flex items-center gap-3">
                              <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                                {idx + 1}
                              </span>
                              <span className="font-bold text-gray-800 text-sm">{o.operator}</span>
                            </div>
                            <span className="font-extrabold text-gray-900 text-sm">{formatCurrency(o.total)}</span>
                          </div>
                        ))}
                        {operatorsData.length === 0 && <p className="text-center text-gray-400 py-6 text-sm">Nenhum operador ativo.</p>}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ========================================== */}
        {/* TAB 2: MENU (CATEGORIES & PRODUCTS) */}
        {/* ========================================== */}
        {activeTab === 'menu' && (
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">Gestão de Cardápio</h1>
                <p className="text-gray-500 font-medium mt-1">Gerencie categorias, preços, imagens, disponibilidade e estoques.</p>
              </div>
              <div className="flex gap-3 w-full sm:w-auto">
                <button 
                  onClick={() => {
                    setEditingCategory(null);
                    setCatName('');
                    setCatDescription('');
                    setShowCatForm(true);
                  }}
                  className="flex-1 sm:flex-none px-4 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-xs hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5 shadow"
                >
                  ➕ Nova Categoria
                </button>
                <button 
                  onClick={() => {
                    resetProductForm();
                    if (categories.length > 0) {
                      setProdCategoryId(categories[0].id.toString());
                    }
                    setShowProdForm(true);
                  }}
                  className="flex-1 sm:flex-none px-4 py-2.5 bg-sabor-primary text-sabor-dark rounded-xl font-extrabold text-xs hover:bg-sabor-primary/95 transition-all flex items-center justify-center gap-1.5 shadow"
                >
                  ➕ Novo Produto
                </button>
              </div>
            </div>

            {/* Modal de Categoria */}
            {showCatForm && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-fade-in">
                  <h3 className="text-xl font-black text-gray-900 mb-4">{editingCategory ? '✏️ Editar Categoria' : '➕ Nova Categoria'}</h3>
                  <form onSubmit={handleSaveCategory} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Nome</label>
                      <input type="text" required value={catName} onChange={e => setCatName(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-sabor-primary focus:border-sabor-primary sm:text-sm" placeholder="Ex: Bebidas" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Descrição</label>
                      <textarea required value={catDescription} onChange={e => setCatDescription(e.target.value)} rows={3} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-sabor-primary focus:border-sabor-primary sm:text-sm" placeholder="Descrição da categoria" />
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button type="button" onClick={() => setShowCatForm(false)} className="flex-1 py-2.5 border border-gray-300 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors">Cancelar</button>
                      <button type="submit" className="flex-1 py-2.5 bg-sabor-primary text-sabor-dark rounded-xl font-black text-sm hover:bg-sabor-primary/95 transition-all">Salvar</button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Modal de Produto */}
            {showProdForm && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1000] flex items-center justify-center p-4 overflow-y-auto">
                <div className="bg-white rounded-3xl p-8 max-w-xl w-full shadow-2xl my-8 animate-fade-in">
                  <h3 className="text-xl font-black text-gray-900 mb-6">{editingProduct ? '✏️ Editar Produto' : '➕ Novo Produto'}</h3>
                  <form onSubmit={handleSaveProduct} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Nome</label>
                        <input type="text" required value={prodName} onChange={e => setProdName(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-sabor-primary focus:border-sabor-primary sm:text-sm" placeholder="Nome do produto" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Categoria</label>
                        <select required value={prodCategoryId} onChange={e => setProdCategoryId(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-sabor-primary focus:border-sabor-primary sm:text-sm bg-white">
                          <option value="" disabled>Selecione...</option>
                          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Preço (R$)</label>
                        <input type="number" step="0.01" required value={prodPrice} onChange={e => setProdPrice(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-sabor-primary focus:border-sabor-primary sm:text-sm" placeholder="Ex: 29.90" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Qtd Estoque (Opcional)</label>
                        <input type="number" value={prodStockQuantity} onChange={e => setProdStockQuantity(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-sabor-primary focus:border-sabor-primary sm:text-sm" placeholder="Sem controle se vazio" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">URL da Imagem</label>
                      <input type="url" required value={prodImageUrl} onChange={e => setProdImageUrl(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-sabor-primary focus:border-sabor-primary sm:text-sm" placeholder="https://images.unsplash.com/..." />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Descrição</label>
                      <textarea required value={prodDescription} onChange={e => setProdDescription(e.target.value)} rows={3} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-sabor-primary focus:border-sabor-primary sm:text-sm" placeholder="Descrição do produto..." />
                    </div>

                    <div className="flex items-center gap-3 py-2">
                      <input type="checkbox" id="avail" checked={prodIsAvailable} onChange={e => setProdIsAvailable(e.target.checked)} className="w-5 h-5 text-sabor-primary focus:ring-sabor-primary border-gray-300 rounded" />
                      <label htmlFor="avail" className="text-sm font-bold text-gray-700 select-none cursor-pointer">Disponível imediatamente para venda</label>
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-gray-100">
                      <button type="button" onClick={resetProductForm} className="flex-1 py-3 border border-gray-300 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors">Cancelar</button>
                      <button type="submit" className="flex-1 py-3 bg-sabor-primary text-sabor-dark rounded-xl font-black text-sm hover:bg-sabor-primary/95 transition-all">Salvar Produto</button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Layout Categorias + Produtos */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              
              {/* Categorias */}
              <div className="lg:col-span-1 space-y-3">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Categorias</h3>
                <button 
                  onClick={() => setSelectedCategoryId('all')}
                  className={`w-full text-left px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex justify-between items-center transition-all ${
                    selectedCategoryId === 'all' 
                      ? 'bg-slate-900 text-white shadow' 
                      : 'bg-white text-gray-600 border border-gray-100 hover:bg-gray-50'
                  }`}
                >
                  <span>Todos os Produtos</span>
                  <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[10px]">{products.length}</span>
                </button>

                {categories.map(c => (
                  <div key={c.id} className="relative group">
                    <button 
                      onClick={() => setSelectedCategoryId(c.id)}
                      className={`w-full text-left px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex justify-between items-center transition-all ${
                        selectedCategoryId === c.id 
                          ? 'bg-slate-900 text-white shadow' 
                          : 'bg-white text-gray-600 border border-gray-100 hover:bg-gray-50'
                      }`}
                    >
                      <span className="truncate pr-8">{c.name}</span>
                    </button>
                    
                    {/* Categoria Hover Action Buttons */}
                    <div className="absolute right-2 top-2.5 hidden group-hover:flex items-center gap-1 z-10 bg-inherit pl-1">
                      <button onClick={() => handleEditCategory(c)} title="Editar" className="p-1 hover:bg-gray-100 rounded text-slate-500 hover:text-slate-800 transition-colors">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                      </button>
                      <button onClick={() => handleDeleteCategory(c.id)} title="Excluir" className="p-1 hover:bg-gray-100 rounded text-rose-500 hover:text-rose-700 transition-colors">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Lista de Produtos */}
              <div className="lg:col-span-3">
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h3 className="font-extrabold text-gray-900">
                      {selectedCategoryId === 'all' ? 'Todos os Itens' : categories.find(c => c.id === selectedCategoryId)?.name || 'Produtos'}
                    </h3>
                    <span className="bg-sabor-light text-sabor-dark px-2.5 py-1 rounded-md text-xs font-black">{filteredProducts.length} itens</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50/20 border-b border-gray-100">
                          <th className="p-4 font-bold text-gray-500 text-xs uppercase tracking-wider">Item</th>
                          <th className="p-4 font-bold text-gray-500 text-xs uppercase tracking-wider">Categoria</th>
                          <th className="p-4 font-bold text-gray-500 text-xs uppercase tracking-wider">Preço</th>
                          <th className="p-4 font-bold text-gray-500 text-xs uppercase tracking-wider">Estoque</th>
                          <th className="p-4 font-bold text-gray-500 text-xs uppercase tracking-wider">Status</th>
                          <th className="p-4 font-bold text-gray-500 text-xs uppercase tracking-wider text-right">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredProducts.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="p-8 text-center text-gray-400 font-medium">Nenhum produto cadastrado nesta categoria.</td>
                          </tr>
                        ) : (
                          filteredProducts.map(p => (
                            <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                              <td className="p-4">
                                <div className="flex items-center gap-3">
                                  <img src={p.image_url} alt={p.name} className="w-10 h-10 object-cover rounded-lg bg-gray-100 border border-gray-100 shadow-inner" />
                                  <div>
                                    <div className="font-bold text-gray-900 text-sm">{p.name}</div>
                                    <div className="text-gray-400 text-xs truncate max-w-[200px]">{p.description}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="p-4 text-xs font-bold text-slate-500 uppercase">
                                {p.category?.name || categories.find(c => c.id === p.category_id)?.name || 'Sem Categoria'}
                              </td>
                              <td className="p-4 font-bold text-gray-900 text-sm">{formatCurrency(p.price)}</td>
                              <td className="p-4 text-sm font-semibold">
                                {p.stock_quantity !== null ? (
                                  <span className={`px-2 py-0.5 rounded font-bold ${p.stock_quantity <= 5 ? 'bg-rose-50 text-rose-600' : 'bg-gray-100 text-gray-700'}`}>
                                    {p.stock_quantity} un
                                  </span>
                                ) : (
                                  <span className="text-gray-400 font-medium">Ilimitado</span>
                                )}
                              </td>
                              <td className="p-4">
                                <button 
                                  onClick={() => handleToggleAvailability(p)}
                                  className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-colors ${
                                    p.is_available 
                                      ? 'bg-sabor-light text-sabor-dark hover:bg-emerald-100' 
                                      : 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                                  }`}
                                >
                                  {p.is_available ? 'Disponível' : 'Indisponível'}
                                </button>
                              </td>
                              <td className="p-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button onClick={() => handleEditProduct(p)} title="Editar" className="p-1.5 hover:bg-gray-100 rounded text-slate-500 hover:text-slate-800 transition-colors">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                                  </button>
                                  <button onClick={() => handleDeleteProduct(p.id)} title="Excluir" className="p-1.5 hover:bg-gray-100 rounded text-rose-500 hover:text-rose-700 transition-colors">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* TAB 3: TABLES */}
        {/* ========================================== */}
        {activeTab === 'tables' && (
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">Manutenção de Mesas</h1>
                <p className="text-gray-500 font-medium mt-1">Gerencie a estrutura física do salão do SaborExpress.</p>
              </div>
              <button 
                onClick={() => {
                  setEditingTable(null);
                  setTableNumber('');
                  setTableCapacity('');
                  setShowTableForm(true);
                }}
                className="px-4 py-2.5 bg-sabor-primary text-sabor-dark rounded-xl font-extrabold text-xs hover:bg-sabor-primary/95 transition-all flex items-center gap-1.5 shadow"
              >
                ➕ Adicionar Mesa
              </button>
            </div>

            {/* Modal de Mesas */}
            {showTableForm && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-fade-in">
                  <h3 className="text-xl font-black text-gray-900 mb-4">{editingTable ? '✏️ Editar Mesa' : '➕ Nova Mesa'}</h3>
                  <form onSubmit={handleSaveTable} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Número da Mesa</label>
                      <input type="number" required value={tableNumber} onChange={e => setTableNumber(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-sabor-primary focus:border-sabor-primary sm:text-sm" placeholder="Ex: 12" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Capacidade (Pessoas)</label>
                      <input type="number" required value={tableCapacity} onChange={e => setTableCapacity(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-sabor-primary focus:border-sabor-primary sm:text-sm" placeholder="Ex: 4" />
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button type="button" onClick={() => setShowTableForm(false)} className="flex-1 py-2.5 border border-gray-300 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors">Cancelar</button>
                      <button type="submit" className="flex-1 py-2.5 bg-sabor-primary text-sabor-dark rounded-xl font-black text-sm hover:bg-sabor-primary/95 transition-all">Salvar</button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* List of Tables */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                <h3 className="font-extrabold text-gray-900">Mesas Cadastradas</h3>
                <span className="bg-sabor-light text-sabor-dark px-2.5 py-1 rounded-md text-xs font-black">{tables.length} mesas</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/20 border-b border-gray-100">
                      <th className="p-4 font-bold text-gray-500 text-xs uppercase tracking-wider">Identificador</th>
                      <th className="p-4 font-bold text-gray-500 text-xs uppercase tracking-wider">Número</th>
                      <th className="p-4 font-bold text-gray-500 text-xs uppercase tracking-wider">Capacidade</th>
                      <th className="p-4 font-bold text-gray-500 text-xs uppercase tracking-wider">Status Operacional</th>
                      <th className="p-4 font-bold text-gray-500 text-xs uppercase tracking-wider text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {tables.map(t => (
                      <tr key={t.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="p-4 font-bold text-gray-500">Mesa #{t.id}</td>
                        <td className="p-4">
                          <span className="w-8 h-8 rounded-full bg-sabor-light text-sabor-dark font-extrabold text-sm flex items-center justify-center">
                            {t.number}
                          </span>
                        </td>
                        <td className="p-4 font-semibold text-gray-700">{t.capacity} pessoas</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
                            t.status === 'Livre' ? 'bg-sabor-light text-sabor-dark' :
                            t.status === 'Ocupada' ? 'bg-blue-50 text-blue-600' :
                            t.status === 'Reservada' ? 'bg-amber-50 text-amber-600' :
                            t.status === 'Fechamento' ? 'bg-indigo-50 text-indigo-600' :
                            'bg-gray-100 text-gray-500'
                          }`}>
                            {t.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => handleEditTable(t)} title="Editar" className="p-1.5 hover:bg-gray-100 rounded text-slate-500 hover:text-slate-800 transition-colors">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                            </button>
                            <button onClick={() => handleDeleteTable(t.id)} disabled={t.status !== 'Livre'} title="Excluir" className="p-1.5 hover:bg-gray-100 rounded text-rose-500 hover:text-rose-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* TAB 4: TEAM / USERS */}
        {/* ========================================== */}
        {activeTab === 'team' && (
          <div>
            <div className="mb-8">
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">Gestão da Equipe</h1>
              <p className="text-gray-500 font-medium mt-1">Gerencie os acessos, cargos operacionais e status das contas.</p>
            </div>

            {/* Password Modal */}
            {editingUser && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-fade-in">
                  <h3 className="text-xl font-black text-gray-900 mb-2">🔑 Alterar Senha</h3>
                  <p className="text-sm text-gray-500 mb-4">Atualizar senha de <span className="font-bold text-gray-900">{editingUser.name}</span></p>
                  <form onSubmit={handleUpdatePassword} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Nova Senha</label>
                      <input type="password" required minLength={6} value={userPasswordChange} onChange={e => setUserPasswordChange(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-sabor-primary focus:border-sabor-primary sm:text-sm" placeholder="Mínimo 6 caracteres" />
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button type="button" onClick={() => setEditingUser(null)} className="flex-1 py-2.5 border border-gray-300 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors">Cancelar</button>
                      <button type="submit" className="flex-1 py-2.5 bg-sabor-primary text-sabor-dark rounded-xl font-black text-sm hover:bg-sabor-primary/95 transition-all">Alterar Senha</button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Form to Register Collaborator */}
              <div className="lg:col-span-1">
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Adicionar Colaborador</h2>
                  <form onSubmit={handleCreateUserSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Nome Completo</label>
                      <input type="text" required value={newUserName} onChange={e => setNewUserName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-sabor-primary focus:border-sabor-primary sm:text-sm" placeholder="Ex: Lucas Nazaré" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">E-mail Corporativo</label>
                      <input type="email" required value={newUserEmail} onChange={e => setNewUserEmail(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-sabor-primary focus:border-sabor-primary sm:text-sm" placeholder="lucas@saborexpress.com" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Senha Provisória</label>
                      <input type="password" required minLength={6} value={newUserPassword} onChange={e => setNewUserPassword(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-sabor-primary focus:border-sabor-primary sm:text-sm" placeholder="Mínimo 6 caracteres" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Cargo / Perfil</label>
                      <select value={newUserRole} onChange={e => setNewUserRole(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-sabor-primary focus:border-sabor-primary sm:text-sm bg-white font-bold text-gray-700">
                        <option value="waiter">Garçom</option>
                        <option value="kitchen">Cozinha</option>
                        <option value="cashier">Caixa</option>
                        <option value="delivery">Entregador</option>
                        <option value="administrator">Administrador</option>
                      </select>
                    </div>
                    <button type="submit" disabled={isCreatingUser} className="w-full py-3 bg-sabor-primary hover:bg-sabor-dark text-white rounded-xl font-extrabold text-sm transition-all shadow-md mt-2">
                      {isCreatingUser ? 'Salvando...' : 'Salvar Novo Membro'}
                    </button>
                  </form>
                </div>
              </div>

              {/* Members List */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                    <h3 className="font-extrabold text-gray-900">Membros da Equipe</h3>
                    <span className="bg-sabor-light text-sabor-dark px-2.5 py-1 rounded-md text-xs font-black">{users.length} ativos</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50/20 border-b border-gray-100">
                          <th className="p-4 font-bold text-gray-500 text-xs uppercase tracking-wider">Nome</th>
                          <th className="p-4 font-bold text-gray-500 text-xs uppercase tracking-wider">Email</th>
                          <th className="p-4 font-bold text-gray-500 text-xs uppercase tracking-wider">Cargo</th>
                          <th className="p-4 font-bold text-gray-500 text-xs uppercase tracking-wider">Status</th>
                          <th className="p-4 font-bold text-gray-500 text-xs uppercase tracking-wider text-right">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {users.map(u => (
                          <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="p-4 font-bold text-gray-900 text-sm">{u.name}</td>
                            <td className="p-4 text-xs font-medium text-gray-600">{u.email}</td>
                            <td className="p-4">
                              <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider">
                                {u.role}
                              </span>
                            </td>
                            <td className="p-4">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                                u.is_active ? 'bg-sabor-light text-sabor-dark' : 'bg-red-50 text-red-600'
                              }`}>
                                {u.is_active ? 'Ativo' : 'Inativo'}
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button onClick={() => setEditingUser(u)} title="Alterar Senha" className="p-1 hover:bg-gray-100 rounded text-slate-500 hover:text-slate-800 transition-colors">
                                  🔑
                                </button>
                                <button onClick={() => handleToggleUserStatus(u)} title={u.is_active ? "Inativar" : "Ativar"} className={`p-1 hover:bg-gray-100 rounded transition-colors ${u.is_active ? 'text-amber-500' : 'text-emerald-500'}`}>
                                  {u.is_active ? '🚫' : '✅'}
                                </button>
                                <button onClick={() => handleDeleteUser(u)} title="Excluir Conta" className="p-1 hover:bg-gray-100 rounded text-rose-500 hover:text-rose-700 transition-colors">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* TAB 5: AUDIT */}
        {/* ========================================== */}
        {activeTab === 'audit' && (
          <div>
            <div className="mb-8">
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">Logs de Auditoria</h1>
              <p className="text-gray-500 font-medium mt-1">Acompanhamento e histórico de ações críticas realizadas por usuários.</p>
            </div>

            {/* Filter Panel */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Evento</label>
                  <input type="text" value={auditFilterEvent} onChange={e => setAuditFilterEvent(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Ex: CategoryCreated" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">ID do Usuário</label>
                  <input type="number" value={auditFilterUser} onChange={e => setAuditFilterUser(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Ex: 1" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">De (Data)</label>
                  <input type="date" value={auditDateFrom} onChange={e => setAuditDateFrom(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Até (Data)</label>
                  <input type="date" value={auditDateTo} onChange={e => setAuditDateTo(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                </div>
              </div>
              <div className="flex gap-3 justify-end mt-4 pt-4 border-t border-gray-100">
                <button 
                  onClick={() => {
                    setAuditFilterEvent('');
                    setAuditFilterUser('');
                    setAuditDateFrom('');
                    setAuditDateTo('');
                    setAuditPage(1);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Limpar Filtros
                </button>
                <button 
                  onClick={() => {
                    setAuditPage(1);
                    fetchAuditData();
                  }}
                  className="px-6 py-2 bg-sabor-primary text-sabor-dark font-extrabold rounded-lg text-sm hover:bg-sabor-primary/90 transition-colors"
                >
                  🔍 Filtrar Logs
                </button>
              </div>
            </div>

            {/* Events Log Table */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                <h3 className="font-extrabold text-gray-900">Eventos Auditados</h3>
                <span className="bg-sabor-light text-sabor-dark px-2.5 py-1 rounded-md text-xs font-black">{auditEvents.length} listados</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/20 border-b border-gray-100">
                      <th className="p-4 font-bold text-gray-500 text-xs uppercase tracking-wider">Timestamp</th>
                      <th className="p-4 font-bold text-gray-500 text-xs uppercase tracking-wider">Evento</th>
                      <th className="p-4 font-bold text-gray-500 text-xs uppercase tracking-wider">Usuário</th>
                      <th className="p-4 font-bold text-gray-500 text-xs uppercase tracking-wider">Descrição / Ação</th>
                      <th className="p-4 font-bold text-gray-500 text-xs uppercase tracking-wider">Recurso ID</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {auditEvents.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-gray-400 font-medium">Nenhum evento registrado com os filtros informados.</td>
                      </tr>
                    ) : (
                      auditEvents.map(ev => (
                        <tr key={ev.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="p-4 text-xs text-gray-500 font-medium whitespace-nowrap">
                            {new Date(ev.created_at).toLocaleString('pt-BR')}
                          </td>
                          <td className="p-4 font-bold text-emerald-700 text-xs">
                            {ev.event}
                          </td>
                          <td className="p-4">
                            {ev.user ? (
                              <div>
                                <span className="font-bold text-gray-900 block text-xs">{ev.user.name}</span>
                                <span className="text-gray-400 text-[10px] block font-medium">{ev.user.email}</span>
                              </div>
                            ) : (
                              <span className="text-gray-400 font-medium text-xs">Sistema / Anônimo</span>
                            )}
                          </td>
                          <td className="p-4 text-gray-600 font-medium text-xs leading-relaxed">
                            {ev.description || 'Nenhuma descrição fornecida.'}
                          </td>
                          <td className="p-4">
                            <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono text-xs">
                              {ev.auditable_type.split('\\').pop()}:{ev.auditable_id}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination controls */}
              {auditPagination && auditPagination.last_page > 1 && (
                <div className="p-6 border-t border-gray-100 flex items-center justify-between bg-gray-50/20">
                  <span className="text-xs text-gray-500 font-medium">Página {auditPage} de {auditPagination.last_page}</span>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setAuditPage(prev => Math.max(1, prev - 1))}
                      disabled={auditPage === 1}
                      className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      Anterior
                    </button>
                    <button 
                      onClick={() => setAuditPage(prev => Math.min(auditPagination.last_page, prev + 1))}
                      disabled={auditPage === auditPagination.last_page}
                      className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      Próxima
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
