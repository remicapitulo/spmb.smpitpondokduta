import React from 'react';
import { UserAccount } from '../types';
import { 
  MapPin, 
  Phone, 
  Mail, 
  MessageCircle, 
  ShieldCheck
} from 'lucide-react';

interface Props {
  onSelectTab: (tab: string) => void;
  onOpenGasConfig: () => void;
  onOpenPanduan: () => void;
  currentUser?: UserAccount | null;
}

export const Footer: React.FC<Props> = ({ onSelectTab, onOpenGasConfig, onOpenPanduan, currentUser }) => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 text-xs mt-16 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Kolom 1: Profil Sekolah */}
          <div className="space-y-3.5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center font-bold text-white text-base shadow-sm">
                PD
              </div>
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
              <span>Terakreditasi "A" (BAN-SM) · Blended Learning</span>
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
                <span>CS SMPIT: 0822-2500-2011</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>IG / FB / YouTube: @sekolahislampondokduta</span>
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
                    &rarr; Portal Siswa
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
              Didukung Progressive Web App (PWA) untuk akses offline, Netlify Hosting, dan Google Apps Script API dengan Google Sheets & Drive.
            </p>
            {currentUser?.role === 'admin' ? (
              <div className="flex flex-col gap-2 pt-1">
                <button
                  onClick={onOpenGasConfig}
                  className="w-full text-left px-3 py-2 rounded-xl bg-amber-950/80 hover:bg-amber-900/80 text-amber-200 text-xs font-semibold flex items-center justify-between transition border border-amber-700/60"
                >
                  <span>Konfigurasi GAS API (Admin)</span>
                  <span className="text-[10px] text-amber-400">&gt;</span>
                </button>
                <button
                  onClick={onOpenPanduan}
                  className="w-full text-left px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-slate-200 text-xs font-semibold flex items-center justify-between transition border border-slate-700"
                >
                  <span>Panduan GitHub & Netlify (Admin)</span>
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
            &copy; {new Date().getFullYear()} SPMB SMPIT Pondok Duta Cimanggis Depok. Hak Cipta Dilindungi.
          </div>
          <div className="flex items-center gap-1">
            <span>Dirancang untuk</span>
            <span className="text-emerald-400 font-semibold">PWA Standalone & Netlify Deployment</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
