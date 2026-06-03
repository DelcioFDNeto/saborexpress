import { useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { api } from '../lib/api';
import { Mail, Lock, LogIn, User, Briefcase } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginType, setLoginType] = useState<'client' | 'corporate'>('client');
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
        setError('E-mail ou senha incorretos.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-6 sm:px-6 lg:px-8 bg-gray-50 relative animate-fade-in">
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Link to="/" className="flex justify-center bg-white p-3 rounded-3xl shadow-sm w-32 mx-auto border border-gray-100 hover:scale-105 transition-transform">
          <img src="/logo.png" alt="SaborExpress" className="h-16 w-auto object-contain" />
        </Link>
        <p className="mt-4 text-center text-xl text-gray-800 font-extrabold tracking-tight">
          Acesse sua conta
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="bg-white py-6 px-6 sm:px-10 border border-gray-100 shadow-xl rounded-3xl">
          
          {/* Tabs for Client / Corporate */}
          <div className="flex p-1 mb-6 bg-gray-100 rounded-xl">
            <button
              onClick={() => setLoginType('client')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold rounded-lg transition-all ${
                loginType === 'client' 
                  ? 'bg-white text-sabor-dark shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <User className="w-4 h-4" />
              Sou Cliente
            </button>
            <button
              onClick={() => setLoginType('corporate')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold rounded-lg transition-all ${
                loginType === 'corporate' 
                  ? 'bg-white text-sabor-dark shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              Equipe
            </button>
          </div>

          <form className="space-y-5" onSubmit={handleLogin}>
            <div>
              <label className="block text-xs font-black text-gray-600 uppercase tracking-widest mb-1.5">
                {loginType === 'corporate' ? 'E-mail Corporativo' : 'E-mail'}
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-4.5 w-4.5 text-gray-400" />
                </div>
                <input
                  type="email"
                  required
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full pl-11 pr-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl shadow-inner placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/60 transition-all text-sm font-semibold text-gray-700"
                  placeholder={loginType === 'corporate' ? 'ex: admin@saborexpress.com' : 'seu@email.com'}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-gray-600 uppercase tracking-widest mb-1.5">Senha</label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-4.5 w-4.5 text-gray-400" />
                </div>
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full pl-11 pr-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl shadow-inner placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/60 transition-all text-sm font-semibold text-gray-700"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="text-rose-600 text-xs font-extrabold text-center bg-rose-50 border border-rose-100 p-2.5 rounded-xl animate-shake">
                ⚠️ {error}
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-extrabold text-sabor-dark bg-sabor-primary hover:bg-sabor-primary/90 focus:outline-none focus:ring-4 focus:ring-sabor-primary/20 hover:scale-[1.01] transition-all disabled:opacity-50 cursor-pointer"
              >
                <LogIn className="w-4 h-4 shrink-0" />
                {loading ? 'Validando...' : 'Entrar'}
              </button>
            </div>

            {loginType === 'client' && (
              <div className="text-center mt-2 border-t border-gray-100 pt-4">
                <Link to="/register" className="text-xs font-black text-emerald-600 hover:text-emerald-700 hover:underline">
                  Ainda não tem conta? Crie uma agora
                </Link>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

