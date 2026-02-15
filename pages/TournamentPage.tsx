
import React, { useState, useEffect } from 'react';
import { User } from '../types';

interface TournamentPageProps {
  user: User;
}

interface RankingItem {
  id: string;
  username: string;
  points: number;
  prize: number;
}

const TournamentPage: React.FC<TournamentPageProps> = ({ user }) => {
  const [timeLeft, setTimeLeft] = useState({ days: 3, hours: 14, mins: 42, secs: 10 });
  const [ranking, setRanking] = useState<RankingItem[]>([]);

  useEffect(() => {
    // Gerar um ranking fake baseado nos pontos do usuário para ser competitivo
    const competitors = [
      { id: '1', username: 'rei_do_tigre***', points: Math.max(user.tournamentScore * 1.5, 12500), prize: 15000 },
      { id: '2', username: 'lucky_spinner***', points: Math.max(user.tournamentScore * 1.2, 8900), prize: 8000 },
      { id: '3', username: 'zeus_master***', points: Math.max(user.tournamentScore * 1.1, 7200), prize: 5000 },
      { id: '4', username: 'bet_queen***', points: 6100, prize: 3000 },
      { id: '5', username: 'jackpot_hunter***', points: 5400, prize: 2000 },
      { id: '6', username: 'fortune_pro***', points: 4200, prize: 1500 },
      { id: '7', username: 'slot_king***', points: 3800, prize: 1000 },
      { id: '8', username: 'vip_player***', points: 2900, prize: 750 },
      { id: '9', username: 'raio_total***', points: 1500, prize: 500 },
    ];

    // Inserir usuário no ranking
    const userItem: RankingItem = {
      id: 'user',
      username: user.username,
      points: user.tournamentScore,
      prize: 0 // Será calculado na ordenação
    };

    const fullRanking = [...competitors, userItem].sort((a, b) => b.points - a.points);
    
    // Atualizar prêmios fictícios baseados na posição
    const prizePool = [15000, 8000, 5000, 3000, 2000, 1500, 1000, 750, 500, 250];
    const updatedRanking = fullRanking.map((item, index) => ({
      ...item,
      prize: prizePool[index] || 0
    }));

    setRanking(updatedRanking);
  }, [user.tournamentScore, user.username]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.secs > 0) return { ...prev, secs: prev.secs - 1 };
        if (prev.mins > 0) return { ...prev, mins: prev.mins - 1, secs: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, mins: 59, secs: 59 };
        if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, mins: 59, secs: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const userPosition = ranking.findIndex(r => r.id === 'user') + 1;

  return (
    <div className="p-4 md:p-8 animate-fadeIn max-w-6xl mx-auto space-y-8 pb-20">
      {/* Hero Banner do Torneio */}
      <div className="relative bg-gradient-to-br from-[#1e1b4b] to-[#4c1d95] rounded-[3rem] p-8 md:p-12 border border-purple-500/30 shadow-[0_20px_60px_rgba(76,29,149,0.3)] overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-yellow-500/5 blur-[120px] -mr-64 -mt-64"></div>
        <div className="absolute -left-20 bottom-0 opacity-10">
          <i className="fa-solid fa-trophy text-[25rem] text-white"></i>
        </div>

        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 bg-yellow-500 text-black px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-6 shadow-xl">
             <i className="fa-solid fa-fire animate-pulse"></i>
             TORNEIO SEMANAL DE SLOTS
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase leading-tight mb-4 drop-shadow-2xl">
            PRÊMIO TOTAL <br/> <span className="text-yellow-500">R$ 50.000,00</span>
          </h1>
          
          <p className="text-purple-200 text-sm md:text-lg font-bold uppercase tracking-[0.3em] mb-10 max-w-2xl">
            Jogue em qualquer slot e suba no ranking. Cada R$ 1,00 ganho equivale a 10 pontos.
          </p>

          {/* Countdown Timer */}
          <div className="flex gap-4 md:gap-8">
            {[
              { label: 'DIAS', value: timeLeft.days },
              { label: 'HORAS', value: timeLeft.hours },
              { label: 'MINS', value: timeLeft.mins },
              { label: 'SEGS', value: timeLeft.secs }
            ].map((t, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 flex items-center justify-center text-2xl md:text-3xl font-black shadow-lg">
                  {t.value.toString().padStart(2, '0')}
                </div>
                <span className="text-[10px] font-black text-purple-300 mt-2 tracking-widest">{t.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Liderança / Leaderboard */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black italic uppercase text-yellow-500 flex items-center gap-3">
              <i className="fa-solid fa-ranking-star"></i> CLASSIFICAÇÃO ATUAL
            </h3>
            <span className="text-xs text-gray-500 font-bold uppercase">Sincronizado há 2s</span>
          </div>

          <div className="bg-[#1a1b23] rounded-[2.5rem] border border-gray-800 overflow-hidden shadow-2xl">
            <div className="divide-y divide-gray-800">
              {ranking.map((item, index) => (
                <div 
                  key={item.id} 
                  className={`
                    flex items-center gap-4 p-4 md:p-6 transition-all
                    ${item.id === 'user' ? 'bg-yellow-500/10 border-l-4 border-yellow-500' : 'hover:bg-white/5'}
                  `}
                >
                  <div className={`
                    w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center font-black text-lg
                    ${index === 0 ? 'bg-yellow-500 text-black' : index === 1 ? 'bg-gray-300 text-black' : index === 2 ? 'bg-amber-700 text-white' : 'bg-gray-800 text-gray-500'}
                  `}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className={`font-black text-sm md:text-lg uppercase tracking-tighter ${item.id === 'user' ? 'text-yellow-500' : 'text-white'}`}>
                      {item.username} {item.id === 'user' && <span className="text-[10px] ml-2 text-white bg-yellow-600 px-2 py-0.5 rounded-full">VOCÊ</span>}
                    </p>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{item.points.toLocaleString()} PONTOS</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-500 font-black uppercase">PRÊMIO ESTIMADO</p>
                    <p className={`text-sm md:text-lg font-black ${index < 3 ? 'text-green-500' : 'text-gray-400'}`}>
                      R$ {item.prize.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Informativa */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-yellow-500 to-amber-600 rounded-[2.5rem] p-8 text-black shadow-xl">
             <h4 className="font-black text-xl italic uppercase mb-2">SEU STATUS</h4>
             <div className="space-y-4">
                <div className="bg-black/10 p-4 rounded-2xl border border-black/5">
                   <p className="text-[10px] font-black uppercase opacity-60">Sua Posição</p>
                   <p className="text-3xl font-black italic">{userPosition}º LUGAR</p>
                </div>
                <div className="bg-black/10 p-4 rounded-2xl border border-black/5">
                   <p className="text-[10px] font-black uppercase opacity-60">Seus Pontos</p>
                   <p className="text-3xl font-black italic">{user.tournamentScore.toLocaleString()}</p>
                </div>
                <button className="w-full py-4 bg-black text-white font-black rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all uppercase italic text-sm">
                   JOGAR SLOTS AGORA
                </button>
             </div>
          </div>

          <div className="bg-[#1a1b23] border border-gray-800 rounded-[2.5rem] p-8 space-y-4">
             <h4 className="font-black text-lg italic uppercase text-yellow-500">COMO FUNCIONA?</h4>
             <ul className="space-y-4">
                {[
                  { icon: 'fa-gamepad', text: 'Jogue em qualquer jogo da categoria SLOTS.' },
                  { icon: 'fa-bolt', text: 'Ganhe pontos a cada vitória (R$ 1,00 = 10 pts).' },
                  { icon: 'fa-trophy', text: 'Fique entre os 100 primeiros para ganhar.' },
                  { icon: 'fa-money-bill-wave', text: 'Prêmios pagos automaticamente ao fim do torneio.' }
                ].map((item, i) => (
                  <li key={i} className="flex gap-4 items-start">
                    <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center flex-shrink-0 text-yellow-500">
                       <i className={`fa-solid ${item.icon}`}></i>
                    </div>
                    <p className="text-xs text-gray-400 font-medium leading-relaxed">{item.text}</p>
                  </li>
                ))}
             </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TournamentPage;
