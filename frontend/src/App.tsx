import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useContext, useState, useEffect } from 'react';
import Index from './pages/Index';
import Menu from './pages/Menu';
import Tables from './pages/Tables';
import Login from './pages/Login';
import Register from './pages/Register';
import OrderDetails from './pages/OrderDetails';
import Kitchen from './pages/Kitchen';
import Cashier from './pages/Cashier';
import DeliveryClient from './pages/DeliveryClient';
import DeliveryPanel from './pages/DeliveryPanel';
import Dashboard from './pages/Dashboard';
import ClientReservations from './pages/ClientReservations';
import ClientOrders from './pages/ClientOrders';
import OrderTracking from './pages/OrderTracking';
import DigitalMenu from './pages/DigitalMenu';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider, AuthContext } from './contexts/AuthContext';
import { Toaster } from 'sonner';

function Navigation() {
  const { user, isAuthenticated, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const searchParam = searchParams.get('search') || '';
  const [searchQuery, setSearchQuery] = useState(searchParam);

  // Sincroniza o valor da caixa de busca caso o parâmetro de URL seja alterado externamente
  useEffect(() => {
    setSearchQuery(searchParam);
  }, [searchParam]);

  const handleLogout = () => {
    logout();
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

  return (
    <header className="bg-white/95 backdrop-blur-md sticky top-0 z-[100] shadow-sm border-b border-gray-100 transition-all duration-300">
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
        <nav className="flex items-center gap-4 lg:gap-6 overflow-x-auto max-w-full pb-2 md:pb-0 scrollbar-none w-full md:w-auto justify-center md:justify-end">
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

          {isAuthenticated && (user?.role === 'administrator' || user?.role === 'kitchen' || user?.role === 'delivery') && (
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
            <div className="flex items-center gap-3.5 ml-2 pl-3.5 border-l border-gray-200 shrink-0">
              <span className="text-sm md:text-base text-gray-700 font-black truncate max-w-[120px]">{user?.name}</span>
              <button onClick={handleLogout} className="text-xs md:text-sm font-black text-rose-600 hover:bg-rose-100 bg-rose-50 px-3 py-2 rounded-xl transition-all">
                Sair
              </button>
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

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <Navigation />
          <Toaster richColors position="top-right" />

          {/* Main Content */}
          <main className="flex-1">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/cardapio" element={<Menu />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/delivery" element={<DeliveryClient />} />
              <Route path="/cardapio-digital" element={<DigitalMenu />} />
              <Route path="/acompanhar-pedido/:id" element={<OrderTracking />} />

              {/* Protected Routes */}
              <Route element={<ProtectedRoute allowedRoles={['client']} />}>
                <Route path="/minhas-reservas" element={<ClientReservations />} />
                <Route path="/meus-pedidos" element={<ClientOrders />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={['administrator']} />}>
                <Route path="/dashboard" element={<Dashboard />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={['administrator', 'kitchen']} />}>
                <Route path="/cozinha" element={<Kitchen />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={['administrator', 'kitchen', 'delivery']} />}>
                <Route path="/entregas" element={<DeliveryPanel />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={['administrator', 'waiter', 'cashier']} />}>
                <Route path="/mesas" element={<Tables />} />
                <Route path="/mesas/:tableId" element={<OrderDetails />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={['administrator', 'cashier']} />}>
                <Route path="/caixa" element={<Cashier />} />
              </Route>
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

