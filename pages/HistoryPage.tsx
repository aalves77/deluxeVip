
import React from 'react';
import { BetHistoryItem } from '../types';

interface HistoryPageProps {
  history: BetHistoryItem[];
}

const HistoryPage: React.FC<HistoryPageProps> = ({ history }) => {
  const formatDate = (ts: number) => {
    const date = new Date(ts);
    return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusColor = (type: string) => {
    switch(type) {
      case 'win': return 'text-green-500';
      case 'deposit': return 'text-blue-500';
      case 'withdraw': return 'text-red-500';
      case 'loss': return 'text-gray-400';
      default: return 'text-white';
    }
  };

  const getIcon = (type: string) => {
    switch(type) {
      case 'win': return 'fa-circle-arrow-up';
      case 'deposit': return 'fa-circle-plus';
      case 'withdraw': return 'fa-circle-minus';
      case 'loss': return 'fa-circle-arrow-down';
      default: return 'fa-circle-dot';
    }
  };

  return (
    <div className="p-4 md:p-8 animate-fadeIn max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-yellow-500 rounded-2xl flex items-center justify-center shadow-lg shadow-yellow-500/20">
            <i className="fa-solid fa-clock-rotate-left text-black text-2xl"></i>
          </div>
          <div>
            <h1 className="text-3xl font-black italic tracking-tighter uppercase">HISTÓRICO <span className="text-yellow-500">DETALHADO</span></h1>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Suas últimas 50 transações e apostas</p>
          </div>
        </div>
      </div>

      <div className="bg-[#1a1b23] rounded-[2rem] border border-gray-800 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-black/20 border-b border-gray-800">
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-500">Transação</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-500">Data e Hora</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-500">Tipo</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-500 text-right">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {history.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center">
                    <div className="opacity-20">
                      <i className="fa-solid fa-receipt text-6xl mb-4 block"></i>
                      <p className="font-bold uppercase tracking-widest">Nenhuma atividade encontrada</p>
                    </div>
                  </td>
                </tr>
              ) : (
                history.map((item) => (
                  <tr key={item.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-black/40 ${getStatusColor(item.type)}`}>
                          <i className={`fa-solid ${getIcon(item.type)}`}></i>
                        </div>
                        <span className="font-bold text-sm text-white uppercase tracking-tighter">{item.gameName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-400 font-medium text-sm">
                      {formatDate(item.timestamp)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md bg-black/40 border border-white/5 ${getStatusColor(item.type)}`}>
                        {item.type === 'win' ? 'Vitória' : item.type === 'loss' ? 'Aposta' : item.type === 'deposit' ? 'Depósito' : 'Saque'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`font-mono font-black text-lg ${getStatusColor(item.type)}`}>
                        {item.type === 'win' || item.type === 'deposit' ? '+' : '-'} R$ {item.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="mt-8 bg-yellow-500/5 border border-yellow-500/10 p-6 rounded-3xl">
        <div className="flex items-start gap-4">
          <i className="fa-solid fa-circle-info text-yellow-500 text-xl mt-1"></i>
          <div>
            <h4 className="font-bold text-white mb-1 uppercase text-sm">Transparência Garantida</h4>
            <p className="text-gray-400 text-xs leading-relaxed">
              O DeluxeVip utiliza tecnologias de hashing para garantir que todas as rodadas sejam provadamente justas. 
              Qualquer divergência em seu saldo ou histórico, entre em contato com nosso suporte Deluxe 24/7 através do chat assistente.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoryPage;
