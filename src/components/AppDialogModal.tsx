import React, { useState, useEffect, useCallback } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Info,
  X,
  ShieldCheck,
  Sparkles,
  Trash2,
} from 'lucide-react';

export type AppDialogVariant = 'success' | 'warning' | 'danger' | 'info';

export interface AppDialogOptions {
  mode?: 'alert' | 'confirm';
  title?: string;
  message: string;
  subMessage?: string;
  variant?: AppDialogVariant;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

interface InternalDialogState extends AppDialogOptions {
  id: number;
  resolve?: (confirmed: boolean) => void;
}

let dialogDispatcher: ((state: InternalDialogState) => void) | null = null;

function inferVariantAndTitle(message: string, mode: 'alert' | 'confirm'): {
  variant: AppDialogVariant;
  title: string;
} {
  const lower = message.toLowerCase();
  if (
    lower.includes('alhamdulillah') ||
    lower.includes('berhasil') ||
    lower.startsWith('✓') ||
    lower.includes('tersimpan') ||
    lower.includes('disahkan')
  ) {
    return {
      variant: 'success',
      title: 'Berhasil Disimpan',
    };
  }
  if (
    mode === 'confirm' &&
    (lower.includes('hapus') ||
      lower.includes('keluarkan') ||
      lower.includes('batalkan') ||
      lower.includes('reset'))
  ) {
    return {
      variant: lower.includes('hapus') || lower.includes('keluarkan') ? 'danger' : 'warning',
      title: 'Konfirmasi Tindakan',
    };
  }
  if (
    lower.includes('silakan') ||
    lower.includes('pilih') ||
    lower.includes('belum') ||
    lower.includes('wajib') ||
    lower.includes('perhatian') ||
    lower.includes('gagal')
  ) {
    return {
      variant: 'warning',
      title: 'Perhatian Sistem',
    };
  }
  return {
    variant: 'info',
    title: mode === 'confirm' ? 'Konfirmasi Sistem' : 'Informasi Sistem',
  };
}

export function showAppAlert(optionsOrMessage: string | AppDialogOptions): Promise<boolean> {
  const opts: AppDialogOptions =
    typeof optionsOrMessage === 'string'
      ? { message: optionsOrMessage, mode: 'alert' }
      : { ...optionsOrMessage, mode: 'alert' };

  const inferred = inferVariantAndTitle(opts.message, 'alert');

  return new Promise<boolean>((resolve) => {
    if (dialogDispatcher) {
      dialogDispatcher({
        ...opts,
        id: Date.now() + Math.random(),
        mode: 'alert',
        variant: opts.variant || inferred.variant,
        title: opts.title || inferred.title,
        confirmText: opts.confirmText || 'Mengerti',
        resolve,
      });
    } else {
      resolve(true);
    }
  });
}

export function showAppConfirm(optionsOrMessage: string | AppDialogOptions): Promise<boolean> {
  const opts: AppDialogOptions =
    typeof optionsOrMessage === 'string'
      ? { message: optionsOrMessage, mode: 'confirm' }
      : { ...optionsOrMessage, mode: 'confirm' };

  const inferred = inferVariantAndTitle(opts.message, 'confirm');

  return new Promise<boolean>((resolve) => {
    if (dialogDispatcher) {
      dialogDispatcher({
        ...opts,
        id: Date.now() + Math.random(),
        mode: 'confirm',
        variant: opts.variant || inferred.variant,
        title: opts.title || inferred.title,
        confirmText: opts.confirmText || 'Ya, Lanjutkan',
        cancelText: opts.cancelText || 'Batal',
        resolve,
      });
    } else {
      resolve(false);
    }
  });
}

export const AppDialogHost: React.FC = () => {
  const [queue, setQueue] = useState<InternalDialogState[]>([]);

  const enqueueDialog = useCallback((state: InternalDialogState) => {
    setQueue((prev) => [...prev, state]);
  }, []);

  useEffect(() => {
    dialogDispatcher = enqueueDialog;

    // Intercept native window.alert so no browser alert ever shows up
    const originalAlert = window.alert;
    window.alert = (msg?: any) => {
      showAppAlert(String(msg ?? ''));
    };

    return () => {
      dialogDispatcher = null;
      window.alert = originalAlert;
    };
  }, [enqueueDialog]);

  const activeDialog = queue[0] || null;

  useEffect(() => {
    if (!activeDialog) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose(false);
      } else if (e.key === 'Enter' && activeDialog.mode === 'alert') {
        e.preventDefault();
        handleClose(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeDialog]);

  if (!activeDialog) return null;

  const handleClose = (confirmed: boolean) => {
    const current = queue[0];
    setQueue((prev) => prev.slice(1));
    if (!current) return;
    if (confirmed) {
      current.onConfirm?.();
    } else {
      current.onCancel?.();
    }
    current.resolve?.(confirmed);
  };

  const variant = activeDialog.variant || 'info';
  const isConfirm = activeDialog.mode === 'confirm';

  const theme = {
    success: {
      headerGradient: 'from-emerald-800 via-emerald-700 to-teal-800',
      iconBg: 'bg-emerald-500/20 border-emerald-300/40 text-emerald-200',
      badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      badgeText: 'Berhasil Diverifikasi',
      primaryBtn:
        'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-600/25',
      ringColor: 'ring-emerald-500/20',
      Icon: CheckCircle2,
    },
    warning: {
      headerGradient: 'from-amber-600 via-orange-600 to-amber-700',
      iconBg: 'bg-white/20 border-white/35 text-amber-100',
      badgeBg: 'bg-amber-50 text-amber-900 border-amber-200',
      badgeText: isConfirm ? 'Konfirmasi Tindakan' : 'Perhatian Validasi',
      primaryBtn:
        'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg shadow-amber-500/25',
      ringColor: 'ring-amber-500/20',
      Icon: isConfirm ? HelpCircle : AlertTriangle,
    },
    danger: {
      headerGradient: 'from-rose-700 via-red-700 to-rose-800',
      iconBg: 'bg-white/20 border-white/35 text-rose-100',
      badgeBg: 'bg-rose-50 text-rose-800 border-rose-200',
      badgeText: 'Konfirmasi Penting',
      primaryBtn:
        'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white shadow-lg shadow-rose-600/25',
      ringColor: 'ring-rose-500/20',
      Icon: Trash2,
    },
    info: {
      headerGradient: 'from-slate-900 via-indigo-900 to-emerald-900',
      iconBg: 'bg-white/15 border-white/25 text-indigo-200',
      badgeBg: 'bg-indigo-50 text-indigo-800 border-indigo-200',
      badgeText: isConfirm ? 'Konfirmasi Sistem' : 'Informasi Sistem',
      primaryBtn:
        'bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-700 hover:to-emerald-700 text-white shadow-lg shadow-indigo-600/25',
      ringColor: 'ring-indigo-500/20',
      Icon: isConfirm ? HelpCircle : Info,
    },
  }[variant];

  const IconComponent = theme.Icon;
  const paragraphs = activeDialog.message
    .replace(/^✓\s*/, '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/65 backdrop-blur-xs p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose(false);
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        className={`w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200/90 ring-4 ${theme.ringColor} overflow-hidden animate-in zoom-in-95 duration-200`}
      >
        {/* Top Decorative Gradient Header */}
        <div className={`bg-gradient-to-r ${theme.headerGradient} px-6 py-5 text-white relative overflow-hidden`}>
          <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-white/10 blur-xl pointer-events-none" />
          <div className="relative flex items-start justify-between gap-3">
            <div className="flex items-center gap-3.5">
              <div
                className={`w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 shadow-inner ${theme.iconBg}`}
              >
                <IconComponent className="w-6 h-6" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-white/85 bg-black/20 px-2.5 py-0.5 rounded-full border border-white/15 mb-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>SPMB SMPIT Pondok Duta</span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-white leading-snug">
                  {activeDialog.title}
                </h3>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleClose(false)}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition cursor-pointer shrink-0"
              aria-label="Tutup dialog"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="px-6 py-5 space-y-3.5 bg-white">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-extrabold border ${theme.badgeBg}`}
            >
              <Sparkles className="w-3 h-3 shrink-0" />
              <span>{theme.badgeText}</span>
            </span>
          </div>

          <div className="space-y-2.5 text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
            {paragraphs.map((p, idx) => (
              <p
                key={idx}
                className={
                  idx === 0 && paragraphs.length > 1
                    ? 'font-bold text-slate-900 text-sm'
                    : 'text-slate-600 leading-relaxed'
                }
              >
                {p}
              </p>
            ))}
          </div>

          {activeDialog.subMessage && (
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600 leading-relaxed">
              {activeDialog.subMessage}
            </div>
          )}
        </div>

        {/* Footer Buttons */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
          {isConfirm && (
            <button
              type="button"
              onClick={() => handleClose(false)}
              className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-extrabold transition cursor-pointer"
            >
              {activeDialog.cancelText || 'Batal'}
            </button>
          )}
          <button
            type="button"
            autoFocus
            onClick={() => handleClose(true)}
            className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center justify-center gap-1.5 ${theme.primaryBtn}`}
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{activeDialog.confirmText || (isConfirm ? 'Ya, Lanjutkan' : 'Mengerti')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
