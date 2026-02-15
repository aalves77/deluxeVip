
import React, { useState, useRef, useEffect } from 'react';

interface DailyBonusModalProps {
  onClose: () => void;
  onWin: (amount: number) => void;
}

const PRIZES = [
  { amount: 5.0, label: "R$ 5", color: "#ef4444" },
  { amount: 50.0, label: "R$ 50", color: "#3b82f6" },
  { amount: 1.0, label: "R$ 1", color: "#10b981" },
  { amount: 500.0, label: "R$ 500", color: "#f59e0b" },
  { amount: 10.0, label: "R$ 10", color: "#8b5cf6" },
  { amount: 2.0, label: "R$ 2", color: "#ec4899" },
  { amount: 100.0, label: "R$ 100", color: "#06b6d4" },
  { amount: 20.0, label: "R$ 20", color: "#f97316" },
];

const DailyBonusModal: React.FC<DailyBonusModalProps> = ({ onClose, onWin }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [reward, setReward] = useState<number | null>(null);
  const [hasSpinCompleted, setHasSpinCompleted] = useState(false);
  const wheelRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Audio Logic
  const initAudio = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  };

  const playSound = (type: 'click' | 'tick' | 'win') => {
    initAudio();
    const ctx = audioContextRef.current!;
    if (ctx.state === 'suspended') ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    if (type === 'click') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(500, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } else if (type === 'tick') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } else if (type === 'win') {
      const now = ctx.currentTime;
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'sine';
        o.frequency.setValueAtTime(freq, now + i * 0.1);
        g.gain.setValueAtTime(0.1, now + i * 0.1);
        g.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.4);
        o.connect(g);
        g.connect(ctx.destination);
        o.start(now + i * 0.1);
        o.stop(now + i * 0.1 + 0.4);
      });
      return;
    }

    osc.connect(gain);
    gain.connect(ctx.destination);
  };

  const spinWheel = () => {
    if (isSpinning || hasSpinCompleted) return;

    playSound('click');
    setIsSpinning(true);
    const extraRounds = 5 + Math.floor(Math.random() * 5);
    const randomDegree = Math.floor(Math.random() * 360);
    const totalRotation = rotation + (extraRounds * 360) + randomDegree;
    
    setRotation(totalRotation);

    // Simulate ticking sound during rotation
    let currentTickRotation = 0;
    const segments = PRIZES.length;
    const segmentAngle = 360 / segments;
    const totalDegreesToRotate = (extraRounds * 360) + randomDegree;
    
    const startTime = Date.now();
    const duration = 4000;

    const tickInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const t = Math.min(1, elapsed / duration);
      // Easing out cubic: 1 - (1 - t)^3
      const easedT = 1 - Math.pow(1 - t, 3);
      const currentDegrees = easedT * totalDegreesToRotate;
      
      if (currentDegrees - currentTickRotation >= segmentAngle) {
        playSound('tick');
        currentTickRotation += segmentAngle;
      }

      if (t >= 1) clearInterval(tickInterval);
    }, 16);

    // Calculate result after animation
    setTimeout(() => {
      setIsSpinning(false);
      
      const normalizedDegree = (360 - (totalRotation % 360)) % 360;
      const prizeIndex = Math.floor(normalizedDegree / (360 / PRIZES.length));
      const prize = PRIZES[prizeIndex % PRIZES.length];
      
      playSound('win');
      setReward(prize.amount);
      setHasSpinCompleted(true);
    }, 4000);
  };

  const handleClaim = () => {
    if (reward !== null) {
      playSound('click');
      onWin(reward);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative bg-[#1a1b23] border border-gray-800 w-full max-w-md rounded-3xl p-8 shadow-[0_0_50px_rgba(234,179,8,0.2)] flex flex-col items-center">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
        >
          <i className="fa-solid fa-xmark text-xl"></i>
        </button>

        <h2 className="text-2xl font-black text-center mb-2 italic">ROLETA DA SORTE</h2>
        <p className="text-gray-400 text-sm text-center mb-8">
          {hasSpinCompleted ? "Parabéns pelo seu prêmio!" : "Gire para ganhar seu bônus diário gratuito!"}
        </p>

        {/* Roulette Wheel */}
        <div className="relative mb-8 w-64 h-64 md:w-80 md:h-80">
          {/* Pointer */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-20 text-yellow-500 drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]">
            <i className="fa-solid fa-caret-down text-4xl"></i>
          </div>

          {/* Wheel Container */}
          <div 
            ref={wheelRef}
            className="w-full h-full rounded-full border-8 border-[#252631] relative overflow-hidden transition-transform duration-[4000ms] cubic-bezier(0.15, 0, 0.15, 1)"
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            {PRIZES.map((prize, index) => {
              const angle = 360 / PRIZES.length;
              return (
                <div 
                  key={index}
                  className="absolute top-0 left-0 w-full h-full"
                  style={{ 
                    transform: `rotate(${index * angle}deg)`,
                    clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.tan((angle * Math.PI) / 360)}% 0%)`,
                    backgroundColor: prize.color
                  }}
                >
                  <div 
                    className="absolute top-[15%] left-1/2 -translate-x-1/2 text-white font-black text-xs md:text-sm -rotate-[75deg] origin-center"
                    style={{ transform: `translateX(-50%) rotate(${angle/2}deg)` }}
                  >
                    {prize.label}
                  </div>
                </div>
              );
            })}
            
            {/* Center Cap */}
            <div className="absolute inset-0 m-auto w-12 h-12 bg-[#1a1b23] rounded-full border-4 border-yellow-500 z-10 flex items-center justify-center shadow-lg">
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-ping"></div>
            </div>
          </div>
        </div>

        {/* Actions */}
        {!hasSpinCompleted ? (
          <button
            onClick={spinWheel}
            disabled={isSpinning}
            className={`
              w-full py-4 rounded-2xl font-black text-lg transition-all
              ${isSpinning 
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                : 'bg-yellow-500 text-black shadow-[0_10px_20px_rgba(234,179,8,0.3)] hover:scale-105 active:scale-95'
              }
            `}
          >
            {isSpinning ? "GIRANDO..." : "GIRAR AGORA"}
          </button>
        ) : (
          <div className="w-full space-y-4 animate-bounceIn">
            <div className="bg-green-500/10 border border-green-500/50 rounded-2xl p-4 text-center">
                <p className="text-green-500 text-xs font-bold uppercase tracking-widest mb-1">Você Ganhou</p>
                <p className="text-4xl font-black text-white italic">R$ {reward?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </div>
            <button
              onClick={handleClaim}
              className="w-full bg-white text-black py-4 rounded-2xl font-black text-lg shadow-xl hover:bg-gray-200 transition-colors"
            >
              RESGATAR PRÊMIO
            </button>
          </div>
        )}

        <p className="text-[10px] text-gray-500 mt-6 uppercase tracking-tighter">
            *Promoção válida uma vez por dia por conta verificada.
        </p>
      </div>
    </div>
  );
};

export default DailyBonusModal;
