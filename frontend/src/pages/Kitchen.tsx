import { useEffect, useState } from 'react';
import { api } from '../lib/api';

interface Product {
  id: number;
  name: string;
}

interface Table {
  id: number;
  number: string;
}

interface Order {
  id: number;
  type: string;
  table: Table | null;
}

interface OrderItem {
  id: number;
  quantity: number;
  notes: string | null;
  status: 'Pendente' | 'Em Preparo' | 'Pronto' | 'Entregue';
  created_at: string;
  product: Product;
  order: Order;
}

export default function Kitchen() {
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = async () => {
    try {
      const res = await api.get('/kitchen/order-items');
      setItems(res.data.data || res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
    const interval = setInterval(fetchItems, 10000);
    return () => clearInterval(interval);
  }, []);

  const updateStatus = async (id: number, newStatus: string) => {
    try {
      if (newStatus === 'Entregue') {
        await api.patch(`/kitchen/order-items/${id}/deliver`);
      } else {
        const endpoint = newStatus === 'Em Preparo' ? 'start' : 'mark-ready';
        await api.patch(`/kitchen/order-items/${id}/${endpoint}`);
      }
      fetchItems();
    } catch (err) {
      console.error('Failed to update status', err);
      alert('Erro ao atualizar status');
    }
  };

  if (loading && items.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  const pendentes = items.filter(i => i.status === 'Pendente');
  const emPreparo = items.filter(i => i.status === 'Em Preparo');
  const prontos = items.filter(i => i.status === 'Pronto');

  const ItemCard = ({ item, actionText, nextStatus, colorClass, actionClass }: { item: OrderItem, actionText: string, nextStatus: string, colorClass: string, actionClass: string }) => {
    const minutesWaiting = Math.floor((new Date().getTime() - new Date(item.created_at).getTime()) / 60000);
    
    return (
      <div className={`bg-white rounded-2xl p-4 shadow-sm border-l-4 ${colorClass} flex flex-col gap-3 relative`}>
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            {item.order.type === 'Delivery' ? (
              <span className="font-black text-purple-900 bg-purple-100 px-2 py-1 rounded text-sm tracking-widest border border-purple-200">
                DELIVERY
              </span>
            ) : (
              <span className="font-black text-gray-900 bg-gray-100 px-2 py-1 rounded text-sm">
                Mesa {item.order.table?.number}
              </span>
            )}
            <span className={`text-xs font-bold ${minutesWaiting > 15 ? 'text-rose-500' : 'text-gray-500'}`}>
              Tempo: {minutesWaiting} min
            </span>
          </div>
          <span className="text-xl font-black text-gray-400">#{item.id}</span>
        </div>
        
        <div>
          <h3 className="font-bold text-lg text-gray-800 leading-tight">
            <span className="text-emerald-600 mr-2">{item.quantity}x</span> 
            {item.product.name}
          </h3>
          {item.notes && (
            <div className="mt-2 bg-amber-50 border border-amber-100 text-amber-800 text-sm px-3 py-2 rounded-lg font-medium">
              Aviso: {item.notes}
            </div>
          )}
        </div>

        <button 
          onClick={() => updateStatus(item.id, nextStatus)}
          className={`mt-2 w-full py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm ${actionClass}`}
        >
          {actionText}
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 md:p-10">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-gray-900">KDS: Visão da Cozinha</h1>
          <p className="text-gray-500 font-medium">Atualização automática a cada 10 segundos.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-160px)]">
        {/* Column 1: Pendentes */}
        <div className="flex flex-col bg-gray-200/50 rounded-3xl p-4 overflow-hidden">
          <div className="flex justify-between items-center mb-4 px-2">
            <h2 className="font-bold text-gray-700 uppercase tracking-wider text-sm">1. Fila de Espera</h2>
            <span className="bg-gray-300 text-gray-700 font-bold px-2 py-0.5 rounded-full text-xs">{pendentes.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
            {pendentes.map(item => (
              <ItemCard 
                key={item.id} 
                item={item} 
                actionText="Começar Preparo" 
                nextStatus="Em Preparo"
                colorClass="border-gray-400"
                actionClass="bg-gray-900 text-white hover:bg-gray-800"
              />
            ))}
            {pendentes.length === 0 && <p className="text-center text-gray-400 mt-10 text-sm font-medium">Nenhum pedido pendente.</p>}
          </div>
        </div>

        {/* Column 2: Em Preparo */}
        <div className="flex flex-col bg-amber-100/50 rounded-3xl p-4 overflow-hidden border border-amber-200">
          <div className="flex justify-between items-center mb-4 px-2">
            <h2 className="font-bold text-amber-800 uppercase tracking-wider text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              2. Em Preparo
            </h2>
            <span className="bg-amber-200 text-amber-800 font-bold px-2 py-0.5 rounded-full text-xs">{emPreparo.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
            {emPreparo.map(item => (
              <ItemCard 
                key={item.id} 
                item={item} 
                actionText="Marcar como Pronto" 
                nextStatus="Pronto"
                colorClass="border-amber-500"
                actionClass="bg-amber-500 text-white hover:bg-amber-600"
              />
            ))}
            {emPreparo.length === 0 && <p className="text-center text-amber-600/50 mt-10 text-sm font-medium">Nenhum prato em preparo no momento.</p>}
          </div>
        </div>

        {/* Column 3: Pronto (Aguardando Retirada) */}
        <div className="flex flex-col bg-emerald-100/50 rounded-3xl p-4 overflow-hidden border border-emerald-200">
          <div className="flex justify-between items-center mb-4 px-2">
            <h2 className="font-bold text-emerald-800 uppercase tracking-wider text-sm">3. Pronto (Balcão)</h2>
            <span className="bg-emerald-200 text-emerald-800 font-bold px-2 py-0.5 rounded-full text-xs">{prontos.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
            {prontos.map(item => (
              <ItemCard 
                key={item.id} 
                item={item} 
                actionText="Entregue ao Garçom" 
                nextStatus="Entregue"
                colorClass="border-emerald-500"
                actionClass="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
              />
            ))}
            {prontos.length === 0 && <p className="text-center text-emerald-600/50 mt-10 text-sm font-medium">Balcão vazio.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
