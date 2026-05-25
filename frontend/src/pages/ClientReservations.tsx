import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { toast } from 'sonner';

interface Table {
  id: number;
  number: string;
  capacity: number;
  status: string;
}

interface Reservation {
  id: number;
  table_id: number;
  reservation_date: string;
  guests: number;
  status: string;
  special_requests: string | null;
  table?: Table;
}

export default function ClientReservations() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);

  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [guests, setGuests] = useState(2);
  const [tableId, setTableId] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');

  const fetchReservations = async () => {
    try {
      const res = await api.get('/client/reservations');
      setReservations(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Erro ao carregar reservas.');
    }
  };

  const fetchTables = async () => {
    try {
      const res = await api.get('/client/tables');
      setTables(res.data.data ? res.data.data : res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
    fetchTables();
  }, []);

  const handleReserve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !time || !tableId) {
      toast.error('Por favor, selecione data, horário e clique em uma mesa no mapa.');
      return;
    }

    // Capacity validation check on frontend before sending to prevent unexpected errors
    const selectedTableObj = tables.find(t => String(t.id) === tableId);
    if (selectedTableObj && guests > selectedTableObj.capacity) {
      toast.warning(`Atenção: A mesa selecionada comporta no máximo ${selectedTableObj.capacity} pessoas.`);
    }

    try {
      const dateTime = `${date} ${time}:00`;
      await api.post('/client/reservations', {
        table_id: tableId,
        reservation_date: dateTime,
        guests,
        special_requests: specialRequests
      });

      toast.success('Reserva solicitada com sucesso!');
      setDate('');
      setTime('');
      setGuests(2);
      setTableId('');
      setSpecialRequests('');
      fetchReservations();
      fetchTables(); // Refresh table statuses in real-time
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao realizar reserva.');
    }
  };

  const handleCancel = async (id: number) => {
    if (!confirm('Deseja realmente cancelar esta reserva?')) return;
    try {
      await api.delete(`/client/reservations/${id}`);
      toast.success('Reserva cancelada com sucesso.');
      fetchReservations();
      fetchTables();
    } catch (err) {
      toast.error('Erro ao cancelar a reserva.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sabor-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-10 font-sans">
      
      {/* Header and Branding */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div>
          <span className="bg-sabor-light text-sabor-dark border border-sabor-primary/30 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
            Reserva de Mesas
          </span>
          <h1 className="text-3xl font-black text-gray-900 mt-2">Portal de Reservas</h1>
        </div>
        <p className="text-gray-500 text-sm max-w-sm">
          Selecione a mesa desejada clicando diretamente no mapa visual. Garantimos a melhor experiência para sua refeição.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Form & Reservations Listing (span 5) */}
        <div className="lg:col-span-5 space-y-8">
          
          {/* Reservation Booking Form Card */}
          <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
              <span>📅</span> Nova Reserva
            </h2>
            
            <form onSubmit={handleReserve} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Data</label>
                  <input 
                    type="date" 
                    min={new Date().toISOString().split('T')[0]}
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full border-gray-200 rounded-xl focus:ring-sabor-primary focus:border-sabor-primary text-sm font-semibold p-3"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Horário</label>
                  <input 
                    type="time" 
                    value={time}
                    onChange={e => setTime(e.target.value)}
                    className="w-full border-gray-200 rounded-xl focus:ring-sabor-primary focus:border-sabor-primary text-sm font-semibold p-3"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Pessoas</label>
                  <input 
                    type="number" 
                    min="1"
                    max="20"
                    value={guests}
                    onChange={e => setGuests(parseInt(e.target.value))}
                    className="w-full border-gray-200 rounded-xl focus:ring-sabor-primary focus:border-sabor-primary text-sm font-semibold p-3"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Mesa Selecionada</label>
                  <select 
                    value={tableId}
                    onChange={e => setTableId(e.target.value)}
                    className="w-full border-gray-200 rounded-xl focus:ring-sabor-primary focus:border-sabor-primary text-sm font-semibold p-3 bg-gray-50 text-gray-800"
                    required
                  >
                    <option value="">Selecione no mapa...</option>
                    {tables.map(t => (
                      <option key={t.id} value={t.id}>Mesa {t.number} ({t.capacity} pax)</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Pedidos Especiais (Opcional)</label>
                <textarea 
                  value={specialRequests}
                  onChange={e => setSpecialRequests(e.target.value)}
                  placeholder="Ex: Cadeira de bebê, aniversário, preferência por área externa..."
                  className="w-full border-gray-200 rounded-xl focus:ring-sabor-primary focus:border-sabor-primary text-sm font-semibold p-3"
                  rows={3}
                ></textarea>
              </div>

              <button 
                type="submit"
                className="w-full py-4 bg-sabor-primary hover:bg-sabor-primary/95 text-sabor-dark font-black text-base rounded-2xl transition-all shadow-[0_8px_25px_rgba(74,222,128,0.2)] hover:shadow-[0_12px_35px_rgba(74,222,128,0.35)] hover:-translate-y-0.5 active:translate-y-0"
              >
                Confirmar Reserva
              </button>
            </form>
          </div>

          {/* Customer Past/Future Reservations Card */}
          <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
              <span>🎟️</span> Suas Próximas Reservas
            </h2>
            
            {reservations.length === 0 ? (
              <div className="text-center p-8 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200 text-gray-500 font-medium">
                Você ainda não possui reservas agendadas.
              </div>
            ) : (
              <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1 custom-scrollbar">
                {reservations.map(res => (
                  <div key={res.id} className="bg-gray-50/30 p-5 rounded-2xl border border-gray-100 flex justify-between items-center gap-4 transition-all hover:bg-white hover:shadow-md hover:border-white">
                    <div>
                      <h3 className="font-extrabold text-gray-900 text-base">Mesa {res.table?.number}</h3>
                      <p className="text-xs text-gray-600 mt-1 font-semibold flex items-center gap-1">
                        <span>📅</span>
                        {new Date(res.reservation_date).toLocaleDateString('pt-BR')} às {new Date(res.reservation_date).toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})}
                      </p>
                      <p className="text-[11px] text-gray-400 font-bold mt-1">👥 {res.guests} pessoas</p>
                      {res.status === 'Cancelled' ? (
                        <span className="inline-block mt-2.5 px-2.5 py-0.5 bg-rose-100 text-rose-800 text-[10px] font-black uppercase rounded-full">
                          Cancelada
                        </span>
                      ) : (
                        <span className="inline-block mt-2.5 px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase rounded-full">
                          Confirmada
                        </span>
                      )}
                    </div>
                    {res.status !== 'Cancelled' && new Date(res.reservation_date) > new Date() && (
                      <button 
                        onClick={() => handleCancel(res.id)}
                        className="text-rose-500 hover:text-rose-700 text-xs font-black px-3.5 py-2.5 rounded-xl hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-all shrink-0"
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Visual Interactive Table Map (span 7) */}
        <div className="lg:col-span-7 bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col min-h-[500px]">
          
          <div className="mb-6">
            <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
              <span>📍</span> Selecione sua Mesa no Salão
            </h2>
            <p className="text-gray-500 text-xs mt-1">
              Veja o estado atual de cada mesa e clique no card correspondente para selecioná-la.
            </p>
          </div>

          {/* Color Status Legend */}
          <div className="grid grid-cols-4 gap-2 mb-6 p-4 bg-gray-50 rounded-2xl border border-gray-100 text-[10px] sm:text-[11px] font-bold text-center">
            <div className="flex items-center justify-center gap-1.5 text-sabor-dark">
              <span className="w-3 h-3 rounded-full bg-sabor-primary border border-sabor-primary/30 inline-block shadow-sm"></span>
              Livre
            </div>
            <div className="flex items-center justify-center gap-1.5 text-rose-800">
              <span className="w-3 h-3 rounded-full bg-rose-400 border border-rose-300 inline-block shadow-sm"></span>
              Ocupada
            </div>
            <div className="flex items-center justify-center gap-1.5 text-sky-800">
              <span className="w-3 h-3 rounded-full bg-sky-400 border border-sky-300 inline-block shadow-sm"></span>
              Reservada
            </div>
            <div className="flex items-center justify-center gap-1.5 text-slate-600">
              <span className="w-3 h-3 rounded-full bg-slate-300 border border-slate-200 inline-block shadow-sm animate-pulse"></span>
              Limpeza
            </div>
          </div>

          {/* Interactive Tables Grid Map */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 flex-1">
            {tables.map(t => {
              const isSelected = tableId === String(t.id);
              return (
                <div
                  key={t.id}
                  onClick={() => setTableId(String(t.id))}
                  className={`relative p-5 rounded-2xl border-2 flex flex-col justify-between items-center text-center transition-all duration-300 select-none ${
                    isSelected
                      ? 'border-sabor-primary bg-sabor-light/40 ring-4 ring-sabor-primary/10 shadow-lg scale-102 cursor-pointer'
                      : t.status === 'Livre'
                        ? 'border-gray-100 bg-gray-50 hover:bg-sabor-light/20 hover:border-sabor-primary/30 hover:scale-102 cursor-pointer shadow-sm'
                        : t.status === 'Ocupada' || t.status === 'Fechamento'
                          ? 'border-rose-100 bg-rose-50/30 text-rose-800 hover:border-rose-200 cursor-pointer hover:scale-102'
                          : t.status === 'Reservada'
                            ? 'border-sky-100 bg-sky-50/30 text-sky-800 hover:border-sky-200 cursor-pointer hover:scale-102'
                            : 'border-slate-100 bg-slate-50/30 text-slate-600 cursor-not-allowed'
                  }`}
                >
                  {/* Selected Tick Indicator */}
                  {isSelected && (
                    <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-sabor-primary text-sabor-dark font-black text-xs flex items-center justify-center shadow-md animate-scale-in">
                      ✓
                    </span>
                  )}

                  {/* Table Shape Icon / Avatar */}
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 font-black text-base shadow-inner transition-transform duration-300 ${
                    isSelected
                      ? 'bg-sabor-primary text-sabor-dark scale-110'
                      : t.status === 'Livre'
                        ? 'bg-sabor-light text-sabor-dark border border-sabor-primary/20'
                        : t.status === 'Ocupada' || t.status === 'Fechamento'
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : t.status === 'Reservada'
                            ? 'bg-sky-100 text-sky-800 border border-sky-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}>
                    {t.number}
                  </div>

                  {/* Details */}
                  <div className="space-y-1">
                    <h3 className="font-extrabold text-sm text-gray-900">Mesa {t.number}</h3>
                    <p className="text-gray-500 text-[10px] sm:text-[11px] font-bold">👥 Até {t.capacity} pessoas</p>
                  </div>

                  {/* Real-time Status Badge */}
                  <div className="mt-4">
                    {t.status === 'Livre' ? (
                      <span className="px-2.5 py-0.5 bg-sabor-primary/20 text-sabor-dark border border-sabor-primary/30 text-[9px] font-black uppercase rounded-full tracking-wider">
                        Disponível
                      </span>
                    ) : t.status === 'Ocupada' || t.status === 'Fechamento' ? (
                      <span className="px-2.5 py-0.5 bg-rose-100 text-rose-800 border border-rose-200 text-[9px] font-black uppercase rounded-full tracking-wider">
                        Ocupada Agora
                      </span>
                    ) : t.status === 'Reservada' ? (
                      <span className="px-2.5 py-0.5 bg-sky-100 text-sky-800 border border-sky-200 text-[9px] font-black uppercase rounded-full tracking-wider">
                        Reservada
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 bg-slate-100 text-slate-600 border border-slate-200 text-[9px] font-black uppercase rounded-full tracking-wider animate-pulse">
                        Limpeza
                      </span>
                    )}
                  </div>

                </div>
              );
            })}
          </div>

        </div>

      </div>
    </div>
  );
}
