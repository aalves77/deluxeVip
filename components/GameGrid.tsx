
import React from 'react';
import { GameCategory, Game } from '../types';
import GameCard from './GameCard';

interface GameGridProps {
  category: GameCategory;
  games: Game[];
  onPlay: (gameId: string) => void;
}

const GameGrid: React.FC<GameGridProps> = ({ category, games, onPlay }) => {
  const filteredGames = category === GameCategory.ALL 
    ? games 
    : games.filter(g => g.category === category);

  // Filtra apenas jogos que estão ativos (não estão em manutenção)
  const activeGames = filteredGames.filter(g => g.isActive !== false);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {activeGames.map(game => (
        <GameCard key={game.id} game={game} onPlay={() => onPlay(game.id)} />
      ))}
      {activeGames.length === 0 && (
        <div className="col-span-full py-20 text-center opacity-30">
          <i className="fa-solid fa-ghost text-6xl mb-4"></i>
          <p className="font-black uppercase tracking-widest italic">Nenhum jogo ativo nesta categoria</p>
        </div>
      )}
    </div>
  );
};

export default GameGrid;
