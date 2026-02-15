
import React, { useState, useEffect, useRef } from 'react';

interface AviatorGameProps {
  userBalance: number;
  onClose: () => void;
  onUpdateBalance: (amount: number) => void;
}

type GameState = 'waiting' | 'playing' | 'crashed';

const StylizedPlane: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`relative ${className}`}>
    <svg viewBox="0 0 100 60" className="w-full h-full drop-shadow-[0_10px_15px_rgba(0,0,0,0.5)]">
      {/* Corpo do Avião */}
      <path d="M10,30 Q10,15 40,15 L80,25 Q90,30 80,35 L40,45 Q10,45 10,30" fill="#ef4444" />
      {/* Asa Superior */}
      <path d="M35,15 L55,5 L65,5 L45,15 Z" fill="#b91c1c" />
      {/* Asa Inferior (Perspectiva) */}
      <path d="M35,45 L55,55 L65,55 L45,45 Z" fill="#991b1b" />
      {/* Cockpit */}
      <path d="M45,20 Q55,20 60,25 L55,30 Q50,30 45,25 Z" fill="#bae6fd" opacity="0.8" />
      {/* Cauda */}
      <path d="M10,30 L0,15 L15,20 L10,30 Z" fill="#ef4444" />
      <path d="M10,30 L0,45 L15,40 L10,30 Z" fill="#b91c1c" />
      {/* Hélice */}
      <rect x="80" y="15" width="4" height="30" fill="#334155" className="animate-propeller origin-center" style={{ transformOrigin: '82px 30px' }} />
    </svg>
    {/* Efeito de Fogo/Rastro do Motor */}
    <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-8 h-4 bg-orange-500/30 blur-md rounded-full animate-pulse"></div>
  </div>
);

const AviatorGame: React.FC<AviatorGameProps> = ({ userBalance, onClose, onUpdateBalance }) => {
  const [gameState, setGameState] = useState<GameState>('waiting');
  const [multiplier, setMultiplier] = useState(1.00);
  const [betAmount, setBetAmount] = useState(10);
  const [currentBet, setCurrentBet] = useState<number | null>(null);
  const [hasCashedOut, setHasCashedOut] = useState(false);
  const [isMuted, setIsMuted] = useState(() => localStorage.getItem('aviator_muted') === 'true');
  const [history, setHistory] = useState<number[]>(() => {
    const saved = localStorage.getItem('aviator_history');
    return saved ? JSON.parse(saved) : [1.25, 4.50, 1.05, 2.10, 1.88];
  });
  const [countdown, setCountdown] = useState(5);
  const [showNoBalance, setShowNoBalance] = useState(false);
  
  const crashPointRef = useRef(1.00);
  const intervalRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  
  // Audio Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const rumbleOscRef = useRef<OscillatorNode | null>(null);
  const powerOscRef = useRef<OscillatorNode | null>(null);
  const noiseSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const engineFilterRef = useRef<BiquadFilterNode | null>(null);

  useEffect(() => {
    localStorage.setItem('aviator_muted', String(isMuted));
  }, [isMuted]);

  const initAudio = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  };

  const createNoiseBuffer = (ctx: AudioContext) => {
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    return buffer;
  };

  const startEngineSound = () => {
    if (isMuted) return;
    initAudio();
    const ctx = audioContextRef.current!;
    if (ctx.state === 'suspended') ctx.resume();

    const rumble = ctx.createOscillator();
    rumble.type = 'sawtooth';
    rumble.frequency.setValueAtTime(45, ctx.currentTime);

    const power = ctx.createOscillator();
    power.type = 'triangle';
    power.frequency.setValueAtTime(90, ctx.currentTime);

    const noise = ctx.createBufferSource();
    noise.buffer = createNoiseBuffer(ctx);
    noise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, ctx.currentTime);
    filter.Q.setValueAtTime(10, ctx.currentTime);

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0, ctx.currentTime);
    masterGain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.3);

    rumble.connect(filter);
    power.connect(filter);
    noise.connect(filter);
    filter.connect(masterGain);
    masterGain.connect(ctx.destination);
    
    rumble.start();
    power.start();
    noise.start();

    rumbleOscRef.current = rumble;
    powerOscRef.current = power;
    noiseSourceRef.current = noise;
    engineFilterRef.current = filter;
    masterGainRef.current = masterGain;
  };

  const updateEngineSound = (mult: number) => {
    if (isMuted || !rumbleOscRef.current || !engineFilterRef.current) return;
    const ctx = audioContextRef.current!;
    
    // Aumenta a frequência do motor baseado no multiplicador
    rumbleOscRef.current.frequency.setTargetAtTime(45 + (mult * 10), ctx.currentTime, 0.1);
    powerOscRef.current!.frequency.setTargetAtTime(90 + (mult * 25), ctx.currentTime, 0.1);
    
    const cutoff = 400 + (mult * 500);
    engineFilterRef.current.frequency.setTargetAtTime(Math.min(8000, cutoff), ctx.currentTime, 0.1);
    
    const volume = Math.min(0.6, 0.2 + (mult * 0.08));
    masterGainRef.current?.gain.setTargetAtTime(volume, ctx.currentTime, 0.1);
  };

  const stopEngineSound = () => {
    [rumbleOscRef, powerOscRef, noiseSourceRef].forEach(ref => {
      if (ref.current) {
        try { ref.current.stop(); ref.current.disconnect(); } catch(e) {}
        ref.current = null;
      }
    });
    if (engineFilterRef.current) engineFilterRef.current.disconnect();
    if (masterGainRef.current) masterGainRef.current.disconnect();
  };

  const playSound = (type: 'success' | 'crash' | 'tick' | 'error') => {
    if (isMuted) return;
    initAudio();
    const ctx = audioContextRef.current!;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    if (type === 'success') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start(); osc.stop(ctx.currentTime + 0.3);
    } else if (type === 'crash') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(100, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(20, ctx.currentTime + 0.8);
      gain.gain.setValueAtTime(0.5, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.8);
      osc.start(); osc.stop(ctx.currentTime + 0.8);
    } else if (type === 'tick') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
      osc.start(); osc.stop(ctx.currentTime + 0.05);
    } else if (type === 'error') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.start(); osc.stop(ctx.currentTime + 0.2);
    }

    osc.connect(gain);
    gain.connect(ctx.destination);
  };

  useEffect(() => {
    localStorage.setItem('aviator_history', JSON.stringify(history));
  }, [history]);

  const generateCrashPoint = () => {
    const r = Math.random();
    if (r < 0.03) return 1.00; 
    return parseFloat((0.99 / (1 - r)).toFixed(2));
  };

  const startRound = () => {
    setGameState('playing');
    setMultiplier(1.00);
    setHasCashedOut(false);
    crashPointRef.current = generateCrashPoint();
    startTimeRef.current = Date.now();
    startEngineSound();

    intervalRef.current = window.setInterval(() => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      const nextMultiplier = Math.pow(Math.E, 0.08 * elapsed);
      
      if (nextMultiplier >= crashPointRef.current) {
        endRound();
      } else {
        const fixedMult = parseFloat(nextMultiplier.toFixed(2));
        setMultiplier(fixedMult);
        updateEngineSound(fixedMult);
      }
    }, 50);
  };

  const endRound = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    stopEngineSound();
    playSound('crash');
    setGameState('crashed');
    const finalCrash = crashPointRef.current;
    setHistory(prev => [finalCrash, ...prev].slice(0, 15));
    setCurrentBet(null);

    setTimeout(() => {
      setGameState('waiting');
      setCountdown(5);
    }, 3000);
  };

  const handlePlaceBet = () => {
    if (userBalance < betAmount) {
      playSound('error');
      setShowNoBalance(true);
      setTimeout(() => setShowNoBalance(false), 3000);
      return;
    }
    if (gameState === 'waiting' && !currentBet) {
      onUpdateBalance(-betAmount);
      setCurrentBet(betAmount);
    }
  };

  const handleCashOut = () => {
    if (gameState === 'playing' && currentBet && !hasCashedOut) {
      playSound('success');
      const winAmount = currentBet * multiplier;
      onUpdateBalance(winAmount);
      setHasCashedOut(true);
    }
  };

  useEffect(() => {
    let timer: number;
    if (gameState === 'waiting') {
      timer = window.setInterval(() => {
        setCountdown(prev => {
          if (prev > 0) playSound('tick');
          if (prev <= 1) {
            clearInterval(timer);
            startRound();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      clearInterval(timer);
      stopEngineSound();
    };
  }, [gameState]);

  const planeX = Math.min(80, (multiplier - 1) * 10);
  const planeY = Math.min(70, (multiplier - 1) * 8);

  return (
    <div className="fixed inset-0 z-[110] bg-[#0d0e12] flex flex-col overflow-hidden animate-fadeIn select-none">
      <style>{`
        @keyframes propeller {
          from { transform: rotateX(0deg); }
          to { transform: rotateX(360deg); }
        }
        .animate-propeller {
          animation: propeller 0.1s linear infinite;
        }
      `}</style>

      <div className="bg-[#1a1b23] border-b border-gray-800 p-3 md:p-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-red-600 rounded-lg flex items-center justify-center shadow-lg animate-pulse overflow-hidden">
                <StylizedPlane className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
                <h2 className="font-black text-lg md:text-xl italic tracking-tighter leading-none text-white">AVIATOR</h2>
                <div className="flex gap-1.5 mt-1 overflow-x-auto no-scrollbar max-w-[150px] md:max-w-2xl">
                    {history.map((val, i) => (
                        <span key={i} className={`text-[9px] md:text-[10px] px-2 py-0.5 rounded-full font-bold whitespace-nowrap ${
                          val >= 10 ? 'bg-pink-600 text-white' : val >= 2 ? 'bg-purple-600 text-white' : 'bg-blue-600/20 text-blue-400 border border-blue-500/20'
                        }`}>
                            {val.toFixed(2)}x
                        </span>
                    ))}
                </div>
            </div>
        </div>
        
        <div className="flex items-center gap-3 md:gap-4">
            <button onClick={() => setIsMuted(!isMuted)} className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
              <i className={`fa-solid ${isMuted ? 'fa-volume-xmark' : 'fa-volume-high'}`}></i>
            </button>
            <div className="bg-[#0d0e12] border border-gray-700 rounded-full px-3 md:px-5 py-1.5 flex items-center gap-2 shadow-inner">
                <span className="text-yellow-500 font-bold text-xs md:text-sm">R$</span>
                <span className="font-mono font-bold text-sm md:text-base text-white">
                  {userBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
                <i className="fa-solid fa-circle-xmark text-2xl md:text-3xl"></i>
            </button>
        </div>
      </div>

      <div className="flex-1 relative flex flex-col bg-[#0d0e12] m-2 md:m-4 rounded-3xl overflow-hidden border border-gray-800/50 shadow-2xl">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="h-full w-full" style={{ backgroundImage: 'linear-gradient(#252631 1px, transparent 1px), linear-gradient(90deg, #252631 1px, transparent 1px)', backgroundSize: '50px 50px' }}></div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center z-10 p-4">
          {gameState === 'waiting' && (
            <div className="text-center space-y-6 animate-fadeIn">
                <div className="relative w-28 h-28 mx-auto">
                    <svg className="w-full h-full -rotate-90">
                        <circle cx="50%" cy="50%" r="44%" stroke="#ef4444" strokeWidth="6" fill="none" strokeDasharray="280" strokeDashoffset={280 - (countdown/5)*280} className="transition-all duration-1000 ease-linear" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-4xl md:text-5xl font-black text-white">{countdown}</span>
                    </div>
                </div>
                <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Aguardando Decolagem...</p>
                {currentBet && (
                  <div className="bg-green-500/10 text-green-500 border border-green-500/50 px-6 py-2 rounded-2xl font-black text-xs animate-bounce">
                    APOSTA ACEITA
                  </div>
                )}
            </div>
          )}

          {gameState === 'playing' && (
            <div className="text-center z-20">
                <h1 className={`text-7xl md:text-[10rem] font-black italic tracking-tighter mb-2 transition-all ${hasCashedOut ? 'text-green-500' : 'text-white'}`}>
                    {multiplier.toFixed(2)}x
                </h1>
            </div>
          )}

          {gameState === 'crashed' && (
            <div className="text-center animate-bounceIn z-20">
                <h1 className="text-5xl md:text-8xl font-black text-red-600 italic tracking-tighter uppercase drop-shadow-[0_0_20px_rgba(220,38,38,0.5)]">Flew Away!</h1>
                <p className="text-2xl font-bold text-gray-500 bg-gray-900/50 px-6 py-1 rounded-full border border-gray-800">{crashPointRef.current.toFixed(2)}x</p>
            </div>
          )}
        </div>

        {gameState === 'playing' && (
            <div className="absolute inset-0 pointer-events-none">
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d={`M 5 ${90} Q ${5 + planeX/2} 90 ${5 + planeX} ${90 - planeY}`} fill="none" stroke="#ef4444" strokeWidth="0.8" strokeLinecap="round" className="transition-all duration-300" />
                <path d={`M 5 ${90} Q ${5 + planeX/2} 90 ${5 + planeX} ${90 - planeY} L ${5 + planeX} 90 L 5 90 Z`} fill="url(#jetGradient)" className="opacity-20 transition-all duration-300" />
                <defs><linearGradient id="jetGradient" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" style={{ stopColor: '#ef4444', stopOpacity: 0.8 }} /><stop offset="100%" style={{ stopColor: '#ef4444', stopOpacity: 0 }} /></linearGradient></defs>
              </svg>
              <div className="absolute transition-all duration-300 ease-out" style={{ left: `${5 + planeX}%`, top: `${90 - planeY}%`, transform: `translate(-50%, -50%) rotate(${-planeY/2}deg)`, width: '80px', height: '48px' }}>
                <StylizedPlane className="w-full h-full" />
              </div>
            </div>
        )}
      </div>

      <div className="p-3 md:p-6 bg-[#1a1b23] border-t border-gray-800 grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6 relative">
        {showNoBalance && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full z-50 animate-bounceIn mb-4 w-full px-8">
            <div className="bg-red-600 border-2 border-yellow-500 rounded-xl py-3 px-6 shadow-2xl flex items-center justify-center gap-3">
              <i className="fa-solid fa-triangle-exclamation text-white"></i>
              <span className="text-white font-black uppercase text-xs">Saldo Insuficiente!</span>
            </div>
          </div>
        )}

        <div className="bg-[#252631] p-3 md:p-5 rounded-3xl flex flex-col gap-3 border border-gray-700/50">
            <div className="flex justify-between items-center gap-3">
                <div className="flex-1 flex bg-[#0d0e12] rounded-full p-1 border border-gray-700">
                    <button onClick={() => setBetAmount(prev => Math.max(1, prev - 1))} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-white transition-colors"><i className="fa-solid fa-minus"></i></button>
                    <div className="flex-1 flex items-center justify-center font-black text-sm">
                      <span className="text-yellow-500 mr-1">R$</span>
                      <input type="number" value={betAmount} onChange={(e) => setBetAmount(Math.max(0, parseInt(e.target.value) || 0))} className="bg-transparent w-full text-center focus:outline-none text-white" />
                    </div>
                    <button onClick={() => setBetAmount(prev => prev + 1)} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-white transition-colors"><i className="fa-solid fa-plus"></i></button>
                </div>
                <div className="grid grid-cols-2 gap-1 md:flex">
                    {[10, 50, 100].map(val => (
                        <button key={val} onClick={() => setBetAmount(val)} className="bg-[#1a1b23] px-3 py-1.5 rounded-xl text-[10px] font-black border border-gray-800 text-white hover:bg-gray-700">{val}</button>
                    ))}
                </div>
            </div>
            <button disabled={gameState !== 'waiting' || !!currentBet} onClick={handlePlaceBet} className={`w-full py-3 rounded-2xl font-black text-lg transition-all ${currentBet ? 'bg-gray-700 text-gray-500' : 'bg-green-600 text-white hover:bg-green-500 shadow-lg'}`}>{currentBet ? 'APOSTA FEITA' : 'APOSTAR'}</button>
        </div>

        <div className="bg-[#252631] p-3 md:p-5 rounded-3xl flex flex-col justify-center border border-gray-700/50">
            {gameState === 'playing' && currentBet && !hasCashedOut ? (
                <button onClick={handleCashOut} className="w-full h-full bg-yellow-500 text-black py-4 rounded-2xl font-black flex flex-col items-center justify-center shadow-lg hover:bg-yellow-400 animate-pulse">
                    <span className="text-[10px] uppercase font-bold mb-1">Cash Out</span>
                    <span className="text-2xl font-black italic">R$ {(currentBet * multiplier).toFixed(2)}</span>
                </button>
            ) : (
                <div className="flex flex-col items-center justify-center h-full opacity-30">
                    <i className="fa-solid fa-hourglass-start text-2xl mb-1"></i>
                    <p className="text-[10px] font-black uppercase tracking-widest">Aguardando...</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default AviatorGame;
