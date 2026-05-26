import { useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { api } from '../lib/api';
import { Mail, Lock, LogIn } from 'lucide-react';

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

    try {
      const res = await api.post(`/login`, {
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

    } catch (err: unknown) {
      const e = err as { response?: { data?: { errors?: { email?: string[] }; message?: string } } };
      if (e.response && e.response.data && e.response.data.errors) {
        setError(e.response.data.errors.email?.[0] || 'Falha ao fazer login.');
      } else {
        setError('Erro de conexão. Verifique se a API está online.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-[url('https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center relative animate-fade-in">
      {/* Back blur overlay + tech geometric grid overlay */}
      <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md z-0"></div>
      <div className="absolute inset-0 bg-geometric-grid opacity-35 z-0"></div>
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="mt-6 flex justify-center bg-white p-4 rounded-3xl shadow-xl w-40 mx-auto border border-gray-100">
          <img src="/logo.png" alt="SaborExpress" className="h-24 w-auto object-contain" />
        </div>
        <p className="mt-6 text-center text-lg text-white font-extrabold tracking-tight">
          Acesse a Plataforma SaborExpress
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="bg-white py-10 px-6 sm:px-10 border border-emerald-500/20 shadow-[0_0_35px_-5px_rgba(74,222,128,0.15)] rounded-[2.5rem]">
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">E-mail Corporativo</label>
              <div className="mt-1 relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-4.5 w-4.5 text-gray-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full pl-11 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl shadow-inner placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/60 shadow-[0_0_10px_rgba(16,185,129,0.02)] transition-all duration-300 sm:text-sm font-semibold text-gray-700"
                  placeholder="ex: admin@saborexpress.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Senha de Acesso</label>
              <div className="mt-1 relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-4.5 w-4.5 text-gray-400" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full pl-11 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl shadow-inner placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/60 shadow-[0_0_10px_rgba(16,185,129,0.02)] transition-all duration-300 sm:text-sm font-semibold text-gray-700"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="text-rose-600 text-xs font-extrabold text-center bg-rose-50 border border-rose-100 p-3 rounded-xl animate-shake">
                ⚠️ {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-extrabold text-sabor-dark bg-sabor-primary hover:bg-sabor-primary/90 focus:outline-none focus:ring-4 focus:ring-sabor-primary/20 hover:scale-[1.01] hover:shadow-lg transition-all duration-300 disabled:opacity-50 cursor-pointer"
              >
                <LogIn className="w-4 h-4 shrink-0" />
                {loading ? 'Validando Credenciais...' : 'Entrar no Sistema'}
              </button>
            </div>

            <div className="text-center mt-4 border-t border-gray-100 pt-6">
              <Link to="/register" className="text-xs font-black text-emerald-600 hover:text-emerald-700 hover:underline">
                Ainda não tem conta? Crie uma agora
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

