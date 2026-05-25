import { useState, useContext } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import { api } from '../lib/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/login', {
        email,
        password,
      });

      login(res.data.access_token, res.data.user);

      const role = res.data.user.role;
      if (role === 'administrator') navigate('/dashboard');
      else if (role === 'waiter') navigate('/mesas');
      else if (role === 'kitchen') navigate('/cozinha');
      else if (role === 'cashier') navigate('/caixa');
      else if (role === 'delivery') navigate('/entregas');
      else navigate('/cardapio');
    } catch (err: unknown) {
      if (isAxiosError<{ errors?: { email?: string[] } }>(err) && err.response?.data.errors) {
        setError(err.response.data.errors.email?.[0] || 'Falha ao fazer login.');
      } else {
        setError('Erro de conexão. Verifique se a API está online.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-black text-emerald-600 tracking-tight">
          SaborExpress
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Acesso exclusivo para colaboradores
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-emerald-100 sm:rounded-3xl sm:px-10 border border-gray-100">
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <div className="mt-1">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
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
                  className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                  placeholder="********"
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
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
              >
                {loading ? 'Entrando...' : 'Entrar no Sistema'}
              </button>
            </div>

            <div className="text-center mt-4 border-t border-gray-100 pt-6">
              <Link to="/register" className="text-sm font-medium text-emerald-600 hover:text-emerald-500">
                Ainda não tem conta? Cadastre-se
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
