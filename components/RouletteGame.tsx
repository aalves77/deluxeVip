
import React, { useState, useEffect, useRef } from 'react';

interface RouletteGameProps {
  userBalance: number;
  onClose: () => void;
  onUpdateBalance: (amount: number) => void;
}

const WHEEL_NUMBERS = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 
  5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
];

const RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];

// Organização dos números para o tabuleiro (Padrão 3x12)
// Fileira 1 (Topo): 3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36
// Fileira 2 (Meio): 2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35
// Fileira 3 (Baixo): 1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34
const BOARD_ROWS = [
  [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36],
  [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35],
  [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34]
];

type BetType = 'number' | 'color-red' | 'color-black' | 'even' | 'odd' | 'low' | 'high' | 'dozen1' | 'dozen2' | 'dozen3';

interface PlacedBet {
  type: BetType;
  value?: number;
  amount: number;
}

const RouletteGame: React.FC<RouletteGameProps> = ({ userBalance, onClose, onUpdateBalance }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [placedBets, setPlacedBets] = useState<PlacedBet[]>([]);
  const [selectedChipValue, setSelectedChipValue] = useState(10);
  const [winningNumber, setWinningNumber] = useState<number | null>(null);
  const [lastResults, setLastResults] = useState<number[]>([]);
  const [isMuted, setIsMuted] = useState(() => localStorage.getItem('roulette_muted') === 'true');
  
  const audioContextRef = useRef<AudioContext | null>(null);

  const initAudio = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  };

  const playSound = (type: 'chip' | 'spin' | 'win' | 'lose' | 'click') => {
    if (isMuted) return;
    initAudio();
    const ctx = audioContextRef.current!;
    if (ctx.state === 'suspended') ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    if (type === 'chip') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    } else if (type === 'win') {
      const now = ctx.currentTime;
      [523, 659, 783].forEach((f, i) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'sine';
        o.frequency.setValueAtTime(f, now + i * 0.1);
        g.gain.setValueAtTime(0.1, now);
        g.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
        o.connect(g); g.connect(ctx.destination);
        o.start(now); o.stop(now + 0.5);
      });
      return;
    }

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  };

  const placeBet = (type: BetType, value?: number) => {
    if (isSpinning) return;
    if (userBalance < selectedChipValue) return alert("Saldo insuficiente!");

    playSound('chip');
    onUpdateBalance(-selectedChipValue);
    
    setPlacedBets(prev => {
      const existing = prev.find(b => b.type === type && b.value === value);
      if (existing) {
        return prev.map(b => (b.type === type && b.value === value) ? { ...b, amount: b.amount + selectedChipValue } : b);
      }
      return [...prev, { type, value, amount: selectedChipValue }];
    });
  };

  const clearBets = () => {
    if (isSpinning) return;
    const totalRefund = placedBets.reduce((sum, bet) => sum + bet.amount, 0);
    onUpdateBalance(totalRefund);
    setPlacedBets([]);
  };

  const handleSpin = () => {
    if (isSpinning || placedBets.length === 0) return;

    setIsSpinning(true);
    setWinningNumber(null);
    playSound('click');

    const resultIndex = Math.floor(Math.random() * WHEEL_NUMBERS.length);
    const resultNumber = WHEEL_NUMBERS[resultIndex];
    
    const segmentAngle = 360 / 37;
    const extraRounds = 8 + Math.floor(Math.random() * 4);
    const targetRotation = wheelRotation + (extraRounds * 360) + (resultIndex * segmentAngle);
    
    setWheelRotation(targetRotation);

    setTimeout(() => {
      setIsSpinning(false);
      setWinningNumber(resultNumber);
      setLastResults(prev => [resultNumber, ...prev].slice(0, 10));
      calculatePayout(resultNumber);
    }, 4000);
  };

  const calculatePayout = (winningNum: number) => {
    let totalPayout = 0;
    const isRed = RED_NUMBERS.includes(winningNum);
    const isEven = winningNum !== 0 && winningNum % 2 === 0;
    const isOdd = winningNum !== 0 && winningNum % 2 !== 0;

    placedBets.forEach(bet => {
      let win = false;
      let mult = 1;

      if (bet.type === 'number' && bet.value === winningNum) { win = true; mult = 36; }
      else if (bet.type === 'color-red' && isRed) { win = true; mult = 2; }
      else if (bet.type === 'color-black' && !isRed && winningNum !== 0) { win = true; mult = 2; }
      else if (bet.type === 'even' && isEven) { win = true; mult = 2; }
      else if (bet.type === 'odd' && isOdd) { win = true; mult = 2; }
      else if (bet.type === 'low' && winningNum >= 1 && winningNum <= 18) { win = true; mult = 2; }
      else if (bet.type === 'high' && winningNum >= 19 && winningNum <= 36) { win = true; mult = 2; }
      else if (bet.type === 'dozen1' && winningNum >= 1 && winningNum <= 12) { win = true; mult = 3; }
      else if (bet.type === 'dozen2' && winningNum >= 13 && winningNum <= 24) { win = true; mult = 3; }
      else if (bet.type === 'dozen3' && winningNum >= 25 && winningNum <= 36) { win = true; mult = 3; }

      if (win) {
        totalPayout += bet.amount * mult;
      }
    });

    if (totalPayout > 0) {
      playSound('win');
      onUpdateBalance(totalPayout);
    }
    setPlacedBets([]);
  };

  const getNumberColor = (num: number) => {
    if (num === 0) return 'bg-green-600';
    return RED_NUMBERS.includes(num) ? 'bg-red-600' : 'bg-zinc-900';
  };

  return (
    <div className="fixed inset-0 z-[110] bg-[#0d0e12] flex flex-col overflow-hidden animate-fadeIn select-none font-sans text-white">
      {/* Header Premium */}
      <div className="bg-[#2c1810] border-b-4 border-[#1a0f0a] px-4 md:px-6 py-3 flex justify-between items-center shadow-2xl z-[120]">
        <div className="flex items-center gap-3 md:gap-4">
           <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-full flex items-center justify-center shadow-xl border-2 border-yellow-200/20">
              <i className="fa-solid fa-clover text-black text-xl md:text-2xl"></i>
           </div>
           <div>
              <h2 className="font-black text-lg md:text-2xl italic tracking-tighter uppercase leading-none text-yellow-500">ROULETTE <span className="text-white">DELUXE</span></h2>
              <p className="text-[8px] md:text-[10px] text-yellow-600/70 font-black uppercase tracking-widest mt-1">Status: {isSpinning ? 'GIRANDO...' : 'FAÇA SUA APOSTA'}</p>
           </div>
        </div>

        <div className="flex items-center gap-2 md:gap-6">
           <div className="hidden sm:flex gap-1">
              {lastResults.map((res, i) => (
                <div key={i} className={`w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold border border-white/10 ${getNumberColor(res)}`}>
                  {res}
                </div>
              ))}
           </div>
           <div className="bg-black/40 border border-white/10 rounded-2xl px-3 md:px-6 py-1.5 flex flex-col items-center">
              <span className="text-[8px] text-gray-500 font-black uppercase tracking-widest">SALDO</span>
              <span className="font-mono font-black text-sm md:text-xl text-yellow-500">R$ {userBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
           </div>
           <button onClick={onClose} className="text-white/20 hover:text-white transition-all hover:scale-110">
              <i className="fa-solid fa-circle-xmark text-3xl md:text-4xl"></i>
           </button>
        </div>
      </div>

      <div className="flex-1 relative flex flex-col lg:flex-row p-2 md:p-6 gap-2 md:gap-8 items-center justify-center overflow-y-auto custom-scrollbar">
         
         {/* Área da Roda */}
         <div className="w-full lg:flex-1 flex items-center justify-center relative py-4 lg:py-0">
            <div className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-[450px] md:h-[450px]">
                {/* Aro Externo de Madeira */}
                <div className="absolute inset-0 bg-[#2c1810] rounded-full border-[12px] md:border-[20px] border-[#3d2419] shadow-[0_30px_60px_rgba(0,0,0,0.9)]"></div>
                
                {/* Disco dos Números */}
                <div 
                  className="absolute inset-4 md:inset-8 rounded-full border-4 md:border-8 border-[#ca8a04] transition-transform duration-[4000ms] cubic-bezier(0.1, 0, 0.1, 1)"
                  style={{ transform: `rotate(-${wheelRotation}deg)` }}
                >
                    {WHEEL_NUMBERS.map((num, i) => {
                      const angle = (360 / 37) * i;
                      return (
                        <div 
                          key={i} 
                          className="absolute top-0 left-1/2 -translate-x-1/2 w-6 md:w-10 h-full origin-bottom"
                          style={{ transform: `rotate(${angle}deg)` }}
                        >
                           <div className={`mt-1 md:mt-2 w-full text-center text-[8px] md:text-[10px] font-black ${getNumberColor(num)} py-0.5 md:py-1 rounded-sm border border-white/5`}>
                              {num}
                           </div>
                        </div>
                      );
                    })}
                </div>

                {/* Centro Decorativo */}
                <div className="absolute inset-0 m-auto w-24 h-24 md:w-40 md:h-40 bg-gradient-to-br from-yellow-400 to-amber-800 rounded-full border-[6px] md:border-[12px] border-[#1a0f0a] shadow-inner flex items-center justify-center">
                   <div className="w-4 h-4 md:w-6 md:h-6 bg-white rounded-full shadow-[0_0_25px_rgba(255,255,255,1)] animate-pulse"></div>
                </div>

                {/* Marcador de Topo */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 md:-translate-y-6 text-yellow-500 z-10 drop-shadow-[0_0_15px_rgba(234,179,8,1)]">
                   <i className="fa-solid fa-caret-down text-4xl md:text-6xl"></i>
                </div>
            </div>

            {winningNumber !== null && !isSpinning && (
              <div className="absolute inset-0 flex items-center justify-center z-[130] animate-bounceIn pointer-events-none">
                 <div className={`w-24 h-24 md:w-40 md:h-40 rounded-full flex flex-col items-center justify-center border-8 border-yellow-400 shadow-[0_0_80px_rgba(234,179,8,0.8)] ${getNumberColor(winningNumber)}`}>
                    <span className="text-3xl md:text-6xl font-black">{winningNumber}</span>
                    <span className="text-[8px] md:text-[12px] font-black uppercase mt-1 tracking-widest">GANHADOR</span>
                 </div>
              </div>
            )}
         </div>

         {/* Tabuleiro de Apostas Proporcional */}
         <div className="w-full lg:w-auto bg-[#064e3b] p-3 md:p-8 rounded-[1.5rem] md:rounded-[3rem] border-[8px] md:border-[16px] border-[#2c1810] shadow-2xl flex flex-col gap-2 md:gap-4 overflow-x-auto no-scrollbar">
            
            <div className="flex min-w-[500px] md:min-w-[800px]">
                {/* Coluna do ZERO */}
                <div className="w-12 md:w-20 pr-1 md:pr-2">
                    <button 
                    onClick={() => placeBet('number', 0)}
                    className="w-full h-full bg-green-600 rounded-lg md:rounded-xl font-black text-xl md:text-3xl hover:brightness-110 active:scale-95 transition-all relative flex items-center justify-center border border-white/10"
                    >
                    0
                    {placedBets.find(b => b.type === 'number' && b.value === 0) && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                            <div className="bg-yellow-400 text-black text-[9px] md:text-[12px] px-2 py-1 rounded-full border-2 border-black animate-bounceIn font-black">
                                {placedBets.find(b => b.type === 'number' && b.value === 0)?.amount}
                            </div>
                        </div>
                    )}
                    </button>
                </div>

                {/* Grade Principal de Números (3x12) */}
                <div className="flex-1 flex flex-col gap-1">
                    {BOARD_ROWS.map((row, rIdx) => (
                        <div key={rIdx} className="flex gap-1">
                            {row.map(num => (
                                <button 
                                    key={num}
                                    onClick={() => placeBet('number', num)}
                                    className={`
                                        flex-1 h-10 md:h-16 rounded-md md:rounded-lg flex items-center justify-center font-black text-sm md:text-xl transition-all relative overflow-hidden
                                        ${getNumberColor(num)} hover:brightness-125 border border-white/5
                                    `}
                                >
                                    {num}
                                    {placedBets.find(b => b.type === 'number' && b.value === num) && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                            <div className="bg-yellow-400 text-black text-[8px] md:text-[10px] w-5 h-5 md:w-7 md:h-7 rounded-full flex items-center justify-center border-2 border-black animate-bounceIn font-black">
                                                {placedBets.find(b => b.type === 'number' && b.value === num)?.amount}
                                            </div>
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            {/* Apostas de Dúzia (12) */}
            <div className="ml-12 md:ml-20 flex gap-2">
               <button onClick={() => placeBet('dozen1')} className="flex-1 py-2 md:py-3 bg-white/5 border border-white/10 rounded-lg md:rounded-xl text-[10px] md:text-xs font-black hover:bg-white/10 uppercase relative transition-colors">
                  1st 12
                  {placedBets.find(b => b.type === 'dozen1') && <div className="absolute -top-2 -right-2 bg-yellow-400 text-black w-6 h-6 rounded-full flex items-center justify-center text-[10px] border-2 border-black">{placedBets.find(b => b.type === 'dozen1')?.amount}</div>}
               </button>
               <button onClick={() => placeBet('dozen2')} className="flex-1 py-2 md:py-3 bg-white/5 border border-white/10 rounded-lg md:rounded-xl text-[10px] md:text-xs font-black hover:bg-white/10 uppercase relative transition-colors">
                  2nd 12
                  {placedBets.find(b => b.type === 'dozen2') && <div className="absolute -top-2 -right-2 bg-yellow-400 text-black w-6 h-6 rounded-full flex items-center justify-center text-[10px] border-2 border-black">{placedBets.find(b => b.type === 'dozen2')?.amount}</div>}
               </button>
               <button onClick={() => placeBet('dozen3')} className="flex-1 py-2 md:py-3 bg-white/5 border border-white/10 rounded-lg md:rounded-xl text-[10px] md:text-xs font-black hover:bg-white/10 uppercase relative transition-colors">
                  3rd 12
                  {placedBets.find(b => b.type === 'dozen3') && <div className="absolute -top-2 -right-2 bg-yellow-400 text-black w-6 h-6 rounded-full flex items-center justify-center text-[10px] border-2 border-black">{placedBets.find(b => b.type === 'dozen3')?.amount}</div>}
               </button>
            </div>

            {/* Apostas Externas (1-18, Par/Impar, Cor) */}
            <div className="ml-12 md:ml-20 grid grid-cols-6 gap-2">
               <button onClick={() => placeBet('low')} className="bg-white/5 border border-white/10 py-2 md:py-3 rounded-lg md:rounded-xl text-[8px] md:text-[10px] font-black hover:bg-white/10 uppercase transition-colors">1-18</button>
               <button onClick={() => placeBet('even')} className="bg-white/5 border border-white/10 py-2 md:py-3 rounded-lg md:rounded-xl text-[8px] md:text-[10px] font-black hover:bg-white/10 uppercase transition-colors">Par</button>
               <button onClick={() => placeBet('color-red')} className="bg-red-600 py-2 md:py-3 rounded-lg md:rounded-xl text-[8px] md:text-[10px] font-black hover:brightness-110 uppercase border-2 border-red-400/20 shadow-lg">Vermelho</button>
               <button onClick={() => placeBet('color-black')} className="bg-zinc-900 py-2 md:py-3 rounded-lg md:rounded-xl text-[8px] md:text-[10px] font-black hover:brightness-110 uppercase border-2 border-white/10 shadow-lg">Preto</button>
               <button onClick={() => placeBet('odd')} className="bg-white/5 border border-white/10 py-2 md:py-3 rounded-lg md:rounded-xl text-[8px] md:text-[10px] font-black hover:bg-white/10 uppercase transition-colors">Ímpar</button>
               <button onClick={() => placeBet('high')} className="bg-white/5 border border-white/10 py-2 md:py-3 rounded-lg md:rounded-xl text-[8px] md:text-[10px] font-black hover:bg-white/10 uppercase transition-colors">19-36</button>
            </div>
         </div>
      </div>

      {/* Painel de Controle Inferior */}
      <div className="bg-[#1a0f0a] border-t-4 border-[#2c1810] p-4 md:p-8 shadow-2xl z-[120]">
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 md:gap-8">
            
            {/* Seleção de Fichas */}
            <div className="flex gap-2 md:gap-4 overflow-x-auto no-scrollbar py-2">
               {[1, 5, 10, 50, 100, 500].map(val => (
                 <button 
                  key={val}
                  onClick={() => setSelectedChipValue(val)}
                  className={`
                    w-12 h-12 md:w-16 md:h-16 rounded-full border-[3px] md:border-[5px] flex items-center justify-center font-black text-xs md:text-sm transition-all active:scale-90 shadow-[0_5px_15px_rgba(0,0,0,0.5)] relative
                    ${selectedChipValue === val ? 'scale-110 -translate-y-2 border-white' : 'border-black/40 opacity-70'}
                    ${val === 1 ? 'bg-blue-600' : val === 5 ? 'bg-red-600' : val === 10 ? 'bg-green-600' : val === 50 ? 'bg-purple-600' : val === 100 ? 'bg-zinc-800' : 'bg-yellow-600'}
                  `}
                 >
                   {val}
                   {selectedChipValue === val && <div className="absolute inset-0 rounded-full border-2 border-white/30 animate-ping"></div>}
                 </button>
               ))}
            </div>

            {/* Ações Centrais */}
            <div className="flex items-center gap-2 md:gap-4 w-full md:w-auto">
               <button 
                onClick={clearBets}
                disabled={isSpinning || placedBets.length === 0}
                className="flex-1 md:w-32 py-3 md:py-5 bg-zinc-800 rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-widest disabled:opacity-30 transition-all hover:bg-zinc-700 active:scale-95"
               >
                 Limpar
               </button>
               <button 
                onClick={handleSpin}
                disabled={isSpinning || placedBets.length === 0}
                className={`
                  flex-[2] md:w-80 py-3 md:py-5 rounded-xl md:rounded-2xl font-black text-sm md:text-2xl italic uppercase tracking-tighter transition-all shadow-2xl active:scale-95
                  ${isSpinning || placedBets.length === 0 ? 'bg-zinc-700 text-zinc-500 opacity-50' : 'bg-gradient-to-b from-yellow-300 to-amber-600 text-black shadow-[0_10px_40px_rgba(234,179,8,0.5)] hover:scale-[1.02] shine-effect'}
                `}
               >
                 {isSpinning ? 'GIRANDO...' : 'JOGAR AGORA'}
               </button>
            </div>

            <div className="text-center md:text-right bg-black/30 p-4 rounded-2xl border border-white/5 min-w-[150px]">
               <p className="text-[8px] md:text-[10px] font-black text-yellow-600/50 uppercase tracking-[0.2em] mb-1 leading-none">Aposta da Rodada</p>
               <p className="text-xl md:text-3xl font-mono font-black text-white">
                  R$ {placedBets.reduce((sum, b) => sum + b.amount, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
               </p>
            </div>
         </div>
      </div>
    </div>
  );
};

export default RouletteGame;
