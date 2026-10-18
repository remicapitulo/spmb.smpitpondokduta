import React, { useState, useEffect } from 'react';
import { gasService } from '../../services/gasService';
import { 
  DataSiswa, 
  WawancaraSiswaData, 
  FormWawancaraOrtuPDF, 
  HasilObservasiOrtuData,
  UserAccount,
  getAcademicYear
} from '../../types';
import { KartuUjianPrintView } from './KartuUjianPrintView';
import { HasilWawancaraOrtuPrintView } from './HasilWawancaraOrtuPrintView';
import { FormBiodataSiswaLengkap } from './FormBiodataSiswaLengkap';
import { 
  Users, 
  FileText, 
  CheckCircle2, 
  Printer, 
  Save, 
  Plus, 
  BookOpen, 
  HeartHandshake, 
  ShieldAlert,
  Smartphone,
  PenTool,
  KeyRound,
  LogOut,
  Download,
  QrCode
} from 'lucide-react';
import QRCode from 'qrcode';

interface Props {
  onOpenGasConfig: () => void;
  currentUser?: UserAccount | null;
  onLogout?: () => void;
  onGoToLogin?: () => void;
}

export const SiswaDashboard: React.FC<Props> = ({ 
  onOpenGasConfig,
  currentUser,
  onLogout,
  onGoToLogin
}) => {
  const [activeTab, setActiveTab] = useState<'biodata' | 'wawancara-siswa' | 'wawancara-ortu' | 'kartu'>('biodata');
  const [students, setStudents] = useState<any[]>([]);
  const [selectedNoPendaftaran, setSelectedNoPendaftaran] = useState<string>(
    currentUser?.role === 'siswa' && currentUser?.kodePendaftaran ? currentUser.kodePendaftaran : ''
  );
  const [draftWawancaraOrtu, setDraftWawancaraOrtu] = useState<HasilObservasiOrtuData | null>(null);
  const [reviewDraftOrtuModal, setReviewDraftOrtuModal] = useState<HasilObservasiOrtuData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [cardQrDataUrl, setCardQrDataUrl] = useState<string>('');
  const [schoolLogoUrl, setSchoolLogoUrl] = useState<string>(() => gasService.getAppSettings().logoUrl || '');

  // Form states
  const [biodataForm, setBiodataForm] = useState<Partial<DataSiswa>>({});
  const [wawancaraSiswaForm, setWawancaraSiswaForm] = useState<Partial<WawancaraSiswaData>>({});
  const [formOrtu34, setFormOrtu34] = useState<Partial<FormWawancaraOrtuPDF>>({});

  // Isian tambahan 'Yang Lain'
  const [customYangLainQ6, setCustomYangLainQ6] = useState<string>('');
  const [customYangLainQ8, setCustomYangLainQ8] = useState<string>('');
  const [customYangLainQ9, setCustomYangLainQ9] = useState<string>('');
  const [customYangLainQ31, setCustomYangLainQ31] = useState<string>('');

  useEffect(() => {
    if (biodataForm.noPendaftaran) {
      const hostOrigin = typeof window !== 'undefined' && window.location ? window.location.origin : '';
      const verificationUrl = `${hostOrigin}/?tab=cek-kelulusan&no=${encodeURIComponent(biodataForm.noPendaftaran || '')}&nisn=${encodeURIComponent(biodataForm.nisn || '')}`;

      QRCode.toDataURL(verificationUrl, {
        width: 400,
        margin: 2,
        color: { dark: '#000000', light: '#ffffff' },
        errorCorrectionLevel: 'M'
      })
        .then((url) => setCardQrDataUrl(url))
        .catch(() => {});
    }
  }, [biodataForm.noPendaftaran, biodataForm.namaLengkap, biodataForm.nisn]);

  useEffect(() => {
    if (currentUser?.role === 'siswa' && currentUser?.kodePendaftaran) {
      setSelectedNoPendaftaran(currentUser.kodePendaftaran);
      loadData(currentUser.kodePendaftaran);
    } else {
      loadData();
    }
  }, [currentUser]);

  const loadData = async (targetNoPend?: string) => {
    setLoading(true);
    const list = await gasService.getStudentList();
    setStudents(list);

    const noPend =
      targetNoPend ||
      (currentUser?.role === 'siswa' && currentUser?.kodePendaftaran ? currentUser.kodePendaftaran : '') ||
      selectedNoPendaftaran ||
      (list[0] ? list[0].id : '');
    setSelectedNoPendaftaran(noPend);

    if (!noPend) {
      setBiodataForm({});
      setWawancaraSiswaForm({});
      setFormOrtu34({});
      setDraftWawancaraOrtu(null);
      setLoading(false);
      return;
    }

    const detail = await gasService.getSiswaDetail(noPend);
    const draft = gasService.getHasilWawancaraOrtu(noPend);
    setDraftWawancaraOrtu(draft);
    if (detail) {
      setBiodataForm(detail.siswa);
      setWawancaraSiswaForm((detail.wawancaraSiswa || {
        noPendaftaran: noPend,
        namaLengkap: detail.siswa.namaLengkap,
        kebiasaanSholat: undefined,
        kemampuanMembacaQuran: undefined,
        jumlahJuzHafalan: undefined,
        suratFavorit: '',
        motivasiMasukSMPIT: '',
        minatBakat: [],
        citaCita: '',
        kegiatanWaktuLuang: ''
      }) as Partial<WawancaraSiswaData>);

      // Load 34 questions raw data directly from Database Sheet OTM
      const rawMap = detail.otmRaw || {};
      
      // Extract custom 'Yang Lain' if existing
      const q6Arr = rawMap[15] ? rawMap[15].split(', ').filter(Boolean) : [];
      const q6Other = q6Arr.find((x: string) => !['Ayah', 'Bunda', 'Guru Privat'].includes(x));
      if (q6Other) {
        setCustomYangLainQ6(q6Other.replace(/^Yang\s*lain(:\s*)?/i, ''));
      } else {
        setCustomYangLainQ6('');
      }

      const q8Arr = rawMap[17] ? rawMap[17].split(', ').filter(Boolean) : [];
      const q8Other = q8Arr.find((x: string) => !['Ayah', 'Bunda', 'Keluarga lain (kakek/nenek/tante/paman)', 'Asisten Rumah Tangga'].includes(x));
      if (q8Other) {
        setCustomYangLainQ8(q8Other.replace(/^Yang\s*lain(:\s*)?/i, ''));
      } else {
        setCustomYangLainQ8('');
      }

      const q9Arr = rawMap[18] ? rawMap[18].split(', ').filter(Boolean) : [];
      const q9Other = q9Arr.find((x: string) => !['Kursus/les di luar rumah', 'Pendidikan Al-Qur\'an', 'Privat di rumah'].includes(x));
      if (q9Other) {
        setCustomYangLainQ9(q9Other.replace(/^Yang\s*lain(:\s*)?/i, ''));
      } else {
        setCustomYangLainQ9('');
      }

      const q31Raw = rawMap[40] || '';
      if (q31Raw && !['Sepeda', 'Motor', 'Mobil'].includes(q31Raw)) {
        setCustomYangLainQ31(q31Raw.replace(/^Yang\s*lain(:\s*)?/i, ''));
      } else {
        setCustomYangLainQ31('');
      }

      setFormOrtu34({
        noPendaftaran: noPend,
        namaSiswa: detail.siswa.namaLengkap,
        namaPanggilan: detail.siswa.namaPanggilan || (detail.siswa.namaLengkap ? detail.siswa.namaLengkap.split(' ')[0] : ''),
        asalSekolah: detail.siswa.asalSekolah,
        namaAyah: detail.siswa.namaAyah,
        namaIbu: detail.siswa.namaIbu,

        q1_kesiapanBiaya: rawMap[10] || '',
        q2_pekerjaanAyah: rawMap[11] || detail.siswa.pekerjaanAyah || '',
        q3_pekerjaanBunda: rawMap[12] || detail.siswa.pekerjaanIbu || '',
        q4_penghasilanAyah: rawMap[13] || detail.siswa.penghasilanAyah || '',
        q5_penghasilanBunda: rawMap[14] || detail.siswa.penghasilanIbu || '',
        q6_pendampingBelajar: q6Arr,
        q7_sholat5Waktu: rawMap[16] || '',
        q8_pengasuhPulangSekolah: q8Arr,
        q9_kegiatanNonFormal: q9Arr,
        q10_riwayatPenyakit: rawMap[19] || '',
        q11_prestasi: rawMap[20] || detail.siswa.memenangkanKejuaraan || '',
        q12_sifatPositif: rawMap[21] || '',
        q13_sifatNegatif: rawMap[22] || '',
        q14_sikapTerhadapOrtu: rawMap[23] || '',
        q15_pernahMelawanOrtu: rawMap[24] || '',
        q16_halBerkesan: rawMap[25] || '',
        q17_ayahMerokok: (rawMap[26] as any) || 'Tidak',
        q18_bundaMerokok: (rawMap[27] as any) || 'Tidak',
        q19_keluargaLainMerokok: rawMap[28] || 'Tidak ada',
        q20_durasiBersamaAnak: rawMap[29] || '',
        q21_kegiatanBersamaDiRumah: rawMap[30] || '',
        q22_traumaBullying: rawMap[31] || 'Tidak ada',
        q23_anakPernahMerokok: rawMap[32] || 'Tidak pernah',
        q24_pendapatRokokPornografi: rawMap[33] || '',
        q25_fasilitasGadget: rawMap[34] || 'Tidak',
        q26_frekuensiGadget: rawMap[35] || 'Waktu libur',
        q27_bersediaAwasiGadget: rawMap[36] || '',
        q28_installAplikasiBelajarAnak: rawMap[37] || 'Ya',
        q29_installAplikasiPengawasanOrtu: rawMap[38] || 'Ya',
        q30_jarakKeSekolah: rawMap[39] || '0 - 5 km',
        q31_kendaraanSekolah: q31Raw || 'Motor',
        q32_izinBawaMotorSendiri: rawMap[41] || 'Tidak',
        q33_harapanSekolah: rawMap[42] || '',
        q34_ttdMeterai: (rawMap[43] as any) || 'Ya',
        pernyataanSetuju: Boolean(rawMap[44] && rawMap[44].toUpperCase().includes('SETUJU')),
        updatedAt: new Date().toISOString()
      });
    }
    setLoading(false);
  };

  const handleSelectSiswa = async (noPend: string) => {
    setSelectedNoPendaftaran(noPend);
    await loadData(noPend);
  };

  // Checkbox toggle helper
  const handleToggleArray = (field: 'q6_pendampingBelajar' | 'q8_pengasuhPulangSekolah' | 'q9_kegiatanNonFormal', val: string) => {
    const curr = (formOrtu34[field] || []) as string[];
    const next = curr.includes(val) ? curr.filter(x => x !== val) : [...curr, val];
    setFormOrtu34({ ...formOrtu34, [field]: next });
  };

  // Submit Biodata
  const handleSaveBiodata = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await gasService.saveDataSiswa(biodataForm as DataSiswa);
    setSaving(false);
    setSaveSuccessMsg('Biodata murid berhasil disimpan!');
    setTimeout(() => setSaveSuccessMsg(''), 3000);
  };

  // Submit Wawancara Siswa
  const handleSaveWawancaraSiswa = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await gasService.saveWawancaraSiswa({
      ...wawancaraSiswaForm,
      siswaId: biodataForm.id || '',
      noPendaftaran: biodataForm.noPendaftaran || '',
      namaLengkap: biodataForm.namaLengkap || '',
    } as WawancaraSiswaData);
    setSaving(false);
    setSaveSuccessMsg('Formulir Asesmen Mandiri Murid berhasil disimpan!');
    setTimeout(() => setSaveSuccessMsg(''), 3000);
  };

  // Submit 34 Questions Form Ortu
  const handleSaveFormOrtu34 = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await gasService.saveFormIsianOrtu({
      ...formOrtu34,
      noPendaftaran: biodataForm.noPendaftaran || '',
      namaSiswa: biodataForm.namaLengkap || '',
      namaPanggilan: biodataForm.namaPanggilan || '',
      asalSekolah: biodataForm.asalSekolah || '',
      namaAyah: biodataForm.namaAyah || '',
      namaIbu: biodataForm.namaIbu || '',
    } as FormWawancaraOrtuPDF);
    setSaving(false);
    setSaveSuccessMsg('Form Wawancara Orang Tua (34 butir) berhasil disimpan di Sheet OTM!');
    setTimeout(() => setSaveSuccessMsg(''), 3000);
  };

  return (
    <div className="space-y-8">
      
      {/* Top Banner / Student Selector */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/60 text-emerald-200 text-xs font-semibold mb-2 border border-emerald-500/30">
            <Users className="w-3.5 h-3.5" />
            <span>Portal Calon Murid &amp; Orang Tua Murid (OTM)</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white">
            Data Calon Murid &amp; Observasi Orang Tua
          </h1>
          <p className="text-xs text-emerald-100 mt-0.5">
            Lengkapi data calon murid, asesmen mandiri anak, dan observasi orang tua.
          </p>
        </div>

        {currentUser?.role === 'siswa' ? (
          <div className="bg-white/10 backdrop-blur-md p-3.5 sm:p-4 rounded-2xl border border-white/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-[10px] text-emerald-200 uppercase font-bold tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Akun Calon Murid Terverifikasi</span>
              </div>
              <div className="font-extrabold text-sm sm:text-base text-white flex items-center gap-2 mt-0.5">
                <span>{currentUser.namaSiswa}</span>
                <span className="font-mono text-xs px-2 py-0.5 rounded-lg bg-amber-400 text-amber-950 font-black shadow-xs">
                  {currentUser.kodePendaftaran}
                </span>
              </div>
              <div className="text-[11px] text-emerald-200/90 mt-0.5">
                Ortu: {currentUser.namaOrangTua} | {currentUser.sekolahAsal}
              </div>
            </div>
            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="self-start sm:self-auto px-3.5 py-1.5 rounded-xl bg-rose-500/80 hover:bg-rose-600 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Keluar</span>
              </button>
            )}
          </div>
        ) : (
          <div className="w-full md:w-auto bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20 space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <label className="block text-[11px] font-bold text-emerald-200 uppercase tracking-wider">
                Pilih Calon Murid (Mode Admin):
              </label>
              <span className="text-[10px] text-emerald-300 font-mono font-bold">
                {students.length} Murid
              </span>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={selectedNoPendaftaran}
                onChange={(e) => handleSelectSiswa(e.target.value)}
                className="flex-1 min-w-0 bg-emerald-950/90 text-white text-xs font-semibold rounded-xl px-3 py-2 border border-emerald-500/40 focus:outline-none shadow-xs truncate cursor-pointer"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.id} - {s.nama} ({s.panggilan || 'Ananda'})
                  </option>
                ))}
              </select>
              {onLogout && (
                <button
                  type="button"
                  onClick={onLogout}
                  className="px-3 py-2 rounded-xl bg-rose-500/80 hover:bg-rose-600 text-white text-xs font-bold transition flex items-center gap-1 shrink-0 shadow-sm cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Keluar</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Tab Navigation (Responsive 2x2 Grid on Mobile, 4 Cols on Desktop - Zero horizontal scroll) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 bg-white rounded-2xl p-1.5 shadow-xs gap-1.5 border border-slate-200 text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveTab('biodata')}
          className={`py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition cursor-pointer text-center ${
            activeTab === 'biodata'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <FileText className="w-4 h-4 shrink-0" />
          <span className="truncate">1. Data Murid</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('wawancara-siswa')}
          className={`py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition cursor-pointer text-center ${
            activeTab === 'wawancara-siswa'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-4 h-4 shrink-0" />
          <span className="truncate">2. Asesmen Murid</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('wawancara-ortu')}
          className={`py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition cursor-pointer text-center ${
            activeTab === 'wawancara-ortu'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <HeartHandshake className="w-4 h-4 shrink-0" />
          <span className="truncate">3. Observasi Ortu</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('kartu')}
          className={`py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition cursor-pointer text-center ${
            activeTab === 'kartu'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Printer className="w-4 h-4 shrink-0" />
          <span className="truncate">4. Kartu Peserta</span>
        </button>
      </div>

      {/* Save Success Alert Banner */}
      {saveSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* TAB 1: FORMULIR BIODATA SISWA LENGKAP (67 PARAMETER) */}
      {activeTab === 'biodata' && (
        <FormBiodataSiswaLengkap
          formData={biodataForm}
          onChange={(updated) => setBiodataForm(updated)}
          onSave={handleSaveBiodata}
          saving={saving}
        />
      )}

      {/* TAB 2: ASESMEN MANDIRI SISWA */}
      {activeTab === 'wawancara-siswa' && (
        <form onSubmit={handleSaveWawancaraSiswa} className="space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-4 text-xs">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
              Asesmen Mandiri Calon Murid
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kebiasaan Sholat 5 Waktu</label>
                <select
                  value={wawancaraSiswaForm.kebiasaanSholat || 'Selalu Berjamaah di Masjid'}
                  onChange={(e) => setWawancaraSiswaForm({ ...wawancaraSiswaForm, kebiasaanSholat: e.target.value as any })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                >
                  <option value="Selalu Berjamaah di Masjid">Selalu Berjamaah di Masjid</option>
                  <option value="Tepat Waktu Mandiri">Tepat Waktu Mandiri</option>
                  <option value="Kadang Perlu Diingatkan">Kadang Perlu Diingatkan</option>
                  <option value="Sering Terlambat">Sering Terlambat</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Jumlah Juz Hafalan Saat Ini</label>
                <select
                  value={wawancaraSiswaForm.jumlahJuzHafalan || 'Juz 30 (Lengkap)'}
                  onChange={(e) => setWawancaraSiswaForm({ ...wawancaraSiswaForm, jumlahJuzHafalan: e.target.value as any })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                >
                  <option value="> 5 Juz">&gt; 5 Juz</option>
                  <option value="3 - 5 Juz">3 - 5 Juz</option>
                  <option value="Juz 29 - 30 (2 Juz)">Juz 29 - 30 (2 Juz)</option>
                  <option value="Juz 30 (Lengkap)">Juz 30 (Lengkap)</option>
                  <option value="Juz 30 (Sebagian)">Juz 30 (Sebagian)</option>
                  <option value="Belum Ada">Belum Ada</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Motivasi Masuk SMPIT Pondok Duta</label>
              <textarea
                rows={2}
                value={wawancaraSiswaForm.motivasiMasukSMPIT || ''}
                onChange={(e) => setWawancaraSiswaForm({ ...wawancaraSiswaForm, motivasiMasukSMPIT: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Cita-cita Mulia</label>
              <input
                type="text"
                value={wawancaraSiswaForm.citaCita || ''}
                onChange={(e) => setWawancaraSiswaForm({ ...wawancaraSiswaForm, citaCita: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-sm transition"
              >
                <Save className="w-4 h-4 inline-block mr-1" />
                <span>Simpan Asesmen Murid</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* TAB 3: FORMULIR WAWANCARA ORANG TUA (DIKELOMPOKKAN SESUAI FORM PEWAWANCARA) */}
      {activeTab === 'wawancara-ortu' && (
        <div className="space-y-6">

          {/* BANNER NOTIFIKASI REVIEW DRAFT & TANDA TANGAN DI HP ORANG TUA */}
          {draftWawancaraOrtu && (
            <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white shadow-xl space-y-4 border border-emerald-500/30 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-white">
                      Lembar Hasil Wawancara dari Pewawancara Sekolah
                    </h3>
                    <p className="text-xs text-slate-300">
                      Pewawancara: <strong className="text-white">{draftWawancaraOrtu.namaPewawancara}</strong> — Tanggal: {draftWawancaraOrtu.tanggalWawancara}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setReviewDraftOrtuModal(draftWawancaraOrtu)}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg transition active:scale-95 cursor-pointer shrink-0"
                >
                  <PenTool className="w-4 h-4 text-slate-950" />
                  <span>
                    {draftWawancaraOrtu.isTtdOrtuSigned 
                      ? 'Buka & Perbarui Tanda Tangan di HP' 
                      : 'Review Hasil & Tanda Tangan di HP'}
                  </span>
                </button>
              </div>

              {draftWawancaraOrtu.isTtdOrtuSigned ? (
                <div className="pt-3 border-t border-white/10 flex items-center gap-2 text-xs text-emerald-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Tanda tangan Ayah/Bunda telah tersimpan. Pewawancara dapat melihat tanda tangan ini untuk pengesahan akhir.</span>
                </div>
              ) : (
                <p className="text-[11px] text-slate-300/90 pt-2 border-t border-white/10">
                  Pewawancara telah menyelesaikan draft wawancara ananda. Silakan klik tombol kuning di atas untuk membaca ringkasan wawancara dan membubuhkan tanda tangan langsung menggunakan jari di layar HP.
                </p>
              )}
            </div>
          )}

          <form onSubmit={handleSaveFormOrtu34} className="space-y-4 sm:space-y-6">
            <div className="p-3.5 sm:p-8 rounded-2xl sm:rounded-3xl bg-white border border-slate-200/90 shadow-xs sm:shadow-sm space-y-4 sm:space-y-6 text-xs">
              
              <div className="border-b border-slate-200 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
                <div>
                  <span className="text-[10px] sm:text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">
                    Kuesioner Mandiri Orang Tua Murid (OTM)
                  </span>
                  <h3 className="text-sm sm:text-lg font-black text-slate-900 mt-0.5">
                    Formulir Observasi Orang Tua Calon Murid
                  </h3>
                  <p className="text-slate-500 text-[11px] sm:text-xs">
                    Pertanyaan dikelompokkan sesuai rubrik wawancara pewawancara resmi SMPIT Pondok Duta.
                  </p>
                </div>
                <div className="px-3 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold self-start sm:self-auto">
                  No. Registrasi: <strong className="font-mono">{formOrtu34.noPendaftaran || '-'}</strong>
                </div>
              </div>

            {/* SECTIONS CONTAINER */}
            <div className="space-y-4 sm:space-y-6">
              
              {/* ======================================================== */}
              {/* BAGIAN A: KOMITMEN PEMBIAYAAN                            */}
              {/* ======================================================== */}
              <div className="rounded-xl sm:rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-2xs">
                <div className="bg-slate-800 text-white px-3.5 sm:px-5 py-2.5 sm:py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span>
                    <h4 className="text-xs sm:text-sm font-extrabold uppercase tracking-wide">
                      A. KOMITMEN PEMBIAYAAN
                    </h4>
                  </div>
                  <span className="text-[10px] font-bold text-slate-300 bg-white/10 px-2 py-0.5 rounded-md border border-white/15">
                    Butir 1 - 5
                  </span>
                </div>

                <div className="p-3 sm:p-6 space-y-3 sm:space-y-4">
                  {/* 1. Kesiapan Biaya dengan Rincian Bersih (Tanpa Frame di dalam Frame) */}
                  <div className="p-3 sm:p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-2.5">
                    <label className="font-bold text-slate-900 block text-xs sm:text-sm leading-snug">
                      1. Apakah Ayah/Bunda siap membiayai sekolah ananda seperti yang tercantum dalam brosur? *
                    </label>

                    {/* Rincian Komponen Biaya Sekolah Rapi & Bersih */}
                    <div className="p-3 sm:p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80 text-slate-800 space-y-2.5 text-xs">
                      <div className="font-bold text-emerald-950 flex items-center gap-2 text-xs pb-1.5 border-b border-emerald-200/70">
                        <FileText className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                        <span>Rincian Komponen Biaya Sekolah SMPIT Pondok Duta (Sesuai Brosur):</span>
                      </div>

                      <div className="space-y-2 text-[11px]">
                        {/* A. SPP */}
                        <div>
                          <span className="font-bold text-emerald-900 block">
                            A. Uang SPP Bulanan
                          </span>
                          <p className="text-slate-600 mt-0.5">
                            Pembayaran paling lambat <strong>tanggal 10 setiap bulannya</strong>.
                          </p>
                        </div>

                        {/* B. Uang Kegiatan Kelas 7, 8, 9 */}
                        <div className="pt-1.5 border-t border-emerald-200/60">
                          <span className="font-bold text-emerald-900 block">
                            B. Uang Kegiatan Untuk Kelas 7, 8 dan 9 (Setiap Tahun):
                          </span>
                          <p className="text-slate-600 mt-0.5 leading-relaxed">
                            • Uang Buku, Study Tour, Duta Camp / Perkemahan<br />
                            • Kegiatan KBM (Ulangan harian, PTS, UTS 2 semester, PHBI/PHBN, lomba kesiswaan), Uang Komite & OSIS
                          </p>
                        </div>

                        {/* C. Uang Kegiatan Kelas 9 */}
                        <div className="pt-1.5 border-t border-emerald-200/60">
                          <span className="font-bold text-emerald-900 block">
                            C. Uang Kegiatan Khusus Kelas 9:
                          </span>
                          <p className="text-slate-600 mt-0.5 leading-relaxed">
                            Bimbel & Buku Bimbel, Pubertas, Seminar Motivasi, Ujian Sekolah & Praktek, Manasik Haji, Try Out, Haflah Al-Qur'an, Acara & Seragam Perpisahan, Album Kenangan / BTS, Souvenir, Medali & TKA.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Pilihan Komitmen Biaya */}
                    <div className="space-y-1.5 pt-1">
                      <span className="font-semibold text-slate-800 block text-xs">
                        Pilih Bentuk Komitmen Pembayaran:
                      </span>
                      <label className="flex items-start gap-2.5 p-2.5 sm:p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer transition">
                        <input
                          type="radio"
                          name="q1"
                          className="mt-0.5 text-emerald-700"
                          checked={formOrtu34.q1_kesiapanBiaya === 'Siap membayar LUNAS semua biaya sekolah di awal masuk sesuai ketentuan'}
                          onChange={() => setFormOrtu34({ ...formOrtu34, q1_kesiapanBiaya: 'Siap membayar LUNAS semua biaya sekolah di awal masuk sesuai ketentuan' })}
                        />
                        <span className="text-slate-800 text-xs font-medium leading-relaxed">
                          Siap membayar <strong>LUNAS</strong> semua biaya sekolah di awal masuk sesuai ketentuan
                        </span>
                      </label>
                      <label className="flex items-start gap-2.5 p-2.5 sm:p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer transition">
                        <input
                          type="radio"
                          name="q1"
                          className="mt-0.5 text-emerald-700"
                          checked={formOrtu34.q1_kesiapanBiaya === 'Siap membayar DP 7.500.000, sisa pelunasan maksimal 6 bulan dari tanggal daftar ulang.'}
                          onChange={() => setFormOrtu34({ ...formOrtu34, q1_kesiapanBiaya: 'Siap membayar DP 7.500.000, sisa pelunasan maksimal 6 bulan dari tanggal daftar ulang.' })}
                        />
                        <span className="text-slate-800 text-xs font-medium leading-relaxed">
                          Siap membayar <strong>DP 7.500.000</strong>, sisa pelunasan maksimal 6 bulan dari tanggal daftar ulang.
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* 2 & 3. Pekerjaan Ayah & Bunda */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="font-bold text-slate-800 block mb-1">
                        2. Apa pekerjaan Ayah / Wali Murid? *
                      </label>
                      <input
                        type="text"
                        required
                        value={formOrtu34.q2_pekerjaanAyah || ''}
                        onChange={(e) => setFormOrtu34({ ...formOrtu34, q2_pekerjaanAyah: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-300"
                        placeholder="Contoh: Karyawan Swasta / Wiraswasta / PNS"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-800 block mb-1">
                        3. Apa pekerjaan Bunda / Wali Murid? *
                      </label>
                      <input
                        type="text"
                        required
                        value={formOrtu34.q3_pekerjaanBunda || ''}
                        onChange={(e) => setFormOrtu34({ ...formOrtu34, q3_pekerjaanBunda: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-300"
                        placeholder="Contoh: Ibu Rumah Tangga / Guru / Karyawan"
                      />
                    </div>
                  </div>

                  {/* 4 & 5. Penghasilan Ayah & Bunda */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="font-bold text-slate-800 block mb-1">
                        4. Berapa penghasilan Ayah / Wali per bulan? *
                      </label>
                      <select
                        value={formOrtu34.q4_penghasilanAyah || 'Rp. 10.000.000 - 15.000.000'}
                        onChange={(e) => setFormOrtu34({ ...formOrtu34, q4_penghasilanAyah: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                      >
                        <option value="di bawah Rp.5.000.000">di bawah Rp.5.000.000</option>
                        <option value="Rp. 5.000.000 - 10.000.000">Rp. 5.000.000 - 10.000.000</option>
                        <option value="Rp. 10.000.000 - 15.000.000">Rp. 10.000.000 - 15.000.000</option>
                        <option value="di atas Rp.15.000.000">di atas Rp.15.000.000</option>
                      </select>
                    </div>
                    <div>
                      <label className="font-bold text-slate-800 block mb-1">
                        5. Berapa penghasilan Bunda / Wali per bulan? *
                      </label>
                      <select
                        value={formOrtu34.q5_penghasilanBunda || 'Rp. 5.000.000 - 10.000.000'}
                        onChange={(e) => setFormOrtu34({ ...formOrtu34, q5_penghasilanBunda: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                      >
                        <option value="di bawah Rp.5.000.000">di bawah Rp.5.000.000</option>
                        <option value="Rp. 5.000.000 - 10.000.000">Rp. 5.000.000 - 10.000.000</option>
                        <option value="Rp. 10.000.000 - 15.000.000">Rp. 10.000.000 - 15.000.000</option>
                        <option value="di atas Rp.15.000.000">di atas Rp.15.000.000</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* ======================================================== */}
              {/* BAGIAN B: KEBIASAAN & LATAR BELAKANG                     */}
              {/* ======================================================== */}
              <div className="rounded-xl sm:rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-2xs">
                <div className="bg-slate-800 text-white px-3.5 sm:px-5 py-2.5 sm:py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span>
                    <h4 className="text-xs sm:text-sm font-extrabold uppercase tracking-wide">
                      B. KEBIASAAN & LATAR BELAKANG
                    </h4>
                  </div>
                  <span className="text-[10px] font-bold text-slate-300 bg-white/10 px-2 py-0.5 rounded-md border border-white/15">
                    Butir 6 - 16
                  </span>
                </div>

                <div className="p-3 sm:p-6 space-y-3 sm:space-y-4">
                  {/* 6. Siapakah yang mendampingi belajar */}
                  <div className="p-3 sm:p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-2">
                    <label className="font-bold text-slate-800 block">
                      6. Siapakah yang mendampingi ananda belajar di rumah? (Boleh lebih dari satu) *
                    </label>
                    <div className="flex flex-wrap gap-4 pl-1">
                      {['Ayah', 'Bunda', 'Guru Privat'].map((item) => (
                        <label key={item} className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={(formOrtu34.q6_pendampingBelajar || []).includes(item)}
                            onChange={() => handleToggleArray('q6_pendampingBelajar', item)}
                          />
                          <span>{item}</span>
                        </label>
                      ))}

                      {/* Checkbox Yang Lain */}
                      <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-emerald-800">
                        <input
                          type="checkbox"
                          checked={(formOrtu34.q6_pendampingBelajar || []).some(x => !['Ayah', 'Bunda', 'Guru Privat'].includes(x) || x.toLowerCase().startsWith('yang lain'))}
                          onChange={(e) => {
                            const isChecked = e.target.checked;
                            const base = (formOrtu34.q6_pendampingBelajar || []).filter(x => ['Ayah', 'Bunda', 'Guru Privat'].includes(x));
                            if (isChecked) {
                              const nextVal = customYangLainQ6.trim() ? `Yang lain: ${customYangLainQ6.trim()}` : 'Yang lain';
                              setFormOrtu34({ ...formOrtu34, q6_pendampingBelajar: [...base, nextVal] });
                            } else {
                              setCustomYangLainQ6('');
                              setFormOrtu34({ ...formOrtu34, q6_pendampingBelajar: base });
                            }
                          }}
                        />
                        <span>Yang Lain</span>
                      </label>
                    </div>

                    {/* Isian Tambahan yang tidak ada dalam checklist */}
                    {((formOrtu34.q6_pendampingBelajar || []).some(x => !['Ayah', 'Bunda', 'Guru Privat'].includes(x) || x.toLowerCase().startsWith('yang lain'))) && (
                      <div className="pt-2 pl-1 animate-in fade-in duration-150">
                        <label className="block text-[11px] font-semibold text-emerald-900 mb-1">
                          Isian Tambahan (Yang Lain):
                        </label>
                        <input
                          type="text"
                          placeholder="Tuliskan di sini (contoh: Kakak / Kakek / Nenek / Saudara)..."
                          value={customYangLainQ6}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCustomYangLainQ6(val);
                            const base = (formOrtu34.q6_pendampingBelajar || []).filter(x => ['Ayah', 'Bunda', 'Guru Privat'].includes(x));
                            const next = val.trim() ? [...base, `Yang lain: ${val.trim()}`] : [...base, 'Yang lain'];
                            setFormOrtu34(prev => ({ ...prev, q6_pendampingBelajar: next }));
                          }}
                          className="w-full sm:w-2/3 p-2.5 rounded-xl border border-emerald-300 bg-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        />
                      </div>
                    )}
                  </div>

                  {/* 7. Sholat 5 waktu */}
                  <div>
                    <label className="font-bold text-slate-800 block mb-1">
                      7. Apakah Ayah/Bunda membiasakan ananda untuk melaksanakan sholat 5 waktu? *
                    </label>
                    <div className="flex flex-wrap gap-4 pl-1">
                      {['Selalu', 'Sering', 'Kadang - kadang', 'Tidak Pernah'].map((opt) => (
                        <label key={opt} className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="radio"
                            name="q7"
                            checked={formOrtu34.q7_sholat5Waktu === opt}
                            onChange={() => setFormOrtu34({ ...formOrtu34, q7_sholat5Waktu: opt })}
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* 8. Pengasuh */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <label className="font-bold text-slate-800 block">
                      8. Siapakah yang mengasuh ananda di rumah sepulang sekolah? *
                    </label>
                    <div className="flex flex-wrap gap-4 pl-1">
                      {['Ayah', 'Bunda', 'Keluarga lain (kakek/nenek/tante/paman)', 'Asisten Rumah Tangga'].map((item) => (
                        <label key={item} className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={(formOrtu34.q8_pengasuhPulangSekolah || []).includes(item)}
                            onChange={() => handleToggleArray('q8_pengasuhPulangSekolah', item)}
                          />
                          <span>{item}</span>
                        </label>
                      ))}

                      {/* Checkbox Yang Lain */}
                      <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-emerald-800">
                        <input
                          type="checkbox"
                          checked={(formOrtu34.q8_pengasuhPulangSekolah || []).some(x => !['Ayah', 'Bunda', 'Keluarga lain (kakek/nenek/tante/paman)', 'Asisten Rumah Tangga'].includes(x) || x.toLowerCase().startsWith('yang lain'))}
                          onChange={(e) => {
                            const isChecked = e.target.checked;
                            const base = (formOrtu34.q8_pengasuhPulangSekolah || []).filter(x => ['Ayah', 'Bunda', 'Keluarga lain (kakek/nenek/tante/paman)', 'Asisten Rumah Tangga'].includes(x));
                            if (isChecked) {
                              const nextVal = customYangLainQ8.trim() ? `Yang lain: ${customYangLainQ8.trim()}` : 'Yang lain';
                              setFormOrtu34({ ...formOrtu34, q8_pengasuhPulangSekolah: [...base, nextVal] });
                            } else {
                              setCustomYangLainQ8('');
                              setFormOrtu34({ ...formOrtu34, q8_pengasuhPulangSekolah: base });
                            }
                          }}
                        />
                        <span>Yang Lain</span>
                      </label>
                    </div>

                    {/* Isian Tambahan yang tidak ada dalam checklist */}
                    {((formOrtu34.q8_pengasuhPulangSekolah || []).some(x => !['Ayah', 'Bunda', 'Keluarga lain (kakek/nenek/tante/paman)', 'Asisten Rumah Tangga'].includes(x) || x.toLowerCase().startsWith('yang lain'))) && (
                      <div className="pt-2 pl-1 animate-in fade-in duration-150">
                        <label className="block text-[11px] font-semibold text-emerald-900 mb-1">
                          Isian Tambahan (Yang Lain):
                        </label>
                        <input
                          type="text"
                          placeholder="Tuliskan di sini (contoh: Tetangga / Mandiri di rumah / Penitipan)..."
                          value={customYangLainQ8}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCustomYangLainQ8(val);
                            const base = (formOrtu34.q8_pengasuhPulangSekolah || []).filter(x => ['Ayah', 'Bunda', 'Keluarga lain (kakek/nenek/tante/paman)', 'Asisten Rumah Tangga'].includes(x));
                            const next = val.trim() ? [...base, `Yang lain: ${val.trim()}`] : [...base, 'Yang lain'];
                            setFormOrtu34(prev => ({ ...prev, q8_pengasuhPulangSekolah: next }));
                          }}
                          className="w-full sm:w-2/3 p-2.5 rounded-xl border border-emerald-300 bg-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        />
                      </div>
                    )}
                  </div>

                  {/* 9. Kegiatan Nonformal */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <label className="font-bold text-slate-800 block">
                      9. Apa kegiatan ananda selain pendidikan Formal? *
                    </label>
                    <div className="flex flex-wrap gap-4 pl-1">
                      {['Kursus/les di luar rumah', 'Pendidikan Al-Qur\'an', 'Privat di rumah'].map((item) => (
                        <label key={item} className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={(formOrtu34.q9_kegiatanNonFormal || []).includes(item)}
                            onChange={() => handleToggleArray('q9_kegiatanNonFormal', item)}
                          />
                          <span>{item}</span>
                        </label>
                      ))}

                      {/* Checkbox Yang Lain */}
                      <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-emerald-800">
                        <input
                          type="checkbox"
                          checked={(formOrtu34.q9_kegiatanNonFormal || []).some(x => !['Kursus/les di luar rumah', 'Pendidikan Al-Qur\'an', 'Privat di rumah'].includes(x) || x.toLowerCase().startsWith('yang lain'))}
                          onChange={(e) => {
                            const isChecked = e.target.checked;
                            const base = (formOrtu34.q9_kegiatanNonFormal || []).filter(x => ['Kursus/les di luar rumah', 'Pendidikan Al-Qur\'an', 'Privat di rumah'].includes(x));
                            if (isChecked) {
                              const nextVal = customYangLainQ9.trim() ? `Yang lain: ${customYangLainQ9.trim()}` : 'Yang lain';
                              setFormOrtu34({ ...formOrtu34, q9_kegiatanNonFormal: [...base, nextVal] });
                            } else {
                              setCustomYangLainQ9('');
                              setFormOrtu34({ ...formOrtu34, q9_kegiatanNonFormal: base });
                            }
                          }}
                        />
                        <span>Yang Lain</span>
                      </label>
                    </div>

                    {/* Isian Tambahan yang tidak ada dalam checklist */}
                    {((formOrtu34.q9_kegiatanNonFormal || []).some(x => !['Kursus/les di luar rumah', 'Pendidikan Al-Qur\'an', 'Privat di rumah'].includes(x) || x.toLowerCase().startsWith('yang lain'))) && (
                      <div className="pt-2 pl-1 animate-in fade-in duration-150">
                        <label className="block text-[11px] font-semibold text-emerald-900 mb-1">
                          Isian Tambahan (Yang Lain):
                        </label>
                        <input
                          type="text"
                          placeholder="Tuliskan di sini (contoh: Beladiri / Olahraga Klub / Robotik)..."
                          value={customYangLainQ9}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCustomYangLainQ9(val);
                            const base = (formOrtu34.q9_kegiatanNonFormal || []).filter(x => ['Kursus/les di luar rumah', 'Pendidikan Al-Qur\'an', 'Privat di rumah'].includes(x));
                            const next = val.trim() ? [...base, `Yang lain: ${val.trim()}`] : [...base, 'Yang lain'];
                            setFormOrtu34(prev => ({ ...prev, q9_kegiatanNonFormal: next }));
                          }}
                          className="w-full sm:w-2/3 p-2.5 rounded-xl border border-emerald-300 bg-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        />
                      </div>
                    )}
                  </div>

                  {/* 10 s.d 15 Karakter & Kebiasaan */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="font-bold text-slate-800 block mb-1">
                        10. Penyakit yang pernah/sedang dialami ananda? *
                      </label>
                      <input
                        type="text"
                        value={formOrtu34.q10_riwayatPenyakit || ''}
                        onChange={(e) => setFormOrtu34({ ...formOrtu34, q10_riwayatPenyakit: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-300"
                        placeholder="Tulis '-' jika tidak ada riwayat penyakit"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-800 block mb-1">
                        11. Prestasi yang pernah ananda raih? *
                      </label>
                      <input
                        type="text"
                        value={formOrtu34.q11_prestasi || ''}
                        onChange={(e) => setFormOrtu34({ ...formOrtu34, q11_prestasi: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-300"
                        placeholder="Contoh: Juara 1 MHQ, Juara Olimpiade Matematika"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-800 block mb-1">
                        12. Sifat positif ananda? *
                      </label>
                      <input
                        type="text"
                        value={formOrtu34.q12_sifatPositif || ''}
                        onChange={(e) => setFormOrtu34({ ...formOrtu34, q12_sifatPositif: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-300"
                        placeholder="Contoh: Jujur, santun, rajin muroja'ah"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-800 block mb-1">
                        13. Sifat negatif ananda? *
                      </label>
                      <input
                        type="text"
                        value={formOrtu34.q13_sifatNegatif || ''}
                        onChange={(e) => setFormOrtu34({ ...formOrtu34, q13_sifatNegatif: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-300"
                        placeholder="Contoh: Kadang kurang sabar, perlu dimotivasi"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-800 block mb-1">
                        14. Sikap ananda terhadap Ayah/Bunda? *
                      </label>
                      <input
                        type="text"
                        value={formOrtu34.q14_sikapTerhadapOrtu || ''}
                        onChange={(e) => setFormOrtu34({ ...formOrtu34, q14_sikapTerhadapOrtu: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-300"
                        placeholder="Contoh: Sangat hormat dan terbuka berdialog"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-800 block mb-1">
                        15. Apakah ananda pernah melawan perintah Ayah/Bunda? *
                      </label>
                      <select
                        value={formOrtu34.q15_pernahMelawanOrtu || 'Tidak pernah'}
                        onChange={(e) => setFormOrtu34({ ...formOrtu34, q15_pernahMelawanOrtu: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                      >
                        <option value="Selalu">Selalu</option>
                        <option value="Sering">Sering</option>
                        <option value="Jarang">Jarang</option>
                        <option value="Tidak pernah">Tidak pernah</option>
                      </select>
                    </div>
                  </div>

                  {/* 16. Hal Berkesan */}
                  <div>
                    <label className="font-bold text-slate-800 block mb-1">
                      16. Hal apa yang pernah ananda lakukan yang membuat Ayah/Bunda berkesan? *
                    </label>
                    <textarea
                      rows={2}
                      value={formOrtu34.q16_halBerkesan || ''}
                      onChange={(e) => setFormOrtu34({ ...formOrtu34, q16_halBerkesan: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-300"
                      placeholder="Ceritakan momen membanggakan atau hal berkesan yang pernah ananda lakukan..."
                    />
                  </div>
                </div>
              </div>

              {/* ======================================================== */}
              {/* BAGIAN C: LINGKUNGAN KELUARGA                            */}
              {/* ======================================================== */}
              <div className="rounded-xl sm:rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-2xs">
                <div className="bg-slate-800 text-white px-3.5 sm:px-5 py-2.5 sm:py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span>
                    <h4 className="text-xs sm:text-sm font-extrabold uppercase tracking-wide">
                      C. LINGKUNGAN KELUARGA
                    </h4>
                  </div>
                  <span className="text-[10px] font-bold text-slate-300 bg-white/10 px-2 py-0.5 rounded-md border border-white/15">
                    Butir 17 - 24
                  </span>
                </div>

                <div className="p-3 sm:p-6 space-y-3 sm:space-y-4">
                  {/* 17, 18, 19 Rokok */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                      <label className="font-bold text-slate-800 block mb-2">
                        17. Apakah Ayah merokok? *
                      </label>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input type="radio" name="q17" checked={formOrtu34.q17_ayahMerokok === 'Ya'} onChange={() => setFormOrtu34({ ...formOrtu34, q17_ayahMerokok: 'Ya' })} />
                          <span>Ya</span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input type="radio" name="q17" checked={formOrtu34.q17_ayahMerokok === 'Tidak'} onChange={() => setFormOrtu34({ ...formOrtu34, q17_ayahMerokok: 'Tidak' })} />
                          <span>Tidak</span>
                        </label>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                      <label className="font-bold text-slate-800 block mb-2">
                        18. Apakah Bunda merokok? *
                      </label>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input type="radio" name="q18" checked={formOrtu34.q18_bundaMerokok === 'Ya'} onChange={() => setFormOrtu34({ ...formOrtu34, q18_bundaMerokok: 'Ya' })} />
                          <span>Ya</span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input type="radio" name="q18" checked={formOrtu34.q18_bundaMerokok === 'Tidak'} onChange={() => setFormOrtu34({ ...formOrtu34, q18_bundaMerokok: 'Tidak' })} />
                          <span>Tidak</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="font-bold text-slate-800 block mb-1">
                        19. Anggota keluarga lain merokok? *
                      </label>
                      <input
                        type="text"
                        value={formOrtu34.q19_keluargaLainMerokok || 'Tidak ada'}
                        onChange={(e) => setFormOrtu34({ ...formOrtu34, q19_keluargaLainMerokok: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-300"
                        placeholder="Contoh: Tidak ada / Kakek"
                      />
                    </div>
                  </div>

                  {/* 20 & 21 Waktu Bersama */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="font-bold text-slate-800 block mb-1">
                        20. Berapa lama bersama ananda di rumah? (waktu efektif, jam tidur & sekolah tidak dihitung) *
                      </label>
                      <input
                        type="text"
                        value={formOrtu34.q20_durasiBersamaAnak || ''}
                        onChange={(e) => setFormOrtu34({ ...formOrtu34, q20_durasiBersamaAnak: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-300"
                        placeholder="Contoh: 4 - 5 jam waktu interaksi efektif"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-800 block mb-1">
                        21. Kegiatan bersama saat di rumah? *
                      </label>
                      <input
                        type="text"
                        value={formOrtu34.q21_kegiatanBersamaDiRumah || ''}
                        onChange={(e) => setFormOrtu34({ ...formOrtu34, q21_kegiatanBersamaDiRumah: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-300"
                        placeholder="Contoh: Sholat berjamaah, makan bersama, muroja'ah"
                      />
                    </div>
                  </div>

                  {/* 22, 23, 24 */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="font-bold text-slate-800 block mb-1">
                        22. Pernah mengalami trauma / korban perundungan (bullying)? *
                      </label>
                      <input
                        type="text"
                        value={formOrtu34.q22_traumaBullying || 'Tidak ada'}
                        onChange={(e) => setFormOrtu34({ ...formOrtu34, q22_traumaBullying: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-300"
                        placeholder="Tulis 'Tidak ada' jika tidak pernah"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-800 block mb-1">
                        23. Apakah ananda pernah merokok? *
                      </label>
                      <input
                        type="text"
                        value={formOrtu34.q23_anakPernahMerokok || 'Tidak pernah'}
                        onChange={(e) => setFormOrtu34({ ...formOrtu34, q23_anakPernahMerokok: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-300"
                        placeholder="Tulis 'Tidak pernah'"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-800 block mb-1">
                      24. Pendapat Ayah/Bunda tentang rokok, pornografi, dan kenakalan remaja? *
                    </label>
                    <textarea
                      rows={2}
                      value={formOrtu34.q24_pendapatRokokPornografi || ''}
                      onChange={(e) => setFormOrtu34({ ...formOrtu34, q24_pendapatRokokPornografi: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-300"
                      placeholder="Sampaikan pandangan dan prinsip Ayah/Bunda dalam membentengi ananda..."
                    />
                  </div>
                </div>
              </div>

              {/* ======================================================== */}
              {/* BAGIAN D: PENGGUNAAN GADGET & MOBILITAS                  */}
              {/* ======================================================== */}
              <div className="rounded-xl sm:rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-2xs">
                <div className="bg-slate-800 text-white px-3.5 sm:px-5 py-2.5 sm:py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span>
                    <h4 className="text-xs sm:text-sm font-extrabold uppercase tracking-wide">
                      D. PENGGUNAAN GADGET & MOBILITAS
                    </h4>
                  </div>
                  <span className="text-[10px] font-bold text-slate-300 bg-white/10 px-2 py-0.5 rounded-md border border-white/15">
                    Butir 25 - 33
                  </span>
                </div>

                <div className="p-3 sm:p-6 space-y-3 sm:space-y-4">
                  {/* 25 & 26 */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="font-bold text-slate-800 block mb-1">
                        25. Fasilitas Gadget kepada ananda? *
                      </label>
                      <input
                        type="text"
                        value={formOrtu34.q25_fasilitasGadget || 'Tidak'}
                        onChange={(e) => setFormOrtu34({ ...formOrtu34, q25_fasilitasGadget: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-300"
                        placeholder="Contoh: Tidak / Smartphone bersama / Tab pribadi"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-800 block mb-1">
                        26. Seberapa sering ananda menggunakan gadget? *
                      </label>
                      <select
                        value={formOrtu34.q26_frekuensiGadget || 'Waktu libur'}
                        onChange={(e) => setFormOrtu34({ ...formOrtu34, q26_frekuensiGadget: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                      >
                        <option value="Setiap hari">Setiap hari</option>
                        <option value="Seminggu sekali">Seminggu sekali</option>
                        <option value="Waktu libur">Waktu libur</option>
                        <option value="Tidak pernah">Tidak pernah</option>
                      </select>
                    </div>
                  </div>

                  {/* 27, 28, 29 Pengawasan & Aplikasi */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="font-bold text-slate-800 block mb-1">
                        27. Bersediakah Ayah/Bunda mengawasi penggunaan gadget di rumah? Jika YA, sejak kapan? *
                      </label>
                      <input
                        type="text"
                        value={formOrtu34.q27_bersediaAwasiGadget || 'Ya, selalu didampingi'}
                        onChange={(e) => setFormOrtu34({ ...formOrtu34, q27_bersediaAwasiGadget: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-300"
                        placeholder="Contoh: Ya, sejak SD"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-800 block mb-1">
                        28. Bersediakah meng-install aplikasi pembelajaran ananda? *
                      </label>
                      <input
                        type="text"
                        value={formOrtu34.q28_installAplikasiBelajarAnak || 'Ya'}
                        onChange={(e) => setFormOrtu34({ ...formOrtu34, q28_installAplikasiBelajarAnak: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-300"
                        placeholder="Contoh: Ya, bersedia"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-800 block mb-1">
                        29. Bersediakah meng-install aplikasi pengawasan ortu di HP Ayah/Bunda? Jika TIDAK, alasannya? *
                      </label>
                      <input
                        type="text"
                        value={formOrtu34.q29_installAplikasiPengawasanOrtu || 'Ya'}
                        onChange={(e) => setFormOrtu34({ ...formOrtu34, q29_installAplikasiPengawasanOrtu: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-300"
                        placeholder="Contoh: Ya, bersedia"
                      />
                    </div>
                  </div>

                  {/* 30, 31, 32 Transportasi & Jarak */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start">
                    <div>
                      <label className="font-bold text-slate-800 block mb-1">
                        30. Jarak tempuh rumah ke sekolah? *
                      </label>
                      <select
                        value={formOrtu34.q30_jarakKeSekolah || '0 - 5 km'}
                        onChange={(e) => setFormOrtu34({ ...formOrtu34, q30_jarakKeSekolah: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                      >
                        <option value="0 - 5 km">0 - 5 km</option>
                        <option value="di atas 5km">di atas 5km</option>
                      </select>
                    </div>

                    {/* 31. Kendaraan Mengantar dengan Isian Tambahan 'Yang Lain' */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                      <label className="font-bold text-slate-800 block">
                        31. Kendaraan mengantar ke sekolah? *
                      </label>
                      <select
                        value={['Sepeda', 'Motor', 'Mobil'].includes(formOrtu34.q31_kendaraanSekolah || '') ? formOrtu34.q31_kendaraanSekolah : 'Yang lain'}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === 'Yang lain') {
                            const customVal = customYangLainQ31.trim() ? `Yang lain: ${customYangLainQ31.trim()}` : 'Yang lain';
                            setFormOrtu34({ ...formOrtu34, q31_kendaraanSekolah: customVal });
                          } else {
                            setCustomYangLainQ31('');
                            setFormOrtu34({ ...formOrtu34, q31_kendaraanSekolah: val });
                          }
                        }}
                        className="w-full p-2 rounded-xl border border-slate-300 bg-white"
                      >
                        <option value="Sepeda">Sepeda</option>
                        <option value="Motor">Motor</option>
                        <option value="Mobil">Mobil</option>
                        <option value="Yang lain">Yang Lain (Isian Tambahan)</option>
                      </select>

                      {(!['Sepeda', 'Motor', 'Mobil'].includes(formOrtu34.q31_kendaraanSekolah || '') || formOrtu34.q31_kendaraanSekolah?.startsWith('Yang lain')) && (
                        <div className="pt-1.5">
                          <label className="block text-[10px] font-semibold text-emerald-900 mb-0.5">
                            Isian Tambahan (Yang Lain):
                          </label>
                          <input
                            type="text"
                            placeholder="Sebutkan (contoh: Angkutan Kota / Jalan Kaki)..."
                            value={customYangLainQ31}
                            onChange={(e) => {
                              const val = e.target.value;
                              setCustomYangLainQ31(val);
                              const nextVal = val.trim() ? `Yang lain: ${val.trim()}` : 'Yang lain';
                              setFormOrtu34(prev => ({ ...prev, q31_kendaraanSekolah: nextVal }));
                            }}
                            className="w-full p-2 rounded-lg border border-emerald-300 bg-white text-xs focus:ring-1 focus:ring-emerald-500"
                          />
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="font-bold text-slate-800 block mb-1">
                        32. Izin bawa motor sendiri? Jika MENGIZINKAN, apa alasannya? *
                      </label>
                      <input
                        type="text"
                        value={formOrtu34.q32_izinBawaMotorSendiri || 'Tidak'}
                        onChange={(e) => setFormOrtu34({ ...formOrtu34, q32_izinBawaMotorSendiri: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-300"
                        placeholder="Contoh: Tidak / Belum cukup umur"
                      />
                    </div>
                  </div>

                  {/* 33. Harapan Sekolah */}
                  <div>
                    <label className="font-bold text-slate-800 block mb-1">
                      33. Harapan menyekolahkan ananda di SMPIT Pondok Duta? *
                    </label>
                    <textarea
                      rows={2}
                      value={formOrtu34.q33_harapanSekolah || ''}
                      onChange={(e) => setFormOrtu34({ ...formOrtu34, q33_harapanSekolah: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-300"
                      placeholder="Tuliskan harapan besar Ayah/Bunda untuk karakter, hafalan Al-Qur'an dan prestasi ananda..."
                    />
                  </div>
                </div>
              </div>

              {/* ======================================================== */}
              {/* BAGIAN E: PERNYATAAN ORANG TUA                           */}
              {/* ======================================================== */}
              <div className="rounded-xl sm:rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-2xs">
                <div className="bg-slate-800 text-white px-3.5 sm:px-5 py-2.5 sm:py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span>
                    <h4 className="text-xs sm:text-sm font-extrabold uppercase tracking-wide">
                      E. PERNYATAAN ORANG TUA
                    </h4>
                  </div>
                  <span className="text-[10px] font-bold text-slate-300 bg-white/10 px-2 py-0.5 rounded-md border border-white/15">
                    Butir 34 & Integritas
                  </span>
                </div>

                <div className="p-3 sm:p-6 space-y-3 sm:space-y-4">
                  {/* 34. Tanda tangan di atas meterai 10.000 */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <label className="font-bold text-slate-800 block mb-2">
                      34. Siap menandatangani surat pernyataan di atas meterai 10.000? *
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-800">
                        <input
                          type="radio"
                          name="q34"
                          checked={formOrtu34.q34_ttdMeterai === 'Ya'}
                          onChange={() => setFormOrtu34({ ...formOrtu34, q34_ttdMeterai: 'Ya' })}
                        />
                        <span>Ya, Siap</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-800">
                        <input
                          type="radio"
                          name="q34"
                          checked={formOrtu34.q34_ttdMeterai === 'Tidak'}
                          onChange={() => setFormOrtu34({ ...formOrtu34, q34_ttdMeterai: 'Tidak' })}
                        />
                        <span>Tidak</span>
                      </label>
                    </div>
                  </div>

                  {/* Checkbox Pernyataan Setuju (Tulisan '(SETUJU)' Dihapus) */}
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formOrtu34.pernyataanSetuju ?? true}
                        onChange={(e) => setFormOrtu34({ ...formOrtu34, pernyataanSetuju: e.target.checked })}
                        className="mt-0.5 h-4 w-4 text-emerald-700 rounded focus:ring-emerald-500"
                      />
                      <span className="font-semibold text-slate-800 leading-relaxed">
                        Pernyataan saya di atas adalah benar apa adanya tanpa rekayasa apapun. Saya siap mempertanggungjawabkannya dan setuju mengirimkan data ini sebagai bahan wawancara di SMPIT Pondok Duta.
                      </span>
                    </label>
                  </div>
                </div>
              </div>

            </div>

            {/* Submit Button */}
            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="w-full sm:w-auto px-8 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Menyimpan...' : 'Simpan Observasi OTM'}</span>
              </button>
            </div>

          </div>
        </form>
        </div>
      )}

      {/* TAB 4: CETAK KARTU PESERTA */}
      {activeTab === 'kartu' && biodataForm.noPendaftaran && (
        <div className="p-3.5 sm:p-8 rounded-2xl sm:rounded-3xl bg-white border border-slate-200/90 shadow-xs sm:shadow-sm space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 sm:pb-4 border-b border-slate-100">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold mb-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Data Biodata Siap Dicetak &amp; Diunduh</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">Kartu Peserta Ujian &amp; Observasi</h3>
              <p className="text-xs text-slate-500">Unduh dokumen PDF / PNG dan bawa kartu ini saat hadir tes observasi di SMPIT Pondok Duta.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowPrintModal(true)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition active:scale-95 cursor-pointer shrink-0"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>Unduh Kartu Peserta (PDF / PNG)</span>
              </button>
            </div>
          </div>

          {/* Embedded Card Preview */}
          <div className="border-2 border-emerald-800 rounded-2xl p-4 sm:p-6 bg-white space-y-4 max-w-3xl mx-auto shadow-xs relative overflow-hidden">
            {/* Kop Kartu Resmi */}
            <div className="border-b-2 border-emerald-800 pb-3 space-y-2">
              <div className="flex items-center justify-between gap-2.5">
                <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 flex-1">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-white border border-emerald-100 flex items-center justify-center p-1 shadow-xs shrink-0 overflow-hidden">
                    <img
                      src="/logo-smpit-pondok-duta.png"
                      alt="Logo Resmi SMPIT Pondok Duta"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[9px] sm:text-[11px] font-bold text-emerald-800 uppercase tracking-widest">
                      PANITIA SPMB TP {getAcademicYear()}
                    </div>
                    <div className="text-base sm:text-xl font-black text-slate-900 leading-tight truncate">
                      SMPIT PONDOK DUTA
                    </div>
                    <div className="text-[8px] sm:text-[10px] text-slate-500 leading-tight mt-0.5">
                      Perumahan Pondok Duta, Jl. Duta Plaza No. 1, Kel. Tugu, Kec. Cimanggis, Kota Depok 16451
                    </div>
                    <div className="text-[7.5px] sm:text-[9.5px] text-emerald-800 font-medium">
                      Telp: (021) 29378301 · Email: info@smpitpondokduta.sch.id | NPSN: 20276180 | Terakreditasi "A" BAN-PDM
                    </div>
                  </div>
                </div>

                <div className="shrink-0 self-start sm:self-center text-right">
                  <span className="inline-block px-2.5 sm:px-3 py-1 rounded-lg bg-emerald-800 text-white text-[9px] sm:text-xs font-black uppercase tracking-wider shadow-2xs">
                    KARTU PESERTA
                  </span>
                  <span className="block text-[7.5px] sm:text-[8.5px] font-mono text-emerald-900 font-semibold mt-0.5">
                    OBSERVASI TP {getAcademicYear()}
                  </span>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 sm:gap-4 items-start pt-2">
              <div className="sm:col-span-1 flex flex-row sm:flex-col items-center justify-around sm:justify-center gap-3 bg-slate-50 p-2 sm:p-2.5 rounded-xl border border-slate-200">
                <div className="w-20 sm:w-28 h-28 sm:h-36 border-2 border-dashed border-slate-300 rounded-xl bg-white flex flex-col items-center justify-center p-1.5 text-center text-slate-400 shrink-0">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 mb-1 text-[11px]">
                    3x4
                  </div>
                  <span className="text-[8px] sm:text-[9px] font-bold text-slate-700">PAS FOTO</span>
                  <span className="text-[7px] sm:text-[8px] text-slate-400">Tempel di sini</span>
                </div>
                <div className="text-center shrink-0">
                  <span className="text-[8px] sm:text-[9px] font-bold text-slate-700 block mb-1">SCAN VERIFIKASI</span>
                  <div className="w-20 h-20 sm:w-24 sm:h-24 border border-slate-300 rounded-xl p-1 mx-auto flex flex-col items-center justify-center bg-white shadow-xs">
                    {cardQrDataUrl ? (
                      <img 
                        src={cardQrDataUrl} 
                        alt={`QR Code Verifikasi ${biodataForm.noPendaftaran}`}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-50 animate-pulse rounded-lg flex items-center justify-center text-[9px] text-slate-500 font-mono">
                        Membuat QR...
                      </div>
                    )}
                  </div>
                  <span className="text-[7.5px] sm:text-[8.5px] font-mono font-bold text-slate-900 mt-1 block truncate max-w-[85px] mx-auto bg-slate-100 px-1 py-0.5 rounded">{biodataForm.noPendaftaran}</span>
                </div>
              </div>

              <div className="sm:col-span-3 space-y-2 text-xs">
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[9px] sm:text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                      Nomor Registrasi / Pendaftaran
                    </span>
                    <span className="text-base sm:text-lg font-black font-mono text-emerald-950">
                      {biodataForm.noPendaftaran}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-800 text-white font-mono text-[9px] font-bold">
                    VERIFIED
                  </span>
                </div>

                <table className="w-full text-[10px] sm:text-xs">
                  <tbody>
                    <tr className="border-b border-slate-100">
                      <td className="py-1 text-slate-500 w-28 sm:w-36 font-medium">Nama Lengkap Murid</td>
                      <td className="py-1 font-bold text-slate-900">: {biodataForm.namaLengkap || '-'}</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-1 text-slate-500 font-medium">NISN</td>
                      <td className="py-1 text-slate-800">: {biodataForm.nisn || '-'}</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-1 text-slate-500 font-medium">Jenis Kelamin</td>
                      <td className="py-1 text-slate-800">: {biodataForm.jenisKelamin || '-'}</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-1 text-slate-500 font-medium">Asal Sekolah</td>
                      <td className="py-1 font-semibold text-slate-900">: {biodataForm.asalSekolah || '-'}</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-1 text-slate-500 font-medium">Nama Orang Tua</td>
                      <td className="py-1 text-slate-800">: {biodataForm.namaAyah || '-'} / {biodataForm.namaIbu || '-'}</td>
                    </tr>
                  </tbody>
                </table>

                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] sm:text-[11px]">
                  <div>
                    <span className="text-slate-400 block font-semibold">Jadwal Observasi:</span>
                    <span className="font-bold text-slate-800">Sabtu, 17 Januari 2026</span>
                    <span className="block text-slate-500">Pukul 08.00 - 11.30 WIB</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold">Ruang &amp; Lokasi:</span>
                    <span className="font-bold text-emerald-900">Ruang Aula - Gedung SMPIT Lt. 1</span>
                    <span className="block text-slate-500">Observasi Murid &amp; OTM</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tata Tertib Sesi Observasi (Tanpa kata: putra berpeci) */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[9px] sm:text-[10px] text-slate-600 space-y-1">
              <span className="font-bold text-slate-800 block text-[10px] sm:text-[11px]">Tata Tertib Peserta:</span>
              <p className="leading-relaxed">
                1. Wajib hadir di lokasi 15 menit sebelum observasi dimulai dengan membawa Kartu Peserta ini.<br />
                2. Mengenakan seragam asal SD/MI masing-masing (putri berjilbab syar'i).<br />
                3. Orang tua / wali murid wajib hadir mendampingi untuk sesi observasi OTM.<br />
                4. Membawa alat tulis pensil 2B, pulpen, dan Al-Qur'an / Juz 'Amma pribadi.
              </p>
            </div>

            {/* Blok Verifikasi Sah Secara Hukum via QR Code (Tanpa Tanda Tangan Basah) */}
            <div className="border-t border-slate-200 pt-3 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-[10px] text-slate-600 bg-emerald-50/70 p-3 rounded-xl border border-emerald-200">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>
                  <strong>Dokumen Sah Secara Hukum</strong> — Terverifikasi otomatis via QR Code sistem SPMB Pondok Duta tanpa memerlukan tanda tangan basah panitia / calon murid.
                </span>
              </div>
              <span className="font-mono text-emerald-800 font-bold bg-white px-2 py-0.5 rounded border border-emerald-300 shrink-0">
                VERIFIED LEGAL
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Print View Modal Kartu Peserta */}
      {showPrintModal && biodataForm.noPendaftaran && (
        <KartuUjianPrintView
          siswa={biodataForm as DataSiswa}
          onClose={() => setShowPrintModal(false)}
        />
      )}

      {/* Modal Review Hasil Wawancara & Tanda Tangan di HP Orang Tua (Tombol Unduh Disembunyikan di Akun Siswa) */}
      {reviewDraftOrtuModal && (
        <HasilWawancaraOrtuPrintView
          data={reviewDraftOrtuModal}
          isPreSaveReview={true}
          signingRole="ortu"
          hideDownload={true}
          onClose={() => setReviewDraftOrtuModal(null)}
          onConfirmSave={(ttdOrtu) => {
            const res = gasService.saveTtdOrtuFromHp(selectedNoPendaftaran, ttdOrtu);
            if (res.data) {
              setDraftWawancaraOrtu(res.data);
            }
            setReviewDraftOrtuModal(null);
            alert('Alhamdulillah! Tanda tangan elektronik Ayah/Bunda berhasil disimpan langsung dari HP. Lembar wawancara di akun pewawancara telah terisi tanda tangan ini.');
            loadData(selectedNoPendaftaran);
          }}
        />
      )}

    </div>
  );
};
