import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

interface Product {
  id: number;
  name: string;
}

interface OrderItem {
  id: number;
  product_id: number;
  quantity: number;
  unit_price: string;
  notes: string | null;
  product: Product;
}

interface Order {
  id: number;
  type: string;
  status: string;
  delivery_status: string;
  total_amount: string;
  delivery_address: string;
  created_at: string;
  items: OrderItem[];
}

export default function ClientOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Busca o histórico de pedidos de delivery e retirada do cliente autenticado
  const fetchOrders = async () => {
    try {
      const res = await api.get('/client/orders');
      const data = res.data.data ? res.data.data : res.data || [];
      setOrders(data);
    } catch (err) {
      console.error(err);
      toast.error('Erro ao carregar o histórico de pedidos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sabor-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-10 font-sans animate-fade-in">
      
      {/* Cabeçalho da Visão do Cliente */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div>
          <span className="bg-sabor-light text-sabor-dark border border-sabor-primary/30 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
            Histórico e Rastreamento
          </span>
          <h1 className="text-3xl font-black text-gray-900 mt-2">Meus Pedidos</h1>
        </div>
        <p className="text-gray-500 text-sm max-w-xs">
          Acompanhe o andamento dos seus pedidos em tempo real direto da nossa cozinha até a sua mesa ou casa.
        </p>
      </header>

      {/* Lista de Pedidos Realizados */}
      {orders.length === 0 ? (
        <div className="text-center p-16 bg-white rounded-3xl border border-gray-100 shadow-sm max-w-md mx-auto flex flex-col items-center">
          <span className="text-5xl mb-4">🍽️</span>
          <h3 className="font-extrabold text-gray-800 text-lg mb-1">Nenhum pedido efetuado</h3>
          <p className="text-gray-400 text-xs max-w-xs leading-relaxed">
            Você ainda não fez nenhum pedido de delivery ou retirada. Visite o nosso cardápio para experimentar as maravilhas da Amazônia!
          </p>
          <Link 
            to="/cardapio"
            className="mt-6 px-6 py-3 bg-sabor-primary hover:bg-sabor-primary/95 text-sabor-dark font-black text-xs rounded-xl shadow-md transition-all hover:scale-102"
          >
            Ver Cardápio Regional 🍲
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map(order => {
            const dateObj = new Date(order.created_at);
            const formattedDate = dateObj.toLocaleDateString('pt-BR');
            const formattedTime = dateObj.toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'});
            
            return (
              <div 
                key={order.id} 
                className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
              >
                {/* Detalhes do Pedido */}
                <div className="flex-1 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-black text-gray-900 uppercase">
                      Pedido #{order.id}
                    </span>
                    <span className="text-gray-300">|</span>
                    <span className="text-xs text-gray-400 font-semibold">
                      📅 {formattedDate} às {formattedTime}
                    </span>
                    <span className="text-gray-300">|</span>
                    <span className={`px-2.5 py-0.5 text-[9px] font-black uppercase rounded-full ${
                      order.type === 'Delivery' 
                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' 
                        : 'bg-amber-50 text-amber-700 border border-amber-100'
                    }`}>
                      {order.type === 'Delivery' ? '🛵 Delivery' : '🛍️ Retirada'}
                    </span>
                  </div>

                  {/* Lista de Itens do Pedido */}
                  <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100 space-y-2">
                    {order.items.map(item => (
                      <p key={item.id} className="text-xs font-bold text-gray-700">
                        <span className="text-sabor-dark font-black mr-1">{item.quantity}x</span>
                        {item.product?.name}
                        {item.notes && <span className="text-[10px] text-amber-600 font-semibold ml-2">({item.notes})</span>}
                      </p>
                    ))}
                  </div>

                  {/* Informações adicionais de entrega */}
                  {order.type === 'Delivery' && (
                    <p className="text-[10px] text-gray-400 font-semibold">
                      📍 Endereço: {order.delivery_address}
                    </p>
                  )}
                </div>

                {/* Status e Ação */}
                <div className="flex md:flex-col items-start md:items-end justify-between w-full md:w-auto shrink-0 gap-4 md:gap-3 border-t md:border-t-0 pt-4 md:pt-0 border-gray-100">
                  <div className="text-left md:text-right">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status do Pedido</p>
                    <div className="mt-1">
                      {order.delivery_status === 'Entregue' || order.delivery_status === 'Finalizado' ? (
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase rounded-full border border-emerald-200">
                          Entregue
                        </span>
                      ) : order.delivery_status === 'Cancelado' || order.status === 'Cancelada' ? (
                        <span className="px-3 py-1 bg-rose-100 text-rose-800 text-[10px] font-black uppercase rounded-full border border-rose-200">
                          Cancelado
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-amber-100 text-amber-800 text-[10px] font-black uppercase rounded-full border border-amber-200 animate-pulse">
                          {order.delivery_status || 'Em Preparo'}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-left md:text-right">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Valor Pago</p>
                    <p className="text-lg font-black text-sabor-dark mt-0.5">
                      R$ {Number(order.total_amount).toFixed(2)}
                    </p>
                  </div>

                  {order.delivery_status !== 'Entregue' && order.delivery_status !== 'Finalizado' && order.delivery_status !== 'Cancelado' && (
                    <Link 
                      to={`/acompanhar-pedido/${order.id}`}
                      className="px-4 py-2.5 bg-sabor-primary hover:bg-sabor-primary/95 text-sabor-dark font-black text-xs rounded-xl shadow-md transition-all hover:scale-102 text-center"
                    >
                      🛵 Acompanhar Rastreio
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
