import { useState, useContext } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import { api } from '../lib/api';
import { Mail, Lock, User, UserPlus } from 'lucide-react';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (password !== passwordConfirmation) {
        setError('A confirmacao de senha nao confere.');
        return;
      }

      const res = await api.post('/register', {
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });
      
      const token = res.data.access_token;
      const userData = res.data.user;
      
      login(token, userData);
      navigate('/cardapio');
      
    } catch (err: unknown) {
      if (isAxiosError<{ errors?: Record<string, string[]> }>(err) && err.response?.data.errors) {
        const firstError = Object.values(err.response.data.errors)[0];
        setError(firstError[0]);
      } else {
        setError('Erro ao realizar o cadastro. Tente novamente.');
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
          Crie sua Conta no SaborExpress
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="bg-white py-10 px-6 sm:px-10 border border-emerald-500/20 shadow-[0_0_35px_-5px_rgba(74,222,128,0.15)] rounded-[2.5rem]">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-rose-50 border border-rose-100 text-rose-600 text-xs font-extrabold rounded-xl p-3 text-center">
                ⚠️ {error}
              </div>
            )}
            
            <div>
              <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">
                Nome Completo
              </label>
              <div className="mt-1 relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <User className="h-4.5 w-4.5 text-gray-400" />
                </div>
                <input
                  type="text"
                  required
                  className="appearance-none block w-full pl-11 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl shadow-inner placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/60 shadow-[0_0_10px_rgba(16,185,129,0.02)] transition-all duration-300 sm:text-sm font-semibold text-gray-700"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: João Silva"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">
                E-mail de Acesso
              </label>
              <div className="mt-1 relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-4.5 w-4.5 text-gray-400" />
                </div>
                <input
                  type="email"
                  required
                  autoComplete="username"
                  className="appearance-none block w-full pl-11 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl shadow-inner placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/60 shadow-[0_0_10px_rgba(16,185,129,0.02)] transition-all duration-300 sm:text-sm font-semibold text-gray-700"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nome@saborexpress.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">
                Senha Segura
              </label>
              <div className="mt-1 relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-4.5 w-4.5 text-gray-400" />
                </div>
                <input
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className="appearance-none block w-full pl-11 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl shadow-inner placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/60 shadow-[0_0_10px_rgba(16,185,129,0.02)] transition-all duration-300 sm:text-sm font-semibold text-gray-700"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">
                Confirmar Senha
              </label>
              <div className="mt-1 relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-4.5 w-4.5 text-gray-400" />
                </div>
                <input
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className="appearance-none block w-full pl-11 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl shadow-inner placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/60 shadow-[0_0_10px_rgba(16,185,129,0.02)] transition-all duration-300 sm:text-sm font-semibold text-gray-700"
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  placeholder="Repita sua senha"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-extrabold text-sabor-dark bg-sabor-primary hover:bg-sabor-primary/90 focus:outline-none focus:ring-4 focus:ring-sabor-primary/20 hover:scale-[1.01] hover:shadow-lg transition-all duration-300 disabled:opacity-50 cursor-pointer"
              >
                <UserPlus className="w-4 h-4 shrink-0" />
                {loading ? 'Cadastrando Usuário...' : 'Criar minha Conta'}
              </button>
            </div>
            
            <div className="text-center mt-4 border-t border-gray-100 pt-6">
              <Link to="/login" className="text-xs font-black text-emerald-600 hover:text-emerald-700 hover:underline">
                Já tem uma conta? Faça Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

