import React, { useState, useEffect } from 'react';
import { UserAccount, UserRole } from '../types';
import { PWAInstallButton } from './PWAInstallButton';
import { 
  FileText, 
  BookOpen, 
  HeartHandshake, 
  CreditCard, 
  Users, 
  Award, 
  Search, 
  UserCheck, 
  Menu, 
  X, 
  Home, 
  FileCheck2, 
  GitBranch, 
  Database, 
  HelpCircle, 
  LogOut, 
  MessageCircle,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  User,
  Mail as MailIcon
} from 'lucide-react';

interface Props {
  currentUser: UserAccount | null;
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onRoleChange?: (role: UserRole) => void;
  siswaSubTab?: 'biodata' | 'wawancara-siswa' | 'wawancara-ortu' | 'kartu';
  onSiswaSubTabChange?: (tab: 'biodata' | 'wawancara-siswa' | 'wawancara-ortu' | 'kartu') => void;
  guruSubTeam?: 'ortu' | 'siswa' | 'data-induk' | 'whatsapp';
  onGuruSubTeamChange?: (team: 'ortu' | 'siswa' | 'data-induk' | 'whatsapp') => void;
  onOpenGasConfig?: () => void;
  onOpenPanduan?: () => void;
  onLogout: () => void;
}

export const MobileBottomNav: React.FC<Props> = ({
  currentUser,
  currentTab,
  onSelectTab,
  onRoleChange,
  siswaSubTab = 'biodata',
  onSiswaSubTabChange,
  guruSubTeam = 'ortu',
  onGuruSubTeamChange,
  onOpenGasConfig,
  onOpenPanduan,
  onLogout
}) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);

  // Dengarkan event untuk membuka bottom drawer dari header
  useEffect(() => {
    const handleOpen = () => setDrawerOpen(true);
    window.addEventListener('open_mobile_bottom_drawer', handleOpen);
    return () => window.removeEventListener('open_mobile_bottom_drawer', handleOpen);
  }, []);

  // Jika belum login, bottom nav tidak dimunculkan (hanya setelah login sesuai brief)
  if (!currentUser) return null;

  const role = currentUser.role;

  // Handler pindah tab untuk Siswa
  const handleSiswaNav = (subTab: 'biodata' | 'wawancara-siswa' | 'wawancara-ortu' | 'kartu') => {
    onSiswaSubTabChange?.(subTab);
    if (currentTab !== 'dashboard-siswa') {
      onSelectTab('dashboard-siswa');
    }
    setDrawerOpen(false);
  };

  // Handler pindah menu untuk Guru / Pewawancara / Admin
  const handleGuruNav = (team: 'ortu' | 'siswa' | 'data-induk' | 'whatsapp') => {
    onGuruSubTeamChange?.(team);
    if (currentTab !== 'dashboard-guru') {
      onSelectTab('dashboard-guru');
    }
    setDrawerOpen(false);
  };

  const roleLabel = 
    role === 'admin' 
      ? 'Administrator' 
      : role === 'guru' 
      ? 'Pewawancara / Guru' 
      : 'Calon Murid';

  const roleThemeColor =
    role === 'admin'
      ? 'amber'
      : role === 'guru'
      ? 'indigo'
      : 'emerald';

  return (
    <>
      {/* ========================================================================= */}
      {/* 1. FIXED BOTTOM NAVIGATION BAR (< lg)                                     */}
      {/* ========================================================================= */}
      <nav 
        aria-label="Navigasi Bawah Mobile"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] no-print pb-[calc(env(safe-area-inset-bottom,0px))]"
      >
        <div className="grid grid-cols-5 h-16 max-w-md mx-auto items-stretch">
          
          {/* ================= ROLE: SISWA ================= */}
          {role === 'siswa' && (
            <>
              {/* 1. Biodata */}
              <button
                type="button"
                onClick={() => handleSiswaNav('biodata')}
                className={`flex flex-col items-center justify-center py-1.5 px-0.5 transition cursor-pointer select-none ${
                  currentTab === 'dashboard-siswa' && siswaSubTab === 'biodata'
                    ? 'text-emerald-700 font-extrabold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <div className={`p-1 rounded-xl transition ${
                  currentTab === 'dashboard-siswa' && siswaSubTab === 'biodata' ? 'bg-emerald-100 text-emerald-800' : ''
                }`}>
                  <FileText className="w-5 h-5 shrink-0" />
                </div>
                <span className="text-[10px] leading-tight truncate mt-0.5">Biodata</span>
              </button>

              {/* 2. Asesmen Murid */}
              <button
                type="button"
                onClick={() => handleSiswaNav('wawancara-siswa')}
                className={`flex flex-col items-center justify-center py-1.5 px-0.5 transition cursor-pointer select-none ${
                  currentTab === 'dashboard-siswa' && siswaSubTab === 'wawancara-siswa'
                    ? 'text-emerald-700 font-extrabold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <div className={`p-1 rounded-xl transition ${
                  currentTab === 'dashboard-siswa' && siswaSubTab === 'wawancara-siswa' ? 'bg-emerald-100 text-emerald-800' : ''
                }`}>
                  <BookOpen className="w-5 h-5 shrink-0" />
                </div>
                <span className="text-[10px] leading-tight truncate mt-0.5">Asesmen</span>
              </button>

              {/* 3. Wawancara Ortu */}
              <button
                type="button"
                onClick={() => handleSiswaNav('wawancara-ortu')}
                className={`flex flex-col items-center justify-center py-1.5 px-0.5 transition cursor-pointer select-none ${
                  currentTab === 'dashboard-siswa' && siswaSubTab === 'wawancara-ortu'
                    ? 'text-emerald-700 font-extrabold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <div className={`p-1 rounded-xl transition ${
                  currentTab === 'dashboard-siswa' && siswaSubTab === 'wawancara-ortu' ? 'bg-emerald-100 text-emerald-800' : ''
                }`}>
                  <HeartHandshake className="w-5 h-5 shrink-0" />
                </div>
                <span className="text-[10px] leading-tight truncate mt-0.5">Wawancara</span>
              </button>

              {/* 4. Kartu Peserta */}
              <button
                type="button"
                onClick={() => handleSiswaNav('kartu')}
                className={`flex flex-col items-center justify-center py-1.5 px-0.5 transition cursor-pointer select-none ${
                  currentTab === 'dashboard-siswa' && siswaSubTab === 'kartu'
                    ? 'text-emerald-700 font-extrabold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <div className={`p-1 rounded-xl transition ${
                  currentTab === 'dashboard-siswa' && siswaSubTab === 'kartu' ? 'bg-emerald-100 text-emerald-800' : ''
                }`}>
                  <CreditCard className="w-5 h-5 shrink-0" />
                </div>
                <span className="text-[10px] leading-tight truncate mt-0.5">Kartu Ujian</span>
              </button>
            </>
          )}

          {/* ================= ROLE: GURU (PEWAWANCARA) ================= */}
          {role === 'guru' && (
            <>
              {/* 1. Wawancara OTM */}
              <button
                type="button"
                onClick={() => handleGuruNav('ortu')}
                className={`flex flex-col items-center justify-center py-1.5 px-0.5 transition cursor-pointer select-none ${
                  currentTab === 'dashboard-guru' && guruSubTeam === 'ortu'
                    ? 'text-indigo-700 font-extrabold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <div className={`p-1 rounded-xl transition ${
                  currentTab === 'dashboard-guru' && guruSubTeam === 'ortu' ? 'bg-indigo-100 text-indigo-800' : ''
                }`}>
                  <Users className="w-5 h-5 shrink-0" />
                </div>
                <span className="text-[10px] leading-tight truncate mt-0.5">Wawancara</span>
              </button>

              {/* 2. Observasi Murid */}
              <button
                type="button"
                onClick={() => handleGuruNav('siswa')}
                className={`flex flex-col items-center justify-center py-1.5 px-0.5 transition cursor-pointer select-none ${
                  currentTab === 'dashboard-guru' && guruSubTeam === 'siswa'
                    ? 'text-indigo-700 font-extrabold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <div className={`p-1 rounded-xl transition ${
                  currentTab === 'dashboard-guru' && guruSubTeam === 'siswa' ? 'bg-indigo-100 text-indigo-800' : ''
                }`}>
                  <BookOpen className="w-5 h-5 shrink-0" />
                </div>
                <span className="text-[10px] leading-tight truncate mt-0.5">Observasi</span>
              </button>

              {/* 3. Data Induk */}
              <button
                type="button"
                onClick={() => handleGuruNav('data-induk')}
                className={`flex flex-col items-center justify-center py-1.5 px-0.5 transition cursor-pointer select-none ${
                  currentTab === 'dashboard-guru' && guruSubTeam === 'data-induk'
                    ? 'text-amber-700 font-extrabold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <div className={`p-1 rounded-xl transition ${
                  currentTab === 'dashboard-guru' && guruSubTeam === 'data-induk' ? 'bg-amber-100 text-amber-800' : ''
                }`}>
                  <Award className="w-5 h-5 shrink-0" />
                </div>
                <span className="text-[10px] leading-tight truncate mt-0.5">Data Induk</span>
              </button>

              {/* 4. Cek Kelulusan */}
              <button
                type="button"
                onClick={() => {
                  onSelectTab('cek-kelulusan');
                  setDrawerOpen(false);
                }}
                className={`flex flex-col items-center justify-center py-1.5 px-0.5 transition cursor-pointer select-none ${
                  currentTab === 'cek-kelulusan'
                    ? 'text-emerald-700 font-extrabold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <div className={`p-1 rounded-xl transition ${
                  currentTab === 'cek-kelulusan' ? 'bg-emerald-100 text-emerald-800' : ''
                }`}>
                  <Search className="w-5 h-5 shrink-0" />
                </div>
                <span className="text-[10px] leading-tight truncate mt-0.5">Kelulusan</span>
              </button>
            </>
          )}

          {/* ================= ROLE: ADMIN ================= */}
          {role === 'admin' && (
            <>
              {/* 1. Wawancara OTM */}
              <button
                type="button"
                onClick={() => handleGuruNav('ortu')}
                className={`flex flex-col items-center justify-center py-1.5 px-0.5 transition cursor-pointer select-none ${
                  currentTab === 'dashboard-guru' && guruSubTeam === 'ortu'
                    ? 'text-indigo-700 font-extrabold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <div className={`p-1 rounded-xl transition ${
                  currentTab === 'dashboard-guru' && guruSubTeam === 'ortu' ? 'bg-indigo-100 text-indigo-800' : ''
                }`}>
                  <Users className="w-5 h-5 shrink-0" />
                </div>
                <span className="text-[10px] leading-tight truncate mt-0.5">Wawancara</span>
              </button>

              {/* 2. Observasi Murid */}
              <button
                type="button"
                onClick={() => handleGuruNav('siswa')}
                className={`flex flex-col items-center justify-center py-1.5 px-0.5 transition cursor-pointer select-none ${
                  currentTab === 'dashboard-guru' && guruSubTeam === 'siswa'
                    ? 'text-indigo-700 font-extrabold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <div className={`p-1 rounded-xl transition ${
                  currentTab === 'dashboard-guru' && guruSubTeam === 'siswa' ? 'bg-indigo-100 text-indigo-800' : ''
                }`}>
                  <BookOpen className="w-5 h-5 shrink-0" />
                </div>
                <span className="text-[10px] leading-tight truncate mt-0.5">Observasi</span>
              </button>

              {/* 3. Data Induk */}
              <button
                type="button"
                onClick={() => handleGuruNav('data-induk')}
                className={`flex flex-col items-center justify-center py-1.5 px-0.5 transition cursor-pointer select-none ${
                  currentTab === 'dashboard-guru' && guruSubTeam === 'data-induk'
                    ? 'text-amber-700 font-extrabold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <div className={`p-1 rounded-xl transition ${
                  currentTab === 'dashboard-guru' && guruSubTeam === 'data-induk' ? 'bg-amber-100 text-amber-800' : ''
                }`}>
                  <Award className="w-5 h-5 shrink-0" />
                </div>
                <span className="text-[10px] leading-tight truncate mt-0.5">Data Induk</span>
              </button>

              {/* 4. Portal Siswa */}
              <button
                type="button"
                onClick={() => {
                  onSelectTab('dashboard-siswa');
                  setDrawerOpen(false);
                }}
                className={`flex flex-col items-center justify-center py-1.5 px-0.5 transition cursor-pointer select-none ${
                  currentTab === 'dashboard-siswa'
                    ? 'text-emerald-700 font-extrabold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <div className={`p-1 rounded-xl transition ${
                  currentTab === 'dashboard-siswa' ? 'bg-emerald-100 text-emerald-800' : ''
                }`}>
                  <UserCheck className="w-5 h-5 shrink-0" />
                </div>
                <span className="text-[10px] leading-tight truncate mt-0.5">Portal Siswa</span>
              </button>
            </>
          )}

          {/* 5. ITEM TERAKHIR: MENU LAIN (SLIDE-UP DRAWER) */}
          <button
            type="button"
            onClick={() => setDrawerOpen(!drawerOpen)}
            className={`flex flex-col items-center justify-center py-1.5 px-0.5 transition cursor-pointer select-none ${
              drawerOpen
                ? 'text-emerald-700 font-extrabold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
            aria-label="Buka Menu Lainnya"
          >
            <div className={`p-1 rounded-xl transition ${
              drawerOpen ? 'bg-slate-100 text-slate-900' : ''
            }`}>
              <Menu className="w-5 h-5 shrink-0" />
            </div>
            <span className="text-[10px] leading-tight truncate mt-0.5">Menu Lain</span>
          </button>

        </div>
      </nav>

      {/* ========================================================================= */}
      {/* 2. BOTTOM SHEET DRAWER "MENU LAIN" (< lg)                                 */}
      {/* ========================================================================= */}
      {drawerOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setDrawerOpen(false)}
        >
          <div 
            className="w-full bg-white rounded-t-3xl border-t border-slate-200 p-5 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-250 pb-[calc(env(safe-area-inset-bottom,0px)+1.5rem)]"
            onClick={(e) => e.stopPropagation()}
          >
            
            {/* Drag handle */}
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto -mt-1 mb-2" />

            {/* Header Profil Akun */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold shrink-0 ${
                  role === 'admin'
                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                    : role === 'guru'
                    ? 'bg-purple-100 text-purple-800 border border-purple-200'
                    : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                }`}>
                  <User className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-extrabold text-sm text-slate-900 truncate">
                    {currentUser.namaSiswa || currentUser.kodePendaftaran || 'Pengguna'}
                  </h4>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                      role === 'admin'
                        ? 'bg-amber-100 text-amber-900'
                        : role === 'guru'
                        ? 'bg-purple-100 text-purple-900'
                        : 'bg-emerald-100 text-emerald-900'
                    }`}>
                      {roleLabel}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {currentUser.kodePendaftaran}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                aria-label="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Section 1: Navigasi Utama Aplikasi */}
            <div className="space-y-1.5">
              <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider px-1">
                Navigasi Halaman
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onSelectTab('home');
                    setDrawerOpen(false);
                  }}
                  className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition cursor-pointer ${
                    currentTab === 'home'
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                      : 'bg-slate-50 border-slate-200/80 text-slate-700 hover:bg-slate-100 font-semibold'
                  }`}
                >
                  <Home className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span className="text-xs">Beranda</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onSelectTab('cek-kelulusan');
                    setDrawerOpen(false);
                  }}
                  className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition cursor-pointer ${
                    currentTab === 'cek-kelulusan'
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                      : 'bg-slate-50 border-slate-200/80 text-slate-700 hover:bg-slate-100 font-semibold'
                  }`}
                >
                  <Search className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span className="text-xs">Cek Kelulusan</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onSelectTab('syarat');
                    setDrawerOpen(false);
                  }}
                  className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition cursor-pointer ${
                    currentTab === 'syarat'
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                      : 'bg-slate-50 border-slate-200/80 text-slate-700 hover:bg-slate-100 font-semibold'
                  }`}
                >
                  <FileCheck2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span className="text-xs">Syarat</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onSelectTab('alur');
                    setDrawerOpen(false);
                  }}
                  className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition cursor-pointer ${
                    currentTab === 'alur'
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                      : 'bg-slate-50 border-slate-200/80 text-slate-700 hover:bg-slate-100 font-semibold'
                  }`}
                >
                  <GitBranch className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span className="text-xs">Alur Seleksi</span>
                </button>
              </div>
            </div>

            {/* Section 2: Akses Portal & Administrasi */}
            <div className="space-y-1.5 pt-1 border-t border-slate-100">
              <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider px-1">
                Portal &amp; Pengaturan
              </div>
              <div className="space-y-1.5">
                {/* Switch to Portal Murid (Admin) */}
                {role === 'admin' && (
                  <button
                    type="button"
                    onClick={() => {
                      onRoleChange?.('siswa');
                      onSelectTab('dashboard-siswa');
                      setDrawerOpen(false);
                    }}
                    className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition cursor-pointer ${
                      currentTab === 'dashboard-siswa'
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold'
                        : 'bg-white border-slate-200/80 text-slate-700 hover:bg-emerald-50/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                        <Users className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-xs text-slate-800">Portal Calon Murid</div>
                        <div className="text-[10px] text-slate-500 font-normal">Biodata, Asesmen &amp; Wawancara Ortu</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-emerald-700 shrink-0" />
                  </button>
                )}

                {/* Switch to Menu Pewawancara (Admin & Guru) */}
                {(role === 'admin' || role === 'guru') && (
                  <button
                    type="button"
                    onClick={() => {
                      onRoleChange?.('guru');
                      onSelectTab('dashboard-guru');
                      setDrawerOpen(false);
                    }}
                    className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition cursor-pointer ${
                      currentTab === 'dashboard-guru'
                        ? 'bg-purple-50 border-purple-300 text-purple-950 font-bold'
                        : 'bg-white border-slate-200/80 text-slate-700 hover:bg-purple-50/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-xs text-slate-800">Menu Tim Pewawancara</div>
                        <div className="text-[10px] text-slate-500 font-normal">Evaluasi OTM &amp; Observasi Murid</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-purple-700 shrink-0" />
                  </button>
                )}

                {/* WhatsApp Kelulusan (Admin & Guru) */}
                {(role === 'admin' || role === 'guru') && (
                  <button
                    type="button"
                    onClick={() => {
                      onRoleChange?.(role === 'admin' ? 'admin' : 'guru');
                      handleGuruNav('whatsapp');
                    }}
                    className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition cursor-pointer ${
                      currentTab === 'dashboard-guru' && guruSubTeam === 'whatsapp'
                        ? 'bg-teal-50 border-teal-300 text-teal-950 font-bold'
                        : 'bg-white border-slate-200/80 text-slate-700 hover:bg-teal-50/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center shrink-0">
                        <MessageCircle className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-xs text-slate-800">WhatsApp Pengumuman</div>
                        <div className="text-[10px] text-slate-500 font-normal">Kirim Pengumuman ke Nomor Akun Pendaftar</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-teal-700 shrink-0" />
                  </button>
                )}

                {/* Database Google Apps Script (HANYA ADMIN) */}
                {role === 'admin' && (
                  <button
                    type="button"
                    onClick={() => {
                      setDrawerOpen(false);
                      onOpenGasConfig?.();
                    }}
                    className="w-full p-3 rounded-2xl bg-amber-50/70 border border-amber-200 text-amber-950 flex items-center justify-between transition hover:bg-amber-100/70 cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                        <Database className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-xs text-slate-800">Koneksi Database &amp; Google Apps Script</div>
                        <div className="text-[10px] text-slate-500 font-normal">Sheet, Logo, Foto &amp; Google Drive</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-amber-700 shrink-0" />
                  </button>
                )}

                {/* Panduan Deploy (HANYA ADMIN) */}
                {role === 'admin' && (
                  <button
                    type="button"
                    onClick={() => {
                      setDrawerOpen(false);
                      onOpenPanduan?.();
                    }}
                    className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 flex items-center justify-between transition hover:bg-slate-100 cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                        <HelpCircle className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-xs text-slate-800">Panduan Deploy Aplikasi</div>
                        <div className="text-[10px] text-slate-500 font-normal">GitHub, Netlify &amp; Apps Script</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
                  </button>
                )}

                {/* Tombol Install Aplikasi PWA di Drawer Mobile */}
                <div className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden">
                  <PWAInstallButton
                    variant="dropdown"
                    onAction={() => setDrawerOpen(false)}
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Kontak Pengembang & Logout */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <button
                type="button"
                onClick={() => setContactModalOpen(true)}
                className="w-full p-3 rounded-2xl bg-slate-50 hover:bg-emerald-50 border border-slate-200/80 hover:border-emerald-200 text-slate-700 hover:text-emerald-900 flex items-center justify-between transition text-xs font-bold cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <MessageCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Hubungi Pengembang (Abu Haripin)</span>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-400 shrink-0" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setDrawerOpen(false);
                  onLogout();
                }}
                className="w-full p-3 rounded-2xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 flex items-center justify-center gap-2 transition text-xs font-extrabold cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-rose-700 shrink-0" />
                <span>Keluar dari Akun</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Modal Hubungi Pengembang dari Drawer */}
      {contactModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-4 animate-in fade-in duration-150"
          onClick={() => setContactModalOpen(false)}
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
                onClick={() => setContactModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Silakan pilih saluran komunikasi berikut:
            </p>

            <div className="space-y-2.5 pt-1">
              <a
                href="https://wa.me/6285310999527?text=Halo%20Pak%20Abu%20Haripin%2C%20saya%20berminat%20memesan%20aplikasi%20web%20atau%20PWA%20seperti%20sistem%20SPMB%20SMPIT%20Pondok%20Duta.%20Mohon%20informasi%20biaya%20dan%20detailnya."
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setContactModalOpen(false)}
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

              <a
                href="mailto:abuharipin@gmail.com?subject=Pemesanan%20Aplikasi%20Web%20atau%20PWA%20Sekolah&body=Halo%20Pak%20Abu%20Haripin%2C%0A%0ASaya%20berminat%20untuk%20memesan%20aplikasi%20web%20atau%20PWA%20seperti%20sistem%20SPMB%20SMPIT%20Pondok%20Duta.%20Mohon%20informasi%20spesifikasi%20dan%20biayanya.%0A%0ATerima%20kasih."
                onClick={() => setContactModalOpen(false)}
                className="w-full p-3 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/40 text-cyan-200 hover:text-white flex items-center justify-between transition group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-cyan-600 text-white flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition">
                    <MailIcon className="w-5 h-5" />
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
          </div>
        </div>
      )}
    </>
  );
};
