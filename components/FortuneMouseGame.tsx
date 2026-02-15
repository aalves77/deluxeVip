
import React, { useState, useEffect, useRef } from 'react';

interface FortuneMouseGameProps {
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
  { id: 'wild', name: 'Mouse (Wild)', icon: 'fa-mouse', color: 'text-yellow-400', multiplier: 30 },
  { id: 'ingot', name: 'Ingot', icon: 'fa-coins', color: 'text-yellow-600', multiplier: 15 },
  { id: 'bag', name: 'Money Bag', icon: 'fa-sack-dollar', color: 'text-red-500', multiplier: 10 },
  { id: 'envelope', name: 'Red Envelope', icon: 'fa-envelope-open-text', color: 'text-red-600', multiplier: 5 },
  { id: 'firecracker', name: 'Firecracker', icon: 'fa-fire', color: 'text-orange-500', multiplier: 3 },
  { id: 'tangerine', name: 'Tangerine', icon: 'fa-apple-whole', color: 'text-orange-400', multiplier: 2 },
];

const FortuneMouseGame: React.FC<FortuneMouseGameProps> = ({ userBalance, onClose, onUpdateBalance }) => {
  const [bet, setBet] = useState(10);
  const [reels, setReels] = useState<Symbol[][]>([
    [SYMBOLS[0], SYMBOLS[1], SYMBOLS[2]],
    [SYMBOLS[1], SYMBOLS[2], SYMBOLS[3]],
    [SYMBOLS[2], SYMBOLS[3], SYMBOLS[4]],
  ]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [lastWin, setLastWin] = useState<number | null>(null);
  const [isMuted, setIsMuted] = useState(() => localStorage.getItem('fortune_muted') === 'true');
  
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    localStorage.setItem('fortune_muted', String(isMuted));
  }, [isMuted]);

  const initAudio = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  };

  const playSound = (type: 'spin' | 'stop' | 'win' | 'click') => {
    if (isMuted) return;
    initAudio();
    const ctx = audioContextRef.current!;
    if (ctx.state === 'suspended') ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    if (type === 'spin') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.5);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } else if (type === 'stop') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } else if (type === 'win') {
      const now = ctx.currentTime;
      [523.25, 659.25, 783.99].forEach((f, i) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'square';
        o.frequency.setValueAtTime(f, now + i * 0.1);
        g.gain.setValueAtTime(0.05, now + i * 0.1);
        g.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.3);
        o.connect(g);
        g.connect(ctx.destination);
        o.start(now + i * 0.1);
        o.stop(now + i * 0.1 + 0.3);
      });
      return;
    } else if (type === 'click') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    }

    osc.connect(gain);
    gain.connect(ctx.destination);
  };

  const getRandomSymbol = () => {
    const r = Math.random();
    if (r < 0.05) return SYMBOLS[0]; // Wild
    if (r < 0.15) return SYMBOLS[1];
    if (r < 0.30) return SYMBOLS[2];
    if (r < 0.50) return SYMBOLS[3];
    if (r < 0.75) return SYMBOLS[4];
    return SYMBOLS[5];
  };

  const checkWins = (currentReels: Symbol[][]) => {
    let totalWinMultiplier = 0;
    const lines = [
      // Horizontal
      [[0, 0], [1, 0], [2, 0]],
      [[0, 1], [1, 1], [2, 1]],
      [[0, 2], [1, 2], [2, 2]],
      // Diagonal
      [[0, 0], [1, 1], [2, 2]],
      [[0, 2], [1, 1], [2, 0]],
    ];

    lines.forEach(line => {
      const sym1 = currentReels[line[0][0]][line[0][1]];
      const sym2 = currentReels[line[1][0]][line[1][1]];
      const sym3 = currentReels[line[2][0]][line[2][1]];

      // Check for match (including Wilds)
      const symbols = [sym1, sym2, sym3];
      const nonWilds = symbols.filter(s => s.id !== 'wild');
      
      let win = false;
      let winningSymbol = sym1;

      if (nonWilds.length === 0) {
        // 3 Wilds
        win = true;
        winningSymbol = SYMBOLS[0];
      } else if (nonWilds.every(s => s.id === nonWilds[0].id)) {
        // All same or combined with wilds
        win = true;
        winningSymbol = nonWilds[0];
      }

      if (win) {
        totalWinMultiplier += winningSymbol.multiplier;
      }
    });

    return totalWinMultiplier * bet;
  };

  const handleSpin = () => {
    if (isSpinning || userBalance < bet) return;
    
    setIsSpinning(true);
    setLastWin(null);
    onUpdateBalance(-bet);
    playSound('spin');

    const spinDuration = 2000;
    const startTime = Date.now();

    const interval = setInterval(() => {
      setReels([
        [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()],
        [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()],
        [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()],
      ]);
      playSound('spin');
    }, 100);

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

      const winAmount = checkWins(finalReels);
      if (winAmount > 0) {
        setLastWin(winAmount);
        onUpdateBalance(winAmount);
        playSound('win');
      }
    }, spinDuration);
  };

  return (
    <div className="fixed inset-0 z-[120] bg-[#450a0a] flex flex-col overflow-hidden animate-fadeIn select-none">
      {/* Top Bar */}
      <div className="bg-[#7f1d1d] border-b border-yellow-600/30 p-4 flex justify-between items-center shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(234,179,8,0.5)]">
            <i className="fa-solid fa-mouse text-red-800 text-xl"></i>
          </div>
          <div>
            <h2 className="font-black text-xl italic text-yellow-500 tracking-tighter">FORTUNE MOUSE</h2>
            <p className="text-[10px] text-yellow-600 font-bold uppercase tracking-widest leading-none">Ratos da Sorte</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsMuted(!isMuted)}
            className="w-10 h-10 rounded-full bg-red-900/50 flex items-center justify-center text-yellow-500"
          >
            <i className={`fa-solid ${isMuted ? 'fa-volume-xmark' : 'fa-volume-high'}`}></i>
          </button>
          <div className="bg-red-950/80 border border-yellow-600/50 rounded-full px-5 py-1.5 flex items-center gap-2">
            <span className="text-yellow-500 font-bold text-xs">R$</span>
            <span className="font-mono font-bold text-white text-lg">
              {userBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <button onClick={onClose} className="text-yellow-500/50 hover:text-yellow-500">
            <i className="fa-solid fa-circle-xmark text-3xl"></i>
          </button>
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 relative">
        {/* Background Oriental elements */}
        <div className="absolute inset-0 opacity-5 pointer-events-none flex items-center justify-center overflow-hidden">
           <i className="fa-solid fa-torii-gate text-[50rem]"></i>
        </div>

        {/* Slot Machine Display */}
        <div className="relative p-2 md:p-4 bg-gradient-to-b from-yellow-600 to-yellow-800 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.8)] border-4 border-yellow-400 max-w-sm w-full">
            <div className="bg-[#1a1b23] rounded-[1.5rem] grid grid-cols-3 gap-1 p-1 md:gap-2 md:p-2 overflow-hidden border-2 border-red-900 shadow-inner relative">
                {/* Paylines Visualization Layer (Simplified) */}
                <div className="absolute inset-0 pointer-events-none flex flex-col justify-around p-4 md:p-8 opacity-20">
                    <div className="h-0.5 w-full bg-yellow-500"></div>
                    <div className="h-0.5 w-full bg-yellow-500"></div>
                    <div className="h-0.5 w-full bg-yellow-500"></div>
                </div>

                {reels.map((col, cIdx) => (
                    <div key={cIdx} className="flex flex-col gap-1 md:gap-2">
                        {col.map((sym, rIdx) => (
                            <div 
                                key={rIdx} 
                                className={`
                                    aspect-square bg-gradient-to-b from-red-900 to-red-950 rounded-xl flex flex-col items-center justify-center p-2 border border-yellow-900/30 transition-all duration-300
                                    ${isSpinning ? 'scale-95 opacity-50 blur-[1px]' : 'scale-100'}
                                `}
                            >
                                <i className={`fa-solid ${sym.icon} ${sym.color} text-3xl md:text-4xl mb-1 filter drop-shadow-[0_2px_5px_rgba(0,0,0,0.5)]`}></i>
                                <span className="text-[8px] text-yellow-600/50 font-bold uppercase tracking-tighter truncate w-full text-center">{sym.name}</span>
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            {/* Mouse Mascot */}
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-yellow-500 p-3 rounded-full border-4 border-red-800 shadow-xl">
               <i className="fa-solid fa-mouse text-red-800 text-3xl animate-bounce"></i>
            </div>
        </div>

        {/* Big Win Display */}
        {lastWin && (
            <div className="mt-8 animate-bounceIn text-center z-10">
                <div className="bg-gradient-to-r from-yellow-400 via-white to-yellow-400 bg-clip-text text-transparent text-5xl md:text-7xl font-black italic tracking-tighter drop-shadow-[0_5px_15px_rgba(234,179,8,0.5)] mb-2 uppercase">
                   BIG WIN!
                </div>
                <div className="text-white text-3xl md:text-4xl font-black font-mono">
                    R$ {lastWin.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
            </div>
        )}
      </div>

      {/* Control Panel */}
      <div className="bg-[#7f1d1d] border-t border-yellow-600/30 p-4 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col justify-center">
              <label className="text-[10px] font-black text-yellow-500 uppercase tracking-[0.3em] mb-2 text-center md:text-left">VALOR DA APOSTA</label>
              <div className="flex items-center gap-3 bg-red-950 p-1.5 rounded-full border border-yellow-600/30 shadow-inner">
                  <button 
                    onClick={() => { playSound('click'); setBet(prev => Math.max(1, prev - 10)); }}
                    className="w-10 h-10 rounded-full bg-red-800 hover:bg-red-700 text-yellow-500 flex items-center justify-center transition-colors"
                  >
                    <i className="fa-solid fa-minus"></i>
                  </button>
                  <div className="flex-1 text-center font-mono font-black text-xl text-white">
                      R$ {bet}
                  </div>
                  <button 
                    onClick={() => { playSound('click'); setBet(prev => prev + 10); }}
                    className="w-10 h-10 rounded-full bg-red-800 hover:bg-red-700 text-yellow-500 flex items-center justify-center transition-colors"
                  >
                    <i className="fa-solid fa-plus"></i>
                  </button>
              </div>
          </div>

          <div className="flex items-center justify-center">
              <button 
                onClick={handleSpin}
                disabled={isSpinning || userBalance < bet}
                className={`
                    group relative w-28 h-28 md:w-36 md:h-36 rounded-full border-8 border-yellow-600/50 flex flex-col items-center justify-center transition-all active:scale-95 shadow-[0_15px_40px_rgba(0,0,0,0.5)]
                    ${isSpinning || userBalance < bet ? 'bg-gray-800 cursor-not-allowed border-gray-700' : 'bg-gradient-to-b from-yellow-400 to-yellow-600 hover:from-yellow-300 hover:to-yellow-500 shine-effect'}
                `}
              >
                  <i className={`fa-solid fa-rotate text-3xl md:text-4xl mb-1 ${isSpinning ? 'animate-spin text-gray-500' : 'text-red-800'}`}></i>
                  <span className={`font-black text-sm md:text-lg ${isSpinning ? 'text-gray-500' : 'text-red-800'}`}>
                      {isSpinning ? 'SORTE...' : 'GIRAR'}
                  </span>
              </button>
          </div>

          <div className="flex flex-col justify-center items-center md:items-end">
              <div className="text-center md:text-right">
                  <p className="text-[10px] font-black text-yellow-500/50 uppercase tracking-widest mb-1">Última Vitória</p>
                  <p className="text-3xl font-black text-white font-mono">
                      R$ {lastWin ? lastWin.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '0,00'}
                  </p>
              </div>
              <div className="flex gap-2 mt-4">
                  {[2, 5, 10].map(m => (
                      <button 
                        key={m} 
                        onClick={() => { playSound('click'); setBet(bet * m); }}
                        className="bg-red-950 hover:bg-red-900 border border-yellow-600/20 px-4 py-1.5 rounded-lg text-xs font-black text-yellow-500 transition-all"
                      >
                          {m}x
                      </button>
                  ))}
              </div>
          </div>
      </div>

      <div className="p-2 text-center bg-red-950 border-t border-yellow-950">
        <p className="text-[8px] text-yellow-700 font-bold tracking-widest uppercase italic">The Year of the Golden Mouse • Prosperity Awaits</p>
      </div>
    </div>
  );
};

export default FortuneMouseGame;
