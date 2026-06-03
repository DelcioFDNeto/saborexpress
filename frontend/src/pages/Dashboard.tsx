import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ADMIN_LIST_STALE_TIME,
  AUDIT_STALE_TIME,
  DASHBOARD_STALE_TIME,
  fetchAuditData,
  fetchDashboardData,
  fetchMenuData,
  fetchTablesData,
  fetchUsersData,
  queryKeys,
} from '../lib/queries';

// Import subcomponents
import DashboardKPIs from '../components/dashboard/DashboardKPIs';
import DashboardCatalog from '../components/dashboard/DashboardCatalog';
import DashboardTables from '../components/dashboard/DashboardTables';
import DashboardStaff from '../components/dashboard/DashboardStaff';
import DashboardClients from '../components/dashboard/DashboardClients';
import DashboardAudit from '../components/dashboard/DashboardAudit';

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
  metadata: Record<string, unknown>;
  created_at: string;
}

export default function Dashboard() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'indicators' | 'menu' | 'tables' | 'team' | 'clients' | 'audit'>('indicators');
  const [period, setPeriod] = useState('all');

  const [auditFilterEvent, setAuditFilterEvent] = useState('');
  const [auditFilterUser, setAuditFilterUser] = useState('');
  const [auditDateFrom, setAuditDateFrom] = useState('');
  const [auditDateTo, setAuditDateTo] = useState('');
  const [auditPage, setAuditPage] = useState(1);

  const auditParams = useMemo(() => ({
    page: auditPage,
    event: auditFilterEvent,
    userId: auditFilterUser,
    dateFrom: auditDateFrom,
    dateTo: auditDateTo,
  }), [auditDateFrom, auditDateTo, auditFilterEvent, auditFilterUser, auditPage]);

  const dashboardQuery = useQuery({
    queryKey: queryKeys.dashboard(period),
    queryFn: () => fetchDashboardData(period),
    staleTime: DASHBOARD_STALE_TIME,
    enabled: activeTab === 'indicators',
  });

  const menuQuery = useQuery({
    queryKey: queryKeys.menu('/products?per_page=100'),
    queryFn: () => fetchMenuData('/products?per_page=100'),
    staleTime: ADMIN_LIST_STALE_TIME,
    enabled: activeTab === 'menu',
  });

  const tablesQuery = useQuery({
    queryKey: queryKeys.tables,
    queryFn: fetchTablesData,
    staleTime: ADMIN_LIST_STALE_TIME,
    enabled: activeTab === 'tables',
  });

  const usersQuery = useQuery({
    queryKey: queryKeys.users,
    queryFn: fetchUsersData,
    staleTime: ADMIN_LIST_STALE_TIME,
    enabled: activeTab === 'team' || activeTab === 'clients',
  });

  const auditQuery = useQuery({
    queryKey: queryKeys.audit(auditParams),
    queryFn: () => fetchAuditData(auditParams),
    staleTime: AUDIT_STALE_TIME,
    enabled: activeTab === 'audit',
  });

  const kpis = (dashboardQuery.data?.kpis || null) as KPIs | null;
  const abcCurve = (dashboardQuery.data?.abcCurve || []) as ABCItem[];
  const revenueChart = (dashboardQuery.data?.revenueChart || []) as RevenuePoint[];
  const channelsData = (dashboardQuery.data?.channelsData || []) as Record<string, string>[];
  const methodsData = (dashboardQuery.data?.methodsData || []) as Record<string, string>[];
  const operatorsData = (dashboardQuery.data?.operatorsData || []) as Record<string, string>[];
  const categories = (menuQuery.data?.categories || []) as Category[];
  const products = (menuQuery.data?.products || []).map((product: any) => ({
    ...product,
    price: Number(product.price),
    image_url: product.image_url || '',
  })) as Product[];
  const tables = (tablesQuery.data || []) as Table[];
  const users = (usersQuery.data || []) as User[];
  const auditEvents = (auditQuery.data?.events || []) as AuditEvent[];
  const auditPagination = auditQuery.data?.pagination || null;

  const kpisLoading = dashboardQuery.isLoading;
  const menuLoading = menuQuery.isLoading;
  const tablesLoading = tablesQuery.isLoading;
  const teamLoading = usersQuery.isLoading;
  const auditLoading = auditQuery.isLoading;

  const refetchMenuData = async () => {
    await queryClient.invalidateQueries({ queryKey: ['menu'] });
  };

  const refetchTablesData = async () => {
    await tablesQuery.refetch();
  };

  const refetchUsersData = async () => {
    await usersQuery.refetch();
  };

  const refetchAuditData = async () => {
    await auditQuery.refetch();
  };

  useEffect(() => {
    if (dashboardQuery.isError) toast.error('Erro ao carregar dados dos indicadores.');
    if (menuQuery.isError) toast.error('Erro ao carregar dados do cardápio.');
    if (tablesQuery.isError) toast.error('Erro ao carregar mesas.');
    if (usersQuery.isError) toast.error('Erro ao carregar equipe.');
    if (auditQuery.isError) toast.error('Erro ao carregar log de auditoria.');
  }, [
    dashboardQuery.isError,
    menuQuery.isError,
    tablesQuery.isError,
    usersQuery.isError,
    auditQuery.isError,
  ]);

  return (
    <div className="flex flex-col md:flex-row bg-slate-900 font-sans min-h-[calc(100vh-88px)] md:h-[calc(100vh-88px)] overflow-hidden">
      
      {/* Dynamic Left Sidebar on Desktop */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 shrink-0 md:h-full">
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
            Gestão de Cardápio
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
            Gestão de Mesas
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
            Colaboradores
          </button>

          <button 
            onClick={() => setActiveTab('clients')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all duration-200 whitespace-nowrap md:w-full ${
              activeTab === 'clients' 
                ? 'bg-sabor-primary text-sabor-dark shadow-lg shadow-sabor-primary/10' 
                : 'hover:bg-slate-800 hover:text-white'
            }`}
          >
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
            Clientes
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
      <main className="flex-1 p-6 md:p-10 overflow-y-auto md:h-full bg-gray-50">
        {activeTab === 'indicators' && (
          <DashboardKPIs 
            kpis={kpis}
            abcCurve={abcCurve}
            revenueChart={revenueChart}
            channelsData={channelsData}
            methodsData={methodsData}
            operatorsData={operatorsData}
            kpisLoading={kpisLoading}
            period={period}
            setPeriod={setPeriod}
          />
        )}

        {activeTab === 'menu' && (
          <DashboardCatalog 
            categories={categories}
            products={products}
            menuLoading={menuLoading}
            onRefresh={refetchMenuData}
          />
        )}

        {activeTab === 'tables' && (
          <DashboardTables 
            tables={tables}
            tablesLoading={tablesLoading}
            onRefresh={refetchTablesData}
          />
        )}

        {activeTab === 'team' && (
          <DashboardStaff 
            users={users}
            teamLoading={teamLoading}
            onRefresh={refetchUsersData}
          />
        )}

        {activeTab === 'clients' && (
          <DashboardClients 
            users={users}
            teamLoading={teamLoading}
            onRefresh={refetchUsersData}
          />
        )}

        {activeTab === 'audit' && (
          <DashboardAudit 
            auditEvents={auditEvents}
            auditLoading={auditLoading}
            auditPagination={auditPagination}
            auditPage={auditPage}
            setAuditPage={setAuditPage}
            auditFilterEvent={auditFilterEvent}
            setAuditFilterEvent={setAuditFilterEvent}
            auditFilterUser={auditFilterUser}
            setAuditFilterUser={setAuditFilterUser}
            auditDateFrom={auditDateFrom}
            setAuditDateFrom={setAuditDateFrom}
            auditDateTo={auditDateTo}
            setAuditDateTo={setAuditDateTo}
            onRefresh={refetchAuditData}
          />
        )}
      </main>
    </div>
  );
}
