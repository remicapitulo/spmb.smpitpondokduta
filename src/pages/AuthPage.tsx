import React, { useState, useEffect } from 'react';
import { gasService } from '../services/gasService';
import { UserAccount } from '../types';
import { 
  KeyRound, 
  UserPlus, 
  LogIn, 
  CheckCircle2, 
  Copy, 
  Check, 
  ArrowRight, 
  GraduationCap, 
  School, 
  Phone, 
  Mail, 
  User, 
  AlertCircle,
  Sparkles
} from 'lucide-react';

interface AuthPageProps {
  initialMode?: 'login' | 'register';
  onLoginSuccess: (user: UserAccount) => void;
  onGoToHome?: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  initialMode = 'login',
  onLoginSuccess,
  onGoToHome
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

  // Form State for Registration
  const [regForm, setRegForm] = useState({
    namaSiswa: '',
    namaOrangTua: '',
    sekolahAsal: '',
    nomorHp: '',
    emailOrangTua: ''
  });
  const [regError, setRegError] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registeredUser, setRegisteredUser] = useState<UserAccount | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Form State for Login
  const [loginKode, setLoginKode] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string>(() => gasService.getAppSettings().logoUrl);

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

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    if (!regForm.namaSiswa.trim()) {
      setRegError('Nama Lengkap Murid wajib diisi.');
      return;
    }
    if (!regForm.namaOrangTua.trim()) {
      setRegError('Nama Orang Tua wajib diisi.');
      return;
    }
    if (!regForm.sekolahAsal.trim()) {
      setRegError('Sekolah Asal wajib diisi.');
      return;
    }
    if (!regForm.nomorHp.trim()) {
      setRegError('Nomor HP/WhatsApp Orang Tua wajib diisi.');
      return;
    }
    if (!regForm.emailOrangTua.trim()) {
      setRegError('Email Orang Tua wajib diisi.');
      return;
    }

    setIsRegistering(true);
    try {
      const res = gasService.registerUser(regForm);
      if (res.success && res.user) {
        setRegisteredUser(res.user);
      } else {
        setRegError(res.message || 'Terjadi kesalahan saat pendaftaran.');
      }
    } catch {
      setRegError('Terjadi kesalahan sistem saat mendaftarkan akun.');
    } finally {
      setIsRegistering(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const cleanKode = loginKode.trim();
    if (!cleanKode) {
      setLoginError('Silakan masukkan Kode Akses Anda.');
      return;
    }

    setIsLoggingIn(true);
    try {
      const res = await gasService.loginWithKodeAsync(cleanKode);
      if (res.success && res.user) {
        onLoginSuccess(res.user);
      } else {
        setLoginError(res.message);
        setIsLoggingIn(false);
      }
    } catch {
      setLoginError('Gagal memeriksa kode akses di database.');
      setIsLoggingIn(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleProceedToDashboard = () => {
    if (registeredUser) {
      onLoginSuccess(registeredUser);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-4 px-2 sm:px-0">
      {/* Brand Header */}
      <div className="text-center mb-8">
        {logoUrl ? (
          <img
            src={gasService.resolveImageUrl(logoUrl)}
            alt="Logo SMPIT Pondok Duta"
            referrerPolicy="no-referrer"
            className="w-16 h-16 rounded-2xl object-contain bg-white p-1.5 shadow-lg border border-emerald-100 mx-auto mb-3"
          />
        ) : (
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 mb-3 ring-4 ring-emerald-50">
            <GraduationCap className="w-8 h-8" />
          </div>
        )}
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Login Akses Portal SPMB
        </h1>
        <p className="text-sm sm:text-base text-slate-600 mt-1 max-w-md mx-auto">
          SMPIT Pondok Duta - Sistem Penerimaan Murid Baru
        </p>
      </div>

      {/* Success Modal / Card for Registration */}
      {registeredUser ? (
        <div className="bg-white rounded-3xl shadow-xl border border-emerald-100 p-6 sm:p-8 text-center animate-fadeIn relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-emerald-100/60 rounded-full blur-2xl pointer-events-none" />
          <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto mb-4 ring-8 ring-emerald-50">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Pendaftaran Akun Berhasil
          </span>

          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            Selamat Datang, {registeredUser.namaSiswa}!
          </h2>
          <p className="text-sm text-slate-600 mt-2 max-w-md mx-auto">
            Akun pendaftaran Anda telah tersimpan di database sistem. Simpan kode pendaftaran unik di bawah ini untuk masuk kembali ke akun Anda kapan saja.
          </p>

          {/* Registration Code Badge */}
          <div className="my-6 p-5 sm:p-6 bg-slate-900 rounded-2xl text-white shadow-inner relative border border-slate-800">
            <div className="text-xs uppercase tracking-wider font-semibold text-emerald-400 mb-1">
              Kode Pendaftaran Rahasia Anda
            </div>
            <div className="text-2xl sm:text-4xl font-mono font-black tracking-widest text-white selection:bg-emerald-500 selection:text-white my-2">
              {registeredUser.kodePendaftaran}
            </div>
            <div className="flex items-center justify-center gap-2 mt-3">
              <button
                type="button"
                onClick={() => copyToClipboard(registeredUser.kodePendaftaran)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/30 text-xs sm:text-sm font-semibold transition-colors border border-white/20"
              >
                {copiedCode ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400">Kode Berhasil Disalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Salin Kode Pendaftaran</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Account Summary info */}
          <div className="bg-slate-50 rounded-2xl p-4 text-left border border-slate-200/80 mb-6 space-y-2 text-xs sm:text-sm">
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500">Nama Murid:</span>
              <span className="font-bold text-slate-800">{registeredUser.namaSiswa}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500">Nama Orang Tua:</span>
              <span className="font-semibold text-slate-800">{registeredUser.namaOrangTua}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500">Sekolah Asal:</span>
              <span className="font-semibold text-slate-800">{registeredUser.sekolahAsal}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500">No. HP Orang Tua:</span>
              <span className="font-semibold text-slate-800">{registeredUser.nomorHp}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Email:</span>
              <span className="font-semibold text-slate-800">{registeredUser.emailOrangTua}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={handleProceedToDashboard}
              className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm sm:text-base shadow-lg shadow-emerald-600/30 transition-all hover:scale-[1.01]"
            >
              <span>Masuk ke Portal Murid Sekarang</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      ) : (
        /* Auth Card with Tabs */
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 p-1.5 bg-slate-100/90 border-b border-slate-200 m-3 rounded-2xl">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setLoginError(null);
              }}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all ${
                mode === 'login'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LogIn className="w-4 h-4 text-emerald-600" />
              <span>Login dengan Kode</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setRegError(null);
              }}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all ${
                mode === 'register'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserPlus className="w-4 h-4 text-emerald-600" />
              <span>Pendaftaran Akun Murid</span>
            </button>
          </div>

          <div className="p-6 sm:p-8">
            {/* LOGIN TAB */}
            {mode === 'login' && (
              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-sm font-bold text-slate-800">
                      Kode Pendaftaran / Kode Akses
                    </label>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <KeyRound className="w-5 h-5" />
                    </div>
                    <input
                      type="text"
                      value={loginKode}
                      onChange={(e) => {
                        setLoginKode(e.target.value);
                        setLoginError(null);
                      }}
                      placeholder="Masukkan Kode Akses Anda"
                      className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-300 rounded-2xl text-slate-900 font-mono font-bold tracking-wider placeholder:font-sans placeholder:font-normal placeholder:tracking-normal focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all uppercase"
                      required
                    />
                  </div>
                </div>

                {loginError && (
                  <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-start gap-2.5">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-500 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-bold">Gagal Masuk</p>
                      <p className="mt-0.5">{loginError}</p>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-base shadow-lg shadow-emerald-600/25 transition-all hover:scale-[1.005] disabled:opacity-60 cursor-pointer"
                >
                  <LogIn className="w-5 h-5" />
                  <span>{isLoggingIn ? 'Memverifikasi Kode...' : 'Masuk ke Portal'}</span>
                </button>

                <div className="text-center pt-2">
                  <p className="text-xs text-slate-500">
                    Calon murid baru belum punya kode pendaftaran?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setMode('register');
                        setLoginError(null);
                      }}
                      className="font-bold text-emerald-600 hover:text-emerald-700 hover:underline"
                    >
                      Daftar Akun Baru Sekarang
                    </button>
                  </p>
                </div>
              </form>
            )}

            {/* REGISTER TAB */}
            {mode === 'register' && (
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-4 mb-2 flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-emerald-900 leading-relaxed">
                    <span className="font-bold">Pendaftaran Cepat & Aman:</span> Cukup isi 5 data di bawah. Sistem akan secara otomatis menerbitkan <strong>Kode Pendaftaran Acak</strong> yang unik dan sulit ditebak untuk akses akun.
                  </div>
                </div>

                {/* 1. Nama Lengkap Murid */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Lengkap Murid <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={regForm.namaSiswa}
                      onChange={(e) => setRegForm({ ...regForm, namaSiswa: e.target.value })}
                      placeholder="Contoh: Muhammad Rafif Pratama"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>
                </div>

                {/* 2. Nama Orang Tua */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Orang Tua (Ayah / Bunda) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={regForm.namaOrangTua}
                      onChange={(e) => setRegForm({ ...regForm, namaOrangTua: e.target.value })}
                      placeholder="Contoh: Hendra Pratama / Rina Wulandari"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>
                </div>

                {/* 3. Sekolah Asal */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Sekolah Asal (SD / MI) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <School className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={regForm.sekolahAsal}
                      onChange={(e) => setRegForm({ ...regForm, sekolahAsal: e.target.value })}
                      placeholder="Contoh: SDIT Pondok Duta / SDN Tugu 1 Depok"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>
                </div>

                {/* 4. Nomor HP / WA Orang Tua */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nomor Handphone / WhatsApp Orang Tua <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      type="tel"
                      value={regForm.nomorHp}
                      onChange={(e) => setRegForm({ ...regForm, nomorHp: e.target.value })}
                      placeholder="Contoh: 081298765432"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>
                </div>

                {/* 5. Email Orang Tua */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Orang Tua <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      value={regForm.emailOrangTua}
                      onChange={(e) => setRegForm({ ...regForm, emailOrangTua: e.target.value })}
                      placeholder="Contoh: orangtua.murid@gmail.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>
                </div>

                {regError && (
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-500" />
                    <span>{regError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isRegistering}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-sm sm:text-base shadow-lg shadow-emerald-600/25 transition-all hover:scale-[1.005] disabled:opacity-60 mt-2"
                >
                  <UserPlus className="w-5 h-5" />
                  <span>{isRegistering ? 'Memproses Pendaftaran...' : 'Daftar & Dapatkan Kode Pendaftaran'}</span>
                </button>

                <div className="text-center pt-2">
                  <p className="text-xs text-slate-500">
                    Sudah memiliki kode pendaftaran sebelumnya?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setMode('login');
                        setRegError(null);
                      }}
                      className="font-bold text-emerald-600 hover:text-emerald-700 hover:underline"
                    >
                      Login dengan Kode
                    </button>
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Back to Home Link */}
      {onGoToHome && (
        <div className="text-center mt-6">
          <button
            type="button"
            onClick={onGoToHome}
            className="text-xs sm:text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors"
          >
            ← Kembali ke Beranda Utama
          </button>
        </div>
      )}
    </div>
  );
};
