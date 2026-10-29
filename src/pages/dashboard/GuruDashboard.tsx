import React, { useState, useEffect, useMemo } from 'react';
import { gasService } from '../../services/gasService';
import { 
  DataSiswa, 
  HasilObservasiOrtuData, 
  ObservasiSiswaData, 
  WawancaraOrtuAnswerItem,
  UserAccount,
  StatusKelulusanInfo,
  PembiayaanCategory
} from '../../types';
import { 
  QUESTIONS_CONFIG, 
  DAFTAR_PEWAWANCARA_LIST, 
  DAFTAR_PENGUJI_SISWA_LIST 
} from '../../services/questionsConfig';
import { HasilWawancaraOrtuPrintView } from './HasilWawancaraOrtuPrintView';
import { HasilObservasiSiswaPrintView } from './HasilObservasiSiswaPrintView';
import { RincianPembiayaanModal } from './RincianPembiayaanModal';
import { SklKelulusanPrintModal } from './SklKelulusanPrintModal';
import { formatRupiah } from '../../services/pembiayaanData';
import { DataIndukSekolahTab } from './DataIndukSekolahTab';
import { WhatsappKelulusanTab } from './WhatsappKelulusanTab';
import { StudentSearchCombobox } from '../../components/StudentSearchCombobox';
import { showAppAlert, showAppConfirm } from '../../components/AppDialogModal';
import { 
  Users, 
  UserCheck, 
  AlertTriangle, 
  FileText, 
  Printer, 
  Download,
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
  LogOut,
  Calendar,
  CreditCard,
  Tag,
  BadgePercent,
  MessageCircle,
  Lock,
  AlertCircle
} from 'lucide-react';

interface Props {
  onOpenGasConfig: () => void;
  onOpenPanduan: () => void;
  currentUser?: UserAccount | null;
  onLogout?: () => void;
  activeTeam?: 'ortu' | 'siswa' | 'data-induk' | 'whatsapp';
  onTeamChange?: (team: 'ortu' | 'siswa' | 'data-induk' | 'whatsapp') => void;
}

export const GuruDashboard: React.FC<Props> = ({ 
  onOpenGasConfig, 
  onOpenPanduan,
  currentUser,
  onLogout,
  activeTeam: propActiveTeam,
  onTeamChange: propOnTeamChange
}) => {
  // Mode Menu: 'ortu' (Tim Wawancara OTM) vs 'siswa' (Tim Observasi Murid) vs 'data-induk' (Buku Induk Sekolah & NIS) vs 'whatsapp' (WhatsApp Kelulusan)
  const [internalTeam, setInternalTeam] = useState<'ortu' | 'siswa' | 'data-induk' | 'whatsapp'>('ortu');
  const activeTeam = propActiveTeam !== undefined ? propActiveTeam : internalTeam;
  const setActiveTeam = (team: 'ortu' | 'siswa' | 'data-induk' | 'whatsapp') => {
    setInternalTeam(team);
    propOnTeamChange?.(team);
  };

  // Shared student state from Google Sheets / mock
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [dbGuruNames, setDbGuruNames] = useState<string[]>(() =>
    gasService.getPewawancaraAccounts().map(g => g.namaSiswa).filter(Boolean)
  );

  // =========================================================================
  // --- STATE TIM 1: WAWANCARA ORANG TUA (OTM) ---
  // =========================================================================
  const [selectedOrtuIndex, setSelectedOrtuIndex] = useState<number>(0);
  const [searchKeywordOrtu, setSearchKeywordOrtu] = useState<string>('');
  const [namaPewawancaraOrtu, setNamaPewawancaraOrtu] = useState<string>(
    currentUser?.namaSiswa || ''
  );
  
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
  const [namaPengujiSiswa, setNamaPengujiSiswa] = useState<string>(
    currentUser?.namaSiswa || ''
  );

  const [nilaiTahsin, setNilaiTahsin] = useState<number | ''>('');
  const [catatanTahsin, setCatatanTahsin] = useState('');
  const [nilaiTahfidz, setNilaiTahfidz] = useState<number | ''>('');
  const [juzDiuji, setJuzDiuji] = useState('');
  const [catatanTahfidz, setCatatanTahfidz] = useState('');
  const [nilaiKarakterAdab, setNilaiKarakterAdab] = useState<number | ''>('');
  const [catatanKarakterAdab, setCatatanKarakterAdab] = useState('');
  const [nilaiAkademikDasar, setNilaiAkademikDasar] = useState<number | ''>('');
  const [catatanAkademikDasar, setCatatanAkademikDasar] = useState('');
  const [nilaiPsikotes, setNilaiPsikotes] = useState<number | ''>('');
  const [catatanPsikotes, setCatatanPsikotes] = useState('');
  const [rekomendasiSiswa, setRekomendasiSiswa] = useState<'Diterima' | 'Cadangan' | 'Tidak Diterima' | ''>('');
  const [catatanPengujiSiswa, setCatatanPengujiSiswa] = useState('');
  const [tanggalMaksimalDaftarUlang, setTanggalMaksimalDaftarUlang] = useState<string>('');
  const [tanggalBatasPengunduranDiri, setTanggalBatasPengunduranDiri] = useState<string>(() => gasService.getDefaultBatasPengunduranDiri());
  const [pembiayaanCategories, setPembiayaanCategories] = useState<PembiayaanCategory[]>(() => gasService.getPembiayaanList());
  const [kategoriPembiayaanSiswa, setKategoriPembiayaanSiswa] = useState<string>('');
  const [isRefreshingKategori, setIsRefreshingKategori] = useState<boolean>(false);
  const [kategoriSyncMsg, setKategoriSyncMsg] = useState<string>('');
  const [showRincianPembiayaanModal, setShowRincianPembiayaanModal] = useState<boolean>(false);
  const [showSklKelulusanModal, setShowSklKelulusanModal] = useState<boolean>(false);

  const [savedSiswaResult, setSavedSiswaResult] = useState<ObservasiSiswaData | null>(null);
  const [previewSiswaModal, setPreviewSiswaModal] = useState<ObservasiSiswaData | null>(null);

  const handleRefreshKategoriSheet = async () => {
    setIsRefreshingKategori(true);
    setKategoriSyncMsg('Menarik data dari Sheet "Pembiayaan" di Google Spreadsheet...');
    try {
      const res = await gasService.fetchPembiayaanFromSpreadsheet();
      if (res.success && res.categories && res.categories.length > 0) {
        setPembiayaanCategories(res.categories);
        if (kategoriPembiayaanSiswa && !res.categories.some(c => c.kategori === kategoriPembiayaanSiswa)) {
          setKategoriPembiayaanSiswa('');
        }
        setKategoriSyncMsg(`Alhamdulillah! Berhasil memuat ${res.categories.length} kategori dari Sheet Pembiayaan.`);
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

  useEffect(() => {
    loadStudentList();
    if (gasService.isLiveGasConfigured() && typeof navigator !== 'undefined' && navigator.onLine) {
      handleRefreshKategoriSheet();
    }

    const handleDbUpdate = () => {
      gasService.getStudentList(false).then((updatedList) => {
        setStudents(updatedList);
        const gurus = gasService.getPewawancaraAccounts().map(g => g.namaSiswa).filter(Boolean);
        setDbGuruNames(gurus);
      });
      const freshCategories = gasService.getPembiayaanList();
      if (freshCategories && freshCategories.length > 0) {
        setPembiayaanCategories(freshCategories);
      }
    };

    const handleSwitchTeam = (e: any) => {
      if (e?.detail) {
        setActiveTeam(e.detail);
      }
    };

    window.addEventListener('spmb_db_updated', handleDbUpdate);
    window.addEventListener('storage', handleDbUpdate);
    window.addEventListener('switch_guru_team', handleSwitchTeam);
    return () => {
      window.removeEventListener('spmb_db_updated', handleDbUpdate);
      window.removeEventListener('storage', handleDbUpdate);
      window.removeEventListener('switch_guru_team', handleSwitchTeam);
    };
  }, []);

  useEffect(() => {
    if (currentUser?.namaSiswa) {
      setNamaPewawancaraOrtu(currentUser.namaSiswa);
      setNamaPengujiSiswa(currentUser.namaSiswa);
    }
  }, [currentUser?.namaSiswa]);

  const loadStudentList = async () => {
    // Hanya tampilkan loading jika belum ada data siswa sama sekali di memori
    setLoading(prev => students.length === 0);
    const list = await gasService.getStudentList();
    const gurus = gasService.getPewawancaraAccounts().map(g => g.namaSiswa).filter(Boolean);
    setDbGuruNames(gurus);
    if (currentUser?.namaSiswa) {
      setNamaPewawancaraOrtu(currentUser.namaSiswa);
      setNamaPengujiSiswa(currentUser.namaSiswa);
    }
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

  // Pastikan setiap kali siswa yang sedang diuji berubah (baik karena dipilih maupun pembaruan daftar),
  // form langsung membaca ulang data dari database (atau dikosongkan total jika belum ada di database)
  useEffect(() => {
    if (currentStudentSiswa?.id) {
      loadExistingObservasiSiswa(currentStudentSiswa.id);
    }
  }, [currentStudentSiswa?.id, students]);

  useEffect(() => {
    if (currentStudentOrtu?.id) {
      loadExistingWawancaraOrtu(currentStudentOrtu.id);
    }
  }, [currentStudentOrtu?.id, students]);

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
    if (currentUser?.namaSiswa) {
      setNamaPewawancaraOrtu(currentUser.namaSiswa);
    } else if (existing?.namaPewawancara) {
      setNamaPewawancaraOrtu(existing.namaPewawancara);
    }
    if (existing) {
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
    const existingLulus = gasService.getStatusKelulusan(noPend);
    if (currentUser?.namaSiswa) {
      setNamaPengujiSiswa(currentUser.namaSiswa);
    } else if (existing?.namaPenguji) {
      setNamaPengujiSiswa(existing.namaPenguji);
    }
    if (existing) {
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
      setTanggalBatasPengunduranDiri(
        existing.tanggalBatasPengunduranDiri && existing.tanggalBatasPengunduranDiri !== '-'
          ? existing.tanggalBatasPengunduranDiri
          : gasService.getDefaultBatasPengunduranDiri()
      );
      setKategoriPembiayaanSiswa(existing.kategoriPembiayaan || '');
    } else if (existingLulus && ['LULUS', 'CADANGAN', 'TIDAK_LULUS'].includes(existingLulus.status) && Number(existingLulus.skorAkhir) > 0) {
      // Jika data sudah tersimpan dalam sheet kelulusan (dan sudah dievaluasi oleh guru), website membaca data dari sheet kelulusan
      let mappedRek: 'Diterima' | 'Cadangan' | 'Tidak Diterima' | '' = '';
      if (existingLulus.status === 'LULUS') mappedRek = 'Diterima';
      else if (existingLulus.status === 'CADANGAN') mappedRek = 'Cadangan';
      else if (existingLulus.status === 'TIDAK_LULUS') mappedRek = 'Tidak Diterima';

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
      setRekomendasiSiswa(mappedRek);
      setCatatanPengujiSiswa(existingLulus.pesanPengumuman || '');
      setTanggalMaksimalDaftarUlang(existingLulus.jadwalDaftarUlang && existingLulus.jadwalDaftarUlang !== '-' ? existingLulus.jadwalDaftarUlang : '');
      setTanggalBatasPengunduranDiri(
        existingLulus.tanggalBatasPengunduranDiri && existingLulus.tanggalBatasPengunduranDiri !== '-'
          ? existingLulus.tanggalBatasPengunduranDiri
          : gasService.getDefaultBatasPengunduranDiri()
      );
      setKategoriPembiayaanSiswa(existingLulus.kategoriPembiayaan && existingLulus.kategoriPembiayaan !== '-' ? existingLulus.kategoriPembiayaan : '');
    } else {
      // Benar-benar kosong di awal jika belum diisi dan belum ada di sheet observasi murid
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
      setTanggalBatasPengunduranDiri(gasService.getDefaultBatasPengunduranDiri());
      setKategoriPembiayaanSiswa('');
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

  // Active interviewer & examiner name locked to logged-in user
  const activePewawancaraName = (currentUser?.namaSiswa || namaPewawancaraOrtu || '').trim();
  const activePengujiName = (currentUser?.namaSiswa || namaPengujiSiswa || '').trim();

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

        // Khusus Bagian G: Pernyataan Orang Tua (otomatis terisi dari pernyataan orang tua)
        if (q.id === 'q34' || q.id === 'q35' || q.text.includes('10.000') || q.text.includes('rekayasa')) {
          ansVal = refVal || 'Bersedia / Setuju';
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
      showAppAlert({
        title: 'Pilih Calon Murid Terlebih Dahulu',
        message: 'Silakan pilih calon murid yang akan diwawancarai pada kolom pencarian murid di atas.',
        variant: 'warning',
      });
      return; 
    }
    if (!activePewawancaraName.trim()) { 
      showAppAlert({
        title: 'Nama Pewawancara Belum Diisi',
        message: 'Silakan pilih atau isi nama pewawancara terlebih dahulu sebelum melanjutkan.',
        variant: 'warning',
      });
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
    showAppAlert({
      title: 'Wawancara Berhasil Disahkan',
      message: 'Alhamdulillah! Hasil wawancara dan tanda tangan digital berhasil disahkan & disimpan resmi.',
      subMessage: `Data hasil wawancara Orang Tua untuk ${currentStudentOrtu.nama} (${currentStudentOrtu.id}) telah tersimpan ke database.`,
      variant: 'success',
      confirmText: 'Selesai',
    });

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
    showAppAlert({
      title: 'Draft Wawancara Berhasil Disimpan',
      message: 'Alhamdulillah! Draft wawancara berhasil disimpan.',
      subMessage: 'Dokumen ini sekarang muncul di menu Observasi Ortu pada akun Portal Calon Murid agar dapat direview dan ditandatangani langsung oleh Ayah/Bunda di HP mereka.',
      variant: 'success',
      confirmText: 'Mengerti',
    });
    await loadStudentList();
  };

  // =========================================================================
  // --- SUBMIT TIM 2: OBSERVASI SISWA (TERPISAH & MANDIRI) ---
  // =========================================================================
  const scoresArraySiswa = [nilaiTahsin, nilaiTahfidz, nilaiKarakterAdab, nilaiAkademikDasar, nilaiPsikotes].filter(
    (s): s is number => s !== '' && !isNaN(Number(s))
  );
  const skorTotalSiswa = scoresArraySiswa.length > 0 ? scoresArraySiswa.reduce((a, b) => a + Number(b), 0) : null;
  const rataRataSiswa = scoresArraySiswa.length > 0 ? Number((skorTotalSiswa! / scoresArraySiswa.length).toFixed(1)) : null;

  const handleSubmitObservasiSiswa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentStudentSiswa) {
      showAppAlert({
        title: 'Pilih Calon Murid Terlebih Dahulu',
        message: 'Silakan pilih calon murid yang diuji terlebih dahulu!',
        variant: 'warning',
      });
      return;
    }
    if (!activePengujiName.trim()) {
      showAppAlert({
        title: 'Nama Penguji Belum Diisi',
        message: 'Silakan pilih atau isi nama penguji observasi murid terlebih dahulu!',
        variant: 'warning',
      });
      return;
    }
    if (!rekomendasiSiswa) {
      showAppAlert({
        title: 'Keputusan Rekomendasi Belum Dipilih',
        message: 'Pilih keputusan rekomendasi hasil evaluasi murid (Diterima / Cadangan / Tidak Diterima) terlebih dahulu!',
        subMessage: 'Keputusan rekomendasi diperlukan untuk menetapkan status seleksi di Sheet Kelulusan.',
        variant: 'warning',
        confirmText: 'Pilih Sekarang',
      });
      return;
    }

    setSaving(true);
    const existingSiswa = gasService.getSiswaByNo(currentStudentSiswa.id);
    const existingInduk = gasService.getDataIndukList().find(d => d.noPendaftaran === currentStudentSiswa.id);
    const existingLulus = gasService.getStatusKelulusan(currentStudentSiswa.id);
    const resolvedNisn = (existingSiswa?.nisn && existingSiswa.nisn !== '-') 
      ? existingSiswa.nisn 
      : ((existingInduk?.nisn && existingInduk.nisn !== '-') 
        ? existingInduk.nisn 
        : (existingLulus?.nisn && existingLulus.nisn !== '-' ? existingLulus.nisn : '-'));
    const resolvedAsalSekolah = currentStudentSiswa.sekolah || existingSiswa?.asalSekolah || existingLulus?.asalSekolah || 'SD/MI Pendaftar';

    const payload: ObservasiSiswaData = {
      id: 'OBS-SISWA-' + Date.now(),
      siswaId: currentStudentSiswa.id,
      noPendaftaran: currentStudentSiswa.id,
      nisn: resolvedNisn,
      asalSekolah: resolvedAsalSekolah,
      namaSiswa: currentStudentSiswa.nama,
      namaPenguji: activePengujiName,
      tanggalObservasi: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
      nilaiTahsin: Number(nilaiTahsin) || 0,
      catatanTahsin: catatanTahsin,
      nilaiTahfidz: Number(nilaiTahfidz) || 0,
      juzDiuji: juzDiuji,
      catatanTahfidz: catatanTahfidz,
      nilaiKarakterAdab: Number(nilaiKarakterAdab) || 0,
      catatanKarakterAdab: catatanKarakterAdab,
      nilaiAkademikDasar: Number(nilaiAkademikDasar) || 0,
      catatanAkademikDasar: catatanAkademikDasar,
      nilaiPsikotes: Number(nilaiPsikotes) || 0,
      catatanPsikotes: catatanPsikotes,
      totalSkor: skorTotalSiswa !== null ? skorTotalSiswa : 0,
      rataRata: rataRataSiswa !== null ? rataRataSiswa : 0,
      rekomendasi: rekomendasiSiswa as 'Diterima' | 'Cadangan' | 'Tidak Diterima',
      catatanPenguji: catatanPengujiSiswa,
      tanggalMaksimalDaftarUlang: rekomendasiSiswa === 'Tidak Diterima' ? '-' : (tanggalMaksimalDaftarUlang.trim() || '-'),
      tanggalBatasPengunduranDiri: rekomendasiSiswa === 'Tidak Diterima' ? '-' : (tanggalBatasPengunduranDiri.trim() || '-'),
      kategoriPembiayaan: rekomendasiSiswa === 'Tidak Diterima' ? '' : kategoriPembiayaanSiswa,
      rincianBiaya: (rekomendasiSiswa === 'Tidak Diterima' || !kategoriPembiayaanSiswa) ? undefined : gasService.getPembiayaanByCategory(kategoriPembiayaanSiswa),
      createdAt: new Date().toISOString()
    };

    const res = await gasService.saveObservasiSiswa(payload);
    setSaving(false);
    setSavedSiswaResult(res.data);
    showAppAlert({
      title: 'Lembar Observasi Murid Tersimpan',
      message: res.message,
      subMessage: `Status evaluasi dan rincian pembiayaan untuk ${currentStudentSiswa.nama} (${currentStudentSiswa.id}) telah disinkronkan ke Sheet Observasi & Sheet Kelulusan.`,
      variant: 'success',
      confirmText: 'Selesai',
    });
    await loadStudentList();
  };

  const handleApplyTanggalToAllLulus = async () => {
    const trimmedDaftarUlang = (tanggalMaksimalDaftarUlang || '').trim();
    const trimmedUndurDiri = (tanggalBatasPengunduranDiri || '').trim();
    if (!trimmedDaftarUlang && !trimmedUndurDiri) {
      showAppAlert({
        title: 'Tanggal Belum Diisi',
        message: 'Silakan isi Tanggal Daftar Ulang atau Tanggal Batas Pengunduran Diri terlebih dahulu.',
        variant: 'warning',
      });
      return;
    }

    const confirmed = await showAppConfirm({
      title: 'Terapkan Tanggal ke Semua Murid Diterima?',
      message: 'Apakah Anda yakin ingin menyeragamkan Tanggal Daftar Ulang & Batas Pengunduran Diri ini ke seluruh calon murid berstatus Diterima?',
      subMessage: `Rentang Daftar Ulang: ${trimmedDaftarUlang || '-'} • Batas Pengunduran Diri: ${trimmedUndurDiri || '-'}`,
      variant: 'info',
      confirmText: 'Ya, Terapkan ke Semua',
      cancelText: 'Batal',
    });
    if (!confirmed) return;

    let count = 0;
    if (trimmedDaftarUlang) {
      const res1 = gasService.applyJadwalDaftarUlangToAllLulus(trimmedDaftarUlang);
      count = Math.max(count, res1.count);
    }
    if (trimmedUndurDiri) {
      const res2 = gasService.applyBatasPengunduranDiriToAllLulus(trimmedUndurDiri);
      count = Math.max(count, res2.count);
    }
    showAppAlert({
      title: 'Tanggal Berhasil Diseragamkan',
      message: `Alhamdulillah! Tanggal Daftar Ulang & Batas Pengunduran Diri berhasil diterapkan ke ${count} calon murid berstatus Diterima.`,
      variant: 'success',
    });
  };

  return (
    <div className="space-y-8">
      
      {/* ===================================================================== */}
      {/* TOP BANNER & MODERN 4-CARD MENU NAVIGATION                            */}
      {/* ===================================================================== */}
      <div className="p-5 sm:p-7 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-emerald-950 text-white shadow-xl border border-slate-800/90 space-y-6 relative overflow-hidden">
        {/* Subtle ambient glow */}
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

        {/* Header Row */}
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-300 text-xs font-bold border border-white/15 shadow-2xs">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Menu Pewawancara &amp; Evaluasi SPMB</span>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-200 text-[11px] font-semibold border border-indigo-400/25">
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>SMPIT Pondok Duta</span>
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Evaluasi Seleksi Penerimaan Murid Baru
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
              Panel instrumen evaluasi seleksi murid baru. Silakan pilih salah satu menu kerja di bawah ini untuk mengelola Wawancara OTM, Observasi Murid, Data Induk, atau Pengumuman.
            </p>
          </div>

          {/* Quick Counter Pill */}
          <div className="flex items-center gap-3 self-start md:self-center bg-white/5 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 font-black text-sm">
              {students.length}
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Data Pendaftar</div>
              <div className="text-xs font-extrabold text-white">Calon Murid Terdaftar</div>
            </div>
          </div>
        </div>

        {/* 4 MENU CARDS — FULL WIDTH, NO TRUNCATION, ATTRACTIVE VISUAL CARDS */}
        <div className="relative pt-2 border-t border-white/10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* MENU 1: WAWANCARA OTM */}
            <button
              type="button"
              onClick={() => setActiveTeam('ortu')}
              className={`group relative p-3.5 sm:p-4 rounded-2xl text-left transition-all duration-200 flex items-center gap-3.5 cursor-pointer border ${
                activeTeam === 'ortu'
                  ? 'bg-gradient-to-br from-emerald-600 via-emerald-600 to-teal-700 text-white border-emerald-400/60 shadow-lg shadow-emerald-950/50 ring-2 ring-emerald-400/30 -translate-y-0.5'
                  : 'bg-slate-800/75 hover:bg-slate-800 text-slate-200 border-slate-700/80 hover:border-emerald-500/40'
              }`}
            >
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105 ${
                  activeTeam === 'ortu'
                    ? 'bg-white/20 text-white border border-white/30 shadow-inner'
                    : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/25'
                }`}
              >
                <Users className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1.5">
                  <span
                    className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                      activeTeam === 'ortu'
                        ? 'bg-black/20 text-emerald-100'
                        : 'bg-emerald-500/15 text-emerald-300'
                    }`}
                  >
                    Menu 01
                  </span>
                  {activeTeam === 'ortu' && (
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse shrink-0" />
                  )}
                </div>
                <div className="text-sm font-black text-white mt-1 leading-snug">
                  1. Wawancara OTM
                </div>
                <div
                  className={`text-[11px] mt-0.5 leading-tight ${
                    activeTeam === 'ortu' ? 'text-emerald-100 font-medium' : 'text-slate-400'
                  }`}
                >
                  Wawancara Orang Tua Murid
                </div>
              </div>
            </button>

            {/* MENU 2: OBSERVASI MURID */}
            <button
              type="button"
              onClick={() => setActiveTeam('siswa')}
              className={`group relative p-3.5 sm:p-4 rounded-2xl text-left transition-all duration-200 flex items-center gap-3.5 cursor-pointer border ${
                activeTeam === 'siswa'
                  ? 'bg-gradient-to-br from-indigo-600 via-indigo-600 to-blue-700 text-white border-indigo-400/60 shadow-lg shadow-indigo-950/50 ring-2 ring-indigo-400/30 -translate-y-0.5'
                  : 'bg-slate-800/75 hover:bg-slate-800 text-slate-200 border-slate-700/80 hover:border-indigo-500/40'
              }`}
            >
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105 ${
                  activeTeam === 'siswa'
                    ? 'bg-white/20 text-white border border-white/30 shadow-inner'
                    : 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/25'
                }`}
              >
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1.5">
                  <span
                    className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                      activeTeam === 'siswa'
                        ? 'bg-black/20 text-indigo-100'
                        : 'bg-indigo-500/15 text-indigo-300'
                    }`}
                  >
                    Menu 02
                  </span>
                  {activeTeam === 'siswa' && (
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse shrink-0" />
                  )}
                </div>
                <div className="text-sm font-black text-white mt-1 leading-snug">
                  2. Observasi Murid
                </div>
                <div
                  className={`text-[11px] mt-0.5 leading-tight ${
                    activeTeam === 'siswa' ? 'text-indigo-100 font-medium' : 'text-slate-400'
                  }`}
                >
                  Tahsin, Adab &amp; Akademik
                </div>
              </div>
            </button>

            {/* MENU 3: DATA INDUK */}
            <button
              type="button"
              onClick={() => setActiveTeam('data-induk')}
              className={`group relative p-3.5 sm:p-4 rounded-2xl text-left transition-all duration-200 flex items-center gap-3.5 cursor-pointer border ${
                activeTeam === 'data-induk'
                  ? 'bg-gradient-to-br from-amber-500 via-amber-500 to-orange-500 text-slate-950 border-amber-300 shadow-lg shadow-amber-950/40 ring-2 ring-amber-300/40 -translate-y-0.5'
                  : 'bg-slate-800/75 hover:bg-slate-800 text-slate-200 border-slate-700/80 hover:border-amber-500/40'
              }`}
            >
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105 ${
                  activeTeam === 'data-induk'
                    ? 'bg-slate-950/15 text-slate-950 border border-slate-950/20 shadow-inner'
                    : 'bg-amber-500/15 text-amber-300 border border-amber-500/25'
                }`}
              >
                <Award className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1.5">
                  <span
                    className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                      activeTeam === 'data-induk'
                        ? 'bg-slate-950/15 text-slate-950'
                        : 'bg-amber-500/15 text-amber-300'
                    }`}
                  >
                    Menu 03
                  </span>
                  {activeTeam === 'data-induk' && (
                    <span className="w-2 h-2 rounded-full bg-slate-950 animate-pulse shrink-0" />
                  )}
                </div>
                <div
                  className={`text-sm font-black mt-1 leading-snug ${
                    activeTeam === 'data-induk' ? 'text-slate-950' : 'text-white'
                  }`}
                >
                  3. Data Induk
                </div>
                <div
                  className={`text-[11px] mt-0.5 leading-tight ${
                    activeTeam === 'data-induk' ? 'text-slate-900 font-semibold' : 'text-slate-400'
                  }`}
                >
                  Buku Induk Sekolah &amp; NIS
                </div>
              </div>
            </button>

            {/* MENU 4: PENGUMUMAN */}
            <button
              type="button"
              onClick={() => setActiveTeam('whatsapp')}
              className={`group relative p-3.5 sm:p-4 rounded-2xl text-left transition-all duration-200 flex items-center gap-3.5 cursor-pointer border ${
                activeTeam === 'whatsapp'
                  ? 'bg-gradient-to-br from-teal-600 via-teal-600 to-emerald-700 text-white border-teal-400/60 shadow-lg shadow-teal-950/50 ring-2 ring-teal-400/30 -translate-y-0.5'
                  : 'bg-slate-800/75 hover:bg-slate-800 text-slate-200 border-slate-700/80 hover:border-teal-500/40'
              }`}
            >
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105 ${
                  activeTeam === 'whatsapp'
                    ? 'bg-white/20 text-white border border-white/30 shadow-inner'
                    : 'bg-teal-500/15 text-teal-300 border border-teal-500/25'
                }`}
              >
                <MessageCircle className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1.5">
                  <span
                    className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                      activeTeam === 'whatsapp'
                        ? 'bg-black/20 text-teal-100'
                        : 'bg-teal-500/15 text-teal-300'
                    }`}
                  >
                    Menu 04
                  </span>
                  {activeTeam === 'whatsapp' && (
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse shrink-0" />
                  )}
                </div>
                <div className="text-sm font-black text-white mt-1 leading-snug">
                  4. Pengumuman
                </div>
                <div
                  className={`text-[11px] mt-0.5 leading-tight ${
                    activeTeam === 'whatsapp' ? 'text-teal-100 font-medium' : 'text-slate-400'
                  }`}
                >
                  Kirim WA &amp; Pantau Seleksi
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* TIM 1: WAWANCARA ORANG TUA (OTM) - STANDALONE VIEW                     */}
      {/* ===================================================================== */}
      {activeTeam === 'ortu' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* CONTROL PANEL 1: PENCARIAN KATA KUNCI + PILIH NAMA PEWAWANCARA DARI LIST */}
          <div className="p-6 rounded-3xl bg-[#dceefc] border border-[#b6d4fe] text-xs space-y-5 shadow-xs">
            
            {/* ROW 1: PENCARIAN & PILIHAN MURID TERGABUNG (COMBOBOX) */}
            <div className="space-y-2">
              <StudentSearchCombobox
                students={students}
                selectedStudentId={currentStudentOrtu?.id || ''}
                onSelectStudent={(id) => {
                  const origIndex = students.findIndex(s => s.id === id);
                  if (origIndex >= 0) handleSelectStudentOrtu(origIndex);
                }}
                label="Cari & Pilih Calon Murid (Nama / No. Reg / Asal Sekolah / Orang Tua):"
                placeholder="Ketik kata kunci nama murid, nomor registrasi, asal sekolah, atau orang tua..."
                theme="blue"
                statusMode="wawancara"
              />

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

              {/* Keterangan Status Wawancara Sebelumnya (Tombol atas dihapus sesuai instruksi user) */}
              {currentStudentOrtu?.existingPdf && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 flex items-center gap-3 animate-in fade-in shadow-2xs">
                  <div className="p-2 bg-emerald-600 text-white rounded-xl shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div className="text-xs">
                    <span className="font-bold text-emerald-900">Orang tua calon murid ini sudah selesai diwawancara.</span>
                    <span className="text-emerald-700 ml-1">Hasil wawancara dan tanda tangan tersimpan di sistem. Anda dapat memperbarui isian jika diperlukan, atau mencetak PDF melalui tombol di bawah formulir.</span>
                  </div>
                </div>
              )}
            </div>

            {/* ROW 2: IDENTITAS SISWA & NAMA PEWAWANCARA TERKUNCI SESUAI LOGIN */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-blue-200/60">
              
              {/* Nama Pewawancara (Dikunci sesuai akun login user) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-600" />
                  <span>Nama Pewawancara (Sesuai Login):</span>
                </label>
                <input
                  type="text"
                  readOnly
                  value={activePewawancaraName || '-'}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-200/80 text-slate-700 cursor-not-allowed font-bold text-xs"
                />
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
                    {(() => {
                      let curHeader = '';
                      return QUESTIONS_CONFIG.map((q, index) => {
                        if (q.type === 'header') {
                          curHeader = q.text;
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

                        const isSectionEF = !isCatatanKhusus && (
                          curHeader.includes('E. SIMULASI PERATURAN') || 
                          curHeader.includes('F. INFORMASI LAINNYA') ||
                          ['i2', 'i3', 'i4', 'i5', 'i9', 'i10', 'i6', 'i7', 'i8'].includes(q.id)
                        );
                        const isSectionG = !isCatatanKhusus && (
                          curHeader.includes('G. PERNYATAAN ORANG TUA') ||
                          ['q34', 'q35'].includes(q.id)
                        );

                        // Bagian E & F: Kolom isian jawaban dipindahkan ke bawah pertanyaan tanpa kolom kosong
                        if (isSectionEF) {
                          return (
                            <tr key={index} className="hover:bg-slate-50/80">
                              <td colSpan={3} className="p-3.5 align-top space-y-2">
                                <div className="font-semibold text-[#2c3e50] leading-relaxed whitespace-pre-line text-xs">
                                  {q.text}
                                </div>
                                <textarea
                                  rows={2}
                                  value={ortuAnswers[index] || ''}
                                  onChange={(e) => setOrtuAnswers({ ...ortuAnswers, [index]: e.target.value })}
                                  placeholder="Jawaban / Catatan wawancara..."
                                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white shadow-2xs"
                                />
                                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                                  <span className="text-[10px] text-slate-400 font-semibold">Pilih Cepat:</span>
                                  {['Sesuai', 'Sudah dijelaskan', 'Mengikuti Peraturan Sekolah'].map((quickOption) => (
                                    <button
                                      type="button"
                                      key={quickOption}
                                      onClick={() => setOrtuAnswers({ ...ortuAnswers, [index]: quickOption })}
                                      className={`px-2.5 py-1 text-[11px] rounded-lg font-medium border transition cursor-pointer ${
                                        ortuAnswers[index] === quickOption
                                          ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                                          : 'bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border-slate-200 hover:border-blue-300'
                                      }`}
                                    >
                                      + {quickOption}
                                    </button>
                                  ))}
                                </div>
                              </td>
                            </tr>
                          );
                        }

                        // Bagian G: Hilangkan kotak isian jawaban, isian orang tua diletakkan di bawah pertanyaan
                        if (isSectionG) {
                          return (
                            <tr key={index} className="hover:bg-slate-50/80 bg-emerald-50/30">
                              <td colSpan={3} className="p-3.5 align-top space-y-1.5">
                                <div className="font-semibold text-[#2c3e50] leading-relaxed whitespace-pre-line text-xs">
                                  {q.text}
                                </div>
                                <div className="flex items-center gap-2 pt-0.5">
                                  <span className="text-[11px] font-bold text-slate-500">Pernyataan / Isian Orang Tua:</span>
                                  <span className="px-3 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-300 shadow-2xs">
                                    {refText || 'Bersedia / Setuju'}
                                  </span>
                                </div>
                              </td>
                            </tr>
                          );
                        }

                        // Catatan Khusus Pewawancara (Pindahkan isian ke bawah, hilangkan kolom kosong)
                        if (isCatatanKhusus) {
                          return (
                            <tr key={index} className="hover:bg-amber-50/50 bg-amber-50/30 border-y-2 border-amber-300">
                              <td colSpan={3} className="p-3.5 align-top space-y-2">
                                <div className="font-bold text-amber-950 leading-relaxed whitespace-pre-line text-xs flex items-center gap-1.5">
                                  <span>📌 {q.text}</span>
                                </div>
                                <textarea
                                  rows={3}
                                  value={catatanKhususOrtu}
                                  onChange={(e) => setCatatanKhususOrtu(e.target.value)}
                                  placeholder="Catatan internal penguji (rekomendasi khusus, aspek komitmen finansial/moral, catatan rahasia)..."
                                  className="w-full p-2.5 rounded-xl border border-amber-400 bg-white text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none shadow-2xs"
                                />
                              </td>
                            </tr>
                          );
                        }

                        // Bagian Standar (A, B, C, D)
                        return (
                          <tr 
                            key={index} 
                            className="hover:bg-slate-50/80"
                          >
                            <td className="p-3 align-top font-semibold text-[#2c3e50] leading-relaxed">
                              <div className="flex items-start gap-1.5">
                                <span>{q.text}</span>
                              </div>
                            </td>
                            <td className="p-3 align-top bg-[#f8f9fa] border-r border-slate-200 text-slate-700 text-[11px] leading-relaxed">
                              {refText}
                            </td>
                            <td className="p-3 align-top space-y-1.5">
                              <textarea
                                rows={2}
                                value={ortuAnswers[index] || ''}
                                onChange={(e) => setOrtuAnswers({ ...ortuAnswers, [index]: e.target.value })}
                                placeholder="Jawaban / Catatan wawancara..."
                                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white shadow-2xs"
                              />
                              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                                <span className="text-[10px] text-slate-400 font-semibold">Pilih Cepat:</span>
                                {['Sesuai', 'Sudah dijelaskan', 'Mengikuti Peraturan Sekolah'].map((quickOption) => (
                                  <button
                                    type="button"
                                    key={quickOption}
                                    onClick={() => setOrtuAnswers({ ...ortuAnswers, [index]: quickOption })}
                                    className={`px-2 py-0.5 text-[10.5px] rounded-lg font-medium border transition cursor-pointer ${
                                      ortuAnswers[index] === quickOption
                                        ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                                        : 'bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border-slate-200 hover:border-blue-300'
                                    }`}
                                  >
                                    + {quickOption}
                                  </button>
                                ))}
                              </div>
                            </td>
                          </tr>
                        );
                      });
                    })()}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="block md:hidden space-y-4">
                {(() => {
                  let curMobileHeader = '';
                  return QUESTIONS_CONFIG.map((q, index) => {
                    if (q.type === 'header') {
                      curMobileHeader = q.text;
                      return (
                        <div key={index} className="bg-[#7f8c8d] text-white p-2.5 rounded-xl font-bold text-center text-xs">
                          {q.text}
                        </div>
                      );
                    }

                    const isCatatanKhusus = q.id === 'catatan' || q.text.includes('CATATAN KHUSUS');
                    const refText = getRefValue(q.refId);

                    const isSectionEF = !isCatatanKhusus && (
                      curMobileHeader.includes('E. SIMULASI PERATURAN') || 
                      curMobileHeader.includes('F. INFORMASI LAINNYA') ||
                      ['i2', 'i3', 'i4', 'i5', 'i9', 'i10', 'i6', 'i7', 'i8'].includes(q.id)
                    );
                    const isSectionG = !isCatatanKhusus && (
                      curMobileHeader.includes('G. PERNYATAAN ORANG TUA') ||
                      ['q34', 'q35'].includes(q.id)
                    );

                    if (isSectionEF) {
                      return (
                        <div key={index} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2.5">
                          <div className="font-bold text-xs text-slate-900 leading-relaxed whitespace-pre-line">
                            {q.text}
                          </div>
                          <textarea
                            rows={3}
                            value={ortuAnswers[index] || ''}
                            onChange={(e) => setOrtuAnswers({ ...ortuAnswers, [index]: e.target.value })}
                            placeholder="Jawaban / Catatan wawancara..."
                            className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-blue-500 shadow-2xs"
                          />
                          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                            <span className="text-[10px] text-slate-400 font-semibold">Pilih Cepat:</span>
                            {['Sesuai', 'Sudah dijelaskan', 'Mengikuti Peraturan Sekolah'].map((quickOption) => (
                              <button
                                type="button"
                                key={quickOption}
                                onClick={() => setOrtuAnswers({ ...ortuAnswers, [index]: quickOption })}
                                className={`px-2 py-0.5 text-[10.5px] rounded-lg font-medium border transition cursor-pointer ${
                                  ortuAnswers[index] === quickOption
                                    ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                                    : 'bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border-slate-200 hover:border-blue-300'
                                }`}
                              >
                                + {quickOption}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    }

                    if (isSectionG) {
                      return (
                        <div key={index} className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/40 space-y-2">
                          <div className="font-bold text-xs text-slate-900 leading-relaxed whitespace-pre-line">
                            {q.text}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10.5px] font-bold text-slate-500">Pernyataan Orang Tua:</span>
                            <span className="px-2.5 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-300">
                              {refText || 'Bersedia / Setuju'}
                            </span>
                          </div>
                        </div>
                      );
                    }

                    // Catatan Khusus Pewawancara (Mobile)
                    if (isCatatanKhusus) {
                      return (
                        <div key={index} className="p-4 rounded-2xl border border-amber-400 bg-amber-50/50 space-y-2.5">
                          <div className="font-bold text-xs text-amber-950 leading-relaxed whitespace-pre-line flex items-center gap-1.5">
                            <span>📌 {q.text}</span>
                          </div>
                          <textarea
                            rows={3}
                            value={catatanKhususOrtu}
                            onChange={(e) => setCatatanKhususOrtu(e.target.value)}
                            placeholder="Catatan internal penguji (rekomendasi khusus, aspek komitmen finansial/moral, catatan rahasia)..."
                            className="w-full p-2.5 rounded-xl border border-amber-300 text-xs bg-white focus:ring-2 focus:ring-amber-500 shadow-2xs"
                          />
                        </div>
                      );
                    }

                    return (
                      <div 
                        key={index} 
                        className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3"
                      >
                        <div className="font-bold text-xs text-slate-900">
                          {q.text}
                        </div>
                        <div className="text-[11px] bg-white p-2.5 rounded-xl border border-slate-200 text-slate-700">
                          <span className="font-semibold text-slate-400 block text-[10px]">Data Ortu (Ref):</span>
                          {refText}
                        </div>
                        <div className="space-y-1.5">
                          <textarea
                            rows={3}
                            value={ortuAnswers[index] || ''}
                            onChange={(e) => setOrtuAnswers({ ...ortuAnswers, [index]: e.target.value })}
                            placeholder="Jawaban / Catatan wawancara..."
                            className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-blue-500"
                          />
                          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                            <span className="text-[10px] text-slate-400 font-semibold">Pilih Cepat:</span>
                            {['Sesuai', 'Sudah dijelaskan', 'Mengikuti Peraturan Sekolah'].map((quickOption) => (
                              <button
                                type="button"
                                key={quickOption}
                                onClick={() => setOrtuAnswers({ ...ortuAnswers, [index]: quickOption })}
                                className={`px-2 py-0.5 text-[10.5px] rounded-lg font-medium border transition cursor-pointer ${
                                  ortuAnswers[index] === quickOption
                                    ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                                    : 'bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border-slate-200 hover:border-blue-300'
                                }`}
                              >
                                + {quickOption}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  });
                })()}
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
                  Klik tombol di samping untuk mereview lembar PDF bersama orang tua dan menandatangani secara digital.
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
                    <span>Pratinjau &amp; Tanda Tangan</span>
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
                  Lembar Penilaian Observasi Murid
                </h2>
                <div className="text-xs text-slate-600 font-medium">
                  <strong>Khusus Tim Penguji Murid:</strong> Pengujian kemampuan membaca Al-Qur'an (Tahsin), hafalan (Tahfidz), adab/karakter, serta nalar akademik dasar.
                </div>
              </div>
            </div>
          </div>

          {/* CONTROL PANEL 2: PENCARIAN KATA KUNCI SISWA & PILIH PENGUJI DARI LIST */}
          <div className="p-6 rounded-3xl bg-indigo-50/50 border border-indigo-200/80 text-xs space-y-5 shadow-xs">
            
            {/* PENCARIAN & PILIHAN MURID OBSERVASI TERGABUNG (COMBOBOX) */}
            <StudentSearchCombobox
              students={students}
              selectedStudentId={currentStudentSiswa?.id || ''}
              onSelectStudent={(id) => {
                const origIndex = students.findIndex(s => s.id === id);
                if (origIndex >= 0) handleSelectStudentSiswa(origIndex);
              }}
              label="Cari & Pilih Murid yang Sedang Diuji (Nama / No. Reg / Asal Sekolah):"
              placeholder="Ketik nama murid, nomor registrasi, atau asal sekolah..."
              theme="indigo"
              statusMode="observasi"
            />

            {/* BARIS PENGUJI OBSERVASI SISWA (DIKUNCI SESUAI LOGIN USER) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-indigo-200/60">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-600" />
                  <span>Nama Penguji Murid (Sesuai Login):</span>
                </label>
                <input
                  type="text"
                  readOnly
                  value={activePengujiName || '-'}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-200/80 text-slate-700 cursor-not-allowed font-bold text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Asal Sekolah Murid:</label>
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
                    Rubrik Penilaian Kompetensi Murid Baru
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

              {/* Rubrik Penilaian Murid */}
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
                        placeholder="-"
                        value={nilaiTahsin}
                        onChange={(e) => setNilaiTahsin(e.target.value === '' ? '' : Number(e.target.value))}
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
                        placeholder="Juz yang diuji (contoh: Juz 30)"
                        className="text-[11px] font-semibold text-indigo-700 bg-white px-2 py-0.5 rounded border border-slate-200 mt-1"
                      />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <label className="font-semibold text-slate-600">Skor:</label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        placeholder="-"
                        value={nilaiTahfidz}
                        onChange={(e) => setNilaiTahfidz(e.target.value === '' ? '' : Number(e.target.value))}
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
                        placeholder="-"
                        value={nilaiKarakterAdab}
                        onChange={(e) => setNilaiKarakterAdab(e.target.value === '' ? '' : Number(e.target.value))}
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
                        placeholder="-"
                        value={nilaiAkademikDasar}
                        onChange={(e) => setNilaiAkademikDasar(e.target.value === '' ? '' : Number(e.target.value))}
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

                {/* 5. Psikotes */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5 md:col-span-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 block">5. Psikotes &amp; Potensi Belajar</span>
                      <span className="text-[11px] text-slate-500">Kematangan belajar, daya tangkap, adaptasi sosial &amp; profil psikologis</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <label className="font-semibold text-slate-600">Skor:</label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        placeholder="-"
                        value={nilaiPsikotes}
                        onChange={(e) => setNilaiPsikotes(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-16 px-2 py-1 rounded-lg border border-slate-300 bg-white font-bold text-center text-emerald-800"
                      />
                    </div>
                  </div>
                  <textarea
                    rows={2}
                    value={catatanPsikotes}
                    onChange={(e) => setCatatanPsikotes(e.target.value)}
                    placeholder="Catatan psikotes: konsentrasi, kematangan emosi, stabilitas belajar, kepribadian..."
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white"
                  />
                </div>
              </div>

              {/* Rekomendasi Hasil Evaluasi Siswa */}
              <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <span className="font-bold text-slate-900 block text-xs">
                    Rekomendasi Tim Penguji Murid:
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
                    <div className="text-base font-extrabold text-indigo-900">{skorTotalSiswa !== null ? skorTotalSiswa : '-'}</div>
                  </div>
                  <div className="h-6 w-px bg-slate-200" />
                  <div className="text-center px-2">
                    <div className="text-[10px] font-bold text-slate-400">Rata-Rata</div>
                    <div className="text-base font-extrabold text-emerald-700">{rataRataSiswa !== null ? rataRataSiswa : '-'}</div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Catatan Khusus Penguji Murid:
                </label>
                <textarea
                  rows={2}
                  value={catatanPengujiSiswa}
                  onChange={(e) => setCatatanPengujiSiswa(e.target.value)}
                  placeholder="Catatan rekomendasi kelas khusus tahfidz/sains, minat bakat, hal yang perlu pembinaan..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white"
                />
              </div>

              {/* Menu Input Tanggal Daftar Ulang dan Batas Pengunduran Diri (Berdampingan dalam 1 Kotak) */}
              <div className={`p-4 sm:p-5 rounded-2xl border-2 space-y-3 shadow-xs transition ${
                rekomendasiSiswa === 'Tidak Diterima'
                  ? 'bg-slate-100 border-slate-300 opacity-75'
                  : 'bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border-emerald-400'
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-xl text-white shrink-0 shadow-xs ${
                      rekomendasiSiswa === 'Tidak Diterima' ? 'bg-slate-500' : 'bg-emerald-600'
                    }`}>
                      {rekomendasiSiswa === 'Tidak Diterima' ? <Lock className="w-4 h-4" /> : <Calendar className="w-4 h-4" />}
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-extrabold text-emerald-950 flex items-center gap-1.5 flex-wrap">
                        <span>Tanggal Daftar Ulang dan Batas Pengunduran Diri</span>
                        {rekomendasiSiswa === 'Tidak Diterima' ? (
                          <span className="text-[10px] font-bold text-rose-800 bg-rose-100 px-2 py-0.5 rounded-md border border-rose-300 inline-flex items-center gap-1">
                            <Lock className="w-3 h-3" />
                            <span>Terkunci (Tidak Diterima)</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-md border border-emerald-300">
                            Integrasi Surat Keterangan Hasil Seleksi
                          </span>
                        )}
                      </h4>
                      <p className="text-[11px] text-slate-600 leading-snug">
                        {rekomendasiSiswa === 'Tidak Diterima'
                          ? 'Kolom tanggal daftar ulang dan batas pengunduran diri dikunci otomatis karena murid berstatus "Tidak Diterima".'
                          : 'Jadwal daftar ulang (Poin 2) dan batas pengunduran diri (Poin 5) otomatis tercetak resmi di dokumen PDF Surat Keterangan Hasil Seleksi.'}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={rekomendasiSiswa === 'Tidak Diterima'}
                    onClick={handleApplyTanggalToAllLulus}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed text-white text-[11px] font-bold transition shadow-xs flex items-center gap-1.5 shrink-0 cursor-pointer self-start sm:self-auto"
                    title="Terapkan tanggal daftar ulang & batas pengunduran diri ini untuk semua calon murid berstatus Diterima/Lulus"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Terapkan ke Semua Murid Lulus</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-bold text-emerald-950 mb-1">
                      Tanggal Daftar Ulang:
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        disabled={rekomendasiSiswa === 'Tidak Diterima'}
                        value={rekomendasiSiswa === 'Tidak Diterima' ? '- (Tidak Diterima - Terkunci)' : tanggalMaksimalDaftarUlang}
                        onChange={(e) => setTanggalMaksimalDaftarUlang(e.target.value)}
                        placeholder="Contoh: 29 Oktober - 12 November 2026"
                        className="w-full pl-3 pr-8 py-2.5 rounded-xl border border-emerald-400 disabled:border-slate-300 bg-white disabled:bg-slate-200/80 font-bold text-xs text-emerald-950 disabled:text-slate-500 disabled:cursor-not-allowed focus:ring-2 focus:ring-emerald-500 shadow-2xs"
                      />
                      {rekomendasiSiswa === 'Tidak Diterima' ? (
                        <Lock className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      ) : (
                        <Calendar className="w-4 h-4 text-emerald-600 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-emerald-950 mb-1">
                      Tanggal Batas Pengunduran Diri:
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        disabled={rekomendasiSiswa === 'Tidak Diterima'}
                        value={rekomendasiSiswa === 'Tidak Diterima' ? '- (Tidak Diterima - Terkunci)' : tanggalBatasPengunduranDiri}
                        onChange={(e) => {
                          setTanggalBatasPengunduranDiri(e.target.value);
                          gasService.setDefaultBatasPengunduranDiri(e.target.value);
                        }}
                        placeholder="Contoh: 30 Juni 2027"
                        className="w-full pl-3 pr-8 py-2.5 rounded-xl border border-emerald-400 disabled:border-slate-300 bg-white disabled:bg-slate-200/80 font-bold text-xs text-emerald-950 disabled:text-slate-500 disabled:cursor-not-allowed focus:ring-2 focus:ring-emerald-500 shadow-2xs"
                      />
                      {rekomendasiSiswa === 'Tidak Diterima' ? (
                        <Lock className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      ) : (
                        <Calendar className="w-4 h-4 text-emerald-600 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Pilihan Rincian Daftar Ulang - Terkunci jika Tidak Diterima */}
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
                        <span>Pilihan Rincian Daftar Ulang</span>
                        {rekomendasiSiswa === 'Tidak Diterima' && (
                          <span className="text-[10px] font-bold text-rose-800 bg-rose-100 px-2 py-0.5 rounded-md border border-rose-300 inline-flex items-center gap-1">
                            <Lock className="w-3 h-3" />
                            <span>Terkunci &amp; Tanpa Lampiran PDF</span>
                          </span>
                        )}
                      </h4>
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
                  </div>
                </div>

                {/* Dropdown Pemilihan Kategori Rujukan */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between gap-2">
                    <label className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5 flex-wrap">
                      <Tag className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Pilih Kategori Rujukan Pembiayaan Murid:</span>
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
                    value={rekomendasiSiswa === 'Tidak Diterima' ? '' : kategoriPembiayaanSiswa}
                    onChange={(e) => setKategoriPembiayaanSiswa(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-indigo-300 disabled:border-slate-300 bg-white disabled:bg-slate-200/80 font-bold text-xs text-indigo-950 disabled:text-slate-500 disabled:cursor-not-allowed focus:ring-2 focus:ring-indigo-500 shadow-2xs cursor-pointer"
                  >
                    {rekomendasiSiswa === 'Tidak Diterima' ? (
                      <option value="">🔒 Terkunci — Murid Berstatus Tidak Diterima (Tanpa Lampiran Pembiayaan)</option>
                    ) : pembiayaanCategories.length === 0 ? (
                      <option value="">
                        {isRefreshingKategori
                          ? '⏳ Sedang menarik kategori dari Sheet Pembiayaan di Google Spreadsheet...'
                          : '⚠️ Belum ada kategori dari database. Klik tombol "Tarik Kategori dari Sheet" di atas'}
                      </option>
                    ) : (
                      <>
                        <option value="">-- Belum Dipilih / Pilih Kategori Pembiayaan Murid --</option>
                        {pembiayaanCategories.map((c, i) => {
                          const numberedLabel = /^\d+\./.test(c.kategori.trim()) ? c.kategori : `${i + 1}. ${c.kategori}`;
                          return (
                            <option key={i} value={c.kategori}>
                              {numberedLabel}
                            </option>
                          );
                        })}
                      </>
                    )}
                  </select>
                </div>

                {/* Ringkasan Live Biaya Kategori Terpilih */}
                {rekomendasiSiswa === 'Tidak Diterima' ? (
                  <div className="p-3.5 rounded-xl bg-rose-50/80 border border-rose-200 text-rose-900 text-xs flex items-center gap-2.5 font-medium">
                    <Lock className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>
                      Rincian pembiayaan dinonaktifkan karena rekomendasi murid adalah <strong>Tidak Diterima</strong>. Saat murid/orang tua mengunduh PDF hasil pengumuman, <strong>Lampiran Pembiayaan (Lembar ke-2) otomatis ditiadakan</strong>.
                    </span>
                  </div>
                ) : !kategoriPembiayaanSiswa ? (
                  <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2 font-medium">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Silakan pilih kategori pembiayaan di atas untuk menampilkan rincian biaya daftar ulang murid baru.</span>
                  </div>
                ) : (() => {
                  const currCat = gasService.getPembiayaanByCategory(kategoriPembiayaanSiswa);
                  return (
                    <>
                      <div className="p-3.5 rounded-xl bg-white border border-indigo-200 grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs shadow-2xs">
                        <div>
                          <span className="text-[10px] text-slate-500 block">Subtotal I (Gedung/BPP/Seragam):</span>
                          <span className="font-mono font-bold text-slate-800">{formatRupiah(currCat.subtotalI)}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block">Subtotal II (Kegiatan/Buku/KBM):</span>
                          <span className="font-mono font-bold text-slate-800">{formatRupiah(currCat.subtotalII)}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block">SPP Juli (Flat 3 Thn):</span>
                          <span className="font-mono font-bold text-slate-800">{formatRupiah(currCat.spp)}</span>
                        </div>
                        <div className="bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                          <span className="text-[10px] text-emerald-800 font-bold block">Total Biaya Daftar Ulang:</span>
                          <span className="font-mono font-black text-emerald-900 text-sm">{formatRupiah(currCat.totalBiaya)}</span>
                        </div>
                      </div>
                      {currCat.catatan && (
                        <div className="flex items-center gap-2 text-[11px] text-indigo-900 bg-indigo-100/70 p-2 rounded-lg border border-indigo-200">
                          <BadgePercent className="w-3.5 h-3.5 text-indigo-700 shrink-0" />
                          <span><strong>Catatan:</strong> {currCat.catatan}</span>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>

              {/* Actions */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                <span className="text-[11px] text-slate-400">
                  Data tersimpan mandiri di sheet Observasi_Siswa &amp; terintegrasi ke Surat Keterangan Hasil Seleksi murid.
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setShowSklKelulusanModal(true)}
                    className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                  >
                    <GraduationCap className="w-4 h-4" />
                    <span>Pratinjau Surat Keterangan Hasil Seleksi</span>
                  </button>
                  <button
                    type="submit"
                    disabled={saving || !currentStudentSiswa}
                    className="px-6 py-2.5 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition disabled:opacity-50 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>{saving ? 'Menyimpan...' : 'Simpan Lembar Observasi Murid'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!currentStudentSiswa) return;
                      const obs = gasService.getObservasiSiswa(currentStudentSiswa.id);
                      if (obs) setPreviewSiswaModal(obs);
                      else {
                        const existingSiswa = gasService.getSiswaByNo(currentStudentSiswa.id);
                        const existingInduk = gasService.getDataIndukList().find(d => d.noPendaftaran === currentStudentSiswa.id);
                        const existingLulus = gasService.getStatusKelulusan(currentStudentSiswa.id);
                        const resolvedNisn = (existingSiswa?.nisn && existingSiswa.nisn !== '-') 
                          ? existingSiswa.nisn 
                          : ((existingInduk?.nisn && existingInduk.nisn !== '-') 
                            ? existingInduk.nisn 
                            : (existingLulus?.nisn && existingLulus.nisn !== '-' ? existingLulus.nisn : '-'));
                        const resolvedAsalSekolah = currentStudentSiswa.sekolah || existingSiswa?.asalSekolah || existingLulus?.asalSekolah || 'SD/MI Pendaftar';
                        setPreviewSiswaModal({
                          id: 'OBS-DRAFT',
                          siswaId: currentStudentSiswa.id,
                          noPendaftaran: currentStudentSiswa.id,
                          nisn: resolvedNisn,
                          asalSekolah: resolvedAsalSekolah,
                          namaSiswa: currentStudentSiswa.nama,
                          namaPenguji: activePengujiName,
                          tanggalObservasi: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
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
                          totalSkor: skorTotalSiswa !== null ? skorTotalSiswa : 0,
                          rataRata: rataRataSiswa !== null ? rataRataSiswa : 0,
                          rekomendasi: (rekomendasiSiswa || 'Cadangan') as any,
                          catatanPenguji: catatanPengujiSiswa,
                          tanggalMaksimalDaftarUlang: rekomendasiSiswa === 'Tidak Diterima' ? '-' : (tanggalMaksimalDaftarUlang.trim() || '-'),
                          tanggalBatasPengunduranDiri: rekomendasiSiswa === 'Tidak Diterima' ? '-' : (tanggalBatasPengunduranDiri.trim() || '-'),
                          kategoriPembiayaan: rekomendasiSiswa === 'Tidak Diterima' ? '' : kategoriPembiayaanSiswa,
                          rincianBiaya: (rekomendasiSiswa === 'Tidak Diterima' || !kategoriPembiayaanSiswa) ? undefined : gasService.getPembiayaanByCategory(kategoriPembiayaanSiswa),
                          createdAt: new Date().toISOString()
                        });
                      }
                    }}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-emerald-600" />
                    <span>Lembar Observasi Resmi</span>
                  </button>
                </div>
              </div>

            </div>
          </form>

        </div>
      )}

      {/* ===================================================================== */}
      {/* TIM 3: DATA INDUK SEKOLAH (BUKU INDUK MURID RESMI TANPA JSON)          */}
      {/* ===================================================================== */}
      {activeTeam === 'data-induk' && (
        <DataIndukSekolahTab
          students={students}
          currentUser={currentUser}
          onRefreshStudentList={loadStudentList}
        />
      )}

      {/* ===================================================================== */}
      {/* MENU 4: PENGIRIMAN INFORMASI KELULUSAN VIA WHATSAPP (ACUAN NOMOR AKUN) */}
      {/* ===================================================================== */}
      {activeTeam === 'whatsapp' && (
        <WhatsappKelulusanTab
          currentUser={currentUser}
        />
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

      {/* ===================================================================== */}
      {/* MODAL 4: PRATINJAU RINCIAN PEMBIAYAAN DAFTAR ULANG LEMBAR KE-2        */}
      {/* ===================================================================== */}
      {showRincianPembiayaanModal && currentStudentSiswa && rekomendasiSiswa !== 'Tidak Diterima' && (
        <RincianPembiayaanModal
          siswa={{
            noPendaftaran: currentStudentSiswa.id,
            namaLengkap: currentStudentSiswa.nama,
            asalSekolah: currentStudentSiswa.sekolah
          }}
          selectedKategori={kategoriPembiayaanSiswa}
          onSelectKategori={(k) => setKategoriPembiayaanSiswa(k)}
          onClose={() => setShowRincianPembiayaanModal(false)}
          onOpenFullSklPreview={() => {
            setShowRincianPembiayaanModal(false);
            setShowSklKelulusanModal(true);
          }}
          tanggalDaftarUlang={tanggalMaksimalDaftarUlang}
          tanggalBatasPengunduranDiri={tanggalBatasPengunduranDiri}
        />
      )}

      {/* ===================================================================== */}
      {/* MODAL 5: PRATINJAU SURAT KETERANGAN LULUS (SKL) RESMI                 */}
      {/* ===================================================================== */}
      {showSklKelulusanModal && currentStudentSiswa && (
        <SklKelulusanPrintModal
          data={{
            noPendaftaran: currentStudentSiswa.id,
            namaLengkap: currentStudentSiswa.nama,
            asalSekolah: currentStudentSiswa.sekolah,
            status: rekomendasiSiswa === 'Diterima' ? 'LULUS' : (rekomendasiSiswa === 'Cadangan' ? 'CADANGAN' : 'TIDAK_LULUS'),
            jadwalDaftarUlang: rekomendasiSiswa === 'Tidak Diterima' ? '-' : tanggalMaksimalDaftarUlang,
            tanggalBatasPengunduranDiri: rekomendasiSiswa === 'Tidak Diterima' ? '-' : tanggalBatasPengunduranDiri,
            kategoriPembiayaan: rekomendasiSiswa === 'Tidak Diterima' ? '' : kategoriPembiayaanSiswa
          }}
          onClose={() => setShowSklKelulusanModal(false)}
          onOpenRincianKategori={rekomendasiSiswa !== 'Tidak Diterima' ? () => {
            setShowSklKelulusanModal(false);
            setShowRincianPembiayaanModal(true);
          } : undefined}
        />
      )}

    </div>
  );
};
