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
      setReservations(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Erro ao carregar reservas.');
    }
  };

  const fetchTables = async () => {
    try {
      const res = await api.get('/client/tables');
      // res.data pode ser paginado
      setTables(res.data.data ? res.data.data : res.data);
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
      toast.error('Preencha data, horário e mesa.');
      return;
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
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao realizar reserva.');
    }
  };

  const handleCancel = async (id: number) => {
    if (!confirm('Deseja realmente cancelar esta reserva?')) return;
    try {
      await api.delete(`/client/reservations/${id}`);
      toast.success('Reserva cancelada.');
      fetchReservations();
    } catch (err) {
      toast.error('Erro ao cancelar.');
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Carregando...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-black text-gray-900 mb-8">Minhas Reservas</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold mb-6">Nova Reserva</h2>
          <form onSubmit={handleReserve} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Data</label>
                <input 
                  type="date" 
                  min={new Date().toISOString().split('T')[0]}
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full border-gray-300 rounded-xl focus:ring-sabor-primary focus:border-sabor-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Horário</label>
                <input 
                  type="time" 
                  value={time}
                  onChange={e => setTime(e.target.value)}
                  className="w-full border-gray-300 rounded-xl focus:ring-sabor-primary focus:border-sabor-primary"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Pessoas</label>
                <input 
                  type="number" 
                  min="1"
                  max="20"
                  value={guests}
                  onChange={e => setGuests(parseInt(e.target.value))}
                  className="w-full border-gray-300 rounded-xl focus:ring-sabor-primary focus:border-sabor-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Mesa Desejada</label>
                <select 
                  value={tableId}
                  onChange={e => setTableId(e.target.value)}
                  className="w-full border-gray-300 rounded-xl focus:ring-sabor-primary focus:border-sabor-primary"
                  required
                >
                  <option value="">Selecione...</option>
                  {tables.map(t => (
                    <option key={t.id} value={t.id}>Mesa {t.number} ({t.capacity} pax)</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Pedidos Especiais</label>
              <textarea 
                value={specialRequests}
                onChange={e => setSpecialRequests(e.target.value)}
                placeholder="Ex: Cadeira de bebê, aniversário..."
                className="w-full border-gray-300 rounded-xl focus:ring-sabor-primary focus:border-sabor-primary"
                rows={2}
              ></textarea>
            </div>

            <button 
              type="submit"
              className="w-full py-3 bg-sabor-primary text-sabor-dark font-black rounded-xl hover:bg-sabor-primary/90 transition-colors"
            >
              Confirmar Reserva
            </button>
          </form>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-6">Próximas Reservas</h2>
          {reservations.length === 0 ? (
            <div className="text-center p-8 bg-gray-50 rounded-3xl border border-dashed border-gray-200 text-gray-500">
              Você ainda não possui reservas.
            </div>
          ) : (
            <div className="space-y-4">
              {reservations.map(res => (
                <div key={res.id} className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-lg">Mesa {res.table?.number}</h3>
                    <p className="text-sm text-gray-600">
                      {new Date(res.reservation_date).toLocaleDateString('pt-BR')} às {new Date(res.reservation_date).toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{res.guests} pessoas</p>
                    {res.status === 'Cancelled' ? (
                      <span className="inline-block mt-2 px-2 py-0.5 bg-rose-100 text-rose-700 text-xs font-bold rounded">Cancelada</span>
                    ) : (
                      <span className="inline-block mt-2 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-bold rounded">Confirmada</span>
                    )}
                  </div>
                  {res.status !== 'Cancelled' && new Date(res.reservation_date) > new Date() && (
                    <button 
                      onClick={() => handleCancel(res.id)}
                      className="text-rose-500 hover:text-rose-700 text-sm font-bold px-3 py-2 rounded-lg hover:bg-rose-50 transition-colors"
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
    </div>
  );
}
