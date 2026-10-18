import React, { useState, useEffect } from 'react';
import { UserAccount } from '../types';
import { gasService } from '../services/gasService';
import { 
  MapPin, 
  Phone, 
  Mail, 
  MessageCircle, 
  ShieldCheck,
  X,
  ExternalLink
} from 'lucide-react';

interface Props {
  onSelectTab: (tab: string) => void;
  onOpenGasConfig: () => void;
  onOpenPanduan: () => void;
  currentUser?: UserAccount | null;
}

export const Footer: React.FC<Props> = ({ onSelectTab, onOpenGasConfig, onOpenPanduan, currentUser }) => {
  const [logoUrl, setLogoUrl] = useState<string>(() => gasService.getAppSettings().logoUrl);
  const [isContactModalOpen, setIsContactModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const syncLogo = () => {
      setLogoUrl(gasService.getAppSettings().logoUrl || '');
    };
    window.addEventListener('spmb_settings_updated', syncLogo);
    window.addEventListener('storage', syncLogo);
    return () => {
      window.removeEventListener('spmb_settings_updated', syncLogo);
      window.removeEventListener('storage', syncLogo);
    };
  }, []);

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 text-xs mt-16 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Kolom 1: Profil Sekolah */}
          <div className="space-y-3.5">
            <div className="flex items-center gap-3">
              {logoUrl ? (
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center p-0.5 shadow-sm overflow-hidden shrink-0">
                  <img
                    src={gasService.resolveImageUrl(logoUrl)}
                    alt="Logo SMPIT Pondok Duta"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center font-bold text-white text-base shadow-sm shrink-0">
                  PD
                </div>
              )}
              <div>
                <h3 className="font-extrabold text-white text-sm tracking-wide">
                  SMPIT PONDOK DUTA
                </h3>
                <p className="text-[11px] text-emerald-400 font-semibold">
                  Sistem Penerimaan Murid Baru
                </p>
              </div>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Berdiri sejak tahun 2011 di bawah naungan YPIPD yang telah berdiri sejak 18 April 1990. <em>"Solution For Your Children's Future"</em>.
            </p>
            <div className="flex items-center gap-1.5 text-emerald-300 text-[11px] font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <a
                href="https://ban-pdm.id/satuanpendidikan/20276180"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline hover:text-amber-300 transition"
                title="Buka sertifikat resmi akreditasi di BAN-PDM"
              >
                Terakreditasi "A" (BAN-SM / BAN-PDM) · Blended Learning
              </a>
            </div>
          </div>

          {/* Kolom 2: Kontak SPMB */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider text-emerald-400">
              Sekretariat & CS SPMB
            </h4>
            <div className="space-y-2 text-slate-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Jl. Duta Plaza No.1 RT.10 RW.14, Perumahan Pondok Duta 1, Kel. Tugu, Kec. Cimanggis, Kota Depok</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Telp: (021) 29378301</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>CS SMPIT (WA): 0822-2500-2011</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-500 shrink-0" />
                <a href="mailto:info@smpitpondokduta.sch.id" className="hover:text-emerald-400 transition">Email: info@smpitpondokduta.sch.id</a>
              </div>
              <div className="flex items-center gap-2">
                <ExternalLink className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Sosmed: @sekolahislampondokduta</span>
              </div>
            </div>
          </div>

          {/* Kolom 3: Navigasi Cepat */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider text-emerald-400">
              Menu Informasi
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <button 
                  onClick={() => onSelectTab('syarat')}
                  className="hover:text-emerald-400 transition"
                >
                  &rarr; Syarat & Berkas Pendaftaran
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onSelectTab('alur')}
                  className="hover:text-emerald-400 transition"
                >
                  &rarr; Alur 6 Langkah Pendaftaran
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onSelectTab('cek-kelulusan')}
                  className="hover:text-emerald-400 transition"
                >
                  &rarr; Cek Pengumuman Kelulusan
                </button>
              </li>
              {(currentUser?.role === 'siswa' || currentUser?.role === 'admin') && (
                <li>
                  <button 
                    onClick={() => onSelectTab('dashboard-siswa')}
                    className="text-emerald-400 font-semibold hover:text-emerald-300 transition"
                  >
                    &rarr; Portal Murid
                  </button>
                </li>
              )}
              {(currentUser?.role === 'guru' || currentUser?.role === 'admin') && (
                <li>
                  <button 
                    onClick={() => onSelectTab('dashboard-guru')}
                    className="text-purple-400 font-semibold hover:text-purple-300 transition"
                  >
                    &rarr; Menu Pewawancara & Observasi Guru
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Kolom 4: Integrasi & PWA */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider text-emerald-400">
              Infrastruktur & PWA
            </h4>
            <p className="text-slate-400 text-xs">
              Didukung Progressive Web App (PWA) untuk akses offline dan Google Drive.
            </p>
            {currentUser?.role === 'admin' ? (
              <div className="flex flex-col gap-2 pt-1">
                <button
                  onClick={onOpenGasConfig}
                  className="w-full text-left px-3 py-2 rounded-xl bg-amber-950/80 hover:bg-amber-900/80 text-amber-200 text-xs font-semibold flex items-center justify-between transition border border-amber-700/60 cursor-pointer"
                >
                  <span>Koneksi Database &amp; Setting (Admin)</span>
                  <span className="text-[10px] text-amber-400">&gt;</span>
                </button>
                <button
                  onClick={onOpenPanduan}
                  className="w-full text-left px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-slate-200 text-xs font-semibold flex items-center justify-between transition border border-slate-700 cursor-pointer"
                >
                  <span>Panduan GitHub &amp; Netlify (Admin)</span>
                  <span className="text-[10px] text-emerald-400">&gt;</span>
                </button>
              </div>
            ) : (
              <div className="p-2.5 rounded-xl bg-slate-800/70 border border-slate-700/80 text-[11px] text-slate-400">
                Akses konfigurasi <strong>GAS API</strong> dikhususkan bagi akun <strong>Admin</strong>.
              </div>
            )}
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500 text-[11px]">
          <div>
            &copy; {new Date().getFullYear()} SMPIT Pondok Duta. Hak Cipta Dilindungi.
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <span>Dibuat oleh</span>
            <button
              type="button"
              onClick={() => setIsContactModalOpen(true)}
              className="text-emerald-400 font-bold hover:underline hover:text-emerald-300 transition cursor-pointer inline-flex items-center gap-1"
              title="Klik untuk membuka pilihan kontak WhatsApp & Email"
            >
              <span>Abu Haripin</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal Pilihan Kontak Pembuat (WhatsApp & Email) */}
      {isContactModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-4 animate-in fade-in duration-150"
          onClick={() => setIsContactModalOpen(false)}
        >
          <div 
            className="w-full max-w-sm bg-slate-900 border border-slate-700/80 rounded-2xl p-5 shadow-2xl text-slate-200 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h4 className="text-sm font-extrabold text-white">Hubungi Pengembang</h4>
                <p className="text-[11px] text-slate-400">Abu Haripin · Jasa Pembuatan Aplikasi Web &amp; PWA</p>
              </div>
              <button
                type="button"
                onClick={() => setIsContactModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Tertarik memesan aplikasi web, sistem SPMB sekolah, atau sistem manajemen lainnya? Silakan pilih saluran komunikasi berikut:
            </p>

            <div className="space-y-2.5 pt-1">
              {/* Opsi 1: WhatsApp */}
              <a
                href="https://wa.me/6285310999527?text=Halo%20Pak%20Abu%20Haripin%2C%20saya%20berminat%20memesan%20aplikasi%20web%20atau%20PWA%20seperti%20sistem%20SPMB%20SMPIT%20Pondok%20Duta.%20Mohon%20informasi%20biaya%20dan%20detailnya."
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsContactModalOpen(false)}
                className="w-full p-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-200 hover:text-white flex items-center justify-between transition group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className="font-extrabold text-xs text-emerald-300 group-hover:text-emerald-200">
                      Chat via WhatsApp
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      0853-1099-9527
                    </div>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-emerald-400/80 group-hover:text-emerald-300 shrink-0" />
              </a>

              {/* Opsi 2: Email */}
              <a
                href="mailto:abuharipin@gmail.com?subject=Pemesanan%20Aplikasi%20Web%20atau%20PWA%20Sekolah&body=Halo%20Pak%20Abu%20Haripin%2C%0A%0ASaya%20berminat%20untuk%20memesan%20aplikasi%20web%20atau%20PWA%20seperti%20sistem%20SPMB%20SMPIT%20Pondok%20Duta.%20Mohon%20informasi%20spesifikasi%20dan%20biayanya.%0A%0ATerima%20kasih."
                onClick={() => setIsContactModalOpen(false)}
                className="w-full p-3 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/40 text-cyan-200 hover:text-white flex items-center justify-between transition group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-cyan-600 text-white flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className="font-extrabold text-xs text-cyan-300 group-hover:text-cyan-200">
                      Kirim Email
                    </div>
                    <div className="text-[11px] text-slate-400">
                      abuharipin@gmail.com
                    </div>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-cyan-400/80 group-hover:text-cyan-300 shrink-0" />
              </a>
            </div>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => setIsContactModalOpen(false)}
                className="text-xs text-slate-400 hover:text-slate-200 py-1 transition cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};
