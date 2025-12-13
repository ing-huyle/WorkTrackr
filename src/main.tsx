import { createRoot } from 'react-dom/client';
import './styles/_index.scss';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <App />,
);
