
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import HeroSlider from '../components/HeroSlider';
import CategoryBar from '../components/CategoryBar';
import GameGrid from '../components/GameGrid';
import LiveWinners from '../components/LiveWinners';
import PlayerBetHistory from '../components/PlayerBetHistory';
import DailyBonusModal from '../components/DailyBonusModal';
import AviatorGame from '../components/AviatorGame';
import MinesGame from '../components/MinesGame';
import PenaltyShootGame from '../components/PenaltyShootGame';
import FortuneTigerGame from '../components/FortuneTigerGame';
import GatesOfOlympusGame from '../components/GatesOfOlympusGame';
import RouletteGame from '../components/RouletteGame';
import BlackjackGame from '../components/BlackjackGame';
import PokerGame from '../components/PokerGame';
import DepositModal from '../components/DepositModal';
import { GameCategory, User, Game } from '../types';

interface HomeProps {
  updateBalance: (amount: number, isDeposit?: boolean, metadata?: any) => void;
  user: User;
  games: Game[];
  onAuthOpen: () => void;
}

const Home: React.FC<HomeProps> = ({ updateBalance, user, games, onAuthOpen }) => {
  const [activeCategory, setActiveCategory] = useState<GameCategory>(GameCategory.ALL);
  const [activeSidebarTab, setActiveSidebarTab] = useState<'live' | 'personal'>('live');
  const [isBonusModalOpen, setIsBonusModalOpen] = useState(false);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isAviatorOpen, setIsAviatorOpen] = useState(false);
  const [isMinesOpen, setIsMinesOpen] = useState(false);
  const [isPenaltyOpen, setIsPenaltyOpen] = useState(false);
  const [isFortuneTigerOpen, setIsFortuneTigerOpen] = useState(false);
  const [isOlympusOpen, setIsOlympusOpen] = useState(false);
  const [isRouletteOpen, setIsRouletteOpen] = useState(false);
  const [isBlackjackOpen, setIsBlackjackOpen] = useState(false);
  const [isPokerOpen, setIsPokerOpen] = useState(false);

  const handleGamePlay = (gameId: string) => {
    if (!user.isLoggedIn) {
      onAuthOpen();
      return;
    }

    if (gameId === '9') setIsAviatorOpen(true);
    else if (gameId === '13') setIsMinesOpen(true);
    else if (gameId === '15') setIsPenaltyOpen(true);
    else if (gameId === '16') setIsFortuneTigerOpen(true);
    else if (gameId === '1') setIsOlympusOpen(true);
    else if (gameId === '17') setIsRouletteOpen(true);
    else if (gameId === '18') setIsBlackjackOpen(true);
    else if (gameId === '19') setIsPokerOpen(true);
    else alert('Este jogo está em manutenção.');
  };

  const handleDepositClick = () => {
    if (!user.isLoggedIn) onAuthOpen();
    else setIsDepositModalOpen(true);
  };

  const handleBonusClick = () => {
    if (!user.isLoggedIn) onAuthOpen();
    else setIsBonusModalOpen(true);
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      <HeroSlider />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button 
          onClick={handleDepositClick}
          className="bg-gradient-to-br from-yellow-500 to-amber-600 p-4 rounded-2xl flex items-center justify-center gap-3 shadow-lg hover:scale-[1.02] transition-transform group"
        >
          <i className="fa-solid fa-wallet text-black text-xl group-hover:rotate-12 transition-transform"></i>
          <span className="text-black font-black uppercase text-sm italic">Depósito Rápido</span>
        </button>
        <button 
          onClick={handleBonusClick}
          className="bg-[#1a1b23] border border-gray-800 p-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-gray-800 transition-colors"
        >
          <i className="fa-solid fa-gift text-yellow-500"></i>
          <span className="font-bold text-sm">Bônus Diário</span>
        </button>
        <div className="bg-[#1a1b23] border border-gray-800 p-4 rounded-2xl flex items-center justify-center gap-3 hidden md:flex">
          <i className="fa-solid fa-shield-halved text-blue-500"></i>
          <span className="font-bold text-sm">Jogo Seguro</span>
        </div>
        <div className="bg-[#1a1b23] border border-gray-800 p-4 rounded-2xl flex items-center justify-center gap-3 hidden md:flex">
          <i className="fa-solid fa-headset text-green-500"></i>
          <span className="font-bold text-sm">Suporte 24/7</span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 space-y-6">
          <CategoryBar active={activeCategory} onChange={setActiveCategory} />
          <GameGrid category={activeCategory} games={games} onPlay={handleGamePlay} />
        </div>

        <div className="w-full lg:w-80 space-y-6">
          <div className="bg-gradient-to-br from-[#1a1b23] to-[#0d0e12] rounded-2xl p-6 border border-gray-800 shadow-xl overflow-hidden relative text-center">
            <h3 className="text-lg font-black italic mb-2 text-yellow-500 uppercase text-shadow">KKVIP DELUXE</h3>
            <p className="text-xs text-gray-400 mb-4 font-bold uppercase tracking-wider">Aproveite bônus de até 200%</p>
            <button 
              onClick={handleDepositClick}
              className="w-full py-4 bg-yellow-500 text-black font-black rounded-xl shadow-[0_0_20px_rgba(234,179,8,0.3)] hover:brightness-110 active:scale-95 transition-all"
            >
              DEPOSITAR AGORA
            </button>
          </div>

          <div className="bg-[#1a1b23] rounded-2xl p-5 border border-gray-800 flex flex-col min-h-[400px]">
            <div className="flex gap-2 mb-4 p-1 bg-black/30 rounded-xl">
              <button 
                onClick={() => setActiveSidebarTab('live')}
                className={`flex-1 py-2 text-[10px] font-black uppercase rounded-lg transition-all ${activeSidebarTab === 'live' ? 'bg-yellow-500 text-black' : 'text-gray-500 hover:text-white'}`}
              >
                Geral
              </button>
              <button 
                onClick={() => setActiveSidebarTab('personal')}
                className={`flex-1 py-2 text-[10px] font-black uppercase rounded-lg transition-all ${activeSidebarTab === 'personal' ? 'bg-yellow-500 text-black' : 'text-gray-500 hover:text-white'}`}
              >
                Minhas Apostas
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto max-h-[500px] custom-scrollbar pr-1">
              {activeSidebarTab === 'live' ? (
                <LiveWinners />
              ) : (
                <>
                  <PlayerBetHistory history={user.betHistory} />
                  {user.betHistory.length > 0 && (
                    <Link to="/history" className="block mt-4 text-center py-3 bg-white/5 rounded-xl text-[10px] font-black uppercase text-gray-400 hover:text-yellow-500 transition-colors border border-white/5">
                      Ver Histórico Completo
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {isBonusModalOpen && <DailyBonusModal onClose={() => setIsBonusModalOpen(false)} onWin={(amt) => updateBalance(amt, false, { name: 'Roleta Diária', type: 'win' })} />}
      {isDepositModalOpen && <DepositModal onClose={() => setIsDepositModalOpen(false)} onSuccess={(amt) => updateBalance(amt, true)} />}
      
      {isAviatorOpen && <AviatorGame userBalance={user.balance} onClose={() => setIsAviatorOpen(false)} onUpdateBalance={(amt) => updateBalance(amt, false, { name: 'Aviator', type: amt > 0 ? 'win' : 'loss' })} />}
      {isMinesOpen && <MinesGame userBalance={user.balance} onClose={() => setIsMinesOpen(false)} onUpdateBalance={(amt) => updateBalance(amt, false, { name: 'Mines', type: amt > 0 ? 'win' : 'loss' })} />}
      {isPenaltyOpen && <PenaltyShootGame userBalance={user.balance} onClose={() => setIsPenaltyOpen(false)} onUpdateBalance={(amt) => updateBalance(amt, false, { name: 'Penalty Shoot', type: amt > 0 ? 'win' : 'loss' })} />}
      {isFortuneTigerOpen && <FortuneTigerGame userBalance={user.balance} onClose={() => setIsFortuneTigerOpen(false)} onUpdateBalance={(amt) => updateBalance(amt, false, { name: 'Fortune Tiger', type: amt > 0 ? 'win' : 'loss' })} />}
      {isOlympusOpen && <GatesOfOlympusGame userBalance={user.balance} onClose={() => setIsOlympusOpen(false)} onUpdateBalance={(amt) => updateBalance(amt, false, { name: 'Gates of Olympus', type: amt > 0 ? 'win' : 'loss' })} />}
      {isRouletteOpen && <RouletteGame userBalance={user.balance} onClose={() => setIsRouletteOpen(false)} onUpdateBalance={(amt) => updateBalance(amt, false, { name: 'Roulette Deluxe', type: amt > 0 ? 'win' : 'loss' })} />}
      {isBlackjackOpen && <BlackjackGame userBalance={user.balance} onClose={() => setIsBlackjackOpen(false)} onUpdateBalance={(amt) => updateBalance(amt, false, { name: 'Blackjack Deluxe', type: amt > 0 ? 'win' : 'loss' })} />}
      {isPokerOpen && <PokerGame userBalance={user.balance} onClose={() => setIsPokerOpen(false)} onUpdateBalance={(amt) => updateBalance(amt, false, { name: 'Texas Hold\'em', type: amt > 0 ? 'win' : 'loss' })} />}

      <footer className="mt-12 py-8 border-t border-gray-800 text-gray-500 text-xs text-center space-y-4">
        <p>© 2024 DeluxeVip - Jogue com responsabilidade (+18)</p>
      </footer>
    </div>
  );
};

export default Home;
