import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { toast } from 'sonner';

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
    try {      const res = await api.get(`/order-items`);
      setItems(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
    
    // WebSockets via Laravel Echo
    const channel = window.Echo.channel('orders');
    channel.listen('.OrderUpdated', () => {
      fetchItems();
      const audio = new Audio('/sounds/sino.mp3');
      audio.play().catch(e => console.log('Audio autoplay blocked', e));
      toast.success('Novo pedido ou atualização na cozinha!');
    });

    return () => {
      channel.stopListening('.OrderUpdated');
    };
  }, []);

  const updateStatus = async (id: number, newStatus: string) => {
    try {      await api.put(`/order-items/${id}`, { status: newStatus });
      fetchItems();
      toast.success(`Status atualizado para ${newStatus}`);
    } catch (err) {
      console.error('Failed to update status', err);
      toast.error('Erro ao atualizar status');
    }
  };

  if (loading && items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 p-6 md:p-10">
        <div className="mb-8 flex justify-between items-center">
          <div className="space-y-3">
            <div className="h-8 bg-gray-300 rounded w-64 animate-pulse"></div>
            <div className="h-4 bg-gray-300 rounded w-48 animate-pulse"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-160px)]">
          {[1, 2, 3].map(col => (
            <div key={col} className="bg-gray-200/50 rounded-3xl p-4 flex flex-col gap-4">
              <div className="h-6 bg-gray-300 rounded w-1/3 animate-pulse"></div>
              {[1, 2, 3].map(item => (
                <div key={item} className="h-32 bg-white/50 rounded-2xl animate-pulse"></div>
              ))}
            </div>
          ))}
        </div>
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
              â± {minutesWaiting} min
            </span>
          </div>
          <span className="text-xl font-black text-gray-400">#{item.id}</span>
        </div>
        
        <div>
          <h3 className="font-bold text-lg text-gray-800 leading-tight">
            <span className="text-sabor-primary mr-2">{item.quantity}x</span> 
            {item.product.name}
          </h3>
          {item.notes && (
            <div className="mt-2 bg-amber-50 border border-amber-100 text-amber-800 text-sm px-3 py-2 rounded-lg font-medium">
              âš ï¸ {item.notes}
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
          <p className="text-sabor-primary font-medium flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-sabor-primary animate-pulse"></span>
            Sincronização em Tempo Real (WebSockets)
          </p>
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
        <div className="flex flex-col bg-sabor-light/50 rounded-3xl p-4 overflow-hidden border border-sabor-primary">
          <div className="flex justify-between items-center mb-4 px-2">
            <h2 className="font-bold text-sabor-dark uppercase tracking-wider text-sm">3. Pronto (Balcão)</h2>
            <span className="bg-sabor-primary text-sabor-dark font-bold px-2 py-0.5 rounded-full text-xs">{prontos.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
            {prontos.map(item => (
              <ItemCard 
                key={item.id} 
                item={item} 
                actionText="Entregue ao Garçom" 
                nextStatus="Entregue"
                colorClass="border-sabor-primary"
                actionClass="bg-sabor-light text-sabor-dark hover:bg-sabor-light border border-sabor-primary"
              />
            ))}
            {prontos.length === 0 && <p className="text-center text-sabor-primary/50 mt-10 text-sm font-medium">Balcão vazio.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

