import React, { useState, useRef, useEffect } from 'react';
import { UserRole, UserAccount } from '../types';
import { gasService } from '../services/gasService';
import { PWAInstallButton } from './PWAInstallButton';
import { 
  Menu, 
  X, 
  Users, 
  HelpCircle, 
  Database,
  ShieldCheck,
  LogIn,
  LogOut,
  UserPlus,
  ChevronDown,
  LayoutGrid,
  Home,
  FileCheck2,
  GitBranch,
  Search
} from 'lucide-react';

interface Props {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  userRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onOpenGasConfig: () => void;
  onOpenPanduan: () => void;
  isGasConfigured: boolean;
  currentUser?: UserAccount | null;
  onGoToLogin: () => void;
  onGoToRegister: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<Props> = ({
  currentTab,
  onSelectTab,
  onRoleChange,
  onOpenGasConfig,
  onOpenPanduan,
  isGasConfigured,
  currentUser,
  onGoToLogin,
  onGoToRegister,
  onLogout
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string>(() => gasService.getAppSettings().logoUrl);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  const navItems = [
    { id: 'home', label: 'Beranda', icon: Home },
    { id: 'syarat', label: 'Syarat Pendaftaran', icon: FileCheck2 },
    { id: 'alur', label: 'Alur Pendaftaran', icon: GitBranch },
    { id: 'cek-kelulusan', label: 'Cek Kelulusan', icon: Search },
  ];

  // Tutup dropdown saat klik di luar
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavClick = (id: string) => {
    onSelectTab(id);
    setMobileMenuOpen(false);
    setDropdownOpen(false);
  };

  const roleBadgeLabel =
    currentUser?.role === 'admin'
      ? 'Admin'
      : currentUser?.role === 'guru'
      ? 'Pewawancara'
      : 'Calon Murid';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-[72px] gap-2">
          
          {/* Kiri: Logo & Identitas Sekolah */}
          <div 
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group min-w-0 flex-1 lg:flex-none"
          >
            {logoUrl ? (
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-white flex items-center justify-center shadow-sm border border-slate-200 overflow-hidden p-0.5 group-hover:scale-105 transition-transform shrink-0">
                <img
                  src={gasService.resolveImageUrl(logoUrl)}
                  alt="Logo SMPIT Pondok Duta"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-emerald-800 via-emerald-700 to-emerald-600 flex items-center justify-center shadow-sm shadow-emerald-700/20 group-hover:scale-105 transition-transform border border-emerald-500/30 shrink-0">
                <span className="font-extrabold text-amber-300 text-sm sm:text-lg tracking-tight">PD</span>
              </div>
            )}
            <div className="min-w-0">
              <div className="text-xs sm:text-base font-extrabold text-slate-900 tracking-tight leading-tight truncate">
                SMPIT PONDOK DUTA
              </div>
              <p className="text-[10px] sm:text-xs text-emerald-700 font-semibold truncate leading-tight mt-0.5">
                Sistem Penerimaan Murid Baru
              </p>
            </div>
          </div>

          {/* Tengah: Desktop Navigation (Hanya tampil di Desktop lg ke atas) */}
          <nav className="hidden lg:flex items-center gap-1 p-1 rounded-xl bg-slate-100/80 border border-slate-200/60 shrink-0">
            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-white text-emerald-800 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Kanan: Desktop Dropdown (lg+) & Mobile/Tablet Hamburger Button (<lg) */}
          <div className="flex items-center gap-2 shrink-0">
            
            {/* DESKTOP DROPDOWN MENU (Hanya tampil di layar lg ke atas agar layar HP tidak terpotong) */}
            <div className="hidden lg:block relative" ref={dropdownRef}>
              {currentUser ? (
                <button
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className={`inline-flex items-center gap-2 h-10 px-4 rounded-xl text-xs font-bold transition-all border shadow-2xs whitespace-nowrap shrink-0 cursor-pointer ${
                    currentUser.role === 'admin'
                      ? 'bg-amber-50/90 hover:bg-amber-100/80 text-amber-950 border-amber-300'
                      : currentUser.role === 'guru'
                      ? 'bg-purple-50/90 hover:bg-purple-100/80 text-purple-950 border-purple-300'
                      : 'bg-emerald-50/90 hover:bg-emerald-100/80 text-emerald-950 border-emerald-300'
                  }`}
                >
                  <LayoutGrid className={`w-4 h-4 shrink-0 ${
                    currentUser.role === 'admin'
                      ? 'text-amber-700'
                      : currentUser.role === 'guru'
                      ? 'text-purple-700'
                      : 'text-emerald-700'
                  }`} />
                  <span>Menu Portal</span>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider ${
                    currentUser.role === 'admin'
                      ? 'bg-amber-200/80 text-amber-900'
                      : currentUser.role === 'guru'
                      ? 'bg-purple-200/80 text-purple-900'
                      : 'bg-emerald-200/80 text-emerald-900'
                  }`}>
                    {roleBadgeLabel}
                  </span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 shrink-0 ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-800 hover:to-teal-800 text-white text-xs font-bold shadow-xs transition-all whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <LogIn className="w-4 h-4 text-amber-300 shrink-0" />
                  <span>Akses Akun & Menu</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 shrink-0 ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>
              )}

              {/* ISI DROPDOWN POPOVER DESKTOP */}
              <div
                className={
                  dropdownOpen
                    ? 'absolute right-0 mt-2 w-72 rounded-2xl bg-white shadow-2xl border border-slate-200/90 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150'
                    : 'hidden'
                }
              >
                  {currentUser ? (
                    <div className="space-y-1">
                      {/* Header Info Akun di dalam Dropdown */}
                      <div className={`p-3 rounded-xl border mb-1.5 ${
                        currentUser.role === 'admin'
                          ? 'bg-amber-50/70 border-amber-200/80'
                          : currentUser.role === 'guru'
                          ? 'bg-purple-50/70 border-purple-200/80'
                          : 'bg-emerald-50/70 border-emerald-200/80'
                      }`}>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                            Login Sebagai {roleBadgeLabel}
                          </span>
                          <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
                            {currentUser.kodePendaftaran}
                          </span>
                        </div>
                        <div className="font-extrabold text-xs text-slate-900 truncate mt-1">
                          {currentUser.namaSiswa}
                        </div>
                      </div>

                      {/* 1. Portal Murid (untuk Calon Siswa & Admin) */}
                      {(currentUser.role === 'siswa' || currentUser.role === 'admin') && (
                        <button
                          type="button"
                          onClick={() => {
                            onRoleChange('siswa');
                            handleNavClick('dashboard-siswa');
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                            currentTab === 'dashboard-siswa'
                              ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                              : 'text-slate-700 hover:bg-emerald-50/70 hover:text-emerald-900'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                              <Users className="w-3.5 h-3.5" />
                            </div>
                            <div className="text-left">
                              <div className="font-bold text-slate-800">Portal Murid</div>
                              <div className="text-[10px] text-slate-500 font-normal">Biodata & Observasi OTM</div>
                            </div>
                          </div>
                          {currentTab === 'dashboard-siswa' && (
                            <span className="w-2 h-2 rounded-full bg-emerald-600" />
                          )}
                        </button>
                      )}

                      {/* 2. Menu Pewawancara (untuk Pewawancara & Admin) */}
                      {(currentUser.role === 'guru' || currentUser.role === 'admin') && (
                        <button
                          type="button"
                          onClick={() => {
                            onRoleChange('guru');
                            handleNavClick('dashboard-guru');
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                            currentTab === 'dashboard-guru'
                              ? 'bg-purple-50 text-purple-900 border border-purple-200'
                              : 'text-slate-700 hover:bg-purple-50/70 hover:text-purple-900'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                              <ShieldCheck className="w-3.5 h-3.5" />
                            </div>
                            <div className="text-left">
                              <div className="font-bold text-slate-800">Menu Pewawancara</div>
                              <div className="text-[10px] text-slate-500 font-normal">Evaluasi OTM & Observasi Murid</div>
                            </div>
                          </div>
                          {currentTab === 'dashboard-guru' && (
                            <span className="w-2 h-2 rounded-full bg-purple-600" />
                          )}
                        </button>
                      )}

                      {/* 3. Koneksi Database & Panduan Deploy (HANYA ADMIN) */}
                      {currentUser.role === 'admin' && (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setDropdownOpen(false);
                              onOpenGasConfig();
                            }}
                            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-amber-50/80 hover:text-amber-950 transition cursor-pointer"
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                                <Database className="w-3.5 h-3.5" />
                              </div>
                              <div className="text-left">
                                <div className="font-bold text-slate-800">Koneksi Database</div>
                                <div className="text-[10px] text-slate-500 font-normal">Setting, Logo, Foto &amp; Drive</div>
                              </div>
                            </div>
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                              isGasConfigured ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {isGasConfigured ? 'Online' : 'Lokal'}
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setDropdownOpen(false);
                              onOpenPanduan();
                            }}
                            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                                <HelpCircle className="w-3.5 h-3.5" />
                              </div>
                              <div className="text-left">
                                <div className="font-bold text-slate-800">Panduan Deploy</div>
                                <div className="text-[10px] text-slate-500 font-normal">GitHub, Netlify & Apps Script</div>
                              </div>
                            </div>
                          </button>
                        </>
                      )}

                      {/* 4. Install Aplikasi (PWA) */}
                      <PWAInstallButton
                        variant="dropdown"
                        onAction={() => setDropdownOpen(false)}
                      />

                      {/* 5. Log Out */}
                      <div className="pt-1 mt-1 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => {
                            setDropdownOpen(false);
                            onLogout();
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                        >
                          <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                            <LogOut className="w-3.5 h-3.5" />
                          </div>
                          <div className="text-left">
                            <div>Log Out / Keluar</div>
                            <div className="text-[10px] text-rose-400 font-normal">Tutup sesi akses portal</div>
                          </div>
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Dropdown Saat Belum Login */
                    <div className="space-y-1">
                      <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Autentikasi & Aplikasi
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setDropdownOpen(false);
                          onGoToLogin();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-900 transition cursor-pointer"
                      >
                        <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                          <LogIn className="w-3.5 h-3.5" />
                        </div>
                        <div className="text-left">
                          <div className="font-bold text-slate-800">Login dengan Kode</div>
                          <div className="text-[10px] text-slate-500 font-normal">Masuk menggunakan kode akses</div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setDropdownOpen(false);
                          onGoToRegister();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-900 transition cursor-pointer"
                      >
                        <div className="w-7 h-7 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                          <UserPlus className="w-3.5 h-3.5" />
                        </div>
                        <div className="text-left">
                          <div className="font-bold text-slate-800">Daftar Akun Baru</div>
                          <div className="text-[10px] text-slate-500 font-normal">Khusus pendaftar calon murid baru</div>
                        </div>
                      </button>

                      <div className="pt-1 mt-1 border-t border-slate-100">
                        <PWAInstallButton
                          variant="dropdown"
                          onAction={() => setDropdownOpen(false)}
                        />
                      </div>
                    </div>
                  )}
              </div>
            </div>

            {/* TAMPILAN HP & TABLET (< lg):
                - Setelah Login: Menu navigasi berpindah seluruhnya ke menu bawah (MobileBottomNav).
                  Di kanan atas hanya tampil chip profil minimalis yang bila disentuh membuka laci menu bawah.
                - Belum Login: Tetap tampil tombol Menu navigasi & login. */}
            {currentUser ? (
              <button
                type="button"
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('open_mobile_bottom_drawer'));
                }}
                className={`lg:hidden inline-flex items-center gap-1.5 h-10 px-3 rounded-xl font-bold text-xs transition shrink-0 cursor-pointer border shadow-2xs ${
                  currentUser.role === 'admin'
                    ? 'bg-amber-50 text-amber-950 border-amber-300 hover:bg-amber-100'
                    : currentUser.role === 'guru'
                    ? 'bg-purple-50 text-purple-950 border-purple-300 hover:bg-purple-100'
                    : 'bg-emerald-50 text-emerald-950 border-emerald-300 hover:bg-emerald-100'
                }`}
                title="Buka Menu & Profil Akun"
              >
                <span className={`w-2 h-2 rounded-full shrink-0 ${
                  currentUser.role === 'admin'
                    ? 'bg-amber-500'
                    : currentUser.role === 'guru'
                    ? 'bg-purple-600'
                    : 'bg-emerald-600'
                }`} />
                <span className="truncate max-w-[110px] sm:max-w-[150px]">
                  {currentUser.namaSiswa || currentUser.kodePendaftaran}
                </span>
                <ChevronDown className="w-3.5 h-3.5 opacity-60 shrink-0" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`lg:hidden inline-flex items-center gap-1.5 h-10 px-3 rounded-xl font-bold text-xs transition shrink-0 cursor-pointer border ${
                  mobileMenuOpen
                    ? 'bg-emerald-700 text-white border-emerald-800 shadow-xs'
                    : 'bg-slate-50 text-slate-800 hover:bg-slate-100 border-slate-200/90'
                }`}
                aria-label="Buka Menu"
              >
                {mobileMenuOpen ? (
                  <>
                    <X className="w-4 h-4 shrink-0" />
                    <span>Tutup</span>
                  </>
                ) : (
                  <>
                    <Menu className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>Menu</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* PANEL MENU DROPDOWN HP & TABLET (< lg) - HANYA SAAT BELUM LOGIN */}
      {!currentUser && (
        <div
          className={
            mobileMenuOpen
              ? 'lg:hidden border-t border-slate-200/80 bg-white px-4 pt-3 pb-5 space-y-4 text-sm animate-in slide-in-from-top-2 shadow-2xl max-h-[calc(100vh-4rem)] overflow-y-auto'
              : 'hidden'
          }
        >
          {/* 1. Menu Navigasi Halaman */}
          <div className="space-y-1.5">
            <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider px-1">
              Navigasi Halaman
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-xs flex items-center gap-2 transition cursor-pointer border ${
                      isActive
                        ? 'bg-emerald-700 text-white font-bold border-emerald-800 shadow-2xs'
                        : 'bg-slate-50/80 text-slate-700 hover:bg-slate-100 font-semibold border-slate-200/60'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-amber-300' : 'text-emerald-700'}`} />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Tombol Login, Registrasi & Unduh Aplikasi */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider px-1">
              Akses Akun &amp; Aplikasi
            </div>
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onGoToLogin();
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                  <span>Login Kode</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onGoToRegister();
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-white border border-emerald-600 text-emerald-800 hover:bg-emerald-50 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span>Daftar Akun</span>
                </button>
              </div>

              <div className="rounded-xl border border-slate-200/80 bg-white">
                <PWAInstallButton
                  variant="dropdown"
                  onAction={() => setMobileMenuOpen(false)}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

