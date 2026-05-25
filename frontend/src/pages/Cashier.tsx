import { useEffect, useState } from 'react';
import { api } from '../lib/api';

interface OrderItem {
  id: number;
  quantity: number;
  unit_price: string;
  product: { name: string };
}

interface Order {
  id: number;
  type: string;
  status: string;
  total_amount: string;
  service_fee: string;
  discount: string;
  customer_name: string | null;
  table: { number: string } | null;
  items: OrderItem[];
}

interface SplitSimulation {
  message?: string;
  installments?: number[];
}

export default function Cashier() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
  const [splitType, setSplitType] = useState<'integral' | 'equal' | 'items'>('integral');
  const [numPeople, setNumPeople] = useState(1);
  const [selectedItemIds, setSelectedItemIds] = useState<number[]>([]);
  const [simulation, setSimulation] = useState<SplitSimulation | null>(null);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders');
      const actionable = res.data.data ? res.data.data : res.data;
      const filtered = actionable.filter((o: Order) => 
        (o.type === 'Mesa' && o.status === 'Fechamento') ||
        (o.type === 'Delivery' && o.status === 'Aberta')
      );
      setOrders(filtered);
      
      if (selectedOrder) {
        const updated = filtered.find((o: Order) => o.id === selectedOrder.id);
        if (updated) setSelectedOrder(updated);
        else setSelectedOrder(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!selectedOrder) return;
    
    const simulateSplit = async () => {
      try {
        const res = await api.post(`/orders/${selectedOrder.id}/split`, {
          split_type: splitType,
          num_people: numPeople,
          item_ids: selectedItemIds
        });
        setSimulation(res.data);
      } catch (err: unknown) {
        console.error(err);
        setSimulation(null);
      }
    };
    
    simulateSplit();
  }, [selectedOrder, splitType, numPeople, selectedItemIds]);

  const handlePay = async (amount: number, method: string) => {
    try {
      await api.post(`/orders/${selectedOrder?.id}/pay`, {
        amount,
        method
      });
      alert('Pagamento registrado com sucesso!');
      fetchOrders();
      setSplitType('integral');
      setSelectedItemIds([]);
    } catch (err) {
      console.error(err);
      alert('Erro ao registrar pagamento.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      
      {/* Sidebar: Orders List */}
      <div className="w-full md:w-96 bg-white border-r border-gray-200 flex flex-col h-screen z-10 shadow-xl">
        <div className="p-6 bg-emerald-900 text-white">
          <h1 className="text-2xl font-black mb-1 flex items-center gap-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            Caixa
          </h1>
          <p className="text-emerald-100 text-sm font-medium">Contas aguardando recebimento</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {orders.map(order => (
            <div 
              key={order.id} 
              onClick={() => setSelectedOrder(order)}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer shadow-sm hover:shadow-md ${selectedOrder?.id === order.id ? 'border-emerald-500 bg-emerald-50' : 'border-gray-100 bg-white hover:border-gray-200'}`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded ${order.type === 'Mesa' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                    {order.type} {order.table ? `* Mesa ${order.table.number}` : ''}
                  </span>
                  <h3 className="font-bold text-gray-900 mt-1">Comanda #{order.id}</h3>
                </div>
                <span className="font-black text-gray-900">R$ {Number(order.total_amount).toFixed(2)}</span>
              </div>
              <p className="text-sm text-gray-500">{order.customer_name || 'Sem nome'}</p>
            </div>
          ))}

          {orders.length === 0 && (
            <div className="text-center text-gray-400 mt-10 p-4">
              Nenhuma conta aguardando pagamento no momento.
            </div>
          )}
        </div>
      </div>

      {/* Main Content: Checkout Panel */}
      <div className="flex-1 bg-gray-50 p-6 md:p-10 flex flex-col h-screen overflow-y-auto">
        {!selectedOrder ? (
          <div className="flex-1 flex items-center justify-center text-gray-400 flex-col">
            <svg className="w-24 h-24 mb-4 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
            <h2 className="text-2xl font-bold text-gray-300">Selecione uma conta</h2>
            <p>Clique em uma comanda na lista para iniciar o recebimento.</p>
          </div>
        ) : (
          <div className="max-w-4xl w-full mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Esquerda: Resumo da Conta */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col h-fit">
              <h2 className="text-2xl font-black text-gray-900 mb-6">Resumo</h2>
              
              <div className="flex-1 space-y-4 mb-8">
                <div className="flex justify-between text-gray-600 font-medium">
                  <span>Subtotal dos Itens</span>
                  <span>R$ {Number(selectedOrder.total_amount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600 font-medium">
                  <span>Taxa de Serviço (10%)</span>
                  <span>R$ {Number(selectedOrder.service_fee || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-rose-600 font-medium">
                  <span>Descontos</span>
                  <span>- R$ {Number(selectedOrder.discount || 0).toFixed(2)}</span>
                </div>
              </div>

              <div className="border-t border-gray-200 border-dashed pt-6 mt-auto">
                <div className="flex justify-between items-end">
                  <span className="text-gray-500 font-bold uppercase tracking-wider text-sm">Total da Conta</span>
                  <span className="text-4xl font-black text-gray-900">
                    R$ {(Number(selectedOrder.total_amount) + Number(selectedOrder.service_fee || 0) - Number(selectedOrder.discount || 0)).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Direita: Motor de Divisão e Recebimento */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col h-fit">
              <h2 className="text-2xl font-black text-gray-900 mb-6">Recebimento</h2>
              
              {simulation?.message === 'Conta já está paga.' ? (
                <div className="bg-emerald-50 text-emerald-700 p-6 rounded-2xl flex flex-col items-center justify-center flex-1 text-center border border-emerald-100">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                  </div>
                  <h3 className="text-xl font-bold">Conta Quitada</h3>
                  <p className="mt-2 text-emerald-600/80 font-medium">Todos os recebimentos foram registrados. A comanda será finalizada.</p>
                </div>
              ) : (
                <>
                  {/* Division Engine */}
                  <div className="mb-8">
                    <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">Como o cliente vai pagar?</label>
                    <div className="grid grid-cols-3 gap-2">
                      <button 
                        onClick={() => setSplitType('integral')}
                        className={`py-3 px-2 rounded-xl font-bold text-sm transition-all border ${splitType === 'integral' ? 'bg-gray-900 text-white border-gray-900 shadow-md' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                      >
                        Integral
                      </button>
                      <button 
                        onClick={() => setSplitType('equal')}
                        className={`py-3 px-2 rounded-xl font-bold text-sm transition-all border ${splitType === 'equal' ? 'bg-gray-900 text-white border-gray-900 shadow-md' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                      >
                        Dividir Igual
                      </button>
                      <button 
                        onClick={() => setSplitType('items')}
                        className={`py-3 px-2 rounded-xl font-bold text-sm transition-all border ${splitType === 'items' ? 'bg-gray-900 text-white border-gray-900 shadow-md' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                      >
                        Por Item
                      </button>
                    </div>

                    {splitType === 'equal' && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 flex justify-between items-center">
                        <span className="font-medium text-gray-700">Dividir para quantas pessoas?</span>
                        <div className="flex items-center gap-3">
                          <button onClick={() => setNumPeople(Math.max(1, numPeople - 1))} className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center font-bold text-gray-600">-</button>
                          <span className="font-black text-xl w-6 text-center">{numPeople}</span>
                          <button onClick={() => setNumPeople(numPeople + 1)} className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center font-bold text-gray-600">+</button>
                        </div>
                      </div>
                    )}

                    {splitType === 'items' && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 max-h-60 overflow-y-auto space-y-2 custom-scrollbar">
                        <span className="font-bold text-sm text-gray-700 uppercase tracking-wider block mb-3">Selecione os itens</span>
                        {selectedOrder.items.map((item) => (
                          <label key={item.id} className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl cursor-pointer hover:border-emerald-300 transition-colors">
                            <input 
                              type="checkbox" 
                              className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                              checked={selectedItemIds.includes(item.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedItemIds([...selectedItemIds, item.id]);
                                } else {
                                  setSelectedItemIds(selectedItemIds.filter(id => id !== item.id));
                                }
                              }}
                            />
                            <div className="flex-1">
                              <p className="font-bold text-gray-900 text-sm">{item.product.name} (x{item.quantity})</p>
                              <p className="text-xs text-gray-500">R$ {Number(item.unit_price).toFixed(2)} un</p>
                            </div>
                            <span className="font-black text-gray-900 text-sm">
                              R$ {(Number(item.unit_price) * item.quantity).toFixed(2)}
                            </span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Parcelas (Simulation) */}
                  {simulation && simulation.installments && (
                    <div className="space-y-3 mb-8">
                      <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Parcelas a Cobrar</h4>
                      {simulation.installments.map((amount: number, index: number) => (
                        <div key={index} className="flex justify-between items-center p-4 bg-blue-50/50 border border-blue-100 rounded-2xl group hover:bg-blue-50 transition-colors">
                          <div className="flex items-center gap-3">
                            <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">{index + 1}</span>
                            <span className="font-black text-gray-900 text-lg">R$ {amount.toFixed(2)}</span>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => handlePay(amount, 'PIX')} className="px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 rounded-lg transition-colors">PIX</button>
                            <button onClick={() => handlePay(amount, 'Cartao')} className="px-3 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-100 hover:bg-indigo-200 rounded-lg transition-colors">Cartão</button>
                            <button onClick={() => handlePay(amount, 'Dinheiro')} className="px-3 py-1.5 text-xs font-bold text-amber-700 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors">Dinheiro</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
