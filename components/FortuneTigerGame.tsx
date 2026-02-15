
import React, { useState, useEffect, useRef } from 'react';

interface FortuneTigerGameProps {
  userBalance: number;
  onClose: () => void;
  onUpdateBalance: (amount: number) => void;
}

type Symbol = {
  id: string;
  name: string;
  icon: string;
  color: string;
  multiplier: number;
};

const SYMBOLS: Symbol[] = [
  { id: 'tiger_wild', name: 'Tigre (Wild)', icon: 'fa-cat', color: 'text-orange-500', multiplier: 250 },
  { id: 'ingot_cushion', name: 'Lingote no Pedestal', icon: 'fa-box-open', color: 'text-yellow-500', multiplier: 100 },
  { id: 'frog', name: 'Sapo da Fortuna', icon: 'fa-frog', color: 'text-yellow-600', multiplier: 50 },
  { id: 'lucky_cat', name: 'Gato da Sorte', icon: 'fa-paw', color: 'text-red-400', multiplier: 10 },
  { id: 'drum', name: 'Tambor', icon: 'fa-drum', color: 'text-red-600', multiplier: 5 },
  { id: 'gourd', name: 'Cabaça Vermelha', icon: 'fa-apple-whole', color: 'text-red-700', multiplier: 3 },
  { id: 'scroll', name: 'Pergaminho', icon: 'fa-scroll', color: 'text-orange-400', multiplier: 2 },
];

const FortuneTigerGame: React.FC<FortuneTigerGameProps> = ({ userBalance, onClose, onUpdateBalance }) => {
  const [bet, setBet] = useState(2.00);
  const [reels, setReels] = useState<Symbol[][]>([
    [SYMBOLS[1], SYMBOLS[3], SYMBOLS[1]],
    [SYMBOLS[1], SYMBOLS[2], SYMBOLS[1]],
    [SYMBOLS[4], SYMBOLS[5], SYMBOLS[6]],
  ]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [lastWin, setLastWin] = useState<number | null>(null);
  const [isMuted, setIsMuted] = useState(() => localStorage.getItem('tiger_muted') === 'true');
  const [winningLines, setWinningLines] = useState<number[]>([]);
  const [showNoBalance, setShowNoBalance] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    localStorage.setItem('tiger_muted', String(isMuted));
  }, [isMuted]);

  const initAudio = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  };

  const playSound = (type: 'spin' | 'stop' | 'win' | 'click' | 'error') => {
    if (isMuted) return;
    initAudio();
    const ctx = audioContextRef.current!;
    if (ctx.state === 'suspended') ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    if (type === 'spin') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(350, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.4);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4);
    } else if (type === 'stop') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(180, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    } else if (type === 'win') {
      const now = ctx.currentTime;
      [523.25, 659.25, 783.99].forEach((f, i) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'sine';
        o.frequency.setValueAtTime(f, now + i * 0.1);
        g.gain.setValueAtTime(0.08, now + i * 0.1);
        g.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.4);
        o.connect(g);
        g.connect(ctx.destination);
        o.start(now + i * 0.1);
        o.stop(now + i * 0.1 + 0.4);
      });
      return;
    } else if (type === 'click') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      gain.gain.setValueAtTime(0.03, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
    } else if (type === 'error') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(100, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);
    }

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  };

  const getRandomSymbol = () => {
    const r = Math.random();
    if (r < 0.04) return SYMBOLS[0];
    if (r < 0.12) return SYMBOLS[1];
    if (r < 0.22) return SYMBOLS[2];
    if (r < 0.35) return SYMBOLS[3];
    if (r < 0.55) return SYMBOLS[4];
    if (r < 0.75) return SYMBOLS[5];
    return SYMBOLS[6];
  };

  const handleSpin = () => {
    if (isSpinning) return;
    
    if (userBalance < bet) {
      playSound('error');
      setShowNoBalance(true);
      setTimeout(() => setShowNoBalance(false), 3000);
      return;
    }
    
    setIsSpinning(true);
    setLastWin(null);
    setWinningLines([]);
    onUpdateBalance(-bet);
    playSound('spin');

    const duration = 1800;
    const interval = setInterval(() => {
      setReels([
        [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()],
        [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()],
        [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()],
      ]);
    }, 80);

    setTimeout(() => {
      clearInterval(interval);
      const finalReels = [
        [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()],
        [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()],
        [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()],
      ];
      setReels(finalReels);
      setIsSpinning(false);
      playSound('stop');

      // Simple win check logic
      let winMult = 0;
      const lines = [
        [[0,0],[1,0],[2,0]], [[0,1],[1,1],[2,1]], [[0,2],[1,2],[2,2]],
        [[0,0],[1,1],[2,2]], [[0,2],[1,1],[2,0]]
      ];
      
      lines.forEach(l => {
        const s = l.map(([c,r]) => finalReels[c][r]);
        const nonWild = s.filter(x => x.id !== 'tiger_wild');
        if (nonWild.length === 0 || nonWild.every(x => x.id === nonWild[0].id)) {
          winMult += (nonWild[0] || SYMBOLS[0]).multiplier;
        }
      });

      if (winMult > 0) {
        const totalWin = (winMult / 10) * bet; // Adjusted multiplier for balance
        setLastWin(totalWin);
        onUpdateBalance(totalWin);
        playSound('win');
      }
    }, duration);
  };

  return (
    <div className="fixed inset-0 z-[120] bg-sky-200 flex flex-col overflow-hidden animate-fadeIn select-none font-sans">
      {/* Temple Background Mockup */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
         {/* Sky & Clouds */}
         <div className="absolute inset-0 bg-gradient-to-b from-sky-300 to-white"></div>
         {/* Temple structures (placeholder shapes) */}
         <div className="absolute -left-20 bottom-0 w-96 h-[80%] bg-[#ca8a04]/10 rounded-t-full blur-3xl"></div>
         <div className="absolute -right-20 bottom-0 w-96 h-[80%] bg-[#ca8a04]/10 rounded-t-full blur-3xl"></div>
         <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'url(https://www.transparenttextures.com/patterns/pinstripe.png)' }}></div>
      </div>

      {/* Top Header */}
      <div className="relative z-20 flex justify-between items-center p-4">
        <div className="flex flex-col">
            <h1 className="text-red-600 text-3xl md:text-5xl font-black italic tracking-tighter drop-shadow-[0_2px_0_rgba(255,255,255,1)] leading-none">
              TIGRE <br/> <span className="text-yellow-500">SORTUDO</span>
            </h1>
        </div>
        <button onClick={onClose} className="text-red-700/50 hover:text-red-700">
           <i className="fa-solid fa-circle-xmark text-4xl"></i>
        </button>
      </div>

      {/* Main Game Area */}
      <div className="flex-1 relative z-10 flex items-center justify-center p-2 md:p-8">
        
        {/* Game Cabinet Container */}
        <div className="relative flex flex-col md:flex-row items-center gap-8 w-full max-w-5xl justify-center">
            
            {/* The Slot Grid with Golden Frame */}
            <div className="relative p-1 md:p-2">
                {/* Frame Pillars & Roof */}
                <div className="absolute -top-4 left-0 right-0 h-8 bg-gradient-to-b from-yellow-500 to-yellow-700 rounded-t-xl border-t-2 border-yellow-300 z-10"></div>
                <div className="absolute top-0 -left-4 bottom-0 w-6 bg-gradient-to-r from-yellow-600 via-yellow-400 to-yellow-600 rounded-l-lg border-2 border-yellow-300 shadow-xl z-10">
                    <div className="h-full w-full opacity-20" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 10px, #000 11px)' }}></div>
                </div>
                <div className="absolute top-0 -right-4 bottom-0 w-6 bg-gradient-to-l from-yellow-600 via-yellow-400 to-yellow-600 rounded-r-lg border-2 border-yellow-300 shadow-xl z-10">
                    <div className="h-full w-full opacity-20" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 10px, #000 11px)' }}></div>
                </div>

                {/* Grid Background */}
                <div className="bg-[#fef3c7] p-4 md:p-6 rounded-sm shadow-inner grid grid-cols-3 gap-2 md:gap-4 relative overflow-hidden border-2 border-yellow-800/20">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#d97706 1px, transparent 1px)', backgroundSize: '15px 15px' }}></div>
                    
                    {reels.map((col, cIdx) => (
                        <div key={cIdx} className="flex flex-col gap-2 md:gap-4 z-10">
                            {col.map((sym, rIdx) => (
                                <div key={rIdx} className={`
                                    w-20 h-20 md:w-32 md:h-32 flex items-center justify-center transition-all duration-100
                                    ${isSpinning ? 'scale-90 opacity-40 blur-[1px]' : 'scale-100'}
                                `}>
                                    <i className={`fa-solid ${sym.icon} ${sym.color} text-4xl md:text-6xl drop-shadow-lg`}></i>
                                </div>
                            ))}
                        </div>
                    ))}

                    {/* Insufficient Balance Overlay */}
                    {showNoBalance && (
                      <div className="absolute inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 text-center animate-fadeIn">
                        <div className="bg-red-600 border-2 border-yellow-500 rounded-2xl p-4 shadow-[0_0_30px_rgba(220,38,38,0.5)] animate-bounceIn">
                          <i className="fa-solid fa-triangle-exclamation text-white text-3xl mb-2"></i>
                          <p className="text-white font-black uppercase text-sm italic leading-tight">Saldo Insuficiente!</p>
                          <p className="text-yellow-200 text-[10px] font-bold mt-1 uppercase">Deposite agora para ganhar</p>
                        </div>
                      </div>
                    )}
                </div>
            </div>

            {/* Mascot Character (Tiger) */}
            <div className="hidden lg:block relative w-64 h-80 animate-pulse">
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-12 bg-black/20 blur-xl rounded-full"></div>
                <div className="relative z-10 flex flex-col items-center">
                    {/* Glowing Coin in Paws Effect */}
                    <div className="absolute top-20 w-16 h-16 bg-yellow-400 rounded-full blur-2xl animate-ping opacity-50"></div>
                    <i className="fa-Cat fa-solid text-[12rem] text-orange-500 drop-shadow-[0_10px_20px_rgba(0,0,0,0.3)]"></i>
                    {/* Clothing Detail */}
                    <div className="absolute bottom-10 w-24 h-24 bg-red-700/80 rounded-full border-4 border-yellow-500 -z-10"></div>
                </div>
            </div>
        </div>

        {/* Win Notification Overlay */}
        {lastWin && !isSpinning && (
            <div className="absolute inset-0 z-40 bg-black/40 backdrop-blur-sm flex items-center justify-center animate-fadeIn pointer-events-none">
                <div className="bg-gradient-to-b from-yellow-300 to-yellow-600 p-8 rounded-[3rem] border-8 border-red-800 shadow-2xl text-center animate-bounceIn">
                    <h3 className="text-red-900 text-2xl font-black uppercase tracking-widest mb-1">VITÓRIA!</h3>
                    <p className="text-white text-5xl md:text-7xl font-black italic drop-shadow-xl">R$ {lastWin.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
            </div>
        )}
      </div>

      {/* Control HUD (Bottom Bar) */}
      <div className="relative z-20 bg-gradient-to-b from-red-800 to-red-950 p-4 border-t-4 border-yellow-500 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
         <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Info & Balance */}
            <div className="flex items-center gap-6 text-yellow-500">
                <div className="flex items-center gap-4 text-gray-400">
                    <button className="hover:text-white"><i className="fa-solid fa-gear text-xl"></i></button>
                    <button className="hover:text-white"><i className="fa-solid fa-circle-info text-xl"></i></button>
                    <button onClick={() => setIsMuted(!isMuted)} className="hover:text-white">
                        <i className={`fa-solid ${isMuted ? 'fa-volume-xmark' : 'fa-volume-high'} text-xl`}></i>
                    </button>
                </div>
                <div className="text-left font-bold">
                    <p className="text-[10px] uppercase opacity-60 leading-none">CRÉDITO</p>
                    <p className="text-lg md:text-2xl font-mono text-white">R$ {userBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="text-left font-bold">
                    <p className="text-[10px] uppercase opacity-60 leading-none">APOSTA</p>
                    <p className="text-lg md:text-2xl font-mono text-white">R$ {bet.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
            </div>

            {/* Instruction Text */}
            <div className="hidden lg:block">
                <p className="text-white/50 text-xs font-black uppercase tracking-widest italic animate-pulse">SEGURE ESPAÇO PARA TURBO SPIN</p>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4">
                <button 
                  onClick={() => { playSound('click'); setBet(Math.max(1, bet - 1)); }}
                  className="w-10 h-10 rounded-full border-2 border-yellow-500 text-yellow-500 flex items-center justify-center hover:bg-yellow-500 hover:text-red-900 transition-all"
                >
                    <i className="fa-solid fa-minus"></i>
                </button>
                
                <div className="relative group">
                    <button 
                        onClick={handleSpin}
                        disabled={isSpinning}
                        className={`
                            relative w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-yellow-300 flex flex-col items-center justify-center transition-all shadow-2xl active:scale-90
                            ${isSpinning ? 'bg-gray-800 opacity-50' : 'bg-gradient-to-b from-yellow-300 via-yellow-500 to-yellow-600 shine-effect'}
                        `}
                    >
                        <i className={`fa-solid fa-rotate text-3xl md:text-4xl text-red-950 ${isSpinning ? 'animate-spin' : ''}`}></i>
                        <span className="text-[8px] font-black text-red-950 mt-1">AUTOPLAY</span>
                    </button>
                </div>

                <button 
                  onClick={() => { playSound('click'); setBet(bet + 1); }}
                  className="w-10 h-10 rounded-full border-2 border-yellow-500 text-yellow-500 flex items-center justify-center hover:bg-yellow-500 hover:text-red-900 transition-all"
                >
                    <i className="fa-solid fa-plus"></i>
                </button>
            </div>
         </div>
      </div>

      <div className="p-1 text-center bg-black/40 backdrop-blur-md">
         <p className="text-[9px] text-yellow-600/50 font-bold uppercase tracking-[0.5em]">Fortune Engine v2.0 • Fair Play Certification</p>
      </div>
    </div>
  );
};

export default FortuneTigerGame;
