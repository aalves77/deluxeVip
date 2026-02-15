
import React, { useState, useEffect, useRef } from 'react';

interface Card {
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
  rank: string;
  value: number;
}

interface PokerGameProps {
  userBalance: number;
  onClose: () => void;
  onUpdateBalance: (amount: number) => void;
}

const SUITS: Card['suit'][] = ['hearts', 'diamonds', 'clubs', 'spades'];
const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
const RANK_VALUES: Record<string, number> = {
  '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14
};

type GameState = 'betting' | 'flop' | 'result';

const PokerGame: React.FC<PokerGameProps> = ({ userBalance, onClose, onUpdateBalance }) => {
  const [gameState, setGameState] = useState<GameState>('betting');
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [communityCards, setCommunityCards] = useState<Card[]>([]);
  const [deck, setDeck] = useState<Card[]>([]);
  const [anteBet, setAnteBet] = useState(0);
  const [callBet, setCallBet] = useState(0);
  const [selectedChip, setSelectedChip] = useState(10);
  const [message, setMessage] = useState('Faça sua aposta Ante');
  const [playerRank, setPlayerRank] = useState('');
  const [dealerRank, setDealerRank] = useState('');
  const [isMuted, setIsMuted] = useState(() => localStorage.getItem('poker_muted') === 'true');
  const [showNoBalance, setShowNoBalance] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);

  const initAudio = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  };

  const playSound = (type: 'chip' | 'card' | 'win' | 'lose' | 'fold' | 'error') => {
    if (isMuted) return;
    initAudio();
    const ctx = audioContextRef.current!;
    if (ctx.state === 'suspended') ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    if (type === 'card') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(500, ctx.currentTime);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    } else if (type === 'chip') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1000, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    } else if (type === 'win') {
      const now = ctx.currentTime;
      [523, 659, 783, 1046].forEach((f, i) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'sine';
        o.frequency.setValueAtTime(f, now + i * 0.1);
        g.gain.setValueAtTime(0.1, now);
        g.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
        o.connect(g); g.connect(ctx.destination);
        o.start(now); o.stop(now + 0.6);
      });
      return;
    } else if (type === 'error') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    }

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  };

  const createDeck = () => {
    const newDeck: Card[] = [];
    SUITS.forEach(suit => {
      RANKS.forEach(rank => {
        newDeck.push({ suit, rank, value: RANK_VALUES[rank] });
      });
    });
    return newDeck.sort(() => Math.random() - 0.5);
  };

  const startRound = () => {
    if (anteBet === 0) return;
    if (userBalance < anteBet) {
      playSound('error');
      setShowNoBalance(true);
      setTimeout(() => setShowNoBalance(false), 3000);
      return;
    }

    onUpdateBalance(-anteBet);
    const newDeck = createDeck();
    const pHand = [newDeck.pop()!, newDeck.pop()!];
    const dHand = [newDeck.pop()!, newDeck.pop()!];
    const flop = [newDeck.pop()!, newDeck.pop()!, newDeck.pop()!];

    setPlayerHand(pHand);
    setDealerHand(dHand);
    setCommunityCards(flop);
    setDeck(newDeck);
    setGameState('flop');
    setMessage('Flop distribuído. Call ou Fold?');
    playSound('card');
    
    const rank = evaluateHand([...pHand, ...flop]);
    setPlayerRank(rank.label);
  };

  const handleFold = () => {
    playSound('fold');
    setGameState('result');
    setMessage('Você desistiu da mão.');
    setAnteBet(0);
    setCallBet(0);
    setTimeout(resetGame, 2000);
  };

  const handleCall = () => {
    const callAmount = anteBet * 2;
    if (userBalance < callAmount) {
      playSound('error');
      setShowNoBalance(true);
      setTimeout(() => setShowNoBalance(false), 3000);
      return;
    }

    onUpdateBalance(-callAmount);
    setCallBet(callAmount);
    playSound('chip');

    const newCommunity = [...communityCards, deck.pop()!, deck.pop()!];
    setCommunityCards(newCommunity);
    setGameState('result');

    const pResult = evaluateHand([...playerHand, ...newCommunity]);
    const dResult = evaluateHand([...dealerHand, ...newCommunity]);

    setPlayerRank(pResult.label);
    setDealerRank(dResult.label);

    if (pResult.score > dResult.score) {
      const winAmount = (anteBet + callAmount) * 2;
      onUpdateBalance(winAmount);
      setMessage(`Você Venceu! R$ ${winAmount.toFixed(2)} 🎉`);
      playSound('win');
    } else if (pResult.score === dResult.score) {
      onUpdateBalance(anteBet + callAmount);
      setMessage('Empate! Saldo devolvido. 🤝');
    } else {
      setMessage('Dealer Venceu. 😔');
      playSound('lose');
    }
  };

  const resetGame = () => {
    setGameState('betting');
    setPlayerHand([]);
    setDealerHand([]);
    setCommunityCards([]);
    setAnteBet(0);
    setCallBet(0);
    setPlayerRank('');
    setDealerRank('');
    setMessage('Faça sua aposta Ante');
  };

  const evaluateHand = (cards: Card[]) => {
    const sorted = [...cards].sort((a, b) => b.value - a.value);
    
    // Check Flush
    const suitCounts: any = {};
    cards.forEach(c => suitCounts[c.suit] = (suitCounts[c.suit] || 0) + 1);
    const flushSuit = Object.keys(suitCounts).find(s => suitCounts[s] >= 5);
    const isFlush = !!flushSuit;

    // Check Straight
    const uniqueValues = Array.from(new Set(cards.map(c => c.value))).sort((a,b) => b-a);
    let straightValue = 0;
    for(let i=0; i <= uniqueValues.length - 5; i++) {
        if(uniqueValues[i] - uniqueValues[i+4] === 4) {
            straightValue = uniqueValues[i];
            break;
        }
    }
    // Ace-low straight
    if (!straightValue && uniqueValues.includes(14) && uniqueValues.includes(2) && uniqueValues.includes(3) && uniqueValues.includes(4) && uniqueValues.includes(5)) {
        straightValue = 5;
    }

    // Counts
    const valCounts: any = {};
    cards.forEach(c => valCounts[c.value] = (valCounts[c.value] || 0) + 1);
    const counts: any = Object.entries(valCounts).sort((a:any, b:any) => b[1] - a[1] || b[0] - a[0]);

    if (isFlush && straightValue === 14) return { score: 900, label: 'ROYAL FLUSH' };
    if (isFlush && straightValue) return { score: 800 + straightValue, label: 'STRAIGHT FLUSH' };
    if (counts[0][1] === 4) return { score: 700 + parseInt(counts[0][0]), label: 'QUADRA' };
    if (counts[0][1] === 3 && counts[1]?.[1] >= 2) return { score: 600 + parseInt(counts[0][0]), label: 'FULL HOUSE' };
    if (isFlush) return { score: 500 + sorted[0].value, label: 'FLUSH' };
    if (straightValue) return { score: 400 + straightValue, label: 'SEQUÊNCIA' };
    if (counts[0][1] === 3) return { score: 300 + parseInt(counts[0][0]), label: 'TRINCA' };
    if (counts[0][1] === 2 && counts[1]?.[1] === 2) return { score: 200 + parseInt(counts[0][0]), label: 'DOIS PARES' };
    if (counts[0][1] === 2) return { score: 100 + parseInt(counts[0][0]), label: 'PAR' };
    
    return { score: sorted[0].value, label: 'CARTA ALTA' };
  };

  const renderCard = (card: Card, hidden = false) => (
    <div className={`relative w-16 h-24 md:w-24 md:h-36 rounded-xl border-2 shadow-2xl transition-all duration-500 transform ${hidden ? 'bg-gradient-to-br from-indigo-900 to-black border-yellow-500/30' : 'bg-white border-gray-200 animate-slideUp'}`}>
      {!hidden ? (
        <div className={`p-2 flex flex-col h-full justify-between ${['hearts', 'diamonds'].includes(card.suit) ? 'text-red-600' : 'text-black'}`}>
          <div className="text-sm md:text-xl font-black leading-none">{card.rank}</div>
          <div className="text-3xl md:text-5xl self-center drop-shadow-sm">
            {card.suit === 'hearts' && '♥'}
            {card.suit === 'diamonds' && '♦'}
            {card.suit === 'clubs' && '♣'}
            {card.suit === 'spades' && '♠'}
          </div>
          <div className="text-sm md:text-xl font-black leading-none self-end rotate-180">{card.rank}</div>
        </div>
      ) : (
        <div className="h-full w-full flex items-center justify-center relative overflow-hidden">
           <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
           <div className="w-10 h-14 md:w-16 md:h-24 border-2 border-yellow-500/20 rounded-lg flex items-center justify-center rotate-12 bg-black/40">
              <span className="font-black italic text-yellow-500/30 text-xl md:text-3xl">D</span>
           </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 z-[110] bg-[#0d0e12] flex flex-col overflow-hidden animate-fadeIn select-none font-sans text-white">
      {/* Wooden Header */}
      <div className="bg-[#2c1810] border-b-4 border-[#1a0f0a] px-6 py-4 flex justify-between items-center shadow-2xl z-50">
        <div className="flex items-center gap-4">
           <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-lg flex items-center justify-center shadow-xl border-2 border-yellow-200/20">
              <i className="fa-solid fa-diamond text-black text-2xl"></i>
           </div>
           <div>
              <h2 className="font-black text-2xl italic tracking-tighter uppercase leading-none text-yellow-500">POKER <span className="text-white">HOLD'EM</span></h2>
              <p className="text-[10px] text-yellow-600/70 font-black uppercase tracking-widest mt-1">Mesa Deluxe #402</p>
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

      {/* Main Table Area */}
      <div className="flex-1 relative bg-[#064e3b] m-2 md:m-8 rounded-[2rem] md:rounded-[4rem] border-[10px] md:border-[16px] border-[#2c1810] shadow-[inset_0_0_150px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col items-center justify-between p-4 md:p-8">
          
          {/* Internal Toast */}
          {showNoBalance && (
            <div className="absolute top-10 left-1/2 -translate-x-1/2 z-[100] animate-bounceIn">
               <div className="bg-red-600 border-2 border-yellow-500 px-8 py-3 rounded-2xl shadow-2xl flex items-center gap-3">
                  <i className="fa-solid fa-triangle-exclamation text-white"></i>
                  <span className="text-white font-black uppercase text-xs">Saldo Insuficiente!</span>
               </div>
            </div>
          )}

          {/* Dealer Area */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex gap-2 min-h-[96px] md:min-h-[144px]">
              {dealerHand.map((card, i) => renderCard(card, gameState !== 'result'))}
              {dealerHand.length === 0 && <div className="w-16 h-24 md:w-24 md:h-36 rounded-xl border-2 border-white/5 bg-black/10"></div>}
            </div>
            {dealerRank && (
              <div className="bg-black/60 px-4 py-1 rounded-full border border-yellow-500/30 text-xs font-black text-yellow-500 uppercase animate-fadeIn">
                Dealer: {dealerRank}
              </div>
            )}
          </div>

          {/* Community Cards */}
          <div className="flex flex-col items-center gap-4">
             <div className="flex gap-2 md:gap-3 bg-black/20 p-2 md:p-4 rounded-2xl border border-white/5">
                {[0,1,2,3,4].map(i => (
                  communityCards[i] 
                  ? renderCard(communityCards[i])
                  : <div key={i} className="w-16 h-24 md:w-24 md:h-36 rounded-xl border-2 border-dashed border-white/10 flex items-center justify-center">
                       <i className="fa-solid fa-diamond text-white/5 text-xl"></i>
                    </div>
                ))}
             </div>
             <div className="bg-black/40 px-8 py-3 rounded-2xl border border-white/5 backdrop-blur-md">
                <h3 className="text-lg md:text-2xl font-black italic uppercase tracking-widest text-yellow-500 text-center animate-pulse">{message}</h3>
             </div>
          </div>

          {/* Player Area */}
          <div className="flex flex-col items-center gap-2">
            {playerRank && (
              <div className="bg-yellow-500 px-6 py-1 rounded-full text-xs font-black text-black uppercase shadow-lg animate-bounceIn mb-2">
                {playerRank}
              </div>
            )}
            <div className="flex gap-2 min-h-[96px] md:min-h-[144px]">
              {playerHand.map(card => renderCard(card))}
              {playerHand.length === 0 && (
                <div className="flex flex-col items-center justify-center w-32 h-24 md:w-48 md:h-36 rounded-xl border-2 border-dashed border-white/10 opacity-20">
                   <i className="fa-solid fa-hand-holding-dollar text-3xl"></i>
                </div>
              )}
            </div>
          </div>
      </div>

      {/* Control Panel */}
      <div className="bg-[#1a0f0a] border-t-4 border-[#2c1810] p-4 md:p-8 shadow-2xl z-50">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-6">
          
          {gameState === 'betting' ? (
            <>
              <div className="flex gap-2 md:gap-4 overflow-x-auto pb-2 no-scrollbar">
                {[1, 5, 10, 50, 100, 500].map(val => (
                  <button 
                    key={val}
                    onClick={() => { playSound('chip'); setAnteBet(prev => prev + val); }}
                    className={`w-12 h-12 md:w-16 md:h-16 rounded-full border-4 flex items-center justify-center font-black text-xs md:text-sm transition-all active:scale-90 shadow-xl
                      ${val === 1 ? 'bg-blue-600' : val === 5 ? 'bg-red-600' : val === 10 ? 'bg-green-600' : val === 50 ? 'bg-purple-600' : val === 100 ? 'bg-zinc-800' : 'bg-yellow-600'}
                      border-black/20 hover:scale-110`}
                  >
                    {val}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-4 flex-1 justify-center">
                <div className="text-center bg-black/40 px-8 py-3 rounded-2xl border border-white/5 min-w-[150px]">
                  <p className="text-[9px] text-gray-500 font-black uppercase mb-1">ANTE</p>
                  <p className="text-xl md:text-3xl font-mono font-black text-yellow-500">R$ {anteBet.toFixed(2)}</p>
                </div>
                <button 
                  onClick={startRound}
                  disabled={anteBet === 0}
                  className="px-8 md:px-16 py-4 md:py-6 bg-gradient-to-b from-yellow-400 to-amber-600 text-black font-black text-xl md:text-2xl rounded-2xl shadow-[0_10px_40px_rgba(234,179,8,0.4)] hover:scale-[1.02] active:scale-95 disabled:opacity-30 transition-all uppercase italic tracking-tighter shine-effect"
                >
                  DISTRIBUIR
                </button>
                <button onClick={() => setAnteBet(0)} className="text-gray-500 hover:text-white font-bold text-xs uppercase underline underline-offset-4">Limpar</button>
              </div>
            </>
          ) : gameState === 'flop' ? (
            <div className="w-full flex justify-center gap-4 md:gap-8">
               <button 
                onClick={handleFold}
                className="flex-1 max-w-[200px] py-4 md:py-6 bg-zinc-800 text-white font-black text-xl rounded-2xl shadow-xl hover:bg-zinc-700 active:scale-95 transition-all uppercase italic"
               >
                 FOLD
               </button>
               <button 
                onClick={handleCall}
                className="flex-1 max-w-[400px] py-4 md:py-6 bg-yellow-500 text-black font-black text-xl md:text-2xl rounded-2xl shadow-[0_10px_40px_rgba(234,179,8,0.4)] hover:bg-yellow-400 active:scale-95 transition-all uppercase italic tracking-tighter"
               >
                 CALL (R$ {anteBet * 2})
               </button>
            </div>
          ) : (
            <div className="w-full flex justify-center">
               <button 
                onClick={resetGame}
                className="px-12 md:px-24 py-4 md:py-6 bg-yellow-500 text-black font-black text-xl md:text-2xl rounded-2xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all uppercase italic"
               >
                 NOVA PARTIDA
               </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default PokerGame;
