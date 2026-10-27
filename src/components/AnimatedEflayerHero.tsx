import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Phone, CheckCircle2, Award } from 'lucide-react';
import { getAcademicYear } from '../types';
import { gasService } from '../services/gasService';

/**
 * Komponen Gambar Animasi Beranda (Foto Badge E-Flyer SPMB SMPIT Pondok Duta).
 * - Menampilkan foto badge yang diatur oleh Super Admin melalui menu Koneksi Database (Sheet "Setting").
 * - Tidak menyediakan tombol upload/ganti foto untuk publik di halaman Beranda.
 */
export const AnimatedEflayerHero: React.FC = () => {
  const [imageSrc, setImageSrc] = useState<string>(() => {
    return gasService.getEffectiveHeroImage();
  });
  const [cropMode, setCropMode] = useState<'cutout' | 'full'>(() => gasService.getAppSettings().heroCropMode || 'cutout');
  const [imgLoadFailed, setImgLoadFailed] = useState<boolean>(false);
  const tahunPelajaran = getAcademicYear();

  useEffect(() => {
    const syncSettings = () => {
      setImageSrc(gasService.getEffectiveHeroImage());
      setCropMode(gasService.getAppSettings().heroCropMode || 'cutout');
      setImgLoadFailed(false);
    };

    window.addEventListener('spmb_settings_updated', syncSettings);
    window.addEventListener('storage', syncSettings);
    return () => {
      window.removeEventListener('spmb_settings_updated', syncSettings);
      window.removeEventListener('storage', syncSettings);
    };
  }, []);

  // Cek apakah file statis /eflayer-ppdb.jpeg tersedia di folder public bila belum ada di pengaturan
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
        className="relative w-full rounded-[1.75rem] bg-gradient-to-b from-white/95 via-white/95 to-emerald-50/95 p-2.5 sm:p-3 shadow-2xl border-2 border-white/80 shadow-emerald-950/50 transition-all"
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

        {/* Lencana Melayang Kanan Atas: Metode Ummi */}
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

        {/* Area Foto Badge Beranda */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-sky-50 via-white to-emerald-50 aspect-[4/4.3] w-full border border-slate-200/80">
          {imageSrc ? (
            <div className="w-full h-full overflow-hidden relative bg-white">
              {cropMode === 'cutout' ? (
                <motion.img
                  src={
                    imgLoadFailed
                      ? gasService.resolveDriveThumbnailUrl(imageSrc, 2000)
                      : gasService.resolveImageUrl(imageSrc)
                  }
                  alt="Foto Siswa SMPIT Pondok Duta"
                  referrerPolicy="no-referrer"
                  initial={{ scale: 1 }}
                  animate={{ scale: [1, 1.02, 1] }}
                  transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
                  className="w-full h-full object-cover object-top sm:object-center select-none pointer-events-none"
                  onError={() => {
                    if (!imgLoadFailed) setImgLoadFailed(true);
                  }}
                />
              ) : (
                <img
                  src={
                    imgLoadFailed
                      ? gasService.resolveDriveThumbnailUrl(imageSrc, 2000)
                      : gasService.resolveImageUrl(imageSrc)
                  }
                  alt="E-Flyer SPMB SMPIT Pondok Duta"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain bg-white select-none pointer-events-none"
                  onError={() => {
                    if (!imgLoadFailed) setImgLoadFailed(true);
                  }}
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
                <a
                  href="https://ban-pdm.id/satuanpendidikan/20276180"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 text-[10px] font-black flex items-center gap-1 shadow-md transition shrink-0 pointer-events-auto"
                  title="Lihat Akreditasi Grade A Resmi di BAN-PDM"
                >
                  <Award className="w-3 h-3 text-amber-950" />
                  <span>Akreditasi A</span>
                </a>
              </div>
            </div>
          ) : (
            /* Tampilan Visual Animasi Default */
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

              {/* Komposisi Visual Murid E-Flyer */}
              <div className="relative z-10 my-auto py-2">
                <div className="grid grid-cols-3 gap-2 items-end">
                  {/* Kiri: Murid SMPIT + Lab IPA */}
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
                      Sains &amp; Teknologi
                    </div>
                    <div className="text-[9px] text-slate-500 leading-tight">
                      Lab IPA &amp; Akademik Unggul
                    </div>
                  </motion.div>

                  {/* Tengah: Karakter Murid */}
                  <motion.div
                    animate={{ y: [0, -9, 0] }}
                    transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
                    className="bg-gradient-to-b from-emerald-700 to-teal-800 text-white rounded-2xl p-3 border border-amber-300/60 shadow-lg text-center space-y-1.5 -mt-4"
                  >
                    <div className="w-12 h-12 mx-auto rounded-xl bg-white/15 border border-white/25 flex items-center justify-center font-black text-amber-300 text-base">
                      SMPIT
                    </div>
                    <div className="text-[11px] font-extrabold text-white leading-tight">
                      Murid Ceria &amp; Mandiri
                    </div>
                    <div className="text-[9px] text-emerald-100 leading-tight">
                      Bina Karakter &amp; Lifeskills
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
                      Tahfidz &amp; Metode Ummi
                    </div>
                    <div className="text-[9px] text-slate-500 leading-tight">
                      Everyday with Al-Qur'an
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Footer Info di Dalam Frame */}
              <div className="relative z-10 pt-2 border-t border-emerald-200/70 flex items-center justify-between text-[10px] text-slate-600 font-semibold">
                <span>Solution For Your Children's Future</span>
                <a
                  href="https://ban-pdm.id/satuanpendidikan/20276180"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-800 font-bold hover:underline flex items-center gap-1"
                  title="Lihat profil akreditasi BAN-PDM"
                >
                  <Award className="w-3 h-3 text-amber-500" />
                  <span>Akreditasi A</span>
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Bar Kontak Cepat CS SMPIT & Akreditasi Sekolah di Bawah Foto Melayang */}
        <div className="mt-2.5 grid grid-cols-2 gap-2">
          <a
            href="https://wa.me/6282225002011?text=Halo%20CS%20SMPIT%20Pondok%20Duta%2C%20saya%20ingin%20konsultasi%20pendaftaran%20murid%20baru."
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 sm:p-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100/90 border border-indigo-200/80 transition flex items-center justify-between px-2.5 sm:px-3 ring-1 ring-indigo-400/30 group"
            title="Hubungi CS SMPIT Pondok Duta via WhatsApp"
          >
            <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-indigo-800 truncate">
              <Phone className="w-3.5 h-3.5 text-indigo-600 shrink-0 group-hover:scale-110 transition" />
              <span className="truncate">CS SMPIT</span>
            </div>
            <div className="text-[11px] sm:text-xs font-black text-indigo-950 font-mono truncate">
              0822-2500-2011
            </div>
          </a>

          <a
            href="https://ban-pdm.id/satuanpendidikan/20276180"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 sm:p-2.5 rounded-xl bg-amber-50 hover:bg-amber-100/90 border border-amber-200/80 transition flex items-center justify-between px-2.5 sm:px-3 ring-1 ring-amber-400/30 group"
            title="Klik untuk verifikasi Akreditasi Resmi Grade A (BAN-PDM: 20276180)"
          >
            <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-amber-900 truncate">
              <Award className="w-3.5 h-3.5 text-amber-600 shrink-0 group-hover:scale-110 transition" />
              <span className="truncate">Akreditasi</span>
            </div>
            <div className="text-[10px] sm:text-xs font-black text-amber-950 flex items-center gap-1 shrink-0">
              <span className="px-1.5 py-0.5 rounded-md bg-amber-200 text-amber-950 font-extrabold text-[9px] sm:text-[10px]">Grade A</span>
              <span className="text-[9px] text-amber-700 underline font-normal hidden sm:inline">&rarr;</span>
            </div>
          </a>
        </div>
      </motion.div>
    </div>
  );
};
