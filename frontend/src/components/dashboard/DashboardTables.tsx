import React, { useState } from 'react';
import { api } from '../../lib/api';
import { toast } from 'sonner';

interface ApiError {
  response?: { data?: { message?: string } };
}

interface Table {
  id: number;
  number: number;
  capacity: number;
  status: string;
}

interface DashboardTablesProps {
  tables: Table[];
  tablesLoading: boolean;
  onRefresh: () => Promise<void>;
}

const TablesSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
    {[1, 2, 3, 4, 5, 6].map(i => (
      <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4 animate-pulse">
        <div className="flex justify-between items-center">
          <div className="w-12 h-12 bg-slate-200 rounded-full animate-pulse"></div>
          <div className="h-6 bg-slate-200 rounded-full w-20 animate-pulse"></div>
        </div>
        <div className="h-4 bg-slate-200 rounded w-1/2 animate-pulse"></div>
        <div className="flex justify-end gap-2 pt-2 animate-pulse">
          <div className="w-8 h-8 bg-slate-200 rounded-lg"></div>
          <div className="w-8 h-8 bg-slate-200 rounded-lg"></div>
        </div>
      </div>
    ))}
  </div>
);

export default function DashboardTables({
  tables,
  tablesLoading,
  onRefresh
}: DashboardTablesProps) {
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [tableNumber, setTableNumber] = useState('');
  const [tableCapacity, setTableCapacity] = useState('');
  const [showTableForm, setShowTableForm] = useState(false);

  // ==========================================
  // Table Action Handlers
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
      await onRefresh();
    } catch (err: unknown) {
      const e = err as ApiError;
      toast.error(e.response?.data?.message || 'Erro ao salvar mesa.');
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
      await onRefresh();
    } catch (err: unknown) {
      const e = err as ApiError;
      toast.error(e.response?.data?.message || 'Erro ao deletar mesa.');
    }
  };

  return (
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-1000 flex items-center justify-center p-4">
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

      {/* Grid de Cards de Mesas */}
      {tablesLoading && tables.length === 0 ? (
        <TablesSkeleton />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {tables.map(t => (
            <div 
              key={t.id} 
              className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between relative overflow-hidden group/table"
            >
              {/* Status Gradient Bar */}
              <div className={`absolute top-0 left-0 right-0 h-1.5 ${
                t.status === 'Livre' ? 'bg-emerald-500' :
                t.status === 'Ocupada' ? 'bg-blue-500' :
                t.status === 'Reservada' ? 'bg-amber-500' :
                t.status === 'Fechamento' ? 'bg-indigo-500' :
                'bg-slate-300'
              }`} />
              
              <div>
                <div className="flex justify-between items-start mb-5">
                  <div className="flex items-center gap-3">
                    <span className={`w-12 h-12 rounded-2xl font-black text-lg flex items-center justify-center shadow-inner ${
                      t.status === 'Livre' ? 'bg-emerald-50 text-emerald-700' :
                      t.status === 'Ocupada' ? 'bg-blue-50 text-blue-700' :
                      t.status === 'Reservada' ? 'bg-amber-50 text-amber-700' :
                      t.status === 'Fechamento' ? 'bg-indigo-50 text-indigo-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {t.number}
                    </span>
                    <div>
                      <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider block">Identificador</span>
                      <span className="text-slate-700 font-extrabold text-sm block">Mesa #{t.id}</span>
                    </div>
                  </div>

                  {/* Custom status pill */}
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    t.status === 'Livre' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                    t.status === 'Ocupada' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                    t.status === 'Reservada' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                    t.status === 'Fechamento' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' :
                    'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}>
                    {t.status}
                  </span>
                </div>

                <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-4 flex items-center gap-2.5 mb-6">
                  <svg className="w-5 h-5 stroke-slate-500 fill-none" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 00-3-3.87" />
                    <path d="M16 3.13a4 4 0 010 7.75" />
                  </svg>
                  <div>
                    <span className="text-slate-400 font-bold text-[9px] uppercase tracking-wider block">Capacidade</span>
                    <span className="text-slate-700 font-bold text-xs block">{t.capacity} pessoas</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <span className="text-slate-400 text-[10px] font-bold">Ações Gerenciais</span>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => handleEditTable(t)} 
                    title="Editar Mesa" 
                    className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 hover:text-slate-800 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                  </button>
                  <button 
                    onClick={() => handleDeleteTable(t.id)} 
                    disabled={t.status !== 'Livre'} 
                    title={t.status !== 'Livre' ? 'Não é possível excluir mesas ocupadas/reservadas' : 'Excluir Mesa'} 
                    className="p-2 hover:bg-rose-50 rounded-xl text-rose-500 hover:text-rose-700 transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
