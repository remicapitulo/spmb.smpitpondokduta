import React from 'react';
import { UserAccount, getAcademicYear } from '../types';
import { PWAInstallButton } from '../components/PWAInstallButton';
import { AnimatedEflayerHero } from '../components/AnimatedEflayerHero';
import { 
  BookOpen, 
  Users, 
  ArrowRight, 
  ShieldCheck, 
  Search, 
  Star,
  LogIn,
  Database,
  Award,
  CheckCircle2,
  Compass,
  Trophy,
  Building2,
  Phone,
  HeartHandshake,
  GraduationCap
} from 'lucide-react';

interface Props {
  onSelectTab: (tab: string) => void;
  onOpenPortalSiswa: () => void;
  onOpenPortalGuru: () => void;
  onOpenGasConfig?: () => void;
  onGoToLogin?: () => void;
  onGoToRegister?: () => void;
  currentUser?: UserAccount | null;
}

export const HomePage: React.FC<Props> = ({ 
  onSelectTab, 
  onOpenPortalSiswa, 
  onOpenPortalGuru,
  onOpenGasConfig,
  onGoToLogin,
  onGoToRegister,
  currentUser
}) => {
  const tahunPelajaran = getAcademicYear();

  const jaminanKualitas = [
    'Memiliki aqidah dan akhlak yang mulia.',
    'Mampu membaca, menghafal, dan memahami Al-Qur\'an.',
    'Mampu melaksanakan ibadah yang sesuai dengan ahlus sunnah wal jama\'ah.',
    'Berwawasan luas dalam bidang akademik dan teknologi.',
    'Memiliki konsep diri dan Social Knowledge.',
    'Memiliki pribadi yang disiplin, mandiri, dan ceria.',
    'Mampu mengekspresikan minat dan bakat.',
  ];

  const prestasiList = [
    'Juara 1 O2SN tingkat Kota Depok Cabang Olahraga Renang 2026 dan lanjut ke tingkat Provinsi mewakili Kota Depok',
    'Juara 1 lomba Renang Gaya Dada KU II 25M (14-15 Tahun) Putra series II Piala Kemenpora RI pada 07-08 Februari 2026',
    'Juara 2 Tanding Pra Remaja Putra kelas D Pencak Silat tingkat Nasional 2026',
    'Juara 2 Lomba Panahan kategori Bantalan barebow SMP putra pada kejuaraan Cakra Buana Championship tahun 2026',
    'Juara 1 lomba renang kategori 25 M Gaya Bebas Fins Putri SMP 7, 8, 9 tahun 2026',
    'Lolos OSN 2026 Mapel IPA tingkat SMP se-Kota Depok dan melanjutkan ke tingkat Provinsi mewakili Kota Depok',
    'Juara 3 O2SN tingkat Provinsi Jawa Barat Cabang Olahraga Renang 2026',
  ];

  const fasilitasList = [
    'Ruang Kelas Dilengkapi CCTV dan AC',
    'Ruang Kelas Wi-Fi',
    'Blended Learning: Sistem Pembelajaran Terintegrasi Online dan Offline',
    'Lapangan Multifungsi',
    'Lab. Komputer & Multimedia',
    'Lab. IPA',
    'Perpustakaan',
    'UKS',
    'Kantin',
    'Aula',
    'Ruang Konseling',
  ];

  const ekskulWajib = [
    'Pramuka (Wajib)',
    'Bioteknologi (Wajib)',
    'Public Speaking (Wajib)',
  ];

  const ekskulPilihan = [
    'Futsal',
    'Basket',
    'Taekwondo',
    'Desain Grafis',
    'Menari',
    'Pencak Silat',
    'Panahan',
  ];

  return (
    <div className="space-y-16 sm:space-y-20">
      
      {/* 1. HERO SECTION DENGAN ANIMASI POTONGAN FOTO ASLI E-FLYER */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-950 text-white shadow-2xl p-6 sm:p-10 lg:p-14 border border-emerald-700/40">
        {/* Background Motif */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fef08a_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          
          {/* Kolom Kiri: Teks Utama & CTA */}
          <div className="lg:col-span-7 space-y-5">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-amber-300">
              <span>YAYASAN PERGURUAN ISLAM PONDOK DUTA (YPIPD)</span>
            </div>

            <div className="space-y-2">
              <div className="text-xs sm:text-sm font-bold uppercase tracking-wider text-emerald-200">
                Penerimaan Siswa Baru (SPMB) Tahun Pelajaran {tahunPelajaran}
              </div>
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight text-white">
                SMPIT Pondok Duta <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-200 to-emerald-200 text-2xl sm:text-4xl">
                  "Solution For Your Children's Future"
                </span>
              </h1>
            </div>

            <p className="text-sm sm:text-base text-emerald-100/95 leading-relaxed font-normal max-w-2xl">
              Berdiri sejak <strong>tahun 2011</strong> di bawah naungan <strong>YPIPD yang telah berdiri sejak 18 April 1990</strong>. Membentuk siswa yang <strong>berakhlak mulia, kreatif, mandiri, berprestasi, dan berwawasan global</strong> melalui Pembelajaran Al-Qur'an <strong>Metode UMMI</strong>, <em>Blended Learning</em>, serta perpaduan Kurikulum Merdeka, Kurikulum JSIT, dan Kurikulum Kekhasan SIT Pondok Duta.
            </p>

            {/* Action CTAs */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              {currentUser ? (
                currentUser.role === 'admin' ? (
                  <>
                    <button
                      onClick={onOpenPortalSiswa}
                      className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-950/40 transition-all cursor-pointer"
                    >
                      <Users className="w-4 h-4" />
                      <span>Portal Siswa</span>
                    </button>
                    <button
                      onClick={onOpenPortalGuru}
                      className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm shadow-lg shadow-purple-950/40 transition-all cursor-pointer"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Menu Pewawancara</span>
                    </button>
                    {onOpenGasConfig && (
                      <button
                        onClick={onOpenGasConfig}
                        className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs sm:text-sm shadow-lg shadow-amber-950/40 transition-all cursor-pointer"
                      >
                        <Database className="w-4 h-4" />
                        <span>GAS API (Admin)</span>
                      </button>
                    )}
                  </>
                ) : currentUser.role === 'guru' ? (
                  <button
                    onClick={onOpenPortalGuru}
                    className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-sm shadow-lg shadow-purple-950/40 transition-all cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Buka Menu Pewawancara</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={onOpenPortalSiswa}
                    className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-sm shadow-lg shadow-emerald-950/40 transition-all cursor-pointer"
                  >
                    <Users className="w-4 h-4" />
                    <span>Portal Siswa</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )
              ) : (
                <>
                  <button
                    onClick={onGoToRegister}
                    className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-sm shadow-lg shadow-emerald-950/40 transition-all cursor-pointer"
                  >
                    <span>Daftar Akun Baru</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={onGoToLogin}
                    className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm backdrop-blur-md border border-white/20 transition cursor-pointer"
                  >
                    <LogIn className="w-4 h-4 text-amber-300" />
                    <span>Login dengan Kode</span>
                  </button>
                </>
              )}

              <button
                onClick={() => onSelectTab('cek-kelulusan')}
                className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-emerald-950/40 hover:bg-emerald-950/60 text-emerald-100 font-semibold text-sm backdrop-blur-md border border-emerald-500/30 transition cursor-pointer"
              >
                <Search className="w-4 h-4 text-amber-300" />
                <span>Cek Kelulusan</span>
              </button>

              <PWAInstallButton variant="hero" />
            </div>

            {/* Info Ringkas Akreditasi & Lokasi Sesuai Brosur */}
            <div className="pt-5 border-t border-emerald-700/50 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-emerald-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-300 shrink-0" />
                <span>Terakreditasi <strong>"A"</strong> (BAN-SM) · <em>Blended Learning</em></span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-300 shrink-0" />
                <span>Pembelajaran Al-Qur'an <strong>Metode UMMI</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-300 shrink-0" />
                <span>CS SMPIT: <strong>0822-2500-2011</strong> / (021) 29378301</span>
              </div>
            </div>
          </div>

          {/* Kolom Kanan: Gambar Animasi Potongan Foto Asli dari E-Flyer */}
          <div className="lg:col-span-5">
            <AnimatedEflayerHero />
          </div>

        </div>
      </section>

      {/* 2. SELAYANG PANDANG, VISI & MISI (SESUAI BROSUR 2) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Selayang Pandang */}
        <div className="lg:col-span-6 p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-5">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-emerald-700">
              <Building2 className="w-4 h-4" />
              <span>Selayang Pandang</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              SMPIT Pondok Duta
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              <strong>SMPIT Pondok Duta</strong> berdiri sejak <strong>tahun 2011</strong> di bawah naungan <strong>YPIPD yang telah berdiri sejak 18 April 1990</strong>, beralamatkan di <strong>Jalan Duta Plaza No.1 RT.10 RW.14, Kelurahan Tugu, Kecamatan Cimanggis, Kota Depok</strong>. Memiliki sarana dan prasarana yang lengkap untuk menunjang kegiatan belajar mengajar yang aman dan nyaman.
            </p>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Dengan mengusung slogan <strong>"Solution For Your Children's Future"</strong>, SMPIT Pondok Duta memberikan layanan pendidikan terbaik dengan jajaran tenaga pendidik profesional, berpendidikan <strong>S1 dan S2 dari perguruan tinggi negeri dan swasta ternama di Indonesia</strong>, dan didampingi dengan penggunaan <strong>Kurikulum JSIT, Kurikulum Merdeka, dan Kurikulum Kekhasan SIT Pondok Duta</strong>.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
            <div className="flex items-center gap-1.5 font-semibold text-emerald-800">
              <GraduationCap className="w-4 h-4 text-emerald-600" />
              <span>Pendidik Profesional S1 & S2 PTN/PTS Ternama</span>
            </div>
            <span className="font-mono text-[11px] text-slate-400">SMPIT Sejak 2011 · YPIPD 18 April 1990</span>
          </div>
        </div>

        {/* Visi & Misi */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          {/* Visi */}
          <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-emerald-800 to-teal-900 text-white shadow-md space-y-2.5">
            <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-amber-300">
              <Compass className="w-4 h-4" />
              <span>Visi Sekolah</span>
            </div>
            <p className="text-base sm:text-lg font-extrabold leading-snug text-white">
              "Terbentuknya siswa yang berakhlak mulia, kreatif, mandiri, berprestasi dan berwawasan global."
            </p>
          </div>

          {/* Misi */}
          <div className="flex-1 p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-2.5">
            <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-emerald-700">
              <HeartHandshake className="w-4 h-4" />
              <span>Misi Sekolah</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              SMPIT Pondok Duta membentuk siswa yang berakhlak mulia, kreatif, mandiri, berprestasi dan berwawasan global. Sekolah kami juga menanamkan keyakinan akidah Islam, membiasakan perilaku yang berakhlak mulia, kepada Allah, diri sendiri, orang tua, guru, kepada manusia dan lingkungannya, sesuai dengan contoh yang dituntunkan oleh Rosulullah SAW, serta membentuk rasa cinta kepada bangsa tanah air Indonesia.
            </p>
          </div>
        </div>
      </section>

      {/* 3. JAMINAN KUALITAS & PROGRAM UNGGULAN (SESUAI BROSUR 2) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* 7 Jaminan Kualitas */}
        <div className="lg:col-span-6 p-6 sm:p-8 rounded-3xl bg-slate-900 text-white shadow-xl space-y-5">
          <div className="space-y-1">
            <div className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Standar Mutu Lulusan
            </div>
            <h2 className="text-2xl font-extrabold text-white">
              7 Jaminan Kualitas SMPIT Pondok Duta
            </h2>
          </div>

          <ol className="space-y-3">
            {jaminanKualitas.map((item, idx) => (
              <li
                key={idx}
                className="flex items-start gap-3 p-3 rounded-2xl bg-slate-800/90 border border-slate-700/80 text-xs sm:text-sm text-slate-100"
              >
                <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span className="leading-relaxed font-medium">{item}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Program Unggulan */}
        <div className="lg:col-span-6 p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-6">
          <div className="space-y-5">
            <div className="space-y-1">
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                Kurikulum Kekhasan SIT Pondok Duta
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900">
                Program Unggulan
              </h2>
            </div>

            <div className="space-y-4">
              {/* 1.1 Personal Islamic Character Building */}
              <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-extrabold text-xs shrink-0">
                    1.1
                  </div>
                  <h3 className="text-sm sm:text-base font-extrabold text-emerald-950">
                    Personal Islamic Character Building
                  </h3>
                </div>
                <ul className="space-y-2 pl-1 text-xs sm:text-sm text-slate-700 font-medium">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span><strong>Metode UMMI</strong> dalam pembelajaran Al-Qur'an</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span><strong>Everyday with Qur'an</strong> (Pembiasaan interaksi harian bersama Al-Qur'an)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span><strong>Bina Karakter</strong> (Adab Islami & Akhlakul Karimah)</span>
                  </li>
                </ul>
              </div>

              {/* 1.2 Personal Skills */}
              <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center font-extrabold text-xs shrink-0">
                    1.2
                  </div>
                  <h3 className="text-sm sm:text-base font-extrabold text-amber-950">
                    Personal Skills
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs sm:text-sm text-slate-700 font-medium">
                  <div className="flex items-center gap-2 bg-white/80 p-2.5 rounded-xl border border-amber-200/60">
                    <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                    <span><strong>Lifeskills</strong> (Gardening & Kemandirian)</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/80 p-2.5 rounded-xl border border-amber-200/60">
                    <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                    <span><strong>Duta Camp</strong> (Kepemimpinan & Kepanduan)</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/80 p-2.5 rounded-xl border border-amber-200/60">
                    <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                    <span><strong>Field Trip</strong> (Pembelajaran Kontekstual)</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/80 p-2.5 rounded-xl border border-amber-200/60">
                    <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                    <span><strong>Gerakan Literasi Sekolah</strong></span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 text-xs text-slate-600 flex items-center justify-between gap-3">
            <span>Ingin mengetahui syarat berkas pendaftaran secara lengkap?</span>
            <button
              onClick={() => onSelectTab('syarat')}
              className="font-bold text-emerald-700 hover:text-emerald-800 whitespace-nowrap flex items-center gap-1 cursor-pointer"
            >
              <span>Lihat Syarat</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </section>

      {/* 4. FASILITAS SEKOLAH & EKSTRAKURIKULER (SESUAI BROSUR 1) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Fasilitas Sekolah */}
        <div className="lg:col-span-7 p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-5">
          <div className="space-y-1">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Sarana & Prasarana Lengkap
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900">
              Fasilitas SMPIT Pondok Duta
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {fasilitasList.map((fasilitas, i) => (
              <div
                key={i}
                className={`p-3.5 rounded-2xl border flex items-start gap-2.5 text-xs sm:text-sm font-semibold ${
                  i === 2
                    ? 'sm:col-span-2 bg-emerald-50/70 border-emerald-200 text-emerald-950'
                    : 'bg-slate-50/70 border-slate-200/70 text-slate-800'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{fasilitas}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Ekstrakurikuler */}
        <div className="lg:col-span-5 p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-5">
          <div className="space-y-1">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Pengembangan Minat & Bakat
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900">
              Ekstrakurikuler
            </h2>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="text-xs font-extrabold uppercase tracking-wider text-amber-700">
                Ekstrakurikuler Wajib
              </div>
              <div className="space-y-2">
                {ekskulWajib.map((item, i) => (
                  <div
                    key={i}
                    className="px-3.5 py-2.5 rounded-xl bg-amber-50 border border-amber-200/80 text-xs sm:text-sm font-bold text-amber-950 flex items-center justify-between"
                  >
                    <span>{item}</span>
                    <Award className="w-4 h-4 text-amber-600 shrink-0" />
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="text-xs font-extrabold uppercase tracking-wider text-emerald-700">
                Ekstrakurikuler Pilihan
              </div>
              <div className="grid grid-cols-2 gap-2">
                {ekskulPilihan.map((item, i) => (
                  <div
                    key={i}
                    className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200/80 text-xs font-semibold text-slate-800 flex items-center gap-2"
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </section>

      {/* 5. PRESTASI SISWA (SESUAI BROSUR 2) */}
      <section className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 text-white shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-300">
              <Trophy className="w-4 h-4" />
              <span>Rekam Jejak Kejuaraan Siswa 2026</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Prestasi Membanggakan Siswa SMPIT Pondok Duta
            </h2>
          </div>
          <div className="text-xs text-emerald-200 font-medium">
            Tingkat Kota Depok, Provinsi Jawa Barat & Tingkat Nasional
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {prestasiList.map((prestasi, index) => (
            <div
              key={index}
              className="p-4 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/15 flex items-start gap-3.5 hover:bg-white/15 transition"
            >
              <div className="w-9 h-9 rounded-xl bg-amber-400/20 border border-amber-300/40 text-amber-300 flex items-center justify-center font-extrabold text-xs shrink-0 mt-0.5">
                <Trophy className="w-4 h-4" />
              </div>
              <p className="text-xs sm:text-sm text-white/95 leading-relaxed font-medium">
                {prestasi}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 6. ALUR PENDAFTARAN RESMI */}
      <section className="p-6 sm:p-10 rounded-3xl bg-slate-900 text-white shadow-xl space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
              Alur Pendaftaran Siswa Baru {tahunPelajaran}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              Tahapan Seleksi SMPIT Pondok Duta
            </h2>
          </div>
          <button
            onClick={() => onSelectTab('alur')}
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 self-start md:self-auto cursor-pointer"
          >
            <span>Lihat Detail Alur & Kontak CS</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700 space-y-2">
            <div className="text-[11px] font-extrabold text-amber-400 uppercase">1. PENDAFTARAN</div>
            <h4 className="font-bold text-sm text-white">Online (WA/PWA) & Offline</h4>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Pendaftaran online via CS WA SMPIT (<strong>0822-2500-2011</strong>) / Portal PWA, atau offline di ruang pendaftaran serta mengembalikan formulir.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700 space-y-2">
            <div className="text-[11px] font-extrabold text-amber-400 uppercase">2. TES KEMATANGAN SISWA</div>
            <h4 className="font-bold text-sm text-white">Observasi, TKS & Wawancara</h4>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Wawancara Orang Tua Murid (OTM), Wawancara Siswa & Tes Agama (SMP), serta Test Potensi Akademik (SMP).
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700 space-y-2">
            <div className="text-[11px] font-extrabold text-amber-400 uppercase">3. PENGUMUMAN HASIL TES</div>
            <h4 className="font-bold text-sm text-white">Ruang TU & Portal Online</h4>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Hasil Tes dapat diambil di Ruang Tata Usaha SMPIT Pondok Duta atau dicek secara online melalui menu Cek Kelulusan.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700 space-y-2">
            <div className="text-[11px] font-extrabold text-amber-400 uppercase">4. DAFTAR ULANG</div>
            <h4 className="font-bold text-sm text-white">Administrasi Keuangan</h4>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Melakukan pembayaran Administrasi Keuangan sesuai dengan jadwal dan biaya pendaftaran SPMB yang tertera.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-950/90 border border-emerald-700/70 space-y-2">
            <div className="text-[11px] font-extrabold text-emerald-300 uppercase">5. SERAGAM & MPLS</div>
            <h4 className="font-bold text-sm text-white">Pengukuran Seragam & MPLS</h4>
            <p className="text-[11px] text-emerald-100/90 leading-relaxed">
              Menunggu konfirmasi jadwal pengukuran seragam dari sekolah dilanjutkan <strong>Masa Pengenalan Lingkungan Sekolah (MPLS)</strong>.
            </p>
          </div>
        </div>
      </section>

      {/* 7. APA KATA MEREKA / TESTIMONI ALUMNI (SESUAI BROSUR 1) */}
      <section className="p-6 sm:p-10 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-amber-600">
              Apa Kata Mereka yang Pernah Bersekolah di SMPIT Pondok Duta?
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
              Testimoni Alumni SMPIT Pondok Duta
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Lulusan SMPIT Pondok Duta dibekali fondasi akidah, akhlak mulia, hafalan Al-Qur'an, serta kesiapan akademik untuk melanjutkan ke SMA/SMK Negeri maupun sekolah unggulan.
            </p>
          </div>

          <div className="lg:col-span-7 p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-emerald-50/80 via-white to-amber-50/40 border border-emerald-200/80 space-y-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-800 text-amber-300 flex items-center justify-center font-extrabold text-base shrink-0 shadow-xs">
                  RP
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                    Rakha Putra Wardana
                  </h3>
                  <div className="text-xs font-bold text-emerald-700">
                    Alumni Angkatan 13 · Diterima di SMAN 1 Depok
                  </div>
                </div>
              </div>
              <div className="flex text-amber-400 gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
            </div>

            <blockquote className="text-xs sm:text-sm text-slate-700 italic leading-relaxed">
              "Selama tiga tahun belajar di SMPIT Pondok Duta, saya tidak hanya mendapatkan ilmu akademik, tetapi saya juga banyak belajar hal baru. Para guru selalu siap sedia membantu siswa saat mengalami kesulitan. Juga fasilitas yang ada sangat memadai untuk mendukung aktivitas belajar siswa, sehingga terbentuk lingkungan sekolah yang ramah, aman, dan nyaman."
            </blockquote>
          </div>
        </div>
      </section>

    </div>
  );
};
