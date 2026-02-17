
import React, { useState, useEffect } from 'react';
import { WINNERS } from '../constants';
import { Winner } from '../types';

const LiveWinners: React.FC = () => {
  const [feedItems, setFeedItems] = useState<any[]>(WINNERS.map(w => ({ ...w, type: 'win' })));

  useEffect(() => {
    const interval = setInterval(() => {
      const isNewPlayer = Math.random() > 0.7;
      const newItem = isNewPlayer ? {
        id: Math.random().toString(),
        username: `user_${Math.floor(Math.random() * 999)}***`,
        type: 'signup',
        time: 'agora mesmo'
      } : {
        id: Math.random().toString(),
        username: `player_${Math.floor(Math.random() * 999)}***`,
        amount: Math.random() * 5000 + 10,
        game: ['Mines', 'Aviator', 'Fortune Tiger', 'Roulette'][Math.floor(Math.random() * 4)],
        type: 'win',
        time: 'agora mesmo'
      };

      setFeedItems(prev => [newItem, ...prev.slice(0, 9)]);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col gap-3">
      {feedItems.map((item) => (
        <div 
          key={item.id} 
          className={`flex items-center gap-3 p-3 rounded-xl hover:bg-black/60 transition-colors animate-fadeIn border border-white/5 ${item.type === 'signup' ? 'bg-blue-500/5 border-blue-500/10' : 'bg-black/40'}`}
        >
          <div className={`w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center ${item.type === 'signup' ? 'bg-blue-600/20' : 'bg-gray-800'}`}>
            <i className={`fa-solid ${item.type === 'signup' ? 'fa-user-plus text-blue-500' : 'fa-trophy text-yellow-500'}`}></i>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold truncate">{item.username}</p>
            <p className="text-[10px] text-gray-500 truncate">
                {item.type === 'signup' ? 'Acabou de se cadastrar' : `${item.game} • ${item.time}`}
            </p>
          </div>
          <div className="text-right">
            {item.type === 'win' ? (
                <p className="text-sm font-black text-green-500">
                    R$ {item.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
            ) : (
                <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-[8px] font-black uppercase rounded">Novo Player</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default LiveWinners;
