
import React, { useState } from 'react';
import { User } from '../types';

interface AffiliatePageProps {
  user: User;
  onAuthOpen: () => void;
}

const AffiliatePage: React.FC<AffiliatePageProps> = ({ user, onAuthOpen }) => {
  const [isCopied, setIsCopied] = useState(false);
  
  // Link simulado baseado no username
  const referralLink = `https://deluxevip.casino/register?ref=${user.username || 'convite'}`;

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const shareWhatsApp = () => {
    const text = encodeURIComponent(`Ganhe R$ 10 agora para jogar no DeluxeVip! O melhor cassino do momento. Acesse: ${referralLink}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  if (!user.isLoggedIn) {
    return (
      <div className="p-4 md:p-12 flex flex-col items-center justify-center min-h-[70vh] text-center space-y-6">
        <div className="w-24 h-24 bg-yellow-500/10 rounded-full flex items-center justify-center text-yellow-500 text-4xl animate-pulse">
           <i className="fa-solid fa-share-nodes"></i>
        </div>
        <h2 className="text-3xl font-black uppercase italic tracking-tighter">Convide e Ganhe <span className="text-yellow-500">Comissões</span></h2>
        <p className="text-gray-400 max-w-md">Para começar a ganhar convidando amigos, você precisa estar logado em sua conta DeluxeVip.</p>
        <button 
          onClick={onAuthOpen}
          className="px-12 py-4 bg-yellow-500 text-black font-black rounded-2xl shadow-xl hover:scale-105 transition-all uppercase"
        >
          Entrar ou Cadastrar
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 animate-fadeIn max-w-6xl mx-auto space-y-8">
      {/* Hero Banner Afiliado */}
      <div className="relative bg-gradient-to-br from-[#1e1b4b] to-[#312e81] rounded-[3rem] p-8 md:p-12 border border-blue-500/20 shadow-2xl overflow-hidden text-center">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
        
        <h1 className="text-4xl md:text-7xl font-black italic tracking-tighter uppercase mb-4 leading-none">PROGRAMA DE <br/> <span className="text-yellow-500">PARCEIROS</span></h1>
        <p className="text-blue-200 font-bold uppercase tracking-[0.3em] mb-8 text-sm md:text-lg">Ganhe até R$ 20,00 por cada amigo que depositar</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
           <div className="bg-black/40 backdrop-blur-md p-6 rounded-3xl border border-white/5">
              <p className="text-[10px] text-gray-500 font-black uppercase mb-1">Convidados</p>
              <p className="text-3xl font-black text-white">12</p>
           </div>
           <div className="bg-black/40 backdrop-blur-md p-6 rounded-3xl border border-white/5">
              <p className="text-[10px] text-gray-500 font-black uppercase mb-1">Total Ganho</p>
              <p className="text-3xl font-black text-green-500">R$ 145,00</p>
           </div>
           <div className="bg-black/40 backdrop-blur-md p-6 rounded-3xl border border-white/5">
              <p className="text-[10px] text-gray-500 font-black uppercase mb-1">Disponível</p>
              <p className="text-3xl font-black text-yellow-500">R$ 45,00</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Lado Esquerdo: Compartilhamento */}
        <div className="bg-[#1a1b23] rounded-[2.5rem] p-8 border border-gray-800 space-y-8">
           <h3 className="text-xl font-black uppercase italic text-yellow-500 flex items-center gap-2">
             <i className="fa-solid fa-link"></i> Seu Link de Convite
           </h3>

           <div className="bg-[#0d0e12] border-2 border-gray-800 p-5 rounded-3xl flex items-center justify-between gap-4 group hover:border-yellow-500/50 transition-all">
              <span className="text-gray-400 font-bold text-sm truncate">{referralLink}</span>
              <button 
                onClick={copyLink}
                className="bg-yellow-500 text-black px-6 py-2.5 rounded-xl font-black text-xs uppercase hover:brightness-110 active:scale-90 transition-all"
              >
                {isCopied ? 'COPIADO!' : 'COPIAR'}
              </button>
           </div>

           <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={shareWhatsApp}
                className="py-4 bg-[#25D366] text-white rounded-2xl font-black uppercase text-xs flex items-center justify-center gap-3 hover:brightness-110 transition-all"
              >
                <i className="fa-brands fa-whatsapp text-xl"></i> WhatsApp
              </button>
              <button className="py-4 bg-[#0088cc] text-white rounded-2xl font-black uppercase text-xs flex items-center justify-center gap-3 hover:brightness-110 transition-all">
                <i className="fa-brands fa-telegram text-xl"></i> Telegram
              </button>
           </div>

           <div className="flex flex-col items-center pt-4 space-y-4">
              <div className="bg-white p-4 rounded-3xl shadow-xl">
                 <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${referralLink}`} alt="QR Code" className="w-32 h-32" />
              </div>
              <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Aponte a câmera para convidar</p>
           </div>
        </div>

        {/* Lado Direito: Regras/Passos */}
        <div className="bg-[#1a1b23] rounded-[2.5rem] p-8 border border-gray-800 flex flex-col justify-between">
           <h3 className="text-xl font-black uppercase italic text-yellow-500 mb-8">Como funciona?</h3>
           
           <div className="space-y-6">
              <div className="flex gap-6 items-center">
                 <div className="w-12 h-12 bg-yellow-500 text-black rounded-2xl flex items-center justify-center font-black text-xl shadow-lg shrink-0">1</div>
                 <div>
                    <p className="font-black uppercase text-sm">Envie o Link</p>
                    <p className="text-xs text-gray-500 font-bold">Compartilhe seu link único com seus amigos ou em suas redes sociais.</p>
                 </div>
              </div>
              <div className="flex gap-6 items-center">
                 <div className="w-12 h-12 bg-yellow-500 text-black rounded-2xl flex items-center justify-center font-black text-xl shadow-lg shrink-0">2</div>
                 <div>
                    <p className="font-black uppercase text-sm">Amigo se Registra</p>
                    <p className="text-xs text-gray-500 font-bold">Seu convidado deve criar uma conta utilizando o seu link de parceiro.</p>
                 </div>
              </div>
              <div className="flex gap-6 items-center">
                 <div className="w-12 h-12 bg-yellow-500 text-black rounded-2xl flex items-center justify-center font-black text-xl shadow-lg shrink-0">3</div>
                 <div>
                    <p className="font-black uppercase text-sm">Receba o Bônus</p>
                    <p className="text-xs text-gray-500 font-bold">Quando seu amigo fizer o primeiro depósito, você recebe R$ 20,00 direto no seu saldo!</p>
                 </div>
              </div>
           </div>

           <div className="mt-8 bg-black/40 p-6 rounded-3xl border border-white/5">
              <div className="flex items-center justify-between mb-4">
                 <span className="text-xs font-black uppercase text-gray-500">Seu Progresso de Nível</span>
                 <span className="text-xs font-black text-yellow-500 italic">Embaixador</span>
              </div>
              <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden mb-2">
                 <div className="bg-yellow-500 h-full w-[45%]"></div>
              </div>
              <p className="text-[10px] text-gray-600 font-bold text-center uppercase tracking-widest">Faltam 8 convites para o próximo nível</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AffiliatePage;
