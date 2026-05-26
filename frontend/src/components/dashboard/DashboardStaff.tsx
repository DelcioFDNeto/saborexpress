import React, { useState } from 'react';
import { api } from '../../lib/api';
import { toast } from 'sonner';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
}

interface DashboardStaffProps {
  users: User[];
  teamLoading: boolean;
  onRefresh: () => Promise<void>;
}

const TeamSkeleton = () => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
    <div className="lg:col-span-1 bg-white p-6 rounded-3xl border border-gray-100 space-y-4 animate-pulse">
      <div className="h-5 bg-slate-200 rounded w-1/2 mb-6"></div>
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="space-y-2">
          <div className="h-3 bg-slate-200 rounded w-1/3"></div>
          <div className="h-10 bg-slate-200 rounded-xl w-full"></div>
        </div>
      ))}
      <div className="h-12 bg-slate-200 rounded-xl w-full pt-4"></div>
    </div>
    <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 p-6 space-y-4 animate-pulse">
      <div className="flex justify-between items-center mb-6">
        <div className="h-5 bg-slate-200 rounded w-1/4"></div>
        <div className="h-5 bg-slate-200 rounded w-12"></div>
      </div>
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="flex items-center gap-4 py-3 border-b border-slate-100">
          <div className="w-10 h-10 bg-slate-200 rounded-full"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-slate-200 rounded w-1/4"></div>
            <div className="h-3 bg-slate-200 rounded w-1/3"></div>
          </div>
          <div className="h-4 bg-slate-200 rounded w-16"></div>
          <div className="h-6 bg-slate-200 rounded-full w-12"></div>
        </div>
      ))}
    </div>
  </div>
);

export default function DashboardStaff({
  users,
  teamLoading,
  onRefresh
}: DashboardStaffProps) {
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userPasswordChange, setUserPasswordChange] = useState('');
  
  // Registration Form State
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState('waiter');
  const [isCreatingUser, setIsCreatingUser] = useState(false);

  // ==========================================
  // Action Handlers
  // ==========================================
  const handleCreateUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingUser(true);
    try {
      await api.post(`/users`, {
        name: newUserName,
        email: newUserEmail,
        password: newUserPassword,
        role: newUserRole
      });
      toast.success('Novo funcionário criado com sucesso!');
      setNewUserName('');
      setNewUserEmail('');
      setNewUserPassword('');
      await onRefresh();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Falha ao registrar colaborador.');
    } finally {
      setIsCreatingUser(false);
    }
  };

  const handleToggleUserStatus = async (u: User) => {
    try {
      if (u.is_active) {
        await api.patch(`/users/${u.id}/deactivate`);
        toast.warning(`Colaborador ${u.name} inativado!`);
      } else {
        await api.patch(`/users/${u.id}/activate`);
        toast.success(`Colaborador ${u.name} ativado com sucesso!`);
      }
      await onRefresh();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao alterar status.');
    }
  };

  const handleDeleteUser = async (u: User) => {
    if (!confirm(`Deseja excluir permanentemente a conta de ${u.name}?`)) return;
    try {
      await api.delete(`/users/${u.id}`);
      toast.success('Conta excluída com sucesso!');
      await onRefresh();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao excluir conta.');
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      await api.patch(`/users/${editingUser.id}/password`, { password: userPasswordChange });
      toast.success(`Senha de ${editingUser.name} alterada com sucesso!`);
      setUserPasswordChange('');
      setEditingUser(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao alterar senha.');
    }
  };

  const staffMembers = users.filter(u => u.role !== 'client');

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Gestão da Equipe</h1>
        <p className="text-gray-500 font-medium mt-1">Gerencie os acessos, cargos operacionais e status das contas dos colaboradores.</p>
      </div>

      {/* Password Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-fade-in">
            <h3 className="text-xl font-black text-gray-900 mb-2 flex items-center gap-2">
              <svg className="w-5 h-5 stroke-gray-900 fill-none" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
              </svg>
              <span>Alterar Senha</span>
            </h3>
            <p className="text-sm text-gray-500 mb-4">Atualizar senha de <span className="font-bold text-gray-900">{editingUser.name}</span></p>
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Nova Senha</label>
                <input type="password" required minLength={6} value={userPasswordChange} onChange={e => setUserPasswordChange(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-sabor-primary focus:border-sabor-primary sm:text-sm" placeholder="Mínimo 6 caracteres" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setEditingUser(null)} className="flex-1 py-2.5 border border-gray-300 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors">Cancelar</button>
                <button type="submit" className="flex-1 py-2.5 bg-sabor-primary text-sabor-dark rounded-xl font-black text-sm hover:bg-sabor-primary/95 transition-all">Alterar Senha</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {teamLoading && users.length === 0 ? (
        <TeamSkeleton />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Left Column: Form to Register Colaborador */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-black text-slate-800 mb-5 tracking-tight">Adicionar Colaborador</h2>
              <form onSubmit={handleCreateUserSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Nome Completo</label>
                  <input type="text" required value={newUserName} onChange={e => setNewUserName(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-sabor-primary focus:border-sabor-primary sm:text-sm placeholder-slate-300 font-semibold" placeholder="Ex: Lucas Nazaré" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">E-mail Corporativo</label>
                  <input type="email" required value={newUserEmail} onChange={e => setNewUserEmail(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-sabor-primary focus:border-sabor-primary sm:text-sm placeholder-slate-300 font-semibold" placeholder="lucas@saborexpress.com" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Senha Provisória</label>
                  <input type="password" required minLength={6} value={newUserPassword} onChange={e => setNewUserPassword(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-sabor-primary focus:border-sabor-primary sm:text-sm placeholder-slate-300 font-semibold" placeholder="Mínimo 6 caracteres" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Cargo / Perfil</label>
                  <select value={newUserRole} onChange={e => setNewUserRole(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-sabor-primary focus:border-sabor-primary sm:text-sm bg-white font-extrabold text-slate-700">
                    <option value="waiter">Garçom</option>
                    <option value="kitchen">Cozinha</option>
                    <option value="cashier">Caixa</option>
                    <option value="delivery">Entregador</option>
                    <option value="administrator">Administrador</option>
                  </select>
                </div>
                <button type="submit" disabled={isCreatingUser} className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black text-sm transition-all shadow-md mt-2">
                  {isCreatingUser ? 'Salvando...' : 'Salvar Novo Membro'}
                </button>
              </form>
            </div>
          </div>

          {/* Members List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 md:p-8 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                <h3 className="font-extrabold text-slate-800 text-lg tracking-tight">Colaboradores Cadastrados</h3>
                <span className="bg-sabor-light text-sabor-dark px-3 py-1 rounded-lg text-xs font-black">
                  {staffMembers.length} colaboradores
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/20 border-b border-gray-100">
                      <th className="px-6 py-4.5 font-bold text-slate-400 text-xs uppercase tracking-wider">Nome</th>
                      <th className="px-6 py-4.5 font-bold text-slate-400 text-xs uppercase tracking-wider">Email</th>
                      <th className="px-6 py-4.5 font-bold text-slate-400 text-xs uppercase tracking-wider whitespace-nowrap">Cargo</th>
                      <th className="px-6 py-4.5 font-bold text-slate-400 text-xs uppercase tracking-wider whitespace-nowrap">Status</th>
                      <th className="px-6 py-4.5 font-bold text-slate-400 text-xs uppercase tracking-wider text-right whitespace-nowrap">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {staffMembers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-medium">Nenhum colaborador cadastrado.</td>
                      </tr>
                    ) : (
                      staffMembers.map(u => {
                        const initials = u.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
                        const getRoleDetails = (role: string) => {
                          switch (role) {
                            case 'administrator':
                              return { label: 'Administrador', bg: 'bg-slate-800 text-white' };
                            case 'waiter':
                              return { label: 'Garçom', bg: 'bg-emerald-500 text-white' };
                            case 'kitchen':
                              return { label: 'Cozinha', bg: 'bg-orange-500 text-white' };
                            case 'cashier':
                              return { label: 'Caixa', bg: 'bg-indigo-500 text-white' };
                            case 'delivery':
                              return { label: 'Entregador', bg: 'bg-cyan-500 text-white' };
                            default:
                              return { label: role, bg: 'bg-slate-500 text-white' };
                          }
                        };
                        const roleInfo = getRoleDetails(u.role);
                        
                        return (
                          <tr key={u.id} className="hover:bg-slate-50/40 transition-colors group">
                            <td className="px-6 py-5">
                              <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs uppercase tracking-wider shadow-sm flex-shrink-0 ${roleInfo.bg}`}>
                                  {initials}
                                </div>
                                <div>
                                  <div className="font-extrabold text-slate-800 text-sm tracking-tight">{u.name}</div>
                                  <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider lg:hidden mt-0.5">{roleInfo.label}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-5 text-xs font-semibold text-slate-600">{u.email}</td>
                            <td className="px-6 py-5 whitespace-nowrap">
                              <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                                u.role === 'administrator' ? 'bg-slate-100 text-slate-800' :
                                u.role === 'waiter' ? 'bg-emerald-50 text-emerald-700' :
                                u.role === 'kitchen' ? 'bg-orange-50 text-orange-700' :
                                u.role === 'cashier' ? 'bg-indigo-50 text-indigo-700' :
                                'bg-cyan-50 text-cyan-700'
                              }`}>
                                {roleInfo.label}
                              </span>
                            </td>
                            <td className="px-6 py-5 whitespace-nowrap">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider whitespace-nowrap ${
                                u.is_active ? 'bg-sabor-light text-sabor-dark' : 'bg-rose-50 text-rose-600 border border-rose-100'
                              }`}>
                                {u.is_active ? 'Ativo' : 'Inativo'}
                              </span>
                            </td>
                            <td className="px-6 py-5 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => setEditingUser(u)} title="Alterar Senha" className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 hover:text-slate-800 transition-colors">
                                  <svg className="w-4 h-4 stroke-current fill-none mx-auto" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" /></svg>
                                </button>
                                <button onClick={() => handleToggleUserStatus(u)} title={u.is_active ? "Inativar Conta" : "Ativar Conta"} className={`p-2 hover:bg-slate-100 rounded-xl transition-colors ${u.is_active ? 'text-amber-500 hover:text-amber-700' : 'text-emerald-500 hover:text-emerald-700'}`}>
                                  {u.is_active ? (
                                    <svg className="w-4 h-4 stroke-current fill-none mx-auto" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                      <circle cx="12" cy="12" r="10" />
                                      <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                                    </svg>
                                  ) : (
                                    <svg className="w-4 h-4 stroke-current fill-none mx-auto" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                                      <polyline points="22 4 12 14.01 9 11.01" />
                                    </svg>
                                  )}
                                </button>
                                <button onClick={() => handleDeleteUser(u)} title="Excluir Conta Permanentemente" className="p-2 hover:bg-rose-50 rounded-xl text-rose-500 hover:text-rose-700 transition-colors">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
