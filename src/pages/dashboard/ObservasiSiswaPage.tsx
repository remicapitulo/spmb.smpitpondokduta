import React, { useState, useEffect } from 'react';
import { gasService } from '../../services/gasService';
import { ObservasiSiswaData, PembiayaanCategory } from '../../types';
import { DAFTAR_PEWAWANCARA_LIST } from '../../services/questionsConfig';
import { StudentSearchCombobox } from '../../components/StudentSearchCombobox';
import { HasilObservasiSiswaPrintView } from './HasilObservasiSiswaPrintView';
import { RincianPembiayaanModal } from './RincianPembiayaanModal';
import { SklKelulusanPrintModal } from './SklKelulusanPrintModal';
import { formatRupiah } from '../../services/pembiayaanData';
import { 
  BookOpen, 
  UserCheck, 
  Award, 
  Printer, 
  Download,
  Save, 
  CheckCircle2, 
  Database,
  Sparkles,
  School,
  Calendar,
  CreditCard,
  Tag,
  FileText,
  GraduationCap,
  BadgePercent,
  RefreshCw
} from 'lucide-react';

interface Props {
  onOpenGasConfig: () => void;
  onOpenPanduan?: () => void;
}

export const ObservasiSiswaPage: React.FC<Props> = ({ onOpenGasConfig }) => {
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  const [dbGuruNames, setDbGuruNames] = useState<string[]>(() =>
    gasService.getPewawancaraAccounts().map(g => g.namaSiswa).filter(Boolean)
  );
  const [namaPengujiSiswa, setNamaPengujiSiswa] = useState<string>(
    gasService.getPewawancaraAccounts()[0]?.namaSiswa || ''
  );
  const [isCustomPenguji, setIsCustomPenguji] = useState<boolean>(false);
  const [customPenguji, setCustomPenguji] = useState<string>('');

  // Rubrik Nilai Observasi Siswa
  const [nilaiTahsin, setNilaiTahsin] = useState<number>(85);
  const [catatanTahsin, setCatatanTahsin] = useState<string>('');
  const [nilaiTahfidz, setNilaiTahfidz] = useState<number>(88);
  const [juzDiuji, setJuzDiuji] = useState<string>('Juz 30 (Lengkap)');
  const [catatanTahfidz, setCatatanTahfidz] = useState<string>('');
  const [nilaiKarakterAdab, setNilaiKarakterAdab] = useState<number>(90);
  const [catatanKarakterAdab, setCatatanKarakterAdab] = useState<string>('');
  const [nilaiAkademikDasar, setNilaiAkademikDasar] = useState<number>(85);
  const [catatanAkademikDasar, setCatatanAkademikDasar] = useState<string>('');
  const [nilaiPsikotes, setNilaiPsikotes] = useState<number>(85);
  const [catatanPsikotes, setCatatanPsikotes] = useState<string>('');
  const [rekomendasiSiswa, setRekomendasiSiswa] = useState<'Diterima' | 'Cadangan' | 'Tidak Diterima'>('Diterima');
  const [catatanPengujiSiswa, setCatatanPengujiSiswa] = useState<string>('');
  const [tanggalMaksimalDaftarUlang, setTanggalMaksimalDaftarUlang] = useState<string>('20 - 25 Januari 2027');
  const [pembiayaanCategories, setPembiayaanCategories] = useState<PembiayaanCategory[]>(() => gasService.getPembiayaanList());
  const [kategoriPembiayaan, setKategoriPembiayaan] = useState<string>(() => gasService.getPembiayaanList()[0]?.kategori || '');
  const [isRefreshingKategori, setIsRefreshingKategori] = useState<boolean>(false);
  const [kategoriSyncMsg, setKategoriSyncMsg] = useState<string>('');
  const [showRincianModal, setShowRincianModal] = useState<boolean>(false);
  const [showSklModal, setShowSklModal] = useState<boolean>(false);

  const [savedSiswaResult, setSavedSiswaResult] = useState<ObservasiSiswaData | null>(null);
  const [previewSiswaModal, setPreviewSiswaModal] = useState<ObservasiSiswaData | null>(null);

  useEffect(() => {
    loadStudentList();
  }, []);

  useEffect(() => {
    const handleDbUpdate = () => {
      const fresh = gasService.getPembiayaanList();
      if (fresh && fresh.length > 0) {
        setPembiayaanCategories(fresh);
      }
    };
    window.addEventListener('spmb_db_updated', handleDbUpdate);
    window.addEventListener('storage', handleDbUpdate);
    return () => {
      window.removeEventListener('spmb_db_updated', handleDbUpdate);
      window.removeEventListener('storage', handleDbUpdate);
    };
  }, []);

  const handleRefreshKategoriSheet = async () => {
    setIsRefreshingKategori(true);
    setKategoriSyncMsg('Menarik data dari Sheet "Pembiayaan" di Google Spreadsheet...');
    try {
      const res = await gasService.fetchPembiayaanFromSpreadsheet();
      if (res.success && res.categories && res.categories.length > 0) {
        setPembiayaanCategories(res.categories);
        if (!res.categories.some(c => c.kategori === kategoriPembiayaan)) {
          setKategoriPembiayaan(res.categories[0].kategori);
        }
        setKategoriSyncMsg(res.message);
      } else {
        setKategoriSyncMsg(res.message || 'Gagal memuat kategori dari Spreadsheet.');
      }
    } catch {
      setKategoriSyncMsg('Terjadi kendala saat menghubungi Google Apps Script.');
    } finally {
      setIsRefreshingKategori(false);
      setTimeout(() => setKategoriSyncMsg(''), 7000);
    }
  };

  const loadStudentList = async (targetId?: string) => {
    setLoading(true);
    const list = await gasService.getStudentList();
    const gurus = gasService.getPewawancaraAccounts().map(g => g.namaSiswa).filter(Boolean);
    setDbGuruNames(gurus);
    if (!namaPengujiSiswa && gurus.length > 0) {
      setNamaPengujiSiswa(gurus[0]);
    }
    setStudents(list);

    const activeId = targetId || selectedStudentId || (list[0] ? list[0].id : '');
    setSelectedStudentId(activeId);
    loadExistingObservasiSiswa(activeId);
    setLoading(false);
  };

  const handleSelectStudent = (id: string) => {
    setSelectedStudentId(id);
    loadExistingObservasiSiswa(id);
  };

  const loadExistingObservasiSiswa = (noPend: string) => {
    const existing = gasService.getObservasiSiswa(noPend);
    const gurus = gasService.getPewawancaraAccounts().map(g => g.namaSiswa).filter(Boolean);
    if (existing) {
      setSavedSiswaResult(existing);
      if (existing.namaPenguji) {
        if (gurus.includes(existing.namaPenguji)) {
          setNamaPengujiSiswa(existing.namaPenguji);
          setIsCustomPenguji(false);
        } else {
          setIsCustomPenguji(true);
          setCustomPenguji(existing.namaPenguji);
        }
      }
      setNilaiTahsin(existing.nilaiTahsin);
      setCatatanTahsin(existing.catatanTahsin || '');
      setNilaiTahfidz(existing.nilaiTahfidz);
      setJuzDiuji(existing.juzDiuji || 'Juz 30 (Lengkap)');
      setCatatanTahfidz(existing.catatanTahfidz || '');
      setNilaiKarakterAdab(existing.nilaiKarakterAdab);
      setCatatanKarakterAdab(existing.catatanKarakterAdab || '');
      setNilaiAkademikDasar(existing.nilaiAkademikDasar);
      setCatatanAkademikDasar(existing.catatanAkademikDasar || '');
      setNilaiPsikotes(existing.nilaiPsikotes !== undefined ? existing.nilaiPsikotes : 85);
      setCatatanPsikotes(existing.catatanPsikotes || '');
      setRekomendasiSiswa(existing.rekomendasi);
      setCatatanPengujiSiswa(existing.catatanPenguji || '');
      const defaultKat = pembiayaanCategories[0]?.kategori || gasService.getPembiayaanList()[0]?.kategori || '';
      setTanggalMaksimalDaftarUlang(existing.tanggalMaksimalDaftarUlang || '20 - 25 Januari 2027');
      setKategoriPembiayaan(existing.kategoriPembiayaan || defaultKat);
    } else {
      const defaultKat = pembiayaanCategories[0]?.kategori || gasService.getPembiayaanList()[0]?.kategori || '';
      const existingLulus = gasService.getStatusKelulusan(noPend);
      setSavedSiswaResult(null);
      setNilaiTahsin(85);
      setCatatanTahsin('');
      setNilaiTahfidz(88);
      setJuzDiuji('Juz 30 (Lengkap)');
      setCatatanTahfidz('');
      setNilaiKarakterAdab(90);
      setCatatanKarakterAdab('');
      setNilaiAkademikDasar(85);
      setCatatanAkademikDasar('');
      setNilaiPsikotes(85);
      setCatatanPsikotes('');
      setRekomendasiSiswa('Diterima');
      setCatatanPengujiSiswa('');
      setTanggalMaksimalDaftarUlang(existingLulus?.jadwalDaftarUlang && existingLulus.jadwalDaftarUlang !== '-' ? existingLulus.jadwalDaftarUlang : '20 - 25 Januari 2027');
      setKategoriPembiayaan(existingLulus?.kategoriPembiayaan || defaultKat);
    }
  };

  const currentStudent = students.find(s => s.id === selectedStudentId) || students[0] || null;
  const isGasLive = gasService.isLiveGasConfigured();

  const totalScore = Math.round(Number(nilaiTahsin) + Number(nilaiTahfidz) + Number(nilaiKarakterAdab) + Number(nilaiAkademikDasar) + Number(nilaiPsikotes));
  const avgScore = Math.round(totalScore / 5);

  const effectivePengujiName = isCustomPenguji ? customPenguji.trim() : namaPengujiSiswa;
  const selectedBiayaCategory = gasService.getPembiayaanByCategory(kategoriPembiayaan);

  const handleSubmitObservasiSiswa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentStudent) { alert("Pilih siswa terlebih dahulu!"); return; }
    if (!effectivePengujiName) { alert("Pilih atau isi nama penguji terlebih dahulu!"); return; }

    setSaving(true);
    const dateStr = new Date().toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');

    const existingSiswa = gasService.getSiswaByNo(currentStudent.id);
    const existingInduk = gasService.getDataIndukList().find(d => d.noPendaftaran === currentStudent.id);
    const existingLulus = gasService.getStatusKelulusan(currentStudent.id);
    const resolvedNisn = (existingSiswa?.nisn && existingSiswa.nisn !== '-') 
      ? existingSiswa.nisn 
      : ((existingInduk?.nisn && existingInduk.nisn !== '-') 
        ? existingInduk.nisn 
        : (existingLulus?.nisn && existingLulus.nisn !== '-' ? existingLulus.nisn : '-'));
    const resolvedAsalSekolah = currentStudent.sekolah || existingSiswa?.asalSekolah || existingLulus?.asalSekolah || 'SD/MI Pendaftar';

    const rincianBiayaData = gasService.getPembiayaanByCategory(kategoriPembiayaan);

    const dataPayload: ObservasiSiswaData = {
      id: 'OS-' + Date.now(),
      siswaId: currentStudent.id,
      noPendaftaran: currentStudent.id,
      nisn: resolvedNisn,
      asalSekolah: resolvedAsalSekolah,
      namaSiswa: currentStudent.nama,
      namaPenguji: effectivePengujiName,
      tanggalObservasi: dateStr,
      nilaiTahsin: Number(nilaiTahsin),
      catatanTahsin,
      nilaiTahfidz: Number(nilaiTahfidz),
      juzDiuji,
      catatanTahfidz,
      nilaiKarakterAdab: Number(nilaiKarakterAdab),
      catatanKarakterAdab,
      nilaiAkademikDasar: Number(nilaiAkademikDasar),
      catatanAkademikDasar,
      nilaiPsikotes: Number(nilaiPsikotes),
      catatanPsikotes,
      totalSkor: totalScore,
      rataRata: avgScore,
      rekomendasi: rekomendasiSiswa,
      catatanPenguji: catatanPengujiSiswa,
      tanggalMaksimalDaftarUlang: tanggalMaksimalDaftarUlang.trim() || '20 - 25 Januari 2027',
      kategoriPembiayaan,
      rincianBiaya: rincianBiayaData,
      createdAt: new Date().toISOString()
    };

    const res = await gasService.saveObservasiSiswa(dataPayload);
    setSaving(false);
    setSavedSiswaResult(res.data);
    setSaveSuccessMsg(`Hasil observasi siswa ${currentStudent.nama} (${currentStudent.id}) beserta rincian pembiayaan berhasil disimpan!`);
    setTimeout(() => setSaveSuccessMsg(''), 4000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Top Banner: Tim Observasi Siswa */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-800 via-indigo-700 to-purple-800 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/60 text-indigo-200 text-xs font-semibold mb-2 border border-indigo-500/30">
            <BookOpen className="w-3.5 h-3.5 text-amber-300" />
            <span>Portal Khusus Tim Penguji Observasi Calon Murid</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white">
            Lembar Observasi Calon Murid
          </h1>
          <p className="text-xs text-indigo-100 mt-1">
            Penilaian mandiri terpisah: Tahsin & Tajwid, Tahfidz Quran, Adab Karakter, dan Potensi Akademik Dasar.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenGasConfig}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold backdrop-blur-md transition cursor-pointer"
          >
            <Database className="w-3.5 h-3.5 text-amber-300" />
            <span>Status GAS: {isGasLive ? 'Tersambung Live' : 'Simulasi Offline'}</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 p-6 sm:p-8 space-y-6">
        
        {/* Step 1 & 2: Identitas Penguji & Pencarian Siswa */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-5 rounded-2xl bg-slate-50 border border-slate-200/80">
          
          {/* Penguji Dropdown List */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-indigo-700" />
              <span>Nama Penguji Murid (Pilih Dari Daftar Guru/Penguji):</span>
            </label>
            <div className="space-y-2">
              <select
                value={isCustomPenguji ? '__custom__' : namaPengujiSiswa}
                onChange={(e) => {
                  if (e.target.value === '__custom__') {
                    setIsCustomPenguji(true);
                  } else {
                    setIsCustomPenguji(false);
                    setNamaPengujiSiswa(e.target.value);
                  }
                }}
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-800 shadow-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                {dbGuruNames.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
                <option value="__custom__">+ Tulis Nama Penguji Lainnya...</option>
              </select>

              {isCustomPenguji && (
                <input
                  type="text"
                  autoFocus
                  placeholder="Ketik nama lengkap penguji..."
                  value={customPenguji}
                  onChange={(e) => setCustomPenguji(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-indigo-300 bg-white text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                />
              )}
            </div>
            <p className="text-[10px] text-slate-400">
              Penguji bertugas menguji dan memberikan rekomendasi kelulusan observasi calon murid.
            </p>
          </div>

          {/* Student Search Combobox */}
          <div>
            <StudentSearchCombobox
              students={students}
              selectedStudentId={selectedStudentId}
              onSelectStudent={handleSelectStudent}
              label="Pilih Calon Murid yang Diobservasi:"
            />
          </div>

        </div>

        {/* Save Success Banner */}
        {saveSuccessMsg && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{saveSuccessMsg}</span>
          </div>
        )}

        {/* Existing Observation Banner */}
        {savedSiswaResult && (
          <div className="p-4 sm:p-5 rounded-2xl bg-indigo-50 border border-indigo-200 text-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-100 text-indigo-800 shrink-0">
                <CheckCircle2 className="w-5 h-5 text-indigo-700" />
              </div>
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-indigo-950">
                  Data Observasi Murid Ini Sudah Tercatat
                </h4>
                <p className="text-xs text-indigo-800">
                  Penguji: <strong>{savedSiswaResult.namaPenguji}</strong> | Rata-rata: <strong>{savedSiswaResult.rataRata}/100</strong> | Rekomendasi: <strong>{savedSiswaResult.rekomendasi}</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPreviewSiswaModal(savedSiswaResult)}
                className="px-4 py-2 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Lihat Lembar Observasi Resmi</span>
              </button>
            </div>
          </div>
        )}

        {/* Rubrik Form */}
        {currentStudent ? (
          <form onSubmit={handleSubmitObservasiSiswa} className="space-y-6">
            
            <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                  Rubrik Penilaian & Observasi Calon Murid
                </h3>
                <p className="text-xs text-slate-500">
                  Isikan skor (rentang 0 - 100) dan catatan evaluasi pada tiap komponen.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">Rata-rata:</span>
                <span className="text-base font-black font-mono text-indigo-900 bg-indigo-50 px-2.5 py-1 rounded-xl border border-indigo-200">
                  {avgScore} / 100
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* 1. Tahsin */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold text-[10px]">1</span>
                    Tahsin & Tajwid Al-Qur'an
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-slate-500">Skor:</span>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      required
                      value={nilaiTahsin}
                      onChange={(e) => setNilaiTahsin(Number(e.target.value))}
                      className="w-16 p-1.5 rounded-lg border border-slate-300 text-center font-bold text-xs bg-white text-indigo-900"
                    />
                  </div>
                </div>
                <textarea
                  rows={2}
                  value={catatanTahsin}
                  onChange={(e) => setCatatanTahsin(e.target.value)}
                  placeholder="Catatan makhraj, hukum tajwid mad, nun mati, kelancaran bacaan..."
                  className="w-full p-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* 2. Tahfidz */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold text-[10px]">2</span>
                    Tahfidz (Hafalan Al-Qur'an)
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-slate-500">Skor:</span>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      required
                      value={nilaiTahfidz}
                      onChange={(e) => setNilaiTahfidz(Number(e.target.value))}
                      className="w-16 p-1.5 rounded-lg border border-slate-300 text-center font-bold text-xs bg-white text-indigo-900"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-500 shrink-0">Juz Diuji:</span>
                  <select
                    value={juzDiuji}
                    onChange={(e) => setJuzDiuji(e.target.value)}
                    className="flex-1 p-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                  >
                    <option value="Juz 30 (Lengkap)">Juz 30 (Lengkap)</option>
                    <option value="Juz 30 (Sebagian)">Juz 30 (Sebagian)</option>
                    <option value="Juz 29 - 30 (2 Juz)">Juz 29 - 30 (2 Juz)</option>
                    <option value="> 3 Juz (Hafidz Mutqin)">&gt; 3 Juz (Hafidz Mutqin)</option>
                    <option value="Belum Ada">Belum Ada</option>
                  </select>
                </div>
                <textarea
                  rows={2}
                  value={catatanTahfidz}
                  onChange={(e) => setCatatanTahfidz(e.target.value)}
                  placeholder="Catatan kelancaran sambung ayat, ketepatan hafalan..."
                  className="w-full p-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* 3. Karakter & Adab */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold text-[10px]">3</span>
                    Karakter, Adab & Kemandirian
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-slate-500">Skor:</span>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      required
                      value={nilaiKarakterAdab}
                      onChange={(e) => setNilaiKarakterAdab(Number(e.target.value))}
                      className="w-16 p-1.5 rounded-lg border border-slate-300 text-center font-bold text-xs bg-white text-indigo-900"
                    />
                  </div>
                </div>
                <textarea
                  rows={2}
                  value={catatanKarakterAdab}
                  onChange={(e) => setCatatanKarakterAdab(e.target.value)}
                  placeholder="Catatan kesantunan, adab kepada penguji, rasa percaya diri..."
                  className="w-full p-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* 4. Potensi Akademik Dasar */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold text-[10px]">4</span>
                    Potensi Akademik Dasar
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-slate-500">Skor:</span>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      required
                      value={nilaiAkademikDasar}
                      onChange={(e) => setNilaiAkademikDasar(Number(e.target.value))}
                      className="w-16 p-1.5 rounded-lg border border-slate-300 text-center font-bold text-xs bg-white text-indigo-900"
                    />
                  </div>
                </div>
                <textarea
                  rows={2}
                  value={catatanAkademikDasar}
                  onChange={(e) => setCatatanAkademikDasar(e.target.value)}
                  placeholder="Catatan nalar matematika dasar, pemahaman membaca, logika umum..."
                  className="w-full p-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* 5. Psikotes */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-2xs sm:col-span-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-800 text-xs block">5. Psikotes &amp; Potensi Belajar</span>
                    <span className="text-[11px] text-slate-500">Kematangan belajar, daya tangkap, adaptasi sosial &amp; profil psikologis</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <label className="text-[11px] font-bold text-slate-500">Skor:</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      required
                      value={nilaiPsikotes}
                      onChange={(e) => setNilaiPsikotes(Number(e.target.value))}
                      className="w-16 p-1.5 rounded-lg border border-slate-300 text-center font-bold text-xs bg-white text-indigo-900"
                    />
                  </div>
                </div>
                <textarea
                  rows={2}
                  value={catatanPsikotes}
                  onChange={(e) => setCatatanPsikotes(e.target.value)}
                  placeholder="Catatan psikotes: konsentrasi, kematangan emosi, stabilitas belajar, kepribadian..."
                  className="w-full p-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

            </div>

            {/* Rekomendasi & Catatan Akhir Penguji */}
            <div className="p-5 rounded-2xl bg-indigo-50/60 border border-indigo-200 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Keputusan Rekomendasi Kelulusan Penguji:
                  </label>
                  <select
                    value={rekomendasiSiswa}
                    onChange={(e) => setRekomendasiSiswa(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-indigo-300 bg-white font-bold text-xs text-indigo-950 focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Diterima">DITERIMA (Memenuhi Standar KKM)</option>
                    <option value="Cadangan">CADANGAN (Perlu Pembinaan Tambahan)</option>
                    <option value="Tidak Diterima">TIDAK DITERIMA</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Catatan Khusus Rekomendasi Kelas / Minat Bakat:
                  </label>
                  <input
                    type="text"
                    value={catatanPengujiSiswa}
                    onChange={(e) => setCatatanPengujiSiswa(e.target.value)}
                    placeholder="Contoh: Rekomendasi Kelas Khusus Tahfidz / Sains..."
                    className="w-full p-2.5 rounded-xl border border-indigo-200 bg-white text-xs"
                  />
                </div>
              </div>

              {/* Menu Input Tanggal Daftar Ulang */}
              <div className="pt-3 border-t border-indigo-200/80">
                <div className="p-4 rounded-2xl bg-emerald-50/80 border-2 border-emerald-400 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1.5">
                    <label className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-emerald-700" />
                      <span>Menu Input Tanggal / Batas Daftar Ulang Murid (Tercetak di SKL):</span>
                    </label>
                    <span className="text-[10px] text-emerald-800 font-bold bg-emerald-200/80 px-2.5 py-0.5 rounded-md border border-emerald-300">
                      Otomatis Tercetak di SKL Siswa
                    </span>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <input
                      type="text"
                      value={tanggalMaksimalDaftarUlang}
                      onChange={(e) => setTanggalMaksimalDaftarUlang(e.target.value)}
                      placeholder="Contoh: 20 - 25 Januari 2027 atau 30 Januari 2027"
                      className="flex-1 p-2.5 rounded-xl border border-emerald-500 bg-white font-bold text-xs text-emerald-950 focus:ring-2 focus:ring-emerald-500 shadow-2xs"
                    />
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {['20 - 25 Januari 2027', '26 - 31 Januari 2027', '1 - 7 Februari 2027', '10 - 15 Februari 2027'].map((chip) => (
                        <button
                          key={chip}
                          type="button"
                          onClick={() => setTanggalMaksimalDaftarUlang(chip)}
                          className={`text-[10px] font-semibold px-2.5 py-1.5 rounded-lg border transition cursor-pointer ${
                            tanggalMaksimalDaftarUlang === chip
                              ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                              : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300'
                          }`}
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  </div>
                  <p className="text-[10.5px] text-slate-600 mt-1.5 leading-snug">
                    Batas tanggal ini akan langsung tercetak pada dokumen resmi Surat Keterangan Lulus (SKL) dan tertera pada halaman Pengumuman Kelulusan calon murid bersangkutan.
                  </p>
                </div>
              </div>

              {/* Menu Pilihan Rincian Daftar Ulang (Rujukan Kategori Pembiayaan) */}
              <div className="pt-3 border-t border-indigo-200/80">
                <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-50 via-purple-50 to-emerald-50 border-2 border-indigo-400 space-y-3.5 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-indigo-700 text-white shrink-0 shadow-xs">
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-extrabold text-indigo-950 flex items-center gap-1.5 flex-wrap">
                          <span>Menu Pilihan Rincian Daftar Ulang (Rujukan Kategori)</span>
                          <span className="text-[10px] font-bold text-indigo-800 bg-indigo-100/90 px-2 py-0.5 rounded-md border border-indigo-300">
                            Database Sheet: Pembiayaan
                          </span>
                        </h4>
                        <p className="text-[11px] text-indigo-800 leading-snug">
                          Pilih rujukan kategori biaya SPMB murid. Klik tombol untuk memunculkan rincian pembiayaan modern yang dilampirkan pada PDF SKL lembar ke-2.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={handleRefreshKategoriSheet}
                        disabled={isRefreshingKategori}
                        className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-900 font-black text-[11px] transition shadow-md flex items-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-50 border-2 border-amber-300"
                        title="Klik untuk menarik dan menyinkronkan daftar kategori pembiayaan langsung dari Sheet Pembiayaan di Google Spreadsheet"
                      >
                        <RefreshCw className={`w-4 h-4 text-slate-900 ${isRefreshingKategori ? 'animate-spin' : ''}`} />
                        <span>{isRefreshingKategori ? 'Sedang Menarik Kategori...' : 'Tarik Kategori dari Sheet'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowRincianModal(true)}
                        className="px-3.5 py-2 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white text-[11px] font-bold transition shadow-xs flex items-center gap-1.5 shrink-0 cursor-pointer"
                        title="Klik untuk membuka rincian pembiayaan yang akan dilampirkan di PDF SKL lembar ke-2"
                      >
                        <FileText className="w-3.5 h-3.5 text-indigo-200" />
                        <span>Rincian Daftar Ulang (Lembar 2)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowSklModal(true)}
                        className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-bold transition shadow-xs flex items-center gap-1.5 shrink-0 cursor-pointer"
                        title="Klik untuk melihat pratinjau SKL kelulusan lengkap (2 Halaman)"
                      >
                        <GraduationCap className="w-3.5 h-3.5 text-emerald-200" />
                        <span>Pratinjau SKL Kelulusan</span>
                      </button>
                    </div>
                  </div>

                  {/* Kategori Dropdown Selector */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between gap-2">
                      <label className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5 flex-wrap">
                        <Tag className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Pilih Kategori Rujukan Pembiayaan Murid:</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md border bg-emerald-100 text-emerald-800 border-emerald-300">
                          {pembiayaanCategories.length} Kategori Murni dari Sheet
                        </span>
                      </label>
                    </div>

                    {kategoriSyncMsg && (
                      <div className="p-2.5 rounded-xl bg-indigo-50/90 border border-indigo-200 text-indigo-900 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                        <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                        <span>{kategoriSyncMsg}</span>
                      </div>
                    )}

                    <select
                      value={kategoriPembiayaan}
                      onChange={(e) => setKategoriPembiayaan(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-indigo-300 bg-white font-bold text-xs text-indigo-950 focus:ring-2 focus:ring-indigo-500 shadow-2xs cursor-pointer"
                    >
                      {pembiayaanCategories.map((c, i) => (
                        <option key={i} value={c.kategori}>
                          {c.kategori}{c.catatan ? ` — ${c.catatan}` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Live Cost Summary Card */}
                  <div className="p-3.5 rounded-xl bg-white border border-indigo-200 grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs shadow-2xs">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Subtotal I (Gedung/BPP/Seragam):</span>
                      <span className="font-mono font-bold text-slate-800">{formatRupiah(selectedBiayaCategory.subtotalI)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Subtotal II (Kegiatan/Buku/KBM):</span>
                      <span className="font-mono font-bold text-slate-800">{formatRupiah(selectedBiayaCategory.subtotalII)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">SPP Juli (Flat 3 Thn):</span>
                      <span className="font-mono font-bold text-slate-800">{formatRupiah(selectedBiayaCategory.spp)}</span>
                    </div>
                    <div className="bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                      <span className="text-[10px] text-emerald-800 font-bold block">Total Biaya Daftar Ulang:</span>
                      <span className="font-mono font-black text-emerald-900 text-sm">{formatRupiah(selectedBiayaCategory.totalBiaya)}</span>
                    </div>
                  </div>

                  {selectedBiayaCategory.catatan && (
                    <div className="flex items-center gap-2 text-[11px] text-indigo-900 bg-indigo-100/70 p-2 rounded-lg border border-indigo-200">
                      <BadgePercent className="w-3.5 h-3.5 text-indigo-700 shrink-0" />
                      <span><strong>Catatan:</strong> {selectedBiayaCategory.catatan}</span>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Submit & Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-[11px] text-slate-400">
                Data disimpan di sheet Observasi_Siswa &amp; terintegrasi ke SKL Kelulusan murid.
              </span>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setShowSklModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>Pratinjau SKL</span>
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-indigo-700 hover:bg-indigo-800 active:scale-95 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition disabled:opacity-50 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Menyimpan...' : 'Simpan Lembar Observasi Murid'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const obs = gasService.getObservasiSiswa(currentStudent.id);
                    if (obs) setPreviewSiswaModal(obs);
                    else {
                      // Buka draft pratinjau
                      setPreviewSiswaModal({
                        id: 'OS-DRAFT',
                        siswaId: currentStudent.id,
                        noPendaftaran: currentStudent.id,
                        namaSiswa: currentStudent.nama,
                        namaPenguji: effectivePengujiName,
                        tanggalObservasi: new Date().toLocaleDateString('id-ID'),
                        nilaiTahsin,
                        catatanTahsin,
                        nilaiTahfidz,
                        juzDiuji,
                        catatanTahfidz,
                        nilaiKarakterAdab,
                        catatanKarakterAdab,
                        nilaiAkademikDasar,
                        catatanAkademikDasar,
                        totalSkor: totalScore,
                        rataRata: avgScore,
                        rekomendasi: rekomendasiSiswa,
                        catatanPenguji: catatanPengujiSiswa,
                        kategoriPembiayaan,
                        rincianBiaya: selectedBiayaCategory,
                        createdAt: new Date().toISOString()
                      });
                    }
                  }}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Download className="w-4 h-4 text-indigo-600" />
                  <span>Lembar Observasi Resmi</span>
                </button>
              </div>
            </div>

          </form>
        ) : (
          <div className="text-center py-12 text-slate-400 text-xs">
            Pilih siswa pada kolom pencarian di atas.
          </div>
        )}

      </div>

      {/* Modal Pratinjau Lembar Observasi Murid */}
      {previewSiswaModal && (
        <HasilObservasiSiswaPrintView
          data={previewSiswaModal}
          onClose={() => setPreviewSiswaModal(null)}
        />
      )}

      {/* Modal Rincian Pembiayaan Lembar ke-2 (Format Baru Modern) */}
      {showRincianModal && currentStudent && (
        <RincianPembiayaanModal
          siswa={{
            noPendaftaran: currentStudent.id,
            namaLengkap: currentStudent.nama,
            asalSekolah: currentStudent.sekolah
          }}
          selectedKategori={kategoriPembiayaan}
          onSelectKategori={(k) => setKategoriPembiayaan(k)}
          onClose={() => setShowRincianModal(false)}
          onOpenFullSklPreview={() => {
            setShowRincianModal(false);
            setShowSklModal(true);
          }}
          tanggalDaftarUlang={tanggalMaksimalDaftarUlang}
        />
      )}

      {/* Modal Pratinjau SKL Kelulusan Resmi (2 Halaman Lengkap) */}
      {showSklModal && currentStudent && (
        <SklKelulusanPrintModal
          data={{
            noPendaftaran: currentStudent.id,
            namaLengkap: currentStudent.nama,
            asalSekolah: currentStudent.sekolah,
            status: rekomendasiSiswa === 'Diterima' ? 'LULUS' : (rekomendasiSiswa === 'Cadangan' ? 'CADANGAN' : 'TIDAK_LULUS'),
            jadwalDaftarUlang: tanggalMaksimalDaftarUlang,
            kategoriPembiayaan
          }}
          onClose={() => setShowSklModal(false)}
          onOpenRincianKategori={() => {
            setShowSklModal(false);
            setShowRincianModal(true);
          }}
        />
      )}

    </div>
  );
};
