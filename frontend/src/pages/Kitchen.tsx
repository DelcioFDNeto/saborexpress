import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { toast } from 'sonner';
import { echo } from '../echo';
import type { AxiosError } from 'axios';
import { Clock, ChefHat, Check, RefreshCw, Coffee, Trash2 } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  image_url?: string | null;
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
    } catch (err) {
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
    const channel = echo.channel('orders');
    const onOrderUpdated = () => {
      fetchItems();
      try {
        const audioCtx = new AudioContext();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(830, audioCtx.currentTime); // Bell-like frequency
        gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.8);
        oscillator.start(audioCtx.currentTime);
        oscillator.stop(audioCtx.currentTime + 0.8);
      } catch {
        // Audio not supported
      }
      toast.info('Nova atualização de comanda na cozinha!');
    };

    channel.listen('.OrderUpdated', onOrderUpdated);

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
    } catch (err) {
      console.error('Failed to update status', err);
      const axiosErr = err as AxiosError<{ message?: string }>;
      const errMsg = axiosErr.response?.data?.message || 'Erro ao atualizar status do prato';
      toast.error(errMsg);
    }
  };

  const handleCancelItem = async (id: number) => {
    if (!confirm('Deseja realmente cancelar este item da comanda? Isso ajustará o estoque automaticamente.')) return;
    try {
      await api.patch(`/kitchen/order-items/${id}/cancel`);
      fetchItems();
      toast.warning('Item de comanda cancelado na cozinha!');
    } catch (err) {
      console.error('Failed to cancel item', err);
      const axiosErr = err as AxiosError<{ message?: string }>;
      const errMsg = axiosErr.response?.data?.message || 'Erro ao cancelar o item';
      toast.error(errMsg);
    }
  };

  if (loading && items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 p-6 md:p-10 animate-fade-in">
        <div className="mb-8 flex justify-between items-center">
          <div className="space-y-3">
            <div className="h-8 bg-gray-300 rounded w-64 animate-pulse"></div>
            <div className="h-4 bg-gray-300 rounded w-48 animate-pulse"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-160px)]">
          {[1, 2, 3].map(col => (
            <div key={col} className="bg-gray-200/50 rounded-[2rem] p-4 flex flex-col gap-4">
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
    
    // Dynamic waiting time badges
    let waitBadgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200/60';
    if (minutesWaiting >= 20) {
      waitBadgeColor = 'bg-rose-50 text-rose-700 border-rose-200/60 animate-pulse font-black';
    } else if (minutesWaiting >= 10) {
      waitBadgeColor = 'bg-amber-50 text-amber-700 border-amber-200/60';
    }

    return (
      <div className={`bg-white rounded-2xl p-4 shadow-sm border-l-4 ${colorClass} flex flex-col gap-4 relative transition-all duration-300 hover:shadow-md border border-gray-100`}>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            {item.order.type === 'Delivery' ? (
              <span className="font-black text-purple-900 bg-purple-100 px-2 py-0.5 rounded text-[10px] tracking-widest border border-purple-200">
                DELIVERY
              </span>
            ) : item.order.type === 'Takeout' ? (
              <span className="font-black text-amber-900 bg-amber-100 px-2 py-0.5 rounded text-[10px] tracking-widest border border-amber-200">
                RETIRADA
              </span>
            ) : (
              <span className="font-black text-gray-900 bg-gray-100 px-2 py-0.5 rounded text-[10px] border border-gray-200 flex items-center gap-1">
                <Coffee className="w-3 h-3 text-gray-400 shrink-0" />
                Mesa {item.order.table?.number || 'S/M'}
              </span>
            )}
            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border flex items-center gap-1 ${waitBadgeColor}`}>
              <Clock className="w-3 h-3 shrink-0" />
              {minutesWaiting} min
            </span>
          </div>
          <span className="text-xs font-black text-gray-400">#{item.id}</span>
        </div>
        
        {/* Product thumbnail + quantity + name row */}
        <div className="flex gap-3.5 items-start">
          {item.product.image_url ? (
            <img 
              src={item.product.image_url} 
              alt={item.product.name} 
              className="w-12 h-12 rounded-xl object-cover shadow-sm border border-gray-100 shrink-0" 
            />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-linear-to-br from-emerald-50 to-emerald-100/50 text-emerald-600 flex items-center justify-center border border-emerald-500/10 shrink-0 shadow-inner">
              <ChefHat className="w-5 h-5 shrink-0" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-extrabold text-sm text-gray-900 leading-tight">
              <span className="text-emerald-600 mr-1.5 font-black text-base">{item.quantity}x</span> 
              {item.product.name}
            </h3>
            {item.notes && (
              <p className="mt-1 text-xs text-amber-800 bg-amber-50 border border-amber-200/50 px-2.5 py-1 rounded-lg inline-block w-fit font-medium">
                ⚠️ {item.notes}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2 mt-1">
          <button 
            onClick={() => updateStatus(item.id, nextStatus)}
            className={`w-full py-2.5 rounded-xl text-xs font-black transition-all shadow-sm cursor-pointer hover:scale-[1.01] ${actionClass}`}
          >
            {actionText}
          </button>
          
          {allowCancel && (
            <button 
              onClick={() => handleCancelItem(item.id)}
              className="w-full py-2 rounded-xl text-[10px] font-black text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100/70 border border-rose-100/55 transition-colors flex items-center justify-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5 shrink-0" />
              Cancelar Item
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 md:p-10 animate-fade-in">
      <div className="mb-8 flex justify-between items-center bg-white p-6 rounded-[2rem] shadow-sm border border-gray-200/60">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">KDS: Visão da Cozinha</h1>
          <p className="text-sabor-primary font-semibold text-xs flex items-center gap-2 mt-1">
            <span className="w-2.5 h-2.5 rounded-full bg-sabor-primary animate-pulse shrink-0"></span>
            Sincronização Ativa (Laravel Reverb)
          </p>
        </div>
        <button 
          onClick={handleSync}
          disabled={syncing}
          className="flex items-center gap-2 px-5 py-3 bg-gray-900 text-white rounded-xl text-xs font-black hover:bg-gray-800 transition-all shadow-sm border border-gray-800 disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 shrink-0 ${syncing ? 'animate-spin' : ''}`} />
          Sincronizar Fila
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-160px)]">
        {/* Column 1: Pendentes */}
        <div className="flex flex-col bg-slate-50 rounded-[2rem] overflow-hidden border border-slate-200 shadow-sm">
          <div className="bg-linear-to-r from-slate-700 via-slate-800 to-slate-900 px-5 py-4 flex justify-between items-center text-white shrink-0 shadow-md">
            <h2 className="font-black uppercase tracking-widest text-xs flex items-center gap-1.5">
              <Clock className="w-4 h-4 shrink-0" />
              1. Fila de Espera
            </h2>
            <span className="bg-white/20 font-black px-3 py-0.5 rounded-full text-xs text-white">
              {pendentes.length}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 pr-1 custom-scrollbar">
            {pendentes.map(item => (
              <ItemCard 
                key={item.id} 
                item={item} 
                actionText="Começar Preparo" 
                nextStatus="Em Preparo"
                colorClass="border-slate-400"
                actionClass="bg-slate-900 text-white hover:bg-slate-800"
                allowCancel={true}
              />
            ))}
            {pendentes.length === 0 && <p className="text-center text-slate-400 mt-12 text-xs font-semibold">Nenhum pedido pendente.</p>}
          </div>
        </div>

        {/* Column 2: Em Preparo */}
        <div className="flex flex-col bg-slate-50 rounded-[2rem] overflow-hidden border border-amber-200 shadow-sm">
          <div className="bg-linear-to-r from-amber-500 via-orange-500 to-amber-600 px-5 py-4 flex justify-between items-center text-white shrink-0 shadow-md">
            <h2 className="font-black uppercase tracking-widest text-xs flex items-center gap-1.5">
              <ChefHat className="w-4 h-4 shrink-0 animate-pulse" />
              2. Em Preparo
            </h2>
            <span className="bg-white/20 font-black px-3 py-0.5 rounded-full text-xs text-white">
              {emPreparo.length}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 pr-1 custom-scrollbar">
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
            {emPreparo.length === 0 && <p className="text-center text-amber-600/40 mt-12 text-xs font-semibold">Nenhum prato em preparo.</p>}
          </div>
        </div>

        {/* Column 3: Pronto (Aguardando Retirada) */}
        <div className="flex flex-col bg-slate-50 rounded-[2rem] overflow-hidden border border-emerald-200 shadow-sm">
          <div className="bg-linear-to-r from-emerald-500 via-teal-600 to-emerald-600 px-5 py-4 flex justify-between items-center text-white shrink-0 shadow-md">
            <h2 className="font-black uppercase tracking-widest text-xs flex items-center gap-1.5">
              <Check className="w-4 h-4 shrink-0" />
              3. Pronto (Balcão)
            </h2>
            <span className="bg-white/20 font-black px-3 py-0.5 rounded-full text-xs text-white">
              {prontos.length}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 pr-1 custom-scrollbar">
            {prontos.map(item => (
              <ItemCard 
                key={item.id} 
                item={item} 
                actionText="Entregue ao Garçom" 
                nextStatus="Entregue"
                colorClass="border-emerald-500"
                actionClass="bg-emerald-500 text-white hover:bg-emerald-600"
              />
            ))}
            {prontos.length === 0 && <p className="text-center text-emerald-600/40 mt-12 text-xs font-semibold">Balcão vazio.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
