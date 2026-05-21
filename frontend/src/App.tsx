import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import Menu from './pages/Menu';
import Tables from './pages/Tables';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider, AuthContext } from './contexts/AuthContext';

function Navigation() {
  const { user, isAuthenticated, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-black text-emerald-600 tracking-tight">SaborExpress</h1>
        <nav className="flex items-center gap-6">
          <Link to="/" className="text-gray-600 font-medium hover:text-emerald-600 transition-colors">Cardápio</Link>
          
          {isAuthenticated && (user?.role === 'administrator' || user?.role === 'waiter' || user?.role === 'cashier') && (
            <Link to="/mesas" className="text-gray-600 font-medium hover:text-emerald-600 transition-colors">Mesas</Link>
          )}

          {isAuthenticated && (user?.role === 'administrator' || user?.role === 'kitchen') && (
            <a href="#" className="text-gray-600 font-medium hover:text-emerald-600 transition-colors">Cozinha</a>
          )}

          {isAuthenticated ? (
            <div className="flex items-center gap-4 ml-4 pl-4 border-l">
              <span className="text-sm text-gray-500 font-medium">{user?.name}</span>
              <button onClick={handleLogout} className="text-sm font-medium text-rose-500 hover:text-rose-600">Sair</button>
            </div>
          ) : (
            <Link to="/login" className="ml-4 px-4 py-2 bg-emerald-50 text-emerald-600 font-medium rounded-lg hover:bg-emerald-100 transition-colors">Acesso Restrito</Link>
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

          {/* Main Content */}
          <main className="flex-1">
            <Routes>
              {/* Public route */}
              <Route path="/" element={<Menu />} />
              <Route path="/login" element={<Login />} />

              {/* Protected Routes */}
              <Route element={<ProtectedRoute allowedRoles={['administrator', 'waiter', 'cashier']} />}>
                <Route path="/mesas" element={<Tables />} />
              </Route>
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App
