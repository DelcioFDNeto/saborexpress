import React, { useEffect, useState } from 'react';
import axios from 'axios';

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

export default function Dashboard() {
  const [kpis, setKpis] = useState<KPIs | null>(null);
  const [abcCurve, setAbcCurve] = useState<ABCItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const res = await axios.get(`${apiUrl}/api/dashboard`);
      setKpis(res.data.kpis);
      setAbcCurve(res.data.abc_curve);
    } catch (err) {
      console.error(err);
      alert('Erro ao carregar dados do painel gerencial.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Painel Gerencial</h1>
          <p className="text-gray-500 font-medium mt-1">Visão estratégica e indicadores de performance (KPIs).</p>
        </div>

        {/* KPI Cards */}
        {kpis && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {/* Faturamento Bruto */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full -mr-4 -mt-4 opacity-50 z-0"></div>
              <span className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2 z-10">Faturamento Bruto</span>
              <span className="text-3xl font-black text-gray-900 z-10">
                R$ {Number(kpis.gross_revenue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
              <div className="mt-4 text-xs font-bold text-emerald-600 bg-emerald-50 w-fit px-2 py-1 rounded-md z-10">Total recebido</div>
            </div>

            {/* Ticket Médio */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-bl-full -mr-4 -mt-4 opacity-50 z-0"></div>
              <span className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2 z-10">Ticket Médio</span>
              <span className="text-3xl font-black text-gray-900 z-10">
                R$ {Number(kpis.average_ticket || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
              <div className="mt-4 text-xs font-bold text-indigo-600 bg-indigo-50 w-fit px-2 py-1 rounded-md z-10">Por comanda</div>
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

        {/* Curva ABC */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Curva ABC: Produtos Mais Vendidos</h2>
              <p className="text-sm text-gray-500 mt-1">Ranking volumétrico baseado em itens de comandas finalizadas.</p>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="p-4 font-bold text-gray-500 text-sm uppercase tracking-wider">Rank</th>
                  <th className="p-4 font-bold text-gray-500 text-sm uppercase tracking-wider">Produto</th>
                  <th className="p-4 font-bold text-gray-500 text-sm uppercase tracking-wider text-right">Qtd. Vendida</th>
                  <th className="p-4 font-bold text-gray-500 text-sm uppercase tracking-wider text-right">Faturamento Gerado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {abcCurve.map((item, index) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-black text-sm ${index < 3 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>
                        {index + 1}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-gray-900">{item.name}</td>
                    <td className="p-4 font-bold text-gray-900 text-right">{item.total_sold}</td>
                    <td className="p-4 font-medium text-emerald-600 text-right">
                      R$ {Number(item.total_revenue).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
                {abcCurve.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-gray-500">
                      Nenhum dado de vendas disponível ainda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
