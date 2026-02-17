
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const container = document.getElementById('root');

if (container) {
  // Remove o loader HTML assim que o JS começa a rodar
  const root = createRoot(container);
  root.render(<App />);
} else {
  console.error("Erro fatal: Container #root não encontrado.");
}
