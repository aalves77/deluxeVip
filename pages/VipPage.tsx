
import React from 'react';
import { User } from '../types';
import { VIP_LEVELS } from '../constants';

interface VipPageProps {
  user: User;
  onClaimReward: (level: number, reward: number) => void;
  // Added onAuthOpen prop to match usage in App.tsx and fix the TypeScript error
  onAuthOpen: () => void;
}

const VipPage: React.FC<VipPageProps> = ({ user, onClaimReward, onAuthOpen }) => {
  const nextLevelData = VIP_LEVELS.find(l => l.level === user.vipLevel + 1);
  const currentLevelData = VIP_LEVELS.find(l => l.level === user.vipLevel) || VIP_LEVELS[0];

  const progress = nextLevelData 
    ? Math.min(100, (user.totalDeposited / nextLevelData.requiredDeposit) * 100)
    : 100;

  return (
    <div className="p-4 md:p-8 animate-fadeIn max-w-6xl mx-auto space-y-8">
      {/* Hero Header VIP */}
      <div className="relative bg-gradient-to-br from-[#1a1b23] to-[#0d0e12] rounded-[3rem] p-8 border border-yellow-500/20 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-500/5 blur-[100px] -mr-48 -mt-48"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          <div className="w-40 h-40 bg-gradient-to-br from-yellow-400 via-amber-600 to-yellow-500 rounded-[2.5rem] flex items-center justify-center shadow-[0_0_50px_rgba(234,179,8,0.3)] animate-float">
            <span className="text-black font-black text-6xl italic">VIP{user.vipLevel}</span>
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase mb-2">CLUB <span className="text-yellow-500">DELUXE</span></h1>
            <p className="text-gray-400 font-bold uppercase tracking-widest mb-6">Eleve sua experiência ao nível máximo</p>
            
            <div className="max-w-md">
              <div className="flex justify-between text-xs font-black uppercase mb-2">
                <span className="text-yellow-500">Nível {user.vipLevel}</span>
                <span className="text-gray-500">{nextLevelData ? `Falta R$ ${(nextLevelData.requiredDeposit - user.totalDeposited).toFixed(2)} para VIP ${nextLevelData.level}` : 'Nível Máximo Atingido'}</span>
              </div>
              <div className="w-full bg-black/40 h-4 rounded-full overflow-hidden border border-white/5">
                <div 
                  className="bg-gradient-to-r from-yellow-600 to-yellow-400 h-full shadow-[0_0_15px_rgba(234,179,8,0.5)] transition-all duration-1000" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Benefícios Atuais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {currentLevelData.benefits.map((benefit, i) => (
          <div key={i} className="bg-[#1a1b23] border border-gray-800 p-6 rounded-3xl flex items-center gap-4 hover:border-yellow-500/30 transition-colors">
            <div className="w-12 h-12 bg-yellow-500/10 rounded-2xl flex items-center justify-center text-yellow-500">
               <i className="fa-solid fa-circle-check"></i>
            </div>
            <span className="font-black text-sm uppercase tracking-tighter">{benefit}</span>
          </div>
        ))}
      </div>

      {/* Lista de Níveis e Prêmios */}
      <div className="space-y-4">
        <h2 className="text-2xl font-black italic uppercase tracking-tighter"><i className="fa-solid fa-gift text-yellow-500 mr-2"></i>RECOMPENSAS DE NÍVEL</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {VIP_LEVELS.filter(l => l.level > 1).map((lvl) => {
            const isUnlocked = user.vipLevel >= lvl.level;
            const isClaimed = user.claimedVipRewards.includes(lvl.level);
            
            return (
              <div 
                key={lvl.level}
                className={`relative p-6 rounded-[2rem] border transition-all duration-300 ${
                  isUnlocked 
                  ? 'bg-gradient-to-br from-yellow-500/20 to-transparent border-yellow-500/50 shadow-xl' 
                  : 'bg-[#1a1b23] border-gray-800 opacity-60'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black ${isUnlocked ? 'bg-yellow-500 text-black' : 'bg-gray-800 text-gray-500'}`}>
                    V{lvl.level}
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-gray-500 uppercase">Prêmio</p>
                    <p className={`text-xl font-black ${isUnlocked ? 'text-white' : 'text-gray-600'}`}>R$ {lvl.reward.toFixed(2)}</p>
                  </div>
                </div>

                <p className="text-xs text-gray-400 mb-6 leading-tight">
                  {isUnlocked ? 'Nível alcançado! Resgate seu prêmio agora.' : `Requer R$ ${lvl.requiredDeposit.toLocaleString()} em depósitos.`}
                </p>

                {isUnlocked ? (
                  isClaimed ? (
                    <div className="w-full py-3 bg-white/5 text-gray-500 rounded-xl text-center font-black text-xs uppercase flex items-center justify-center gap-2">
                      <i className="fa-solid fa-check"></i> RESGATADO
                    </div>
                  ) : (
                    <button 
                      onClick={() => onClaimReward(lvl.level, lvl.reward)}
                      className="w-full py-3 bg-yellow-500 text-black rounded-xl font-black text-xs uppercase hover:scale-105 active:scale-95 transition-all shadow-lg"
                    >
                      RESGATAR AGORA
                    </button>
                  )
                ) : (
                  <div className="w-full py-3 bg-black/20 text-gray-600 rounded-xl text-center font-black text-xs uppercase">
                    <i className="fa-solid fa-lock mr-2"></i> BLOQUEADO
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        @keyframes float {
          0% { transform: translateY(0px) rotate(3deg); }
          50% { transform: translateY(-10px) rotate(5deg); }
          100% { transform: translateY(0px) rotate(3deg); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default VipPage;
