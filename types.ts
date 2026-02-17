
export interface Game {
  id: string;
  name: string;
  image: string;
  category: GameCategory;
  provider: string;
  rating: number;
  isHot?: boolean;
  isNew?: boolean;
  isActive?: boolean;
}

export enum GameCategory {
  ALL = 'TUDO',
  SLOTS = 'SLOTS',
  LIVE = 'AO VIVO',
  SPORTS = 'ESPORTES',
  FISHING = 'PESCA',
  TABLE = 'MESA'
}

export interface Winner {
  id: string;
  username: string;
  amount: number;
  game: string;
  time: string;
}

export interface BetHistoryItem {
  id: string;
  gameName: string;
  amount: number;
  type: 'win' | 'loss' | 'deposit' | 'withdraw';
  timestamp: number;
}

export interface LogItem {
  id: string;
  timestamp: number;
  category: 'SYSTEM' | 'USER' | 'GAME' | 'ADMIN' | 'MONEY';
  message: string;
  user?: string;
}

export interface User {
  username: string;
  phone?: string;
  balance: number;
  vipLevel: number;
  totalDeposited: number;
  betHistory: BetHistoryItem[];
  isLoggedIn: boolean;
  isAdmin?: boolean;
  password?: string;
  claimedVipRewards: number[];
  profileImage?: string;
  tournamentScore: number; 
  createdAt?: number; // Data de criação da conta
}
