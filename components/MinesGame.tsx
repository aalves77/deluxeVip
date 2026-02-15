
import React, { useState, useEffect, useRef, useMemo } from 'react';

interface MinesGameProps {
  userBalance: number;
  onClose: () => void;
  onUpdateBalance: (amount: number) => void;
}

type Tile = {
  id: number;
  isBomb: boolean;
  isRevealed: boolean;
};

type GameState = 'waiting' | 'playing' | 'ended';

const GRID_SIZE = 25;

const MinesGame: React.FC<MinesGameProps> = ({ userBalance, onClose, onUpdateBalance }) => {
  const [gameState, setGameState] = useState<GameState>('waiting');
  const [betAmount, setBetAmount] = useState(10);
  const [bombCount, setBombCount] = useState(3);
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [revealedCount, setRevealedCount] = useState(0);
  const [isMuted, setIsMuted] = useState(() => localStorage.getItem('mines_muted') === 'true');
  const [lastWin, setLastWin] = useState<number | null>(null);
  const [showNoBalance, setShowNoBalance] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    localStorage.setItem('mines_muted', String(isMuted));
  }, [isMuted]);

  const initAudio = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  };

  const playSound = (type: 'click' | 'diamond' | 'bomb' | 'cashout' | 'error') => {
    if (isMuted) return;
    initAudio();
    const ctx = audioContextRef.current!;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    if (type === 'click') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } else if (type === 'diamond') {
      osc.type = 'triangle';
      const freq = 440 * Math.pow(1.059, revealedCount);
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } else if (type === 'bomb') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(100, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.4);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } else if (type === 'cashout') {
      const now = ctx.currentTime;
      [440, 554.37, 659.25].forEach((f, i) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'sine';
        o.frequency.setValueAtTime(f, now + i * 0.1);
        g.gain.setValueAtTime(0.1, now + i * 0.1);
        g.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.3);
        o.connect(g);
        g.connect(ctx.destination);
        o.start(now + i * 0.1);
        o.stop(now + i * 0.1 + 0.3);
      });
      return;
    } else if (type === 'error') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    }

    osc.connect(gain);
    gain.connect(ctx.destination);
  };

  const nCr = (n: number, r: number): number => {
    if (r < 0 || r > n) return 0;
    if (r === 0 || r === n) return 1;
    if (r > n / 2) r = n - r;
    let res = 1;
    for (let i = 1; i <= r; i++) {
      res = res * (n - i + 1) / i;
    }
    return res;
  };

  const getMultiplier = (count: number) => {
    if (count === 0) return 1.0;
    const houseEdge = 0.95;
    const prob = nCr(GRID_SIZE - bombCount, count) / nCr(GRID_SIZE, count);
    return parseFloat(((1 / prob) * houseEdge).toFixed(2));
  };

  const currentMultiplier = useMemo(() => getMultiplier(revealedCount), [revealedCount, bombCount]);
  const nextMultiplier = useMemo(() => getMultiplier(revealedCount + 1), [revealedCount, bombCount]);

  const initTiles = () => {
    const newTiles: Tile[] = Array.from({ length: GRID_SIZE }, (_, i) => ({
      id: i,
      isBomb: false,
      isRevealed: false,
    }));
    setTiles(newTiles);
  };

  useEffect(() => {
    initTiles();
  }, []);

  const startGame = () => {
    if (userBalance < betAmount) {
      playSound('error');
      setShowNoBalance(true);
      setTimeout(() => setShowNoBalance(false), 3000);
      return;
    }

    playSound('click');
    onUpdateBalance(-betAmount);
    setLastWin(null);

    const newTiles: Tile[] = Array.from({ length: GRID_SIZE }, (_, i) => ({
      id: i,
      isBomb: false,
      isRevealed: false,
    }));

    let bombsPlaced = 0;
    while (bombsPlaced < bombCount) {
      const idx = Math.floor(Math.random() * GRID_SIZE);
      if (!newTiles[idx].isBomb) {
        newTiles[idx].isBomb = true;
        bombsPlaced++;
      }
    }

    setTiles(newTiles);
    setRevealedCount(0);
    setGameState('playing');
  };

  const handleTileClick = (idx: number) => {
    if (gameState !== 'playing' || tiles[idx].isRevealed) return;

    const newTiles = [...tiles];
    newTiles[idx].isRevealed = true;

    if (newTiles[idx].isBomb) {
      playSound('bomb');
      setGameState('ended');
      setTiles(newTiles.map(t => t.isBomb ? { ...t, isRevealed: true } : t));
    } else {
      setRevealedCount(prev => prev + 1);
      playSound('diamond');
      setTiles(newTiles);
      
      if (revealedCount + 1 === GRID_SIZE - bombCount) {
        cashOut(nextMultiplier);
      }
    }
  };

  const cashOut = (mult: number = currentMultiplier) => {
    if (gameState !== 'playing' || revealedCount === 0) return;
    const winAmount = betAmount * mult;
    onUpdateBalance(winAmount);
    setLastWin(winAmount);
    playSound('cashout');
    setGameState('ended');
    setTiles(tiles.map(t => ({ ...t, isRevealed: true })));
  };

  return (
    <div className="fixed inset-0 z-[110] bg-[#0d0e12] flex flex-col overflow-hidden animate-fadeIn select-none">
      <div className="bg-[#1a1b23] border-b border-gray-800 p-3 md:p-4 flex justify-between items-center shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center shadow-lg">
            <i className="fa-solid fa-gem text-black text-xl"></i>
          </div>
          <div>
            <h2 className="font-black text-xl italic tracking-tighter text-white">MINES</h2>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Jogo Justo Certificado</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsMuted(!isMuted)}
            className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
          >
            <i className={`fa-solid ${isMuted ? 'fa-volume-xmark' : 'fa-volume-high'}`}></i>
          </button>
          <div className="bg-[#0d0e12] border border-gray-700 rounded-full px-4 py-1.5 flex items-center gap-2 shadow-inner">
            <span className="text-yellow-500 font-bold text-sm">R$</span>
            <span className="font-mono font-bold text-white">
              {userBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <i className="fa-solid fa-circle-xmark text-2xl md:text-3xl"></i>
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* Floating Balance Alerter */}
        {showNoBalance && (
          <div className="absolute top-8 left-1/2 -translate-x-1/2 z-[200] animate-slideUp">
            <div className="bg-red-600 border-2 border-yellow-500 px-6 py-3 rounded-full shadow-2xl flex items-center gap-3">
              <i className="fa-solid fa-circle-exclamation text-white"></i>
              <span className="text-white font-black uppercase text-xs italic">Saldo Insuficiente!</span>
            </div>
          </div>
        )}

        <div className="w-full md:w-80 bg-[#16171d] border-r border-gray-800 p-4 md:p-6 flex flex-col gap-6 overflow-y-auto">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Quantia da Aposta</label>
              <div className="flex bg-[#0d0e12] rounded-xl p-1 border border-gray-700">
                <input 
                  type="number"
                  value={betAmount}
                  disabled={gameState === 'playing'}
                  onChange={(e) => setBetAmount(Math.max(0, parseInt(e.target.value) || 0))}
                  className="bg-transparent w-full px-4 py-2 font-black text-white focus:outline-none"
                />
                <div className="flex gap-1 pr-1">
                  <button onClick={() => setBetAmount(prev => Math.floor(prev / 2))} className="bg-gray-800 px-3 py-1 rounded-lg text-[10px] font-bold">1/2</button>
                  <button onClick={() => setBetAmount(prev => prev * 2)} className="bg-gray-800 px-3 py-1 rounded-lg text-[10px] font-bold">2x</button>
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Número de Minas</label>
              <select 
                value={bombCount}
                disabled={gameState === 'playing'}
                onChange={(e) => setBombCount(parseInt(e.target.value))}
                className="w-full bg-[#0d0e12] border border-gray-700 rounded-xl px-4 py-3 font-black text-white appearance-none focus:outline-none focus:border-yellow-500"
              >
                {Array.from({ length: 24 }, (_, i) => i + 1).map(num => (
                  <option key={num} value={num}>{num} Minas</option>
                ))}
              </select>
            </div>
          </div>

          {gameState !== 'playing' ? (
            <button 
              onClick={startGame}
              className="w-full py-4 bg-yellow-500 hover:bg-yellow-400 text-black font-black text-lg rounded-2xl shadow-[0_8px_20px_rgba(234,179,8,0.3)] transition-all active:scale-95"
            >
              COMEÇAR JOGO
            </button>
          ) : (
            <button 
              onClick={() => cashOut()}
              disabled={revealedCount === 0}
              className={`w-full py-4 font-black text-lg rounded-2xl transition-all active:scale-95 flex flex-col items-center justify-center
                ${revealedCount === 0 ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-green-600 text-white shadow-[0_8px_20px_rgba(22,163,74,0.3)] hover:bg-green-500'}
              `}
            >
              <span>COLETAR</span>
              {revealedCount > 0 && (
                <span className="text-xs opacity-80">R$ {(betAmount * currentMultiplier).toFixed(2)}</span>
              )}
            </button>
          )}

          {gameState === 'ended' && lastWin && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-4 text-center animate-bounceIn">
              <p className="text-green-500 text-[10px] font-bold uppercase tracking-widest mb-1">Você Ganhou!</p>
              <p className="text-2xl font-black text-white">R$ {lastWin.toFixed(2)}</p>
            </div>
          )}

          {gameState === 'playing' && (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-4 text-center space-y-1">
              <p className="text-blue-400 text-[10px] font-bold uppercase tracking-widest">Próximo Multiplicador</p>
              <p className="text-2xl font-black text-white">{nextMultiplier}x</p>
            </div>
          )}
        </div>

        <div className="flex-1 bg-[#0d0e12] p-4 md:p-12 flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="h-full w-full" style={{ 
              backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', 
              backgroundSize: '40px 40px' 
            }}></div>
          </div>

          <div className="grid grid-cols-5 gap-2 md:gap-4 w-full max-w-md aspect-square z-10">
            {tiles.map((tile, i) => (
              <div 
                key={tile.id}
                onClick={() => handleTileClick(i)}
                className={`
                  relative aspect-square rounded-xl md:rounded-2xl cursor-pointer transition-all duration-300
                  ${!tile.isRevealed 
                    ? 'bg-[#252631] hover:bg-[#2d2e3b] shadow-[0_4px_0_0_#1a1b23] hover:-translate-y-1 active:translate-y-0 active:shadow-none' 
                    : tile.isBomb ? 'bg-red-600/20 border-2 border-red-500 shadow-[0_0_20px_rgba(234,179,8,0.4)]' : 'bg-yellow-500/20 border-2 border-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.4)]'
                  }
                  ${gameState === 'playing' && !tile.isRevealed ? 'cursor-pointer' : 'cursor-default'}
                `}
              >
                {tile.isRevealed && (
                  <div className="absolute inset-0 flex items-center justify-center animate-bounceIn">
                    {tile.isBomb ? (
                      <i className="fa-solid fa-bomb text-red-500 text-xl md:text-3xl"></i>
                    ) : (
                      <i className="fa-solid fa-gem text-yellow-500 text-xl md:text-3xl"></i>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="p-2 text-center bg-[#0d0e12] border-t border-gray-800/50">
        <p className="text-[9px] text-gray-600 font-bold tracking-widest uppercase">Powered by DeluxeVip Gaming Engine</p>
      </div>
    </div>
  );
};

export default MinesGame;
