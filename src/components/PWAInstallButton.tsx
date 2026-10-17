import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, Laptop, Share2, PlusSquare, CheckCircle2, X } from 'lucide-react';

interface Props {
  variant?: 'navbar' | 'hero' | 'compact' | 'dropdown';
  className?: string;
  onAction?: () => void;
}

export const PWAInstallButton: React.FC<Props> = ({ variant = 'navbar', className = '', onAction }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

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
      await install();
    } else {
      setShowGuide(true);
    }
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

  const modalContent = showGuide && typeof document !== 'undefined'
    ? createPortal(
        <div
          onClick={() => setShowGuide(false)}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/65 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md rounded-3xl bg-white p-6 sm:p-7 shadow-2xl border border-slate-200/90 my-auto space-y-5 animate-in zoom-in-95 duration-200"
          >
            {/* Header Modal */}
            <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-800 to-emerald-600 text-amber-300 flex items-center justify-center shadow-sm shrink-0">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900 leading-snug">
                    Install Aplikasi SPMB
                  </h3>
                  <p className="text-xs text-emerald-700 font-semibold mt-0.5">
                    SMPIT Pondok Duta · PWA di HP & Laptop
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

            {/* Isi Panduan */}
            <div className="space-y-3.5 text-xs text-slate-700">
              {isIOS ? (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                  <div className="font-extrabold text-slate-900 text-xs flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-emerald-700" />
                    <span>Cara Pasang di iPhone / iPad (Safari):</span>
                  </div>
                  <ol className="space-y-2.5 text-xs text-slate-600">
                    <li className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                        1
                      </span>
                      <span className="leading-relaxed">
                        Ketuk tombol <strong>Share</strong> <Share2 className="w-3.5 h-3.5 inline text-emerald-600 mx-0.5" /> di bagian bawah layar browser Safari.
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                        2
                      </span>
                      <span className="leading-relaxed">
                        Geser ke bawah lalu pilih menu <strong>Tambahkan ke Layar Utama</strong> <PlusSquare className="w-3.5 h-3.5 inline text-emerald-600 mx-0.5" /> (<em>Add to Home Screen</em>).
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                        3
                      </span>
                      <span className="leading-relaxed">
                        Ketuk <strong>Tambah</strong> di pojok kanan atas. Aplikasi siap dibuka dari layar utama HP Anda.
                      </span>
                    </li>
                  </ol>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Panduan HP Android */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                    <div className="font-extrabold text-slate-900 flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-emerald-700 shrink-0" />
                      <span>1. Pada HP Android (Chrome)</span>
                    </div>
                    <p className="text-slate-600 leading-relaxed pl-6">
                      Ketuk ikon <strong>titik tiga (⋮)</strong> di pojok kanan atas browser, lalu pilih <strong>"Instal aplikasi"</strong> atau <strong>"Tambahkan ke Layar utama"</strong>.
                    </p>
                  </div>

                  {/* Panduan Laptop / Desktop */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                    <div className="font-extrabold text-slate-900 flex items-center gap-2">
                      <Laptop className="w-4 h-4 text-emerald-700 shrink-0" />
                      <span>2. Pada Laptop / Desktop (Chrome & Edge)</span>
                    </div>
                    <p className="text-slate-600 leading-relaxed pl-6">
                      Klik ikon <strong>Install</strong> (monitor dengan panah unduh) di sisi kanan bilah alamat (<em>address bar</em>) browser Anda, lalu klik <strong>Instal</strong>.
                    </p>
                  </div>
                </div>
              )}

              {/* Keunggulan PWA */}
              <div className="rounded-2xl bg-emerald-50/90 border border-emerald-200/80 p-3.5 text-xs text-emerald-900 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  <strong>Keunggulan Aplikasi:</strong> Ringan tanpa memakan memori perangkat, akses lebih cepat, dan tampil penuh layaknya aplikasi.
                </span>
              </div>
            </div>

            {/* Tombol Tutup */}
            <button
              type="button"
              onClick={() => setShowGuide(false)}
              className="w-full rounded-xl bg-emerald-700 hover:bg-emerald-800 py-3 text-xs font-bold text-white shadow-sm transition cursor-pointer"
            >
              Mengerti & Tutup
            </button>
          </div>
        </div>,
        document.body
      )
    : null;

  return (
    <>
      {variant === 'hero' ? (
        <button
          type="button"
          onClick={handleInstallClick}
          className={`group flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-sm shadow-lg shadow-amber-950/30 transition-all whitespace-nowrap shrink-0 cursor-pointer ${className}`}
        >
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
            <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <Download className="w-3.5 h-3.5" />
            </div>
            <div className="text-left">
              <div className="font-bold text-slate-800">Install Aplikasi</div>
              <div className="text-[10px] text-slate-500 font-normal">Pasang di HP / Laptop</div>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800">
            PWA
          </span>
        </button>
      ) : variant === 'compact' ? (
        <button
          type="button"
          onClick={handleInstallClick}
          title="Install Aplikasi"
          className={`inline-flex items-center justify-center gap-1.5 h-9 px-3 rounded-xl bg-amber-50 text-amber-800 border border-amber-200/80 hover:bg-amber-100 text-xs font-semibold transition whitespace-nowrap shrink-0 cursor-pointer ${className}`}
        >
          <Download className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>Install Aplikasi</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={handleInstallClick}
          title="Install Aplikasi"
          className={`inline-flex items-center justify-center gap-1.5 h-9 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white text-xs font-semibold shadow-2xs transition whitespace-nowrap shrink-0 cursor-pointer ${className}`}
        >
          <Download className="w-3.5 h-3.5 shrink-0" />
          <span>Install Aplikasi</span>
        </button>
      )}

      {modalContent}
    </>
  );
};
