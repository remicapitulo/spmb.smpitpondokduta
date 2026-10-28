import { useEffect, useState, useCallback } from 'react';

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

declare global {
  interface Window {
    __pwaDeferredPrompt?: BeforeInstallPromptEvent | null;
  }
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(() => {
    return typeof window !== 'undefined' && window.__pwaDeferredPrompt ? window.__pwaDeferredPrompt : null;
  });
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isInIframe, setIsInIframe] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if running in standalone mode (already installed)
    const checkStandalone = () => {
      const standalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        window.matchMedia('(display-mode: fullscreen)').matches ||
        window.matchMedia('(display-mode: minimal-ui)').matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true;
      setIsInstalled(standalone);
    };
    checkStandalone();

    // Check if running inside an iframe (e.g., AI Studio Preview window)
    try {
      setIsInIframe(window.self !== window.top);
    } catch {
      setIsInIframe(true);
    }

    // Detect device platforms (iOS, Android, Tablet, Desktop)
    const ua = window.navigator.userAgent.toLowerCase();
    const isIpadOS = window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1;
    const iosDetected = (/iphone|ipad|ipod/.test(ua) || isIpadOS) && !(window as unknown as { MSStream?: boolean }).MSStream;
    const androidDetected = /android/.test(ua);
    const tabletDetected =
      /ipad|tablet|playbook|silk/.test(ua) ||
      isIpadOS ||
      (androidDetected && !/mobile/.test(ua)) ||
      (window.innerWidth >= 600 && window.innerWidth <= 1024 && window.navigator.maxTouchPoints > 0);

    setIsIOS(iosDetected);
    setIsAndroid(androidDetected);
    setIsTablet(tabletDetected);

    // Sync with global prompt if already captured before component mounted
    if (window.__pwaDeferredPrompt) {
      setDeferredPrompt(window.__pwaDeferredPrompt);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      window.__pwaDeferredPrompt = promptEvent;
      setDeferredPrompt(promptEvent);
    };

    const handleGlobalPromptAvailable = () => {
      if (window.__pwaDeferredPrompt) {
        setDeferredPrompt(window.__pwaDeferredPrompt);
      }
    };

    const handleAppInstalled = () => {
      window.__pwaDeferredPrompt = null;
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('pwa-install-available', handleGlobalPromptAvailable);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('pwa-installed', handleAppInstalled);

    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleMediaChange = (e: MediaQueryListEvent) => {
      if (e.matches) setIsInstalled(true);
    };
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleMediaChange);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('pwa-install-available', handleGlobalPromptAvailable);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('pwa-installed', handleAppInstalled);
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleMediaChange);
      }
    };
  }, []);

  const install = useCallback(async (): Promise<boolean> => {
    const activePrompt = deferredPrompt || (typeof window !== 'undefined' ? window.__pwaDeferredPrompt : null);
    if (!activePrompt) return false;
    try {
      await activePrompt.prompt();
      const { outcome } = await activePrompt.userChoice;
      if (outcome === 'accepted') {
        window.__pwaDeferredPrompt = null;
        setIsInstalled(true);
        setDeferredPrompt(null);
        return true;
      }
    } catch (err) {
      console.warn('PWA install prompt error:', err);
    }
    return false;
  }, [deferredPrompt]);

  // Download a 1-click Desktop Shortcut (.url) launcher for Windows/Mac/Desktop
  const downloadDesktopShortcut = useCallback(() => {
    if (typeof window === 'undefined') return;
    const appUrl = window.location.origin + '/';
    const shortcutContent = `[InternetShortcut]\r\nURL=${appUrl}\r\nIconFile=${appUrl}favicon.ico\r\nIconIndex=0\r\n`;
    const blob = new Blob([shortcutContent], { type: 'application/internet-shortcut' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'SPMB SMPIT Pondok Duta.url';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  const hasPrompt = Boolean(deferredPrompt || (typeof window !== 'undefined' && window.__pwaDeferredPrompt));

  return {
    isInstallable: hasPrompt,
    isInstalled,
    isIOS,
    isAndroid,
    isTablet,
    isInIframe,
    install,
    downloadDesktopShortcut,
  };
}
