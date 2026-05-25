import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
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
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider, AuthContext } from './contexts/AuthContext';
import { Toaster } from 'sonner';

function Navigation() {
  const { user, isAuthenticated, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-white sticky top-0 z-[100] shadow-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-4 md:py-5 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex justify-between items-center w-full sm:w-auto">
          <Link to="/" className="flex items-center shrink-0">
            <img src="/logo-horizontal.png" alt="SaborExpress" className="h-12 sm:h-14 md:h-16 object-contain" />
          </Link>
        </div>
        <nav className="flex items-center gap-5 md:gap-8 overflow-x-auto max-w-full pb-2 sm:pb-0 scrollbar-none w-full sm:w-auto justify-start sm:justify-end">
          <Link to="/cardapio" className="text-gray-700 font-bold text-sm md:text-base hover:text-sabor-primary transition-colors shrink-0">Cardápio</Link>
          
          {isAuthenticated && (user?.role === 'administrator' || user?.role === 'waiter' || user?.role === 'cashier') && (
            <Link to="/mesas" className="text-gray-700 font-bold text-sm md:text-base hover:text-sabor-primary transition-colors shrink-0">Mesas</Link>
          )}

          {isAuthenticated && (user?.role === 'administrator' || user?.role === 'kitchen') && (
            <Link to="/cozinha" className="text-gray-700 font-bold text-sm md:text-base hover:text-sabor-primary transition-colors shrink-0">Cozinha</Link>
          )}

          {isAuthenticated && (user?.role === 'administrator' || user?.role === 'cashier') && (
            <Link to="/caixa" className="text-gray-700 font-bold text-sm md:text-base hover:text-sabor-primary transition-colors shrink-0">Caixa</Link>
          )}

          {isAuthenticated && (user?.role === 'administrator' || user?.role === 'kitchen' || user?.role === 'delivery') && (
            <Link to="/entregas" className="text-gray-700 font-bold text-sm md:text-base hover:text-sabor-primary transition-colors shrink-0">Entregas</Link>
          )}

          {isAuthenticated && user?.role === 'administrator' && (
            <Link to="/dashboard" className="text-amber-700 font-extrabold text-xs md:text-sm hover:text-amber-800 transition-colors bg-amber-100 px-3 py-1.5 rounded-lg shrink-0">Painel</Link>
          )}

          {isAuthenticated && user?.role === 'client' && (
            <Link to="/minhas-reservas" className="text-gray-700 font-bold text-sm md:text-base hover:text-sabor-primary transition-colors shrink-0">Minhas Reservas</Link>
          )}

          {isAuthenticated ? (
            <div className="flex items-center gap-4 ml-2 pl-2 md:ml-4 md:pl-4 border-l border-gray-200 shrink-0">
              <span className="text-sm md:text-base text-gray-600 font-bold truncate max-w-[150px]">{user?.name}</span>
              <button onClick={handleLogout} className="text-sm md:text-base font-bold text-rose-500 hover:text-rose-600 bg-rose-50 px-3 py-1.5 rounded-lg transition-colors">Sair</button>
            </div>
          ) : (
            <Link to="/login" className="px-6 py-2.5 bg-sabor-primary text-sabor-dark font-extrabold text-sm md:text-base rounded-xl hover:bg-sabor-primary/90 shadow-md hover:shadow-lg transition-all shrink-0">
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

              {/* Protected Routes */}
              <Route element={<ProtectedRoute allowedRoles={['client']} />}>
                <Route path="/minhas-reservas" element={<ClientReservations />} />
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

