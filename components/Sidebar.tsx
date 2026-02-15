
import React from 'react';
import { NavLink } from 'react-router-dom';
import { NAV_LINKS, VIP_LEVELS } from '../constants';
import { User } from '../types';

interface SidebarProps {
  isOpen: boolean;
  user: User;
  onWithdrawClick: () => void;
  onDepositClick: () => void;
  onLogout: () => void;
  onAuthClick: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, user, onWithdrawClick, onDepositClick, onLogout, onAuthClick }) => {
  const nextLevelData = VIP_LEVELS.find(l => l.level === user.vipLevel + 1);
  const progress = nextLevelData 
    ? Math.min(100, (user.totalDeposited / nextLevelData.requiredDeposit) * 100)
    : 100;

  return (
    <aside className={`${isOpen ? 'w-64' : 'w-20'} hidden md:flex flex-col bg-[#1a1b23] border-r border-gray-800 transition-all duration-300 ease-in-out`}>
      <div className="flex flex-col gap-2 p-4">
        {NAV_LINKS.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) => `
              flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200
              ${isActive 
                ? 'bg-gradient-to-r from-yellow-500/20 to-transparent text-yellow-500 border-l-4 border-yellow-500' 
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }
            `}
          >
            <span className="text-lg">{link.icon}</span>
            {isOpen && <span className="font-medium">{link.label}</span>}
          </NavLink>
        ))}

        {user.isAdmin && (
          <NavLink
            to="/admin"
            className={({ isActive }) => `
              flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200
              ${isActive 
                ? 'bg-red-600/20 text-red-500 border-l-4 border-red-500' 
                : 'text-red-400/70 hover:bg-red-600/10 hover:text-red-500'
              }
            `}
          >
            <span className="text-lg"><i className="fa-solid fa-screwdriver-wrench"></i></span>
            {isOpen && <span className="font-bold uppercase tracking-widest text-[11px]">Painel Admin</span>}
          </NavLink>
        )}
        
        <button 
          onClick={onWithdrawClick}
          className="flex items-center gap-4 px-4 py-3 rounded-xl text-gray-400 hover:bg-gray-800 hover:text-white transition-all"
        >
          <span className="text-lg"><i className="fa-solid fa-money-bill-transfer"></i></span>
          {isOpen && <span className="font-medium">Saque</span>}
        </button>
      </div>

      <div className="mt-auto p-4 flex flex-col gap-4">
        {isOpen && user.isLoggedIn && !user.isAdmin && (
          <NavLink to="/vip" className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 rounded-2xl p-4 shadow-xl border border-white/5 shine-effect block hover:brightness-125 transition-all">
            <p className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-1">Próximo Nível VIP</p>
            <p className="text-lg font-bold mb-2">VIP {user.vipLevel + 1} Deluxe</p>
            <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-indigo-400 to-purple-400 h-full shadow-[0_0_10px_rgba(129,140,248,0.5)] transition-all duration-1000" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </NavLink>
        )}
        
        {user.isLoggedIn ? (
          <button 
            onClick={onLogout}
            className={`flex items-center gap-4 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors w-full`}
          >
            <i className="fa-solid fa-arrow-right-from-bracket text-lg"></i>
            {isOpen && <span className="font-medium">Sair</span>}
          </button>
        ) : (
          <button 
            onClick={onAuthClick}
            className={`flex items-center gap-4 px-4 py-3 rounded-xl text-yellow-500 hover:bg-yellow-500/10 transition-colors w-full`}
          >
            <i className="fa-solid fa-user text-lg"></i>
            {isOpen && <span className="font-medium uppercase font-black">Entrar</span>}
          </button>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
