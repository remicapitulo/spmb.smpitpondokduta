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

// Pastikan orientasi layar tidak terkunci ke portrait pada Tablet / perangkat rotasi
if (typeof window !== 'undefined' && 'screen' in window && window.screen?.orientation && 'unlock' in window.screen.orientation) {
  try {
    window.screen.orientation.unlock();
  } catch {
    // Ignore if not supported by browser context
  }
}

createRoot(document.getElementById('root')!).render(<App />);
