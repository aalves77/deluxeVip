
import React, { useState, useMemo } from 'react';
import { User, Game, LogItem } from '../types';

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
  onAdminAddUsers: (users: User[]) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ 
  games, 
  onUpdateGames, 
  currentUser,
  isMaintenance,
  onToggleMaintenance,
  registrationBonus,
  onUpdateBonus,
  logs,
  onClearLogs,
  allUsers,
  onToggleAdmin,
  onAdminUpdateBalance,
  onAdminAddUsers
}) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'games' | 'users' | 'config' | 'logs' | 'server'>('dashboard');
  const [balanceAdjustment, setBalanceAdjustment] = useState(0);
  const [selectedUser, setSelectedUser] = useState<string>(allUsers[0]?.username || '');
  const [tempBonus, setTempBonus] = useState(registrationBonus);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  
  const [editingGameId, setEditingGameId] = useState<string | null>(null);
  const [tempImageUrl, setTempImageUrl] = useState('');
  const [tempGameName, setTempGameName] = useState('');

  const stats = useMemo(() => {
    const totalDeposits = allUsers.reduce((sum, u) => sum + (u.totalDeposited || 0), 0);
    const totalBalance = allUsers.reduce((sum, u) => sum + (u.balance || 0), 0);
    return {
      totalDeposits,
      totalBalance,
      houseProfit: totalDeposits - totalBalance,
      userCount: allUsers.length,
      adminCount: allUsers.filter(u => u.isAdmin).length
    };
  }, [allUsers]);

  const filteredUsers = useMemo(() => {
    if (!userSearchTerm) return allUsers;
    const term = userSearchTerm.toLowerCase();
    return allUsers.filter(u => 
      u.username.toLowerCase().includes(term) || 
      (u.phone && u.phone.includes(term))
    );
  }, [allUsers, userSearchTerm]);

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

  const formatDate = (ts?: number) => {
    if (!ts) return '--/--/----';
    return new Date(ts).toLocaleDateString('pt-BR');
  };

  const generateTestUsers = () => {
    const testNames = ['bruno_lucky', 'maria_slots', 'carlos_pro', 'bet_master', 'jackpot_ninja'];
    const newUsers: User[] = testNames.map(name => ({
        username: name + '_' + Math.floor(Math.random() * 99),
        phone: '119' + Math.floor(10000000 + Math.random() * 90000000),
        balance: Math.floor(Math.random() * 500),
        vipLevel: Math.floor(Math.random() * 5) + 1,
        totalDeposited: Math.floor(Math.random() * 1000),
        betHistory: [],
        claimedVipRewards: [],
        isLoggedIn: false,
        isAdmin: false,
        password: '123',
        tournamentScore: Math.floor(Math.random() * 5000),
        createdAt: Date.now() - (Math.random() * 1000000000)
    }));
    onAdminAddUsers(newUsers);
    alert('5 usuários de teste foram gerados com sucesso!');
  };

  return (
    <div className="p-4 md:p-8 animate-fadeIn max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-red-600 rounded-2xl flex items-center justify-center shadow-lg">
            <i className="fa-solid fa-screwdriver-wrench text-white text-2xl"></i>
          </div>
          <div>
            <h1 className="text-3xl font-black italic uppercase tracking-tighter">CENTRAL <span className="text-red-500">ADMIN</span></h1>
            <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Controle Total do Sistema</p>
          </div>
        </div>

        <div className="flex bg-[#1a1b23] p-1 rounded-2xl border border-gray-800 overflow-x-auto no-scrollbar">
          {['dashboard', 'games', 'users', 'config', 'logs', 'server'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab ? 'bg-red-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
            >
              {tab === 'config' ? 'Ajustes' : tab === 'games' ? 'Jogos' : tab === 'users' ? 'Usuários' : tab === 'logs' ? 'Auditoria' : tab === 'server' ? 'Servidor' : 'Dashboard'}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'dashboard' && (
        <div className="space-y-6 animate-slideUp">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-[#1a1b23] border border-gray-800 p-6 rounded-[2rem] space-y-2">
              <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Lucro Estimado</p>
              <p className={`text-3xl font-black ${stats.houseProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                R$ {stats.houseProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="bg-[#1a1b23] border border-gray-800 p-6 rounded-[2rem] space-y-2">
              <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Contas Registradas</p>
              <p className="text-3xl font-black text-blue-500">{stats.userCount}</p>
            </div>
            <div className="bg-[#1a1b23] border border-gray-800 p-6 rounded-[2rem] space-y-2">
              <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Total em Depósitos</p>
              <p className="text-3xl font-black text-purple-500">R$ {stats.totalDeposits.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="bg-[#1a1b23] border border-gray-800 p-6 rounded-[2rem] space-y-2">
              <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Estado do Sistema</p>
              <p className={`text-2xl font-black ${isMaintenance ? 'text-red-500' : 'text-green-500'}`}>{isMaintenance ? 'MANUTENÇÃO' : 'OPERACIONAL'}</p>
            </div>
          </div>

          <div className="bg-blue-600/10 border border-blue-500/20 p-6 rounded-[2rem] flex items-center gap-6">
             <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl flex-shrink-0">
                <i className="fa-solid fa-circle-info"></i>
             </div>
             <div>
                <h4 className="font-black text-blue-400 uppercase text-xs mb-1">Dica Profissional: Veja outros usuários</h4>
                <p className="text-xs text-gray-400 font-bold leading-relaxed">
                   Atualmente, por ser um protótipo, o banco de dados é **LOCAL** (salvo no navegador). Se você quer ver pessoas reais se cadastrando de outros aparelhos, visite a aba **"SERVIDOR"** para entender como conectar o site a um banco de dados global (Backend).
                </p>
             </div>
          </div>
        </div>
      )}

      {activeTab === 'server' && (
        <div className="animate-fadeIn space-y-8 max-w-4xl">
            <div className="bg-[#1a1b23] border border-gray-800 rounded-[2.5rem] p-8 space-y-6 shadow-2xl">
                <h2 className="text-3xl font-black italic uppercase tracking-tighter text-yellow-500 flex items-center gap-4">
                    <i className="fa-solid fa-cloud-arrow-up"></i> TORNE O SITE REAL
                </h2>
                <p className="text-gray-400 font-bold leading-relaxed">
                    Para que outras pessoas possam se cadastrar e você consiga monitorá-las da sua casa, este cassino precisa sair do "Modo de Demonstração" e ser conectado a um **Servidor Central**.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-black/30 p-6 rounded-3xl border border-white/5 space-y-4">
                        <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                           <i className="fa-solid fa-database text-white"></i>
                        </div>
                        <h4 className="font-black uppercase text-sm">1. Banco de Dados</h4>
                        <p className="text-xs text-gray-500 font-bold uppercase">Requisito: Firebase Firestore ou Supabase</p>
                        <p className="text-[10px] text-gray-600 leading-tight">Isto armazenará as contas e saldos de todos os jogadores mundialmente em um único lugar.</p>
                    </div>

                    <div className="bg-black/30 p-6 rounded-3xl border border-white/5 space-y-4">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                           <i className="fa-solid fa-globe text-white"></i>
                        </div>
                        <h4 className="font-black uppercase text-sm">2. Hospedagem (Link)</h4>
                        <p className="text-xs text-gray-500 font-bold uppercase">Requisito: Vercel ou Netlify</p>
                        <p className="text-[10px] text-gray-600 leading-tight">Ao publicar seu site na Vercel, você terá um link (ex: meucassino.com) que qualquer pessoa pode acessar.</p>
                    </div>
                </div>

                <div className="bg-yellow-500/10 border border-yellow-500/20 p-6 rounded-3xl">
                    <h4 className="font-black text-yellow-500 uppercase text-xs mb-2">Resumo Técnico para o Programador:</h4>
                    <pre className="text-[9px] font-mono text-gray-400 overflow-x-auto p-4 bg-black/40 rounded-xl">
{`// Substituir em App.tsx:
const [allUsers, setAllUsers] = useState([]);

// Pelo hook de conexão:
useEffect(() => {
  const db = getFirestore();
  onSnapshot(collection(db, "users"), (snapshot) => {
    const list = snapshot.docs.map(doc => doc.data());
    setAllUsers(list);
  });
}, []);`}
                    </pre>
                </div>
            </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="space-y-8 animate-fadeIn">
          {/* Ajuste de Saldo e Simulação */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-[#1a1b23] border border-gray-800 rounded-[2.5rem] p-8 space-y-6 shadow-2xl">
                <h3 className="font-black italic uppercase text-red-500 text-xl flex items-center gap-3">
                <i className="fa-solid fa-money-bill-transfer"></i> Ajuste Financeiro Rápido
                </h3>
                <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1 space-y-2">
                    <label className="text-[10px] text-gray-500 font-black uppercase px-2">Escolha o Jogador</label>
                    <select 
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
                    className="w-full bg-[#0d0e12] border-2 border-gray-700 p-4 rounded-2xl font-black text-white outline-none focus:border-red-500 appearance-none"
                    >
                    {allUsers.map(u => (
                        <option key={u.username} value={u.username}>
                        {u.username.toUpperCase()} (BRL {u.balance.toFixed(2)})
                        </option>
                    ))}
                    </select>
                </div>
                <div className="flex-1 space-y-2">
                    <label className="text-[10px] text-gray-500 font-black uppercase px-2">Valor (+ ou -)</label>
                    <div className="flex gap-3">
                    <input 
                        type="number" 
                        value={balanceAdjustment}
                        onChange={(e) => setBalanceAdjustment(Number(e.target.value))}
                        className="bg-[#0d0e12] border-2 border-gray-700 p-4 rounded-2xl w-full text-white font-black"
                    />
                    <button 
                        onClick={() => { onAdminUpdateBalance(selectedUser, balanceAdjustment); setBalanceAdjustment(0); }}
                        className="bg-red-600 hover:bg-red-500 px-8 rounded-2xl font-black uppercase text-xs transition-all active:scale-95 text-white"
                    >
                        APLICAR
                    </button>
                    </div>
                </div>
                </div>
            </div>

            <div className="bg-[#1a1b23] border border-gray-800 rounded-[2.5rem] p-8 space-y-6 shadow-2xl flex flex-col justify-center">
                <h3 className="font-black italic uppercase text-blue-500 text-xl flex items-center gap-3">
                   <i className="fa-solid fa-users-rays"></i> Simular Atividade Global
                </h3>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">
                   Gere cadastros de teste para ver como a plataforma se comporta com múltiplos jogadores.
                </p>
                <button 
                    onClick={generateTestUsers}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-2xl shadow-xl transition-all active:scale-95 uppercase italic"
                >
                    <i className="fa-solid fa-user-plus mr-2"></i> Gerar 5 Usuários de Teste
                </button>
            </div>
          </div>

          {/* Tabela Detalhada de Usuários */}
          <div className="bg-[#1a1b23] border border-gray-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-gray-800 flex flex-col md:flex-row justify-between items-center bg-black/20 gap-4">
               <div className="flex flex-col">
                  <h3 className="font-black text-white italic uppercase tracking-tighter">LISTA DE JOGADORES NO NAVEGADOR</h3>
                  <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{allUsers.length} jogadores salvos localmente</span>
               </div>
               <div className="relative w-full md:w-80">
                  <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"></i>
                  <input 
                    type="text" 
                    placeholder="Buscar por nome ou telefone..."
                    value={userSearchTerm}
                    onChange={(e) => setUserSearchTerm(e.target.value)}
                    className="w-full bg-[#0d0e12] border border-gray-700 rounded-xl py-2.5 pl-11 pr-4 text-xs font-bold text-white focus:outline-none focus:border-red-500"
                  />
               </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-black/40 border-b border-gray-800">
                    <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-widest">Jogador</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-widest text-center">Cadastro</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-widest">Saldo Atual</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-widest">Senha</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-widest text-right">Privilégios</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-20 text-center text-gray-600 font-bold uppercase tracking-widest">Nenhum jogador encontrado</td>
                    </tr>
                  ) : (
                    filteredUsers.map(u => (
                      <tr key={u.username} className={`hover:bg-white/5 transition-colors ${u.username === currentUser.username ? 'bg-yellow-500/5' : ''}`}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                             <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs uppercase shadow-lg ${u.isAdmin ? 'bg-red-600 text-white' : 'bg-blue-600 text-white'}`}>
                               {u.username.charAt(0)}
                             </div>
                             <div className="flex flex-col">
                               <span className="font-black text-sm uppercase text-white tracking-tighter">{u.username}</span>
                               <span className="text-[9px] text-gray-600 font-bold uppercase">{u.phone || 'S/ Telefone'} • VIP {u.vipLevel}</span>
                             </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                           <span className="text-[10px] font-mono text-gray-500">{formatDate(u.createdAt)}</span>
                        </td>
                        <td className="px-6 py-4 font-mono font-black text-yellow-500">R$ {u.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                        <td className="px-6 py-4 font-mono text-[10px] text-gray-600 uppercase tracking-widest">{u.password || '******'}</td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => onToggleAdmin(u.username)}
                            disabled={u.username === 'aalves'}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${u.isAdmin ? 'bg-zinc-800 text-gray-500 border-white/10' : 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20'} disabled:opacity-20`}
                          >
                            {u.isAdmin ? 'Remover Admin' : 'Tornar Admin'}
                          </button>
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

      {activeTab === 'games' && (
        <div className="bg-[#1a1b23] border border-gray-800 rounded-[2.5rem] overflow-hidden animate-fadeIn shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-black/40 border-b border-gray-800">
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-widest">Visual & Nome</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-widest">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-widest text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {games.map(game => (
                  <tr key={game.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      {editingGameId === game.id ? (
                        <div className="space-y-2 p-2 bg-black/40 rounded-xl">
                          <input 
                            type="text" 
                            value={tempGameName}
                            onChange={(e) => setTempGameName(e.target.value)}
                            className="bg-[#0d0e12] border border-gray-700 px-3 py-2 rounded-lg text-xs w-full text-white"
                            placeholder="Nome do Jogo"
                          />
                          <input 
                            type="text" 
                            value={tempImageUrl}
                            onChange={(e) => setTempImageUrl(e.target.value)}
                            className="bg-[#0d0e12] border border-gray-700 px-3 py-2 rounded-lg text-xs w-full text-white"
                            placeholder="Link da Imagem"
                          />
                          <div className="flex gap-2">
                             <button onClick={() => saveGameChanges(game.id)} className="bg-green-600 text-white px-3 py-1 rounded text-[10px] font-black uppercase">Salvar</button>
                             <button onClick={() => setEditingGameId(null)} className="bg-gray-800 text-white px-3 py-1 rounded text-[10px] font-black uppercase">Sair</button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-4">
                          <img src={game.image} className="w-12 h-12 rounded-xl object-cover" alt={game.name} />
                          <div className="flex flex-col">
                            <span className="font-black text-sm uppercase text-white">{game.name}</span>
                            <button onClick={() => startEditingGame(game)} className="text-[9px] font-black text-blue-500 uppercase hover:underline">Editar Info</button>
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase border ${game.isActive ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                         {game.isActive ? 'Ativo' : 'Pausado'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => toggleGameStatus(game.id)} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${game.isActive ? 'bg-red-600/10 text-red-600 border border-red-600/20' : 'bg-green-600/10 text-green-600 border border-green-600/20'}`}>
                        {game.isActive ? 'Pausar' : 'Ativar'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'config' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fadeIn">
          <div className="bg-[#1a1b23] border border-gray-800 rounded-[2.5rem] p-8 space-y-6 shadow-2xl">
            <h3 className="font-black italic uppercase text-red-500 text-xl flex items-center gap-3">
               <i className="fa-solid fa-gears"></i> Disponibilidade
            </h3>
            <div className="flex items-center justify-between p-6 bg-black/40 rounded-3xl border border-white/5">
              <div>
                <p className="text-sm font-black uppercase text-white">MODO MANUTENÇÃO</p>
                <p className="text-[10px] text-gray-500 uppercase font-bold">Apenas admins acessam</p>
              </div>
              <button 
                onClick={onToggleMaintenance}
                className={`w-16 h-9 rounded-full p-1 transition-all ${isMaintenance ? 'bg-red-600' : 'bg-zinc-800'}`}
              >
                <div className={`w-7 h-7 bg-white rounded-full transition-transform ${isMaintenance ? 'translate-x-7' : 'translate-x-0'}`}></div>
              </button>
            </div>
          </div>

          <div className="bg-[#1a1b23] border border-gray-800 rounded-[2.5rem] p-8 space-y-6 shadow-2xl">
            <h3 className="font-black italic uppercase text-yellow-500 text-xl flex items-center gap-3">
               <i className="fa-solid fa-gift"></i> Promoção de Entrada
            </h3>
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase text-gray-500 px-2">Bônus de Novo Cadastro (R$)</label>
              <div className="flex gap-3">
                  <input 
                    type="number" 
                    value={tempBonus}
                    onChange={(e) => setTempBonus(Number(e.target.value))}
                    className="bg-[#0d0e12] border-2 border-gray-700 p-4 rounded-2xl w-full text-white font-black"
                  />
                  <button 
                    onClick={() => { onUpdateBonus(tempBonus); alert('Bônus atualizado!'); }}
                    className="bg-yellow-500 text-black px-8 rounded-2xl font-black uppercase text-xs transition-all active:scale-95"
                  >
                    SALVAR
                  </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="bg-[#1a1b23] border border-gray-800 rounded-[2.5rem] overflow-hidden shadow-2xl animate-fadeIn">
          <div className="p-6 flex justify-between items-center">
             <h3 className="font-black italic uppercase text-red-500">HISTÓRICO DE AUDITORIA</h3>
             <button onClick={onClearLogs} className="text-[10px] font-black uppercase text-gray-500 hover:text-red-500">Zerar Logs</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-black/40 border-b border-gray-800">
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500">Timestamp</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500">Origem</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500">Mensagem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {logs.length === 0 ? (
                  <tr><td colSpan={3} className="px-6 py-20 text-center text-gray-600 font-bold uppercase">Nenhum evento registrado</td></tr>
                ) : (
                  logs.map(log => (
                    <tr key={log.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 font-mono text-[10px] text-gray-500">{new Date(log.timestamp).toLocaleString('pt-BR')}</td>
                      <td className="px-6 py-4 font-black text-[11px] text-white uppercase">{log.user || 'SYSTEM'}</td>
                      <td className="px-6 py-4 text-xs text-gray-400 font-bold">{log.message}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
