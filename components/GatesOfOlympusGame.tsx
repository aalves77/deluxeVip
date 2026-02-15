
import React, { useState, useEffect, useRef } from 'react';

interface GatesOfOlympusGameProps {
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
  { id: 'crown', name: 'Coroa', icon: 'fa-crown', color: 'text-yellow-400', multiplier: 50 },
  { id: 'hourglass', name: 'Ampulheta', icon: 'fa-hourglass-half', color: 'text-yellow-600', multiplier: 25 },
  { id: 'ring', name: 'Anel', icon: 'fa-ring', color: 'text-yellow-500', multiplier: 15 },
  { id: 'cup', name: 'Cálice', icon: 'fa-wine-glass', color: 'text-red-500', multiplier: 12 },
  { id: 'gem_red', name: 'Gema Vermelha', icon: 'fa-gem', color: 'text-red-600', multiplier: 10 },
  { id: 'gem_purple', name: 'Gema Roxa', icon: 'fa-gem', color: 'text-purple-500', multiplier: 8 },
  { id: 'gem_yellow', name: 'Gema Amarela', icon: 'fa-gem', color: 'text-yellow-400', multiplier: 5 },
  { id: 'gem_green', name: 'Gema Verde', icon: 'fa-gem', color: 'text-green-500', multiplier: 4 },
  { id: 'gem_blue', name: 'Gema Azul', icon: 'fa-gem', color: 'text-blue-400', multiplier: 2 },
];

const ROWS = 5;
const COLS = 6;

const GatesOfOlympusGame: React.FC<GatesOfOlympusGameProps> = ({ userBalance, onClose, onUpdateBalance }) => {
  const [bet, setBet] = useState(10.00);
  const [grid, setGrid] = useState<Symbol[][]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [totalWin, setTotalWin] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [isMuted, setIsMuted] = useState(() => localStorage.getItem('olympus_muted') === 'true');
  const [isLightningActive, setIsLightningActive] = useState(false);
  const [winningSymbols, setWinningSymbols] = useState<string[]>([]);
  const [showNoBalance, setShowNoBalance] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    generateInitialGrid();
  }, []);

  useEffect(() => {
    localStorage.setItem('olympus_muted', String(isMuted));
  }, [isMuted]);

  const initAudio = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  };

  const playSound = (type: 'spin' | 'thunder' | 'win' | 'click' | 'tumble' | 'error') => {
    if (isMuted) return;
    initAudio();
    const ctx = audioContextRef.current!;
    if (ctx.state === 'suspended') ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    if (type === 'spin') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(450, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.6);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
    } else if (type === 'thunder') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(50, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
    } else if (type === 'win') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
    } else if (type === 'click') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(700, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
    } else if (type === 'tumble') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
    } else if (type === 'error') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(120, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
    }

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  };

  const generateInitialGrid = () => {
    const newGrid: Symbol[][] = [];
    for (let c = 0; c < COLS; c++) {
      const col: Symbol[] = [];
      for (let r = 0; r < ROWS; r++) {
        col.push(SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]);
      }
      newGrid.push(col);
    }
    setGrid(newGrid);
  };

  const checkWins = (currentGrid: Symbol[][]) => {
    const counts: Record<string, number> = {};
    const locations: Record<string, string[]> = {};

    for (let c = 0; c < COLS; c++) {
      for (let r = 0; r < ROWS; r++) {
        const sym = currentGrid[c][r];
        counts[sym.id] = (counts[sym.id] || 0) + 1;
        locations[sym.id] = [...(locations[sym.id] || []), `${c}-${r}`];
      }
    }

    let winAmount = 0;
    const winningLocs: string[] = [];

    Object.entries(counts).forEach(([id, count]) => {
      if (count >= 8) {
        const symbolData = SYMBOLS.find(s => s.id === id)!;
        winAmount += symbolData.multiplier * (count / 8) * (bet / 10);
        winningLocs.push(...locations[id]);
      }
    });

    return { winAmount, winningLocs };
  };

  const handleSpin = async () => {
    if (isSpinning) return;
    
    if (userBalance < bet) {
      playSound('error');
      setShowNoBalance(true);
      setTimeout(() => setShowNoBalance(false), 3000);
      return;
    }

    setIsSpinning(true);
    setTotalWin(0);
    setMultiplier(1);
    setWinningSymbols([]);
    onUpdateBalance(-bet);
    playSound('spin');

    const spinDuration = 800;
    const interval = setInterval(() => {
      const tempGrid: Symbol[][] = [];
      for (let c = 0; c < COLS; c++) {
        const col: Symbol[] = [];
        for (let r = 0; r < ROWS; r++) {
          col.push(SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]);
        }
        tempGrid.push(col);
      }
      setGrid(tempGrid);
    }, 100);

    setTimeout(() => {
      clearInterval(interval);
      processTumbles();
    }, spinDuration);
  };

  const processTumbles = async () => {
    let currentMultiplier = 1;
    let accumulatedWin = 0;
    let tumbleGrid = [...grid.map(col => [...col])];

    const tumble = async () => {
      const { winAmount, winningLocs } = checkWins(tumbleGrid);
      
      if (winAmount > 0) {
        setWinningSymbols(winningLocs);
        playSound('win');
        
        if (Math.random() > 0.7) {
          setIsLightningActive(true);
          playSound('thunder');
          const addMult = Math.floor(Math.random() * 25) + 2;
          currentMultiplier += addMult;
          setMultiplier(currentMultiplier);
          setTimeout(() => setIsLightningActive(false), 600);
        }

        accumulatedWin += winAmount;
        setTotalWin(accumulatedWin);

        await new Promise(r => setTimeout(r, 600));

        const nextGrid: Symbol[][] = [];
        for (let c = 0; c < COLS; c++) {
          const newCol = tumbleGrid[c].filter((_, r) => !winningLocs.includes(`${c}-${r}`));
          while (newCol.length < ROWS) {
            newCol.unshift(SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]);
          }
          nextGrid.push(newCol);
        }
        tumbleGrid = nextGrid;
        setGrid(nextGrid);
        setWinningSymbols([]);
        playSound('tumble');
        
        await new Promise(r => setTimeout(r, 400));
        await tumble();
      } else {
        if (accumulatedWin > 0) {
          const finalWin = accumulatedWin * currentMultiplier;
          onUpdateBalance(finalWin);
          setTotalWin(finalWin);
        }
        setIsSpinning(false);
      }
    };

    await tumble();
  };

  return (
    <div className="fixed inset-0 z-[120] bg-[#1a0b2e] flex flex-col overflow-hidden animate-fadeIn select-none font-sans">
      {/* Close Button */}
      <button 
        onClick={onClose} 
        className="absolute top-4 right-4 z-[130] text-white/50 hover:text-white transition-colors p-2"
        aria-label="Sair do Jogo"
      >
        <i className="fa-solid fa-circle-xmark text-4xl md:text-5xl drop-shadow-lg"></i>
      </button>

      {/* Background Pillars & Purple Sky */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#2e1065] via-[#1a0b2e] to-black"></div>
        {/* Animated Clouds/Fog */}
        <div className="absolute bottom-0 w-full h-1/2 bg-gradient-to-t from-black to-transparent opacity-50"></div>
        
        {/* Greek Pillars */}
        <div className="absolute inset-y-0 left-0 w-24 md:w-48 flex flex-col justify-around px-2 opacity-30">
          <div className="w-full h-[80%] bg-[#ca8a04]/20 border-x-8 border-yellow-600 shadow-2xl"></div>
        </div>
        <div className="absolute inset-y-0 right-0 w-24 md:w-48 flex flex-col justify-around px-2 opacity-30">
          <div className="w-full h-[80%] bg-[#ca8a04]/20 border-x-8 border-yellow-600 shadow-2xl"></div>
        </div>

        {/* Floating Sparks */}
        <div className="absolute inset-0 opacity-20">
            <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-white rounded-full animate-ping"></div>
            <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-white rounded-full animate-ping delay-700"></div>
            <div className="absolute bottom-1/4 right-1/4 w-1 h-1 bg-white rounded-full animate-ping delay-1000"></div>
        </div>
      </div>

      {/* Header Info */}
      <div className="relative z-20 p-2 md:p-4 flex flex-col items-center">
        <h2 className="text-yellow-500 text-xs md:text-sm font-black uppercase tracking-[0.4em] drop-shadow-md mb-1">
          SYMBOLS PAY ANYWHERE ON THE SCREEN
        </h2>
        <div className="w-48 h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent"></div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative z-10 flex items-center justify-center gap-4 px-4 md:px-20 overflow-hidden">
        
        {/* Left Scroll: BET UI */}
        <div className="hidden lg:flex flex-col items-center gap-2">
           <div className="relative w-40 h-56 bg-[url('https://www.transparenttextures.com/patterns/scroll.png')] bg-[#fef3c7] border-4 border-[#854d0e] rounded-sm p-4 shadow-2xl flex flex-col items-center justify-center text-center">
              <div className="absolute -top-3 left-0 right-0 h-4 bg-[#ca8a04] rounded-full border-b-2 border-yellow-900"></div>
              <div className="absolute -bottom-3 left-0 right-0 h-4 bg-[#ca8a04] rounded-full border-t-2 border-yellow-900"></div>
              
              <h4 className="text-[#854d0e] font-black text-sm uppercase leading-tight">BET</h4>
              <p className="text-[#a16207] font-black text-xs">BRL { (bet * 1.25).toFixed(2) }</p>
              <div className="my-2 h-0.5 w-full bg-[#854d0e]/20"></div>
              <p className="text-[#854d0e] font-black text-[9px] uppercase leading-none">DOUBLE CHANCE TO WIN FEATURE</p>
              
              <div className="mt-3 flex bg-[#1a0b2e] rounded-full p-1 w-full items-center justify-between px-2">
                 <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
                 <span className="text-[8px] font-bold text-white">ON</span>
              </div>
           </div>
        </div>

        {/* Slot Grid Wrapper with Golden Scroll Frame */}
        <div className="relative p-2 md:p-4 group">
            {/* The Frame Ornamentation */}
            <div className="absolute -inset-2 md:-inset-4 border-[6px] md:border-[10px] border-[#ca8a04] rounded-sm z-10 pointer-events-none shadow-[0_0_40px_rgba(202,138,4,0.3)]">
                <div className="absolute -top-6 -left-6 w-12 h-12 bg-yellow-600 rounded-full border-4 border-yellow-300 flex items-center justify-center text-black font-black text-xs">✦</div>
                <div className="absolute -top-6 -right-6 w-12 h-12 bg-yellow-600 rounded-full border-4 border-yellow-300 flex items-center justify-center text-black font-black text-xs">✦</div>
                <div className="absolute -bottom-6 -left-6 w-12 h-12 bg-yellow-600 rounded-full border-4 border-yellow-300 flex items-center justify-center text-black font-black text-xs">✦</div>
                <div className="absolute -bottom-6 -right-6 w-12 h-12 bg-yellow-600 rounded-full border-4 border-yellow-300 flex items-center justify-center text-black font-black text-xs">✦</div>
            </div>

            <div className="bg-[#1a0b2e]/80 backdrop-blur-sm grid grid-cols-6 gap-1 md:gap-3 p-1 md:p-4 overflow-hidden border-2 border-yellow-500/30 relative">
                {grid.map((col, cIdx) => (
                    <div key={cIdx} className="flex flex-col gap-1 md:gap-3">
                        {col.map((sym, rIdx) => (
                            <div 
                                key={rIdx} 
                                className={`
                                    w-12 h-12 md:w-20 md:h-20 lg:w-24 lg:h-24 flex items-center justify-center transition-all duration-200
                                    ${winningSymbols.includes(`${cIdx}-${rIdx}`) ? 'scale-110 brightness-150 rotate-3' : 'scale-100'}
                                    ${isSpinning ? 'opacity-30 blur-[2px]' : 'opacity-100'}
                                `}
                            >
                                <i className={`fa-solid ${sym.icon} ${sym.color} text-2xl md:text-5xl lg:text-6xl drop-shadow-[0_5px_15px_rgba(0,0,0,0.8)]`}></i>
                            </div>
                        ))}
                    </div>
                ))}

                {/* Insufficient Balance Zeus Popup */}
                {showNoBalance && (
                  <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
                     <div className="bg-gradient-to-b from-red-600 to-red-900 border-4 border-yellow-500 p-6 rounded-[2.5rem] shadow-[0_0_50px_rgba(234,179,8,0.4)] animate-bounceIn text-center max-w-[280px]">
                        <div className="w-16 h-16 bg-yellow-500 rounded-full mx-auto flex items-center justify-center mb-4">
                           <i className="fa-solid fa-bolt-lightning text-red-900 text-3xl"></i>
                        </div>
                        <h3 className="text-white font-black uppercase text-xl italic italic leading-none mb-1">Saldo Baixo!</h3>
                        <p className="text-yellow-200 text-xs font-bold uppercase tracking-wider">Deposite e convoque os deuses da fortuna</p>
                     </div>
                  </div>
                )}
            </div>
        </div>

        {/* Zeus Mascot Floating on Right */}
        <div className={`hidden xl:flex relative flex-col items-center transition-all duration-500 ${isLightningActive ? 'scale-110 brightness-200 translate-y-[-20px]' : 'translate-y-0'}`}>
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-32 h-32 bg-yellow-400 blur-3xl opacity-20 animate-pulse"></div>
            <div className="relative group animate-float">
                <i className="fa-solid fa-person-rays text-[16rem] text-blue-100 drop-shadow-[0_0_40px_rgba(255,255,255,0.4)]"></i>
                {/* Floating Multiplier Orb UI */}
                <div className="absolute -bottom-4 right-0 w-24 h-24 bg-gradient-to-br from-yellow-300 to-yellow-600 rounded-full border-4 border-yellow-200 flex items-center justify-center shadow-2xl animate-bounce">
                    <span className="text-[#451a03] font-black text-3xl italic">{multiplier}x</span>
                </div>
            </div>
            
            {/* Mascot Title Badge */}
            <div className="mt-12 bg-gradient-to-b from-[#854d0e] to-[#451a03] px-6 py-2 rounded-lg border-2 border-yellow-500 shadow-xl">
               <h3 className="text-yellow-400 font-black italic tracking-tighter uppercase">VELHO DO RAIO</h3>
            </div>
        </div>

        {/* Big Win Display Overlay */}
        {totalWin > 0 && (
            <div className="absolute inset-0 z-[60] flex items-center justify-center pointer-events-none animate-fadeIn">
                <div className="bg-black/60 backdrop-blur-lg w-full h-full flex items-center justify-center">
                    <div className="bg-gradient-to-b from-yellow-300 via-yellow-500 to-yellow-800 p-8 md:p-12 rounded-[4rem] border-8 border-red-900 shadow-2xl text-center animate-bounceIn">
                        <h3 className="text-red-950 text-2xl md:text-4xl font-black italic uppercase tracking-widest mb-2 drop-shadow-md">GRANDE VITÓRIA</h3>
                        <p className="text-white text-5xl md:text-8xl font-black italic tracking-tighter drop-shadow-2xl">
                          R$ {totalWin.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                    </div>
                </div>
            </div>
        )}
      </div>

      {/* Bottom HUD Bar */}
      <div className="relative z-20 bg-gradient-to-t from-black via-black to-transparent p-4 md:p-8 flex flex-col gap-4">
         <div className="flex flex-col md:flex-row items-center justify-between max-w-7xl mx-auto w-full gap-4">
            
            {/* Info & Balance Controls */}
            <div className="flex items-center gap-8">
                <div className="flex gap-4 text-gray-400">
                    <button className="hover:text-white"><i className="fa-solid fa-gear"></i></button>
                    <button className="hover:text-white"><i className="fa-solid fa-circle-info"></i></button>
                    <button onClick={() => setIsMuted(!isMuted)} className="hover:text-white">
                        <i className={`fa-solid ${isMuted ? 'fa-volume-xmark' : 'fa-volume-high'} text-xl`}></i>
                    </button>
                </div>

                <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex flex-col">
                        <span className="text-yellow-500/60 text-[10px] font-black uppercase tracking-widest leading-none mb-1">CREDIT</span>
                        <span className="text-white font-mono text-lg md:text-xl font-black">BRL {userBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-yellow-500/60 text-[10px] font-black uppercase tracking-widest leading-none mb-1">BET</span>
                        <span className="text-white font-mono text-lg md:text-xl font-black">BRL {bet.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                </div>
            </div>

            {/* Middle Message */}
            <div className="hidden lg:block text-center flex-1 mx-8">
                <p className="text-white text-3xl font-black italic uppercase tracking-tighter animate-pulse drop-shadow-lg">
                   {totalWin > 0 ? `BRL ${totalWin.toFixed(2)}` : 'FAÇA SUA APOSTA!'}
                </p>
            </div>

            {/* Spin Controls */}
            <div className="flex items-center gap-4">
                <button 
                  onClick={() => { playSound('click'); setBet(Math.max(1, bet - 1)); }}
                  className="w-10 h-10 rounded-full border-2 border-yellow-500 text-yellow-500 flex items-center justify-center hover:bg-yellow-500 hover:text-black transition-all"
                >
                    <i className="fa-solid fa-minus"></i>
                </button>

                <div className="relative group">
                    <button 
                        onClick={handleSpin}
                        disabled={isSpinning}
                        className={`
                            relative w-20 h-20 md:w-28 md:h-28 rounded-full border-4 border-white/20 flex items-center justify-center transition-all shadow-2xl active:scale-90
                            ${isSpinning ? 'bg-gray-800 opacity-50' : 'bg-gradient-to-b from-yellow-300 via-yellow-500 to-yellow-600 shine-effect'}
                        `}
                    >
                        <div className="flex flex-col items-center">
                            <i className={`fa-solid fa-rotate text-3xl md:text-5xl text-black ${isSpinning ? 'animate-spin' : ''}`}></i>
                            <span className="text-[8px] font-black text-black mt-1">AUTOPLAY</span>
                        </div>
                    </button>
                </div>

                <button 
                  onClick={() => { playSound('click'); setBet(bet + 1); }}
                  className="w-10 h-10 rounded-full border-2 border-yellow-500 text-yellow-500 flex items-center justify-center hover:bg-yellow-500 hover:text-black transition-all"
                >
                    <i className="fa-solid fa-plus"></i>
                </button>
            </div>
         </div>
      </div>

      {/* Floating Sparkles (CSS only fallback for detail) */}
      <style>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
          100% { transform: translateY(0px); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default GatesOfOlympusGame;
