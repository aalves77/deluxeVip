
import React from 'react';
import { Game } from '../types';

interface GameCardProps {
  game: Game;
  onPlay: () => void;
}

const GameCard: React.FC<GameCardProps> = ({ game, onPlay }) => {
  return (
    <div 
      onClick={onPlay}
      className="group relative bg-[#1a1b23] rounded-2xl overflow-hidden casino-card-hover cursor-pointer aspect-[3/4]"
    >
      <img 
        src={game.image} 
        alt={game.name}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
      />
      
      {/* Badges */}
      <div className="absolute top-2 left-2 flex flex-col gap-1">
        {game.isHot && (
          <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-lg uppercase">Hot</span>
        )}
        {game.isNew && (
          <span className="bg-green-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-lg uppercase">Novo</span>
        )}
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
        <h4 className="font-bold text-sm truncate">{game.name}</h4>
        <p className="text-[10px] text-gray-400">{game.provider}</p>
        <div className="flex items-center gap-1 mt-2">
            <i className="fa-solid fa-star text-yellow-500 text-[10px]"></i>
            <span className="text-[10px] font-bold">{game.rating}</span>
        </div>
        <button className="mt-2 w-full bg-yellow-500 text-black py-1.5 rounded-lg font-bold text-xs transform translate-y-4 group-hover:translate-y-0 transition-transform">
          JOGAR AGORA
        </button>
      </div>

      {/* Bottom bar (always visible on desktop/mobile) */}
      <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/60 backdrop-blur-sm group-hover:opacity-0 transition-opacity">
        <p className="text-[11px] font-bold truncate text-center">{game.name}</p>
      </div>
    </div>
  );
};

export default GameCard;
