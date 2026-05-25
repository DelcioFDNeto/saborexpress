import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { toast } from 'sonner';

interface Table {
  id: number;
  number: string;
  capacity: number;
  status: 'Livre' | 'Ocupada' | 'Reservada' | 'Fechamento' | 'Limpeza';
  reservation_name?: string | null;
  reservation_phone?: string | null;
  reserved_at?: string | null;
}

export default function Tables() {
  const navigate = useNavigate();
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals & Forms State
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [modalType, setModalType] = useState<'options' | 'details' | 'cleaning' | null>(null);
  const [actionType, setActionType] = useState<'open' | 'reserve'>('open');
  
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [reservationTime, setReservationTime] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchTables = async () => {
    try {
      const res = await api.get('/tables');
      setTables(res.data.data || res.data);
    } catch (err) {
      console.error(err);
      toast.error('Erro ao carregar mapa de mesas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  const handleOpenTable = async () => {
    if (!selectedTable) return;
    setActionLoading(true);

    try {
      await api.post(`/tables/${selectedTable.id}/open`, {
        customer_name: customerName || null,
        customer_phone: customerPhone || null,
      });
      toast.success(`Mesa ${selectedTable.number} aberta com sucesso!`);
      await fetchTables();
      closeModal();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Falha ao abrir a mesa.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReserveTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTable) return;
    setActionLoading(true);

    try {
      await api.patch(`/tables/${selectedTable.id}/reserve`, {
        reservation_name: customerName,
        reservation_phone: customerPhone,
        reserved_at: reservationTime
      });
      toast.success(`Mesa ${selectedTable.number} reservada para ${customerName}!`);
      await fetchTables();
      closeModal();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Falha ao realizar reserva.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelReservation = async () => {
    if (!selectedTable) return;
    if (!confirm('Deseja realmente cancelar a reserva desta mesa?')) return;
    setActionLoading(true);

    try {
      await api.patch(`/tables/${selectedTable.id}/cancel-reservation`);
      toast.success('Reserva cancelada com sucesso.');
      await fetchTables();
      closeModal();
    } catch (err: any) {
      console.error(err);
      toast.error('Erro ao cancelar reserva.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkFree = async () => {
    if (!selectedTable) return;
    setActionLoading(true);

    try {
      await api.patch(`/tables/${selectedTable.id}/mark-free`);
      toast.success(`Mesa ${selectedTable.number} está higienizada e livre para uso!`);
      await fetchTables();
      closeModal();
    } catch (err: any) {
      console.error(err);
      toast.error('Erro ao liberar mesa.');
    } finally {
      setActionLoading(false);
    }
  };

  const closeModal = () => {
    setSelectedTable(null);
    setModalType(null);
    setActionType('open');
    setCustomerName('');
    setCustomerPhone('');
    setReservationTime('');
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Livre': return 'bg-sabor-light border-sabor-primary/30 text-sabor-dark hover:shadow-sabor-primary/10';
      case 'Ocupada': return 'bg-rose-100 border-rose-200 text-rose-800 hover:shadow-rose-500/10';
      case 'Reservada': return 'bg-sky-100 border-sky-200 text-sky-800 hover:shadow-sky-500/10';
      case 'Fechamento': return 'bg-amber-100 border-amber-200 text-amber-800 hover:shadow-amber-500/10';
      case 'Limpeza': return 'bg-slate-100 border-slate-200 text-slate-700 hover:shadow-slate-500/10 animate-pulse';
      default: return 'bg-gray-100 border-gray-200 text-gray-800';
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen bg-gray-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sabor-primary"></div></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Header & Status Indicator */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Mapa do Salão</h1>
            <p className="text-gray-500 font-medium mt-1">Gerencie a ocupação, reservas e fluxo operacional de mesas.</p>
          </div>
          <div className="flex flex-wrap gap-4 text-xs font-bold uppercase tracking-wider bg-white px-5 py-3 rounded-2xl shadow-sm border border-gray-100">
            <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-sabor-primary"></span> Livre</span>
            <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-rose-500"></span> Ocupada</span>
            <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-sky-500"></span> Reservada</span>
            <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-amber-500"></span> Fechamento</span>
            <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-slate-500"></span> Limpeza</span>
          </div>
        </div>

        {/* Grid de Mesas */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {tables.map(table => (
            <div 
              key={table.id} 
              onClick={() => {
                setSelectedTable(table);
                if (table.status === 'Livre') {
                  setModalType('options');
                } else if (table.status === 'Reservada') {
                  setModalType('details');
                  setCustomerName(table.reservation_name || '');
                  setCustomerPhone(table.reservation_phone || '');
                } else if (table.status === 'Limpeza') {
                  setModalType('cleaning');
                } else {
                  navigate(`/mesas/${table.id}`);
                }
              }}
              className={`
                relative p-8 rounded-3xl border-2 flex flex-col items-center justify-center gap-2
                transition-all duration-300 cursor-pointer hover:shadow-xl hover:-translate-y-1
                ${getStatusStyle(table.status)}
              `}
            >
              <span className="text-4xl font-black tracking-tight">{table.number}</span>
              <span className="text-xs font-bold opacity-80 uppercase">{table.capacity} Lugares</span>
              
              {table.status !== 'Livre' && (
                <span className="absolute top-3 right-3 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-current"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-current"></span>
                </span>
              )}
            </div>
          ))}
        </div>

        {/* ========================================== */}
        {/* MODAL 1: OPCÕES MESA LIVRE (ABRIR OU RESERVAR) */}
        {/* ========================================== */}
        {selectedTable && modalType === 'options' && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in slide-in-from-bottom-4">
              
              {/* Tab Selector inside Modal Header */}
              <div className="flex gap-2 p-1 bg-gray-100 rounded-xl mb-6">
                <button 
                  type="button"
                  onClick={() => setActionType('open')}
                  className={`flex-1 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                    actionType === 'open' ? 'bg-white text-sabor-dark shadow-sm' : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  🚚 Abrir Mesa
                </button>
                <button 
                  type="button"
                  onClick={() => setActionType('reserve')}
                  className={`flex-1 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                    actionType === 'reserve' ? 'bg-white text-sabor-dark shadow-sm' : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  📅 Reservar
                </button>
              </div>

              <h2 className="text-2xl font-black text-gray-950 mb-1">
                {actionType === 'open' ? `Abrir Mesa ${selectedTable.number}` : `Reservar Mesa ${selectedTable.number}`}
              </h2>
              <p className="text-gray-500 mb-6 text-sm font-medium">Mesa física com suporte para até {selectedTable.capacity} pessoas.</p>
              
              {actionType === 'open' ? (
                // Open table form
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Nome do Cliente (Opcional)</label>
                    <input 
                      type="text" 
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full border-gray-300 rounded-xl px-4 py-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-sabor-primary outline-none transition-all text-sm"
                      placeholder="Ex: Clara Nazaré"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Telefone de Contato (Opcional)</label>
                    <input 
                      type="text" 
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full border-gray-300 rounded-xl px-4 py-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-sabor-primary outline-none transition-all text-sm"
                      placeholder="(91) 98765-4321"
                    />
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-gray-100 mt-6">
                    <button onClick={closeModal} className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition-colors text-sm">Cancelar</button>
                    <button 
                      onClick={handleOpenTable}
                      disabled={actionLoading}
                      className="flex-1 px-4 py-3 rounded-xl bg-sabor-primary text-sabor-dark font-extrabold hover:bg-sabor-primary/95 transition-all text-sm shadow-md"
                    >
                      {actionLoading ? 'Abrindo...' : 'Confirmar Abertura'}
                    </button>
                  </div>
                </div>
              ) : (
                // Reserve table form
                <form onSubmit={handleReserveTable} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Nome da Reserva</label>
                    <input 
                      required
                      type="text" 
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full border-gray-300 rounded-xl px-4 py-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-sabor-primary outline-none transition-all text-sm"
                      placeholder="Ex: Família Souza"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Telefone de Contato</label>
                    <input 
                      required
                      type="text" 
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full border-gray-300 rounded-xl px-4 py-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-sabor-primary outline-none transition-all text-sm"
                      placeholder="(91) 98111-2222"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Data & Horário da Reserva</label>
                    <input 
                      required
                      type="datetime-local" 
                      value={reservationTime}
                      onChange={(e) => setReservationTime(e.target.value)}
                      className="w-full border-gray-300 rounded-xl px-4 py-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-sabor-primary outline-none transition-all text-sm cursor-pointer"
                    />
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-gray-100 mt-6">
                    <button type="button" onClick={closeModal} className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition-colors text-sm">Cancelar</button>
                    <button 
                      type="submit"
                      disabled={actionLoading}
                      className="flex-1 px-4 py-3 bg-sky-600 text-white rounded-xl font-extrabold hover:bg-sky-700 transition-all text-sm shadow-md"
                    >
                      {actionLoading ? 'Reservando...' : 'Confirmar Reserva'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* MODAL 2: DETALHES DE MESA RESERVADA (OCUPAR OU CANCELAR) */}
        {/* ========================================== */}
        {selectedTable && modalType === 'details' && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in slide-in-from-bottom-4">
              <span className="inline-block bg-sky-50 text-sky-600 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full mb-3">📅 Mesa Reservada</span>
              <h2 className="text-2xl font-black text-gray-950 mb-6">Mesa {selectedTable.number}</h2>
              
              <div className="space-y-4 mb-8">
                <div className="bg-slate-50 p-4 rounded-2xl">
                  <span className="block text-xs font-bold text-gray-500 uppercase mb-1">Nome da Reserva</span>
                  <span className="font-extrabold text-gray-950 text-base">{selectedTable.reservation_name}</span>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl">
                  <span className="block text-xs font-bold text-gray-500 uppercase mb-1">Telefone de Contato</span>
                  <span className="font-bold text-gray-950 text-sm">{selectedTable.reservation_phone || 'Não informado'}</span>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl">
                  <span className="block text-xs font-bold text-gray-500 uppercase mb-1">Horário Reservado</span>
                  <span className="font-bold text-gray-950 text-sm">
                    {selectedTable.reserved_at ? new Date(selectedTable.reserved_at).toLocaleString('pt-BR') : 'Não informado'}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2 border-t border-gray-100 pt-4">
                <button 
                  onClick={handleOpenTable}
                  disabled={actionLoading}
                  className="w-full py-3 bg-sabor-primary text-sabor-dark font-extrabold rounded-xl text-sm shadow hover:bg-sabor-primary/95 transition-all flex items-center justify-center gap-1.5"
                >
                  🚀 Ocupar / Iniciar Serviço
                </button>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <button onClick={closeModal} className="py-2.5 border border-gray-200 text-gray-600 rounded-xl font-bold text-xs hover:bg-gray-50 transition-colors">Voltar</button>
                  <button 
                    onClick={handleCancelReservation}
                    disabled={actionLoading}
                    className="py-2.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl font-bold text-xs transition-colors"
                  >
                    🚫 Cancelar Reserva
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* MODAL 3: CONFIRMAÇÃO DE HIGIENIZAÇÃO (LIMPEZA) */}
        {/* ========================================== */}
        {selectedTable && modalType === 'cleaning' && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
            <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center animate-in slide-in-from-bottom-4">
              <div className="w-16 h-16 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl animate-bounce">🧹</div>
              <h2 className="text-xl font-black text-gray-950 mb-2">Limpeza da Mesa {selectedTable.number}</h2>
              <p className="text-gray-500 mb-6 text-sm font-medium">A mesa já foi higienizada e está pronta para novos clientes?</p>
              
              <div className="flex gap-3">
                <button onClick={closeModal} className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors">Cancelar</button>
                <button 
                  onClick={handleMarkFree}
                  disabled={actionLoading}
                  className="flex-1 py-3 bg-sabor-primary text-sabor-dark font-black rounded-xl text-sm shadow hover:bg-sabor-primary/95 transition-all"
                >
                  Liberar Mesa
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
