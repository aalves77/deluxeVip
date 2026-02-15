
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const BANNERS = [
  {
    id: 1,
    title: "BÔNUS DE BOAS-VINDAS",
    subtitle: "Ganhe até 200% no primeiro depósito",
    color: "from-blue-600 to-indigo-900",
    image: "https://picsum.photos/seed/casino1/1200/400",
    link: "/deposit"
  },
  {
    id: 2,
    title: "TORNEIO DE SLOTS",
    subtitle: "R$ 50.000,00 em prêmios semanais",
    color: "from-red-600 to-orange-900",
    image: "https://picsum.photos/seed/casino2/1200/400",
    link: "/promo"
  },
  {
    id: 3,
    title: "CASHBACK INFINITO",
    subtitle: "Receba 5% de volta em todas as apostas",
    color: "from-emerald-600 to-green-900",
    image: "https://picsum.photos/seed/casino3/1200/400",
    link: "/vip"
  }
];

const HeroSlider: React.FC = () => {
  const [current, setCurrent] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % BANNERS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleBannerClick = (link: string) => {
    if (link === '/deposit') {
      // O App.tsx lida com o DepositModal via estado, mas aqui podemos navegar para a Home
      // ou apenas fechar o modal se o link for acessado.
      navigate('/');
    } else {
      navigate(link);
    }
  };

  return (
    <div className="relative h-48 md:h-64 lg:h-80 w-full overflow-hidden rounded-3xl shadow-2xl">
      {BANNERS.map((banner, index) => (
        <div
          key={banner.id}
          className={`absolute inset-0 transition-opacity duration-1000 flex items-center ${
            index === current ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className={`absolute inset-0 bg-gradient-to-r ${banner.color} opacity-90 z-10`}></div>
          <img 
            src={banner.image} 
            className="absolute inset-0 w-full h-full object-cover"
            alt={banner.title}
          />
          <div className="relative z-20 px-8 md:px-16 space-y-2 md:space-y-4">
            <h2 className="text-2xl md:text-5xl font-black text-white italic tracking-tighter drop-shadow-md">
              {banner.title}
            </h2>
            <p className="text-sm md:text-xl text-white/80 font-medium">
              {banner.subtitle}
            </p>
            <button 
              onClick={() => handleBannerClick(banner.link)}
              className="bg-white text-black px-8 py-2 rounded-full font-bold shadow-lg hover:bg-yellow-400 transition-colors mt-2 text-sm md:text-base"
            >
              Aproveitar Agora
            </button>
          </div>
        </div>
      ))}

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex gap-2">
        {BANNERS.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === current ? 'bg-white w-8' : 'bg-white/30'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroSlider;
