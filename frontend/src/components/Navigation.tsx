import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useContext, useState, useEffect, useRef } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { LogOut, ChevronDown, LayoutDashboard, FileText, ShoppingBag, ChefHat } from 'lucide-react';

function Navigation() {
  const { user, isAuthenticated, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const searchParam = searchParams.get('search') || '';
  const [searchQuery, setSearchQuery] = useState(searchParam);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sincroniza o valor da caixa de busca caso o parâmetro de URL seja alterado externamente
  useEffect(() => {
    setSearchQuery(searchParam);
  }, [searchParam]);

  // Fecha o dropdown ao clicar fora dele
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
    navigate('/');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/cardapio?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/cardapio');
    }
  };

  const getInitials = (name: string) => {
    if (!name) return 'SE';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return parts[0].substring(0, 2).toUpperCase();
  };

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case 'administrator': return { text: 'Administrador', class: 'bg-amber-100 text-amber-800 border-amber-200' };
      case 'waiter': return { text: 'Garçom', class: 'bg-blue-100 text-blue-800 border-blue-200' };
      case 'cashier': return { text: 'Operador de Caixa', class: 'bg-indigo-100 text-indigo-800 border-indigo-200' };
      case 'kitchen': return { text: 'Cozinheiro', class: 'bg-orange-100 text-orange-800 border-orange-200' };
      case 'delivery': return { text: 'Entregador', class: 'bg-purple-100 text-purple-800 border-purple-200' };
      default: return { text: 'Cliente', class: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
    }
  };

  const userInitials = user?.name ? getInitials(user.name) : '';
  const roleBadge = getRoleLabel(user?.role);
  const firstName = user?.name ? user.name.split(' ')[0] : '';

  return (
    <header className="bg-white/75 backdrop-blur-xl sticky top-0 z-[100] shadow-[0_4px_30px_rgba(0,0,0,0.02)] border-b border-gray-100/50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 py-3 md:py-4 flex flex-col md:flex-row justify-between items-center gap-4">
        
        {/* Lado Esquerdo: Logo do restaurante e barra de pesquisa integrada */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto justify-between md:justify-start">
          <Link to="/" className="flex items-center shrink-0 hover:opacity-90 transition-opacity">
            <img src="/logo-horizontal.png" alt="SaborExpress" className="h-10 sm:h-12 md:h-14 object-contain" />
          </Link>

          {/* Mecanismo Robusto de Busca do Cardápio */}
          <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-64 md:w-80 group">
            <input 
              type="text" 
              placeholder="Buscar pratos, combos ou bebidas..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-full py-2 px-5 pl-11 text-sm font-semibold text-gray-700 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-sabor-primary focus:ring-4 focus:ring-sabor-primary/10 transition-all duration-300 shadow-inner"
            />
            <button type="submit" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-sabor-dark transition-colors duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.602 10.602Z" />
              </svg>
            </button>
          </form>
        </div>

        {/* Lado Direito: Navegação Responsiva com Bordas Animadas */}
        <nav className="flex flex-wrap items-center gap-4 lg:gap-6 max-w-full pb-2 md:pb-0 w-full md:w-auto justify-center md:justify-end">
          <Link to="/cardapio" className="text-gray-600 font-extrabold text-sm md:text-base hover:text-sabor-dark transition-colors shrink-0 py-1 border-b-2 border-transparent hover:border-sabor-primary">
            Cardápio
          </Link>
          
          {isAuthenticated && (user?.role === 'administrator' || user?.role === 'waiter' || user?.role === 'cashier') && (
            <Link to="/mesas" className="text-gray-600 font-extrabold text-sm md:text-base hover:text-sabor-dark transition-colors shrink-0 py-1 border-b-2 border-transparent hover:border-sabor-primary">
              Mesas
            </Link>
          )}

          {isAuthenticated && (user?.role === 'administrator' || user?.role === 'kitchen') && (
            <Link to="/cozinha" className="text-gray-600 font-extrabold text-sm md:text-base hover:text-sabor-dark transition-colors shrink-0 py-1 border-b-2 border-transparent hover:border-sabor-primary">
              Cozinha
            </Link>
          )}

          {isAuthenticated && (user?.role === 'administrator' || user?.role === 'cashier') && (
            <Link to="/caixa" className="text-gray-600 font-extrabold text-sm md:text-base hover:text-sabor-dark transition-colors shrink-0 py-1 border-b-2 border-transparent hover:border-sabor-primary">
              Caixa
            </Link>
          )}

          {isAuthenticated && (user?.role === 'administrator' || user?.role === 'delivery') && (
            <Link to="/entregas" className="text-gray-600 font-extrabold text-sm md:text-base hover:text-sabor-dark transition-colors shrink-0 py-1 border-b-2 border-transparent hover:border-sabor-primary">
              Entregas
            </Link>
          )}

          {isAuthenticated && user?.role === 'administrator' && (
            <Link to="/dashboard" className="text-amber-800 font-black text-xs md:text-sm hover:bg-amber-200 transition-colors bg-amber-100 px-3.5 py-2 rounded-xl shrink-0">
              Painel
            </Link>
          )}

          {isAuthenticated && user?.role === 'client' && (
            <>
              <Link to="/minhas-reservas" className="text-gray-600 font-extrabold text-sm md:text-base hover:text-sabor-dark transition-colors shrink-0 py-1 border-b-2 border-transparent hover:border-sabor-primary">
                Minhas Reservas
              </Link>
              <Link to="/meus-pedidos" className="text-gray-600 font-extrabold text-sm md:text-base hover:text-sabor-dark transition-colors shrink-0 py-1 border-b-2 border-transparent hover:border-sabor-primary">
                Meus Pedidos
              </Link>
            </>
          )}

          {isAuthenticated ? (
            <div className="relative shrink-0" ref={dropdownRef}>
              <button 
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-gray-100/60 transition-colors duration-200 outline-none text-left"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sabor-primary to-emerald-600 text-sabor-dark flex items-center justify-center font-black text-sm border-2 border-white shadow-sm shrink-0">
                  {userInitials}
                </div>
                <div className="hidden sm:block">
                  <p className="text-xs font-bold text-gray-400 leading-none">Olá,</p>
                  <p className="text-sm font-black text-gray-800 flex items-center gap-0.5 leading-tight">
                    {firstName}
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600" />
                  </p>
                </div>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2.5 w-64 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-gray-100 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center gap-3 pb-3.5 border-b border-gray-100">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sabor-primary to-emerald-600 text-sabor-dark flex items-center justify-center font-black text-lg border-2 border-white shadow-md">
                      {userInitials}
                    </div>
                    <div className="overflow-hidden">
                      <p className="font-black text-gray-900 truncate text-sm">{user?.name}</p>
                      <p className="text-[10px] text-gray-400 font-bold truncate mb-1">{user?.email}</p>
                      <span className={`inline-block text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${roleBadge.class}`}>
                        {roleBadge.text}
                      </span>
                    </div>
                  </div>

                  <div className="py-2.5 space-y-1">
                    {user?.role === 'administrator' && (
                      <Link 
                        to="/dashboard" 
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-gray-600 hover:text-sabor-dark hover:bg-gray-50 rounded-xl transition-all"
                      >
                        <LayoutDashboard className="w-4 h-4 text-amber-500" />
                        Painel Administrativo
                      </Link>
                    )}
                    {user?.role === 'client' && (
                      <>
                        <Link 
                          to="/meus-pedidos" 
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-gray-600 hover:text-sabor-dark hover:bg-gray-50 rounded-xl transition-all"
                        >
                          <ShoppingBag className="w-4 h-4 text-emerald-600" />
                          Meus Pedidos
                        </Link>
                        <Link 
                          to="/minhas-reservas" 
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-gray-600 hover:text-sabor-dark hover:bg-gray-50 rounded-xl transition-all"
                        >
                          <FileText className="w-4 h-4 text-sky-600" />
                          Minhas Reservas
                        </Link>
                      </>
                    )}
                    {user?.role === 'waiter' && (
                      <Link 
                        to="/mesas" 
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-gray-600 hover:text-sabor-dark hover:bg-gray-50 rounded-xl transition-all"
                      >
                        <ChefHat className="w-4 h-4 text-indigo-500" />
                        Mapa de Mesas
                      </Link>
                    )}
                  </div>

                  <div className="border-t border-gray-100 pt-2 mt-1">
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-black text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                    >
                      <LogOut className="w-4 h-4" />
                      Sair da Conta
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="px-5 py-2.5 bg-sabor-primary text-sabor-dark font-black text-xs md:text-sm rounded-xl hover:bg-sabor-primary/95 hover:scale-[1.02] shadow-[0_4px_12px_rgba(74,222,128,0.2)] hover:shadow-[0_6px_18px_rgba(74,222,128,0.3)] transition-all shrink-0">
              Login / Cadastro
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Navigation;
