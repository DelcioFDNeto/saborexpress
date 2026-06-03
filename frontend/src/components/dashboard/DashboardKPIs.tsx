
import { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, 
  AreaChart, Area, CartesianGrid 
} from 'recharts';
import { DollarSign, TrendingUp, CheckCircle2, Activity, Calendar } from 'lucide-react';

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

interface DashboardKPIsProps {
  kpis: KPIs | null;
  abcCurve: ABCItem[];
  revenueChart: RevenuePoint[];
  channelsData: Record<string, string>[];
  methodsData: Record<string, string>[];
  operatorsData: Record<string, string>[];
  kpisLoading: boolean;
  period: string;
  setPeriod: (p: string) => void;
}

// Micro-animation component for counting numbers
function AnimatedCounter({ value, duration = 1200, isCurrency = false }: { value: number; duration?: number; isCurrency?: boolean }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Easing easeOutQuad: t * (2 - t)
      const easedProgress = progress * (2 - progress);
      setCount(easedProgress * value);
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [value, duration]);

  if (isCurrency) {
    return (
      <span>
        {`R$ ${Number(count).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
      </span>
    );
  }

  return <span>{Math.round(count).toLocaleString('pt-BR')}</span>;
}

const KpisSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
    {[1, 2, 3, 4].map(i => (
      <div key={i} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm animate-pulse space-y-4">
        <div className="h-3 bg-slate-200 rounded w-1/3"></div>
        <div className="h-8 bg-slate-200 rounded w-2/3"></div>
        <div className="h-4 bg-slate-200 rounded w-1/2"></div>
      </div>
    ))}
  </div>
);

export default function DashboardKPIs({
  kpis,
  abcCurve,
  revenueChart,
  channelsData,
  methodsData,
  operatorsData,
  kpisLoading,
  period,
  setPeriod
}: DashboardKPIsProps) {

  const formatCurrency = (value: number) => {
    return `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100/50">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Painel de Indicadores</h1>
          <p className="text-gray-500 font-semibold text-sm mt-1">Dados de faturamento e fluxo comercial.</p>
        </div>
        <div className="flex items-center gap-3">
          <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="text-xs font-black text-gray-500 uppercase tracking-widest">Período:</span>
          <select 
            value={period} 
            onChange={e => setPeriod(e.target.value)}
            className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-black text-gray-700 focus:outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/60 shadow-sm cursor-pointer transition-all duration-300"
          >
            <option value="today">Hoje</option>
            <option value="7d">Últimos 7 Dias</option>
            <option value="30d">Últimos 30 Dias</option>
            <option value="all">Todo o Período</option>
          </select>
        </div>
      </div>

      {kpisLoading && !kpis ? (
        <KpisSkeleton />
      ) : (
        <>
          {kpis && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              {/* Card 1: Faturamento Bruto */}
              <div className="bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 p-6 rounded-[2rem] shadow-[0_10px_25px_-5px_rgba(16,185,129,0.15)] flex flex-col relative overflow-hidden text-white border-none group hover:scale-[1.01] transition-transform duration-300">
                <div className="absolute top-0 right-0 w-28 h-28 bg-white/10 rounded-bl-full -mr-4 -mt-4 z-0"></div>
                <DollarSign className="absolute top-5 right-5 w-6 h-6 text-emerald-100 opacity-60 z-10 shrink-0" />
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-100 mb-2 z-10">Faturamento Bruto</span>
                <span className="text-3xl font-black tracking-tight z-10">
                  <AnimatedCounter value={kpis.gross_revenue} isCurrency={true} />
                </span>
                <div className="mt-4 text-[10px] font-black text-emerald-950 bg-emerald-300/80 w-fit px-3 py-1 rounded-full z-10 shadow-sm">
                  Total recebido
                </div>
              </div>

              {/* Card 2: Ticket Médio */}
              <div className="bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-700 p-6 rounded-[2rem] shadow-[0_10px_25px_-5px_rgba(99,102,241,0.15)] flex flex-col relative overflow-hidden text-white border-none group hover:scale-[1.01] transition-transform duration-300">
                <div className="absolute top-0 right-0 w-28 h-28 bg-white/10 rounded-bl-full -mr-4 -mt-4 z-0"></div>
                <TrendingUp className="absolute top-5 right-5 w-6 h-6 text-indigo-100 opacity-60 z-10 shrink-0" />
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-100 mb-2 z-10">Ticket Médio</span>
                <span className="text-3xl font-black tracking-tight z-10">
                  <AnimatedCounter value={kpis.average_ticket} isCurrency={true} />
                </span>
                <div className="mt-4 text-[10px] font-black text-indigo-950 bg-indigo-200/80 w-fit px-3 py-1 rounded-full z-10 shadow-sm">
                  Por comanda fechada
                </div>
              </div>

              {/* Card 3: Comandas Pagas */}
              <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-600 p-6 rounded-[2rem] shadow-[0_10px_25px_-5px_rgba(59,130,246,0.15)] flex flex-col relative overflow-hidden text-white border-none group hover:scale-[1.01] transition-transform duration-300">
                <div className="absolute top-0 right-0 w-28 h-28 bg-white/10 rounded-bl-full -mr-4 -mt-4 z-0"></div>
                <CheckCircle2 className="absolute top-5 right-5 w-6 h-6 text-blue-100 opacity-60 z-10 shrink-0" />
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-100 mb-2 z-10">Comandas Pagas</span>
                <span className="text-3xl font-black tracking-tight z-10">
                  <AnimatedCounter value={kpis.completed_orders} />
                </span>
                <div className="mt-4 text-[10px] font-black text-blue-950 bg-blue-200/80 w-fit px-3 py-1 rounded-full z-10 shadow-sm">
                  Finalizadas com sucesso
                </div>
              </div>

              {/* Card 4: Contas Ativas */}
              <div className="bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 p-6 rounded-[2rem] shadow-[0_10px_25px_-5px_rgba(245,158,11,0.15)] flex flex-col relative overflow-hidden text-white border-none group hover:scale-[1.01] transition-transform duration-300">
                <div className="absolute top-0 right-0 w-28 h-28 bg-white/10 rounded-bl-full -mr-4 -mt-4 z-0"></div>
                <Activity className="absolute top-5 right-5 w-6 h-6 text-amber-100 opacity-60 z-10 shrink-0" />
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-100 mb-2 z-10">Contas Ativas</span>
                <span className="text-3xl font-black tracking-tight z-10">
                  <AnimatedCounter value={kpis.active_orders} />
                </span>
                <div className="mt-4 text-[10px] font-black text-amber-950 bg-amber-200/80 w-fit px-3 py-1 rounded-full z-10 shadow-sm">
                  Mesas & Entregas abertas
                </div>
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
                      <Tooltip formatter={(value: unknown) => [formatCurrency(Number(value || 0)), 'Faturamento']} labelFormatter={l => `Data: ${l}`} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
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
                      <Tooltip formatter={(value: unknown, name: unknown) => name === 'total_revenue' ? [formatCurrency(Number(value || 0)), 'Receita'] : [value as number | string, 'Qtd']} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
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
                  {channelsData.map((c) => {
                    const totalChannels = channelsData.reduce((acc, curr) => acc + parseFloat(curr.total), 0);
                    const percent = totalChannels > 0 ? (parseFloat(c.total) / totalChannels) * 100 : 0;
                    return (
                      <div key={c.channel}>
                        <div className="flex justify-between text-sm font-semibold text-gray-700 mb-1.5">
                          <span className="flex items-center gap-1.5">
                            {c.channel === 'Mesa' ? (
                              <svg className="w-4 h-4 stroke-blue-500 fill-none" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 002-2V2M7 2v4M21 15V2v0a5 5 0 00-5 5v6c0 1.1.9 2 2 2h3zm0 0v6M12 2v20" />
                              </svg>
                            ) : c.channel === 'Delivery' ? (
                              <svg className="w-4 h-4 stroke-purple-500 fill-none" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="1" y="3" width="15" height="13" />
                                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                                <circle cx="5.5" cy="18.5" r="2.5" />
                                <circle cx="18.5" cy="18.5" r="2.5" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4 stroke-amber-500 fill-none" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                              </svg>
                            )}
                            <span>{c.channel}</span>
                          </span>
                          <span>{formatCurrency(Number(c.total))} ({percent.toFixed(0)}%)</span>
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
                  {methodsData.map((m) => {
                    const totalMethods = methodsData.reduce((acc, curr) => acc + parseFloat(curr.total), 0);
                    const percent = totalMethods > 0 ? (parseFloat(m.total) / totalMethods) * 100 : 0;
                    return (
                      <div key={m.method}>
                        <div className="flex justify-between text-sm font-semibold text-gray-700 mb-1.5">
                          <span className="flex items-center gap-1.5">
                            {m.method === 'Pix' ? (
                              <svg className="w-4 h-4 stroke-emerald-600 fill-none" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                                <line x1="12" y1="18" x2="12.01" y2="18" />
                              </svg>
                            ) : m.method === 'Dinheiro' ? (
                              <svg className="w-4 h-4 stroke-green-600 fill-none" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="2" y="6" width="20" height="12" rx="2" />
                                <circle cx="12" cy="12" r="2" />
                                <path d="M6 12h.01M18 12h.01" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4 stroke-indigo-600 fill-none" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="2" y="5" width="20" height="14" rx="2" />
                                <line x1="2" y1="10" x2="22" y2="10" />
                              </svg>
                            )}
                            <span>{m.method}</span>
                          </span>
                          <span>{formatCurrency(Number(m.total))} ({percent.toFixed(0)}%)</span>
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
                  {operatorsData.map((o, idx: number) => (
                    <div key={o.operator} className="flex justify-between items-center p-3 bg-gray-50 rounded-2xl border border-gray-100">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                          {idx + 1}
                        </span>
                        <span className="font-bold text-gray-800 text-sm">{o.operator}</span>
                      </div>
                      <span className="font-extrabold text-gray-900 text-sm">{formatCurrency(Number(o.total))}</span>
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
  );
}
