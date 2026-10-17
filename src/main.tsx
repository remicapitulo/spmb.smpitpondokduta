import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register PWA Service Worker
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  registerSW({
    immediate: true,
    onNeedRefresh() {
      console.log('SPMB Pondok Duta PWA: Pembaharuan tersedia.');
    },
    onOfflineReady() {
      console.log('SPMB Pondok Duta PWA: Aplikasi siap dijalankan secara offline.');
    },
  });
}

createRoot(document.getElementById('root')!).render(<App />);
