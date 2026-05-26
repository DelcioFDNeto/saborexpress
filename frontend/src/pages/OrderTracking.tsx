import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../lib/api';
import { toast } from 'sonner';

interface Product {
  id: number;
  name: string;
}

interface OrderItem {
  id: number;
  quantity: number;
  unit_price: string;
  notes: string | null;
  status: string;
  product: Product;
}

interface Order {
  id: number;
  type: string;
  status: string;
  delivery_status: string;
  customer_name: string | null;
  customer_phone: string | null;
  delivery_address: string | null;
  total_amount: string;
  discount: string;
  service_fee: string;
  delivery_driver?: {
    name: string;
  } | null;
  items: OrderItem[];
}

export default function OrderTracking() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOrder = async () => {
    try {
      const res = await api.get(`/orders/${id}/track`);
      setOrder(res.data.data || res.data);
    } catch (err) {
      console.error(err);
      toast.error('Erro ao atualizar rastreamento.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();

    // 10s fallback polling
    const interval = setInterval(fetchOrder, 10000);

    // WebSockets via Laravel Reverb/Echo for instant updates!
    const channel = window.Echo.channel('orders');
    channel.listen('.OrderUpdated', () => {
      fetchOrder();
      toast.success('Seu pedido foi atualizado pelo restaurante!');
    });

    return () => {
      clearInterval(interval);
      channel.stopListening('.OrderUpdated');
    };
  }, [id]);

  if (loading && !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sabor-primary"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-3xl font-black text-gray-900 mb-2">Pedido Não Encontrado</h2>
        <p className="text-gray-500 mb-6 max-w-sm">
          Não conseguimos localizar o código do pedido informado. Verifique o link e tente novamente.
        </p>
        <Link to="/" className="px-6 py-3 bg-sabor-primary text-white font-bold rounded-xl hover:bg-sabor-dark transition-all">
          Ir para a Página Inicial
        </Link>
      </div>
    );
  }

  // Calculate delivery status progress steps
  const isTakeout = order.type === 'Takeout';
  const status = order.delivery_status || 'Aguardando';

  // We want to map current kitchen order item statuses to know if it's in prep
  const isAnyItemPreparing = order.items.some(item => item.status === 'Em Preparo');
  const isAnyItemReady = order.items.some(item => item.status === 'Pronto');
  const areAllItemsReadyOrEntregue = order.items.every(item => ['Pronto', 'Entregue', 'Cancelado'].includes(item.status));

  let currentStep = 1; // 1: Recebido, 2: Preparando, 3: Pronto/Rota, 4: Concluído

  if (isTakeout) {
    if (order.status === 'Paga') {
      currentStep = 4;
    } else if (areAllItemsReadyOrEntregue && order.items.length > 0) {
      currentStep = 3;
    } else if (isAnyItemPreparing || isAnyItemReady) {
      currentStep = 2;
    }
  } else {
    // Delivery
    if (status === 'Entregue' || order.status === 'Paga') {
      currentStep = 4;
    } else if (status === 'Em Rota') {
      currentStep = 3;
    } else if (isAnyItemPreparing || isAnyItemReady || status === 'Aguardando') {
      // If cooking or waiting to leave
      currentStep = isAnyItemPreparing ? 2 : 1;
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10 font-sans">
      <div className="max-w-4xl mx-auto">
        
        {/* Header card with branding */}
        <header className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div className="flex items-center gap-4">
            <img src="/logo-horizontal.png" alt="SaborExpress" className="h-14 object-contain" />
            <div>
              <span className="bg-sabor-light text-sabor-dark border border-sabor-primary/30 px-3 py-1 rounded-full text-xs font-black uppercase">Rastreamento Online</span>
              <h1 className="text-2xl font-black text-gray-900 mt-1">Pedido #{order.id}</h1>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold text-gray-400 block uppercase">Estimativa de Espera</span>
            <span className="text-xl font-black text-sabor-dark">25 - 35 minutos</span>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Timeline and tracking stats */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <h2 className="text-xl font-black text-gray-900 mb-8 border-b pb-4">Acompanhe Seu Pedido</h2>
              
              {/* Vertical Timeline */}
              <div className="space-y-8 relative before:absolute before:top-2 before:bottom-2 before:left-[18px] before:w-[2px] before:bg-gray-200">
                
                {/* Step 1: Recebido */}
                <div className="flex items-start gap-4 relative">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0 z-10 ${
                    currentStep >= 1 ? 'bg-sabor-primary text-white shadow-md' : 'bg-gray-100 text-gray-400'
                  }`}>
                    <svg className="w-4 h-4 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-extrabold text-gray-900 text-base">Pedido Recebido</h3>
                    <p className="text-gray-500 text-xs mt-1">Nossa equipe confirmou o recebimento e já está providenciando o envio para a cozinha.</p>
                  </div>
                </div>

                {/* Step 2: Preparando */}
                <div className="flex items-start gap-4 relative">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0 z-10 ${
                    currentStep >= 2 ? 'bg-amber-500 text-white shadow-md' : 'bg-gray-100 text-gray-400'
                  }`}>
                    <svg className="w-4 h-4 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2v4M17 2v4M7 2v4M2 12c0 4.418 4.477 8 10 8s10-3.582 10-8H2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-extrabold text-gray-900 text-base">Na Cozinha</h3>
                    <p className="text-gray-500 text-xs mt-1">Nossos chefs estão preparando seu prato com ingredientes selecionados e muito cuidado.</p>
                  </div>
                </div>

                {/* Step 3: Pronto/Em rota */}
                <div className="flex items-start gap-4 relative">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0 z-10 ${
                    currentStep >= 3 ? 'bg-indigo-600 text-white shadow-md animate-bounce' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {isTakeout ? (
                      <svg className="w-4 h-4 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="1" y="3" width="15" height="13" />
                        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                        <circle cx="5.5" cy="18.5" r="2.5" />
                        <circle cx="18.5" cy="18.5" r="2.5" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-gray-900 text-base">
                      {isTakeout ? 'Pronto para Retirada' : 'Saiu para Entrega'}
                    </h3>
                    <p className="text-gray-500 text-xs mt-1">
                      {isTakeout 
                        ? 'Seu prato já está embalado e quentinho no balcão! Venha retirar.' 
                        : order.delivery_driver 
                          ? `Seu pedido está a caminho! O entregador ${order.delivery_driver.name} está em rota expressa.`
                          : 'Seu pedido está a caminho! A rota expressa foi acionada.'}
                    </p>
                  </div>
                </div>

                {/* Step 4: Entregue */}
                <div className="flex items-start gap-4 relative">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0 z-10 ${
                    currentStep >= 4 ? 'bg-emerald-600 text-white shadow-md' : 'bg-gray-100 text-gray-400'
                  }`}>
                    <svg className="w-4 h-4 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-extrabold text-gray-900 text-base">
                      {isTakeout ? 'Retirado!' : 'Entregue!'}
                    </h3>
                    <p className="text-gray-500 text-xs mt-1">
                      {isTakeout 
                        ? 'Obrigado por nos escolher! Tenha uma excelente refeição.' 
                        : 'Entrega confirmada pelo nosso entregador parceiro. Bom apetite!'}
                    </p>
                  </div>
                </div>

              </div>
            </div>

            {/* Structured Address/Establishment details */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <h3 className="font-extrabold text-gray-900 text-lg mb-4">Informações de Envio</h3>
              {isTakeout ? (
                <div className="flex items-start gap-3 bg-amber-50 p-5 rounded-2xl border border-amber-100 text-sm text-amber-800 font-bold leading-relaxed">
                  <svg className="w-5 h-5 stroke-current fill-none shrink-0" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <div>
                    <p className="text-base text-amber-900 font-black">Local para Retirada</p>
                    <p className="font-medium mt-1">Av. Nazaré, 452 - Nazaré (Próximo à Praça Santuário)</p>
                    <p className="font-normal text-xs text-gray-500 mt-2">Apresente o número do pedido (#{order.id}) no balcão de atendimento.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                    <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Destinatário</span>
                    <p className="font-black text-gray-800 text-sm">{order.customer_name}</p>
                    <p className="text-xs text-gray-500 font-semibold mt-1">WhatsApp: {order.customer_phone}</p>
                  </div>
                  <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                    <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Endereço Estruturado</span>
                    <p className="font-semibold text-gray-800 text-sm leading-relaxed">{order.delivery_address}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right side: Detailed Receipt */}
          <div className="lg:col-span-1 bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col h-fit">
            <h3 className="font-black text-gray-900 text-lg mb-6 border-b pb-3">Resumo da Compra</h3>
            
            <div className="flex-1 space-y-4 max-h-[300px] overflow-y-auto pr-1 mb-6 custom-scrollbar">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between items-start text-sm">
                  <div className="flex-1 pr-3">
                    <p className="font-bold text-gray-800 leading-snug">
                      <span className="text-sabor-primary font-black mr-1">{item.quantity}x</span> 
                      {item.product.name}
                    </p>
                    {item.notes && <p className="text-xs text-amber-600 font-semibold mt-0.5">⚠️ {item.notes}</p>}
                  </div>
                  <span className="font-black text-gray-900">
                    R$ {(Number(item.unit_price) * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-dashed border-gray-200 pt-4 space-y-3 mt-auto">
              <div className="flex justify-between text-xs font-semibold text-gray-500">
                <span>Subtotal</span>
                <span>R$ {Number(order.total_amount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs font-semibold text-gray-500">
                <span>Taxa de Serviço</span>
                <span>R$ {Number(order.service_fee || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs font-semibold text-rose-500">
                <span>Desconto</span>
                <span>- R$ {Number(order.discount || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-end border-t border-gray-100 pt-3">
                <span className="text-xs font-extrabold text-gray-900 uppercase">Total Pago</span>
                <span className="text-xl font-black text-gray-900">
                  R$ {(Number(order.total_amount) + Number(order.service_fee || 0) - Number(order.discount || 0)).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
