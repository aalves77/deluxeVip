
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '../types';

interface NavbarProps {
  user: User;
  onMenuClick: () => void;
  onDepositClick: () => void;
  onAuthClick: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onMenuClick, onDepositClick, onAuthClick }) => {
  const navigate = useNavigate();

  return (
    <nav className="sticky top-0 z-50 bg-[#1a1b23] border-b border-gray-800 px-4 py-3 flex items-center justify-between shadow-lg">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="text-gray-400 hover:text-white md:block hidden"
        >
          <i className="fa-solid fa-bars text-xl"></i>
        </button>
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center shadow-inner">
            <span className="text-black font-black text-xl italic">D</span>
          </div>
          <span className="text-white font-bold text-xl tracking-tighter hidden sm:block">
            Deluxe<span className="text-yellow-500">Vip</span>
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {user.isLoggedIn ? (
          <>
            <div className="bg-[#0d0e12] border border-gray-700 rounded-full px-4 py-1.5 flex items-center gap-2">
              <span className="text-yellow-500 font-bold text-sm">R$</span>
              <span className="font-mono text-sm tracking-wide">{user.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              <button 
                onClick={onDepositClick}
                className="bg-yellow-500 hover:bg-yellow-400 text-black rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold transition-colors"
              >
                +
              </button>
            </div>

            <div 
              onClick={() => navigate('/profile')}
              className="flex items-center gap-2 bg-gray-800 rounded-full px-1.5 py-1.5 cursor-pointer hover:bg-gray-700 transition-all border border-white/5 active:scale-95 pr-4"
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black shadow-lg overflow-hidden bg-blue-500">
                {user.profileImage ? (
                  <img src={user.profileImage} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  user.username.charAt(0).toUpperCase()
                )}
              </div>
              <div className="hidden md:block">
                <p className="text-[9px] text-yellow-500 leading-tight uppercase font-black">VIP {user.vipLevel}</p>
                <p className="text-xs font-bold leading-tight text-white">{user.username}</p>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <button 
              onClick={onAuthClick}
              className="px-4 py-2 text-sm font-black text-white hover:text-yellow-500 transition-colors uppercase"
            >
              Entrar
            </button>
            <button 
              onClick={onAuthClick}
              className="px-6 py-2 bg-yellow-500 text-black font-black rounded-xl text-sm hover:scale-105 transition-transform uppercase shadow-lg shadow-yellow-500/20"
            >
              Cadastrar
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
