import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { setDefaultOptions } from 'date-fns';
import { ptBR } from 'date-fns/locale';

setDefaultOptions({ locale: ptBR });

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
