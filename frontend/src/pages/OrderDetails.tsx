import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { toast } from 'sonner';
import OrderCartModal from '../components/OrderCartModal';

interface Product {
  id: number;
  name: string;
  price: string;
}

interface OrderItem {
  id: number;
  quantity: number;
  unit_price: string;
  notes: string | null;
  status: string;
  product: Product;
}

interface Table {
  id: number;
  number: string;
  capacity: number;
  status: string;
}

interface User {
  id: number;
  name: string;
}

interface Order {
  id: number;
  status: string;
  customer_name: string | null;
  total_amount: string;
  created_at: string;
  items: OrderItem[];
  table: Table;
  user: User;
}

export default function OrderDetails() {
  const { tableId } = useParams();
  const navigate = useNavigate();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Item Edit State
  const [editingItem, setEditingItem] = useState<OrderItem | null>(null);
  const [editQuantity, setEditQuantity] = useState<number>(1);
  const [editNotes, setEditNotes] = useState<string>('');
  const [itemActionLoading, setItemActionLoading] = useState(false);

  const fetchOrderDetails = async () => {
    setLoading(true);
    try {      
      // First, get the table to find the active order
      const tableRes = await api.get(`/tables/${tableId}`);
      const activeOrderData = tableRes.data.active_order;

      if (!activeOrderData) {
        toast.error('Esta mesa não possui uma comanda ativa.');
        navigate('/mesas');
        return;
      }

      // Then, fetch the full order with relations
      const orderRes = await api.get(`/orders/${activeOrderData.id}`);
      setOrder(orderRes.data);
    } catch (err) {
      console.error(err);
      toast.error('Erro ao carregar comanda.');
      navigate('/mesas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
    
    // WebSockets via Laravel Echo
    const channel = window.Echo.channel('orders');
    channel.listen('.OrderUpdated', () => {
      fetchOrderDetails();
    });

    return () => {
      channel.stopListening('.OrderUpdated');
    };
  }, [tableId]);

  if (loading && !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row p-6 md:p-10 gap-6">
        <div className="flex-1 space-y-6">
          <div className="h-40 bg-gray-200 rounded-3xl animate-pulse"></div>
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="h-20 bg-gray-200 rounded-2xl animate-pulse"></div>)}
          </div>
        </div>
        <div className="w-full md:w-96 bg-gray-200 rounded-3xl h-96 animate-pulse hidden md:block"></div>
      </div>
    );
  }

  if (!order) return null;

  const hasReadyItems = order.items.some(item => item.status === 'Pronto');

  const [isTableActionModalOpen, setIsTableActionModalOpen] = useState(false);
  const [tableActionType, setTableActionType] = useState<'transfer' | 'merge'>('transfer');
  const [availableTables, setAvailableTables] = useState<Table[]>([]);

  // Fixed close request call! Points to orders/{order.id}/request-closing
  const handleCloseRequest = async () => {
    if (!window.confirm('Tem certeza que deseja solicitar o fechamento da mesa? A conta será travada para novos itens.')) return;
    try {      
      await api.post(`/orders/${order.id}/request-closing`);
      toast.success('Fechamento solicitado! A mesa está travada aguardando o caixa.');
      fetchOrderDetails();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Erro ao pedir fechamento.');
    }
  };

  const openTableActionModal = async (type: 'transfer' | 'merge') => {
    setTableActionType(type);
    try {      
      const res = await api.get(`/tables`);
      const allTables = res.data.data ? res.data.data : res.data;
      
      let filtered = [];
      if (type === 'transfer') {
        filtered = allTables.filter((t: Table) => t.status === 'Livre' && t.id.toString() !== tableId);
      } else {
        filtered = allTables.filter((t: Table) => (t.status === 'Ocupada' || t.status === 'Fechamento') && t.id.toString() !== tableId);
      }
      setAvailableTables(filtered);
      setIsTableActionModalOpen(true);
    } catch (err) {
      console.error(err);
      toast.error('Erro ao buscar mesas disponíveis.');
    }
  };

  const handleTableActionSubmit = async (targetTableId: number) => {
    try {      
      const endpoint = tableActionType === 'transfer' ? 'transfer-order' : 'merge-order';
      
      const res = await api.post(`/tables/${tableId}/${endpoint}`, {
        target_table_id: targetTableId
      });
      
      toast.success('Mesa movida/agrupada com sucesso!');
      setIsTableActionModalOpen(false);
      navigate(`/mesas/${targetTableId}`);
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Erro ao realizar a operação.');
    }
  };

  // ==========================================
  // Item Level Action Handlers
  // ==========================================
  const handleEditClick = (item: OrderItem) => {
    setEditingItem(item);
    setEditQuantity(item.quantity);
    setEditNotes(item.notes || '');
  };

  const handleSaveItemEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    setItemActionLoading(true);
    try {
      await api.patch(`/order-items/${editingItem.id}`, {
        quantity: editQuantity,
        notes: editNotes || null
      });
      toast.success('Item atualizado com sucesso!');
      setEditingItem(null);
      fetchOrderDetails();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao atualizar item.');
    } finally {
      setItemActionLoading(false);
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    if (!confirm('Deseja realmente remover este item da comanda?')) return;
    try {
      await api.delete(`/order-items/${itemId}`);
      toast.success('Item removido com sucesso.');
      fetchOrderDetails();
    } catch (err: any) {
      toast.error('Erro ao remover item.');
    }
  };

  const handleCancelItem = async (itemId: number) => {
    if (!confirm('Deseja realmente cancelar este item que já está em preparo?')) return;
    try {
      await api.patch(`/order-items/${itemId}/cancel`);
      toast.warning('Item cancelado.');
      fetchOrderDetails();
    } catch (err: any) {
      toast.error('Erro ao cancelar item.');
    }
  };

  const handleDeliverItem = async (itemId: number) => {
    try {
      await api.patch(`/order-items/${itemId}/deliver`);
      toast.success('Item marcado como entregue!');
      fetchOrderDetails();
    } catch (err: any) {
      toast.error('Erro ao registrar entrega.');
    }
  };

  const canAddItems = order.status === 'Aberta';

  const getItemStatusBadge = (status: string) => {
    switch (status) {
      case 'Pendente':
        return <span className="text-[10px] bg-slate-100 text-slate-700 font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">Pendente</span>;
      case 'Em Preparo':
        return <span className="text-[10px] bg-amber-100 text-amber-800 font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider animate-pulse border border-amber-300">Preparando</span>;
      case 'Pronto':
        return <span className="text-[10px] bg-rose-100 text-rose-700 font-black px-2.5 py-1 rounded-full uppercase tracking-wider border border-rose-300 shadow-sm animate-bounce">Pronto!</span>;
      case 'Entregue':
        return <span className="text-[10px] bg-sabor-light text-sabor-dark font-black px-2.5 py-1 rounded-full uppercase tracking-wider">Entregue</span>;
      case 'Cancelado':
        return <span className="text-[10px] bg-red-50 text-red-500 font-bold px-2.5 py-1 rounded-full uppercase tracking-wider line-through">Cancelado</span>;
      default:
        return <span className="text-[10px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded uppercase">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans">
      
      {/* Left side: Order Info & Items List */}
      <div className="flex-1 p-6 md:p-10 flex flex-col">
        <button 
          onClick={() => navigate('/mesas')}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors mb-4 font-bold text-sm w-fit"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Voltar para Mesas
        </button>

        {hasReadyItems && (
          <div className="bg-rose-500 text-white p-4 rounded-3xl shadow-lg mb-6 flex items-center justify-between animate-pulse">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-full">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
              </div>
              <div>
                <h3 className="font-extrabold text-lg">Pratos Prontos!</h3>
                <p className="text-rose-100 text-sm">Existem itens prontos aguardando retirada para servir à mesa.</p>
              </div>
            </div>
            <button 
              onClick={fetchOrderDetails}
              className="px-4 py-2 bg-white text-rose-600 font-extrabold rounded-xl text-sm shadow hover:bg-rose-50 transition-colors"
            >
              Atualizar
            </button>
          </div>
        )}

        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mb-6 relative overflow-hidden">
          {order.status === 'Fechada' && (
            <div className="absolute top-0 left-0 w-full h-2 bg-amber-500"></div>
          )}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-black text-gray-900 mb-1">Mesa {order.table.number}</h1>
              <p className="text-gray-500 font-medium">Comanda #{order.id.toString().padStart(4, '0')}</p>
            </div>
            <div className={`px-4 py-2 rounded-xl font-bold uppercase tracking-wider text-xs ${order.status === 'Aberta' ? 'bg-sabor-light text-sabor-dark border border-sabor-primary/20' : 'bg-amber-100 text-amber-800'}`}>
              {order.status === 'Fechada' ? 'Em Fechamento' : order.status}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-xs font-bold uppercase tracking-wider">
            <div className="bg-gray-50 p-4 rounded-2xl">
              <span className="block text-gray-400 mb-1">Cliente</span>
              <span className="font-extrabold text-gray-900">{order.customer_name || 'Mesa Presencial'}</span>
            </div>
            <div className="bg-gray-50 p-4 rounded-2xl">
              <span className="block text-gray-400 mb-1">Atendente</span>
              <span className="font-extrabold text-gray-900">{order.user.name}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Itens Lançados</h2>
          <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-lg text-sm font-bold">{order.items.length} itens</span>
        </div>

        {/* Item List Panel */}
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 flex-1 overflow-hidden flex flex-col">
          {order.items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-300">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
              </div>
              <p className="text-gray-500 font-bold">Nenhum item adicionado ainda.</p>
              {canAddItems && (
                <button 
                  onClick={() => setIsCartOpen(true)}
                  className="mt-4 text-sabor-primary font-bold hover:underline text-sm"
                >
                  Adicionar primeiro item
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-y-auto p-2 space-y-3 custom-scrollbar">
              {order.items.map((item) => (
                <div key={item.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 hover:bg-gray-50/50 rounded-2xl transition-colors border border-gray-100 bg-white shadow-sm relative group gap-4">
                  <div className="flex gap-4 items-center">
                    <div className="w-10 h-10 rounded-xl bg-sabor-light text-sabor-dark flex items-center justify-center font-black text-sm shrink-0 border border-sabor-primary/20">
                      {item.quantity}x
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className={`font-extrabold text-sm ${item.status === 'Cancelado' ? 'text-gray-400 line-through' : 'text-gray-900'}`}>{item.product.name}</h4>
                        {getItemStatusBadge(item.status)}
                      </div>
                      
                      {item.notes && (
                        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200/50 px-2 py-0.5 rounded-lg inline-block w-fit mt-1.5 font-medium">
                          📝 {item.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                    <div className="text-left sm:text-right">
                      <p className={`font-black text-sm ${item.status === 'Cancelado' ? 'text-gray-400 line-through' : 'text-sabor-dark'}`}>
                        R$ {(Number(item.unit_price) * item.quantity).toFixed(2)}
                      </p>
                      <p className="text-[10px] text-gray-400 font-bold">R$ {Number(item.unit_price).toFixed(2)} / un</p>
                    </div>

                    {/* Operational Actions for Order Items */}
                    {order.status === 'Aberta' && (
                      <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200/50 rounded-xl p-1 shrink-0">
                        
                        {/* Edit Button (Allowed only for Pendente) */}
                        {item.status === 'Pendente' && (
                          <button 
                            onClick={() => handleEditClick(item)}
                            title="Editar quantidade ou notas"
                            className="p-1.5 hover:bg-white hover:text-slate-800 text-slate-500 rounded-lg transition-all"
                          >
                            ✏️
                          </button>
                        )}

                        {/* Deliver Button (Allowed only for Pronto) */}
                        {item.status === 'Pronto' && (
                          <button 
                            onClick={() => handleDeliverItem(item.id)}
                            title="Marcar como entregue na mesa"
                            className="p-1.5 hover:bg-white text-emerald-600 rounded-lg transition-all text-xs font-black bg-emerald-50 px-2"
                          >
                            ✅ Servir
                          </button>
                        )}

                        {/* Cancel Button (Allowed for Em Preparo and Pronto) */}
                        {(item.status === 'Em Preparo' || item.status === 'Pronto') && (
                          <button 
                            onClick={() => handleCancelItem(item.id)}
                            title="Cancelar item"
                            className="p-1.5 hover:bg-white text-rose-600 rounded-lg transition-all"
                          >
                            🚫
                          </button>
                        )}

                        {/* Remove/Delete Button (Allowed only for Pendente) */}
                        {item.status === 'Pendente' && (
                          <button 
                            onClick={() => handleRemoveItem(item.id)}
                            title="Remover da comanda"
                            className="p-1.5 hover:bg-white text-rose-500 rounded-lg transition-all"
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right side: Sidebar Checkout Summary */}
      <div className="w-full md:w-96 bg-white border-l border-gray-100 p-8 flex flex-col shadow-[-10px_0_20px_-10px_rgba(0,0,0,0.05)] z-10 relative">
        <h3 className="text-lg font-bold mb-6">Resumo da Conta</h3>
        
        <div className="space-y-4 flex-1">
          <div className="flex justify-between text-gray-600 text-sm font-medium">
            <span>Subtotal</span>
            <span className="font-bold text-gray-900">R$ {Number(order.total_amount).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-600 text-sm font-medium">
            <span>Taxa de Serviço (10%)</span>
            <span className="font-bold text-sabor-primary">+ R$ {(Number(order.total_amount) * 0.1).toFixed(2)}</span>
          </div>
          <div className="border-t border-gray-100 border-dashed pt-4 mt-4 flex justify-between items-end">
            <span className="font-bold text-gray-900">Total</span>
            <span className="text-3xl font-black text-sabor-primary">
              R$ {(Number(order.total_amount) * 1.1).toFixed(2)}
            </span>
          </div>
        </div>

        <div className="mt-8 space-y-3">
          <button 
            disabled={!canAddItems}
            onClick={() => setIsCartOpen(true)}
            className="w-full py-4 rounded-2xl bg-slate-900 text-white font-extrabold hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-lg disabled:cursor-not-allowed text-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path></svg>
            Lançar Produtos
          </button>
          
          <button 
            onClick={handleCloseRequest}
            disabled={!canAddItems || order.items.length === 0}
            className="w-full py-4 rounded-2xl bg-amber-100 text-amber-800 font-extrabold hover:bg-amber-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            Pedir Fechamento
          </button>

          {canAddItems && (
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100">
              <button 
                onClick={() => openTableActionModal('transfer')}
                className="py-3 rounded-xl border-2 border-indigo-100 text-indigo-600 font-extrabold hover:bg-indigo-50 transition-colors text-xs flex items-center justify-center gap-1"
              >
                Mover
              </button>
              <button 
                onClick={() => openTableActionModal('merge')}
                className="py-3 rounded-xl border-2 border-sabor-light text-sabor-primary font-extrabold hover:bg-sabor-light transition-colors text-xs flex items-center justify-center gap-1"
              >
                Juntar
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Item Quantity/Notes Editing Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in fade-in slide-in-from-bottom-4">
            <h3 className="text-xl font-black text-gray-900 mb-2">✏️ Editar Item</h3>
            <p className="text-sm text-gray-500 mb-6 font-medium">Modifique a quantidade ou observações de <span className="font-bold text-gray-800">{editingItem.product.name}</span></p>
            
            <form onSubmit={handleSaveItemEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Quantidade</label>
                <div className="flex items-center gap-4 bg-gray-100 rounded-xl p-1.5 w-fit">
                  <button type="button" onClick={() => setEditQuantity(q => Math.max(1, q - 1))} className="w-8 h-8 flex items-center justify-center bg-white text-gray-600 rounded-lg shadow-sm font-bold">-</button>
                  <span className="font-extrabold text-sm w-6 text-center">{editQuantity}</span>
                  <button type="button" onClick={() => setEditQuantity(q => q + 1)} className="w-8 h-8 flex items-center justify-center bg-white text-gray-600 rounded-lg shadow-sm font-bold">+</button>
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Observações / Notas</label>
                <textarea 
                  value={editNotes} 
                  onChange={e => setEditNotes(e.target.value)} 
                  rows={3} 
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-sabor-primary focus:border-sabor-primary sm:text-sm text-sm" 
                  placeholder="Ex: Sem cebola, bem passado, etc."
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setEditingItem(null)} className="flex-1 py-2.5 border border-gray-300 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors">Cancelar</button>
                <button type="submit" disabled={itemActionLoading} className="flex-1 py-2.5 bg-sabor-primary text-sabor-dark rounded-xl font-black text-sm hover:bg-sabor-primary/95 transition-all">
                  {itemActionLoading ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table Action Modal */}
      {isTableActionModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in slide-in-from-bottom-4">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">
                {tableActionType === 'transfer' ? 'Transferir para outra mesa' : 'Agrupar com outra mesa'}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {tableActionType === 'transfer' ? 'Selecione uma mesa livre.' : 'Selecione uma mesa ocupada.'}
              </p>
            </div>
            <div className="p-6 max-h-96 overflow-y-auto">
              <div className="grid grid-cols-3 gap-3">
                {availableTables.map(t => (
                  <button
                    key={t.id}
                    onClick={() => handleTableActionSubmit(t.id)}
                    className={`py-4 rounded-2xl border-2 font-bold text-lg transition-colors ${
                      tableActionType === 'transfer' 
                        ? 'border-indigo-100 bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                        : 'border-amber-100 bg-amber-50 text-amber-700 hover:bg-amber-100'
                    }`}
                  >
                    Mesa {t.number}
                  </button>
                ))}
                {availableTables.length === 0 && (
                  <div className="col-span-3 text-center text-gray-400 py-4">Nenhuma mesa disponível.</div>
                )}
              </div>
            </div>
            <div className="p-6 bg-gray-50 flex justify-end">
              <button onClick={() => setIsTableActionModalOpen(false)} className="px-6 py-3 font-bold text-gray-500 hover:text-gray-700">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Cart Modal */}
      {canAddItems && (
        <OrderCartModal 
          orderId={order.id} 
          isOpen={isCartOpen} 
          onClose={() => setIsCartOpen(false)} 
          onItemAdded={fetchOrderDetails} 
        />
      )}
    </div>
  );
}
