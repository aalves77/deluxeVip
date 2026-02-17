
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// Função de inicialização segura
const startApp = () => {
  const container = document.getElementById('root');
  if (!container) {
    console.error("Não foi possível encontrar o elemento #root para carregar o cassino.");
    return;
  }

  try {
    const root = createRoot(container);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (err) {
    console.error("Erro ao renderizar o App:", err);
  }
};

// Executa a inicialização
startApp();
