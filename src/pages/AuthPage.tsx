import React, { useState, useEffect } from 'react';
import { gasService, formatPhoneNumberForWa } from '../services/gasService';
import { UserAccount, getAcademicYear } from '../types';
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
  ShieldCheck,
  ClipboardPaste,
  HelpCircle,
  MessageCircle,
  ArrowLeft
} from 'lucide-react';

interface AuthPageProps {
  initialMode?: 'login' | 'register';
  onLoginSuccess: (user: UserAccount) => void;
  onGoToHome?: () => void;
}

const COUNTRY_CODES = [
  { code: '62', iso: 'ID', placeholder: '081234567890' },
  { code: '60', iso: 'MY', placeholder: '0123456789' },
  { code: '65', iso: 'SG', placeholder: '81234567' },
  { code: '673', iso: 'BN', placeholder: '7123456' },
  { code: '966', iso: 'SA', placeholder: '0501234567' },
  { code: '971', iso: 'AE', placeholder: '0501234567' },
  { code: '974', iso: 'QA', placeholder: '33123456' },
  { code: '965', iso: 'KW', placeholder: '50012345' },
  { code: '968', iso: 'OM', placeholder: '92123456' },
  { code: '973', iso: 'BH', placeholder: '36001234' },
  { code: '20', iso: 'EG', placeholder: '01001234567' },
  { code: '962', iso: 'JO', placeholder: '0790123456' },
  { code: '90', iso: 'TR', placeholder: '05012345678' },
  { code: '967', iso: 'YE', placeholder: '0711234567' },
  { code: '81', iso: 'JP', placeholder: '09012345678' },
  { code: '82', iso: 'KR', placeholder: '01012345678' },
  { code: '886', iso: 'TW', placeholder: '0912345678' },
  { code: '852', iso: 'HK', placeholder: '51234567' },
  { code: '86', iso: 'CN', placeholder: '13800138000' },
  { code: '66', iso: 'TH', placeholder: '0812345678' },
  { code: '63', iso: 'PH', placeholder: '09171234567' },
  { code: '84', iso: 'VN', placeholder: '0912345678' },
  { code: '61', iso: 'AU', placeholder: '0412345678' },
  { code: '64', iso: 'NZ', placeholder: '0211234567' },
  { code: '44', iso: 'GB', placeholder: '07400123456' },
  { code: '49', iso: 'DE', placeholder: '015123456789' },
  { code: '31', iso: 'NL', placeholder: '0612345678' },
  { code: '33', iso: 'FR', placeholder: '0612345678' },
  { code: '1', iso: 'US', placeholder: '2025550125' }
];

export const AuthPage: React.FC<AuthPageProps> = ({
  initialMode = 'login',
  onLoginSuccess,
  onGoToHome
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const tahunPelajaran = getAcademicYear();

  // Sinkronisasi mode jika prop initialMode berubah
  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  // Form State for Registration (default kode negara: 62 - ID)
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>('62');
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

  // Fungsi pembersih angka 0 di awal (dipanggil saat pindah kolom / onBlur atau saat klik tombol Daftar)
  const stripLeadingZeroPhone = (rawVal: string, countryCode: string): string => {
    let digits = rawVal.replace(/[^0-9]/g, '');
    if (digits.startsWith(countryCode + '0')) {
      digits = digits.slice(countryCode.length + 1);
    } else if (digits.startsWith(countryCode) && digits.length >= countryCode.length + 8) {
      digits = digits.slice(countryCode.length);
    }
    return digits.replace(/^0+/, '');
  };

  // Biarkan orang tua mengetik angka 0 terlebih dahulu tanpa diblokir
  const handlePhoneInputChange = (rawVal: string) => {
    const digits = rawVal.replace(/[^0-9]/g, '');
    setRegForm({ ...regForm, nomorHp: digits });
  };

  // Saat pindah kolom (onBlur), otomatis hilangkan angka 0 di depan
  const handlePhoneInputBlur = () => {
    if (!regForm.nomorHp) return;
    const cleaned = stripLeadingZeroPhone(regForm.nomorHp, selectedCountryCode);
    if (cleaned !== regForm.nomorHp) {
      setRegForm(prev => ({ ...prev, nomorHp: cleaned }));
    }
  };

  const activeCountryInfo = COUNTRY_CODES.find(c => c.code === selectedCountryCode) || COUNTRY_CODES[0];
  const cleanedPreviewDigits = stripLeadingZeroPhone(regForm.nomorHp, selectedCountryCode);
  const fullInternationalPhone = cleanedPreviewDigits ? `${selectedCountryCode}${cleanedPreviewDigits}` : '';

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    if (!regForm.namaSiswa.trim()) {
      setRegError('Nama lengkap calon murid wajib diisi.');
      return;
    }
    if (!regForm.namaOrangTua.trim()) {
      setRegError('Nama orang tua/wali murid wajib diisi.');
      return;
    }
    if (!regForm.sekolahAsal.trim()) {
      setRegError('Sekolah asal (SD/MI) wajib diisi.');
      return;
    }
    const cleanLocalDigits = stripLeadingZeroPhone(regForm.nomorHp, selectedCountryCode);
    if (cleanLocalDigits !== regForm.nomorHp) {
      setRegForm(prev => ({ ...prev, nomorHp: cleanLocalDigits }));
    }
    const combinedPhone = `${selectedCountryCode}${cleanLocalDigits}`;
    if (!cleanLocalDigits || cleanLocalDigits.length < 6 || combinedPhone.length < 8) {
      setRegError(`Nomor WhatsApp orang tua belum lengkap (contoh: ${activeCountryInfo.placeholder}).`);
      return;
    }
    if (!regForm.emailOrangTua.trim()) {
      setRegError('Alamat email orang tua wajib diisi.');
      return;
    }

    setIsRegistering(true);
    try {
      const res = gasService.registerUser({
        ...regForm,
        nomorHp: combinedPhone
      });
      if (res.success && res.user) {
        setRegisteredUser(res.user);
      } else {
        setRegError(res.message || 'Terjadi kendala saat pendaftaran akun.');
      }
    } catch {
      setRegError('Terjadi kesalahan teknis saat mendaftarkan akun ke sistem.');
    } finally {
      setIsRegistering(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const cleanKode = loginKode.trim();
    if (!cleanKode) {
      setLoginError('Silakan masukkan Kode Akses / Nomor Pendaftaran Anda.');
      return;
    }

    setIsLoggingIn(true);
    try {
      const res = await gasService.loginWithKodeAsync(cleanKode);
      if (res.success && res.user) {
        onLoginSuccess(res.user);
      } else {
        setLoginError(res.message || 'Kode akses tidak ditemukan. Periksa kembali atau daftar akun baru.');
        setIsLoggingIn(false);
      }
    } catch {
      setLoginError('Koneksi terganggu saat memverifikasi kode di database.');
      setIsLoggingIn(false);
    }
  };

  const handlePasteCode = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          setLoginKode(text.trim().toUpperCase());
          setLoginError(null);
        }
      }
    } catch {
      // Ignore clipboard permission denial
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
    <div className="w-full max-w-xl mx-auto py-2 sm:py-6 animate-in fade-in duration-300">
      
      {/* Tombol Navigasi Kembali ke Beranda */}
      {onGoToHome && (
        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            onClick={onGoToHome}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-emerald-800 transition cursor-pointer group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>Kembali ke Beranda</span>
          </button>
          <span className="text-[11px] font-semibold text-slate-400 hidden sm:inline">
            TP {tahunPelajaran}
          </span>
        </div>
      )}

      {/* Brand Header */}
      <div className="text-center mb-6">
        <div className="inline-block relative">
          {logoUrl ? (
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white border border-slate-200/90 shadow-md p-2 mx-auto mb-3 flex items-center justify-center transition-transform hover:scale-105">
              <img
                src={gasService.resolveImageUrl(logoUrl)}
                alt="Logo SMPIT Pondok Duta"
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain"
              />
            </div>
          ) : (
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-emerald-800 to-emerald-600 text-white shadow-md p-2 mx-auto mb-3 flex items-center justify-center border border-emerald-500/30">
              <GraduationCap className="w-9 h-9 text-amber-300" />
            </div>
          )}
        </div>

        <div className="flex items-center justify-center gap-2 mb-1">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-800">
            SMPIT PONDOK DUTA
          </span>
          <span className="text-slate-300">·</span>
          <span className="text-[10px] font-bold text-slate-500">
            Terakreditasi "A"
          </span>
        </div>

        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          {mode === 'login' ? 'Login Akses Portal SPMB' : 'Pendaftaran Akun Murid Baru'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-sm mx-auto leading-relaxed">
          Sistem Penerimaan Murid Baru Terpadu SMPIT Pondok Duta Tahun Pelajaran {tahunPelajaran}
        </p>
      </div>

      {/* Tampilan Kartu Berhasil Registrasi (Credential Voucher Card) */}
      {registeredUser ? (
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-900/5 border border-slate-200/80 p-6 sm:p-8 text-center animate-in zoom-in-95 duration-200">
          
          <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-2xs border border-emerald-200">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200 mb-2">
            Pendaftaran Akun Berhasil
          </div>

          <h2 className="text-lg sm:text-xl font-black text-slate-900">
            Ahlan Wa Sahlan, {registeredUser.namaSiswa}!
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1.5 max-w-md mx-auto leading-relaxed">
            Data Anda telah tersimpan di database SPMB. Gunakan <strong className="text-slate-900">Kode Pendaftaran</strong> resmi di bawah untuk masuk ke akun Anda kapan saja.
          </p>

          {/* Kotak Voucher Kode Akses */}
          <div className="my-5 p-5 bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 rounded-2xl text-white shadow-lg border border-slate-800 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="text-[11px] uppercase tracking-wider font-bold text-emerald-400 mb-1">
              Kode Akses / Nomor Pendaftaran
            </div>
            <div className="text-2xl sm:text-3xl font-mono font-black tracking-widest text-white selection:bg-emerald-500 my-2">
              {registeredUser.kodePendaftaran}
            </div>
            <p className="text-[11px] text-slate-400 mb-3">
              *Harap simpan atau tangkap layar (screenshot) kode ini sebagai kunci masuk portal.
            </p>
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => copyToClipboard(registeredUser.kodePendaftaran)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/30 text-xs font-bold transition border border-white/20 cursor-pointer"
              >
                {copiedCode ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400">Kode Berhasil Disalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-emerald-300" />
                    <span>Salin Kode Pendaftaran</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Ringkasan Profil Calon Murid */}
          <div className="bg-slate-50/80 rounded-2xl p-4 text-left border border-slate-200/80 mb-5 text-xs space-y-2">
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 pb-1 border-b border-slate-200">
              Data Registrasi Awal
            </div>
            <div className="flex justify-between py-0.5">
              <span className="text-slate-500">Nama Calon Murid</span>
              <span className="font-bold text-slate-800 text-right">{registeredUser.namaSiswa}</span>
            </div>
            <div className="flex justify-between py-0.5">
              <span className="text-slate-500">Asal Sekolah SD/MI</span>
              <span className="font-semibold text-slate-800 text-right">{registeredUser.sekolahAsal}</span>
            </div>
            <div className="flex justify-between py-0.5">
              <span className="text-slate-500">Nama Orang Tua</span>
              <span className="font-semibold text-slate-800 text-right">{registeredUser.namaOrangTua}</span>
            </div>
            <div className="flex justify-between py-0.5">
              <span className="text-slate-500">WhatsApp</span>
              <span className="font-mono font-semibold text-slate-800 text-right">{registeredUser.nomorHp}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleProceedToDashboard}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white font-bold text-sm shadow-md shadow-emerald-900/20 transition cursor-pointer"
          >
            <span>Buka Portal Murid Sekarang</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        /* Card Utama Form Autentikasi */
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-900/5 border border-slate-200/80 overflow-hidden">
          
          {/* Segmented Control Switcher yang Rapi & Presisi */}
          <div className="p-1.5 bg-slate-100/80 border-b border-slate-200/70 m-3 rounded-2xl grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setLoginError(null);
              }}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-white text-emerald-900 shadow-xs border border-slate-200/60 font-black'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <LogIn className={`w-4 h-4 ${mode === 'login' ? 'text-emerald-700' : 'text-slate-400'}`} />
              <span>Login dengan Kode</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMode('register');
                setRegError(null);
              }}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                mode === 'register'
                  ? 'bg-white text-emerald-900 shadow-xs border border-slate-200/60 font-black'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <UserPlus className={`w-4 h-4 ${mode === 'register' ? 'text-emerald-700' : 'text-slate-400'}`} />
              <span>Pendaftaran Akun Baru</span>
            </button>
          </div>

          <div className="p-5 sm:p-7">
            
            {/* ========================================================================= */}
            {/* 1. TAB LOGIN KODE                                                         */}
            {/* ========================================================================= */}
            {mode === 'login' && (
              <form onSubmit={handleLogin} className="space-y-4">
                
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Kode Akses / Nomor Pendaftaran
                    </label>
                    <span className="text-[11px] text-slate-400 hidden sm:inline">
                      Murid / Guru / Admin
                    </span>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-700">
                      <KeyRound className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={loginKode}
                      onChange={(e) => {
                        setLoginKode(e.target.value);
                        setLoginError(null);
                      }}
                      placeholder="CONTOH: PD-2027-001"
                      className="w-full pl-10 pr-20 py-3.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono font-bold text-sm tracking-widest placeholder:tracking-normal placeholder:font-sans placeholder:font-normal focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition uppercase shadow-2xs"
                      autoFocus
                      required
                    />
                    <button
                      type="button"
                      onClick={handlePasteCode}
                      className="absolute inset-y-1.5 right-1.5 px-2.5 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                      title="Tempel dari Clipboard"
                    >
                      <ClipboardPaste className="w-3.5 h-3.5 text-slate-500" />
                      <span className="hidden sm:inline">Tempel</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
                    Masukkan kode pendaftaran yang diperoleh saat mendaftar, atau kode tugas khusus penguji/admin.
                  </p>
                </div>

                {/* Pesan Kesalahan Login */}
                {loginError && (
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-in fade-in">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600 mt-0.5" />
                    <div className="flex-1">
                      <div className="font-bold">Kode Tidak Valid</div>
                      <div className="mt-0.5">{loginError}</div>
                    </div>
                  </div>
                )}

                {/* Tombol Submit Login */}
                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full h-12 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white font-bold text-sm shadow-md shadow-emerald-900/20 transition cursor-pointer disabled:opacity-60"
                >
                  <LogIn className="w-4 h-4 text-amber-300" />
                  <span>{isLoggingIn ? 'Memverifikasi Kode Akses...' : 'Masuk ke Portal SPMB'}</span>
                  {!isLoggingIn && <ArrowRight className="w-4 h-4 opacity-80" />}
                </button>

                {/* Footer Link Login */}
                <div className="pt-3 border-t border-slate-100 text-center space-y-2">
                  <p className="text-xs text-slate-600">
                    Belum memiliki akun calon murid?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setMode('register');
                        setLoginError(null);
                      }}
                      className="font-bold text-emerald-700 hover:text-emerald-900 hover:underline cursor-pointer"
                    >
                      Daftar Akun Baru
                    </button>
                  </p>
                </div>

              </form>
            )}

            {/* ========================================================================= */}
            {/* 2. TAB DAFTAR AKUN BARU                                                   */}
            {/* ========================================================================= */}
            {mode === 'register' && (
              <form onSubmit={handleRegister} className="space-y-4">
                
                {/* Panduan Ringkas */}
                <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/70 flex items-start gap-2.5 text-xs text-emerald-950 leading-relaxed">
                  <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Registrasi Cepat SPMB:</span> Lengkapi 5 data di bawah. Sistem akan secara otomatis menerbitkan <span className="font-bold">Kode Pendaftaran Unik</span> untuk akses ke biodata, berkas, dan kartu ujian.
                  </div>
                </div>

                <div className="space-y-3.5">
                  {/* 1. Nama Lengkap Murid */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Nama Lengkap Calon Murid <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <GraduationCap className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={regForm.namaSiswa}
                        onChange={(e) => setRegForm({ ...regForm, namaSiswa: e.target.value })}
                        placeholder="Contoh: Muhammad Fathan Pratama"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs sm:text-sm font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition shadow-2xs"
                        required
                      />
                    </div>
                  </div>

                  {/* 2. Asal Sekolah SD/MI & Nama Orang Tua (2 Kolom di Layar Lebar) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        Asal Sekolah (SD / MI) <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <School className="w-4 h-4" />
                        </div>
                        <input
                          type="text"
                          value={regForm.sekolahAsal}
                          onChange={(e) => setRegForm({ ...regForm, sekolahAsal: e.target.value })}
                          placeholder="Contoh: SDIT Pondok Duta"
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs sm:text-sm font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition shadow-2xs"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        Nama Orang Tua / Wali <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <User className="w-4 h-4" />
                        </div>
                        <input
                          type="text"
                          value={regForm.namaOrangTua}
                          onChange={(e) => setRegForm({ ...regForm, namaOrangTua: e.target.value })}
                          placeholder="Ayah / Bunda / Wali"
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs sm:text-sm font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition shadow-2xs"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* 3. Kontak: No. WA dan Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-slate-800">
                          No. WhatsApp Orang Tua <span className="text-rose-500">*</span>
                        </label>
                      </div>
                      <div className="flex items-stretch rounded-xl border border-slate-300 bg-slate-50 focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-600/20 focus-within:border-emerald-600 transition shadow-2xs overflow-hidden">
                        <div className="flex items-center pl-2.5 pr-1 bg-slate-100 hover:bg-slate-200/70 border-r border-slate-300 shrink-0">
                          <img
                            src={`https://flagcdn.com/w40/${activeCountryInfo.iso.toLowerCase()}.png`}
                            alt={activeCountryInfo.iso}
                            className="w-4 h-3 object-cover rounded-[2px] border border-slate-300/80 mr-1 shrink-0"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).style.display = 'none';
                            }}
                          />
                          <select
                            aria-label="Pilih Kode Negara WhatsApp"
                            value={selectedCountryCode}
                            onChange={(e) => {
                              const newCode = e.target.value;
                              setSelectedCountryCode(newCode);
                              if (regForm.nomorHp) {
                                setRegForm(prev => ({
                                  ...prev,
                                  nomorHp: stripLeadingZeroPhone(prev.nomorHp, newCode)
                                }));
                              }
                            }}
                            className="py-2.5 bg-transparent text-slate-900 font-extrabold text-xs focus:outline-none cursor-pointer"
                            title={`${activeCountryInfo.iso} +${selectedCountryCode}`}
                          >
                            {COUNTRY_CODES.map((c) => (
                              <option key={c.code} value={c.code}>
                                {c.iso} +{c.code}
                              </option>
                            ))}
                          </select>
                        </div>
                        <input
                          type="tel"
                          inputMode="numeric"
                          value={regForm.nomorHp}
                          onChange={(e) => handlePhoneInputChange(e.target.value)}
                          onBlur={handlePhoneInputBlur}
                          placeholder={`Contoh: ${activeCountryInfo.placeholder}`}
                          className="w-full px-3 py-2.5 bg-transparent text-slate-900 font-mono text-xs sm:text-sm font-bold focus:outline-none min-w-0"
                          required
                        />
                      </div>
                      <p className="text-[10px] text-emerald-800 font-medium mt-1 leading-tight">
                        {fullInternationalPhone && cleanedPreviewDigits.length >= 6 ? (
                          <span>✓ Database: <strong className="font-mono">{fullInternationalPhone}</strong> ({activeCountryInfo.iso} +{selectedCountryCode})</span>
                        ) : (
                          <span className="text-slate-500">Angka <strong>0</strong> di awal otomatis disesuaikan ke kode <strong>+{selectedCountryCode}</strong> saat pindah kolom / daftar</span>
                        )}
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
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
                          placeholder="email.ortu@gmail.com"
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs sm:text-sm font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition shadow-2xs"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Error Banner Registrasi */}
                {regError && (
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 animate-in fade-in">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                    <span>{regError}</span>
                  </div>
                )}

                {/* Tombol Submit Registrasi */}
                <button
                  type="submit"
                  disabled={isRegistering}
                  className="w-full h-12 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white font-bold text-sm shadow-md shadow-emerald-900/20 transition cursor-pointer disabled:opacity-60 mt-1"
                >
                  <UserPlus className="w-4 h-4 text-amber-300" />
                  <span>{isRegistering ? 'Memproses Pendaftaran Akun...' : 'Daftar & Terbitkan Kode Akses'}</span>
                  {!isRegistering && <ArrowRight className="w-4 h-4 opacity-80" />}
                </button>

                {/* Footer Switch ke Login */}
                <div className="pt-3 border-t border-slate-100 text-center">
                  <p className="text-xs text-slate-600">
                    Sudah memiliki kode pendaftaran sebelumnya?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setMode('login');
                        setRegError(null);
                      }}
                      className="font-bold text-emerald-700 hover:text-emerald-900 hover:underline cursor-pointer"
                    >
                      Login dengan Kode
                    </button>
                  </p>
                </div>

              </form>
            )}

          </div>

          {/* Bottom Bar Keamanan & Bantuan */}
          <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              <span>Koneksi Aman &amp; Terverifikasi Langsung</span>
            </div>
            <a
              href="https://wa.me/6282225002011?text=Assalamu%27alaikum%20Panitia%20SPMB%20SMPIT%20Pondok%20Duta%2C%20saya%20butuh%20bantuan%20terkait%20login%2Fpendaftaran%20akun."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-semibold text-emerald-700 hover:text-emerald-900 hover:underline"
            >
              <MessageCircle className="w-3 h-3 text-emerald-600" />
              <span>Bantuan CS: 0822-2500-2011</span>
            </a>
          </div>

        </div>
      )}

    </div>
  );
};
