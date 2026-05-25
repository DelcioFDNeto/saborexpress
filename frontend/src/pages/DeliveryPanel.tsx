import React, { useEffect, useState, useContext } from 'react';
import { api } from '../lib/api';
import { AuthContext } from '../contexts/AuthContext';
import { toast } from 'sonner';

interface Order {
  id: number;
  type: string;
  status: string;
  delivery_status: string;
  customer_name: string | null;
  customer_phone: string | null;
  delivery_address: string | null;
  total_amount: string;
  delivery_driver_id: number | null;
  delivery_driver?: {
    id: number;
    name: string;
  } | null;
}

export default function DeliveryPanel() {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await api.get(`/orders`);
      const allOrders = res.data.data ? res.data.data : res.data;
      
      // Filter for Delivery orders that are not fully delivered yet
      const deliveryOrders = allOrders.filter(
        (o: Order) => o.type === 'Delivery' && o.delivery_status !== 'Entregue'
      );
      setOrders(deliveryOrders);
    } catch (err) {
      console.error(err);
      toast.error('Erro ao carregar entregas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleAssignDriver = async (orderId: number) => {
    try {
      await api.patch(`/orders/${orderId}/assign-driver`);
      toast.success('Você assumiu esta entrega! Ela foi movida para suas entregas ativas.');
      fetchOrders();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Erro ao assumir entrega.');
    }
  };

  const handleUpdateStatus = async (orderId: number, status: string) => {
    try {
      await api.put(`/orders/${orderId}/delivery-status`, {
        delivery_status: status
      });
      toast.success(`Pedido #${orderId} atualizado para: ${status}`);
      fetchOrders();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Erro ao atualizar status.');
    }
  };

  // Grouping orders for the columns
  // 1. Aguardando Entregador (orders with type Delivery, delivery_driver_id is null)
  const aguardando = orders.filter((o) => !o.delivery_driver_id);

  // 2. Minhas Entregas (orders assigned to this driver and not delivered)
  const minhasEntregas = orders.filter(
    (o) => o.delivery_driver_id === user?.id && o.delivery_status !== 'Entregue'
  );

  const OrderCard = ({ order, isMine }: { order: Order; isMine: boolean }) => (
    <div className={`bg-white rounded-3xl p-6 border transition-all duration-300 shadow-sm relative overflow-hidden group hover:shadow-lg ${
      isMine ? 'border-indigo-100 shadow-indigo-50/50' : 'border-gray-100'
    }`}>
      {isMine && (
        <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-600"></div>
      )}
      
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="bg-gray-100 text-gray-800 text-xs font-bold px-2 py-1 rounded-lg uppercase tracking-wider mb-2 inline-block">
            Pedido #{order.id}
          </span>
          <h3 className="font-bold text-xl text-gray-900 leading-tight">
            {order.customer_name || 'Cliente Sem Nome'}
          </h3>
          <p className="text-gray-500 text-sm mt-1.5 flex items-center gap-1.5 font-medium">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            {order.customer_phone || 'Não informado'}
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs font-bold text-gray-400 block uppercase">Valor</span>
          <span className="font-black text-gray-900 text-lg">R$ {Number(order.total_amount).toFixed(2)}</span>
        </div>
      </div>

      <div className="bg-gray-50 rounded-2xl p-4 mb-4 border border-gray-100">
        <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Endereço de Entrega</span>
        <p className="font-semibold text-gray-800 text-sm leading-relaxed">
          {order.delivery_address || 'Endereço não informado.'}
        </p>
      </div>

      {order.delivery_driver && !isMine && (
        <div className="flex items-center gap-2 mb-4 text-xs font-bold text-gray-500 bg-gray-100 p-2.5 rounded-xl border">
          🛵 Entregador: <span className="text-gray-700">{order.delivery_driver.name}</span>
        </div>
      )}

      {/* Action Buttons */}
      {!order.delivery_driver_id ? (
        <button 
          onClick={() => handleAssignDriver(order.id)}
          className="w-full py-3.5 bg-gray-900 text-white rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-gray-800 transition-colors shadow-sm"
        >
          🤝 Aceitar Entrega
        </button>
      ) : isMine ? (
        <div className="space-y-2">
          {order.delivery_status === 'Aguardando' && (
            <button 
              onClick={() => handleUpdateStatus(order.id, 'Em Rota')}
              className="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-indigo-700 transition-colors shadow-sm hover:shadow-indigo-200"
            >
              🚚 Sair para Entrega
            </button>
          )}
          {order.delivery_status === 'Em Rota' && (
            <button 
              onClick={() => handleUpdateStatus(order.id, 'Entregue')}
              className="w-full py-3.5 bg-emerald-600 text-white rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-emerald-700 transition-colors shadow-sm hover:shadow-emerald-200"
            >
              ✅ Confirmar Entrega Realizada
            </button>
          )}
        </div>
      ) : null}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-6 md:p-10 font-sans">
      <div className="max-w-6xl mx-auto">
        
        <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-3xl shadow-sm border border-gray-200/50 gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center border border-indigo-100 shadow-sm">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">Painel de Entregas</h1>
              <p className="text-gray-500 font-medium">Aceite pedidos de entrega e faça seu gerenciamento de rotas em tempo real.</p>
            </div>
          </div>
          <button 
            onClick={fetchOrders} 
            className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-bold transition-all border border-gray-300 shadow-xs flex items-center gap-1.5"
          >
            🔄 Recarregar
          </button>
        </header>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Column 1: Aguardando Entregador */}
            <div>
              <div className="flex items-center gap-3 mb-6 bg-white py-3 px-5 rounded-2xl border border-gray-200 w-fit">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
                <h2 className="text-sm font-black text-gray-700 uppercase tracking-wider">Aguardando Entregador</h2>
                <span className="bg-rose-100 text-rose-700 font-black px-2.5 py-0.5 rounded-full text-xs">
                  {aguardando.length}
                </span>
              </div>
              
              <div className="space-y-6">
                {aguardando.map((order) => (
                  <OrderCard key={order.id} order={order} isMine={false} />
                ))}
                {aguardando.length === 0 && (
                  <div className="text-center py-16 bg-white rounded-3xl border-2 border-dashed border-gray-200 text-gray-400 font-medium p-6">
                    <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Nenhum pedido aguardando entregador.
                  </div>
                )}
              </div>
            </div>

            {/* Column 2: Minhas Entregas */}
            <div>
              <div className="flex items-center gap-3 mb-6 bg-indigo-50 border border-indigo-100 py-3 px-5 rounded-2xl w-fit">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse"></span>
                <h2 className="text-sm font-black text-indigo-900 uppercase tracking-wider">Minhas Entregas Ativas</h2>
                <span className="bg-indigo-200 text-indigo-800 font-black px-2.5 py-0.5 rounded-full text-xs">
                  {minhasEntregas.length}
                </span>
              </div>

              <div className="space-y-6">
                {minhasEntregas.map((order) => (
                  <OrderCard key={order.id} order={order} isMine={true} />
                ))}
                {minhasEntregas.length === 0 && (
                  <div className="text-center py-16 bg-white rounded-3xl border-2 border-dashed border-gray-200 text-gray-400 font-medium p-6">
                    <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Você não assumiu nenhuma entrega ainda.
                  </div>
                )}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
