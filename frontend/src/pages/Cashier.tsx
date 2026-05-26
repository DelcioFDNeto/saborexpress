import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { toast } from 'sonner';

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

export default function Cashier() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [movements, setMovements] = useState<any[]>([]);
  const [cashSummary, setCashSummary] = useState({ total_in: 0, total_out: 0, balance: 0 });
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [movementModal, setMovementModal] = useState<'Sangria' | 'Suprimento' | null>(null);
  const [movementAmount, setMovementAmount] = useState('');
  const [movementDesc, setMovementDesc] = useState('');
  
  // Payment Simulation State
  const [splitType, setSplitType] = useState<'integral' | 'equal' | 'items' | 'custom'>('integral');
  const [numPeople, setNumPeople] = useState(1);
  const [selectedItemIds, setSelectedItemIds] = useState<number[]>([]);
  const [simulation, setSimulation] = useState<any>(null);
  const [paidTotal, setPaidTotal] = useState(0);
  const [customAmount, setCustomAmount] = useState('');

  // Fechamento de Caixa State
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportData, setReportData] = useState<any>(null);

  const fetchReport = async () => {
    try {
      const res = await api.get('/cash/report');
      setReportData(res.data);
      setIsReportOpen(true);
    } catch (err) {
      console.error(err);
      toast.error('Erro ao carregar relatório financeiro.');
    }
  };

  const fetchOrders = async () => {
    try {      const res = await api.get(`/orders`);
      const actionable = res.data.data ? res.data.data : res.data;
      const filtered = actionable.filter((o: Order) => 
        (o.type === 'Mesa' && o.status === 'Fechada') || 
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

  const fetchCash = async () => {
    try {
      const res = await api.get('/cash/movements');
      setMovements(res.data.data);
      setCashSummary(res.data.summary);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchCash();
    
    // WebSockets via Laravel Echo
    const channel = window.Echo.channel('orders');
    channel.listen('.OrderUpdated', () => {
      fetchOrders();
    });

    return () => {
      channel.stopListening('.OrderUpdated');
    };
  }, []);

  useEffect(() => {
    if (!selectedOrder) return;
    
    if (splitType === 'custom') {
      setSimulation({
        type: 'custom',
        installments: []
      });
      return;
    }

    // Simulate Split
    const simulateSplit = async () => {
      try {        const res = await api.post(`/orders/${selectedOrder.id}/split`, {
          split_type: splitType,
          num_people: numPeople,
          item_ids: selectedItemIds
        });
        setSimulation(res.data);
      } catch (err: any) {
        console.error(err);
        setSimulation(null);
      }
    };
    
    simulateSplit();
  }, [selectedOrder, splitType, numPeople, selectedItemIds]);

  const handlePay = async (amount: number, method: string) => {
    try {      await api.post(`/orders/${selectedOrder?.id}/pay`, {
        amount,
        method
      });
      
      const audio = new Audio('/sounds/caixa.mp3');
      audio.play().catch(e => console.log('Audio autoplay blocked', e));
      toast.success('Pagamento registrado com sucesso!');
      
      fetchOrders();
      fetchCash();
      setSplitType('integral');
      setSelectedItemIds([]);
    } catch (err) {
      console.error(err);
      toast.error('Erro ao registrar pagamento.');
    }
  };

  const handleMovement = async () => {
    if (!movementAmount || !movementDesc) {
      toast.error('Preencha valor e descrição.');
      return;
    }
    try {
      await api.post('/cash/movements', {
        type: movementModal,
        amount: parseFloat(movementAmount),
        description: movementDesc,
      });
      toast.success(movementModal + ' registrada com sucesso!');
      setMovementModal(null);
      setMovementAmount('');
      setMovementDesc('');
      fetchCash();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao registrar movimentação.');
    }
  };

  const handleRefund = async (paymentId: number) => {
    try {
      await api.post(`/payments/${paymentId}/refund`);
      toast.success('Estorno realizado com sucesso!');
      fetchCash();
      fetchOrders();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao realizar estorno.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      
      {/* Sidebar: Orders List */}
      <div className="w-full md:w-96 bg-white border-r border-gray-200 flex flex-col h-screen z-10 shadow-xl">
        <div className="p-6 bg-sabor-dark text-white">
          <h1 className="text-2xl font-black mb-1 flex items-center gap-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            Caixa
          </h1>
          <p className="text-sabor-light text-sm font-medium">Contas aguardando recebimento</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {orders.map(order => (
            <div 
              key={order.id} 
              onClick={() => setSelectedOrder(order)}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer shadow-sm hover:shadow-md ${selectedOrder?.id === order.id ? 'border-sabor-primary bg-sabor-light' : 'border-gray-100 bg-white hover:border-gray-200'}`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded ${order.type === 'Mesa' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                    {order.type} {order.table ? `â€¢ Mesa ${order.table.number}` : ''}
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

        <div className="p-4 border-t border-gray-200 space-y-2">
          <button 
            onClick={() => setIsDrawerOpen(true)}
            className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl transition-colors border border-gray-300 flex items-center justify-center gap-1.5"
          >
            <svg className="w-4 h-4 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
            </svg>
            <span>Abrir Gaveta / Histórico</span>
          </button>
          <button 
            onClick={fetchReport}
            className="w-full py-3 bg-sabor-primary text-sabor-dark font-black rounded-xl hover:bg-sabor-primary/90 transition-all shadow-sm flex items-center justify-center gap-1.5"
          >
            <svg className="w-4 h-4 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
            <span>Resumo do Turno (Fechamento)</span>
          </button>
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
                <div className="bg-sabor-light text-sabor-dark p-6 rounded-2xl flex flex-col items-center justify-center flex-1 text-center border border-sabor-light">
                  <div className="w-16 h-16 bg-sabor-light rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                  </div>
                  <h3 className="text-xl font-bold">Conta Quitada</h3>
                  <p className="mt-2 text-sabor-primary/80 font-medium">Todos os recebimentos foram registrados. A comanda será finalizada.</p>
                </div>
              ) : (
                <>
                  {/* Division Engine */}
                  <div className="mb-8">
                    <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">Como o cliente vai pagar?</label>
                    <div className="grid grid-cols-4 gap-2">
                      <button 
                        onClick={() => setSplitType('integral')}
                        className={`py-3 px-1 rounded-xl font-bold text-xs transition-all border ${splitType === 'integral' ? 'bg-gray-900 text-white border-gray-900 shadow-md' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                      >
                        Integral
                      </button>
                      <button 
                        onClick={() => setSplitType('equal')}
                        className={`py-3 px-1 rounded-xl font-bold text-xs transition-all border ${splitType === 'equal' ? 'bg-gray-900 text-white border-gray-900 shadow-md' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                      >
                        Igual
                      </button>
                      <button 
                        onClick={() => setSplitType('items')}
                        className={`py-3 px-1 rounded-xl font-bold text-xs transition-all border ${splitType === 'items' ? 'bg-gray-900 text-white border-gray-900 shadow-md' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                      >
                        Por Item
                      </button>
                      <button 
                        onClick={() => setSplitType('custom')}
                        className={`py-3 px-1 rounded-xl font-bold text-xs transition-all border ${splitType === 'custom' ? 'bg-gray-900 text-white border-gray-900 shadow-md' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                      >
                        Avulso
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
                              className="w-5 h-5 text-sabor-primary rounded focus:ring-sabor-primary"
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

                  {/* Custom / Partial Payment */}
                  {splitType === 'custom' && (
                    <div className="mt-4 p-5 bg-amber-50 border border-amber-100 rounded-2xl space-y-4 mb-8">
                      <div>
                        <label className="block text-xs font-bold text-amber-800 uppercase tracking-wider mb-2">Quantia a Receber (R$)</label>
                        <input 
                          type="number"
                          step="0.01"
                          value={customAmount}
                          onChange={(e) => setCustomAmount(e.target.value)}
                          className="w-full px-4 py-3 bg-white border border-amber-200 rounded-xl focus:ring-sabor-primary focus:border-sabor-primary text-base font-extrabold text-gray-900"
                          placeholder="Ex: 50.00"
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <button 
                          onClick={() => {
                            const amt = parseFloat(customAmount);
                            if (isNaN(amt) || amt <= 0) return toast.error('Insira uma quantia válida.');
                            handlePay(amt, 'PIX');
                            setCustomAmount('');
                          }}
                          className="py-3 bg-sabor-light text-sabor-dark hover:bg-sabor-primary rounded-xl font-bold text-xs border border-sabor-primary/30 transition-colors"
                        >
                          PIX
                        </button>
                        <button 
                          onClick={() => {
                            const amt = parseFloat(customAmount);
                            if (isNaN(amt) || amt <= 0) return toast.error('Insira uma quantia válida.');
                            handlePay(amt, 'Cartão');
                            setCustomAmount('');
                          }}
                          className="py-3 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 rounded-xl font-bold text-xs transition-colors"
                        >
                          Cartão
                        </button>
                        <button 
                          onClick={() => {
                            const amt = parseFloat(customAmount);
                            if (isNaN(amt) || amt <= 0) return toast.error('Insira uma quantia válida.');
                            handlePay(amt, 'Dinheiro');
                            setCustomAmount('');
                          }}
                          className="py-3 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-xl font-bold text-xs transition-colors"
                        >
                          Dinheiro
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Parcelas (Simulation) */}
                  {splitType !== 'custom' && simulation && simulation.installments && (
                    <div className="space-y-3 mb-8">
                      <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Parcelas a Cobrar</h4>
                      {simulation.installments.map((amount: number, index: number) => (
                        <div key={index} className="flex justify-between items-center p-4 bg-blue-50/50 border border-blue-100 rounded-2xl group hover:bg-blue-50 transition-colors">
                          <div className="flex items-center gap-3">
                            <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">{index + 1}</span>
                            <span className="font-black text-gray-900 text-lg">R$ {amount.toFixed(2)}</span>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => handlePay(amount, 'PIX')} className="px-3 py-1.5 text-xs font-bold text-sabor-dark bg-sabor-light hover:bg-sabor-primary rounded-lg transition-colors">PIX</button>
                            <button onClick={() => handlePay(amount, 'Cartão')} className="px-3 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-100 hover:bg-indigo-200 rounded-lg transition-colors">Cartão</button>
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

      {/* Drawer/Modal de Gaveta */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsDrawerOpen(false)}></div>
          <div className="relative w-full max-w-md h-full bg-white shadow-2xl ml-auto flex flex-col animate-slide-left">
            <div className="p-6 bg-gray-900 text-white flex justify-between items-center">
              <h2 className="text-xl font-bold">Gaveta de Dinheiro</h2>
              <button onClick={() => setIsDrawerOpen(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>
            
            <div className="p-6 border-b border-gray-100 flex gap-4">
              <div className="flex-1">
                <p className="text-xs text-gray-500 uppercase font-bold">Saldo em Dinheiro</p>
                <p className="text-2xl font-black text-emerald-600">R$ {cashSummary.balance.toFixed(2)}</p>
              </div>
              <div className="flex flex-col gap-2">
                <button onClick={() => setMovementModal('Suprimento')} className="text-xs font-bold bg-blue-100 text-blue-700 py-1.5 px-3 rounded-lg hover:bg-blue-200">+ Suprimento</button>
                <button onClick={() => setMovementModal('Sangria')} className="text-xs font-bold bg-red-100 text-red-700 py-1.5 px-3 rounded-lg hover:bg-red-200">- Sangria</button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-gray-50 custom-scrollbar">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Movimentações de Hoje</h3>
              <div className="space-y-3">
                {movements.map((mov) => (
                  <div key={mov.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                          mov.type === 'Sale' || mov.type === 'Suprimento' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                        }`}>
                          {mov.type}
                        </span>
                        <p className="text-sm font-bold text-gray-800 mt-1">{mov.description}</p>
                        <p className="text-xs text-gray-400">{new Date(mov.created_at).toLocaleTimeString()}</p>
                      </div>
                      <div className="text-right">
                        <p className={`font-black ${mov.type === 'Sale' || mov.type === 'Suprimento' ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {mov.type === 'Sale' || mov.type === 'Suprimento' ? '+' : '-'} R$ {Number(mov.amount).toFixed(2)}
                        </p>
                        {mov.type === 'Sale' && (
                          <button onClick={() => handleRefund(mov.order_id)} className="text-xs text-red-500 hover:underline mt-1">Estornar</button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {movements.length === 0 && (
                  <p className="text-center text-gray-400 mt-10 text-sm">Nenhuma movimentação hoje.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Movement Modal (Sangria/Suprimento) */}
      {movementModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <h2 className="text-xl font-bold mb-4">{movementModal}</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Valor (R$)</label>
                <input 
                  type="number" 
                  className="w-full border-gray-300 rounded-xl focus:ring-sabor-primary focus:border-sabor-primary"
                  value={movementAmount}
                  onChange={(e) => setMovementAmount(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição / Motivo</label>
                <input 
                  type="text" 
                  className="w-full border-gray-300 rounded-xl focus:ring-sabor-primary focus:border-sabor-primary"
                  value={movementDesc}
                  onChange={(e) => setMovementDesc(e.target.value)}
                  placeholder="Ex: Troco inicial"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button 
                onClick={() => setMovementModal(null)}
                className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleMovement}
                className={`flex-1 py-2 text-white rounded-xl font-bold transition-colors ${movementModal === 'Sangria' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Fechamento / Resumo de Caixa */}
      {isReportOpen && reportData && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl relative animate-fade-in max-h-[90vh] overflow-y-auto">
            <button onClick={() => setIsReportOpen(false)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-800 font-bold text-lg">✕</button>
            
            <header className="mb-6 border-b pb-4">
              <span className="text-xs font-bold text-sabor-primary bg-sabor-light border border-sabor-primary/30 px-3 py-1 rounded-full uppercase">Relatório de Fechamento</span>
              <h2 className="text-2xl font-black text-gray-900 mt-2">Fechamento Financeiro</h2>
              <p className="text-gray-500 text-sm font-medium">Data do Turno: {new Date(reportData.date + 'T12:00:00').toLocaleDateString('pt-BR')}</p>
            </header>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <span className="text-xs font-bold text-gray-400 uppercase">Faturamento Bruto</span>
                <p className="text-xl font-black text-emerald-600 mt-1">R$ {reportData.sales.toFixed(2)}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <span className="text-xs font-bold text-gray-400 uppercase">Dinheiro em Caixa</span>
                <p className="text-xl font-black text-gray-900 mt-1">R$ {reportData.drawer_cash_balance.toFixed(2)}</p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-wider">Detalhamento por Meio (Vendas)</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center bg-gray-50 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700">
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                      <line x1="12" y1="18" x2="12.01" y2="18" />
                    </svg>
                    <span>PIX</span>
                  </span>
                  <span className="font-extrabold">R$ {reportData.methods.pix.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center bg-gray-50 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700">
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="5" width="20" height="14" rx="2" />
                      <line x1="2" y1="10" x2="22" y2="10" />
                    </svg>
                    <span>Cartões</span>
                  </span>
                  <span className="font-extrabold">R$ {reportData.methods.card.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center bg-gray-50 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700">
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="6" width="20" height="12" rx="2" />
                      <circle cx="12" cy="12" r="2" />
                      <path d="M6 12h.01M18 12h.01" />
                    </svg>
                    <span>Dinheiro</span>
                  </span>
                  <span className="font-extrabold">R$ {reportData.methods.cash.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4 border-t pt-4">
              <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-wider">Ajustes Operacionais</h3>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-blue-50 border border-blue-100 p-3 rounded-xl text-center">
                  <span className="text-[10px] font-bold text-blue-500 uppercase">Suprimentos</span>
                  <p className="font-black text-blue-700 text-sm mt-1">+ R$ {reportData.suprimentos.toFixed(2)}</p>
                </div>
                <div className="bg-red-50 border border-red-100 p-3 rounded-xl text-center">
                  <span className="text-[10px] font-bold text-red-500 uppercase">Sangrias</span>
                  <p className="font-black text-red-700 text-sm mt-1">- R$ {reportData.sangrias.toFixed(2)}</p>
                </div>
                <div className="bg-amber-50 border border-amber-100 p-3 rounded-xl text-center">
                  <span className="text-[10px] font-bold text-amber-600 uppercase">Estornos</span>
                  <p className="font-black text-amber-700 text-sm mt-1">- R$ {reportData.refunds.toFixed(2)}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-8 border-t pt-4">
              <button 
                onClick={() => {
                  window.print();
                }}
                className="flex-1 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-colors flex items-center justify-center gap-1.5"
              >
                <svg className="w-4 h-4 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 6 2 18 2 18 9" />
                  <path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" />
                  <rect x="6" y="14" width="12" height="8" />
                </svg>
                <span>Imprimir</span>
              </button>
              <button 
                onClick={() => setIsReportOpen(false)}
                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors"
              >
                Fechar Painel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

