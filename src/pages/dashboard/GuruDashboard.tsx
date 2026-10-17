import React, { useState, useEffect, useMemo } from 'react';
import { gasService } from '../../services/gasService';
import { 
  DataSiswa, 
  HasilObservasiOrtuData, 
  ObservasiSiswaData, 
  WawancaraOrtuAnswerItem,
  UserAccount
} from '../../types';
import { 
  QUESTIONS_CONFIG, 
  DAFTAR_PEWAWANCARA_LIST, 
  DAFTAR_PENGUJI_SISWA_LIST 
} from '../../services/questionsConfig';
import { HasilWawancaraOrtuPrintView } from './HasilWawancaraOrtuPrintView';
import { HasilObservasiSiswaPrintView } from './HasilObservasiSiswaPrintView';
import { 
  Users, 
  UserCheck, 
  AlertTriangle, 
  FileText, 
  Printer, 
  Save, 
  ExternalLink, 
  CheckCircle2, 
  Search, 
  BookOpen, 
  Award, 
  School,
  Database,
  ShieldCheck,
  RefreshCw,
  X,
  User,
  GraduationCap,
  Sparkles,
  Filter,
  EyeOff,
  PenTool,
  Check,
  Smartphone,
  LogOut
} from 'lucide-react';

interface Props {
  onOpenGasConfig: () => void;
  onOpenPanduan: () => void;
  currentUser?: UserAccount | null;
  onLogout?: () => void;
}

export const GuruDashboard: React.FC<Props> = ({ 
  onOpenGasConfig, 
  onOpenPanduan,
  currentUser,
  onLogout
}) => {
  // Mode Tim Penguji: 'ortu' (Tim Wawancara Orang Tua OTM) vs 'siswa' (Tim Observasi Siswa)
  // Keduanya berdiri sendiri dan memiliki alur serta penanggung jawab masing-masing
  const [activeTeam, setActiveTeam] = useState<'ortu' | 'siswa'>('ortu');

  // Shared student state from Google Sheets / mock
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // =========================================================================
  // --- STATE TIM 1: WAWANCARA ORANG TUA (OTM) ---
  // =========================================================================
  const [selectedOrtuIndex, setSelectedOrtuIndex] = useState<number>(0);
  const [searchKeywordOrtu, setSearchKeywordOrtu] = useState<string>('');
  const [namaPewawancaraOrtu, setNamaPewawancaraOrtu] = useState<string>(
    currentUser?.role === 'guru' && currentUser.namaSiswa
      ? currentUser.namaSiswa
      : (DAFTAR_PEWAWANCARA_LIST[0] || 'Ustadz Salman Al-Farisi, Lc., M.Pd.')
  );
  const [isCustomPewawancara, setIsCustomPewawancara] = useState<boolean>(false);
  const [customPewawancaraName, setCustomPewawancaraName] = useState<string>('');
  
  const [ortuAnswers, setOrtuAnswers] = useState<{ [qIndex: number]: string }>({});
  const [catatanKhususOrtu, setCatatanKhususOrtu] = useState<string>('');
  const [savedOrtuResult, setSavedOrtuResult] = useState<HasilObservasiOrtuData | null>(null);
  
  // Modal Preview PDF Sebelum Simpan (dengan Tanda Tangan Elektronik & Catatan Khusus Disembunyikan)
  const [preSaveReviewModal, setPreSaveReviewModal] = useState<HasilObservasiOrtuData | null>(null);
  // Modal Preview PDF Hasil Yang Sudah Disimpan
  const [previewOrtuModal, setPreviewOrtuModal] = useState<HasilObservasiOrtuData | null>(null);

  // =========================================================================
  // --- STATE TIM 2: OBSERVASI SISWA (TAHSIN, TAHFIDZ, ADAB, AKADEMIK) ---
  // =========================================================================
  const [selectedSiswaIndex, setSelectedSiswaIndex] = useState<number>(0);
  const [searchKeywordSiswa, setSearchKeywordSiswa] = useState<string>('');
  const [namaPengujiSiswa, setNamaPengujiSiswa] = useState<string>(DAFTAR_PENGUJI_SISWA_LIST[0] || 'Ustadz H. Ahmad Dahlan, S.Pd.I');
  const [isCustomPenguji, setIsCustomPenguji] = useState<boolean>(false);
  const [customPengujiName, setCustomPengujiName] = useState<string>('');

  const [nilaiTahsin, setNilaiTahsin] = useState<number>(85);
  const [catatanTahsin, setCatatanTahsin] = useState('');
  const [nilaiTahfidz, setNilaiTahfidz] = useState<number>(88);
  const [juzDiuji, setJuzDiuji] = useState('Juz 30 (Lengkap)');
  const [catatanTahfidz, setCatatanTahfidz] = useState('');
  const [nilaiKarakterAdab, setNilaiKarakterAdab] = useState<number>(90);
  const [catatanKarakterAdab, setCatatanKarakterAdab] = useState('');
  const [nilaiAkademikDasar, setNilaiAkademikDasar] = useState<number>(85);
  const [catatanAkademikDasar, setCatatanAkademikDasar] = useState('');
  const [rekomendasiSiswa, setRekomendasiSiswa] = useState<'Diterima' | 'Cadangan' | 'Tidak Diterima'>('Diterima');
  const [catatanPengujiSiswa, setCatatanPengujiSiswa] = useState('');
  const [savedSiswaResult, setSavedSiswaResult] = useState<ObservasiSiswaData | null>(null);
  const [previewSiswaModal, setPreviewSiswaModal] = useState<ObservasiSiswaData | null>(null);

  useEffect(() => {
    loadStudentList();
  }, []);

  const loadStudentList = async () => {
    setLoading(true);
    const list = await gasService.getStudentList();
    setStudents(list);
    if (list.length > 0) {
      setSelectedOrtuIndex(0);
      setSelectedSiswaIndex(0);
      loadExistingObservasiSiswa(list[0].id);
      loadExistingWawancaraOrtu(list[0].id);
    }
    setLoading(false);
  };

  // --- FILTERING SISWA BERDASARKAN KATA KUNCI (SEARCH KEYWORD) ---
  const filteredStudentsOrtu = useMemo(() => {
    const term = searchKeywordOrtu.trim().toLowerCase();
    if (!term) return students;
    return students.filter(st => 
      (st.nama || '').toLowerCase().includes(term) ||
      (st.id || '').toLowerCase().includes(term) ||
      (st.sekolah || '').toLowerCase().includes(term) ||
      (st.panggilan || '').toLowerCase().includes(term) ||
      (st.ayah || '').toLowerCase().includes(term) ||
      (st.ibu || '').toLowerCase().includes(term)
    );
  }, [students, searchKeywordOrtu]);

  const filteredStudentsSiswa = useMemo(() => {
    const term = searchKeywordSiswa.trim().toLowerCase();
    if (!term) return students;
    return students.filter(st => 
      (st.nama || '').toLowerCase().includes(term) ||
      (st.id || '').toLowerCase().includes(term) ||
      (st.sekolah || '').toLowerCase().includes(term) ||
      (st.panggilan || '').toLowerCase().includes(term)
    );
  }, [students, searchKeywordSiswa]);

  // Current active students for each team
  const currentStudentOrtu = students[selectedOrtuIndex] || null;
  const currentStudentSiswa = students[selectedSiswaIndex] || null;

  // Handler ganti siswa Tim OTM
  const handleSelectStudentOrtu = (origIdx: number) => {
    setSelectedOrtuIndex(origIdx);
    const st = students[origIdx];
    if (st) {
      loadExistingWawancaraOrtu(st.id);
    }
  };

  // Handler ganti siswa Tim Siswa
  const handleSelectStudentSiswa = (origIdx: number) => {
    setSelectedSiswaIndex(origIdx);
    const st = students[origIdx];
    if (st) {
      loadExistingObservasiSiswa(st.id);
    }
  };

  // Load hasil wawancara OTM yang sudah ada
  const loadExistingWawancaraOrtu = (noPend: string) => {
    const existing = gasService.getHasilWawancaraOrtu(noPend);
    if (existing) {
      setNamaPewawancaraOrtu(existing.namaPewawancara);
      setCatatanKhususOrtu(existing.catatanKhusus || '');
      const map: { [qIdx: number]: string } = {};
      if (existing.jsonAnswers) {
        existing.jsonAnswers.forEach((item, idx) => {
          if (item.newAnswer) map[idx] = item.newAnswer;
        });
      }
      setOrtuAnswers(map);
    } else {
      setOrtuAnswers({});
      setCatatanKhususOrtu('');
    }
  };

  // Load observasi siswa yang sudah ada
  const loadExistingObservasiSiswa = (noPend: string) => {
    const existing = gasService.getObservasiSiswa(noPend);
    if (existing) {
      setNamaPengujiSiswa(existing.namaPenguji);
      setNilaiTahsin(existing.nilaiTahsin);
      setCatatanTahsin(existing.catatanTahsin);
      setNilaiTahfidz(existing.nilaiTahfidz);
      setJuzDiuji(existing.juzDiuji);
      setCatatanTahfidz(existing.catatanTahfidz);
      setNilaiKarakterAdab(existing.nilaiKarakterAdab);
      setCatatanKarakterAdab(existing.catatanKarakterAdab);
      setNilaiAkademikDasar(existing.nilaiAkademikDasar);
      setCatatanAkademikDasar(existing.catatanAkademikDasar);
      setRekomendasiSiswa(existing.rekomendasi);
      setCatatanPengujiSiswa(existing.catatanPenguji);
    } else {
      setNilaiTahsin(85);
      setCatatanTahsin('');
      setNilaiTahfidz(88);
      setJuzDiuji('Juz 30 (Lengkap)');
      setCatatanTahfidz('');
      setNilaiKarakterAdab(90);
      setCatatanKarakterAdab('');
      setNilaiAkademikDasar(85);
      setCatatanAkademikDasar('');
      setRekomendasiSiswa('Diterima');
      setCatatanPengujiSiswa('');
    }
  };

  // Helper mendapatkan nilai referensi dari rawData OTM
  const getRefValue = (refId: number | null): string => {
    if (!refId || !currentStudentOrtu) return '-';
    const raw = currentStudentOrtu.rawData;
    if (!raw) return '-';
    if (typeof raw === 'object' && raw[refId]) {
      return String(raw[refId]);
    }
    const idx = refId - 1;
    if (Array.isArray(raw) && raw[idx]) {
      return String(raw[idx]);
    }
    return '-';
  };

  // Active interviewer name resolution
  const activePewawancaraName = isCustomPewawancara && customPewawancaraName.trim()
    ? customPewawancaraName.trim()
    : namaPewawancaraOrtu;

  const activePengujiName = isCustomPenguji && customPengujiName.trim()
    ? customPengujiName.trim()
    : namaPengujiSiswa;

  // Helper merangkum jawaban wawancara OTM
  const buildCollectedAnswers = () => {
    const collectedAnswers: WawancaraOrtuAnswerItem[] = [];

    QUESTIONS_CONFIG.forEach((q, index) => {
      if (q.type === 'header') {
        collectedAnswers.push({ isHeader: true, question: q.text, newAnswer: '' });
      } else {
        const refVal = getRefValue(q.refId);
        let ansVal = ortuAnswers[index] || '';
        
        // Khusus Catatan Khusus
        if (q.id === 'catatan' || q.text.includes('CATATAN KHUSUS')) {
          ansVal = catatanKhususOrtu || ansVal;
        }

        collectedAnswers.push({
          isHeader: false,
          question: q.text,
          refAnswer: refVal,
          newAnswer: ansVal
        });
      }
    });

    return collectedAnswers;
  };

  // =========================================================================
  // --- ALUR 4: SELESAI WAWANCARA -> PREVIEW PDF + CATATAN KHUSUS DISEMBUNYIKAN
  //            + TEMPAT TANDA TANGAN ELEKTRONIK SEBELUM DISIMPAN ---
  // =========================================================================
  const handleOpenPreSaveReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentStudentOrtu) { 
      alert("Silakan pilih calon siswa terlebih dahulu."); 
      return; 
    }
    if (!activePewawancaraName.trim()) { 
      alert("Silakan pilih atau isi nama pewawancara terlebih dahulu."); 
      return; 
    }

    const collectedAnswers = buildCollectedAnswers();
    const existing = gasService.getHasilWawancaraOrtu(currentStudentOrtu.id);

    const reviewData: HasilObservasiOrtuData = {
      id: existing?.id || ('HO-REVIEW-' + Date.now()),
      idSiswa: currentStudentOrtu.id,
      noPendaftaran: currentStudentOrtu.id,
      namaSiswa: currentStudentOrtu.nama,
      namaPanggilan: currentStudentOrtu.panggilan,
      sekolahAsal: currentStudentOrtu.sekolah,
      namaAyah: currentStudentOrtu.ayah,
      namaIbu: currentStudentOrtu.ibu,
      namaPewawancara: activePewawancaraName,
      tanggalWawancara: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
      jsonAnswers: collectedAnswers,
      catatanKhusus: catatanKhususOrtu || existing?.catatanKhusus || '-',
      ttdOrtuBase64: existing?.ttdOrtuBase64 || '',
      ttdPewawancaraBase64: existing?.ttdPewawancaraBase64 || '',
      isTtdOrtuSigned: Boolean(existing?.ttdOrtuBase64 || existing?.isTtdOrtuSigned),
      pdfUrl: '',
      createdAt: existing?.createdAt || new Date().toISOString()
    };

    // Buka modal pratinjau sebelum simpan
    setPreSaveReviewModal(reviewData);
  };

  // Eksekusi simpan final setelah ditandatangani dan direview
  const handleCommitFinalWawancara = async (ttdOrtu: string, ttdPewawancara: string) => {
    if (!currentStudentOrtu) return;

    setSaving(true);
    const collectedAnswers = buildCollectedAnswers();

    const formData = {
      idSiswa: currentStudentOrtu.id,
      namaSiswa: currentStudentOrtu.nama,
      sekolahAsal: currentStudentOrtu.sekolah,
      namaPanggilan: currentStudentOrtu.panggilan,
      namaAyah: currentStudentOrtu.ayah,
      namaIbu: currentStudentOrtu.ibu,
      namaPewawancara: activePewawancaraName,
      jsonAnswers: collectedAnswers,
      catatanKhusus: catatanKhususOrtu,
      ttdOrtuBase64: ttdOrtu,
      ttdPewawancaraBase64: ttdPewawancara
    };

    const res = await gasService.processWawancaraOrtu(formData);
    setSaving(false);
    setPreSaveReviewModal(null);
    setSavedOrtuResult(res.data);
    alert('Alhamdulillah! Hasil wawancara dan tanda tangan digital berhasil disahkan & disimpan resmi.');

    // Refresh list agar status selesai terupdate
    await loadStudentList();
  };

  // Simpan Cepat / Draft (Muncul di Menu Wawancara Ortu di Akun Siswa/Ortu untuk Ditandatangani di HP)
  const handleDirectSaveDraft = async () => {
    if (!currentStudentOrtu) return;
    setSaving(true);
    const collectedAnswers = buildCollectedAnswers();
    const existing = gasService.getHasilWawancaraOrtu(currentStudentOrtu.id);

    const formData = {
      idSiswa: currentStudentOrtu.id,
      namaSiswa: currentStudentOrtu.nama,
      sekolahAsal: currentStudentOrtu.sekolah,
      namaPanggilan: currentStudentOrtu.panggilan,
      namaAyah: currentStudentOrtu.ayah,
      namaIbu: currentStudentOrtu.ibu,
      namaPewawancara: activePewawancaraName,
      jsonAnswers: collectedAnswers,
      catatanKhusus: catatanKhususOrtu,
      ttdOrtuBase64: existing?.ttdOrtuBase64 || '',
      ttdPewawancaraBase64: existing?.ttdPewawancaraBase64 || ''
    };
    const res = gasService.saveDraftWawancaraOrtu(formData);
    setSaving(false);
    setSavedOrtuResult(res.data);
    alert('Alhamdulillah! Draft wawancara berhasil disimpan.\n\nDokumen ini sekarang muncul di menu Wawancara Orang Tua pada akun siswa/ortu agar dapat direview dan ditandatangani langsung di HP mereka.');
    await loadStudentList();
  };

  // =========================================================================
  // --- SUBMIT TIM 2: OBSERVASI SISWA (TERPISAH & MANDIRI) ---
  // =========================================================================
  const skorTotalSiswa = Number(nilaiTahsin) + Number(nilaiTahfidz) + Number(nilaiKarakterAdab) + Number(nilaiAkademikDasar);
  const rataRataSiswa = Number((skorTotalSiswa / 4).toFixed(1));

  const handleSubmitObservasiSiswa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentStudentSiswa) { alert("Pilih siswa yang diuji!"); return; }
    if (!activePengujiName.trim()) { alert("Pilih atau isi nama penguji siswa!"); return; }

    setSaving(true);
    const payload: ObservasiSiswaData = {
      id: 'OBS-SISWA-' + Date.now(),
      siswaId: currentStudentSiswa.id,
      noPendaftaran: currentStudentSiswa.id,
      namaSiswa: currentStudentSiswa.nama,
      namaPenguji: activePengujiName,
      tanggalObservasi: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
      nilaiTahsin: Number(nilaiTahsin),
      catatanTahsin: catatanTahsin,
      nilaiTahfidz: Number(nilaiTahfidz),
      juzDiuji: juzDiuji,
      catatanTahfidz: catatanTahfidz,
      nilaiKarakterAdab: Number(nilaiKarakterAdab),
      catatanKarakterAdab: catatanKarakterAdab,
      nilaiAkademikDasar: Number(nilaiAkademikDasar),
      catatanAkademikDasar: catatanAkademikDasar,
      totalSkor: skorTotalSiswa,
      rataRata: rataRataSiswa,
      rekomendasi: rekomendasiSiswa,
      catatanPenguji: catatanPengujiSiswa,
      createdAt: new Date().toISOString()
    };

    const res = await gasService.saveObservasiSiswa(payload);
    setSaving(false);
    setSavedSiswaResult(res.data);
    alert(res.message);
    await loadStudentList();
  };

  return (
    <div className="space-y-8">
      
      {/* ===================================================================== */}
      {/* TOP BANNER & INDEPENDENT TEAM SELECTOR (TIM 1 VS TIM 2 BERDIRI SENDIRI) */}
      {/* ===================================================================== */}
      <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-emerald-950 text-white shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-5 border border-slate-800">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-300 text-xs font-semibold border border-white/15">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Menu Pewawancara & Penguji SPMB SMPIT Pondok Duta</span>
            </div>
            {(currentUser?.role === 'guru' || currentUser?.role === 'admin') && (
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border ${
                currentUser.role === 'admin'
                  ? 'bg-amber-500/20 text-amber-200 border-amber-400/30'
                  : 'bg-purple-500/20 text-purple-200 border-purple-400/30'
              }`}>
                <span>
                  {currentUser.role === 'admin' ? 'Admin Login:' : 'Pewawancara Login:'} {currentUser.namaSiswa} ({currentUser.kodePendaftaran})
                </span>
                {onLogout && (
                  <button
                    type="button"
                    onClick={onLogout}
                    className="ml-1 px-2 py-0.5 rounded-md bg-rose-500/80 hover:bg-rose-600 text-white text-[10px] font-bold flex items-center gap-1 transition"
                  >
                    <LogOut className="w-3 h-3" />
                    <span>Keluar</span>
                  </button>
                )}
              </div>
            )}
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white">
            Evaluasi Seleksi Penerimaan Siswa Baru
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Tim Wawancara OTM dan Tim Observasi Siswa masing-masing <strong>berdiri sendiri secara mandiri</strong> karena dikerjakan oleh tim dan penguji berbeda dengan instrumen terpisah.
          </p>
        </div>

        {/* TEAM SELECTOR BUTTONS */}
        <div className="flex bg-slate-800/90 p-1.5 rounded-2xl border border-slate-700 shadow-lg shrink-0">
          <button
            onClick={() => setActiveTeam('ortu')}
            className={`px-4 sm:px-5 py-3 rounded-xl text-xs font-extrabold flex items-center gap-2.5 transition cursor-pointer ${
              activeTeam === 'ortu'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Users className="w-4 h-4 text-emerald-200" />
            <div className="text-left">
              <span className="block leading-tight">1. Tim Wawancara OTM</span>
              <span className="text-[10px] opacity-80 font-normal">Wawancara Orang Tua Murid</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTeam('siswa')}
            className={`px-4 sm:px-5 py-3 rounded-xl text-xs font-extrabold flex items-center gap-2.5 transition cursor-pointer ${
              activeTeam === 'siswa'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <BookOpen className="w-4 h-4 text-indigo-200" />
            <div className="text-left">
              <span className="block leading-tight">2. Tim Observasi Siswa</span>
              <span className="text-[10px] opacity-80 font-normal">Tahsin, Tahfidz, Adab & Akademik</span>
            </div>
          </button>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* TIM 1: WAWANCARA ORANG TUA (OTM) - STANDALONE VIEW                     */}
      {/* ===================================================================== */}
      {activeTeam === 'ortu' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Header Card Info */}
          <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-600 text-white shadow-xs">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-900">
                  Formulir Wawancara Orang Tua Murid (OTM)
                </h2>
                <div className="text-xs text-slate-600 font-medium">
                  Mengacu pada data kuesioner OTM Google Form & diverifikasi langsung oleh Tim Pewawancara.
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="text-[11px] font-bold bg-white text-emerald-800 px-3 py-1 rounded-full border border-emerald-300 shadow-2xs">
                Portal Mandiri Tim OTM
              </span>
            </div>
          </div>

          {/* CONTROL PANEL 1: PENCARIAN KATA KUNCI + PILIH NAMA PEWAWANCARA DARI LIST */}
          <div className="p-6 rounded-3xl bg-[#dceefc] border border-[#b6d4fe] text-xs space-y-5 shadow-xs">
            
            {/* ROW 1: PENCARIAN SISWA DENGAN KATA KUNCI (KEYWORD SEARCH) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                  <Search className="w-4 h-4 text-blue-700" />
                  <span>Pencarian Kata Kunci Calon Siswa (Nama / No. Reg / Asal Sekolah / Orang Tua):</span>
                </label>
                <span className="text-[11px] font-medium text-slate-600">
                  Menampilkan <strong>{filteredStudentsOrtu.length}</strong> dari {students.length} siswa
                </span>
              </div>

              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchKeywordOrtu}
                  onChange={(e) => setSearchKeywordOrtu(e.target.value)}
                  placeholder="Ketik kata kunci untuk mencari: misal 'Fatih', '001', 'SDIT', 'Aisyah'..."
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 bg-white font-medium text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-xs"
                />
                {searchKeywordOrtu && (
                  <button
                    type="button"
                    onClick={() => setSearchKeywordOrtu('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Quick Select Chips jika ada filter */}
              {searchKeywordOrtu && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {filteredStudentsOrtu.map((st) => {
                    const origIndex = students.findIndex(s => s.id === st.id);
                    const isSelected = selectedOrtuIndex === origIndex;
                    return (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => handleSelectStudentOrtu(origIndex)}
                        className={`px-3 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition cursor-pointer ${
                          isSelected
                            ? 'bg-blue-700 text-white shadow-xs'
                            : 'bg-white/90 text-slate-700 hover:bg-white border border-slate-200'
                        }`}
                      >
                        <span>{st.nama}</span>
                        <span className="opacity-75 font-mono text-[10px]">[{st.id}]</span>
                        {st.existingPdf ? (
                          <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1 rounded">✓ Selesai</span>
                        ) : (
                          <span className="text-[9px] bg-amber-100 text-amber-800 px-1 rounded">⏳ Siap</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Dropdown Selector Siswa Terfilter */}
              <div className="pt-1">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Pilih Siswa Aktif:
                </label>
                <select
                  value={selectedOrtuIndex}
                  onChange={(e) => handleSelectStudentOrtu(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white font-bold text-xs focus:ring-2 focus:ring-blue-500 shadow-xs"
                >
                  {filteredStudentsOrtu.map((st) => {
                    const origIndex = students.findIndex(s => s.id === st.id);
                    return (
                      <option key={st.id || origIndex} value={origIndex}>
                        {st.nama} {st.sekolah ? `(${st.sekolah})` : ''} — [{st.id}] {st.existingPdf ? '✓ Sudah Wawancara' : '⏳ Siap Diwawancara'}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Alert Status Tanda Tangan Orang Tua dari HP */}
              {(() => {
                const existing = currentStudentOrtu ? gasService.getHasilWawancaraOrtu(currentStudentOrtu.id) : null;
                const hasTtdOrtuFromHp = Boolean(existing?.isTtdOrtuSigned || existing?.ttdOrtuBase64);
                if (!hasTtdOrtuFromHp) return null;
                return (
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in shadow-xs">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-emerald-600 text-white rounded-xl shrink-0">
                        <Smartphone className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-xs sm:text-sm text-emerald-900 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Tanda Tangan Orang Tua Sudah Masuk dari HP!</span>
                        </div>
                        <p className="text-[11px] text-emerald-800">
                          Orang tua murid telah mereview dan menandatangani di HP mereka. Tanda tangan ini otomatis disematkan pada lembar pengesahan. Pewawancara dapat langsung melanjutkan tanda tangan pengesahan.
                        </p>
                      </div>
                    </div>
                    {existing?.ttdOrtuBase64 && (
                      <div className="bg-white px-2.5 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-2 self-start sm:self-auto shrink-0 shadow-2xs">
                        <span className="text-[10px] text-slate-500 font-bold">TTD Ortu:</span>
                        <img src={existing.ttdOrtuBase64} alt="TTD Ortu" className="h-7 max-w-[80px] object-contain" />
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Alert Status Wawancara Sebelumnya */}
              {currentStudentOrtu?.existingPdf && (
                <div className="p-4 rounded-2xl bg-[#fff3cd] border border-[#ffeeba] text-[#856404] text-center space-y-2 animate-in fade-in">
                  <div className="font-bold text-sm flex items-center justify-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Siswa ini sudah pernah diwawancara.</span>
                  </div>
                  <p className="text-xs text-[#856404]/90">
                    Anda dapat meninjau lembar resmi, mengedit jawaban, atau membuka arsip PDF di Google Drive:
                  </p>
                  <div className="pt-1 flex flex-wrap items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const existing = gasService.getHasilWawancaraOrtu(currentStudentOrtu.id);
                        if (existing) {
                          setPreviewOrtuModal(existing);
                        } else {
                          window.open(currentStudentOrtu.existingPdf, '_blank');
                        }
                      }}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Pratinjau Lembar Dokumen PDF</span>
                    </button>
                    <a
                      href={currentStudentOrtu.existingPdf}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 text-blue-700 font-bold text-xs rounded-xl shadow-xs border border-amber-300 underline"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Buka Google Drive File</span>
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* ROW 2: IDENTITAS SISWA & PILIH NAMA PEWAWANCARA DARI LIST */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-blue-200/60">
              
              {/* Nama Pewawancara (Mengambil dari LIST DAFTAR_PEWAWANCARA_LIST) */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800">
                  Nama Pewawancara (Pilih dari List Resmi):
                </label>
                <select
                  value={isCustomPewawancara ? '__CUSTOM__' : namaPewawancaraOrtu}
                  onChange={(e) => {
                    if (e.target.value === '__CUSTOM__') {
                      setIsCustomPewawancara(true);
                    } else {
                      setIsCustomPewawancara(false);
                      setNamaPewawancaraOrtu(e.target.value);
                    }
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-bold text-xs focus:ring-2 focus:ring-blue-500"
                >
                  {DAFTAR_PEWAWANCARA_LIST.map((guru) => (
                    <option key={guru} value={guru}>{guru}</option>
                  ))}
                  <option value="__CUSTOM__">[+] Tulis Nama Lain / Penguji Pengganti...</option>
                </select>

                {isCustomPewawancara && (
                  <input
                    type="text"
                    value={customPewawancaraName}
                    onChange={(e) => setCustomPewawancaraName(e.target.value)}
                    placeholder="Ketik nama lengkap pewawancara pengganti beserta gelar..."
                    className="w-full px-3 py-2 rounded-xl border border-blue-400 bg-white font-semibold text-xs mt-1.5"
                  />
                )}
              </div>

              {/* Asal Sekolah (Otomatis) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Asal Sekolah (Otomatis):</label>
                <input
                  type="text"
                  readOnly
                  value={currentStudentOrtu?.sekolah || '-'}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-200/80 text-slate-600 cursor-not-allowed font-medium text-xs"
                />
              </div>

              {/* Nama Panggilan */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Panggilan:</label>
                <input
                  type="text"
                  readOnly
                  value={currentStudentOrtu?.panggilan || '-'}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-200/80 text-slate-600 cursor-not-allowed font-medium text-xs"
                />
              </div>

              {/* Orang Tua (Ayah / Ibu) */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nama Ayah:</label>
                  <input
                    type="text"
                    readOnly
                    value={currentStudentOrtu?.ayah || '-'}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-200/80 text-slate-600 cursor-not-allowed font-medium text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nama Ibu:</label>
                  <input
                    type="text"
                    readOnly
                    value={currentStudentOrtu?.ibu || '-'}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-200/80 text-slate-600 cursor-not-allowed font-medium text-xs"
                  />
                </div>
              </div>

            </div>
          </div>

          {/* TABEL PERTANYAAN WAWANCARA OTM */}
          <form onSubmit={handleOpenPreSaveReview} className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-4 sm:p-6">
              
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#2c3e50] text-white">
                      <th className="p-3 text-left w-[36%] font-bold">Topik Pertanyaan</th>
                      <th className="p-3 text-left w-[26%] font-bold">Data Orang Tua Murid (Ref)</th>
                      <th className="p-3 text-left w-[38%] font-bold">Input Hasil Wawancara</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {QUESTIONS_CONFIG.map((q, index) => {
                      if (q.type === 'header') {
                        return (
                          <tr key={index}>
                            <td colSpan={3} className="bg-[#7f8c8d] text-white p-2.5 font-bold text-center text-xs tracking-wide">
                              {q.text}
                            </td>
                          </tr>
                        );
                      }

                      // Penanganan Khusus untuk CATATAN KHUSUS
                      const isCatatanKhusus = q.id === 'catatan' || q.text.includes('CATATAN KHUSUS');
                      const refText = getRefValue(q.refId);

                      return (
                        <tr 
                          key={index} 
                          className={`hover:bg-slate-50/80 ${isCatatanKhusus ? 'bg-amber-50/60 border-2 border-amber-300' : ''}`}
                        >
                          <td className="p-3 align-top font-semibold text-[#2c3e50] leading-relaxed">
                            <div className="flex items-start gap-1.5">
                              <span>{q.text}</span>
                            </div>
                          </td>
                          <td className="p-3 align-top bg-[#f8f9fa] border-r border-slate-200 text-slate-700 text-[11px] leading-relaxed">
                            {refText}
                          </td>
                          <td className="p-3 align-top">
                            {isCatatanKhusus ? (
                              <textarea
                                rows={3}
                                value={catatanKhususOrtu}
                                onChange={(e) => setCatatanKhususOrtu(e.target.value)}
                                placeholder="Catatan internal penguji (rekomendasi khusus, aspek komitmen finansial/moral, catatan rahasia)..."
                                className="w-full p-2.5 rounded-xl border border-amber-400 bg-amber-50/40 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                              />
                            ) : (
                              <textarea
                                rows={2}
                                value={ortuAnswers[index] || ''}
                                onChange={(e) => setOrtuAnswers({ ...ortuAnswers, [index]: e.target.value })}
                                placeholder="Jawaban / Catatan wawancara..."
                                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                              />
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="block md:hidden space-y-4">
                {QUESTIONS_CONFIG.map((q, index) => {
                  if (q.type === 'header') {
                    return (
                      <div key={index} className="bg-[#7f8c8d] text-white p-2.5 rounded-xl font-bold text-center text-xs">
                        {q.text}
                      </div>
                    );
                  }

                  const isCatatanKhusus = q.id === 'catatan' || q.text.includes('CATATAN KHUSUS');
                  const refText = getRefValue(q.refId);

                  return (
                    <div 
                      key={index} 
                      className={`p-4 rounded-2xl border space-y-3 ${
                        isCatatanKhusus ? 'border-amber-400 bg-amber-50/50' : 'border-slate-200 bg-slate-50/50'
                      }`}
                    >
                      <div className="font-bold text-xs text-slate-900">
                        {q.text}
                      </div>
                      <div className="text-[11px] bg-white p-2.5 rounded-xl border border-slate-200 text-slate-700">
                        <span className="font-semibold text-slate-400 block text-[10px]">Data Ortu (Ref):</span>
                        {refText}
                      </div>
                      <div>
                        {isCatatanKhusus ? (
                          <textarea
                            rows={3}
                            value={catatanKhususOrtu}
                            onChange={(e) => setCatatanKhususOrtu(e.target.value)}
                            placeholder="Catatan khusus komite (disembunyikan dari pratinjau orang tua)..."
                            className="w-full p-2.5 rounded-xl border border-amber-300 text-xs bg-white focus:ring-2 focus:ring-amber-500"
                          />
                        ) : (
                          <textarea
                            rows={3}
                            value={ortuAnswers[index] || ''}
                            onChange={(e) => setOrtuAnswers({ ...ortuAnswers, [index]: e.target.value })}
                            placeholder="Jawaban / Catatan wawancara..."
                            className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-blue-500"
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ============================================================= */}
              {/* ACTION BUTTONS: PREVIEW PDF & TANDA TANGAN ELEKTRONIK          */}
              {/* ============================================================= */}
              <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-slate-500 max-w-md">
                  <div className="flex items-center gap-1.5 font-bold text-slate-700 mb-0.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>SOP Penutupan Wawancara:</span>
                  </div>
                  Klik tombol di samping untuk mereview lembar PDF bersama orang tua, menandatangani secara digital, dan menyimpan ke Google Sheets & Drive.
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handleDirectSaveDraft}
                    disabled={saving || !currentStudentOrtu}
                    className="px-4 py-3 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-950 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
                    title="Kirim draft agar dapat dibuka dan ditandatangani orang tua di HP"
                  >
                    <Smartphone className="w-4 h-4 text-emerald-700" />
                    <span>Simpan Draft (Kirim ke HP Ortu)</span>
                  </button>

                  <button
                    type="submit"
                    disabled={saving || !currentStudentOrtu}
                    className="flex-1 sm:flex-initial px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-700/20 transition cursor-pointer active:scale-98 disabled:opacity-50"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Review Pratinjau PDF & Tanda Tangan Elektronik</span>
                  </button>
                </div>
              </div>

            </div>
          </form>

        </div>
      )}

      {/* ===================================================================== */}
      {/* TIM 2: OBSERVASI SISWA (TAHSIN, TAHFIDZ, ADAB, AKADEMIK) - STANDALONE  */}
      {/* ===================================================================== */}
      {activeTeam === 'siswa' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Header Card Info */}
          <div className="p-4 sm:p-5 rounded-2xl bg-indigo-50/80 border border-indigo-200 text-indigo-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-600 text-white shadow-xs">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-900">
                  Lembar Penilaian Observasi Siswa
                </h2>
                <div className="text-xs text-slate-600 font-medium">
                  <strong>Khusus Tim Penguji Siswa:</strong> Pengujian kemampuan membaca Al-Qur'an (Tahsin), hafalan (Tahfidz), adab/karakter, serta nalar akademik dasar.
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="text-[11px] font-bold bg-white text-indigo-800 px-3 py-1 rounded-full border border-indigo-300 shadow-2xs">
                Portal Mandiri Tim Observasi Siswa
              </span>
            </div>
          </div>

          {/* CONTROL PANEL 2: PENCARIAN KATA KUNCI SISWA & PILIH PENGUJI DARI LIST */}
          <div className="p-6 rounded-3xl bg-indigo-50/50 border border-indigo-200/80 text-xs space-y-5 shadow-xs">
            
            {/* PENCARIAN SISWA OBSERVASI */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                  <Search className="w-4 h-4 text-indigo-700" />
                  <span>Pencarian Kata Kunci Siswa Diuji (Nama / No. Reg / Asal Sekolah):</span>
                </label>
                <span className="text-[11px] font-medium text-slate-600">
                  Menampilkan <strong>{filteredStudentsSiswa.length}</strong> dari {students.length} siswa
                </span>
              </div>

              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchKeywordSiswa}
                  onChange={(e) => setSearchKeywordSiswa(e.target.value)}
                  placeholder="Ketik nama santri atau nomor registrasi..."
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 bg-white font-medium text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-xs"
                />
                {searchKeywordSiswa && (
                  <button
                    type="button"
                    onClick={() => setSearchKeywordSiswa('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Quick Select Chips */}
              {searchKeywordSiswa && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {filteredStudentsSiswa.map((st) => {
                    const origIndex = students.findIndex(s => s.id === st.id);
                    const isSelected = selectedSiswaIndex === origIndex;
                    return (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => handleSelectStudentSiswa(origIndex)}
                        className={`px-3 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-700 text-white shadow-xs'
                            : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                        }`}
                      >
                        <span>{st.nama}</span>
                        <span className="opacity-75 font-mono text-[10px]">[{st.id}]</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Dropdown Selector Siswa Terfilter */}
              <div className="pt-1">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Siswa yang Sedang Diuji:
                </label>
                <select
                  value={selectedSiswaIndex}
                  onChange={(e) => handleSelectStudentSiswa(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white font-bold text-xs focus:ring-2 focus:ring-indigo-500 shadow-xs"
                >
                  {filteredStudentsSiswa.map((st) => {
                    const origIndex = students.findIndex(s => s.id === st.id);
                    return (
                      <option key={st.id || origIndex} value={origIndex}>
                        {st.nama} ({st.sekolah || '-'}) — [{st.id}]
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            {/* BARIS PENGUJI OBSERVASI SISWA (LIST DAFTAR_PENGUJI_SISWA_LIST) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-indigo-200/60">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800">
                  Nama Penguji Siswa (Pilih dari List Resmi):
                </label>
                <select
                  value={isCustomPenguji ? '__CUSTOM__' : namaPengujiSiswa}
                  onChange={(e) => {
                    if (e.target.value === '__CUSTOM__') {
                      setIsCustomPenguji(true);
                    } else {
                      setIsCustomPenguji(false);
                      setNamaPengujiSiswa(e.target.value);
                    }
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-bold text-xs focus:ring-2 focus:ring-indigo-500"
                >
                  {DAFTAR_PENGUJI_SISWA_LIST.map((penguji) => (
                    <option key={penguji} value={penguji}>{penguji}</option>
                  ))}
                  <option value="__CUSTOM__">[+] Tulis Nama Penguji Lain / Pengganti...</option>
                </select>

                {isCustomPenguji && (
                  <input
                    type="text"
                    value={customPengujiName}
                    onChange={(e) => setCustomPengujiName(e.target.value)}
                    placeholder="Ketik nama lengkap penguji siswa pengganti..."
                    className="w-full px-3 py-2 rounded-xl border border-indigo-400 bg-white font-semibold text-xs mt-1.5"
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Asal Sekolah Siswa:</label>
                <input
                  type="text"
                  readOnly
                  value={currentStudentSiswa?.sekolah || '-'}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-200/80 text-slate-600 cursor-not-allowed font-medium text-xs"
                />
              </div>
            </div>

          </div>

          {/* FORM PENILAIAN OBSERVASI SISWA */}
          <form onSubmit={handleSubmitObservasiSiswa} className="space-y-6">
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Rubrik Penilaian Kompetensi Santri Baru
                  </h3>
                  <p className="text-xs text-slate-500">
                    Siswa Sedang Diuji: <strong>{currentStudentSiswa?.nama || '-'}</strong> ({currentStudentSiswa?.id})
                  </p>
                </div>

                <div className="flex items-center gap-2 bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-200 text-xs font-bold text-indigo-900">
                  <User className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Penguji: {activePengujiName}</span>
                </div>
              </div>

              {/* Rubrik Penilaian Siswa */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                
                {/* 1. Tahsin */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 block">1. Tahsin & Tajwid Al-Qur'an</span>
                      <span className="text-[11px] text-slate-500">Makhraj huruf, kelancaran tartil, mad & waqaf</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <label className="font-semibold text-slate-600">Skor:</label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        required
                        value={nilaiTahsin}
                        onChange={(e) => setNilaiTahsin(Number(e.target.value))}
                        className="w-16 px-2 py-1 rounded-lg border border-slate-300 bg-white font-bold text-center text-emerald-800"
                      />
                    </div>
                  </div>
                  <textarea
                    rows={2}
                    value={catatanTahsin}
                    onChange={(e) => setCatatanTahsin(e.target.value)}
                    placeholder="Catatan tahsin: makhraj huruf hijaiyyah, mad thobii, ghunnah..."
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white"
                  />
                </div>

                {/* 2. Tahfidz */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 block">2. Tahfidz (Hafalan Al-Qur'an)</span>
                      <input
                        type="text"
                        value={juzDiuji}
                        onChange={(e) => setJuzDiuji(e.target.value)}
                        placeholder="Juz yang diuji"
                        className="text-[11px] font-semibold text-indigo-700 bg-white px-2 py-0.5 rounded border border-slate-200 mt-1"
                      />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <label className="font-semibold text-slate-600">Skor:</label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        required
                        value={nilaiTahfidz}
                        onChange={(e) => setNilaiTahfidz(Number(e.target.value))}
                        className="w-16 px-2 py-1 rounded-lg border border-slate-300 bg-white font-bold text-center text-emerald-800"
                      />
                    </div>
                  </div>
                  <textarea
                    rows={2}
                    value={catatanTahfidz}
                    onChange={(e) => setCatatanTahfidz(e.target.value)}
                    placeholder="Catatan tahfidz: kelancaran sambung ayat, mutqin juz yang disetorkan..."
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white"
                  />
                </div>

                {/* 3. Karakter & Adab */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 block">3. Karakter, Adab & Kesopanan</span>
                      <span className="text-[11px] text-slate-500">Sikap duduk, kontak mata, salam, kepatuhan</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <label className="font-semibold text-slate-600">Skor:</label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        required
                        value={nilaiKarakterAdab}
                        onChange={(e) => setNilaiKarakterAdab(Number(e.target.value))}
                        className="w-16 px-2 py-1 rounded-lg border border-slate-300 bg-white font-bold text-center text-emerald-800"
                      />
                    </div>
                  </div>
                  <textarea
                    rows={2}
                    value={catatanKarakterAdab}
                    onChange={(e) => setCatatanKarakterAdab(e.target.value)}
                    placeholder="Catatan adab & sopan santun terhadap ustadz/ustadzah..."
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white"
                  />
                </div>

                {/* 4. Akademik Dasar */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 block">4. Akademik Dasar (Logika & Numerasi)</span>
                      <span className="text-[11px] text-slate-500">Daya nalar logika, pemahaman bacaan, numerik</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <label className="font-semibold text-slate-600">Skor:</label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        required
                        value={nilaiAkademikDasar}
                        onChange={(e) => setNilaiAkademikDasar(Number(e.target.value))}
                        className="w-16 px-2 py-1 rounded-lg border border-slate-300 bg-white font-bold text-center text-emerald-800"
                      />
                    </div>
                  </div>
                  <textarea
                    rows={2}
                    value={catatanAkademikDasar}
                    onChange={(e) => setCatatanAkademikDasar(e.target.value)}
                    placeholder="Catatan kemampuan problem solving / literasi..."
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white"
                  />
                </div>

              </div>

              {/* Rekomendasi Hasil Evaluasi Siswa */}
              <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <span className="font-bold text-slate-900 block text-xs">
                    Rekomendasi Tim Penguji Siswa:
                  </span>
                  <div className="flex items-center gap-4 mt-2 text-xs">
                    <label className="flex items-center gap-1.5 font-bold text-emerald-800 cursor-pointer">
                      <input
                        type="radio"
                        name="rekomendasiSiswa"
                        checked={rekomendasiSiswa === 'Diterima'}
                        onChange={() => setRekomendasiSiswa('Diterima')}
                      />
                      <span>Diterima</span>
                    </label>
                    <label className="flex items-center gap-1.5 font-bold text-amber-800 cursor-pointer">
                      <input
                        type="radio"
                        name="rekomendasiSiswa"
                        checked={rekomendasiSiswa === 'Cadangan'}
                        onChange={() => setRekomendasiSiswa('Cadangan')}
                      />
                      <span>Cadangan</span>
                    </label>
                    <label className="flex items-center gap-1.5 font-bold text-rose-800 cursor-pointer">
                      <input
                        type="radio"
                        name="rekomendasiSiswa"
                        checked={rekomendasiSiswa === 'Tidak Diterima'}
                        onChange={() => setRekomendasiSiswa('Tidak Diterima')}
                      />
                      <span>Tidak Diterima</span>
                    </label>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-indigo-200">
                  <div className="text-center px-2">
                    <div className="text-[10px] font-bold text-slate-400">Total Skor</div>
                    <div className="text-base font-extrabold text-indigo-900">{skorTotalSiswa}</div>
                  </div>
                  <div className="h-6 w-px bg-slate-200" />
                  <div className="text-center px-2">
                    <div className="text-[10px] font-bold text-slate-400">Rata-Rata</div>
                    <div className="text-base font-extrabold text-emerald-700">{rataRataSiswa}</div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Catatan Khusus Penguji Siswa:
                </label>
                <textarea
                  rows={2}
                  value={catatanPengujiSiswa}
                  onChange={(e) => setCatatanPengujiSiswa(e.target.value)}
                  placeholder="Catatan rekomendasi kelas khusus tahfidz/sains, minat bakat, hal yang perlu pembinaan..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white"
                />
              </div>

              {/* Actions */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                <span className="text-[11px] text-slate-400">
                  Data tersimpan mandiri di sheet Observasi_Siswa terpisah dari Wawancara Orang Tua.
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    disabled={saving || !currentStudentSiswa}
                    className="px-6 py-2.5 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition disabled:opacity-50 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>{saving ? 'Menyimpan...' : 'Simpan Lembar Observasi Siswa'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!currentStudentSiswa) return;
                      const obs = gasService.getObservasiSiswa(currentStudentSiswa.id);
                      if (obs) setPreviewSiswaModal(obs);
                      else alert('Simpan observasi terlebih dahulu untuk melihat pratinjau.');
                    }}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Pratinjau / Cetak</span>
                  </button>
                </div>
              </div>

            </div>
          </form>

        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 1: PRATINJAU PDF SEBELUM SIMPAN DENGAN TANDA TANGAN ELEKTRONIK  */}
      {/* (Catatan Khusus Disembunyikan, Dilengkapi Canvas Tanda Tangan)         */}
      {/* ===================================================================== */}
      {preSaveReviewModal && (
        <HasilWawancaraOrtuPrintView
          data={preSaveReviewModal}
          isPreSaveReview={true}
          onClose={() => setPreSaveReviewModal(null)}
          onConfirmSave={(ttdOrtu, ttdPewawancara) => handleCommitFinalWawancara(ttdOrtu, ttdPewawancara)}
        />
      )}

      {/* ===================================================================== */}
      {/* MODAL 2: PRATINJAU PDF HASIL WAWANCARA YANG SUDAH TERSIMPAN           */}
      {/* ===================================================================== */}
      {previewOrtuModal && (
        <HasilWawancaraOrtuPrintView
          data={previewOrtuModal}
          onClose={() => setPreviewOrtuModal(null)}
        />
      )}

      {/* ===================================================================== */}
      {/* MODAL 3: PRATINJAU LEMBAR OBSERVASI SISWA                             */}
      {/* ===================================================================== */}
      {previewSiswaModal && (
        <HasilObservasiSiswaPrintView
          data={previewSiswaModal}
          onClose={() => setPreviewSiswaModal(null)}
        />
      )}

    </div>
  );
};
