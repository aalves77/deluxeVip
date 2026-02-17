
import React, { useState } from 'react';
import { User } from '../types';

interface AuthModalProps {
  onClose: () => void;
  onLogin: (user: User, isNewRegistration?: boolean) => void;
  registrationBonus: number;
  existingUsers: User[];
}

const AuthModal: React.FC<AuthModalProps> = ({ onClose, onLogin, registrationBonus, existingUsers }) => {
  const [mode, setMode] = useState<'login' | 'register'>('register');
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    phone: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUsername = formData.username.trim().toLowerCase();
    
    if (mode === 'register') {
      if (formData.password !== formData.confirmPassword) {
        alert('As senhas não coincidem!');
        return;
      }
      if (cleanUsername.length < 3) {
        alert('Nome de usuário muito curto (mínimo 3 caracteres).');
        return;
      }
      // Verifica se o usuário já existe na lista global
      if (existingUsers.some(u => u.username.toLowerCase() === cleanUsername)) {
        alert('Este nome de usuário já está cadastrado. Tente fazer login!');
        setMode('login');
        return;
      }

      const newUser: User = {
        username: cleanUsername,
        phone: formData.phone,
        balance: registrationBonus,
        vipLevel: 1,
        totalDeposited: 0,
        betHistory: [],
        claimedVipRewards: [],
        isLoggedIn: true,
        isAdmin: false, 
        password: formData.password,
        tournamentScore: 0
      };
      
      onLogin(newUser, true);
    } else {
      // Lógica de Login
      const foundUser = existingUsers.find(u => u.username.toLowerCase() === cleanUsername);
      if (foundUser) {
        if (foundUser.password === formData.password) {
          onLogin({ ...foundUser, isLoggedIn: true }, false);
        } else {
          alert('Senha incorreta!');
        }
      } else {
        alert('Usuário não encontrado. Crie uma conta primeiro!');
        setMode('register');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-fadeIn">
      <div className="bg-[#1a1b23] w-full max-w-md rounded-[3rem] border border-gray-800 shadow-[0_0_80px_rgba(234,179,8,0.2)] overflow-hidden">
        <div className="p-8 text-center relative">
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors"
          >
            <i className="fa-solid fa-xmark text-2xl"></i>
          </button>

          <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-2xl mx-auto flex items-center justify-center shadow-2xl mb-6">
            <span className="text-black font-black text-3xl italic">D</span>
          </div>

          <h2 className="text-3xl font-black italic tracking-tighter uppercase mb-2">
            {mode === 'register' ? 'Criar Conta' : 'Acessar Conta'}
          </h2>
          <p className="text-gray-400 text-sm font-bold uppercase tracking-widest mb-8">
            {mode === 'register' ? `Receba R$ ${registrationBonus.toFixed(2)} de bônus` : 'Bem-vindo de volta!'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative text-left">
              <label className="text-[10px] text-gray-500 font-black uppercase ml-4 mb-1 block">Usuário</label>
              <div className="relative">
                <i className="fa-solid fa-user absolute left-5 top-1/2 -translate-y-1/2 text-gray-500"></i>
                <input
                  required
                  type="text"
                  placeholder="Seu username"
                  className="w-full bg-[#0d0e12] border-2 border-gray-800 rounded-2xl py-4 pl-14 pr-4 font-bold text-white focus:outline-none focus:border-yellow-500 transition-colors"
                  value={formData.username}
                  onChange={e => setFormData({...formData, username: e.target.value})}
                />
              </div>
            </div>

            {mode === 'register' && (
              <div className="relative text-left">
                <label className="text-[10px] text-gray-500 font-black uppercase ml-4 mb-1 block">Telefone</label>
                <div className="relative">
                  <i className="fa-solid fa-phone absolute left-5 top-1/2 -translate-y-1/2 text-gray-500"></i>
                  <input
                    required
                    type="tel"
                    placeholder="DDD + Número"
                    className="w-full bg-[#0d0e12] border-2 border-gray-800 rounded-2xl py-4 pl-14 pr-4 font-bold text-white focus:outline-none focus:border-yellow-500 transition-colors"
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
              </div>
            )}

            <div className="relative text-left">
              <label className="text-[10px] text-gray-500 font-black uppercase ml-4 mb-1 block">Senha</label>
              <div className="relative">
                <i className="fa-solid fa-lock absolute left-5 top-1/2 -translate-y-1/2 text-gray-500"></i>
                <input
                  required
                  type="password"
                  placeholder="Sua senha secreta"
                  className="w-full bg-[#0d0e12] border-2 border-gray-800 rounded-2xl py-4 pl-14 pr-4 font-bold text-white focus:outline-none focus:border-yellow-500 transition-colors"
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                />
              </div>
            </div>

            {mode === 'register' && (
              <div className="relative text-left">
                <label className="text-[10px] text-gray-500 font-black uppercase ml-4 mb-1 block">Confirmar Senha</label>
                <div className="relative">
                  <i className="fa-solid fa-check-double absolute left-5 top-1/2 -translate-y-1/2 text-gray-500"></i>
                  <input
                    required
                    type="password"
                    placeholder="Repita a senha"
                    className="w-full bg-[#0d0e12] border-2 border-gray-800 rounded-2xl py-4 pl-14 pr-4 font-bold text-white focus:outline-none focus:border-yellow-500 transition-colors"
                    value={formData.confirmPassword}
                    onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-5 bg-gradient-to-r from-yellow-500 to-amber-600 text-black font-black text-xl rounded-2xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all uppercase italic tracking-tighter"
            >
              {mode === 'register' ? 'CRIAR CONTA AGORA' : 'ENTRAR NO CASSINO'}
            </button>
          </form>

          <div className="mt-8 flex items-center justify-center gap-2">
            <span className="text-gray-500 text-sm font-bold">
              {mode === 'register' ? 'Já tem uma conta?' : 'Novo por aqui?'}
            </span>
            <button 
              onClick={() => setMode(mode === 'register' ? 'login' : 'register')}
              className="text-yellow-500 font-black text-sm uppercase hover:underline"
            >
              {mode === 'register' ? 'Fazer Login' : 'Cadastre-se'}
            </button>
          </div>
        </div>

        <div className="bg-black/40 p-6 text-center border-t border-gray-800">
           <p className="text-[9px] text-gray-600 font-black tracking-widest uppercase">
              🔐 Seus dados estão protegidos por criptografia de ponta
           </p>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
