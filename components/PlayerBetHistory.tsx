
import React from 'react';
import { BetHistoryItem } from '../types';

interface PlayerBetHistoryProps {
  history: BetHistoryItem[];
}

const PlayerBetHistory: React.FC<PlayerBetHistoryProps> = ({ history }) => {
  const formatTime = (ts: number) => {
    const date = new Date(ts);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 opacity-30 text-center">
        <i className="fa-solid fa-clock-rotate-left text-4xl mb-2"></i>
        <p className="text-xs font-bold uppercase tracking-widest">Nenhuma aposta recente</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {history.map((item) => (
        <div 
          key={item.id} 
          className="flex items-center gap-3 p-3 bg-black/40 rounded-xl hover:bg-black/60 transition-colors border border-white/5"
        >
          <div className={`w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center ${
            item.type === 'win' ? 'bg-green-500/10 text-green-500' : 
            item.type === 'deposit' ? 'bg-blue-500/10 text-blue-500' :
            item.type === 'withdraw' ? 'bg-red-500/10 text-red-500' :
            'bg-gray-500/10 text-gray-500'
          }`}>
            <i className={`fa-solid ${
              item.type === 'win' ? 'fa-arrow-trend-up' : 
              item.type === 'deposit' ? 'fa-plus' :
              item.type === 'withdraw' ? 'fa-minus' :
              'fa-arrow-trend-down'
            }`}></i>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold truncate text-white uppercase tracking-tighter">{item.gameName}</p>
            <p className="text-[10px] text-gray-500 font-bold">{formatTime(item.timestamp)}</p>
          </div>
          <div className="text-right">
            <p className={`text-sm font-black ${
              item.type === 'win' || item.type === 'deposit' ? 'text-green-500' : 'text-red-500'
            }`}>
                {item.type === 'win' || item.type === 'deposit' ? '+' : '-'} R$ {item.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PlayerBetHistory;