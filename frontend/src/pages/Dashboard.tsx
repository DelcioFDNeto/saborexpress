import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, 
  AreaChart, Area, CartesianGrid 
} from 'recharts';

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
}

export default function Dashboard() {
  const [kpis, setKpis] = useState<KPIs | null>(null);
  const [abcCurve, setAbcCurve] = useState<ABCItem[]>([]);
  const [revenueChart, setRevenueChart] = useState<RevenuePoint[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('all');
  
  // New User Form State
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState('waiter');
  const [isCreatingUser, setIsCreatingUser] = useState(false);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const res = await api.get(`/dashboard?period=${period}`, { headers });
      setKpis(res.data.kpis);
      setAbcCurve(res.data.abc_curve || []);
      setRevenueChart(res.data.revenue_chart || []);
      
      const usersRes = await api.get(`/users`, { headers });
      setUsers(usersRes.data);
    } catch (err) {
      console.error(err);
      alert('Erro ao carregar dados do painel gerencial.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [period]);

  const formatCurrency = (value: number) => {
    return `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  if (loading && !kpis) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sabor-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        
        {/* Header with Period Filter */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Painel Gerencial</h1>
            <p className="text-gray-500 font-medium mt-1">Visão estratégica e indicadores de performance (KPIs).</p>
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

        {/* KPI Cards */}
        {kpis && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {/* Faturamento Bruto */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-sabor-light rounded-bl-full -mr-4 -mt-4 opacity-50 z-0"></div>
              <span className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2 z-10">Faturamento Bruto</span>
              <span className="text-3xl font-black text-gray-900 z-10">
                {formatCurrency(kpis.gross_revenue)}
              </span>
              <div className="mt-4 text-xs font-bold text-sabor-primary bg-sabor-light w-fit px-2 py-1 rounded-md z-10">Total recebido</div>
            </div>

            {/* Ticket Médio */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-bl-full -mr-4 -mt-4 opacity-50 z-0"></div>
              <span className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2 z-10">Ticket Médio</span>
              <span className="text-3xl font-black text-gray-900 z-10">
                {formatCurrency(kpis.average_ticket)}
              </span>
              <div className="mt-4 text-xs font-bold text-indigo-600 bg-indigo-50 w-fit px-2 py-1 rounded-md z-10">Por comanda finalizada</div>
            </div>

            {/* Comandas Finalizadas */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-4 -mt-4 opacity-50 z-0"></div>
              <span className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2 z-10">Contas Pagas</span>
              <span className="text-3xl font-black text-gray-900 z-10">{kpis.completed_orders}</span>
              <div className="mt-4 text-xs font-bold text-blue-600 bg-blue-50 w-fit px-2 py-1 rounded-md z-10">Comandas finalizadas</div>
            </div>

            {/* Comandas Ativas */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-bl-full -mr-4 -mt-4 opacity-50 z-0"></div>
              <span className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2 z-10">Em Andamento</span>
              <span className="text-3xl font-black text-gray-900 z-10">{kpis.active_orders}</span>
              <div className="mt-4 text-xs font-bold text-amber-600 bg-amber-50 w-fit px-2 py-1 rounded-md z-10">Mesas / Delivery ativos</div>
            </div>
          </div>
        )}

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          
          {/* Revenue Chart */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Faturamento no Tempo</h2>
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
                    <YAxis 
                      tick={{fontSize: 12, fill: '#6b7280'}} 
                      axisLine={false} 
                      tickLine={false}
                      tickFormatter={(value) => `R$${value}`}
                    />
                    <Tooltip 
                      formatter={(value: any) => [formatCurrency(value), 'Faturamento']}
                      labelFormatter={(label) => `Data: ${label}`}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#059669" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-72 flex items-center justify-center text-gray-400 font-medium bg-gray-50 rounded-2xl">
                Sem dados para o período selecionado.
              </div>
            )}
          </div>

          {/* ABC Curve Chart */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Curva ABC (Top 10 Produtos)</h2>
            {abcCurve.length > 0 ? (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={abcCurve} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f3f4f6" />
                    <XAxis type="number" hide />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      width={120} 
                      tick={{fontSize: 12, fill: '#374151', fontWeight: 600}} 
                      axisLine={false} 
                      tickLine={false} 
                    />
                    <Tooltip 
                      formatter={(value: any, name: any) => {
                        if (name === 'total_revenue') return [formatCurrency(value), 'Faturamento'];
                        return [value, 'Qtd. Vendida'];
                      }}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="total_revenue" radius={[0, 4, 4, 0]} maxBarSize={30}>
                      {abcCurve.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index < 3 ? '#fbbf24' : '#10b981'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-72 flex items-center justify-center text-gray-400 font-medium bg-gray-50 rounded-2xl">
                Nenhuma venda finalizada no período.
              </div>
            )}
          </div>

        </div>

        {/* Gerenciamento de Equipe */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Gerenciamento de Equipe</h2>
              <p className="text-sm text-gray-500 mt-1">Crie e gerencie contas de funcionários do SaborExpress.</p>
            </div>
          </div>
          
          <div className="p-6 border-b border-gray-100 bg-white">
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4">Adicionar Novo Colaborador</h3>
            <form 
              className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end"
              onSubmit={async (e) => {
                e.preventDefault();
                setIsCreatingUser(true);
                try {                  const token = localStorage.getItem('token');
                  await api.post(`/users`, {
                    name: newUserName,
                    email: newUserEmail,
                    password: newUserPassword,
                    role: newUserRole
                  }, {
                    headers: { Authorization: `Bearer ${token}` }
                  });
                  alert('Usuário criado com sucesso!');
                  setNewUserName('');
                  setNewUserEmail('');
                  setNewUserPassword('');
                  fetchDashboardData();
                } catch (err: any) {
                  alert('Erro ao criar usuário: ' + (err.response?.data?.message || 'Falha na requisição.'));
                } finally {
                  setIsCreatingUser(false);
                }
              }}
            >
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Nome</label>
                <input type="text" required value={newUserName} onChange={e => setNewUserName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-sabor-primary focus:border-sabor-primary sm:text-sm" placeholder="Ex: João da Silva" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">E-mail</label>
                <input type="email" required value={newUserEmail} onChange={e => setNewUserEmail(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-sabor-primary focus:border-sabor-primary sm:text-sm" placeholder="joao@sabor.com" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Senha</label>
                <input type="password" required value={newUserPassword} onChange={e => setNewUserPassword(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-sabor-primary focus:border-sabor-primary sm:text-sm" placeholder="Mínimo 6 chars" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Cargo</label>
                <select value={newUserRole} onChange={e => setNewUserRole(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-sabor-primary focus:border-sabor-primary sm:text-sm bg-white">
                  <option value="waiter">Garçom</option>
                  <option value="kitchen">Cozinheiro</option>
                  <option value="cashier">Caixa</option>
                  <option value="delivery">Entregador</option>
                  <option value="administrator">Administrador</option>
                </select>
              </div>
              <div>
                <button type="submit" disabled={isCreatingUser} className="w-full py-2 bg-sabor-primary hover:bg-sabor-dark text-white rounded-lg font-bold text-sm transition-colors">
                  {isCreatingUser ? 'Criando...' : 'Criar Conta'}
                </button>
              </div>
            </form>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="p-4 font-bold text-gray-500 text-sm uppercase tracking-wider">ID</th>
                  <th className="p-4 font-bold text-gray-500 text-sm uppercase tracking-wider">Nome</th>
                  <th className="p-4 font-bold text-gray-500 text-sm uppercase tracking-wider">E-mail</th>
                  <th className="p-4 font-bold text-gray-500 text-sm uppercase tracking-wider">Cargo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 font-bold text-gray-500">#{u.id}</td>
                    <td className="p-4 font-bold text-gray-900">{u.name}</td>
                    <td className="p-4 font-medium text-gray-600">{u.email}</td>
                    <td className="p-4 font-medium">
                      <span className="bg-sabor-light text-sabor-dark px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider">
                        {u.role === 'client' ? 'Cliente' : u.role}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

