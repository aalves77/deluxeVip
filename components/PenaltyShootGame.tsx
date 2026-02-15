
import React, { useState, useEffect, useRef } from 'react';

interface PenaltyShootGameProps {
  userBalance: number;
  onClose: () => void;
  onUpdateBalance: (amount: number) => void;
}

type GameState = 'waiting' | 'playing' | 'shooting' | 'result';
type TargetSpot = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';

const SPOTS: TargetSpot[] = ['top-left', 'top-right', 'center', 'bottom-left', 'bottom-right'];
const MULTIPLIER_STEPS = [1.92, 3.84, 7.68, 15.36, 30.72];

const PenaltyShootGame: React.FC<PenaltyShootGameProps> = ({ userBalance, onClose, onUpdateBalance }) => {
  const [gameState, setGameState] = useState<GameState>('waiting');
  const [betAmount, setBetAmount] = useState(10);
  const [goalCount, setGoalCount] = useState(0);
  const [lastResult, setLastResult] = useState<'goal' | 'save' | null>(null);
  const [isMuted, setIsMuted] = useState(() => localStorage.getItem('penalty_muted') === 'true');
  const [selectedSpot, setSelectedSpot] = useState<TargetSpot | null>(null);
  const [gkSpot, setGkSpot] = useState<TargetSpot | null>(null);
  const [showGoalBanner, setShowGoalBanner] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  const [showNoBalance, setShowNoBalance] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);

  const playSound = (type: 'kick' | 'goal' | 'save' | 'crowd' | 'click' | 'error') => {
    if (isMuted) return;
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioContextRef.current!;
    if (ctx.state === 'suspended') ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    if (type === 'kick') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.5, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.1);
    } else if (type === 'goal') {
      const now = ctx.currentTime;
      [523, 659, 783].forEach((f, i) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'sine';
        o.frequency.setValueAtTime(f, now + i * 0.05);
        g.gain.setValueAtTime(0.1, now);
        g.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
        o.connect(g); g.connect(ctx.destination);
        o.start(now); o.stop(now + 0.5);
      });
    } else if (type === 'save') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(80, ctx.currentTime);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);
    } else if (type === 'click') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    } else if (type === 'error') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(100, ctx.currentTime);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    }

    if (type !== 'goal') {
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    }
  };

  const currentMultiplier = goalCount === 0 ? 0 : MULTIPLIER_STEPS[Math.min(goalCount - 1, MULTIPLIER_STEPS.length - 1)];
  const nextMultiplier = MULTIPLIER_STEPS[Math.min(goalCount, MULTIPLIER_STEPS.length - 1)];

  const startRound = () => {
    if (userBalance < betAmount) {
      playSound('error');
      setShowNoBalance(true);
      setTimeout(() => setShowNoBalance(false), 3000);
      return;
    }
    
    playSound('click');
    onUpdateBalance(-betAmount);
    setGoalCount(0);
    setGameState('playing');
    setLastResult(null);
    setShowGoalBanner(false);
    setSelectedSpot(null);
    setGkSpot(null);
  };

  const handleShoot = (spot: TargetSpot) => {
    if (gameState !== 'playing' || selectedSpot) return;
    
    setSelectedSpot(spot);
    setGameState('shooting');
    setShowParticles(true);
    playSound('kick');
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 200);

    const gkChoice = SPOTS[Math.floor(Math.random() * SPOTS.length)];
    
    // Pequeno delay para a bola "viajar" antes do goleiro pular
    setTimeout(() => {
        setGkSpot(gkChoice);
    }, 100);

    setTimeout(() => {
      setShowParticles(false);
      if (spot === gkChoice) {
        playSound('save');
        setLastResult('save');
        setGameState('result');
      } else {
        playSound('goal');
        setLastResult('goal');
        setGoalCount(prev => prev + 1);
        setShowGoalBanner(true);
        // Tremer no impacto da rede
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 300);
        
        setTimeout(() => {
          setShowGoalBanner(false);
          setGameState('playing');
          setSelectedSpot(null);
          setGkSpot(null);
        }, 1500);
      }
    }, 700);
  };

  const cashOut = () => {
    if (gameState !== 'playing' || goalCount === 0) return;
    const winAmount = betAmount * currentMultiplier;
    onUpdateBalance(winAmount);
    playSound('click');
    setGameState('waiting');
    setGoalCount(0);
    setLastResult(null);
  };

  const getBallPositionStyle = (spot: TargetSpot | null) => {
    if (!spot) return { transform: 'translate(-50%, 0) scale(1)', bottom: '40px', left: '50%' };
    
    switch (spot) {
      case 'top-left': return { transform: 'translate(-50%, -50%) scale(0.35)', bottom: '85%', left: '15%' };
      case 'top-right': return { transform: 'translate(-50%, -50%) scale(0.35)', bottom: '85%', left: '85%' };
      case 'bottom-left': return { transform: 'translate(-50%, -50%) scale(0.5)', bottom: '30%', left: '15%' };
      case 'bottom-right': return { transform: 'translate(-50%, -50%) scale(0.5)', bottom: '30%', left: '85%' };
      case 'center': return { transform: 'translate(-50%, -50%) scale(0.4)', bottom: '55%', left: '50%' };
      default: return {};
    }
  };

  const getGkAnimationClass = (spot: TargetSpot | null) => {
    if (!spot) return "bottom-0 left-1/2 -translate-x-1/2";
    switch (spot) {
      case 'top-left': return "bottom-[45%] left-[10%] -rotate-[45deg] scale-110";
      case 'top-right': return "bottom-[45%] left-[90%] rotate-[45deg] scale-110";
      case 'bottom-left': return "bottom-[10%] left-[10%] -rotate-[25deg] scale-110";
      case 'bottom-right': return "bottom-[10%] left-[90%] rotate-[25deg] scale-110";
      case 'center': return "bottom-[10%] left-1/2 -translate-x-1/2 scale-110";
      default: return "";
    }
  };

  return (
    <div className={`fixed inset-0 z-[110] bg-[#022c22] flex flex-col overflow-hidden animate-fadeIn select-none font-sans text-white transition-transform duration-100 ${isShaking ? 'translate-y-1 scale-[1.01]' : ''}`}>
      
      {/* Luzes de Estádio Imersivas */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 w-full h-full bg-gradient-to-b from-[#064e3b] via-[#022c22] to-transparent opacity-60"></div>
        <div className="absolute top-10 left-1/4 w-64 h-64 bg-white/5 blur-[120px] rounded-full"></div>
        <div className="absolute top-10 right-1/4 w-64 h-64 bg-white/5 blur-[120px] rounded-full"></div>
      </div>

      {/* Header HUD - Minimalista e Premium */}
      <div className="relative z-50 bg-[#022c22]/90 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex justify-between items-center shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-2xl flex items-center justify-center shadow-[0_0_25px_rgba(234,179,8,0.4)]">
            <i className="fa-solid fa-futbol text-black text-2xl"></i>
          </div>
          <div>
            <h2 className="font-black text-2xl italic tracking-tighter uppercase leading-none">PENALTY <span className="text-yellow-500">PRO</span></h2>
            <p className="text-[10px] text-emerald-400 font-black uppercase tracking-[0.2em] mt-1">Simulação de Elite</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="bg-black/40 border border-white/10 rounded-2xl px-6 py-2 flex flex-col items-center">
             <span className="text-[9px] text-gray-500 font-black uppercase tracking-widest mb-0.5">SALDO</span>
             <span className="font-mono font-black text-xl text-yellow-500">R$ {userBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </div>
          <button onClick={onClose} className="text-white/20 hover:text-white transition-all hover:scale-110">
            <i className="fa-solid fa-circle-xmark text-4xl"></i>
          </button>
        </div>
      </div>

      <div className="flex-1 relative flex overflow-hidden">
        
        {/* Escada de Multiplicadores Progressiva */}
        <div className="hidden lg:flex flex-col justify-center items-center px-10 z-30 gap-4">
           {MULTIPLIER_STEPS.slice().reverse().map((step, idx) => {
             const stepIdx = MULTIPLIER_STEPS.length - 1 - idx;
             const isActive = stepIdx === goalCount - 1;
             const isNext = stepIdx === goalCount;
             return (
               <div 
                 key={idx} 
                 className={`
                   w-28 py-3 rounded-2xl text-center font-black transition-all duration-500 border-2
                   ${isActive ? 'bg-yellow-500 border-yellow-200 text-black scale-110 shadow-[0_0_30px_rgba(234,179,8,0.6)] z-10' : 
                     isNext ? 'bg-emerald-800/40 border-emerald-500/50 text-emerald-300' : 'bg-black/20 border-white/5 text-white/10'}
                 `}
               >
                 {step}x
               </div>
             );
           })}
        </div>

        {/* Campo de Jogo */}
        <div className="flex-1 relative flex items-center justify-center p-4">
          
          {/* Gramado com Perspectiva e Textura */}
          <div className="absolute inset-0 z-0 overflow-hidden">
             <div className="absolute inset-0 bg-[#059669]" style={{ 
               backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.1), rgba(0,0,0,0.1) 60px, transparent 60px, transparent 120px)',
               transform: 'perspective(1000px) rotateX(60deg)',
               transformOrigin: 'bottom'
             }}></div>
             <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/grass.png')]"></div>
          </div>

          {/* Trave Realista */}
          <div className={`relative w-full max-w-5xl aspect-[21/9] rounded-t-3xl border-x-[16px] border-t-[16px] border-white shadow-[0_50px_100px_rgba(0,0,0,0.9)] z-10 transition-all duration-500 ${lastResult === 'goal' ? 'animate-netBulge' : ''}`}>
              
              {/* Rede com Efeito de Malha */}
              <div className="absolute inset-0 bg-white/5" style={{ 
                  backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.2) 1px, transparent 1px)',
                  backgroundSize: '15px 15px'
              }}></div>

              {/* Alvos de Chute Dinâmicos */}
              {gameState === 'playing' && (
                <div className="absolute inset-0 grid grid-cols-3 grid-rows-2 gap-8 p-16 z-30">
                  {SPOTS.map(spot => (
                    <button 
                      key={spot}
                      onClick={() => handleShoot(spot)} 
                      className={`group flex items-center justify-center p-4 ${spot === 'center' ? 'col-start-2 row-start-1 md:row-start-2' : ''}`}
                    >
                      <div className="w-20 h-20 md:w-28 md:h-28 rounded-full border-4 border-white/10 flex items-center justify-center group-hover:border-yellow-500/50 group-hover:bg-yellow-500/10 group-hover:scale-110 transition-all shadow-2xl relative overflow-hidden">
                        <div className="w-6 h-6 bg-yellow-500 rounded-full animate-ping opacity-75"></div>
                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* O Goleiro (Animação de Mergulho) */}
              <div className={`
                  absolute transition-all duration-500 cubic-bezier(0.175, 0.885, 0.32, 1.275) z-20 pointer-events-none
                  ${getGkAnimationClass(gkSpot)}
              `}>
                  <div className="w-28 h-44 md:w-48 md:h-72 flex flex-col items-center">
                      <div className="w-14 h-14 md:w-20 md:h-20 bg-[#fecaca] rounded-full mb-1 border-4 border-black/20 shadow-lg"></div>
                      <div className="w-24 h-36 md:w-40 md:h-56 bg-gradient-to-b from-indigo-600 to-indigo-900 rounded-t-[3rem] border-x-[10px] border-t-[10px] border-black/10 relative shadow-2xl">
                          <div className="absolute -left-12 top-6 w-12 h-28 md:w-16 md:h-44 bg-indigo-500 rounded-full origin-top rotate-[25deg] border-l-4 border-black/5"></div>
                          <div className="absolute -right-12 top-6 w-12 h-28 md:w-16 md:h-44 bg-indigo-500 rounded-full origin-top -rotate-[25deg] border-r-4 border-black/5"></div>
                      </div>
                  </div>
              </div>

              {/* A BOLA - Física e Trajetória */}
              <div 
                className={`
                  absolute transition-all duration-[700ms] cubic-bezier(0.25, 0.1, 0.25, 1) z-40
                `}
                style={getBallPositionStyle(selectedSpot)}
              >
                 <div className="relative">
                    <i className="fa-futbol fa-solid text-white text-6xl md:text-8xl drop-shadow-[0_20px_30px_rgba(0,0,0,0.6)] animate-ballSpin"></i>
                    {/* Partículas de Grama no Chute */}
                    {showParticles && (
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none">
                            {[1,2,3,4,5].map(i => (
                                <div key={i} className={`absolute w-2 h-2 bg-emerald-900 rounded-sm animate-grassParticle opacity-0`} style={{ animationDelay: `${i * 0.05}s`, left: `${Math.random()*100}%`, top: `${Math.random()*100}%` }}></div>
                            ))}
                        </div>
                    )}
                 </div>
              </div>
              
              {/* Sombra Dinâmica da Bola */}
              {!selectedSpot && (
                 <div className="absolute bottom-[20px] left-1/2 -translate-x-1/2 w-20 h-4 bg-black/40 blur-lg rounded-full z-0 transition-opacity duration-300"></div>
              )}

              {/* Banner de Celebração GOOOL! */}
              {showGoalBanner && (
                <div className="absolute inset-0 z-[60] flex items-center justify-center animate-bounceIn pointer-events-none">
                   <div className="text-center relative">
                      <div className="absolute inset-0 bg-yellow-500/20 blur-[150px] rounded-full scale-150"></div>
                      <h1 className="text-8xl md:text-[14rem] font-black italic text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-amber-600 drop-shadow-[0_10px_40px_rgba(0,0,0,0.5)] uppercase -rotate-6 tracking-tighter">GOOOL!</h1>
                      <div className="mt-[-3rem] flex items-center justify-center gap-4">
                         <div className="h-0.5 w-12 bg-white/20"></div>
                         <p className="text-white text-3xl font-black uppercase tracking-widest italic">{nextMultiplier}x PRÓXIMO</p>
                         <div className="h-0.5 w-12 bg-white/20"></div>
                      </div>
                   </div>
                </div>
              )}
          </div>
        </div>
      </div>

      {/* Painel de Controle - Sofisticado */}
      <div className="relative z-50 bg-[#022c22]/95 border-t border-white/5 p-6 md:p-10 backdrop-blur-3xl">
         {/* Internal Insufficient Balance Toast */}
         {showNoBalance && (
            <div className="absolute -top-16 left-1/2 -translate-x-1/2 z-50 animate-bounceIn">
               <div className="bg-red-600 border border-yellow-500 rounded-xl px-6 py-2 shadow-2xl flex items-center gap-3">
                  <i className="fa-solid fa-triangle-exclamation text-white"></i>
                  <span className="text-white font-black uppercase text-[10px] tracking-widest">Saldo Insuficiente! Deposite para jogar.</span>
               </div>
            </div>
         )}

         <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
            
            {/* Controles de Aposta */}
            <div className="flex flex-col gap-3 w-full md:w-auto">
               <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">VALOR DA APOSTA</span>
               <div className="flex items-center gap-4 bg-black/40 p-2 rounded-3xl border border-white/10 shadow-inner">
                  <button 
                    onClick={() => { playSound('click'); setBetAmount(Math.max(1, betAmount - 10)); }}
                    disabled={gameState !== 'waiting' && gameState !== 'playing'}
                    className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center hover:bg-white/10 disabled:opacity-30 transition-all active:scale-90"
                  >
                    <i className="fa-solid fa-minus text-gray-400"></i>
                  </button>
                  <div className="px-8 text-center font-mono font-black text-3xl text-white min-w-[160px]">
                    <span className="text-yellow-500 mr-2 text-xl">R$</span>{betAmount}
                  </div>
                  <button 
                    onClick={() => { playSound('click'); setBetAmount(betAmount + 10); }}
                    disabled={gameState !== 'waiting' && gameState !== 'playing'}
                    className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center hover:bg-white/10 disabled:opacity-30 transition-all active:scale-90"
                  >
                    <i className="fa-solid fa-plus text-gray-400"></i>
                  </button>
               </div>
            </div>

            {/* Botão de Ação Central */}
            <div className="flex-1 flex justify-center">
               {gameState === 'waiting' ? (
                  <button 
                    onClick={startRound}
                    className="group relative w-full md:w-80 h-24 bg-gradient-to-b from-yellow-300 to-amber-600 text-black font-black text-3xl rounded-[2.5rem] shadow-[0_15px_45px_rgba(234,179,8,0.3)] hover:scale-105 active:scale-95 transition-all overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 skew-x-12"></div>
                    COMEÇAR
                  </button>
               ) : (
                  <div className="flex flex-col items-center bg-black/20 px-10 py-4 rounded-3xl border border-white/5">
                     <div className="text-yellow-500 font-black text-5xl italic leading-none">{nextMultiplier}x</div>
                     <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] mt-2">PRÓXIMO PRÊMIO</p>
                  </div>
               )}
            </div>

            {/* Cashout / Status Final */}
            <div className="w-full md:w-auto">
               {gameState === 'result' && lastResult === 'save' ? (
                  <button 
                    onClick={startRound}
                    className="w-full h-24 bg-red-600 text-white font-black text-xl rounded-[2.5rem] shadow-[0_15px_45px_rgba(220,38,38,0.3)] animate-pulse uppercase"
                  >
                    TENTAR NOVAMENTE
                  </button>
               ) : (
                  <button 
                    onClick={cashOut}
                    disabled={goalCount === 0 || gameState === 'shooting'}
                    className={`
                      w-full md:w-72 h-24 rounded-[2.5rem] font-black text-2xl flex flex-col items-center justify-center transition-all
                      ${goalCount > 0 ? 'bg-green-600 text-white shadow-[0_15px_45px_rgba(22,163,74,0.3)] hover:scale-105 active:scale-95' : 'bg-white/5 text-white/10 border border-white/5'}
                    `}
                  >
                    <span>SACAR</span>
                    {goalCount > 0 && <span className="text-xs font-bold opacity-70 mt-1 uppercase tracking-widest">R$ {(betAmount * currentMultiplier).toFixed(2)}</span>}
                  </button>
               )}
            </div>

         </div>
      </div>

      <style>{`
        @keyframes ballSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(1080deg); }
        }
        .animate-ballSpin {
          animation: ballSpin 0.7s cubic-bezier(0.25, 0.1, 0.25, 1) forwards;
        }
        @keyframes grassParticle {
          0% { transform: translate(0, 0) scale(1); opacity: 1; }
          100% { transform: translate(calc(Math.random() * 100px - 50px), -100px) scale(0); opacity: 0; }
        }
        .animate-grassParticle {
          animation: grassParticle 0.5s ease-out forwards;
        }
        @keyframes netBulge {
            0% { transform: scale(1); }
            50% { transform: scale(1.02); }
            100% { transform: scale(1); }
        }
        .animate-netBulge {
            animation: netBulge 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default PenaltyShootGame;
