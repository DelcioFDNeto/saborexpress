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

  const [syncing, setSyncing] = useState(false);

  const fetchItems = async () => {
    try {
      const res = await api.get('/kitchen/order-items?per_page=100');
      setItems(res.data.data || res.data || []);
    } catch (err: any) {
      console.error(err);
      toast.error('Erro ao carregar pedidos da cozinha.');
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  };

  const handleSync = () => {
    setSyncing(true);
    fetchItems();
    toast.success('Fila sincronizada com sucesso!');
  };

  useEffect(() => {
    fetchItems();
    
    // WebSockets via Laravel Echo
    const channel = window.Echo.channel('orders');
    channel.listen('.OrderUpdated', () => {
      fetchItems();
      const audio = new Audio('/sounds/sino.mp3');
      audio.play().catch(e => console.log('Audio autoplay blocked', e));
      toast.info('Nova atualização de comanda na cozinha!');
    });

    return () => {
      channel.stopListening('.OrderUpdated');
    };
  }, []);

  const updateStatus = async (id: number, newStatus: string) => {
    try {
      let endpoint = '';
      if (newStatus === 'Em Preparo') {
        endpoint = `/kitchen/order-items/${id}/start`;
      } else if (newStatus === 'Pronto') {
        endpoint = `/kitchen/order-items/${id}/mark-ready`;
      } else if (newStatus === 'Entregue') {
        endpoint = `/kitchen/order-items/${id}/deliver`;
      } else {
        throw new Error('Status de destino desconhecido');
      }

      await api.patch(endpoint);
      fetchItems();
      toast.success(`Status atualizado para ${newStatus}`);
    } catch (err: any) {
      console.error('Failed to update status', err);
      const errMsg = err.response?.data?.message || 'Erro ao atualizar status do prato';
      toast.error(errMsg);
    }
  };

  const handleCancelItem = async (id: number) => {
    if (!confirm('Deseja realmente cancelar este item da comanda? Isso ajustará o estoque automaticamente.')) return;
    try {
      await api.patch(`/kitchen/order-items/${id}/cancel`);
      fetchItems();
      toast.warning('Item de comanda cancelado na cozinha!');
    } catch (err: any) {
      console.error('Failed to cancel item', err);
      const errMsg = err.response?.data?.message || 'Erro ao cancelar o item';
      toast.error(errMsg);
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

  const ItemCard = ({ item, actionText, nextStatus, colorClass, actionClass, allowCancel }: { item: OrderItem, actionText: string, nextStatus: string, colorClass: string, actionClass: string, allowCancel?: boolean }) => {
    const minutesWaiting = Math.floor((new Date().getTime() - new Date(item.created_at).getTime()) / 60000);
    
    return (
      <div className={`bg-white rounded-2xl p-4 shadow-sm border-l-4 ${colorClass} flex flex-col gap-3 relative transition-all duration-300 hover:shadow-md`}>
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            {item.order.type === 'Delivery' ? (
              <span className="font-black text-purple-900 bg-purple-100 px-2 py-1 rounded text-xs tracking-widest border border-purple-200">
                DELIVERY
              </span>
            ) : item.order.type === 'Takeout' ? (
              <span className="font-black text-amber-900 bg-amber-100 px-2 py-1 rounded text-xs tracking-widest border border-amber-200">
                RETIRADA
              </span>
            ) : (
              <span className="font-black text-gray-900 bg-gray-100 px-2 py-1 rounded text-xs border border-gray-200">
                Mesa {item.order.table?.number || 'S/M'}
              </span>
            )}
            <span className={`text-xs font-bold ${minutesWaiting > 15 ? 'text-rose-500 animate-pulse' : 'text-gray-500'}`}>
              🕒 {minutesWaiting} min
            </span>
          </div>
          <span className="text-sm font-black text-gray-400">#{item.id}</span>
        </div>
        
        <div>
          <h3 className="font-bold text-lg text-gray-800 leading-tight">
            <span className="text-sabor-primary mr-2 font-black text-xl">{item.quantity}x</span> 
            {item.product.name}
          </h3>
          {item.notes && (
            <div className="mt-2 bg-amber-50 border border-amber-100 text-amber-800 text-sm px-3 py-2 rounded-lg font-medium">
              ⚠️ {item.notes}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 mt-2">
          <button 
            onClick={() => updateStatus(item.id, nextStatus)}
            className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm ${actionClass}`}
          >
            {actionText}
          </button>
          
          {allowCancel && (
            <button 
              onClick={() => handleCancelItem(item.id)}
              className="w-full py-2 rounded-xl text-xs font-bold text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100/70 border border-rose-100 transition-colors"
            >
              Cancelar Item
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 md:p-10">
      <div className="mb-8 flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-gray-200">
        <div>
          <h1 className="text-3xl font-black text-gray-900">KDS: Visão da Cozinha</h1>
          <p className="text-sabor-primary font-medium flex items-center gap-2 mt-1">
            <span className="w-2.5 h-2.5 rounded-full bg-sabor-primary animate-pulse"></span>
            Sincronização Ativa (Laravel Reverb)
          </p>
        </div>
        <button 
          onClick={handleSync}
          disabled={syncing}
          className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-all shadow-sm border border-gray-800 disabled:opacity-50"
        >
          <svg className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89M9 11l3 3L22 4" />
          </svg>
          Sincronizar Fila
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-160px)]">
        {/* Column 1: Pendentes */}
        <div className="flex flex-col bg-gray-200/50 rounded-3xl p-4 overflow-hidden border border-gray-300/40">
          <div className="flex justify-between items-center mb-4 px-2">
            <h2 className="font-bold text-gray-700 uppercase tracking-wider text-sm">1. Fila de Espera</h2>
            <span className="bg-gray-300 text-gray-700 font-bold px-3 py-0.5 rounded-full text-xs">{pendentes.length}</span>
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
                allowCancel={true}
              />
            ))}
            {pendentes.length === 0 && <p className="text-center text-gray-400 mt-10 text-sm font-medium">Nenhum pedido pendente.</p>}
          </div>
        </div>

        {/* Column 2: Em Preparo */}
        <div className="flex flex-col bg-amber-100/50 rounded-3xl p-4 overflow-hidden border border-amber-200">
          <div className="flex justify-between items-center mb-4 px-2">
            <h2 className="font-bold text-amber-800 uppercase tracking-wider text-sm flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
              2. Em Preparo
            </h2>
            <span className="bg-amber-200 text-amber-800 font-bold px-3 py-0.5 rounded-full text-xs">{emPreparo.length}</span>
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
                allowCancel={true}
              />
            ))}
            {emPreparo.length === 0 && <p className="text-center text-amber-600/50 mt-10 text-sm font-medium">Nenhum prato em preparo.</p>}
          </div>
        </div>

        {/* Column 3: Pronto (Aguardando Retirada) */}
        <div className="flex flex-col bg-sabor-light/50 rounded-3xl p-4 overflow-hidden border border-sabor-primary">
          <div className="flex justify-between items-center mb-4 px-2">
            <h2 className="font-bold text-sabor-dark uppercase tracking-wider text-sm">3. Pronto (Balcão)</h2>
            <span className="bg-sabor-primary text-sabor-dark font-bold px-3 py-0.5 rounded-full text-xs">{prontos.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
            {prontos.map(item => (
              <ItemCard 
                key={item.id} 
                item={item} 
                actionText="Entregue ao Garçom / Balcão" 
                nextStatus="Entregue"
                colorClass="border-sabor-primary"
                actionClass="bg-sabor-light text-sabor-dark hover:bg-sabor-light/80 border border-sabor-primary"
              />
            ))}
            {prontos.length === 0 && <p className="text-center text-sabor-primary/50 mt-10 text-sm font-medium">Balcão vazio.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
