
import React, { useState, useRef } from 'react';
import { User } from '../types';

interface ProfilePageProps {
  user: User;
  onUpdateUser: (updates: Partial<User>) => void;
  onLogout: () => void;
}

const PRESET_AVATARS = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=King',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Tiger',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Gold',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Rich',
];

const ProfilePage: React.FC<ProfilePageProps> = ({ user, onUpdateUser, onLogout }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newUsername, setNewUsername] = useState(user.username);
  const [successMsg, setSuccessMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalBets = user.betHistory.filter(b => b.type === 'loss' || b.type === 'win').length;
  const totalWins = user.betHistory.filter(b => b.type === 'win').length;
  const winRate = totalBets > 0 ? (totalWins / totalBets) * 100 : 0;
  const biggestWin = user.betHistory
    .filter(b => b.type === 'win')
    .reduce((max, curr) => curr.amount > max ? curr.amount : max, 0);

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newUsername.length < 4) return alert('Nome muito curto!');
    onUpdateUser({ username: newUsername });
    setIsEditing(false);
    showSuccess('Nome atualizado!');
  };

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("A imagem deve ter menos de 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdateUser({ profileImage: reader.result as string });
        showSuccess('Foto de perfil atualizada!');
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="p-4 md:p-8 animate-fadeIn max-w-4xl mx-auto space-y-8 pb-24">
      {/* Header com Foto de Perfil */}
      <div className="flex flex-col md:flex-row items-center gap-8 mb-12 text-center md:text-left">
        <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-[2.5rem] overflow-hidden border-4 border-yellow-500/30 shadow-2xl relative bg-[#1a1b23] flex items-center justify-center">
            {user.profileImage ? (
              <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-6xl font-black">
                {user.username.charAt(0).toUpperCase()}
              </div>
            )}
            
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
               <i className="fa-solid fa-camera text-2xl text-yellow-500"></i>
               <span className="text-[10px] font-black uppercase text-white">Alterar Foto</span>
            </div>
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*" 
            onChange={handleFileChange} 
          />
        </div>
        
        <div className="flex-1">
          <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase leading-none mb-4">{user.username}</h1>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
            <span className="px-4 py-1.5 bg-yellow-500 text-black rounded-full text-xs font-black uppercase tracking-widest shadow-lg">
              VIP {user.vipLevel} DELUXE
            </span>
            <span className="px-4 py-1.5 bg-white/5 border border-white/10 text-gray-400 rounded-full text-xs font-bold uppercase tracking-widest">
              ID: {Math.floor(100000 + Math.random() * 900000)}
            </span>
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="bg-green-500/10 border border-green-500/50 p-4 rounded-2xl text-green-500 text-center font-bold animate-bounceIn shadow-xl">
          <i className="fa-solid fa-circle-check mr-2"></i>{successMsg}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Seção de Avatares Rápidos */}
        <div className="bg-[#1a1b23] rounded-[2.5rem] p-8 border border-gray-800 shadow-xl space-y-6">
          <h3 className="text-lg font-black italic uppercase text-yellow-500 flex items-center gap-2">
            <i className="fa-solid fa-id-badge"></i> Avatares Premium
          </h3>
          <div className="grid grid-cols-5 gap-3">
            {PRESET_AVATARS.map((avatar, idx) => (
              <button 
                key={idx}
                onClick={() => onUpdateUser({ profileImage: avatar })}
                className="w-full aspect-square rounded-2xl bg-black/20 border-2 border-transparent hover:border-yellow-500 transition-all overflow-hidden p-1 active:scale-90"
              >
                <img src={avatar} alt="Avatar" className="w-full h-full object-contain" />
              </button>
            ))}
          </div>
          <p className="text-[10px] text-gray-500 font-bold uppercase text-center">Ou clique na foto acima para usar uma própria</p>
        </div>

        {/* Configurações */}
        <div className="bg-[#1a1b23] rounded-[2.5rem] p-8 border border-gray-800 shadow-xl space-y-6">
          <h3 className="text-lg font-black italic uppercase text-yellow-500 flex items-center gap-2">
            <i className="fa-solid fa-user-gear"></i> Identidade
          </h3>
          
          {!isEditing ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center p-5 bg-black/40 rounded-3xl border border-white/5">
                <div>
                  <p className="text-[10px] text-gray-500 font-black uppercase mb-1">Nome na Plataforma</p>
                  <p className="font-black text-xl">{user.username}</p>
                </div>
                <button onClick={() => setIsEditing(true)} className="w-10 h-10 bg-yellow-500/10 text-yellow-500 rounded-xl flex items-center justify-center hover:bg-yellow-500 hover:text-black transition-all">
                  <i className="fa-solid fa-pen-to-square"></i>
                </button>
              </div>

              <button 
                onClick={onLogout}
                className="w-full py-5 bg-red-600/10 border border-red-600/20 text-red-500 rounded-3xl font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all group"
              >
                <i className="fa-solid fa-power-off mr-2 group-hover:rotate-180 transition-transform duration-500"></i>
                ENCERRAR SESSÃO
              </button>
            </div>
          ) : (
            <form onSubmit={handleUpdate} className="space-y-4 animate-fadeIn">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-2">Alterar Username</label>
                <input 
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full bg-[#0d0e12] border-2 border-gray-800 rounded-3xl py-5 px-6 font-black focus:border-yellow-500 outline-none transition-all text-white"
                />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="flex-1 py-5 bg-yellow-500 text-black font-black rounded-3xl uppercase italic tracking-tighter">SALVAR ALTERAÇÕES</button>
                <button type="button" onClick={() => setIsEditing(false)} className="px-8 py-5 bg-gray-800 rounded-3xl font-black uppercase text-xs">CANCELAR</button>
              </div>
            </form>
          )}
        </div>

        {/* Estatísticas (Card Largo) */}
        <div className="md:col-span-2 bg-gradient-to-br from-[#1a1b23] to-[#0d0e12] rounded-[3rem] p-8 border border-gray-800 shadow-2xl">
          <h3 className="text-xl font-black italic uppercase text-yellow-500 mb-8 flex items-center gap-2">
            <i className="fa-solid fa-chart-line"></i> Performance Deluxe
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-black/40 p-6 rounded-[2rem] border border-white/5 hover:border-yellow-500/20 transition-all">
              <p className="text-[10px] text-gray-500 font-black uppercase mb-2">Apostas Totais</p>
              <p className="text-3xl font-black">{totalBets}</p>
            </div>
            <div className="bg-black/40 p-6 rounded-[2rem] border border-white/5 hover:border-green-500/20 transition-all">
              <p className="text-[10px] text-gray-500 font-black uppercase mb-2">Taxa de Vitória</p>
              <p className="text-3xl font-black text-green-500">{winRate.toFixed(1)}%</p>
            </div>
            <div className="bg-black/40 p-6 rounded-[2rem] border border-white/5 hover:border-yellow-500/20 transition-all">
              <p className="text-[10px] text-gray-500 font-black uppercase mb-2">Maior Jackpot</p>
              <p className="text-3xl font-black text-yellow-500">R$ {biggestWin.toFixed(2)}</p>
            </div>
            <div className="bg-black/40 p-6 rounded-[2rem] border border-white/5 hover:border-blue-500/20 transition-all">
              <p className="text-[10px] text-gray-500 font-black uppercase mb-2">Volume Total</p>
              <p className="text-3xl font-black text-blue-500">R$ {user.totalDeposited.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
