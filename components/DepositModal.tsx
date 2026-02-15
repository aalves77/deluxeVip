
import React, { useState } from 'react';

interface DepositModalProps {
  onClose: () => void;
  onSuccess: (amount: number) => void;
}

const QUICK_AMOUNTS = [20, 50, 100, 200, 500, 1000];

const DepositModal: React.FC<DepositModalProps> = ({ onClose, onSuccess }) => {
  const [amount, setAmount] = useState<number>(50);
  const [step, setStep] = useState<'select' | 'pix'>('select');
  const [isCopying, setIsCopying] = useState(false);

  const handleNext = () => {
    if (amount < 10) return alert('Valor mínimo de depósito é R$ 10,00');
    setStep('pix');
  };

  const handleConfirm = () => {
    onSuccess(amount);
    onClose();
  };

  const copyPix = () => {
    setIsCopying(true);
    setTimeout(() => setIsCopying(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#1a1b23] w-full max-w-md rounded-[2.5rem] border border-gray-800 shadow-[0_0_60px_rgba(234,179,8,0.2)] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-yellow-500 to-amber-600 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <i className="fa-solid fa-wallet text-black text-xl"></i>
            <h2 className="text-black font-black uppercase tracking-widest">DEPOSITAR</h2>
          </div>
          <button onClick={onClose} className="text-black/50 hover:text-black">
            <i className="fa-solid fa-circle-xmark text-2xl"></i>
          </button>
        </div>

        <div className="p-8 flex-1">
          {step === 'select' ? (
            <div className="space-y-6 animate-slideUp">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 block">Escolha o Valor</label>
                <div className="grid grid-cols-3 gap-3">
                  {QUICK_AMOUNTS.map(val => (
                    <button
                      key={val}
                      onClick={() => setAmount(val)}
                      className={`py-3 rounded-2xl font-black transition-all border-2 ${
                        amount === val 
                        ? 'bg-yellow-500 border-yellow-300 text-black shadow-[0_0_15px_rgba(234,179,8,0.4)]' 
                        : 'bg-[#0d0e12] border-gray-800 text-gray-400 hover:border-gray-600'
                      }`}
                    >
                      R$ {val}
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-yellow-500 font-bold">R$</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  placeholder="Outro valor..."
                  className="w-full bg-[#0d0e12] border-2 border-gray-800 rounded-2xl py-4 pl-12 pr-4 font-black text-xl text-white focus:outline-none focus:border-yellow-500 transition-colors"
                />
              </div>

              <div className="bg-blue-500/10 p-4 rounded-2xl border border-blue-500/20 flex items-center gap-4">
                <i className="fa-brands fa-pix text-blue-400 text-3xl"></i>
                <div className="text-xs text-blue-200">
                  <p className="font-bold">Pagamento Instantâneo via PIX</p>
                  <p className="opacity-60">Seu saldo será atualizado em até 1 minuto.</p>
                </div>
              </div>

              <button
                onClick={handleNext}
                className="w-full py-5 bg-yellow-500 text-black font-black text-lg rounded-3xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
              >
                GERAR PIX
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-6 animate-fadeIn">
               <div className="bg-white p-4 rounded-3xl shadow-2xl">
                  <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=kkvip-deluxe-simulated-pix" alt="QR Code PIX" className="w-48 h-48" />
               </div>
               
               <div className="text-center">
                  <p className="text-gray-500 text-xs font-bold uppercase mb-1">Valor do Depósito</p>
                  <p className="text-3xl font-black text-white italic">R$ {amount.toFixed(2)}</p>
               </div>

               <button
                 onClick={copyPix}
                 className="w-full bg-[#0d0e12] border-2 border-dashed border-yellow-500/50 p-4 rounded-2xl text-yellow-500 font-bold flex items-center justify-between hover:bg-yellow-500/10 transition-colors"
               >
                 <span className="truncate mr-4">00020101021226830014br.gov.bcb.pix...</span>
                 {isCopying ? <i className="fa-solid fa-check text-green-500"></i> : <i className="fa-solid fa-copy"></i>}
               </button>

               <button
                 onClick={handleConfirm}
                 className="w-full py-5 bg-green-600 text-white font-black text-lg rounded-3xl shadow-xl hover:bg-green-500 transition-all flex items-center justify-center gap-3"
               >
                 <i className="fa-solid fa-circle-check"></i>
                 JÁ PAGUEI
               </button>
               
               <button onClick={() => setStep('select')} className="text-gray-500 text-sm font-bold hover:text-white transition-colors">
                  Alterar valor
               </button>
            </div>
          )}
        </div>
        
        <div className="p-4 text-center bg-black/40 border-t border-gray-800">
          <p className="text-[10px] text-gray-600 font-bold tracking-widest uppercase">Pagamento Seguro via Gateway KKVIP</p>
        </div>
      </div>
    </div>
  );
};

export default DepositModal;
