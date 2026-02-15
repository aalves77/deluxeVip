
import React from 'react';
import { NavLink } from 'react-router-dom';
import { NAV_LINKS } from '../constants';

interface BottomNavProps {
  onDepositClick: () => void;
  onAuthClick: () => void;
  isLoggedIn: boolean;
}

const BottomNav: React.FC<BottomNavProps> = ({ onDepositClick, onAuthClick, isLoggedIn }) => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#1a1b23] border-t border-gray-800 flex justify-around items-center px-2 py-2">
      {NAV_LINKS.map((link) => {
        if (link.path === '/deposit') {
          return (
            <button
              key={link.path}
              onClick={onDepositClick}
              className="flex flex-col items-center gap-1 transition-colors text-gray-500"
            >
              <div className="text-lg p-2 rounded-full bg-yellow-500 text-black -translate-y-4 shadow-lg scale-125 border-4 border-[#1a1b23]">
                {link.icon}
              </div>
              <span className="text-[10px] font-bold -translate-y-2">{link.label}</span>
            </button>
          );
        }
        
        // Proteção para links que exigem login no mobile
        const isProtected = ['/history', '/profile'].includes(link.path);
        
        if (isProtected && !isLoggedIn) {
          return (
            <button
              key={link.path}
              onClick={onAuthClick}
              className="flex flex-col items-center gap-1 text-gray-500"
            >
              <div className="text-lg p-2 rounded-full">
                {link.icon}
              </div>
              <span className="text-[10px] font-bold">{link.label}</span>
            </button>
          );
        }

        return (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) => `
              flex flex-col items-center gap-1 transition-colors
              ${isActive ? 'text-yellow-500 scale-110' : 'text-gray-500'}
            `}
          >
            <div className="text-lg p-2 rounded-full">
              {link.icon}
            </div>
            <span className="text-[10px] font-bold">{link.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};

export default BottomNav;
