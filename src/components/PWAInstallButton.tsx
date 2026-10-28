import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { usePWAInstall } from '../hooks/usePWAInstall';
import {
  Download,
  Smartphone,
  Laptop,
  Tablet,
  Share2,
  PlusSquare,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  X,
} from 'lucide-react';

interface Props {
  variant?: 'navbar' | 'hero' | 'compact' | 'dropdown' | 'floating';
  className?: string;
  onAction?: () => void;
}

export const PWAInstallButton: React.FC<Props> = ({
  variant = 'navbar',
  className = '',
  onAction,
}) => {
  const {
    isInstallable,
    isInstalled,
    isIOS,
    isInIframe,
    install,
    downloadDesktopShortcut,
  } = usePWAInstall();

  const [showGuide, setShowGuide] = useState(false);
  const [floatingDismissed, setFloatingDismissed] = useState(false);
  const [installFeedback, setInstallFeedback] = useState<string>('');

  // Jika dibuka melalui link ?autoInstall=1 di tab baru, otomatis buka dialog install
  useEffect(() => {
    if (typeof window === 'undefined' || variant !== 'floating') return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('autoInstall') === '1') {
      if (isInstallable) {
        install();
      } else {
        setShowGuide(true);
      }
      // Bersihkan parameter autoInstall dari URL tanpa reload
      params.delete('autoInstall');
      const newQuery = params.toString();
      const cleanUrl = window.location.pathname + (newQuery ? `?${newQuery}` : '');
      window.history.replaceState({}, '', cleanUrl);
    }
  }, [isInstallable, install, variant]);

  // Tutup modal saat tekan tombol Escape
  useEffect(() => {
    if (!showGuide) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowGuide(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showGuide]);

  const handleInstallClick = async () => {
    if (onAction) {
      onAction();
    }
    if (isInstallable) {
      const accepted = await install();
      if (accepted) {
        setShowGuide(false);
      }
    } else {
      setShowGuide(true);
    }
  };

  // Trigger langsung untuk perangkat (Desktop / HP / Tablet) di dalam modal
  const handleDirectDeviceInstall = async (deviceType: 'hp' | 'tablet' | 'desktop') => {
    if (isInstallable) {
      const accepted = await install();
      if (accepted) {
        setShowGuide(false);
        return;
      }
    }

    // Jika sedang di dalam iframe preview (misal AI Studio), buka tab penuh agar browser mengizinkan prompt install asli
    if (isInIframe && typeof window !== 'undefined') {
      const targetUrl = `${window.location.origin}${window.location.pathname}?autoInstall=1`;
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
      setInstallFeedback(
        'Tab instalasi penuh telah dibuka! Klik tombol "Install" pada jendela baru yang terbuka.'
      );
      return;
    }

    if (deviceType === 'desktop') {
      downloadDesktopShortcut();
      setInstallFeedback(
        'Shortcut Aplikasi Desktop "SPMB SMPIT Pondok Duta" berhasil diunduh! Klik 2x file tersebut di Desktop Anda, atau klik ikon Install di kanan atas address bar browser.'
      );
      return;
    }

    if (isIOS) {
      setInstallFeedback(
        'Pada iPhone/iPad: Ketuk ikon Share di bawah layar Safari lalu pilih "Tambahkan ke Layar Utama" (Add to Home Screen).'
      );
      return;
    }

    setInstallFeedback(
      'Ketuk menu titik tiga (⋮) di pojok kanan atas browser Anda lalu pilih "Instal aplikasi" / "Tambahkan ke Layar utama".'
    );
  };

  if (isInstalled) {
    if (variant === 'hero') {
      return (
        <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-800/80 text-emerald-100 text-xs font-semibold border border-emerald-500/30">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Aplikasi Terpasang</span>
        </div>
      );
    }
    return null;
  }

  const standaloneInstallUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}${window.location.pathname}?autoInstall=1`
      : '/?autoInstall=1';

  const modalContent =
    showGuide && typeof document !== 'undefined'
      ? createPortal(
          <div
            onClick={() => setShowGuide(false)}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/65 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md rounded-3xl bg-white p-6 sm:p-7 shadow-2xl border border-slate-200/90 my-auto space-y-4 animate-in zoom-in-95 duration-200"
            >
              {/* Header Modal dengan Ikon PWA Baru (Buku Terbuka + Logo Sekolah bertoga) */}
              <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3.5">
                  <img
                    src="/pwa-192x192.png?v=4"
                    alt="Ikon Aplikasi SPMB SMPIT Pondok Duta"
                    className="w-14 h-14 rounded-2xl shadow-md border border-amber-300/80 shrink-0 object-contain bg-white p-0.5"
                  />
                  <div>
                    <h3 className="text-base sm:text-lg font-extrabold text-slate-900 leading-snug">
                      Install Aplikasi SPMB
                    </h3>
                    <p className="text-xs text-emerald-700 font-semibold mt-0.5">
                      SMPIT Pondok Duta · HP, Tablet &amp; Desktop
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowGuide(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer shrink-0"
                  aria-label="Tutup panduan install"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* TOMBOL INSTALL LANGSUNG OTOMATIS (1-KLIK) */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 text-white space-y-3 shadow-md border border-emerald-700">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-300">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Instalasi Cepat 1-Klik</span>
                  </span>
                  <span className="text-[10px] font-semibold bg-white/15 px-2 py-0.5 rounded-md text-emerald-100">
                    PWA Resmi
                  </span>
                </div>

                <p className="text-xs text-emerald-100 leading-relaxed">
                  Pilih perangkat Anda di bawah untuk langsung memasang aplikasi <strong>SPMB SMPIT Pondok Duta</strong>:
                </p>

                {isInIframe ? (
                  <a
                    href={standaloneInstallUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() =>
                      setInstallFeedback(
                        'Jendela instalasi penuh telah dibuka. Klik tombol Install pada tab baru tersebut!'
                      )
                    }
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition cursor-pointer"
                  >
                    <Download className="w-4 h-4 stroke-[2.5]" />
                    <span>Install Langsung Sekarang (HP / Tablet / PC)</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                  </a>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleDirectDeviceInstall('desktop')}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition cursor-pointer"
                  >
                    <Download className="w-4 h-4 stroke-[2.5]" />
                    <span>
                      {isInstallable
                        ? 'Install Aplikasi Sekarang (1-Klik)'
                        : 'Pasang Aplikasi ke Perangkat Sekarang'}
                    </span>
                  </button>
                )}

                {/* 3 Tombol Langsung Berdasarkan Perangkat: HP, Tablet, Desktop */}
                <div className="grid grid-cols-3 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleDirectDeviceInstall('hp')}
                    className="flex flex-col items-center justify-center gap-1 p-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white transition cursor-pointer text-center"
                  >
                    <Smartphone className="w-4 h-4 text-amber-300" />
                    <span className="text-[11px] font-bold">Install di HP</span>
                    <span className="text-[9px] text-emerald-200">Android &amp; iOS</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDirectDeviceInstall('tablet')}
                    className="flex flex-col items-center justify-center gap-1 p-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white transition cursor-pointer text-center"
                  >
                    <Tablet className="w-4 h-4 text-amber-300" />
                    <span className="text-[11px] font-bold">Install Tablet</span>
                    <span className="text-[9px] text-emerald-200">Tab &amp; iPad</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDirectDeviceInstall('desktop')}
                    className="flex flex-col items-center justify-center gap-1 p-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white transition cursor-pointer text-center"
                  >
                    <Laptop className="w-4 h-4 text-amber-300" />
                    <span className="text-[11px] font-bold">Install PC</span>
                    <span className="text-[9px] text-emerald-200">Laptop/Desktop</span>
                  </button>
                </div>
              </div>

              {installFeedback && (
                <div className="p-3 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 text-xs font-semibold flex items-start gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{installFeedback}</span>
                </div>
              )}

              {/* Isi Panduan Manual jika Browser Memerlukan Konfirmasi Menu */}
              <div className="space-y-2.5 text-xs text-slate-700">
                {isIOS ? (
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                    <div className="font-extrabold text-slate-900 text-xs flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-emerald-700" />
                      <span>Cara Pasang di iPhone / iPad (Safari):</span>
                    </div>
                    <ol className="space-y-2 text-xs text-slate-600">
                      <li className="flex items-start gap-2">
                        <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                          1
                        </span>
                        <span>
                          Ketuk tombol <strong>Share</strong>{' '}
                          <Share2 className="w-3.5 h-3.5 inline text-emerald-600 mx-0.5" /> di bilah
                          Safari, lalu pilih <strong>Tambahkan ke Layar Utama</strong>{' '}
                          <PlusSquare className="w-3.5 h-3.5 inline text-emerald-600 mx-0.5" />.
                        </span>
                      </li>
                    </ol>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-2">
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                      <div className="font-extrabold text-slate-900 flex items-center gap-2">
                        <Smartphone className="w-4 h-4 text-emerald-700 shrink-0" />
                        <span>1. HP &amp; Tablet Android (Chrome)</span>
                      </div>
                      <p className="text-slate-600 leading-relaxed pl-6 text-[11px]">
                        Klik tombol <strong>Install di HP / Tablet</strong> di atas, atau ketuk ikon{' '}
                        <strong>titik tiga (⋮)</strong> di pojok kanan atas browser lalu pilih{' '}
                        <strong>"Instal aplikasi"</strong>.
                      </p>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                      <div className="font-extrabold text-slate-900 flex items-center gap-2">
                        <Laptop className="w-4 h-4 text-emerald-700 shrink-0" />
                        <span>2. Laptop / Desktop (Chrome &amp; Edge)</span>
                      </div>
                      <p className="text-slate-600 leading-relaxed pl-6 text-[11px]">
                        Klik tombol <strong>Install PC</strong> di atas, atau klik ikon{' '}
                        <strong>Install</strong> di sisi kanan bilah alamat (<em>address bar</em>)
                        browser Anda.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Tombol Tutup */}
              <button
                type="button"
                onClick={() => setShowGuide(false)}
                className="w-full rounded-xl bg-slate-100 hover:bg-slate-200 py-2.5 text-xs font-bold text-slate-700 transition cursor-pointer"
              >
                Tutup Jendela
              </button>
            </div>
          </div>,
          document.body
        )
      : null;

  // VARIANT: FLOATING BADGE MELAYANG (RINGKAS & POSISI LEBIH TINGGI)
  if (variant === 'floating') {
    if (floatingDismissed) return <>{modalContent}</>;
    return (
      <>
        <div className="fixed bottom-36 sm:bottom-32 lg:bottom-16 right-3 sm:right-5 z-40 no-print flex items-center gap-1.5 animate-in slide-in-from-bottom-4 duration-300">
          <button
            type="button"
            onClick={handleInstallClick}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-slate-900 via-emerald-950 to-teal-950 text-white shadow-xl shadow-black/50 border-2 border-amber-400 hover:scale-[1.02] active:scale-95 transition-all duration-200 cursor-pointer group"
            title="Klik untuk langsung Install Aplikasi SPMB"
          >
            <img
              src="/pwa-192x192.png?v=4"
              alt="Install SPMB"
              className="w-6 h-6 rounded-full border border-amber-300/80 shadow-sm shrink-0 group-hover:scale-105 transition-transform bg-white p-0.5 object-contain"
            />
            <span className="text-xs font-extrabold text-white tracking-tight whitespace-nowrap">
              Pasang Aplikasi SPMB
            </span>
            <span className="px-2 py-0.5 rounded-md bg-amber-400 group-hover:bg-amber-300 text-slate-950 font-extrabold text-[10px] flex items-center gap-1 shadow-sm transition shrink-0">
              <Download className="w-3 h-3 stroke-[2.5]" />
              <span>Install</span>
            </span>
          </button>
          <button
            type="button"
            onClick={() => setFloatingDismissed(true)}
            className="w-6 h-6 rounded-full bg-slate-800/95 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-600 flex items-center justify-center shadow-lg transition cursor-pointer shrink-0"
            aria-label="Sembunyikan badge install"
            title="Tutup"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
        {modalContent}
      </>
    );
  }

  return (
    <>
      {variant === 'hero' ? (
        <button
          type="button"
          onClick={handleInstallClick}
          className={`group flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-sm shadow-lg shadow-amber-950/30 transition-all whitespace-nowrap shrink-0 cursor-pointer ${className}`}
        >
          <img
            src="/pwa-192x192.png?v=4"
            alt=""
            className="w-5 h-5 rounded-md border border-white/40 shrink-0 bg-white object-contain"
          />
          <Download className="w-4 h-4 transition-transform group-hover:scale-110 shrink-0" />
          <span>Install Aplikasi</span>
        </button>
      ) : variant === 'dropdown' ? (
        <button
          type="button"
          onClick={handleInstallClick}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-amber-50 hover:text-amber-950 transition cursor-pointer ${className}`}
        >
          <div className="flex items-center gap-2.5">
            <img
              src="/pwa-192x192.png?v=4"
              alt="Ikon PWA"
              className="w-7 h-7 rounded-lg border border-amber-300 shrink-0 bg-white object-contain"
            />
            <div className="text-left">
              <div className="font-bold text-slate-800">Install Aplikasi</div>
              <div className="text-[10px] text-slate-500 font-normal">
                Pasang di HP, Tablet / Laptop
              </div>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800">
            Install
          </span>
        </button>
      ) : variant === 'compact' ? (
        <button
          type="button"
          onClick={handleInstallClick}
          title="Install Aplikasi"
          className={`inline-flex items-center justify-center gap-1.5 h-9 px-3 rounded-xl bg-amber-50 text-amber-800 border border-amber-200/80 hover:bg-amber-100 text-xs font-semibold transition whitespace-nowrap shrink-0 cursor-pointer ${className}`}
        >
          <img
            src="/pwa-192x192.png?v=4"
            alt=""
            className="w-4 h-4 rounded-sm shrink-0 bg-white object-contain"
          />
          <span>Install Aplikasi</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={handleInstallClick}
          title="Install Aplikasi"
          className={`inline-flex items-center justify-center gap-1.5 h-9 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white text-xs font-semibold shadow-2xs transition whitespace-nowrap shrink-0 cursor-pointer ${className}`}
        >
          <img
            src="/pwa-192x192.png?v=4"
            alt=""
            className="w-4 h-4 rounded-sm border border-white/40 shrink-0 bg-white object-contain"
          />
          <span>Install Aplikasi</span>
        </button>
      )}
      {modalContent}
    </>
  );
};
