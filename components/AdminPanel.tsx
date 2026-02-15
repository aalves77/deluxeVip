
import React, { useState } from 'react';
import { User, Game, GameCategory, LogItem } from '../types';

interface AdminPanelProps {
  games: Game[];
  onUpdateGames: (games: Game[]) => void;
  onUpdateUser: (updates: Partial<User>) => void;
  currentUser: User;
  isMaintenance: boolean;
  onToggleMaintenance: () => void;
  registrationBonus: number;
  onUpdateBonus: (val: number) => void;
  logs: LogItem[];
  onClearLogs: () => void;
  allUsers: User[];
  onToggleAdmin: (username: string) => void;
  onAdminUpdateBalance: (username: string, amount: number) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ 
  games, 
  onUpdateGames, 
  onUpdateUser, 
  currentUser,
  isMaintenance,
  onToggleMaintenance,
  registrationBonus,
  onUpdateBonus,
  logs,
  onClearLogs,
  allUsers,
  onToggleAdmin,
  onAdminUpdateBalance
}) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'games' | 'users' | 'config' | 'logs'>('dashboard');
  const [balanceAdjustment, setBalanceAdjustment] = useState(0);
  const [selectedUser, setSelectedUser] = useState<string>(currentUser.username);
  const [tempBonus, setTempBonus] = useState(registrationBonus);
  
  const [editingGameId, setEditingGameId] = useState<string | null>(null);
  const [tempImageUrl, setTempImageUrl] = useState('');
  const [tempGameName, setTempGameName] = useState('');

  const toggleGameStatus = (id: string) => {
    const newGames = games.map(g => g.id === id ? { ...g, isActive: !g.isActive } : g);
    onUpdateGames(newGames);
  };

  const startEditingGame = (game: Game) => {
    setEditingGameId(game.id);
    setTempImageUrl(game.image);
    setTempGameName(game.name);
  };

  const saveGameChanges = (id: string) => {
    const newGames = games.map(g => g.id === id ? { ...g, image: tempImageUrl, name: tempGameName } : g);
    onUpdateGames(newGames);
    setEditingGameId(null);
  };

  const handleBalanceUpdate = () => {
    onAdminUpdateBalance(selectedUser, balanceAdjustment);
    setBalanceAdjustment(0);
    alert(`Saldo de ${selectedUser} atualizado com sucesso.`);
  };

  const handleBonusSave = () => {
    onUpdateBonus(tempBonus);
    alert('Bônus de cadastro atualizado!');
  };

  const getLogCategoryColor = (category: LogItem['category']) => {
    switch(category) {
      case 'ADMIN': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'MONEY': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'GAME': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'USER': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  return (
    <div className="p-4 md:p-8 animate-fadeIn max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-red-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-900/40">
            <i className="fa-solid fa-screwdriver-wrench text-white text-2xl"></i>
          </div>
          <div>
            <h1 className="text-3xl font-black italic uppercase tracking-tighter">CENTRAL DO <span className="text-red-500">ADMIN</span></h1>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Painel de Controle Deluxe v4.4</p>
          </div>
        </div>

        <div className="flex bg-[#1a1b23] p-1 rounded-2xl border border-gray-800 overflow-x-auto no-scrollbar">
          {['dashboard', 'games', 'users', 'config', 'logs'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab ? 'bg-red-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
            >
              {tab === 'config' ? 'Ajustes' : tab === 'games' ? 'Jogos' : tab === 'users' ? 'Usuários' : tab === 'logs' ? 'Auditoria' : 'Resumo'}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'dashboard' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-slideUp">
          <div className="bg-[#1a1b23] border border-gray-800 p-6 rounded-[2rem] space-y-2">
            <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Ganhos da Casa</p>
            <p className="text-3xl font-black text-green-500">R$ 142.500,00</p>
            <div className="h-1 bg-green-900/30 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 w-[70%]"></div>
            </div>
          </div>
          <div className="bg-[#1a1b23] border border-gray-800 p-6 rounded-[2rem] space-y-2">
            <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Usuários Registrados</p>
            <p className="text-3xl font-black text-blue-500">{allUsers.length}</p>
            <p className="text-[10px] text-blue-400 font-bold">Total na plataforma</p>
          </div>
          <div className="bg-[#1a1b23] border border-gray-800 p-6 rounded-[2rem] space-y-2">
            <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Admins</p>
            <p className="text-3xl font-black text-purple-500">{allUsers.filter(u => u.isAdmin).length}</p>
            <p className="text-[10px] text-purple-400 font-bold">Privilégios elevados</p>
          </div>
          <div className="bg-[#1a1b23] border border-gray-800 p-6 rounded-[2rem] space-y-2">
            <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Manutenção</p>
            <p className={`text-3xl font-black ${isMaintenance ? 'text-red-500' : 'text-green-500'}`}>{isMaintenance ? 'ATIVO' : 'OFF'}</p>
          </div>
        </div>
      )}

      {activeTab === 'games' && (
        <div className="bg-[#1a1b23] border border-gray-800 rounded-[2.5rem] overflow-hidden animate-fadeIn shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-black/40 border-b border-gray-800">
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-widest">Dados do Jogo</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-widest">Categoria</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-widest">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-widest text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {games.map(game => (
                  <tr key={game.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-2 min-w-[250px]">
                        {editingGameId === game.id ? (
                          <div className="space-y-2 animate-fadeIn bg-black/20 p-3 rounded-2xl border border-white/5">
                            <input 
                              type="text" 
                              value={tempGameName}
                              onChange={(e) => setTempGameName(e.target.value)}
                              className="bg-[#0d0e12] border border-gray-700 px-4 py-2 rounded-xl text-[11px] w-full outline-none font-bold"
                              placeholder="Nome do Jogo"
                            />
                            <input 
                              type="text" 
                              value={tempImageUrl}
                              onChange={(e) => setTempImageUrl(e.target.value)}
                              className="bg-[#0d0e12] border border-gray-700 px-4 py-2 rounded-xl text-[11px] w-full outline-none font-bold"
                              placeholder="URL Imagem"
                            />
                            <div className="flex gap-2">
                              <button onClick={() => saveGameChanges(game.id)} className="flex-1 bg-green-600 text-white py-2 rounded-xl text-[10px] font-black uppercase">Salvar</button>
                              <button onClick={() => setEditingGameId(null)} className="bg-gray-800 text-gray-400 px-4 py-2 rounded-xl text-[10px] font-black uppercase">X</button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-4">
                            <img src={game.image} className="w-14 h-14 rounded-xl object-cover shadow-lg border border-white/10" alt={game.name} />
                            <div className="flex flex-col">
                              <span className="font-black text-sm uppercase tracking-tight">{game.name}</span>
                              <button onClick={() => startEditingGame(game)} className="text-[9px] font-black text-blue-500 uppercase mt-1">Editar Jogo</button>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[10px] font-black text-gray-400">{game.category}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${game.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className={`text-[10px] font-black ${game.isActive ? 'text-green-500' : 'text-red-500'}`}>{game.isActive ? 'ONLINE' : 'MANUTENÇÃO'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => toggleGameStatus(game.id)} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${game.isActive ? 'bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white' : 'bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white'}`}>
                        {game.isActive ? 'Desativar' : 'Ativar'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="space-y-8 animate-fadeIn">
          {/* Gerenciamento de Saldo Rápido */}
          <div className="bg-[#1a1b23] border border-gray-800 rounded-[2.5rem] p-8 space-y-6 shadow-2xl">
            <h3 className="font-black italic uppercase text-red-500 text-xl flex items-center gap-2">
               <i className="fa-solid fa-wallet"></i> Ajuste Financeiro Rápido
            </h3>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1 space-y-2">
                <label className="text-[10px] text-gray-500 font-black uppercase px-2 tracking-widest">Usuário Alvo</label>
                <select 
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="w-full bg-[#0d0e12] border-2 border-gray-700 p-4 rounded-2xl font-black text-white outline-none focus:border-red-500 appearance-none"
                >
                  {allUsers.map(u => (
                    <option key={u.username} value={u.username}>
                      {u.username.toUpperCase()} {u.isAdmin ? '(ADMIN)' : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1 space-y-2">
                <label className="text-[10px] text-gray-500 font-black uppercase px-2 tracking-widest">Ajuste de Saldo (R$)</label>
                <div className="flex gap-2">
                  <input 
                    type="number" 
                    value={balanceAdjustment}
                    onChange={(e) => setBalanceAdjustment(Number(e.target.value))}
                    className="bg-[#0d0e12] border-2 border-gray-700 p-4 rounded-2xl w-full text-white font-mono font-black"
                    placeholder="Ex: 100 ou -50"
                  />
                  <button onClick={handleBalanceUpdate} className="bg-red-600 hover:bg-red-500 px-8 rounded-2xl font-black uppercase text-xs shadow-lg transition-all active:scale-95">APLICAR</button>
                </div>
              </div>
            </div>
          </div>

          {/* Tabela Completa de Usuários */}
          <div className="bg-[#1a1b23] border border-gray-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-black/20">
               <h3 className="font-black text-white italic uppercase tracking-tighter">LISTA DE JOGADORES</h3>
               <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{allUsers.length} cadastrados</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-black/40 border-b border-gray-800">
                    <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-widest">Usuário</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-widest">Saldo</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-widest">Nível VIP</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-widest">Cargo</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-widest text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {allUsers.map(u => (
                    <tr key={u.username} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center font-black text-[10px] uppercase">
                             {u.username.charAt(0)}
                           </div>
                           <span className="font-black text-sm uppercase text-white">{u.username}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-yellow-500">R$ {u.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                      <td className="px-6 py-4 text-[10px] font-black text-purple-400 uppercase tracking-widest">VIP {u.vipLevel}</td>
                      <td className="px-6 py-4">
                        <span className={`text-[8px] font-black px-2 py-0.5 rounded border ${u.isAdmin ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-gray-500/10 text-gray-400 border-gray-500/20'}`}>
                          {u.isAdmin ? 'ADMINISTRADOR' : 'JOGADOR'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => onToggleAdmin(u.username)}
                          disabled={u.username === 'aalves'}
                          className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${u.isAdmin ? 'bg-zinc-800 text-gray-400 border-white/5 hover:text-red-500' : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20 hover:bg-yellow-500 hover:text-black'} disabled:opacity-20`}
                        >
                          {u.isAdmin ? 'Remover Admin' : 'Promover a Admin'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex justify-between items-center">
             <h3 className="font-black italic uppercase text-red-500 flex items-center gap-2">
                <i className="fa-solid fa-list-ul"></i> Auditoria de Eventos
             </h3>
             <button 
              onClick={() => { if(window.confirm('Limpar todo o histórico de logs?')) onClearLogs(); }}
              className="px-4 py-2 bg-gray-800 text-gray-400 rounded-xl text-[10px] font-black uppercase hover:bg-red-600 hover:text-white transition-all"
             >
               Limpar Auditoria
             </button>
          </div>
          <div className="bg-[#1a1b23] border border-gray-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-black/40 border-b border-gray-800">
                    <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-widest">Horário</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-widest">Categoria</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-widest">Usuário</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-widest">Evento</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {logs.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-20 text-center text-gray-600 font-black uppercase italic tracking-widest opacity-20">Nenhum registro encontrado</td>
                    </tr>
                  ) : (
                    logs.map(log => (
                      <tr key={log.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-[11px] font-mono text-gray-500">
                          {new Date(log.timestamp).toLocaleString('pt-BR')}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded border uppercase ${getLogCategoryColor(log.category)}`}>
                            {log.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-[11px] font-black text-white uppercase tracking-tighter">
                          {log.user || 'SISTEMA'}
                        </td>
                        <td className="px-6 py-4 text-[11px] text-gray-400 font-bold">
                          {log.message}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'config' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fadeIn">
          <div className="bg-[#1a1b23] border border-gray-800 rounded-[2.5rem] p-8 space-y-6 shadow-2xl">
            <h3 className="font-black italic uppercase text-red-500 text-xl flex items-center gap-2">
               <i className="fa-solid fa-power-off"></i> Manutenção do Sistema
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-5 bg-black/40 rounded-3xl border border-white/5">
                <div>
                  <p className="text-sm font-black uppercase text-white">Modo Manutenção Global</p>
                  <p className="text-[10px] text-gray-500 uppercase font-bold">Bloqueia acesso de todos os usuários comuns</p>
                </div>
                <button 
                  onClick={onToggleMaintenance}
                  className={`w-14 h-8 rounded-full p-1 transition-all duration-300 ${isMaintenance ? 'bg-red-600' : 'bg-gray-700'}`}
                >
                  <div className={`w-6 h-6 bg-white rounded-full transition-transform duration-300 ${isMaintenance ? 'translate-x-6' : 'translate-x-0'}`}></div>
                </button>
              </div>
            </div>
          </div>

          <div className="bg-[#1a1b23] border border-gray-800 rounded-[2.5rem] p-8 space-y-6 shadow-2xl">
            <h3 className="font-black italic uppercase text-yellow-500 text-xl flex items-center gap-2">
               <i className="fa-solid fa-gift"></i> Recompensas Automáticas
            </h3>
            <div className="space-y-4">
              <div className="flex flex-col gap-2 p-5 bg-black/40 rounded-3xl border border-white/5">
                <p className="text-sm font-black uppercase text-white">Bônus de Novo Cadastro (R$)</p>
                <div className="flex gap-2">
                   <div className="relative flex-1">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-yellow-500 font-bold">R$</span>
                      <input 
                        type="number" 
                        value={tempBonus}
                        onChange={(e) => setTempBonus(Number(e.target.value))}
                        className="bg-[#0d0e12] border-2 border-gray-700 p-4 pl-12 rounded-2xl w-full text-white font-black outline-none focus:border-yellow-500"
                      />
                   </div>
                   <button 
                    onClick={handleBonusSave}
                    className="bg-yellow-500 text-black px-6 rounded-2xl font-black uppercase text-xs shadow-lg"
                   >
                     SALVAR
                   </button>
                </div>
                <p className="text-[10px] text-gray-500 uppercase font-bold mt-1">Valor concedido instantaneamente ao criar conta</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
