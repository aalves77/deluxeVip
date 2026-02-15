
import React from 'react';
import { Game, GameCategory, Winner } from './types';

export const GAMES: Game[] = [
  { 
    id: '1', 
    name: 'Jogo do Velho do Raio', 
    image: 'https://static.pragmaticplay.net/game_images/external/gatesofolympus.png', 
    category: GameCategory.SLOTS, 
    provider: 'Pragmatic Play', 
    rating: 4.9, 
    isHot: true 
  },
  { id: '16', name: 'Fortune Tiger', image: 'https://static.pragmaticplay.net/game_images/external/fortunetiger.png', category: GameCategory.SLOTS, provider: 'PG Soft', rating: 5.0, isHot: true, isNew: true },
  { id: '19', name: 'Texas Hold\'em Deluxe', image: 'https://picsum.photos/seed/poker_vip/300/400', category: GameCategory.TABLE, provider: 'KKVIP Originals', rating: 5.0, isHot: true, isNew: true },
  { id: '17', name: 'Roulette Deluxe', image: 'https://picsum.photos/seed/roulette_vip/300/400', category: GameCategory.TABLE, provider: 'KKVIP Originals', rating: 5.0, isHot: true, isNew: true },
  { id: '18', name: 'Blackjack Deluxe', image: 'https://picsum.photos/seed/blackjack_pro/300/400', category: GameCategory.TABLE, provider: 'KKVIP Originals', rating: 5.0, isHot: true, isNew: true },
  { id: '15', name: 'Penalty Shoot', image: 'https://picsum.photos/seed/penalty/300/400', category: GameCategory.SPORTS, provider: 'KKVIP Originals', rating: 5.0, isHot: true, isNew: true },
  { id: '13', name: 'Mines', image: 'https://picsum.photos/seed/minesgame/300/400', category: GameCategory.TABLE, provider: 'Spribe', rating: 4.9, isHot: true, isNew: true },
  { id: '9', name: 'Aviator', image: 'https://static.pragmaticplay.net/game_images/external/aviator.png', category: GameCategory.SPORTS, provider: 'Spribe', rating: 5.0, isHot: true },
];

export const WINNERS: Winner[] = [
  { id: 'w1', username: 'user_482***', amount: 1250.50, game: 'Jogo do Velho do Raio', time: '1m ago' },
  { id: 'w2', username: 'bet_king***', amount: 4800.00, game: 'Roulette Deluxe', time: '3m ago' },
  { id: 'w3', username: 'slot_fan***', amount: 350.20, game: 'Fortune Tiger', time: '5m ago' },
  { id: 'w4', username: 'rich_guy***', amount: 12000.00, game: 'Aviator', time: '8m ago' },
  { id: 'w5', username: 'lucky_99***', amount: 75.00, game: 'Mines', time: '10m ago' },
];

export const NAV_LINKS = [
  { icon: <i className="fa-solid fa-house"></i>, label: 'Início', path: '/' },
  { icon: <i className="fa-solid fa-share-nodes"></i>, label: 'Indique', path: '/invite' },
  { icon: <i className="fa-solid fa-trophy"></i>, label: 'Torneio', path: '/promo' },
  { icon: <i className="fa-solid fa-crown"></i>, label: 'VIP', path: '/vip' },
  { icon: <i className="fa-solid fa-wallet"></i>, label: 'Depósito', path: '/deposit' },
];

export interface VipLevel {
  level: number;
  requiredDeposit: number;
  reward: number;
  benefits: string[];
}

export const VIP_LEVELS: VipLevel[] = [
  { level: 1, requiredDeposit: 0, reward: 0, benefits: ["Saques em 24h", "Suporte Padrão"] },
  { level: 2, requiredDeposit: 100, reward: 10, benefits: ["Bônus Semanal 2%", "Saque Prioritário"] },
  { level: 3, requiredDeposit: 500, reward: 30, benefits: ["Gerente de Conta", "Bônus Semanal 5%"] },
  { level: 4, requiredDeposit: 2000, reward: 100, benefits: ["Cashback Diário 1%", "Convite para Torneios"] },
  { level: 5, requiredDeposit: 5000, reward: 250, benefits: ["Saque Instantâneo", "Bônus de Aniversário"] },
  { level: 6, requiredDeposit: 15000, reward: 750, benefits: ["Presentes Físicos", "Cashback Diário 2%"] },
  { level: 7, requiredDeposit: 50000, reward: 2000, benefits: ["Viagens Exclusivas", "Limite de Saque Ilimitado"] },
  { level: 8, requiredDeposit: 150000, reward: 5000, benefits: ["Atendimento VIP 24h", "Cashback Diário 5%"] },
  { level: 9, requiredDeposit: 500000, reward: 15000, benefits: ["Assistente Pessoal", "Eventos Internacionais"] },
  { level: 10, requiredDeposit: 1000000, reward: 50000, benefits: ["Status Diamante Negro", "Tudo Ilimitado"] },
];
