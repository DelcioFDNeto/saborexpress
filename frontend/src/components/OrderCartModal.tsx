import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';

interface Category {
  id: number;
  name: string;
}

interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  category_id: number;
  is_available: boolean;
  image_url: string | null;
}

interface OrderCartModalProps {
  orderId: number;
  isOpen: boolean;
  onClose: () => void;
  onItemAdded: () => void;
}

export default function OrderCartModal({ orderId, isOpen, onClose, onItemAdded }: OrderCartModalProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [addingProductId, setAddingProductId] = useState<number | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const fetchMenu = async () => {
      setLoading(true);
      try {        const [catRes, prodRes] = await Promise.all([
          api.get(`/categories`),
          api.get(`/products`)
        ]);
        setCategories(catRes.data.data || catRes.data || []);
        setProducts(prodRes.data.data || prodRes.data || []);
      } catch (err) {
        console.error('Failed to fetch menu', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, [isOpen]);

  if (!isOpen) return null;

  const [expandedProductId, setExpandedProductId] = useState<number | null>(null);
  const [currentNote, setCurrentNote] = useState('');
  const [currentQuantity, setCurrentQuantity] = useState(1);

  const handleExpand = (productId: number) => {
    if (expandedProductId === productId) {
      setExpandedProductId(null);
    } else {
      setExpandedProductId(productId);
      setCurrentNote('');
      setCurrentQuantity(1);
    }
  };

  const handleAddItem = async (productId: number) => {
    setAddingProductId(productId);
    try {      await api.post(`/orders/${orderId}/items`, {
        product_id: productId,
        quantity: currentQuantity,
        notes: currentNote
      });
      onItemAdded();
      setExpandedProductId(null);
    } catch (err: any) {
      console.error('Failed to add item', err);
      alert(err.response?.data?.message || 'Erro ao adicionar produto');
    } finally {
      setAddingProductId(null);
    }
  };

  const filteredProducts = activeCategory
    ? products.filter(p => p.category_id === activeCategory)
    : products;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl w-full max-w-4xl h-[80vh] flex flex-col shadow-2xl overflow-hidden relative">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white z-10">
          <h2 className="text-2xl font-bold">Adicionar Produtos</h2>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50 flex flex-col">
          {loading ? (
            <div className="flex-1 flex justify-center items-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sabor-primary"></div>
            </div>
          ) : (
            <>
              {/* Category Filter */}
              <div className="flex gap-3 mb-6 overflow-x-auto pb-2 shrink-0">
                <button 
                  onClick={() => setActiveCategory(null)}
                  className={`whitespace-nowrap px-4 py-2 rounded-xl font-medium transition-colors ${activeCategory === null ? 'bg-sabor-primary text-white shadow-md shadow-sabor-primary' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
                >
                  Todos
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`whitespace-nowrap px-4 py-2 rounded-xl font-medium transition-colors ${activeCategory === cat.id ? 'bg-sabor-primary text-white shadow-md shadow-sabor-primary' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>

              {/* Product List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {filteredProducts.map(product => (
                  <div key={product.id} className={`bg-white rounded-2xl border ${expandedProductId === product.id ? 'border-sabor-primary shadow-md ring-2 ring-sabor-light' : 'border-gray-100 shadow-sm'} p-4 flex flex-col justify-between transition-all`}>
                    <div>
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-bold text-gray-800 leading-tight">{product.name}</h3>
                      </div>
                      <p className="text-gray-500 text-xs mb-3 line-clamp-2">{product.description || 'Sem descrição'}</p>
                    </div>
                    
                    {expandedProductId === product.id ? (
                      <div className="mt-2 border-t border-gray-100 pt-3 space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium text-gray-700">Qtd:</label>
                          <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-1 border border-gray-200">
                            <button onClick={() => setCurrentQuantity(q => Math.max(1, q - 1))} className="w-8 h-8 flex items-center justify-center text-gray-600 bg-white rounded-md shadow-sm">-</button>
                            <span className="font-bold w-4 text-center">{currentQuantity}</span>
                            <button onClick={() => setCurrentQuantity(q => q + 1)} className="w-8 h-8 flex items-center justify-center text-gray-600 bg-white rounded-md shadow-sm">+</button>
                          </div>
                        </div>
                        <div>
                          <input 
                            type="text" 
                            placeholder="Ex: Sem cebola, bem passado..." 
                            value={currentNote}
                            onChange={e => setCurrentNote(e.target.value)}
                            className="w-full text-sm border-gray-300 rounded-lg px-3 py-2 bg-gray-50 focus:bg-white focus:ring-1 focus:ring-sabor-primary outline-none transition-all"
                          />
                        </div>
                        <div className="flex gap-2 mt-2">
                          <button 
                            onClick={() => setExpandedProductId(null)}
                            className="flex-1 py-2 rounded-xl text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                          >
                            Cancelar
                          </button>
                          <button 
                            disabled={addingProductId === product.id}
                            onClick={() => handleAddItem(product.id)}
                            className="flex-1 py-2 rounded-xl text-sm font-bold text-white bg-sabor-primary hover:bg-sabor-dark transition-colors flex items-center justify-center gap-2"
                          >
                            {addingProductId === product.id ? (
                               <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                            ) : 'Confirmar'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center mt-auto">
                        <span className="font-black text-sabor-dark">R$ {Number(product.price).toFixed(2)}</span>
                        <button 
                          disabled={!product.is_available}
                          onClick={() => handleExpand(product.id)}
                          className="px-4 py-2 bg-sabor-light text-sabor-dark rounded-xl text-sm font-bold hover:bg-sabor-light disabled:opacity-50 transition-colors flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                          Add
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {filteredProducts.length === 0 && (
                <div className="text-center text-gray-400 mt-10">Nenhum produto encontrado nesta categoria.</div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

