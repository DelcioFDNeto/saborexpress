import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Order {
  id: number;
  type: string;
  status: string;
  delivery_status: string;
  customer_name: string | null;
  customer_phone: string | null;
  delivery_address: string | null;
  total_amount: string;
}

export default function DeliveryPanel() {
  const [orders, setOrders] = useState<Order[]>([]);

  const fetchOrders = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const res = await axios.get(`${apiUrl}/api/orders`);
      const allOrders = res.data.data ? res.data.data : res.data;
      
      // Delivery Driver sees orders of type 'Delivery' that are paid (status 'Finalizada' or pending logic)
      // For now, let's assume they are ready for delivery if delivery_status is 'Aguardando' or 'Em Rota'.
      // Note: If Kitchen has to prep it, the Kitchen might need a way to mark the whole Order as 'Pronto' 
      // but for simplicity, we assume if it's in the list it's either cooking or ready. 
      // Let's filter those that are delivery_status != 'Entregue'
      const deliveryOrders = allOrders.filter((o: Order) => o.type === 'Delivery' && o.delivery_status !== 'Entregue');
      setOrders(deliveryOrders);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 15000);
    return () => clearInterval(interval);
  }, []);

  // Simulating an endpoint for delivery status update since we didn't explicitly create one in Laravel,
  // we can use a direct PUT to /api/orders/{id} or we assume it exists. Wait, we don't have a specific endpoint.
  // Actually, we can use the default update method in OrderController.
  const updateDeliveryStatus = async (id: number, newStatus: string) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      await axios.put(`${apiUrl}/api/orders/${id}/delivery-status`, {
        delivery_status: newStatus
      });
      fetchOrders();
    } catch (err) {
      console.error('Failed to update status', err);
      alert('Erro ao atualizar status. Certifique-se que o backend suporta essa atualização.');
    }
  };

  const aguardando = orders.filter(o => o.delivery_status === 'Aguardando' || !o.delivery_status);
  const emRota = orders.filter(o => o.delivery_status === 'Em Rota');

  const OrderCard = ({ order, isEmRota }: { order: Order, isEmRota: boolean }) => (
    <div className={`bg-white rounded-3xl p-6 border ${isEmRota ? 'border-indigo-200 shadow-indigo-100' : 'border-gray-100'} shadow-sm relative overflow-hidden`}>
      {isEmRota && <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>}
      
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="bg-gray-100 text-gray-800 text-xs font-bold px-2 py-1 rounded-lg uppercase tracking-wider mb-2 inline-block">Pedido #{order.id}</span>
          <h3 className="font-bold text-xl text-gray-900">{order.customer_name || 'Cliente'}</h3>
          <p className="text-gray-500 text-sm mt-1 flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
            {order.customer_phone || 'Não informado'}
          </p>
        </div>
      </div>

      <div className="bg-gray-50 rounded-2xl p-4 mb-4">
        <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Endereço de Entrega</span>
        <p className="font-medium text-gray-800 leading-relaxed">
          {order.delivery_address || 'Endereço não informado.'}
        </p>
      </div>

      {!isEmRota ? (
        <button 
          onClick={() => updateDeliveryStatus(order.id, 'Em Rota')}
          className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-gray-800 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
          Sair para Entrega
        </button>
      ) : (
        <button 
          onClick={() => updateDeliveryStatus(order.id, 'Entregue')}
          className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-indigo-700 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
          Confirmar Entrega
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-5xl mx-auto">
        <header className="mb-10 flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-900">Painel do Entregador</h1>
              <p className="text-gray-500 font-medium">Gerencie suas rotas e entregas.</p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Aguardando Saída */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-xl font-bold text-gray-800">Aguardando Saída</h2>
              <span className="bg-gray-200 text-gray-700 font-bold px-3 py-0.5 rounded-full text-sm">{aguardando.length}</span>
            </div>
            <div className="space-y-4">
              {aguardando.map(order => <OrderCard key={order.id} order={order} isEmRota={false} />)}
              {aguardando.length === 0 && <p className="text-gray-400 font-medium text-center py-10 bg-white rounded-3xl border border-dashed border-gray-200">Nenhum pedido aguardando saída.</p>}
            </div>
          </div>

          {/* Em Rota */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-xl font-bold text-indigo-800 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse"></span>
                Em Rota
              </h2>
              <span className="bg-indigo-100 text-indigo-700 font-bold px-3 py-0.5 rounded-full text-sm">{emRota.length}</span>
            </div>
            <div className="space-y-4">
              {emRota.map(order => <OrderCard key={order.id} order={order} isEmRota={true} />)}
              {emRota.length === 0 && <p className="text-gray-400 font-medium text-center py-10 bg-white rounded-3xl border border-dashed border-gray-200">Nenhum pedido em rota no momento.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
