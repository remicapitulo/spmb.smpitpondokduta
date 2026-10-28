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
  RefreshCw,
  Lock
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

  // Rubrik Nilai Observasi Siswa (Benar-benar kosong di awal jika belum dinilai di database)
  const [nilaiTahsin, setNilaiTahsin] = useState<number | ''>('');
  const [catatanTahsin, setCatatanTahsin] = useState<string>('');
  const [nilaiTahfidz, setNilaiTahfidz] = useState<number | ''>('');
  const [juzDiuji, setJuzDiuji] = useState<string>('');
  const [catatanTahfidz, setCatatanTahfidz] = useState<string>('');
  const [nilaiKarakterAdab, setNilaiKarakterAdab] = useState<number | ''>('');
  const [catatanKarakterAdab, setCatatanKarakterAdab] = useState<string>('');
  const [nilaiAkademikDasar, setNilaiAkademikDasar] = useState<number | ''>('');
  const [catatanAkademikDasar, setCatatanAkademikDasar] = useState<string>('');
  const [nilaiPsikotes, setNilaiPsikotes] = useState<number | ''>('');
  const [catatanPsikotes, setCatatanPsikotes] = useState<string>('');
  const [rekomendasiSiswa, setRekomendasiSiswa] = useState<'Diterima' | 'Cadangan' | 'Tidak Diterima' | ''>('');
  const [catatanPengujiSiswa, setCatatanPengujiSiswa] = useState<string>('');
  const [tanggalMaksimalDaftarUlang, setTanggalMaksimalDaftarUlang] = useState<string>('');
  const [pembiayaanCategories, setPembiayaanCategories] = useState<PembiayaanCategory[]>(() => gasService.getPembiayaanList());
  const [kategoriPembiayaan, setKategoriPembiayaan] = useState<string>('');
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
      gasService.getStudentList(false).then((updatedList) => {
        setStudents(updatedList);
      });
      const fresh = gasService.getPembiayaanList();
      if (fresh && fresh.length > 0) {
        setPembiayaanCategories(fresh);
      }
      if (selectedStudentId) {
        loadExistingObservasiSiswa(selectedStudentId);
      }
    };
    window.addEventListener('spmb_db_updated', handleDbUpdate);
    window.addEventListener('storage', handleDbUpdate);
    return () => {
      window.removeEventListener('spmb_db_updated', handleDbUpdate);
      window.removeEventListener('storage', handleDbUpdate);
    };
  }, [selectedStudentId]);

  const handleRefreshKategoriSheet = async () => {
    setIsRefreshingKategori(true);
    setKategoriSyncMsg('Menarik data dari Sheet "Pembiayaan" di Google Spreadsheet...');
    try {
      const res = await gasService.fetchPembiayaanFromSpreadsheet();
      if (res.success && res.categories && res.categories.length > 0) {
        setPembiayaanCategories(res.categories);
        if (kategoriPembiayaan && !res.categories.some(c => c.kategori === kategoriPembiayaan)) {
          setKategoriPembiayaan('');
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
      setNilaiTahsin(existing.nilaiTahsin !== undefined && existing.nilaiTahsin !== null ? existing.nilaiTahsin : '');
      setCatatanTahsin(existing.catatanTahsin || '');
      setNilaiTahfidz(existing.nilaiTahfidz !== undefined && existing.nilaiTahfidz !== null ? existing.nilaiTahfidz : '');
      setJuzDiuji(existing.juzDiuji || '');
      setCatatanTahfidz(existing.catatanTahfidz || '');
      setNilaiKarakterAdab(existing.nilaiKarakterAdab !== undefined && existing.nilaiKarakterAdab !== null ? existing.nilaiKarakterAdab : '');
      setCatatanKarakterAdab(existing.catatanKarakterAdab || '');
      setNilaiAkademikDasar(existing.nilaiAkademikDasar !== undefined && existing.nilaiAkademikDasar !== null ? existing.nilaiAkademikDasar : '');
      setCatatanAkademikDasar(existing.catatanAkademikDasar || '');
      setNilaiPsikotes(existing.nilaiPsikotes !== undefined && existing.nilaiPsikotes !== null ? existing.nilaiPsikotes : '');
      setCatatanPsikotes(existing.catatanPsikotes || '');
      setRekomendasiSiswa(existing.rekomendasi || '');
      setCatatanPengujiSiswa(existing.catatanPenguji || '');
      setTanggalMaksimalDaftarUlang(existing.tanggalMaksimalDaftarUlang || '');
      setKategoriPembiayaan(existing.kategoriPembiayaan || '');
    } else {
      setSavedSiswaResult(null);
      setNilaiTahsin('');
      setCatatanTahsin('');
      setNilaiTahfidz('');
      setJuzDiuji('');
      setCatatanTahfidz('');
      setNilaiKarakterAdab('');
      setCatatanKarakterAdab('');
      setNilaiAkademikDasar('');
      setCatatanAkademikDasar('');
      setNilaiPsikotes('');
      setCatatanPsikotes('');
      setRekomendasiSiswa('');
      setCatatanPengujiSiswa('');
      setTanggalMaksimalDaftarUlang('');
      setKategoriPembiayaan('');
    }
  };

  const currentStudent = students.find(s => s.id === selectedStudentId) || students[0] || null;
  const isGasLive = gasService.isLiveGasConfigured();

  const scoresArray = [nilaiTahsin, nilaiTahfidz, nilaiKarakterAdab, nilaiAkademikDasar, nilaiPsikotes].filter(
    (val): val is number => typeof val === 'number' && !isNaN(val)
  );
  const totalScore = scoresArray.length > 0 ? Math.round(scoresArray.reduce((acc, curr) => acc + curr, 0)) : null;
  const avgScore = scoresArray.length > 0 && totalScore !== null ? Math.round(totalScore / scoresArray.length) : null;

  const effectivePengujiName = isCustomPenguji ? customPenguji.trim() : namaPengujiSiswa;
  const selectedBiayaCategory = kategoriPembiayaan ? gasService.getPembiayaanByCategory(kategoriPembiayaan) : null;

  const handleSubmitObservasiSiswa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentStudent) { alert("Pilih siswa terlebih dahulu!"); return; }
    if (!effectivePengujiName) { alert("Pilih atau isi nama penguji terlebih dahulu!"); return; }
    if (!rekomendasiSiswa) { alert("Pilih keputusan rekomendasi kelulusan terlebih dahulu!"); return; }

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

    const rincianBiayaData = (rekomendasiSiswa === 'Tidak Diterima' || !kategoriPembiayaan) 
      ? undefined 
      : (gasService.getPembiayaanByCategory(kategoriPembiayaan) || undefined);

    const dataPayload: ObservasiSiswaData = {
      id: 'OS-' + Date.now(),
      siswaId: currentStudent.id,
      noPendaftaran: currentStudent.id,
      nisn: resolvedNisn,
      asalSekolah: resolvedAsalSekolah,
      namaSiswa: currentStudent.nama,
      namaPenguji: effectivePengujiName,
      tanggalObservasi: dateStr,
      nilaiTahsin: Number(nilaiTahsin) || 0,
      catatanTahsin,
      nilaiTahfidz: Number(nilaiTahfidz) || 0,
      juzDiuji,
      catatanTahfidz,
      nilaiKarakterAdab: Number(nilaiKarakterAdab) || 0,
      catatanKarakterAdab,
      nilaiAkademikDasar: Number(nilaiAkademikDasar) || 0,
      catatanAkademikDasar,
      nilaiPsikotes: Number(nilaiPsikotes) || 0,
      catatanPsikotes,
      totalSkor: totalScore !== null ? totalScore : 0,
      rataRata: avgScore !== null ? avgScore : 0,
      rekomendasi: rekomendasiSiswa as 'Diterima' | 'Cadangan' | 'Tidak Diterima',
      catatanPenguji: catatanPengujiSiswa,
      tanggalMaksimalDaftarUlang: rekomendasiSiswa === 'Tidak Diterima' ? '-' : (tanggalMaksimalDaftarUlang.trim() || '-'),
      kategoriPembiayaan: rekomendasiSiswa === 'Tidak Diterima' ? '' : kategoriPembiayaan,
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
                  {avgScore !== null ? `${avgScore} / 100` : '-'}
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
                      placeholder="-"
                      value={nilaiTahsin}
                      onChange={(e) => setNilaiTahsin(e.target.value === '' ? '' : Number(e.target.value))}
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
                      placeholder="-"
                      value={nilaiTahfidz}
                      onChange={(e) => setNilaiTahfidz(e.target.value === '' ? '' : Number(e.target.value))}
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
                    <option value="">-- Belum Ada / Pilih Juz Diuji --</option>
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
                      placeholder="-"
                      value={nilaiKarakterAdab}
                      onChange={(e) => setNilaiKarakterAdab(e.target.value === '' ? '' : Number(e.target.value))}
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
                      placeholder="-"
                      value={nilaiAkademikDasar}
                      onChange={(e) => setNilaiAkademikDasar(e.target.value === '' ? '' : Number(e.target.value))}
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
                      placeholder="-"
                      value={nilaiPsikotes}
                      onChange={(e) => setNilaiPsikotes(e.target.value === '' ? '' : Number(e.target.value))}
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
                    <option value="">-- Pilih Rekomendasi Kelulusan --</option>
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

              {/* Menu Input Tanggal Daftar Ulang - Terkunci jika Tidak Diterima */}
              <div className="pt-3 border-t border-indigo-200/80">
                <div className={`p-4 rounded-2xl border-2 space-y-2 transition ${
                  rekomendasiSiswa === 'Tidak Diterima'
                    ? 'bg-slate-100 border-slate-300 opacity-75'
                    : 'bg-emerald-50/80 border-emerald-400'
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1.5">
                    <label className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                      {rekomendasiSiswa === 'Tidak Diterima' ? (
                        <Lock className="w-4 h-4 text-slate-500" />
                      ) : (
                        <Calendar className="w-4 h-4 text-emerald-700" />
                      )}
                      <span>Menu Input Tanggal / Batas Daftar Ulang Murid (Tercetak di Surat Keterangan Hasil Seleksi):</span>
                    </label>
                    {rekomendasiSiswa === 'Tidak Diterima' ? (
                      <span className="text-[10px] text-rose-800 font-bold bg-rose-100 px-2.5 py-0.5 rounded-md border border-rose-300 inline-flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        <span>Terkunci (Tidak Diterima)</span>
                      </span>
                    ) : (
                      <span className="text-[10px] text-emerald-800 font-bold bg-emerald-200/80 px-2.5 py-0.5 rounded-md border border-emerald-300">
                        Otomatis Tercetak di Surat Keterangan Hasil Seleksi
                      </span>
                    )}
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <input
                      type="text"
                      disabled={rekomendasiSiswa === 'Tidak Diterima'}
                      value={rekomendasiSiswa === 'Tidak Diterima' ? '- (Tidak Diterima - Terkunci)' : tanggalMaksimalDaftarUlang}
                      onChange={(e) => setTanggalMaksimalDaftarUlang(e.target.value)}
                      placeholder="Contoh: 20 - 25 Januari 2027 atau 30 Januari 2027"
                      className="flex-1 p-2.5 rounded-xl border border-emerald-500 disabled:border-slate-300 bg-white disabled:bg-slate-200/80 font-bold text-xs text-emerald-950 disabled:text-slate-500 disabled:cursor-not-allowed focus:ring-2 focus:ring-emerald-500 shadow-2xs"
                    />
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {['20 - 25 Januari 2027', '26 - 31 Januari 2027', '1 - 7 Februari 2027', '10 - 15 Februari 2027'].map((chip) => (
                        <button
                          key={chip}
                          type="button"
                          disabled={rekomendasiSiswa === 'Tidak Diterima'}
                          onClick={() => setTanggalMaksimalDaftarUlang(chip)}
                          className={`text-[10px] font-semibold px-2.5 py-1.5 rounded-lg border transition disabled:opacity-50 disabled:cursor-not-allowed ${
                            rekomendasiSiswa !== 'Tidak Diterima' && tanggalMaksimalDaftarUlang === chip
                              ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs cursor-pointer'
                              : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300 cursor-pointer'
                          }`}
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  </div>
                  <p className="text-[10.5px] text-slate-600 mt-1.5 leading-snug">
                    {rekomendasiSiswa === 'Tidak Diterima'
                      ? 'Kolom tanggal daftar ulang dikunci otomatis karena murid berstatus "Tidak Diterima".'
                      : 'Batas tanggal ini akan langsung tercetak pada dokumen resmi Surat Keterangan Hasil Seleksi dan tertera pada halaman Pengumuman Hasil Seleksi calon murid bersangkutan.'}
                  </p>
                </div>
              </div>

              {/* Menu Pilihan Rincian Daftar Ulang (Rujukan Kategori Pembiayaan) - Terkunci jika Tidak Diterima */}
              <div className="pt-3 border-t border-indigo-200/80">
                <div className={`p-5 rounded-2xl border-2 space-y-3.5 shadow-xs transition ${
                  rekomendasiSiswa === 'Tidak Diterima'
                    ? 'bg-slate-100 border-slate-300 opacity-75'
                    : 'bg-gradient-to-r from-indigo-50 via-purple-50 to-emerald-50 border-indigo-400'
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-xl text-white shrink-0 shadow-xs ${
                        rekomendasiSiswa === 'Tidak Diterima' ? 'bg-slate-500' : 'bg-indigo-700'
                      }`}>
                        {rekomendasiSiswa === 'Tidak Diterima' ? <Lock className="w-4 h-4" /> : <CreditCard className="w-4 h-4" />}
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-extrabold text-indigo-950 flex items-center gap-1.5 flex-wrap">
                          <span>Menu Pilihan Rincian Daftar Ulang (Rujukan Kategori)</span>
                          {rekomendasiSiswa === 'Tidak Diterima' ? (
                            <span className="text-[10px] font-bold text-rose-800 bg-rose-100 px-2 py-0.5 rounded-md border border-rose-300 inline-flex items-center gap-1">
                              <Lock className="w-3 h-3" />
                              <span>Terkunci &amp; Tanpa Lampiran PDF</span>
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-indigo-800 bg-indigo-100/90 px-2 py-0.5 rounded-md border border-indigo-300">
                              Database Sheet: Pembiayaan
                            </span>
                          )}
                        </h4>
                        <p className="text-[11px] text-slate-600 leading-snug">
                          {rekomendasiSiswa === 'Tidak Diterima'
                            ? 'Pilihan rincian pembiayaan dikunci. Bagi murid yang "Tidak Diterima", tidak ada Lampiran Pembiayaan saat di-download PDF-nya.'
                            : 'Pilih rujukan kategori biaya SPMB murid. Klik tombol untuk memunculkan rincian pembiayaan modern yang dilampirkan pada PDF Surat Keterangan Hasil Seleksi lembar ke-2.'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={handleRefreshKategoriSheet}
                        disabled={isRefreshingKategori || rekomendasiSiswa === 'Tidak Diterima'}
                        className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-900 font-black text-[11px] transition shadow-md flex items-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed border-2 border-amber-300"
                        title="Klik untuk menarik dan menyinkronkan daftar kategori pembiayaan langsung dari Sheet Pembiayaan di Google Spreadsheet"
                      >
                        <RefreshCw className={`w-4 h-4 text-slate-900 ${isRefreshingKategori ? 'animate-spin' : ''}`} />
                        <span>{isRefreshingKategori ? 'Sedang Menarik Kategori...' : 'Tarik Kategori dari Sheet'}</span>
                      </button>

                      <button
                        type="button"
                        disabled={rekomendasiSiswa === 'Tidak Diterima'}
                        onClick={() => setShowRincianModal(true)}
                        className="px-3.5 py-2 rounded-xl bg-indigo-700 hover:bg-indigo-800 disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed text-white text-[11px] font-bold transition shadow-xs flex items-center gap-1.5 shrink-0 cursor-pointer"
                        title="Klik untuk membuka rincian pembiayaan yang akan dilampirkan di PDF Surat Keterangan Hasil Seleksi lembar ke-2"
                      >
                        <FileText className="w-3.5 h-3.5 text-indigo-200" />
                        <span>Rincian Daftar Ulang (Lembar 2)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowSklModal(true)}
                        className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-bold transition shadow-xs flex items-center gap-1.5 shrink-0 cursor-pointer"
                        title="Klik untuk melihat pratinjau Surat Keterangan Hasil Seleksi"
                      >
                        <GraduationCap className="w-3.5 h-3.5 text-emerald-200" />
                        <span>Pratinjau Surat Keterangan Hasil Seleksi</span>
                      </button>
                    </div>
                  </div>

                  {/* Kategori Dropdown Selector */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between gap-2">
                      <label className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5 flex-wrap">
                        <Tag className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Pilih Kategori Rujukan Pembiayaan Murid:</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                          rekomendasiSiswa === 'Tidak Diterima'
                            ? 'bg-rose-100 text-rose-800 border-rose-300'
                            : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        }`}>
                          {rekomendasiSiswa === 'Tidak Diterima'
                            ? 'Terkunci — Tidak Ada Lampiran Pembiayaan'
                            : `${pembiayaanCategories.length} Kategori Murni dari Sheet`}
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
                      disabled={rekomendasiSiswa === 'Tidak Diterima'}
                      value={rekomendasiSiswa === 'Tidak Diterima' ? '' : kategoriPembiayaan}
                      onChange={(e) => setKategoriPembiayaan(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-indigo-300 disabled:border-slate-300 bg-white disabled:bg-slate-200/80 font-bold text-xs text-indigo-950 disabled:text-slate-500 disabled:cursor-not-allowed focus:ring-2 focus:ring-indigo-500 shadow-2xs cursor-pointer"
                    >
                      {rekomendasiSiswa === 'Tidak Diterima' ? (
                        <option value="">🔒 Terkunci — Murid Berstatus Tidak Diterima (Tanpa Lampiran Pembiayaan)</option>
                      ) : (
                        <>
                          <option value="">-- Belum Dipilih / Pilih Kategori Rujukan Pembiayaan --</option>
                          {pembiayaanCategories.map((c, i) => (
                            <option key={i} value={c.kategori}>
                              {c.kategori}{c.catatan ? ` — ${c.catatan}` : ''}
                            </option>
                          ))}
                        </>
                      )}
                    </select>
                  </div>

                  {/* Live Cost Summary Card */}
                  {rekomendasiSiswa === 'Tidak Diterima' ? (
                    <div className="p-3.5 rounded-xl bg-rose-50/80 border border-rose-200 text-rose-900 text-xs flex items-center gap-2.5 font-medium">
                      <Lock className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>
                        Rincian pembiayaan dinonaktifkan karena rekomendasi murid adalah <strong>Tidak Diterima</strong>. Saat murid/orang tua mengunduh PDF hasil pengumuman, <strong>Lampiran Pembiayaan (Lembar ke-2) otomatis ditiadakan</strong>.
                      </span>
                    </div>
                  ) : selectedBiayaCategory ? (
                    <>
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
                    </>
                  ) : (
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-xs text-center font-medium">
                      Pilih kategori pembiayaan di atas untuk menampilkan rincian biaya daftar ulang murid.
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Submit & Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-[11px] text-slate-400">
                Data disimpan di sheet Observasi_Siswa &amp; terintegrasi ke Surat Keterangan Hasil Seleksi murid.
              </span>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setShowSklModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>Pratinjau Surat Keterangan Hasil Seleksi</span>
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
                        nilaiTahsin: Number(nilaiTahsin) || 0,
                        catatanTahsin,
                        nilaiTahfidz: Number(nilaiTahfidz) || 0,
                        juzDiuji,
                        catatanTahfidz,
                        nilaiKarakterAdab: Number(nilaiKarakterAdab) || 0,
                        catatanKarakterAdab,
                        nilaiAkademikDasar: Number(nilaiAkademikDasar) || 0,
                        catatanAkademikDasar,
                        totalSkor: totalScore !== null ? totalScore : 0,
                        rataRata: avgScore || 0,
                        rekomendasi: (rekomendasiSiswa || 'Cadangan') as any,
                        catatanPenguji: catatanPengujiSiswa,
                        tanggalMaksimalDaftarUlang: rekomendasiSiswa === 'Tidak Diterima' ? '-' : (tanggalMaksimalDaftarUlang.trim() || '-'),
                        kategoriPembiayaan: rekomendasiSiswa === 'Tidak Diterima' ? '' : kategoriPembiayaan,
                        rincianBiaya: (rekomendasiSiswa === 'Tidak Diterima' || !selectedBiayaCategory) ? undefined : selectedBiayaCategory,
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
      {showRincianModal && currentStudent && rekomendasiSiswa !== 'Tidak Diterima' && (
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

      {/* Modal Pratinjau SKL Kelulusan Resmi */}
      {showSklModal && currentStudent && (
        <SklKelulusanPrintModal
          data={{
            noPendaftaran: currentStudent.id,
            namaLengkap: currentStudent.nama,
            asalSekolah: currentStudent.sekolah,
            status: rekomendasiSiswa === 'Diterima' ? 'LULUS' : (rekomendasiSiswa === 'Cadangan' ? 'CADANGAN' : 'TIDAK_LULUS'),
            jadwalDaftarUlang: rekomendasiSiswa === 'Tidak Diterima' ? '-' : tanggalMaksimalDaftarUlang,
            kategoriPembiayaan: rekomendasiSiswa === 'Tidak Diterima' ? '' : kategoriPembiayaan
          }}
          onClose={() => setShowSklModal(false)}
          onOpenRincianKategori={rekomendasiSiswa !== 'Tidak Diterima' ? () => {
            setShowSklModal(false);
            setShowRincianModal(true);
          } : undefined}
        />
      )}

    </div>
  );
};
