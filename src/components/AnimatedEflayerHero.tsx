import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Upload, Sparkles, Crop, RotateCcw, Phone, CheckCircle2 } from 'lucide-react';
import { getAcademicYear } from '../types';

const STORAGE_KEY_FULL = 'spmb_pd_eflayer_full_v1';
const STORAGE_KEY_CROP_MODE = 'spmb_pd_eflayer_crop_mode_v1';

/**
 * Komponen Gambar Animasi Beranda yang mengambil potongan foto asli dari E-Flyer SPMB SMPIT Pondok Duta.
 * - Tidak mengubah/memanipulasi wajah atau foto asli, hanya menampilkan potongan (crop) bagian foto siswa
 *   dari E-Flyer dengan bingkai dan animasi mengambang (floating) yang elegan.
 * - Menyediakan tombol 1-klik untuk memuat file asli `Eflayer PPDB SITPD.jpeg` dari perangkat dan menyimpannya
 *   secara permanen di browser (localStorage).
 */
export const AnimatedEflayerHero: React.FC = () => {
  const [imageSrc, setImageSrc] = useState<string | null>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_FULL);
    } catch {
      return null;
    }
  });
  const [cropMode, setCropMode] = useState<'cutout' | 'full'>(() => {
    try {
      return (localStorage.getItem(STORAGE_KEY_CROP_MODE) as 'cutout' | 'full') || 'cutout';
    } catch {
      return 'cutout';
    }
  });
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const tahunPelajaran = getAcademicYear();

  // Cek apakah file statis /eflayer-ppdb.jpeg tersedia di folder public
  useEffect(() => {
    if (!imageSrc) {
      fetch('/eflayer-ppdb.jpeg', { method: 'HEAD' })
        .then((res) => {
          if (res.ok && res.headers.get('content-type')?.startsWith('image')) {
            setImageSrc('/eflayer-ppdb.jpeg');
          }
        })
        .catch(() => {});
    }
  }, [imageSrc]);

  const handleFileLoaded = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 1200;
        let w = img.width;
        let h = img.height;
        if (h > maxDim) {
          w = Math.round((w * maxDim) / h);
          h = maxDim;
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, w, h);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
          setImageSrc(dataUrl);
          try {
            localStorage.setItem(STORAGE_KEY_FULL, dataUrl);
          } catch {}
        }
      };
      if (typeof e.target?.result === 'string') {
        img.src = e.target.result;
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileLoaded(file);
    }
  };

  const handleToggleCropMode = () => {
    const next = cropMode === 'cutout' ? 'full' : 'cutout';
    setCropMode(next);
    try {
      localStorage.setItem(STORAGE_KEY_CROP_MODE, next);
    } catch {}
  };

  const handleResetImage = () => {
    setImageSrc(null);
    try {
      localStorage.removeItem(STORAGE_KEY_FULL);
    } catch {}
  };

  return (
    <div className="relative w-full max-w-md mx-auto lg:max-w-none flex flex-col items-center">
      {/* Cahaya Latar Belakang Animasi */}
      <motion.div
        animate={{
          scale: [1, 1.06, 1],
          opacity: [0.35, 0.55, 0.35],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute -inset-3 rounded-[2rem] bg-gradient-to-tr from-amber-400/30 via-emerald-400/25 to-teal-300/30 blur-2xl pointer-events-none"
      />

      {/* Bingkai Utama Animasi Mengambang (Floating) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{
          opacity: 1,
          y: [0, -10, 0],
        }}
        transition={{
          opacity: { duration: 0.6 },
          y: {
            duration: 4.8,
            repeat: Infinity,
            ease: 'easeInOut',
          },
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          const file = e.dataTransfer.files?.[0];
          if (file) handleFileLoaded(file);
        }}
        className={`relative w-full rounded-[1.75rem] bg-gradient-to-b from-white/95 via-white/95 to-emerald-50/95 p-2.5 sm:p-3 shadow-2xl border-2 transition-all ${
          isDragging
            ? 'border-amber-400 ring-4 ring-amber-300/50 scale-[1.01]'
            : 'border-white/80 shadow-emerald-950/50'
        }`}
      >
        {/* Lencana Melayang Kiri Atas: Tahun Ajaran */}
        <motion.div
          animate={{ y: [0, -5, 0], rotate: [-2, 0, -2] }}
          transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-3.5 left-4 z-20 bg-white text-emerald-900 px-3.5 py-1.5 rounded-2xl shadow-lg border border-amber-300/90 flex items-center gap-2"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-ping" />
          <div className="leading-tight">
            <div className="text-[9px] font-extrabold uppercase tracking-wider text-slate-500">
              TAHUN AJARAN
            </div>
            <div className="text-xs sm:text-sm font-black text-emerald-800 tracking-tight">
              {tahunPelajaran}
            </div>
          </div>
        </motion.div>

        {/* Lencana Melayang Kanan Atas: Metode Ummi (Sesuai E-Flyer) */}
        <motion.div
          animate={{ y: [0, 6, 0], rotate: [2, 0, 2] }}
          transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
          className="absolute -top-3.5 right-4 z-20 bg-gradient-to-r from-emerald-800 to-emerald-700 text-white px-3 py-1.5 rounded-2xl shadow-lg border border-emerald-400/50 flex items-center gap-2"
        >
          <div className="w-7 h-7 rounded-full bg-lime-400/20 border border-lime-300/60 flex items-center justify-center text-lime-300 font-bold text-xs shrink-0">
            أُمِّي
          </div>
          <div className="leading-tight text-left">
            <div className="text-[9px] font-bold text-emerald-200 uppercase tracking-wider">
              Al-Qur'an
            </div>
            <div className="text-[11px] font-extrabold text-amber-300">
              Metode UMMI
            </div>
          </div>
        </motion.div>

        {/* Area Potongan Foto Asli E-Flyer */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-sky-50 via-white to-emerald-50 aspect-[4/4.3] w-full border border-slate-200/80">
          {imageSrc ? (
            <>
              {/* Menampilkan Foto Asli E-Flyer Tanpa Mengubah Gambar, Hanya Potongan (Crop) Bagian Foto Siswa */}
              <div className="w-full h-full overflow-hidden relative bg-white">
                {cropMode === 'cutout' ? (
                  <motion.img
                    src={imageSrc}
                    alt="Potongan Foto Asli Siswa SMPIT Pondok Duta dari E-Flyer"
                    referrerPolicy="no-referrer"
                    initial={{ scale: 1.02 }}
                    animate={{ scale: [1.02, 1.05, 1.02] }}
                    transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                    className="w-full h-[175%] max-w-none object-cover object-[50%_58%] -mt-[34%] select-none pointer-events-none"
                  />
                ) : (
                  <img
                    src={imageSrc}
                    alt="E-Flyer SPMB SMPIT Pondok Duta Utuh"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain bg-white select-none"
                  />
                )}

                {/* Efek Vignette Halus di Bagian Bawah agar Menyatu Elegan dengan Bingkai */}
                <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-emerald-950/80 via-emerald-950/30 to-transparent pointer-events-none" />

                {/* Caption Identitas di Atas Vignette Bawah */}
                <div className="absolute bottom-2.5 inset-x-3 flex items-end justify-between gap-2 text-white z-10">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>SMPIT Pondok Duta · TP {tahunPelajaran}</span>
                    </div>
                    <div className="text-xs font-extrabold leading-tight">
                      Yayasan Perguruan Islam Pondok Duta
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={handleToggleCropMode}
                      title="Ganti tampilan potongan foto / e-flyer penuh"
                      className="px-2 py-1 rounded-lg bg-white/20 hover:bg-white/30 backdrop-blur-md text-[10px] font-bold text-white border border-white/25 flex items-center gap-1 cursor-pointer transition"
                    >
                      <Crop className="w-3 h-3" />
                      <span>{cropMode === 'cutout' ? 'E-Flyer Penuh' : 'Potongan Foto'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      title="Ganti file foto E-Flyer"
                      className="p-1 rounded-lg bg-white/20 hover:bg-white/30 backdrop-blur-md text-white border border-white/25 cursor-pointer transition"
                    >
                      <Upload className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={handleResetImage}
                      title="Reset gambar"
                      className="p-1 rounded-lg bg-white/20 hover:bg-rose-500/70 backdrop-blur-md text-white border border-white/25 cursor-pointer transition"
                    >
                      <RotateCcw className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* Tampilan Default Sebelum File `Eflayer PPDB SITPD.jpeg` Dimuat */
            <div className="w-full h-full flex flex-col justify-between p-4 sm:p-5 relative overflow-hidden bg-gradient-to-b from-sky-100/70 via-white to-emerald-50/90">
              {/* Siluet Gedung Sekolah Pondok Duta di Latar Belakang */}
              <div className="absolute inset-x-0 top-6 bottom-16 opacity-15 pointer-events-none flex items-end justify-center">
                <div className="w-11/12 h-4/5 rounded-t-3xl border-4 border-sky-700 bg-sky-200/40 grid grid-cols-4 gap-2 p-3">
                  <div className="rounded-t-full border-2 border-sky-700 bg-white/50" />
                  <div className="rounded-t-full border-2 border-sky-700 bg-white/50" />
                  <div className="rounded-t-full border-2 border-sky-700 bg-white/50" />
                  <div className="rounded-t-full border-2 border-sky-700 bg-white/50" />
                </div>
              </div>

              {/* Header Mini di Dalam Frame */}
              <div className="relative z-10 text-center pt-3">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100/90 text-emerald-900 text-[10px] font-extrabold tracking-wide uppercase">
                  <Sparkles className="w-3 h-3 text-amber-600" />
                  <span>Yayasan Perguruan Islam Pondok Duta</span>
                </div>
                <div className="text-xs font-extrabold text-amber-600 mt-1">
                  SMPIT PONDOK DUTA
                </div>
              </div>

              {/* Komposisi Visual Siswa E-Flyer */}
              <div className="relative z-10 my-auto py-2">
                <div className="grid grid-cols-3 gap-2 items-end">
                  {/* Kiri: Siswa SMPIT + Lab IPA */}
                  <motion.div
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut' }}
                    className="bg-white/95 rounded-2xl p-2.5 border border-slate-200/90 shadow-md text-center space-y-1.5"
                  >
                    <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-sky-100 to-indigo-100 border border-indigo-200 flex items-center justify-center relative">
                      <svg viewBox="0 0 48 48" className="w-9 h-9">
                        <path d="M19 8h10M21 8v9l-9 17a3 3 0 002.6 4.5h18.8A3 3 0 0036 34l-9-17V8" fill="none" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M14.5 29h19l2.5 5a2 2 0 01-1.8 3H13.8a2 2 0 01-1.8-3l2.5-5z" fill="#ef4444" />
                        <circle cx="22" cy="32" r="1.5" fill="#fecaca" />
                        <circle cx="27" cy="34" r="1" fill="#fecaca" />
                      </svg>
                    </div>
                    <div className="text-[11px] font-extrabold text-slate-900 leading-tight">
                      Sains & Teknologi
                    </div>
                    <div className="text-[9px] text-slate-500 leading-tight">
                      Lab IPA & Akademik Unggul
                    </div>
                  </motion.div>

                  {/* Tengah: Karakter Siswa */}
                  <motion.div
                    animate={{ y: [0, -9, 0] }}
                    transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
                    className="bg-gradient-to-b from-emerald-700 to-teal-800 text-white rounded-2xl p-3 border border-amber-300/60 shadow-lg text-center space-y-1.5 -mt-4"
                  >
                    <div className="w-12 h-12 mx-auto rounded-xl bg-white/15 border border-white/25 flex items-center justify-center font-black text-amber-300 text-base">
                      SMPIT
                    </div>
                    <div className="text-[11px] font-extrabold text-white leading-tight">
                      Siswa Ceria & Mandiri
                    </div>
                    <div className="text-[9px] text-emerald-100 leading-tight">
                      Bina Karakter & Lifeskills
                    </div>
                  </motion.div>

                  {/* Kanan: Al-Qur'an Metode Ummi */}
                  <motion.div
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
                    className="bg-white/95 rounded-2xl p-2.5 border border-slate-200/90 shadow-md text-center space-y-1.5"
                  >
                    <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-emerald-100 to-lime-100 border border-emerald-200 flex items-center justify-center">
                      <svg viewBox="0 0 48 48" className="w-9 h-9">
                        <path d="M8 14c6 0 12 2 16 6 4-4 10-6 16-6v22c-6 0-12 2-16 6-4-4-10-6-16-6V14z" fill="#047857" stroke="#064e3b" strokeWidth="2.2" />
                        <path d="M24 20v22" stroke="#fde047" strokeWidth="2" />
                        <circle cx="16" cy="25" r="2.5" fill="#fde047" />
                        <circle cx="32" cy="25" r="2.5" fill="#fde047" />
                      </svg>
                    </div>
                    <div className="text-[11px] font-extrabold text-slate-900 leading-tight">
                      Tahfidz & Metode Ummi
                    </div>
                    <div className="text-[9px] text-slate-500 leading-tight">
                      Everyday with Al-Qur'an
                    </div>
                  </motion.div>
                </div>

                {/* Tombol Utama Memuat Potongan Foto Asli E-Flyer */}
                <div className="mt-4 bg-white/95 backdrop-blur-md rounded-2xl p-3 border border-emerald-300/90 shadow-sm text-center space-y-2">
                  <p className="text-[11px] text-slate-700 font-semibold leading-snug">
                    Tampilkan <strong>Potongan Foto Asli</strong> dari file <code>Eflayer PPDB SITPD.jpeg</code> Anda:
                  </p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-800 hover:to-teal-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm cursor-pointer transition"
                  >
                    <Upload className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                    <span>Pilih Foto Eflayer Asli (Otomatis Potong Foto Siswa)</span>
                  </button>
                </div>
              </div>

              {/* Footer Info di Dalam Frame */}
              <div className="relative z-10 pt-2 border-t border-emerald-200/70 flex items-center justify-between text-[10px] text-slate-600 font-semibold">
                <span>Slogan: Solution For Your Children's Future</span>
                <span className="text-emerald-800 font-bold">Akreditasi A</span>
              </div>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* Bar Kontak Cepat CS SMPIT di Bawah Foto */}
        <div className="mt-2.5">
          <a
            href="https://wa.me/6282225002011"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100/80 border border-indigo-200/80 transition flex items-center justify-between px-4 ring-1 ring-indigo-400/30"
          >
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-indigo-800">
              <Phone className="w-3.5 h-3.5 text-indigo-600" />
              <span>CS SMPIT Pondok Duta</span>
            </div>
            <div className="text-xs sm:text-sm font-extrabold text-indigo-950 font-mono">
              0822-2500-2011
            </div>
          </a>
        </div>
      </motion.div>
    </div>
  );
};
