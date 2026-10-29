import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register PWA Service Worker
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  if (import.meta.env.PROD) {
    registerSW({
      immediate: true,
      onNeedRefresh() {
        console.log('SPMB Pondok Duta PWA: Pembaharuan tersedia.');
      },
      onOfflineReady() {
        console.log('SPMB Pondok Duta PWA: Aplikasi siap dijalankan secara offline.');
      },
    });
  } else {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => {
        // Ignore service worker registration errors in dev preview
      });
    });
  }
}

createRoot(document.getElementById('root')!).render(<App />);
