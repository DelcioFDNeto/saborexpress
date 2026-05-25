import { useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { api } from '../lib/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {      const res = await api.post(`/login`, {
        email,
        password
      });

      login(res.data.access_token, res.data.user);
      
      // Redirect based on redirect param or fallback to role default
      if (redirect) {
        navigate(redirect);
      } else {
        const role = res.data.user.role;
        if (role === 'administrator') navigate('/dashboard');
        else if (role === 'waiter') navigate('/mesas');
        else if (role === 'kitchen') navigate('/cozinha');
        else if (role === 'cashier') navigate('/caixa');
        else if (role === 'delivery') navigate('/entregas');
        else navigate('/cardapio');
      }

    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.errors) {
        setError(err.response.data.errors.email[0] || 'Falha ao fazer login.');
      } else {
        setError('Erro de conexão. Verifique se a API está online.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-[url('https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center relative">
      <div className="absolute inset-0 bg-sabor-dark/90 backdrop-blur-md"></div>
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="mt-6 flex justify-center bg-white p-4 rounded-3xl shadow-lg w-40 mx-auto">
          <img src="/logo.png" alt="SaborExpress" className="h-24 w-auto object-contain" />
        </div>
        <p className="mt-6 text-center text-lg text-white font-medium">
          Bem-vindo(a) ao SaborExpress
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white py-10 px-4 shadow-2xl sm:rounded-3xl sm:px-10 border border-gray-100">
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <div className="mt-1">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-sabor-primary focus:border-sabor-primary sm:text-sm"
                  placeholder="admin@saborexpress.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Senha</label>
              <div className="mt-1">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-sabor-primary focus:border-sabor-primary sm:text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="text-rose-500 text-sm font-medium text-center bg-rose-50 p-2 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-sabor-primary hover:bg-sabor-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sabor-primary transition-colors"
              >
                {loading ? 'Entrando...' : 'Entrar no Sistema'}
              </button>
            </div>

            <div className="text-center mt-4 border-t border-gray-100 pt-6">
              <Link to="/register" className="text-sm font-medium text-sabor-primary hover:text-sabor-primary">
                Ainda não tem conta? Cadastre-se
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

