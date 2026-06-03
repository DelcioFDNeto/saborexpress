import { api } from './api';

export const MENU_STALE_TIME = 5 * 60 * 1000;
export const DASHBOARD_STALE_TIME = 30 * 1000;
export const ADMIN_LIST_STALE_TIME = 60 * 1000;
export const AUDIT_STALE_TIME = 15 * 1000;

export const queryKeys = {
  menu: (productsPath = '/products') => ['menu', productsPath] as const,
  dashboard: (period: string) => ['dashboard', period] as const,
  tables: ['tables'] as const,
  users: ['users'] as const,
  audit: (params: AuditQueryParams) => ['audit-events', params] as const,
};

export interface Category {
  id: number;
  name: string;
  description?: string;
  products_count?: number;
}

export interface Product {
  id: number;
  category_id: number;
  name: string;
  description: string;
  price: string;
  is_available: boolean;
  image_url?: string | null;
  stock_quantity?: number | null;
  category?: {
    id: number;
    name: string;
  };
}

export interface AuditQueryParams {
  page: number;
  event?: string;
  userId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export async function fetchMenuData(productsPath = '/products') {
  const [catRes, prodRes] = await Promise.all([
    api.get('/categories'),
    api.get(productsPath),
  ]);

  return {
    categories: (catRes.data.data || catRes.data || []) as Category[],
    products: (prodRes.data.data || prodRes.data || []) as Product[],
  };
}

export async function fetchDashboardData(period: string) {
  const res = await api.get(`/dashboard?period=${period}`);

  return {
    kpis: res.data.kpis,
    abcCurve: res.data.abc_curve || [],
    revenueChart: res.data.revenue_chart || [],
    channelsData: res.data.channels || [],
    methodsData: res.data.payment_methods || [],
    operatorsData: res.data.operators || [],
  };
}

export async function fetchTablesData() {
  const res = await api.get('/tables');
  return res.data.data || res.data || [];
}

export async function fetchUsersData() {
  const res = await api.get('/users');
  return res.data.data || res.data || [];
}

export async function fetchAuditData(params: AuditQueryParams) {
  const query = new URLSearchParams({ page: String(params.page) });

  if (params.event) query.set('event', params.event);
  if (params.userId) query.set('user_id', params.userId);
  if (params.dateFrom) query.set('date_from', params.dateFrom);
  if (params.dateTo) query.set('date_to', params.dateTo);

  const res = await api.get(`/audit-events?${query.toString()}`);

  return {
    events: res.data.data || res.data || [],
    pagination: res.data.meta || null,
  };
}
