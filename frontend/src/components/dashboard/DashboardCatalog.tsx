import React, { useState } from 'react';
import { api } from '../../lib/api';
import { toast } from 'sonner';

interface ApiError {
  response?: { data?: { message?: string } };
}

interface Category {
  id: number;
  name: string;
  description: string;
  products_count?: number;
}

interface Product {
  id: number;
  category_id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  is_available: boolean;
  stock_quantity: number | null;
  category?: {
    id: number;
    name: string;
  };
}

interface DashboardCatalogProps {
  categories: Category[];
  products: Product[];
  menuLoading: boolean;
  onRefresh: () => Promise<void>;
}

const MenuSkeleton = () => (
  <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
    <div className="lg:col-span-1 space-y-3">
      <div className="h-4 bg-slate-200 rounded w-1/2 mb-4 animate-pulse"></div>
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className="h-11 bg-slate-200 rounded-xl w-full animate-pulse"></div>
      ))}
    </div>
    <div className="lg:col-span-3">
      <div className="bg-white rounded-3xl border border-gray-100 p-6 space-y-4">
        <div className="flex justify-between items-center mb-6">
          <div className="h-6 bg-slate-200 rounded w-1/4 animate-pulse"></div>
          <div className="h-6 bg-slate-200 rounded w-16 animate-pulse"></div>
        </div>
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="flex items-center gap-4 py-3 border-b border-slate-100 animate-pulse">
            <div className="w-12 h-12 bg-slate-200 rounded-2xl"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-slate-200 rounded w-1/3"></div>
              <div className="h-3 bg-slate-200 rounded w-1/2"></div>
            </div>
            <div className="h-4 bg-slate-200 rounded w-12"></div>
            <div className="h-6 bg-slate-200 rounded-full w-20"></div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default function DashboardCatalog({
  categories,
  products: initialProducts,
  menuLoading,
  onRefresh
}: DashboardCatalogProps) {
  // Local reactive list for instant availability toggles
  const [products, setProducts] = useState<Product[]>(initialProducts);

  // Sync products when initialProducts changes
  React.useEffect(() => {
    setProducts(initialProducts);
  }, [initialProducts]);

  const [selectedCategoryId, setSelectedCategoryId] = useState<number | 'all'>('all');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Category Form State
  const [catName, setCatName] = useState('');
  const [catDescription, setCatDescription] = useState('');
  const [showCatForm, setShowCatForm] = useState(false);

  // Product Form State
  const [prodName, setProdName] = useState('');
  const [prodDescription, setProdDescription] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodImageUrl, setProdImageUrl] = useState('');
  const [prodCategoryId, setProdCategoryId] = useState<string>('');
  const [prodStockQuantity, setProdStockQuantity] = useState('');
  const [prodIsAvailable, setProdIsAvailable] = useState(true);
  const [showProdForm, setShowProdForm] = useState(false);

  const formatCurrency = (value: number) => {
    return `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // ==========================================
  // Category Action Handlers
  // ==========================================
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await api.put(`/categories/${editingCategory.id}`, { name: catName, description: catDescription });
        toast.success('Categoria atualizada com sucesso!');
      } else {
        await api.post('/categories', { name: catName, description: catDescription });
        toast.success('Categoria adicionada com sucesso!');
      }
      setCatName('');
      setCatDescription('');
      setEditingCategory(null);
      setShowCatForm(false);
      await onRefresh();
    } catch (err: unknown) {
      const e = err as ApiError;
      toast.error(e.response?.data?.message || 'Falha ao salvar categoria.');
    }
  };

  const handleEditCategory = (cat: Category) => {
    setEditingCategory(cat);
    setCatName(cat.name);
    setCatDescription(cat.description);
    setShowCatForm(true);
  };

  const handleDeleteCategory = async (id: number) => {
    if (!confirm('Deseja realmente excluir esta categoria? Os produtos associados podem ficar órfãos.')) return;
    try {
      await api.delete(`/categories/${id}`);
      toast.success('Categoria excluída com sucesso!');
      await onRefresh();
    } catch (err: unknown) {
      const e = err as ApiError;
      toast.error(e.response?.data?.message || 'Erro ao excluir categoria.');
    }
  };

  // ==========================================
  // Product Action Handlers
  // ==========================================
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: prodName,
      description: prodDescription,
      price: parseFloat(prodPrice),
      image_url: prodImageUrl,
      category_id: parseInt(prodCategoryId),
      stock_quantity: prodStockQuantity ? parseInt(prodStockQuantity) : null,
      is_available: prodIsAvailable
    };

    try {
      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, payload);
        toast.success('Produto atualizado com sucesso!');
      } else {
        await api.post('/products', payload);
        toast.success('Produto criado com sucesso!');
      }
      resetProductForm();
      await onRefresh();
    } catch (err: unknown) {
      const e = err as ApiError;
      toast.error(e.response?.data?.message || 'Falha ao salvar produto.');
    }
  };

  const resetProductForm = () => {
    setProdName('');
    setProdDescription('');
    setProdPrice('');
    setProdImageUrl('');
    setProdCategoryId('');
    setProdStockQuantity('');
    setProdIsAvailable(true);
    setEditingProduct(null);
    setShowProdForm(false);
  };

  const handleEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setProdName(prod.name);
    setProdDescription(prod.description);
    setProdPrice(prod.price.toString());
    setProdImageUrl(prod.image_url || '');
    setProdCategoryId(prod.category_id.toString());
    setProdStockQuantity(prod.stock_quantity ? prod.stock_quantity.toString() : '');
    setProdIsAvailable(prod.is_available);
    setShowProdForm(true);
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm('Tem certeza que deseja remover este produto do cardápio?')) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Produto removido do cardápio com sucesso!');
      await onRefresh();
    } catch (err: unknown) {
      const e = err as ApiError;
      toast.error(e.response?.data?.message || 'Erro ao deletar produto.');
    }
  };

  const handleToggleAvailability = async (prod: Product) => {
    try {
      const nextAvailability = !prod.is_available;
      await api.patch(`/products/${prod.id}/availability`, { is_available: nextAvailability });
      toast.success(`${prod.name} agora está ${nextAvailability ? 'Disponível' : 'Indisponível'}`);
      
      // Update local state without full reload
      setProducts(prev => prev.map(p => p.id === prod.id ? { ...p, is_available: nextAvailability } : p));
      await onRefresh();
    } catch {
      toast.error('Erro ao atualizar disponibilidade.');
    }
  };

  const filteredProducts = selectedCategoryId === 'all' 
    ? products 
    : products.filter(p => p.category_id === selectedCategoryId);

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Gestão de Cardápio</h1>
          <p className="text-gray-500 font-medium mt-1">Gerencie categorias, preços, imagens, disponibilidade e estoques.</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button 
            onClick={() => {
              setEditingCategory(null);
              setCatName('');
              setCatDescription('');
              setShowCatForm(true);
            }}
            className="flex-1 sm:flex-none px-4 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-xs hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5 shadow"
          >
            ➕ Nova Categoria
          </button>
          <button 
            onClick={() => {
              resetProductForm();
              if (categories.length > 0) {
                setProdCategoryId(categories[0].id.toString());
              }
              setShowProdForm(true);
            }}
            className="flex-1 sm:flex-none px-4 py-2.5 bg-sabor-primary text-sabor-dark rounded-xl font-extrabold text-xs hover:bg-sabor-primary/95 transition-all flex items-center justify-center gap-1.5 shadow"
          >
            ➕ Novo Produto
          </button>
        </div>
      </div>

      {/* Modal de Categoria */}
      {showCatForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-1000 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-fade-in">
            <h3 className="text-xl font-black text-gray-900 mb-4">{editingCategory ? '✏️ Editar Categoria' : '➕ Nova Categoria'}</h3>
            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Nome</label>
                <input type="text" required value={catName} onChange={e => setCatName(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-sabor-primary focus:border-sabor-primary sm:text-sm" placeholder="Ex: Bebidas" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Descrição</label>
                <textarea required value={catDescription} onChange={e => setCatDescription(e.target.value)} rows={3} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-sabor-primary focus:border-sabor-primary sm:text-sm" placeholder="Descrição da categoria" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCatForm(false)} className="flex-1 py-2.5 border border-gray-300 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors">Cancelar</button>
                <button type="submit" className="flex-1 py-2.5 bg-sabor-primary text-sabor-dark rounded-xl font-black text-sm hover:bg-sabor-primary/95 transition-all">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Produto */}
      {showProdForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-1000 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-8 max-w-xl w-full shadow-2xl my-8 animate-fade-in">
            <h3 className="text-xl font-black text-gray-900 mb-6">{editingProduct ? '✏️ Editar Produto' : '➕ Novo Produto'}</h3>
            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Nome</label>
                  <input type="text" required value={prodName} onChange={e => setProdName(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-sabor-primary focus:border-sabor-primary sm:text-sm" placeholder="Nome do produto" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Categoria</label>
                  <select required value={prodCategoryId} onChange={e => setProdCategoryId(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-sabor-primary focus:border-sabor-primary sm:text-sm bg-white">
                    <option value="" disabled>Selecione...</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Preço (R$)</label>
                  <input type="number" step="0.01" required value={prodPrice} onChange={e => setProdPrice(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-sabor-primary focus:border-sabor-primary sm:text-sm" placeholder="Ex: 29.90" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Qtd Estoque (Opcional)</label>
                  <input type="number" value={prodStockQuantity} onChange={e => setProdStockQuantity(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-sabor-primary focus:border-sabor-primary sm:text-sm" placeholder="Sem controle se vazio" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">URL da Imagem</label>
                <input type="url" required value={prodImageUrl} onChange={e => setProdImageUrl(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-sabor-primary focus:border-sabor-primary sm:text-sm" placeholder="https://images.unsplash.com/..." />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Descrição</label>
                <textarea required value={prodDescription} onChange={e => setProdDescription(e.target.value)} rows={3} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-sabor-primary focus:border-sabor-primary sm:text-sm" placeholder="Descrição do produto..." />
              </div>

              <div className="flex items-center gap-3 py-2">
                <input type="checkbox" id="avail" checked={prodIsAvailable} onChange={e => setProdIsAvailable(e.target.checked)} className="w-5 h-5 text-sabor-primary focus:ring-sabor-primary border-gray-300 rounded" />
                <label htmlFor="avail" className="text-sm font-bold text-gray-700 select-none cursor-pointer">Disponível imediatamente para venda</label>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={resetProductForm} className="flex-1 py-3 border border-gray-300 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors">Cancelar</button>
                <button type="submit" className="flex-1 py-3 bg-sabor-primary text-sabor-dark rounded-xl font-black text-sm hover:bg-sabor-primary/95 transition-all">Salvar Produto</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {menuLoading && categories.length === 0 ? (
        <MenuSkeleton />
      ) : (
        /* Layout Categorias + Produtos */
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          
          {/* Categorias */}
          <div className="lg:col-span-1">
            <div className="bg-white/90 backdrop-blur-md p-6 rounded-3xl border border-gray-100 shadow-sm space-y-3">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-4 px-1">Categorias</h3>
              
              <button 
                onClick={() => setSelectedCategoryId('all')}
                className={`w-full text-left px-5 py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider flex justify-between items-center transition-all ${
                  selectedCategoryId === 'all' 
                    ? 'bg-linear-to-r from-slate-900 to-slate-800 text-white font-extrabold shadow-md' 
                    : 'bg-slate-50/50 text-slate-600 border border-slate-100 hover:bg-slate-100/70'
                }`}
              >
                <span>Todos os Produtos</span>
                <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black ${selectedCategoryId === 'all' ? 'bg-slate-700 text-white' : 'bg-slate-200 text-slate-700'}`}>{products.length}</span>
              </button>

              {categories.map(c => (
                <div key={c.id} className="relative group/cat flex items-center justify-between p-0.5 rounded-2xl bg-slate-50/20 border border-slate-100/50 hover:bg-slate-50 transition-all duration-200 shadow-sm">
                  <button 
                    onClick={() => setSelectedCategoryId(c.id)}
                    className={`flex-1 text-left px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all truncate ${
                      selectedCategoryId === c.id 
                        ? 'bg-linear-to-r from-slate-900 to-slate-800 text-white font-extrabold shadow-md' 
                        : 'text-slate-600 hover:bg-slate-100/50'
                    }`}
                  >
                    {c.name}
                  </button>
                  
                  {/* Categoria Actions (Visible on hover inside item) */}
                  <div className="flex items-center gap-0.5 opacity-0 group-hover/cat:opacity-100 transition-opacity duration-200 pr-2">
                    <button onClick={() => handleEditCategory(c)} title="Editar Categoria" className="p-1.5 hover:bg-slate-200/80 rounded-lg text-slate-500 hover:text-slate-800 transition-colors">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                    </button>
                    <button onClick={() => handleDeleteCategory(c.id)} title="Excluir Categoria" className="p-1.5 hover:bg-rose-50 rounded-lg text-rose-500 hover:text-rose-700 transition-colors">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Lista de Produtos */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 md:p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="font-extrabold text-gray-900 text-lg tracking-tight">
                  {selectedCategoryId === 'all' ? 'Todos os Itens' : categories.find(c => c.id === selectedCategoryId)?.name || 'Produtos'}
                </h3>
                <span className="bg-sabor-light text-sabor-dark px-3 py-1 rounded-lg text-xs font-black">{filteredProducts.length} itens</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/20 border-b border-gray-100">
                      <th className="px-6 py-4.5 font-bold text-slate-400 text-xs uppercase tracking-wider">Item</th>
                      <th className="px-6 py-4.5 font-bold text-slate-400 text-xs uppercase tracking-wider whitespace-nowrap">Categoria</th>
                      <th className="px-6 py-4.5 font-bold text-slate-400 text-xs uppercase tracking-wider whitespace-nowrap">Preço</th>
                      <th className="px-6 py-4.5 font-bold text-slate-400 text-xs uppercase tracking-wider whitespace-nowrap">Estoque</th>
                      <th className="px-6 py-4.5 font-bold text-slate-400 text-xs uppercase tracking-wider whitespace-nowrap">Status</th>
                      <th className="px-6 py-4.5 font-bold text-slate-400 text-xs uppercase tracking-wider text-right whitespace-nowrap">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-medium">Nenhum produto cadastrado nesta categoria.</td>
                      </tr>
                    ) : (
                      filteredProducts.map(p => (
                        <tr key={p.id} className="hover:bg-slate-50/40 transition-colors group">
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-4">
                              <div className="relative overflow-hidden w-12 h-12 md:w-14 md:h-14 rounded-2xl border border-slate-100 shadow-sm shrink-0">
                                <img src={p.image_url} alt={p.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                              </div>
                              <div className="min-w-0">
                                <div className="font-extrabold text-slate-800 text-sm tracking-tight">{p.name}</div>
                                <div className="text-slate-500 text-xs truncate max-w-xs md:max-w-md lg:max-w-lg mt-0.5">{p.description}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5 text-xs font-black text-slate-500 uppercase whitespace-nowrap">
                            {p.category?.name || categories.find(c => c.id === p.category_id)?.name || 'Sem Categoria'}
                          </td>
                          <td className="px-6 py-5 font-extrabold text-slate-800 text-sm whitespace-nowrap">
                            {formatCurrency(p.price)}
                          </td>
                          <td className="px-6 py-5 text-sm font-semibold whitespace-nowrap">
                            {p.stock_quantity !== null ? (
                              <span className={`px-2.5 py-1 rounded-lg font-bold text-xs ${p.stock_quantity <= 5 ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-slate-100 text-slate-700'}`}>
                                {p.stock_quantity} un
                              </span>
                            ) : (
                              <span className="text-slate-400 font-medium text-xs">Ilimitado</span>
                            )}
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap">
                            <button 
                              onClick={() => handleToggleAvailability(p)}
                              className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-colors ${
                                p.is_available 
                                  ? 'bg-sabor-light text-sabor-dark hover:bg-emerald-100/90' 
                                  : 'bg-rose-50 text-rose-600 hover:bg-rose-100/90 border border-rose-100'
                              }`}
                            >
                              {p.is_available ? 'Disponível' : 'Indisponível'}
                            </button>
                          </td>
                          <td className="px-6 py-5 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => handleEditProduct(p)} title="Editar Produto" className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 hover:text-slate-800 transition-colors">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                              </button>
                              <button onClick={() => handleDeleteProduct(p.id)} title="Excluir Produto" className="p-2 hover:bg-rose-50 rounded-xl text-rose-500 hover:text-rose-700 transition-colors">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
