
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';

const CasinoAIChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([
    { role: 'ai', text: 'Olá! Sou o assistente DeluxeVip. Precisa de dicas sobre algum jogo ou ajuda com bônus?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setInput('');
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: userMessage,
        config: {
          systemInstruction: `
            Você é o assistente virtual do cassino DeluxeVip.
            Seu tom é entusiasmado, profissional e acolhedor.
            Você ajuda os usuários com:
            1. Explicações sobre jogos como Roleta, Blackjack, e Slots (ex: Gates of Olympus).
            2. Informações genéricas sobre bônus e fidelidade VIP.
            3. Dicas de jogo responsável.
            4. Nunca prometa ganhos garantidos. 
            5. Responda em Português do Brasil de forma concisa.
          `,
        },
      });

      const aiText = response.text || "Desculpe, estou com uma instabilidade momentânea. Tente novamente!";
      setMessages(prev => [...prev, { role: 'ai', text: aiText }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'ai', text: "Houve um erro ao processar sua pergunta. Por favor, tente novamente." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-24 md:bottom-8 right-8 z-[60] w-14 h-14 bg-yellow-500 text-black rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all animate-bounce"
      >
        <i className={`fa-solid ${isOpen ? 'fa-xmark' : 'fa-robot'} text-2xl`}></i>
      </button>

      {isOpen && (
        <div className="fixed bottom-40 md:bottom-24 right-4 md:right-8 z-[60] w-[calc(100%-2rem)] md:w-96 h-[500px] bg-[#1a1b23] border border-gray-700 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden animate-slideUp">
          <div className="p-4 bg-gradient-to-r from-yellow-500 to-amber-600 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
                <i className="fa-solid fa-robot text-yellow-500"></i>
              </div>
              <div>
                <p className="font-bold text-black leading-tight">DeluxeVip AI Assistant</p>
                <p className="text-[10px] text-black/70 font-bold uppercase tracking-widest">Online Agora</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-black/50 hover:text-black">
              <i className="fa-solid fa-chevron-down"></i>
            </button>
          </div>

          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-[#0d0e12]/50"
          >
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`
                  max-w-[80%] p-3 rounded-2xl text-sm
                  ${m.role === 'user' 
                    ? 'bg-yellow-500 text-black rounded-tr-none font-medium' 
                    : 'bg-[#252631] text-gray-200 rounded-tl-none border border-gray-700'
                  }
                `}>
                  {m.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-[#252631] p-3 rounded-2xl flex gap-1 animate-pulse">
                  <div className="w-1.5 h-1.5 bg-gray-500 rounded-full"></div>
                  <div className="w-1.5 h-1.5 bg-gray-500 rounded-full"></div>
                  <div className="w-1.5 h-1.5 bg-gray-500 rounded-full"></div>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 bg-[#1a1b23] border-t border-gray-800 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Pergunte algo ao AI..."
              className="flex-1 bg-[#0d0e12] border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-yellow-500"
            />
            <button
              onClick={handleSend}
              disabled={isLoading}
              className="bg-yellow-500 text-black px-4 rounded-xl font-bold hover:bg-yellow-400 disabled:opacity-50"
            >
              <i className="fa-solid fa-paper-plane"></i>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default CasinoAIChat;
