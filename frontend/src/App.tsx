import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
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
import Navigation from './components/Navigation';
import SplashScreen from './components/SplashScreen';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { queryClient } from './lib/queryClient';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';

function App() {
  const [splashDone, setSplashDone] = useState(false);

  const handleSplashDone = () => setSplashDone(true);

  if (!splashDone) {
    return <SplashScreen onDone={handleSplashDone} />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <Router>
            <div className="min-h-screen flex flex-col animate-fade-in">
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

                  {/* Protected Routes */}
                  <Route element={<ProtectedRoute />}>
                    <Route path="/acompanhar-pedido/:id" element={<OrderTracking />} />
                  </Route>

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
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

