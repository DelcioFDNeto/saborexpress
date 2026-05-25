import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';

interface Table {
  id: number;
  number: string;
  capacity: number;
  status: 'Livre' | 'Ocupada' | 'Reservada' | 'Fechamento';
}

export default function Tables() {
  const navigate = useNavigate();
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchTables = async () => {
    try {
      const res = await api.get('/tables');
      setTables(res.data.data || res.data);
    } catch (err) {
      console.error(err);
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
        customer_name: customerName,
        customer_phone: customerPhone,
      });
      await fetchTables();
      closeModal();
    } catch (err) {
      console.error(err);
      alert('Falha ao abrir a mesa.');
    } finally {
      setActionLoading(false);
    }
  };

  const closeModal = () => {
    setSelectedTable(null);
    setCustomerName('');
    setCustomerPhone('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Livre': return 'bg-sabor-light border-sabor-primary text-sabor-dark';
      case 'Ocupada': return 'bg-rose-100 border-rose-500 text-rose-800';
      case 'Reservada': return 'bg-blue-100 border-blue-500 text-blue-800';
      case 'Fechamento': return 'bg-amber-100 border-amber-500 text-amber-800';
      default: return 'bg-gray-100 border-gray-500 text-gray-800';
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sabor-primary"></div></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Mapa do Salão</h1>
          <div className="flex flex-wrap gap-4 text-sm font-medium">
            <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-sabor-primary"></span> Livre</span>
            <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-rose-500"></span> Ocupada</span>
            <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-amber-500"></span> Fechamento</span>
          </div>
        </div>

        {/* Grid de Mesas */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {tables.map(table => (
            <div 
              key={table.id} 
              onClick={() => {
                if (table.status === 'Livre') setSelectedTable(table);
                else if (table.status === 'Ocupada' || table.status === 'Fechamento') navigate(`/mesas/${table.id}`);
              }}
              className={`
                relative p-6 rounded-2xl border-2 flex flex-col items-center justify-center gap-2
                transition-all duration-200 
                ${table.status === 'Livre' ? 'cursor-pointer hover:shadow-lg hover:-translate-y-1' : 'cursor-pointer hover:shadow-lg opacity-90'}
                ${getStatusColor(table.status)}
              `}
            >
              <span className="text-3xl font-black">{table.number}</span>
              <span className="text-sm font-medium opacity-80">{table.capacity} Lugares</span>
              {table.status !== 'Livre' && (
                <span className="absolute top-2 right-2 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-current"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-current"></span>
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Modal de Abertura de Mesa */}
        {selectedTable && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl transform transition-all">
              <h2 className="text-2xl font-bold mb-2">Abrir Mesa {selectedTable.number}</h2>
              <p className="text-gray-500 mb-6 text-sm">Capacidade máxima: {selectedTable.capacity} pessoas</p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Cliente (Opcional)</label>
                  <input 
                    type="text" 
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full border-gray-300 rounded-xl px-4 py-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-sabor-primary outline-none transition-all"
                    placeholder="Ex: João Silva"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefone (Opcional)</label>
                  <input 
                    type="text" 
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full border-gray-300 rounded-xl px-4 py-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-sabor-primary outline-none transition-all"
                    placeholder="(00) 00000-0000"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    onClick={closeModal}
                    className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={handleOpenTable}
                    disabled={actionLoading}
                    className="flex-1 px-4 py-3 rounded-xl bg-sabor-primary text-white font-medium hover:bg-sabor-dark transition-colors disabled:opacity-50"
                  >
                    {actionLoading ? 'Abrindo...' : 'Confirmar Abertura'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

