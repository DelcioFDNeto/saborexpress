import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { isAxiosError } from 'axios';
import OrderCartModal from '../components/OrderCartModal';
import { api } from '../lib/api';

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
  status?: string;
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
  service_fee: string;
  discount: string;
  items: OrderItem[];
  table: Table;
  user: User;
}

function extractData<T>(payload: T | { data: T }): T {
  return payload && typeof payload === 'object' && 'data' in payload
    ? (payload as { data: T }).data
    : (payload as T);
}

export default function OrderDetails() {
  const { tableId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isTableActionModalOpen, setIsTableActionModalOpen] = useState(false);
  const [tableActionType, setTableActionType] = useState<'transfer' | 'merge'>('transfer');
  const [availableTables, setAvailableTables] = useState<Table[]>([]);

  const fetchOrderDetails = async () => {
    setLoading(true);

    try {
      const tableRes = await api.get(`/tables/${tableId}`);
      const activeOrder = extractData<Order | null>(tableRes.data.active_order);

      if (!activeOrder) {
        alert('Esta mesa não possui uma comanda ativa.');
        navigate('/mesas');
        return;
      }

      const orderRes = await api.get(`/orders/${activeOrder.id}`);
      setOrder(extractData<Order>(orderRes.data));
    } catch (err) {
      console.error(err);
      alert('Erro ao carregar comanda.');
      navigate('/mesas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
    const interval = setInterval(fetchOrderDetails, 15000);

    return () => clearInterval(interval);
  }, [tableId]);

  const handleCloseRequest = async () => {
    if (!order || !window.confirm('Tem certeza que deseja solicitar o fechamento da mesa? A conta será travada para novos itens.')) {
      return;
    }

    try {
      await api.post(`/orders/${order.id}/request-closing`);
      alert('Fechamento solicitado. A mesa está aguardando o caixa.');
      await fetchOrderDetails();
    } catch (err: unknown) {
      const message = isAxiosError<{ message?: string }>(err) ? err.response?.data.message : null;
      alert(message || 'Erro ao pedir fechamento.');
    }
  };

  const openTableActionModal = async (type: 'transfer' | 'merge') => {
    setTableActionType(type);

    try {
      const res = await api.get('/tables');
      const tables = extractData<Table[]>(res.data);
      const filtered = tables.filter((table) => {
        if (table.id.toString() === tableId) return false;
        if (type === 'transfer') return table.status === 'Livre';

        return table.status === 'Ocupada' || table.status === 'Fechamento';
      });

      setAvailableTables(filtered);
      setIsTableActionModalOpen(true);
    } catch (err) {
      console.error(err);
      alert('Erro ao buscar mesas disponíveis.');
    }
  };

  const handleTableActionSubmit = async (targetTableId: number) => {
    const endpoint = tableActionType === 'transfer' ? 'transfer-order' : 'merge-order';

    try {
      await api.post(`/tables/${tableId}/${endpoint}`, {
        target_table_id: targetTableId,
      });

      alert(tableActionType === 'transfer' ? 'Mesa transferida com sucesso.' : 'Mesas agrupadas com sucesso.');
      setIsTableActionModalOpen(false);
      navigate(`/mesas/${targetTableId}`);
    } catch (err: unknown) {
      const message = isAxiosError<{ message?: string }>(err) ? err.response?.data.message : null;
      alert(message || 'Erro ao realizar a operação.');
    }
  };

  if (loading && !order) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!order) return null;

  const hasReadyItems = order.items.some((item) => item.status === 'Pronto');
  const canAddItems = order.status === 'Aberta';
  const total = Number(order.total_amount) + Number(order.service_fee || 0) - Number(order.discount || 0);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      <div className="flex-1 p-6 md:p-10 flex flex-col max-h-screen overflow-y-auto">
        <button
          onClick={() => navigate('/mesas')}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors mb-4 font-medium w-fit"
        >
          Voltar para Mesas
        </button>

        {hasReadyItems && (
          <div className="bg-rose-500 text-white p-4 rounded-2xl shadow-lg mb-6 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg">Pratos prontos</h3>
              <p className="text-rose-100 text-sm">Existem itens aguardando retirada no balcão da cozinha.</p>
            </div>
            <button
              onClick={fetchOrderDetails}
              className="px-4 py-2 bg-white text-rose-600 font-bold rounded-xl text-sm shadow hover:bg-rose-50 transition-colors"
            >
              Atualizar
            </button>
          </div>
        )}

        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mb-6 relative overflow-hidden">
          {order.status === 'Fechamento' && <div className="absolute top-0 left-0 w-full h-2 bg-amber-500"></div>}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-black text-gray-900 mb-1">Mesa {order.table.number}</h1>
              <p className="text-gray-500 font-medium">Comanda #{order.id.toString().padStart(4, '0')}</p>
            </div>
            <div className={`px-4 py-2 rounded-xl font-bold uppercase tracking-wider text-sm ${order.status === 'Aberta' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
              {order.status === 'Fechamento' ? 'Em Fechamento' : order.status}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-gray-50 p-4 rounded-2xl">
              <span className="block text-gray-500 mb-1">Cliente</span>
              <span className="font-bold text-gray-900">{order.customer_name || 'Não informado'}</span>
            </div>
            <div className="bg-gray-50 p-4 rounded-2xl">
              <span className="block text-gray-500 mb-1">Atendente</span>
              <span className="font-bold text-gray-900">{order.user?.name || 'Não informado'}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Itens Consumidos</h2>
          <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-lg text-sm font-bold">{order.items.length} itens</span>
        </div>

        <div className="bg-white rounded-3xl p-2 shadow-sm border border-gray-100 flex-1 overflow-hidden flex flex-col">
          {order.items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <p className="text-gray-500 font-medium">Nenhum item adicionado ainda.</p>
              {canAddItems && (
                <button onClick={() => setIsCartOpen(true)} className="mt-4 text-emerald-600 font-bold hover:underline">
                  Adicionar primeiro item
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-y-auto p-2 space-y-2 custom-scrollbar">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between items-center p-4 hover:bg-gray-50 rounded-2xl transition-colors">
                  <div>
                    <h4 className="font-bold text-gray-900">
                      <span className="text-emerald-600 mr-2">{item.quantity}x</span>
                      {item.product.name}
                    </h4>
                    <div className="flex gap-2 mt-1">
                      {item.status === 'Pronto' && <span className="text-xs bg-rose-100 text-rose-700 font-bold px-2 py-0.5 rounded-md">Pronto</span>}
                      {item.status === 'Em Preparo' && <span className="text-xs bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded-md">Preparando</span>}
                      {item.notes && <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded">Nota: {item.notes}</span>}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">R$ {(Number(item.unit_price) * item.quantity).toFixed(2)}</p>
                    <p className="text-xs text-gray-400">R$ {Number(item.unit_price).toFixed(2)} / un</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="w-full md:w-96 bg-white border-l border-gray-100 p-8 flex flex-col shadow-[-10px_0_20px_-10px_rgba(0,0,0,0.05)] z-10 relative">
        <h3 className="text-lg font-bold mb-6">Resumo da Conta</h3>

        <div className="space-y-4 flex-1">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span className="font-medium">R$ {Number(order.total_amount).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Taxa de Serviço</span>
            <span className="font-medium text-emerald-600">+ R$ {Number(order.service_fee || 0).toFixed(2)}</span>
          </div>
          <div className="border-t border-gray-100 border-dashed pt-4 mt-4 flex justify-between items-end">
            <span className="font-bold text-gray-900">Total</span>
            <span className="text-3xl font-black text-emerald-600">R$ {total.toFixed(2)}</span>
          </div>
        </div>

        <div className="mt-8 space-y-3">
          <button
            disabled={!canAddItems}
            onClick={() => setIsCartOpen(true)}
            className="w-full py-4 rounded-2xl bg-gray-900 text-white font-bold hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Lançar Produtos
          </button>

          <button
            onClick={handleCloseRequest}
            disabled={!canAddItems || order.items.length === 0}
            className="w-full py-4 rounded-2xl bg-amber-100 text-amber-800 font-bold hover:bg-amber-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Pedir Fechamento
          </button>

          {canAddItems && (
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100">
              <button
                onClick={() => openTableActionModal('transfer')}
                className="py-3 rounded-xl border-2 border-indigo-100 text-indigo-600 font-bold hover:bg-indigo-50 transition-colors text-sm"
              >
                Mover
              </button>
              <button
                onClick={() => openTableActionModal('merge')}
                className="py-3 rounded-xl border-2 border-emerald-100 text-emerald-600 font-bold hover:bg-emerald-50 transition-colors text-sm"
              >
                Juntar
              </button>
            </div>
          )}
        </div>
      </div>

      {isTableActionModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
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
                {availableTables.map((table) => (
                  <button
                    key={table.id}
                    onClick={() => handleTableActionSubmit(table.id)}
                    className="py-4 rounded-2xl border-2 font-bold text-lg transition-colors border-emerald-100 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                  >
                    Mesa {table.number}
                  </button>
                ))}
                {availableTables.length === 0 && (
                  <div className="col-span-3 text-center text-gray-400 py-4">Nenhuma mesa disponível.</div>
                )}
              </div>
            </div>
            <div className="p-6 bg-gray-50 flex justify-end">
              <button onClick={() => setIsTableActionModalOpen(false)} className="px-6 py-3 font-bold text-gray-500 hover:text-gray-700">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

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
