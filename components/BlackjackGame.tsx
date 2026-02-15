
import React, { useState, useEffect, useRef } from 'react';

interface Card {
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
  rank: string;
  value: number;
}

interface BlackjackGameProps {
  userBalance: number;
  onClose: () => void;
  onUpdateBalance: (amount: number) => void;
}

const SUITS: Card['suit'][] = ['hearts', 'diamonds', 'clubs', 'spades'];
const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

const BlackjackGame: React.FC<BlackjackGameProps> = ({ userBalance, onClose, onUpdateBalance }) => {
  const [gameState, setGameState] = useState<'betting' | 'playing' | 'dealer_turn' | 'ended'>('betting');
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [deck, setDeck] = useState<Card[]>([]);
  const [currentBet, setCurrentBet] = useState(0);
  const [selectedChip, setSelectedChip] = useState(10);
  const [message, setMessage] = useState('Escolha sua aposta');
  const [isMuted, setIsMuted] = useState(() => localStorage.getItem('bj_muted') === 'true');

  const audioContextRef = useRef<AudioContext | null>(null);

  const initAudio = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  };

  const playSound = (type: 'chip' | 'card' | 'win' | 'lose' | 'click') => {
    if (isMuted) return;
    initAudio();
    const ctx = audioContextRef.current!;
    if (ctx.state === 'suspended') ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    if (type === 'card') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    } else if (type === 'chip') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
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

  const createDeck = () => {
    const newDeck: Card[] = [];
    for (let i = 0; i < 6; i++) { // 6 Decks
      SUITS.forEach(suit => {
        RANKS.forEach(rank => {
          let value = parseInt(rank);
          if (rank === 'A') value = 11;
          else if (['J', 'Q', 'K'].includes(rank)) value = 10;
          newDeck.push({ suit, rank, value });
        });
      });
    }
    return newDeck.sort(() => Math.random() - 0.5);
  };

  const calculateScore = (hand: Card[]) => {
    let score = hand.reduce((sum, card) => sum + card.value, 0);
    let aces = hand.filter(card => card.rank === 'A').length;
    while (score > 21 && aces > 0) {
      score -= 10;
      aces--;
    }
    return score;
  };

  const startRound = () => {
    if (currentBet === 0) return;
    onUpdateBalance(-currentBet);
    const newDeck = createDeck();
    const p1 = newDeck.pop()!;
    const d1 = newDeck.pop()!;
    const p2 = newDeck.pop()!;
    const d2 = newDeck.pop()!;

    setPlayerHand([p1, p2]);
    setDealerHand([d1, d2]);
    setDeck(newDeck);
    setGameState('playing');
    setMessage('Sua vez');
    playSound('card');

    if (calculateScore([p1, p2]) === 21) {
      handleStand([p1, p2], [d1, d2], newDeck);
    }
  };

  const handleHit = () => {
    if (gameState !== 'playing') return;
    playSound('card');
    const newDeck = [...deck];
    const newCard = newDeck.pop()!;
    const newHand = [...playerHand, newCard];
    setPlayerHand(newHand);
    setDeck(newDeck);

    if (calculateScore(newHand) > 21) {
      endGame('bust');
    }
  };

  const handleStand = (pHand = playerHand, dHand = dealerHand, currentDeck = deck) => {
    setGameState('dealer_turn');
    setMessage('Dealer jogando...');
    
    let tempDealerHand = [...dHand];
    let tempDeck = [...currentDeck];

    const dealerPlay = () => {
      const score = calculateScore(tempDealerHand);
      if (score < 17) {
        playSound('card');
        tempDealerHand.push(tempDeck.pop()!);
        setDealerHand([...tempDealerHand]);
        setTimeout(dealerPlay, 800);
      } else {
        determineWinner(pHand, tempDealerHand);
      }
    };

    setTimeout(dealerPlay, 800);
  };

  const handleDouble = () => {
    if (gameState !== 'playing' || userBalance < currentBet || playerHand.length !== 2) return;
    onUpdateBalance(-currentBet);
    setCurrentBet(currentBet * 2);
    playSound('card');
    const newDeck = [...deck];
    const newCard = newDeck.pop()!;
    const newHand = [...playerHand, newCard];
    setPlayerHand(newHand);
    setDeck(newDeck);

    if (calculateScore(newHand) > 21) {
      endGame('bust');
    } else {
      handleStand(newHand, dealerHand, newDeck);
    }
  };

  const determineWinner = (pHand: Card[], dHand: Card[]) => {
    const pScore = calculateScore(pHand);
    const dScore = calculateScore(dHand);

    if (dScore > 21 || pScore > dScore) endGame('win', pScore === 21 && pHand.length === 2);
    else if (pScore === dScore) endGame('push');
    else endGame('lose');
  };

  const endGame = (result: 'win' | 'lose' | 'push' | 'bust', isBlackjack = false) => {
    setGameState('ended');
    if (result === 'win') {
      const payout = isBlackjack ? currentBet * 2.5 : currentBet * 2;
      onUpdateBalance(payout);
      setMessage(isBlackjack ? 'BLACKJACK! 🔥' : 'Você Venceu! 🎉');
      playSound('win');
    } else if (result === 'push') {
      onUpdateBalance(currentBet);
      setMessage('Empate (Push) 🤝');
    } else if (result === 'bust') {
      setMessage('Estourou! (Bust) 💥');
    } else {
      setMessage('Dealer Venceu 😔');
    }
  };

  const resetGame = () => {
    setGameState('betting');
    setPlayerHand([]);
    setDealerHand([]);
    setCurrentBet(0);
    setMessage('Escolha sua aposta');
  };

  const addBet = (val: number) => {
    if (gameState !== 'betting') return;
    if (userBalance < val) return;
    playSound('chip');
    setCurrentBet(prev => prev + val);
  };

  const renderCard = (card: Card, hidden = false) => (
    <div className={`relative w-20 h-28 md:w-24 md:h-36 rounded-xl border-2 shadow-2xl transition-all duration-500 transform ${hidden ? 'bg-gradient-to-br from-red-800 to-red-950 border-white/20' : 'bg-white border-gray-200 animate-slideUp'}`}>
      {!hidden ? (
        <div className={`p-2 flex flex-col h-full justify-between ${['hearts', 'diamonds'].includes(card.suit) ? 'text-red-600' : 'text-black'}`}>
          <div className="text-xl font-bold leading-none">{card.rank}</div>
          <div className="text-4xl self-center">
            {card.suit === 'hearts' && '♥'}
            {card.suit === 'diamonds' && '♦'}
            {card.suit === 'clubs' && '♣'}
            {card.suit === 'spades' && '♠'}
          </div>
          <div className="text-xl font-bold leading-none self-end rotate-180">{card.rank}</div>
        </div>
      ) : (
        <div className="h-full w-full flex items-center justify-center">
          <div className="w-12 h-16 border-2 border-white/10 rounded-lg flex items-center justify-center opacity-20 rotate-12">
            <span className="font-black italic text-white text-xl">KK</span>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 z-[110] bg-[#0d0e12] flex flex-col overflow-hidden animate-fadeIn select-none font-sans text-white">
      {/* Wood Header */}
      <div className="bg-[#2c1810] border-b-4 border-[#1a0f0a] px-6 py-4 flex justify-between items-center shadow-2xl z-50">
        <div className="flex items-center gap-4">
           <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-lg flex items-center justify-center shadow-xl border-2 border-yellow-200/20">
              <i className="fa-solid fa-spade text-black text-2xl"></i>
           </div>
           <div>
              <h2 className="font-black text-2xl italic tracking-tighter uppercase leading-none text-yellow-500">BLACKJACK <span className="text-white">DELUXE</span></h2>
              <p className="text-[10px] text-yellow-600/70 font-black uppercase tracking-widest mt-1 leading-none">Dealer para no 17</p>
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

      {/* Table Area */}
      <div className="flex-1 relative bg-[#064e3b] m-4 md:m-8 rounded-[3rem] border-[12px] border-[#2c1810] shadow-[inset_0_0_100px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col items-center justify-center p-4">
          
          {/* Dealer Area */}
          <div className="flex flex-col items-center gap-4 mb-8">
            <div className="flex gap-2 min-h-[144px]">
              {dealerHand.map((card, i) => renderCard(card, gameState === 'playing' && i === 1))}
              {dealerHand.length === 0 && <div className="w-24 h-36 rounded-xl border-2 border-white/5 bg-black/10"></div>}
            </div>
            {dealerHand.length > 0 && gameState !== 'playing' && (
              <div className="bg-black/40 px-4 py-1 rounded-full border border-white/10 text-sm font-bold animate-fadeIn">
                DEALER: {calculateScore(dealerHand)}
              </div>
            )}
          </div>

          {/* Table Center Markings */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-10">
              <div className="border-[8px] border-white rounded-full w-[400px] h-[400px] flex items-center justify-center">
                  <span className="text-6xl font-black italic tracking-tighter text-white">KKVIP DELUXE</span>
              </div>
          </div>

          <div className="relative z-10 py-4 px-8 bg-black/20 rounded-2xl border border-white/5 mb-8 text-center animate-pulse">
             <h3 className="text-2xl md:text-4xl font-black italic uppercase tracking-tighter text-yellow-500">{message}</h3>
          </div>

          {/* Player Area */}
          <div className="flex flex-col items-center gap-4 mt-8">
            {playerHand.length > 0 && (
              <div className="bg-black/40 px-4 py-1 rounded-full border border-white/10 text-sm font-bold animate-fadeIn">
                VOCÊ: {calculateScore(playerHand)}
              </div>
            )}
            <div className="flex gap-2 min-h-[144px]">
              {playerHand.map(card => renderCard(card))}
              {playerHand.length === 0 && (
                <div className="flex flex-col items-center">
                   <div className="w-24 h-36 rounded-xl border-2 border-dashed border-white/10 flex items-center justify-center">
                      <i className="fa-solid fa-plus text-white/5 text-4xl"></i>
                   </div>
                   <p className="text-[10px] text-white/20 font-black uppercase mt-2">Coloque sua aposta</p>
                </div>
              )}
            </div>
          </div>
      </div>

      {/* Control Panel */}
      <div className="bg-[#1a0f0a] border-t-4 border-[#2c1810] p-6 shadow-2xl z-50">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          
          {gameState === 'betting' ? (
            <>
              <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                {[1, 5, 10, 50, 100, 500].map(val => (
                  <button 
                    key={val}
                    onClick={() => addBet(val)}
                    className={`w-14 h-14 md:w-16 md:h-16 rounded-full border-4 flex items-center justify-center font-black text-sm transition-all active:scale-90 shadow-xl
                      ${val === 1 ? 'bg-blue-600' : val === 5 ? 'bg-red-600' : val === 10 ? 'bg-green-600' : val === 50 ? 'bg-purple-600' : val === 100 ? 'bg-zinc-800' : 'bg-yellow-600'}
                      border-black/20 hover:scale-110`}
                  >
                    {val}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-4 flex-1 justify-center">
                <div className="text-center bg-black/40 px-8 py-3 rounded-2xl border border-white/5">
                  <p className="text-[10px] text-gray-500 font-black uppercase mb-1">APOSTA TOTAL</p>
                  <p className="text-2xl font-mono font-black text-yellow-500">R$ {currentBet.toFixed(2)}</p>
                </div>
                <button 
                  onClick={startRound}
                  disabled={currentBet === 0}
                  className="px-12 py-5 bg-gradient-to-b from-yellow-400 to-amber-600 text-black font-black text-xl rounded-2xl shadow-xl hover:scale-105 active:scale-95 disabled:opacity-30 transition-all uppercase tracking-tighter italic"
                >
                  DAR CARTAS
                </button>
                <button onClick={() => setCurrentBet(0)} className="text-gray-500 hover:text-white font-bold text-sm uppercase">Limpar</button>
              </div>
            </>
          ) : gameState === 'ended' ? (
            <div className="w-full flex justify-center">
               <button 
                onClick={resetGame}
                className="px-20 py-5 bg-yellow-500 text-black font-black text-xl rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all uppercase italic"
               >
                 NOVA RODADA
               </button>
            </div>
          ) : (
            <div className="w-full flex justify-center gap-4">
              <button 
                onClick={handleHit}
                disabled={gameState !== 'playing'}
                className="flex-1 md:flex-none md:w-48 py-5 bg-white text-black font-black text-xl rounded-2xl shadow-xl hover:bg-gray-200 active:scale-95 disabled:opacity-30 transition-all uppercase italic"
              >
                PEDIR (HIT)
              </button>
              <button 
                onClick={() => handleStand()}
                disabled={gameState !== 'playing'}
                className="flex-1 md:flex-none md:w-48 py-5 bg-yellow-500 text-black font-black text-xl rounded-2xl shadow-xl hover:bg-yellow-400 active:scale-95 disabled:opacity-30 transition-all uppercase italic"
              >
                PARAR (STAND)
              </button>
              {playerHand.length === 2 && (
                <button 
                  onClick={handleDouble}
                  disabled={gameState !== 'playing' || userBalance < currentBet}
                  className="flex-1 md:flex-none md:w-48 py-5 bg-blue-600 text-white font-black text-xl rounded-2xl shadow-xl hover:bg-blue-500 active:scale-95 disabled:opacity-30 transition-all uppercase italic"
                >
                  DOBRAR (x2)
                </button>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default BlackjackGame;
