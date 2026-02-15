
import React, { useState } from 'react';

interface WithdrawModalProps {
  userBalance: number;
  totalDeposited: number;
  onClose: () => void;
  onSuccess: (amount: number) => void;
}

const WithdrawModal: React.FC<WithdrawModalProps> = ({ userBalance, totalDeposited, onClose, onSuccess }) => {
  const [amount, setAmount] = useState<number>(0);
  const [pixKey, setPixKey] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleWithdraw = () => {
    if (totalDeposited < 20) {
      alert(`Atenção: Para realizar saques, você precisa ter um histórico de depósitos de no mínimo R$ 20,00.\nSeu total depositado atual: R$ ${totalDeposited.toFixed(2)}`);
      return;
    }
    if (!pixKey) return alert('Por favor, insira uma chave PIX válida.');
    if (amount < 50) return alert('O valor mínimo de saque é R$ 50,00.');
    if (amount > userBalance) return alert('Saldo insuficiente.');

    setIsProcessing(true);
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 5;
      setProgress(currentProgress);
      if (currentProgress >= 100) {
        clearInterval(interval);
        onSuccess(-amount);
        onClose();
      }
    }, 150);
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#1a1b23] w-full max-w-md rounded-[2.5rem] border border-gray-800 shadow-[0_0_60px_rgba(255,50,50,0.1)] overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-red-600 to-red-900 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <i className="fa-solid fa-money-bill-transfer text-white text-xl"></i>
            <h2 className="text-white font-black uppercase tracking-widest">SACAR FUNDOS</h2>
          </div>
          <button onClick={onClose} className="text-white/50 hover:text-white">
            <i className="fa-solid fa-circle-xmark text-2xl"></i>
          </button>
        </div>

        <div className="p-8">
          {!isProcessing ? (
            <div className="space-y-6 animate-slideUp">
              <div className="bg-yellow-500/5 p-4 rounded-2xl border border-yellow-500/20 text-center">
                <p className="text-gray-500 text-xs font-bold uppercase mb-1">Saldo Disponível</p>
                <p className="text-2xl font-black text-yellow-500">R$ {userBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>

              {totalDeposited < 20 && (
                <div className="bg-red-500/10 border border-red-500/50 p-3 rounded-xl">
                  <p className="text-[10px] text-red-500 font-black uppercase text-center">
                    <i className="fa-solid fa-triangle-exclamation mr-1"></i>
                    Saque bloqueado: Deposite R$ {(20 - totalDeposited).toFixed(2)} restantes para liberar.
                  </p>
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Sua Chave PIX</label>
                <input
                  type="text"
                  value={pixKey}
                  onChange={(e) => setPixKey(e.target.value)}
                  placeholder="CPF, Email, Telefone ou Aleatória"
                  className="w-full bg-[#0d0e12] border-2 border-gray-800 rounded-2xl py-4 px-6 font-bold text-white focus:outline-none focus:border-red-500 transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Valor do Saque</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-red-500 font-bold">R$</span>
                  <input
                    type="number"
                    value={amount || ''}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    placeholder="Mínimo R$ 50,00"
                    className="w-full bg-[#0d0e12] border-2 border-gray-800 rounded-2xl py-4 pl-12 pr-4 font-black text-xl text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div className="bg-gray-800/50 p-4 rounded-2xl text-[10px] text-gray-400 space-y-1">
                 <p className="flex items-center gap-2"><i className="fa-solid fa-circle-info"></i> Taxa de processamento: R$ 0,00</p>
                 <p className="flex items-center gap-2"><i className="fa-solid fa-clock"></i> Tempo estimado: 2 a 15 minutos</p>
                 <p className="flex items-center gap-2 font-bold text-yellow-500/80"><i className="fa-solid fa-lock"></i> Requisito: Mínimo R$ 20,00 em depósitos totais</p>
              </div>

              <button
                onClick={handleWithdraw}
                disabled={totalDeposited < 20}
                className={`w-full py-5 text-white font-black text-lg rounded-3xl shadow-xl transition-all ${totalDeposited < 20 ? 'bg-gray-700 cursor-not-allowed opacity-50' : 'bg-gradient-to-r from-red-600 to-red-500 hover:brightness-110 active:scale-95'}`}
              >
                SOLICITAR SAQUE
              </button>
            </div>
          ) : (
            <div className="py-12 flex flex-col items-center text-center animate-fadeIn">
               <div className="relative w-24 h-24 mb-6">
                  <svg className="w-full h-full -rotate-90">
                     <circle cx="50%" cy="50%" r="45%" stroke="#1f2937" strokeWidth="8" fill="none" />
                     <circle cx="50%" cy="50%" r="45%" stroke="#ef4444" strokeWidth="8" fill="none" strokeDasharray="283" strokeDashoffset={283 - (progress/100)*283} className="transition-all duration-300" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                     <i className="fa-solid fa-spinner animate-spin text-2xl text-red-500"></i>
                  </div>
               </div>
               <h3 className="text-xl font-black text-white mb-2">PROCESSANDO SAQUE</h3>
               <p className="text-gray-500 text-sm max-w-xs">Enviando R$ {amount.toFixed(2)} para sua conta via PIX...</p>
               <div className="mt-8 w-full bg-gray-800 h-1 rounded-full overflow-hidden">
                  <div className="bg-red-500 h-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WithdrawModal;