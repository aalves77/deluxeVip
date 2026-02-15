
import React, { useState, useEffect } from 'react';
import { WINNERS } from '../constants';
import { Winner } from '../types';

const LiveWinners: React.FC = () => {
  const [winners, setWinners] = useState<Winner[]>(WINNERS);

  useEffect(() => {
    const interval = setInterval(() => {
      const newWinner = {
        id: Math.random().toString(),
        username: `user_${Math.floor(Math.random() * 999)}***`,
        amount: Math.random() * 5000 + 10,
        game: 'Mines',
        time: 'just now'
      };
      setWinners(prev => [newWinner, ...prev.slice(0, 9)]);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col gap-3">
      {winners.map((winner) => (
        <div 
          key={winner.id} 
          className="flex items-center gap-3 p-3 bg-black/40 rounded-xl hover:bg-black/60 transition-colors animate-fadeIn"
        >
          <div className="w-10 h-10 rounded-lg bg-gray-800 flex-shrink-0 flex items-center justify-center">
            <i className="fa-solid fa-trophy text-yellow-500"></i>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold truncate">{winner.username}</p>
            <p className="text-[10px] text-gray-500 truncate">{winner.game} • {winner.time}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-black text-green-500">
                R$ {winner.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LiveWinners;
