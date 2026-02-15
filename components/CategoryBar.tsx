
import React from 'react';
import { GameCategory } from '../types';

interface CategoryBarProps {
  active: GameCategory;
  onChange: (cat: GameCategory) => void;
}

const CategoryBar: React.FC<CategoryBarProps> = ({ active, onChange }) => {
  const categories = Object.values(GameCategory);

  const getIcon = (cat: GameCategory) => {
    switch(cat) {
      case GameCategory.ALL: return 'fa-grip';
      case GameCategory.SLOTS: return 'fa-clover';
      case GameCategory.LIVE: return 'fa-video';
      case GameCategory.SPORTS: return 'fa-futbol';
      case GameCategory.FISHING: return 'fa-fish';
      case GameCategory.TABLE: return 'fa-chess-board';
      default: return 'fa-dice';
    }
  };

  return (
    <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar scroll-smooth">
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onChange(cat)}
          className={`
            flex items-center gap-2 px-6 py-3 rounded-2xl whitespace-nowrap font-bold text-sm transition-all
            ${active === cat 
              ? 'bg-yellow-500 text-black shadow-[0_0_20px_rgba(234,179,8,0.3)] scale-105' 
              : 'bg-[#1a1b23] text-gray-400 hover:bg-gray-800'
            }
          `}
        >
          <i className={`fa-solid ${getIcon(cat)}`}></i>
          {cat}
        </button>
      ))}
    </div>
  );
};

export default CategoryBar;
