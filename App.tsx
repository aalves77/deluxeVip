
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import BottomNav from './components/BottomNav';
import Home from './pages/Home';
import HistoryPage from './pages/HistoryPage';
import VipPage from './pages/VipPage';
import ProfilePage from './pages/ProfilePage';
import TournamentPage from './pages/TournamentPage';
import AffiliatePage from './pages/AffiliatePage';
import AdminPanel from './components/AdminPanel';
import CasinoAIChat from './components/CasinoAIChat';
import DepositModal from './components/DepositModal';
import WithdrawModal from './components/WithdrawModal';
import AuthModal from './components/AuthModal';
import { User, BetHistoryItem, Game, LogItem } from './types';
import { VIP_LEVELS, GAMES as INITIAL_GAMES } from './constants';

const App: React.FC = () => {
  const [games, setGames] = useState<Game[]>(() => {
    const saved = localStorage.getItem('kkvip_games');
    return saved ? JSON.parse(saved) : INITIAL_GAMES.map(g => ({ ...g, isActive: true }));
  });

  const [isMaintenance, setIsMaintenance] = useState(() => {
    return localStorage.getItem('kkvip_maintenance') === 'true';
  });

  const [registrationBonus, setRegistrationBonus] = useState(() => {
    return Number(localStorage.getItem('kkvip_reg_bonus')) || 10.00;
  });

  const [logs, setLogs] = useState<LogItem[]>(() => {
    const saved = localStorage.getItem('kkvip_logs');
    return saved ? JSON.parse(saved) : [];
  });

  // BASE DE DADOS GLOBAL: Carrega todos os usuários salvos no navegador
  const [allUsers, setAllUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('kkvip_all_users');
    if (saved) return JSON.parse(saved);
    return [{
      username: 'admin',
      phone: '000000000',
      balance: 1000.00,
      vipLevel: 10,
      totalDeposited: 1000000,
      betHistory: [],
      claimedVipRewards: [2, 3, 4, 5, 6, 7, 8, 9, 10],
      isLoggedIn: false,
      isAdmin: true,
      password: 'admin',
      tournamentScore: 0
    }];
  });

  // SESSÃO ATIVA: Carrega o usuário que estava logado
  const [user, setUser] = useState<User>(() => {
    const saved = localStorage.getItem('kkvip_user');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Busca os dados mais recentes na base global para garantir que o saldo esteja certo
      const savedUsers = JSON.parse(localStorage.getItem('kkvip_all_users') || '[]');
      const freshData = savedUsers.find((u: any) => u.username === parsed.username);
      return freshData ? { ...freshData, isLoggedIn: !!parsed.isLoggedIn } : parsed;
    }
    return { ...allUsers[0], isLoggedIn: false };
  });

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);

  // Efeito de persistência: Salva allUsers sempre que houver mudança
  useEffect(() => {
    localStorage.setItem('kkvip_all_users', JSON.stringify(allUsers));
  }, [allUsers]);

  // Efeito de sincronização: Quando as ações do usuário logado mudam seus dados, atualiza a base global
  useEffect(() => {
    if (user.username && user.isLoggedIn) {
      localStorage.setItem('kkvip_user', JSON.stringify(user));
      setAllUsers(prev => {
        const index = prev.findIndex(u => u.username === user.username);
        if (index !== -1) {
          const newUsers = [...prev];
          newUsers[index] = { ...user };
          return newUsers;
        }
        return [...prev, user];
      });
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('kkvip_games', JSON.stringify(games));
  }, [games]);

  useEffect(() => {
    localStorage.setItem('kkvip_maintenance', String(isMaintenance));
  }, [isMaintenance]);

  const addLog = useCallback((category: LogItem['category'], message: string, username?: string) => {
    const newLog: LogItem = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      category,
      message,
      user: username || user.username
    };
    setLogs(prev => {
      const updated = [newLog, ...prev].slice(0, 500);
      localStorage.setItem('kkvip_logs', JSON.stringify(updated));
      return updated;
    });
  }, [user.username]);

  const handleToggleMaintenance = () => {
    const newState = !isMaintenance;
    setIsMaintenance(newState);
    addLog('ADMIN', `Modo manutenção: ${newState ? 'LIGADO' : 'DESLIGADO'}`);
  };

  const handleUpdateBonus = (val: number) => {
    setRegistrationBonus(val);
    localStorage.setItem('kkvip_reg_bonus', String(val));
    addLog('ADMIN', `Bônus alterado para R$ ${val.toFixed(2)}`);
  };

  const handleUpdateGames = (updatedGames: Game[]) => {
    setGames(updatedGames);
    addLog('ADMIN', `Configurações de jogos atualizadas`);
  };

  const handleLogin = (newUser: User, isNewRegistration: boolean = false) => {
    if (isNewRegistration) {
      // Inserção atômica na base de dados global
      setAllUsers(prev => {
        const updated = [...prev, newUser];
        localStorage.setItem('kkvip_all_users', JSON.stringify(updated));
        return updated;
      });
      addLog('USER', `Novo registro efetuado`, newUser.username);
    }
    
    setUser({ ...newUser, isLoggedIn: true });
    setIsAuthOpen(false);
    addLog('USER', `Sessão iniciada`, newUser.username);
  };

  const handleLogout = () => {
    addLog('USER', `Sessão encerrada`);
    setUser(prev => ({ ...prev, isLoggedIn: false }));
    localStorage.removeItem('kkvip_user');
  };

  const updateUser = (updates: Partial<User>) => {
    setUser(prev => ({ ...prev, ...updates }));
  };

  const handleAdminToggleUser = (targetUsername: string) => {
    setAllUsers(prev => prev.map(u => {
      if (u.username === targetUsername) {
        const newStatus = !u.isAdmin;
        addLog('ADMIN', `${newStatus ? 'Promoveu' : 'Rebaixou'} usuário ${targetUsername}`);
        if (user.username === targetUsername) setUser(curr => ({ ...curr, isAdmin: newStatus }));
        return { ...u, isAdmin: newStatus };
      }
      return u;
    }));
  };

  const handleAdminUpdateBalance = (targetUsername: string, amount: number) => {
    setAllUsers(prev => prev.map(u => {
      if (u.username === targetUsername) {
        const newBalance = u.balance + amount;
        addLog('MONEY', `Ajuste administrativo no saldo de ${targetUsername}: R$ ${amount.toFixed(2)}`);
        if (user.username === targetUsername) setUser(curr => ({ ...curr, balance: newBalance }));
        return { ...u, balance: newBalance };
      }
      return u;
    }));
  };

  const updateBalance = (amount: number, isDeposit: boolean = false, gameMetadata?: { name: string, type: 'win' | 'loss' | 'withdraw', category?: string }) => {
    if (isMaintenance && !user.isAdmin) return;
    if (!user.isLoggedIn) {
      setIsAuthOpen(true);
      return;
    }
    
    if (isDeposit) {
      addLog('MONEY', `Depósito recebido via PIX: +R$ ${amount.toFixed(2)}`);
    } else if (gameMetadata?.type === 'withdraw') {
      addLog('MONEY', `Solicitação de saque via PIX: -R$ ${Math.abs(amount).toFixed(2)}`);
    } else if (gameMetadata) {
      addLog('GAME', `${gameMetadata.type === 'win' ? 'Ganhou' : 'Apostou'} em ${gameMetadata.name}: R$ ${Math.abs(amount).toFixed(2)}`);
    }

    setUser(prev => {
      const newHistory: BetHistoryItem[] = [...prev.betHistory];
      let tournamentPoints = 0;

      if (!isDeposit && gameMetadata?.type === 'win' && amount > 0) {
        if (gameMetadata.category === 'SLOTS') tournamentPoints = Math.floor(amount * 10);
      }
      
      if (gameMetadata || isDeposit) {
        const historyItem: BetHistoryItem = {
          id: Math.random().toString(36).substr(2, 9),
          gameName: isDeposit ? 'Depósito PIX' : (gameMetadata?.name || 'Sistema'),
          amount: Math.abs(amount),
          type: isDeposit ? 'deposit' : (gameMetadata?.type || (amount > 0 ? 'win' : 'loss')),
          timestamp: Date.now()
        };
        newHistory.unshift(historyItem);
      }

      return {
        ...prev,
        balance: prev.balance + amount,
        totalDeposited: isDeposit ? prev.totalDeposited + amount : prev.totalDeposited,
        betHistory: newHistory.slice(0, 50),
        tournamentScore: prev.tournamentScore + tournamentPoints
      };
    });
  };

  const claimVipReward = (level: number, reward: number) => {
    if (!user.isLoggedIn) return setIsAuthOpen(true);
    addLog('MONEY', `Resgatou prêmio VIP Nível ${level}: +R$ ${reward.toFixed(2)}`);
    setUser(prev => ({
      ...prev,
      balance: prev.balance + reward,
      claimedVipRewards: [...prev.claimedVipRewards, level],
      betHistory: [{
        id: Math.random().toString(36).substr(2, 9),
        gameName: `Prêmio VIP ${level}`,
        amount: reward,
        type: 'win' as const,
        timestamp: Date.now()
      }, ...prev.betHistory].slice(0, 50)
    }));
  };

  const clearLogs = () => {
    setLogs([]);
    localStorage.removeItem('kkvip_logs');
    addLog('SYSTEM', 'Limpeza completa dos logs de auditoria efetuada');
  };

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="flex flex-col min-h-screen bg-[#0d0e12] text-white">
        {isMaintenance && user.isAdmin && (
          <div className="bg-red-600 text-white py-1 px-4 text-center text-[10px] font-black uppercase tracking-[0.3em] z-[60]">
            Atenção: Modo Manutenção Ativado no Site
          </div>
        )}

        <Navbar 
          user={user} 
          onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} 
          onDepositClick={() => setIsDepositOpen(true)}
          onAuthClick={() => setIsAuthOpen(true)}
        />

        <div className="flex flex-1 overflow-hidden">
          <Sidebar 
            isOpen={isSidebarOpen} 
            user={user}
            onWithdrawClick={() => setIsWithdrawOpen(true)} 
            onDepositClick={() => setIsDepositOpen(true)}
            onLogout={handleLogout}
            onAuthClick={() => setIsAuthOpen(true)}
          />

          <main className="flex-1 overflow-y-auto custom-scrollbar pb-20 md:pb-0">
            {isMaintenance && !user.isAdmin ? (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center animate-fadeIn">
                <div className="w-24 h-24 bg-red-600/10 rounded-full flex items-center justify-center text-red-500 text-5xl mb-6 shadow-[0_0_50px_rgba(220,38,38,0.2)]">
                  <i className="fa-solid fa-gears"></i>
                </div>
                <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-4">Em <span className="text-red-500">Manutenção</span></h1>
                <p className="text-gray-500 max-w-md font-bold uppercase text-xs tracking-widest leading-relaxed">
                  Estamos atualizando nossos jogos. Voltamos em breve!
                </p>
              </div>
            ) : (
              <Routes>
                <Route path="/" element={<Home updateBalance={updateBalance} user={user} games={games} onAuthOpen={() => setIsAuthOpen(true)} />} />
                <Route path="/history" element={user.isLoggedIn ? <HistoryPage history={user.betHistory} /> : <Navigate to="/" />} />
                <Route path="/promo" element={<TournamentPage user={user} />} />
                <Route path="/vip" element={<VipPage user={user} onClaimReward={claimVipReward} onAuthOpen={() => setIsAuthOpen(true)} />} />
                <Route path="/invite" element={<AffiliatePage user={user} onAuthOpen={() => setIsAuthOpen(true)} />} />
                <Route path="/profile" element={user.isLoggedIn ? <ProfilePage user={user} onUpdateUser={updateUser} onLogout={handleLogout} /> : <Navigate to="/" />} />
                <Route 
                  path="/admin" 
                  element={user.isAdmin && user.isLoggedIn ? (
                    <AdminPanel 
                      games={games} 
                      onUpdateGames={handleUpdateGames} 
                      onUpdateUser={updateUser} 
                      currentUser={user}
                      isMaintenance={isMaintenance}
                      onToggleMaintenance={handleToggleMaintenance}
                      registrationBonus={registrationBonus}
                      onUpdateBonus={handleUpdateBonus}
                      logs={logs}
                      onClearLogs={clearLogs}
                      allUsers={allUsers}
                      onToggleAdmin={handleAdminToggleUser}
                      onAdminUpdateBalance={handleAdminUpdateBalance}
                    />
                  ) : <Navigate to="/" />} 
                />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            )}
          </main>
        </div>

        <BottomNav onDepositClick={() => setIsDepositOpen(true)} onAuthClick={() => setIsAuthOpen(true)} isLoggedIn={user.isLoggedIn} />
        <CasinoAIChat />

        {isAuthOpen && (
          <AuthModal 
            onClose={() => setIsAuthOpen(false)} 
            onLogin={handleLogin} 
            registrationBonus={registrationBonus}
            existingUsers={allUsers}
          />
        )}
        {isDepositOpen && <DepositModal onClose={() => setIsDepositOpen(false)} onSuccess={(amt) => updateBalance(amt, true)} />}
        {isWithdrawOpen && <WithdrawModal userBalance={user.balance} totalDeposited={user.totalDeposited} onClose={() => setIsWithdrawOpen(false)} onSuccess={(amt) => updateBalance(amt, false, { name: 'Saque PIX', type: 'withdraw' })} />}
      </div>
    </Router>
  );
};

export default App;
