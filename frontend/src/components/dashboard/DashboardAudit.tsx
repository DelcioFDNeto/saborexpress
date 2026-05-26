import React from 'react';

interface AuditEvent {
  id: number;
  event: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
  auditable_type: string;
  auditable_id: number;
  description: string;
  metadata: any;
  created_at: string;
}

interface DashboardAuditProps {
  auditEvents: AuditEvent[];
  auditLoading: boolean;
  auditPagination: any;
  auditPage: number;
  setAuditPage: React.Dispatch<React.SetStateAction<number>>;
  auditFilterEvent: string;
  setAuditFilterEvent: (s: string) => void;
  auditFilterUser: string;
  setAuditFilterUser: (s: string) => void;
  auditDateFrom: string;
  setAuditDateFrom: (s: string) => void;
  auditDateTo: string;
  setAuditDateTo: (s: string) => void;
  onRefresh: () => Promise<void>;
}

const AuditSkeleton = () => (
  <div className="space-y-6">
    <div className="bg-white p-6 rounded-3xl border border-gray-100 space-y-4 animate-pulse">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="space-y-2">
            <div className="h-3 bg-slate-200 rounded w-1/3 animate-pulse"></div>
            <div className="h-10 bg-slate-200 rounded-lg w-full animate-pulse"></div>
          </div>
        ))}
      </div>
    </div>
    <div className="bg-white rounded-3xl border border-gray-100 p-6 space-y-4 animate-pulse">
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className="flex items-center gap-4 py-3 border-b border-slate-100">
          <div className="h-4 bg-slate-200 rounded w-24"></div>
          <div className="h-4 bg-slate-200 rounded w-20"></div>
          <div className="flex-1 h-4 bg-slate-200 rounded w-1/2"></div>
          <div className="h-4 bg-slate-200 rounded w-12"></div>
        </div>
      ))}
    </div>
  </div>
);

export default function DashboardAudit({
  auditEvents,
  auditLoading,
  auditPagination,
  auditPage,
  setAuditPage,
  auditFilterEvent,
  setAuditFilterEvent,
  auditFilterUser,
  setAuditFilterUser,
  auditDateFrom,
  setAuditDateFrom,
  auditDateTo,
  setAuditDateTo,
  onRefresh
}: DashboardAuditProps) {

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Logs de Auditoria</h1>
        <p className="text-gray-500 font-medium mt-1">Acompanhamento e histórico de ações críticas realizadas por usuários.</p>
      </div>

      {auditLoading && auditEvents.length === 0 ? (
        <AuditSkeleton />
      ) : (
        <>
          {/* Filter Panel */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Evento</label>
                <input 
                  type="text" 
                  value={auditFilterEvent} 
                  onChange={e => setAuditFilterEvent(e.target.value)} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" 
                  placeholder="Ex: CategoryCreated" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">ID do Usuário</label>
                <input 
                  type="number" 
                  value={auditFilterUser} 
                  onChange={e => setAuditFilterUser(e.target.value)} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" 
                  placeholder="Ex: 1" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">De (Data)</label>
                <input 
                  type="date" 
                  value={auditDateFrom} 
                  onChange={e => setAuditDateFrom(e.target.value)} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Até (Data)</label>
                <input 
                  type="date" 
                  value={auditDateTo} 
                  onChange={e => setAuditDateTo(e.target.value)} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" 
                />
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-4 pt-4 border-t border-gray-100">
              <button 
                onClick={() => {
                  setAuditFilterEvent('');
                  setAuditFilterUser('');
                  setAuditDateFrom('');
                  setAuditDateTo('');
                  setAuditPage(1);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Limpar Filtros
              </button>
              <button 
                onClick={() => {
                  setAuditPage(1);
                  onRefresh();
                }}
                className="px-6 py-2 bg-sabor-primary text-sabor-dark font-extrabold rounded-lg text-sm hover:bg-sabor-primary/90 transition-colors"
              >
                🔍 Filtrar Logs
              </button>
            </div>
          </div>

          {/* Events Log Table */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
              <h3 className="font-extrabold text-gray-900">Eventos Auditados</h3>
              <span className="bg-sabor-light text-sabor-dark px-2.5 py-1 rounded-md text-xs font-black">{auditEvents.length} listados</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/20 border-b border-gray-100">
                    <th className="p-4 font-bold text-gray-500 text-xs uppercase tracking-wider">Timestamp</th>
                    <th className="p-4 font-bold text-gray-500 text-xs uppercase tracking-wider">Evento</th>
                    <th className="p-4 font-bold text-gray-500 text-xs uppercase tracking-wider">Usuário</th>
                    <th className="p-4 font-bold text-gray-500 text-xs uppercase tracking-wider">Descrição / Ação</th>
                    <th className="p-4 font-bold text-gray-500 text-xs uppercase tracking-wider">Recurso ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {auditEvents.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-gray-400 font-medium">Nenhum evento registrado com os filtros informados.</td>
                    </tr>
                  ) : (
                    auditEvents.map(ev => (
                      <tr key={ev.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="p-4 text-xs text-gray-500 font-medium whitespace-nowrap">
                          {new Date(ev.created_at).toLocaleString('pt-BR')}
                        </td>
                        <td className="p-4 font-bold text-emerald-700 text-xs">
                          {ev.event}
                        </td>
                        <td className="p-4">
                          {ev.user ? (
                            <div>
                              <span className="font-bold text-gray-900 block text-xs">{ev.user.name}</span>
                              <span className="text-gray-400 text-[10px] block font-medium">{ev.user.email}</span>
                            </div>
                          ) : (
                            <span className="text-gray-400 font-medium text-xs">Sistema / Anônimo</span>
                          )}
                        </td>
                        <td className="p-4 text-gray-600 font-medium text-xs leading-relaxed">
                          {ev.description || 'Nenhuma descrição fornecida.'}
                        </td>
                        <td className="p-4">
                          <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono text-xs">
                            {ev.auditable_type.split('\\').pop()}:{ev.auditable_id}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination controls */}
            {auditPagination && auditPagination.last_page > 1 && (
              <div className="p-6 border-t border-gray-100 flex items-center justify-between bg-gray-50/20">
                <span className="text-xs text-gray-500 font-medium">Página {auditPage} de {auditPagination.last_page}</span>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setAuditPage(prev => Math.max(1, prev - 1))}
                    disabled={auditPage === 1}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    Anterior
                  </button>
                  <button 
                    onClick={() => setAuditPage(prev => Math.min(auditPagination.last_page, prev + 1))}
                    disabled={auditPage === auditPagination.last_page}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    Próxima
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
