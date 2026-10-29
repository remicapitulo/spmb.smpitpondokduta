import React, { useState, useEffect, useMemo } from 'react';
import { gasService, formatPhoneNumberForWa } from '../../services/gasService';
import { MuridLulusWaItem, UserAccount } from '../../types';
import { showAppAlert, showAppConfirm } from '../../components/AppDialogModal';
import { 
  MessageCircle, 
  Send, 
  CheckCircle2, 
  Clock, 
  Search, 
  RefreshCw, 
  Copy, 
  Check, 
  ExternalLink, 
  Edit3, 
  Smartphone, 
  ShieldCheck, 
  FileText, 
  X, 
  XCircle,
  UserCheck, 
  AlertCircle, 
  Sliders, 
  RotateCcw
} from 'lucide-react';

interface Props {
  currentUser?: UserAccount | null;
  onOpenCekKelulusan?: (noPendaftaran: string) => void;
}

export const WhatsappKelulusanTab: React.FC<Props> = ({ currentUser, onOpenCekKelulusan }) => {
  const [muridList, setMuridList] = useState<MuridLulusWaItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'sent' | 'pending'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal State
  const [previewStudent, setPreviewStudent] = useState<MuridLulusWaItem | null>(null);
  const [previewMessageText, setPreviewMessageText] = useState<string>('');
  const [showTemplateModal, setShowTemplateModal] = useState<boolean>(false);
  const [editingTemplate, setEditingTemplate] = useState<string>('');
  const [editingPhoneStudent, setEditingPhoneStudent] = useState<MuridLulusWaItem | null>(null);
  const [inputCustomPhone, setInputCustomPhone] = useState<string>('');

  const loadData = async (forceSpreadsheetSync: boolean = false) => {
    setLoading(true);
    if (forceSpreadsheetSync) {
      try {
        localStorage.removeItem('SPMB_WA_SENT_LOGS');
      } catch {}
    }
    setMuridList(gasService.getMuridLulusWaList());
    if (gasService.isLiveGasConfigured() && typeof navigator !== 'undefined' && navigator.onLine) {
      try {
        const res = await gasService.syncFromSpreadsheet(undefined, forceSpreadsheetSync);
        setMuridList(gasService.getMuridLulusWaList());
        if (forceSpreadsheetSync) {
          showToast(res?.message || 'Status seleksi & pengumuman berhasil ditarik dari Sheet Kelulusan!');
        }
      } catch (err: any) {
        if (forceSpreadsheetSync) {
          showToast(`Gagal menyinkronkan data: ${err?.message || err}`);
        }
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData(false);

    let lastAutoSync = Date.now();
    const handleDbUpdate = () => {
      setMuridList(gasService.getMuridLulusWaList());
    };

    const handleWindowFocus = () => {
      // Jika pengguna baru kembali dari tab Google Spreadsheet, otomatis tarik data terbaru dari sheet
      if (document.visibilityState === 'visible' && Date.now() - lastAutoSync > 5000) {
        lastAutoSync = Date.now();
        loadData(true);
      }
    };

    window.addEventListener('spmb_db_updated', handleDbUpdate);
    window.addEventListener('storage', handleDbUpdate);
    window.addEventListener('focus', handleWindowFocus);
    document.addEventListener('visibilitychange', handleWindowFocus);

    return () => {
      window.removeEventListener('spmb_db_updated', handleDbUpdate);
      window.removeEventListener('storage', handleDbUpdate);
      window.removeEventListener('focus', handleWindowFocus);
      document.removeEventListener('visibilitychange', handleWindowFocus);
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Statistik Pengiriman
  const stats = useMemo(() => {
    const total = muridList.length;
    const sent = muridList.filter(m => m.isWaSent).length;
    const pending = total - sent;
    const percentage = total > 0 ? Math.round((sent / total) * 100) : 0;
    return { total, sent, pending, percentage };
  }, [muridList]);

  // Filtered List
  const filteredList = useMemo(() => {
    return muridList.filter(m => {
      // 1. Status Filter
      if (statusFilter === 'sent' && !m.isWaSent) return false;
      if (statusFilter === 'pending' && m.isWaSent) return false;

      // 2. Keyword Filter
      if (searchKeyword.trim()) {
        const q = searchKeyword.trim().toLowerCase();
        const inNama = m.namaLengkap.toLowerCase().includes(q);
        const inNo = m.noPendaftaran.toLowerCase().includes(q);
        const inAsal = m.asalSekolah.toLowerCase().includes(q);
        const inNisn = m.nisn.toLowerCase().includes(q);
        const inPhone = m.nomorHpAkun.toLowerCase().includes(q);
        const inOrtu = m.namaAkunOrtu.toLowerCase().includes(q);
        if (!inNama && !inNo && !inAsal && !inNisn && !inPhone && !inOrtu) {
          return false;
        }
      }

      return true;
    });
  }, [muridList, statusFilter, searchKeyword]);

  const formatTrackingTime = (val?: string) => {
    if (!val) return '';
    const trimmed = String(val).trim();
    if (!trimmed) return '';
    if (trimmed.includes('T') && !isNaN(new Date(trimmed).getTime())) {
      return ` (${new Date(trimmed).toLocaleString('id-ID')})`;
    }
    return ` (${trimmed})`;
  };

  // Handler Kirim Pesan WhatsApp
  const handleSendWa = (item: MuridLulusWaItem, customText?: string) => {
    const cleanPhone = formatPhoneNumberForWa(item.nomorHpAkun);
    if (!cleanPhone) {
      showAppAlert({
        title: 'Nomor WhatsApp Belum Valid',
        message: `Nomor WhatsApp untuk ${item.namaLengkap} belum tersedia atau belum valid.\nSilakan klik ikon pensil untuk memasukkan nomor WhatsApp akun pendaftaran.`,
        variant: 'warning',
        confirmText: 'Oke, Mengerti',
      });
      return;
    }

    const message = customText || gasService.buildWaMessage(item);
    const waUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`;

    // Buka WhatsApp di tab / jendela baru
    window.open(waUrl, '_blank', 'noopener,noreferrer');

    // Tandai status terkirim langsung ke baris siswa di Sheet Kelulusan
    gasService.markWaSent(item.noPendaftaran, currentUser?.namaSiswa || 'Panitia SPMB');
    setMuridList(gasService.getMuridLulusWaList());
    showToast(`WhatsApp untuk ${item.namaLengkap} dibuka. Status Kirim Pesan disimpan ke Sheet Kelulusan.`);
  };

  // Handler Copy Text
  const handleCopyMessage = (item: MuridLulusWaItem, textToCopy?: string) => {
    const text = textToCopy || gasService.buildWaMessage(item);
    navigator.clipboard.writeText(text);
    setCopiedId(item.noPendaftaran);
    setTimeout(() => setCopiedId(null), 2500);
    showToast(`Template pesan pengumuman untuk ${item.namaLengkap} berhasil disalin ke clipboard!`);
  };

  // Handler Toggle Status Terkirim
  const handleToggleSent = async (item: MuridLulusWaItem) => {
    if (item.isWaSent) {
      const confirmed = await showAppConfirm({
        title: 'Batalkan Status Kirim Pesan?',
        message: `Apakah Anda yakin ingin membatalkan status Kirim Pesan untuk ${item.namaLengkap} (${item.noPendaftaran})?`,
        subMessage: 'Status indikator Kirim Pesan pada baris murid ini di Sheet Kelulusan akan dikembalikan menjadi Belum Terkirim.',
        variant: 'warning',
        confirmText: 'Ya, Batalkan Status',
        cancelText: 'Tidak Jadi',
      });
      if (confirmed) {
        gasService.unmarkWaSent(item.noPendaftaran);
        setMuridList(gasService.getMuridLulusWaList());
        showToast(`Status Kirim Pesan untuk ${item.namaLengkap} diubah menjadi BELUM di Sheet Kelulusan.`);
      }
    } else {
      gasService.markWaSent(item.noPendaftaran, currentUser?.namaSiswa || 'Panitia SPMB');
      setMuridList(gasService.getMuridLulusWaList());
      showToast(`Status Kirim Pesan untuk ${item.namaLengkap} ditandai SUDAH di Sheet Kelulusan.`);
    }
  };

  // Handler Toggle Status Cek Seleksi
  const handleToggleCekSeleksi = async (item: MuridLulusWaItem) => {
    if (item.isCekSeleksi) {
      const confirmed = await showAppConfirm({
        title: 'Reset Status Cek Seleksi?',
        message: `Apakah Anda yakin ingin mereset status deteksi Cek Seleksi untuk ${item.namaLengkap} (${item.noPendaftaran})?`,
        subMessage: 'Indikator akan otomatis tercentang kembali apabila calon murid/orang tua membuka halaman Cek Kelulusan.',
        variant: 'warning',
        confirmText: 'Ya, Reset Status',
        cancelText: 'Batal',
      });
      if (confirmed) {
        gasService.unmarkCekSeleksi(item.noPendaftaran);
        setMuridList(gasService.getMuridLulusWaList());
        showToast(`Status Cek Seleksi untuk ${item.namaLengkap} direset menjadi BELUM di Sheet Kelulusan.`);
      }
    } else {
      gasService.markCekSeleksi(item.noPendaftaran);
      setMuridList(gasService.getMuridLulusWaList());
      showToast(`Status Cek Seleksi untuk ${item.namaLengkap} ditandai SUDAH di Sheet Kelulusan.`);
    }
  };

  // Handler Toggle Status Unduh SKHS
  const handleToggleUnduhSkhs = async (item: MuridLulusWaItem) => {
    if (item.isUnduhSkhs) {
      const confirmed = await showAppConfirm({
        title: 'Reset Status Unduh SKHS?',
        message: `Apakah Anda yakin ingin mereset status deteksi Unduh SKHS untuk ${item.namaLengkap} (${item.noPendaftaran})?`,
        subMessage: 'Indikator akan otomatis tercentang kembali apabila calon murid/orang tua mengunduh PDF Surat Keterangan Hasil Seleksi.',
        variant: 'warning',
        confirmText: 'Ya, Reset Status',
        cancelText: 'Batal',
      });
      if (confirmed) {
        gasService.unmarkUnduhSkhs(item.noPendaftaran);
        setMuridList(gasService.getMuridLulusWaList());
        showToast(`Status Unduh SKHS untuk ${item.namaLengkap} direset menjadi BELUM di Sheet Kelulusan.`);
      }
    } else {
      gasService.markUnduhSkhs(item.noPendaftaran);
      setMuridList(gasService.getMuridLulusWaList());
      showToast(`Status Unduh SKHS untuk ${item.namaLengkap} ditandai SUDAH di Sheet Kelulusan.`);
    }
  };

  // Buka Modal Preview Pesan
  const handleOpenPreview = (item: MuridLulusWaItem) => {
    setPreviewStudent(item);
    setPreviewMessageText(gasService.buildWaMessage(item));
  };

  // Buka Modal Edit Nomor HP
  const handleOpenEditPhone = (item: MuridLulusWaItem) => {
    setEditingPhoneStudent(item);
    setInputCustomPhone(item.nomorHpAkun || '');
  };

  const handleSavePhone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPhoneStudent) return;
    gasService.updateCustomWaPhone(editingPhoneStudent.noPendaftaran, inputCustomPhone);
    setEditingPhoneStudent(null);
    setMuridList(gasService.getMuridLulusWaList());
    showToast(`Nomor WhatsApp untuk ${editingPhoneStudent.namaLengkap} berhasil diperbarui.`);
  };

  // Buka Modal Template Editor
  const handleOpenTemplateModal = () => {
    setEditingTemplate(gasService.getWaTemplate());
    setShowTemplateModal(true);
  };

  const handleSaveTemplate = () => {
    gasService.saveWaTemplate(editingTemplate);
    setShowTemplateModal(false);
    showToast('Template pesan pengumuman WhatsApp berhasil disimpan!');
  };

  const handleResetTemplate = async () => {
    const confirmed = await showAppConfirm({
      title: 'Reset Format Pesan WhatsApp?',
      message: 'Kembalikan template pesan WhatsApp ke susunan standar resmi SMPIT Pondok Duta?',
      variant: 'warning',
      confirmText: 'Ya, Kembalikan Standar',
      cancelText: 'Batal',
    });
    if (confirmed) {
      gasService.resetWaTemplate();
      setEditingTemplate(gasService.getWaTemplate());
      showToast('Template dikembalikan ke format standar.');
    }
  };

  // Uji Cek Langsung ke Halaman Kelulusan Website
  const handleCheckWebsite = (item: MuridLulusWaItem) => {
    if (onOpenCekKelulusan) {
      onOpenCekKelulusan(item.noPendaftaran);
    } else {
      window.open(`/?tab=cek-kelulusan&no=${encodeURIComponent(item.noPendaftaran)}`, '_blank');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-4 sm:right-8 z-50 bg-emerald-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-emerald-700 animate-in slide-in-from-top-3 text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP HEADER CARD */}
      <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 text-white shadow-xl border border-emerald-800/60 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Pengumuman</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[11px] font-semibold border border-amber-400/30">
              <ShieldCheck className="w-3 h-3" />
              <span>Sumber: Sheet Kelulusan (3 Kolom Status Per Baris)</span>
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Pengumuman Seleksi SPMB
          </h2>
          <p className="text-xs text-emerald-100/90 mt-1.5 max-w-2xl leading-relaxed">
            Daftar di bawah ini <strong>mengikuti isi Sheet Kelulusan</strong> dan hanya menampilkan calon murid yang <strong>sudah dinyatakan Diterima / Lulus oleh Guru</strong>. Status <em>Kirim Pesan</em>, <em>Cek Seleksi</em>, dan <em>Unduh SKHS</em> tersimpan langsung pada 3 kolom status di baris masing-masing murid pada Sheet <em>Kelulusan</em>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleOpenTemplateModal}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition flex items-center gap-2 border border-white/15 cursor-pointer shadow-xs"
          >
            <Sliders className="w-4 h-4 text-emerald-300" />
            <span>Format Pesan WA</span>
          </button>

          <button
            type="button"
            onClick={() => loadData(true)}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Menyinkronkan...' : 'Segarkan Data'}</span>
          </button>
        </div>
      </div>

      {/* SUMMARY STAT CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Calon Murid */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Murid Diterima / Lulus</p>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">{stats.total}</h3>
            <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">Terdata di Sheet Kelulusan</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Sudah Dikirim */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Sudah Dikirim WA</p>
            <h3 className="text-2xl sm:text-3xl font-black text-emerald-700 mt-1">{stats.sent}</h3>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">Orang tua telah dihubungi</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Belum Dikirim */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Belum Dikirim</p>
            <h3 className="text-2xl sm:text-3xl font-black text-amber-600 mt-1">{stats.pending}</h3>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">Menunggu pengiriman</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Persentase Selesai */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Progres Pengiriman</p>
            <span className="text-xs font-black text-emerald-700">{stats.percentage}%</span>
          </div>
          <div className="mt-2.5">
            <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-emerald-600 to-teal-500 rounded-full transition-all duration-500"
                style={{ width: `${stats.percentage}%` }}
              />
            </div>
          </div>
          <p className="text-[10px] text-slate-400 mt-2 truncate">
            {stats.sent} dari {stats.total} orang tua telah terkonfirmasi
          </p>
        </div>
      </div>

      {/* FILTER & PENCARIAN BAR */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row gap-3 md:items-center justify-between">
          
          {/* Input Pencarian */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="Cari nama calon murid, nomor pendaftaran, asal sekolah, atau nomor WA..."
              className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50/50"
            />
            {searchKeyword && (
              <button
                type="button"
                onClick={() => setSearchKeyword('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Status Button Tabs */}
          <div className="grid grid-cols-3 sm:flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl shrink-0 w-full md:w-auto">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition cursor-pointer text-center ${
                statusFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua ({stats.total})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('pending')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition cursor-pointer text-center ${
                statusFilter === 'pending'
                  ? 'bg-amber-500 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Belum ({stats.pending})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('sent')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition cursor-pointer text-center ${
                statusFilter === 'sent'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Terkirim ({stats.sent})
            </button>
          </div>
        </div>
      </div>

      {/* DAFTAR DATA CALON MURID PENERIMA PENGUMUMAN SPMB */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-extrabold text-sm text-slate-900">
              Daftar Calon Murid Penerima Pengumuman (Sheet Kelulusan)
            </h3>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-extrabold shrink-0">
              {filteredList.length} Murid
            </span>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            Tahun Pelajaran 2027/2028
          </span>
        </div>

        {filteredList.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
              <Search className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-700">
              {muridList.length === 0
                ? 'Belum ada murid yang dinyatakan Diterima / Lulus di Sheet Kelulusan.'
                : 'Tidak ada data calon murid yang cocok dengan pencarian.'}
            </p>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              {muridList.length === 0
                ? 'Menu Pengumuman mengikuti isi Sheet Kelulusan. Murid akan otomatis tampil di sini setelah dinilai dan dinyatakan Diterima / Lulus oleh Guru pada menu Observasi Murid.'
                : 'Silakan lakukan pencarian dengan kata kunci lain atau klik tombol Segarkan Data di atas.'}
            </p>
          </div>
        ) : (
          <>
            {/* =============================================================== */}
            {/* TAMPILAN KARTU KHUSUS HP / MOBILE (md:hidden)                   */}
            {/* =============================================================== */}
            <div className="md:hidden p-3.5 sm:p-4 space-y-3.5 bg-slate-50/70">
              {filteredList.map((item, index) => {
                const cleanPhone = formatPhoneNumberForWa(item.nomorHpAkun);
                const hasValidPhone = Boolean(cleanPhone && cleanPhone.length >= 9);

                return (
                  <div
                    key={`card-wa-${item.noPendaftaran}`}
                    className="rounded-2xl bg-white border border-slate-200/90 shadow-xs p-4 space-y-3.5"
                  >
                    {/* Header Kartu: No. Urut, Nama Murid, & Status Lulus */}
                    <div className="flex items-start justify-between gap-2.5">
                      <div className="flex items-start gap-2.5 min-w-0">
                        <span className="w-7 h-7 rounded-xl bg-emerald-950 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                          {index + 1}
                        </span>
                        <div className="min-w-0">
                          <h4 className="font-extrabold text-slate-900 text-sm leading-snug break-words">
                            {item.namaLengkap}
                          </h4>
                          <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                            {item.asalSekolah || '-'}
                          </p>
                          <p className="text-[11px] font-mono text-slate-600 mt-0.5">
                            NISN: {item.nisn || '-'}
                          </p>
                        </div>
                      </div>

                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-extrabold text-[10px] shrink-0">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>DITERIMA</span>
                      </span>
                    </div>

                    {/* Baris Info No. Pendaftaran & No. WhatsApp Acuan */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5 text-xs">
                      {/* No. Pendaftaran + Jadwal Daftar Ulang */}
                      <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-200/70">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase block">
                            No. Pendaftaran
                          </span>
                          <div className="inline-flex items-center gap-1.5 mt-0.5 font-mono font-extrabold text-slate-900 text-xs whitespace-nowrap">
                            <span>{item.noPendaftaran}</span>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(item.noPendaftaran);
                                showToast(`No. Pendaftaran ${item.noPendaftaran} disalin.`);
                              }}
                              className="p-1 rounded-md bg-white border border-slate-200 text-slate-500 hover:text-slate-800 cursor-pointer"
                              title="Salin No. Pendaftaran"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] font-bold text-slate-400 uppercase block">
                            Daftar Ulang
                          </span>
                          <span className="font-bold text-slate-700 text-[11px] block mt-0.5">
                            {item.jadwalDaftarUlang || '20 - 25 Januari 2027'}
                          </span>
                        </div>
                      </div>

                      {/* Nomor WhatsApp Acuan */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <span className="text-[10px] font-bold text-slate-400 uppercase block">
                            No. WhatsApp Orang Tua
                          </span>
                          {hasValidPhone ? (
                            <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                              <span className="inline-flex items-center gap-1 font-mono font-extrabold text-emerald-800 text-xs">
                                <Smartphone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span>{item.nomorHpAkun}</span>
                              </span>
                              <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${
                                item.hasUserAccount
                                  ? 'bg-emerald-100 text-emerald-900'
                                  : 'bg-amber-100 text-amber-900'
                              }`}>
                                {item.hasUserAccount ? 'Akun Pendaftaran' : 'Data Cadangan'}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-rose-600 font-bold inline-flex items-center gap-1 mt-0.5">
                              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                              <span>Belum ada No. WhatsApp</span>
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleOpenEditPhone(item)}
                          className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-[11px] flex items-center gap-1 shrink-0 cursor-pointer shadow-2xs"
                        >
                          <Edit3 className="w-3 h-3 text-slate-500" />
                          <span>{hasValidPhone ? 'Ubah' : '+ Input'}</span>
                        </button>
                      </div>
                    </div>

                    {/* 3 Indikator Status (Kirim Pesan, Cek Seleksi, Unduh SKHS) */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">
                        Status Aktivitas (Ketuk untuk Ubah Manual)
                      </span>
                      <div className="grid grid-cols-3 gap-1.5">
                        {/* 1. Kirim Pesan */}
                        <button
                          type="button"
                          onClick={() => handleToggleSent(item)}
                          className={`flex items-center justify-between gap-1 px-2.5 py-2 rounded-xl text-[11px] font-extrabold border transition cursor-pointer ${
                            item.isWaSent
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                              : 'bg-rose-50/80 border-rose-200 text-rose-800'
                          }`}
                        >
                          <span className="truncate">Kirim WA</span>
                          {item.isWaSent ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                          )}
                        </button>

                        {/* 2. Cek Seleksi */}
                        <button
                          type="button"
                          onClick={() => handleToggleCekSeleksi(item)}
                          className={`flex items-center justify-between gap-1 px-2.5 py-2 rounded-xl text-[11px] font-extrabold border transition cursor-pointer ${
                            item.isCekSeleksi
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                              : 'bg-rose-50/80 border-rose-200 text-rose-800'
                          }`}
                        >
                          <span className="truncate">Cek Web</span>
                          {item.isCekSeleksi ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                          )}
                        </button>

                        {/* 3. Unduh SKHS */}
                        <button
                          type="button"
                          onClick={() => handleToggleUnduhSkhs(item)}
                          className={`flex items-center justify-between gap-1 px-2.5 py-2 rounded-xl text-[11px] font-extrabold border transition cursor-pointer ${
                            item.isUnduhSkhs
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                              : 'bg-rose-50/80 border-rose-200 text-rose-800'
                          }`}
                        >
                          <span className="truncate">Unduh PDF</span>
                          {item.isUnduhSkhs ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Tombol Aksi Pengiriman Mudah Dioperasikan di HP */}
                    <div className="pt-1 space-y-2">
                      <button
                        type="button"
                        onClick={() => handleSendWa(item)}
                        className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-extrabold text-xs shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Send className="w-4 h-4" />
                        <span>Kirim WhatsApp</span>
                      </button>

                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenPreview(item)}
                          className="py-2 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] transition flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                          <span>Preview</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleCopyMessage(item)}
                          className="py-2 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] transition flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          {copiedId === item.noPendaftaran ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span className="text-emerald-700">Tersalin</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                              <span>Salin Teks</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleCheckWebsite(item)}
                          className="py-2 px-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[11px] transition flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                          <span>Cek Web</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* =============================================================== */}
            {/* TAMPILAN TABEL DESKTOP (hidden md:block)                        */}
            {/* =============================================================== */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4 w-12 text-center">No</th>
                    <th className="py-3 px-4 min-w-[200px]">Calon Murid</th>
                    <th className="py-3 px-4 min-w-[140px]">No. Pendaftaran</th>
                    <th className="py-3 px-4 min-w-[180px]">No. WhatsApp Acuan</th>
                    <th className="py-3 px-4 min-w-[150px]">Informasi Seleksi</th>
                    <th className="py-3 px-4 min-w-[165px] text-center">Status</th>
                    <th className="py-3 px-4 min-w-[210px] text-right">Aksi Pengiriman</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredList.map((item, index) => {
                    const cleanPhone = formatPhoneNumberForWa(item.nomorHpAkun);
                    const hasValidPhone = Boolean(cleanPhone && cleanPhone.length >= 9);

                    return (
                      <tr key={item.noPendaftaran} className="hover:bg-slate-50/70 transition">
                        
                        {/* No. Urut */}
                        <td className="py-3.5 px-4 text-center font-bold text-slate-400">
                          {index + 1}
                        </td>

                        {/* Calon Murid */}
                        <td className="py-3.5 px-4">
                          <div className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                            <span>{item.namaLengkap}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5 flex flex-wrap items-center gap-1.5">
                            <span>{item.asalSekolah}</span>
                            <span className="text-slate-300">•</span>
                            <span className="font-mono text-slate-600">NISN: {item.nisn || '-'}</span>
                          </div>
                        </td>

                        {/* No. Pendaftaran */}
                        <td className="py-3.5 px-4">
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 border border-slate-200/90 text-slate-900 font-mono text-[11px] font-extrabold whitespace-nowrap">
                            <span>{item.noPendaftaran}</span>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(item.noPendaftaran);
                                showToast(`No. Pendaftaran ${item.noPendaftaran} disalin.`);
                              }}
                              title="Salin No. Pendaftaran"
                              className="text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer shrink-0"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                        </td>

                        {/* No. WhatsApp Acuan Pendaftaran */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5">
                            {hasValidPhone ? (
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-1 font-mono font-bold text-emerald-800 text-xs whitespace-nowrap">
                                  <Smartphone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                  <span>{item.nomorHpAkun}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded whitespace-nowrap ${
                                    item.hasUserAccount
                                      ? 'bg-emerald-100 text-emerald-900'
                                      : 'bg-amber-100 text-amber-900'
                                  }`}>
                                    {item.hasUserAccount ? 'Akun Pendaftaran' : 'Data Cadangan'}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEditPhone(item)}
                                    title="Ubah / Sesuaikan Nomor WhatsApp"
                                    className="text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer"
                                  >
                                    <Edit3 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5">
                                <span className="text-[11px] text-rose-600 font-bold flex items-center gap-1 whitespace-nowrap">
                                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                  <span>Belum ada No WA</span>
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditPhone(item)}
                                  className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-bold text-[10px] hover:bg-amber-200 transition cursor-pointer whitespace-nowrap"
                                >
                                  + Input
                                </button>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Informasi Seleksi / Jadwal */}
                        <td className="py-3.5 px-4">
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-extrabold text-[10px] whitespace-nowrap">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                              <span>DITERIMA</span>
                            </span>
                            <div className="text-[11px] leading-snug">
                              <span className="text-slate-500 font-semibold block">Daftar Ulang:</span>
                              <span className="text-slate-800 font-bold block whitespace-nowrap">
                                {item.jadwalDaftarUlang || '20 - 25 Januari 2027'}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Status (Kirim Pesan, Cek Seleksi, Unduh SKHS) */}
                        <td className="py-3 px-4">
                          <div className="inline-flex flex-col gap-1.5 w-full max-w-[155px] mx-auto">
                            {/* 1. Kirim Pesan */}
                            <button
                              type="button"
                              onClick={() => handleToggleSent(item)}
                              title={
                                item.isWaSent
                                  ? `Pesan WA sudah dikirim${formatTrackingTime(item.waSentAt)}. Klik untuk ubah.`
                                  : 'Pesan WA belum dikirim. Klik untuk tandai sudah dikirim.'
                              }
                              className={`flex items-center justify-between gap-2 px-2.5 py-1 rounded-lg text-[10.5px] font-bold border transition cursor-pointer ${
                                item.isWaSent
                                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900 hover:bg-emerald-100'
                                  : 'bg-rose-50/80 border-rose-200 text-rose-800 hover:bg-rose-100/80'
                              }`}
                            >
                              <span className="truncate">Kirim Pesan</span>
                              {item.isWaSent ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              ) : (
                                <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                              )}
                            </button>

                            {/* 2. Cek Seleksi */}
                            <button
                              type="button"
                              onClick={() => handleToggleCekSeleksi(item)}
                              title={
                                item.isCekSeleksi
                                  ? `Orang tua sudah terdeteksi mengecek hasil seleksi${formatTrackingTime(item.cekSeleksiAt)}.`
                                  : 'Orang tua belum terdeteksi melakukan pengecekan hasil seleksi.'
                              }
                              className={`flex items-center justify-between gap-2 px-2.5 py-1 rounded-lg text-[10.5px] font-bold border transition cursor-pointer ${
                                item.isCekSeleksi
                                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900 hover:bg-emerald-100'
                                  : 'bg-rose-50/80 border-rose-200 text-rose-800 hover:bg-rose-100/80'
                              }`}
                            >
                              <span className="truncate">Cek Seleksi</span>
                              {item.isCekSeleksi ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              ) : (
                                <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                              )}
                            </button>

                            {/* 3. Unduh SKHS */}
                            <button
                              type="button"
                              onClick={() => handleToggleUnduhSkhs(item)}
                              title={
                                item.isUnduhSkhs
                                  ? `Orang tua sudah terdeteksi mengunduh Surat Keterangan Hasil Seleksi (SKHS)${formatTrackingTime(item.unduhSkhsAt)}.`
                                  : 'Orang tua belum terdeteksi mengunduh Surat Keterangan Hasil Seleksi (SKHS).'
                              }
                              className={`flex items-center justify-between gap-2 px-2.5 py-1 rounded-lg text-[10.5px] font-bold border transition cursor-pointer ${
                                item.isUnduhSkhs
                                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900 hover:bg-emerald-100'
                                  : 'bg-rose-50/80 border-rose-200 text-rose-800 hover:bg-rose-100/80'
                              }`}
                            >
                              <span className="truncate">Unduh SKHS</span>
                              {item.isUnduhSkhs ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              ) : (
                                <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                              )}
                            </button>
                          </div>
                        </td>

                        {/* Aksi Pengiriman */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
                            
                            {/* Tombol Utama: Kirim WhatsApp */}
                            <button
                              type="button"
                              onClick={() => handleSendWa(item)}
                              title="Kirim pesan informasi pengumuman seleksi via WhatsApp"
                              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-extrabold text-xs shadow-xs transition inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
                            >
                              <Send className="w-3.5 h-3.5 shrink-0" />
                              <span>Kirim WA</span>
                            </button>

                            {/* Tombol Preview Bubble & Copy */}
                            <button
                              type="button"
                              onClick={() => handleOpenPreview(item)}
                              title="Pratinjau pesan WhatsApp & salin teks"
                              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer shrink-0"
                            >
                              <FileText className="w-4 h-4" />
                            </button>

                            {/* Tombol Quick Copy */}
                            <button
                              type="button"
                              onClick={() => handleCopyMessage(item)}
                              title="Salin template pesan ke clipboard"
                              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer shrink-0"
                            >
                              {copiedId === item.noPendaftaran ? (
                                <Check className="w-4 h-4 text-emerald-600" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </button>

                            {/* Tombol Uji Tautan Cek Website */}
                            <button
                              type="button"
                              onClick={() => handleCheckWebsite(item)}
                              title="Uji langsung tautan cek kelulusan calon murid ini"
                              className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 transition cursor-pointer shrink-0"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </button>

                          </div>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: PREVIEW PESAN WHATSAPP REALISTIS                                */}
      {/* ========================================================================= */}
      {previewStudent && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-in fade-in duration-150"
          onClick={() => setPreviewStudent(null)}
        >
          <div 
            className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Modal */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-800 to-teal-800 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-emerald-300 border border-white/15 shrink-0">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm sm:text-base leading-tight">
                    Pratinjau Pesan WhatsApp Pengumuman SPMB
                  </h4>
                  <p className="text-xs text-emerald-100/90 mt-0.5">
                    Tujuan: {previewStudent.namaLengkap} ({previewStudent.nomorHpAkun || 'Nomor Belum Ada'})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPreviewStudent(null)}
                className="p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Bubble WhatsApp Preview Container */}
            <div className="p-5 overflow-y-auto flex-1 bg-[#efeae2] space-y-4">
              
              {/* Info Acuan */}
              <div className="bg-white/80 backdrop-blur-xs p-3 rounded-2xl border border-slate-200/80 text-xs text-slate-700 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block">Nomor WhatsApp Acuan Akun Pendaftaran:</span>
                  <span className="font-mono text-emerald-800 font-extrabold">{previewStudent.nomorHpAkun || '-'}</span>
                  <span className="text-[11px] text-slate-500 block">Orang Tua / Pendaftar: {previewStudent.namaAkunOrtu}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    handleOpenEditPhone(previewStudent);
                    setPreviewStudent(null);
                  }}
                  className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Ubah Nomor</span>
                </button>
              </div>

              {/* Chat Bubble WhatsApp */}
              <div className="max-w-md ml-auto bg-[#d9fdd3] text-[#111b21] p-4 rounded-2xl rounded-tr-xs shadow-sm border border-[#c4eec0] text-xs space-y-2 whitespace-pre-wrap font-sans leading-relaxed">
                {previewMessageText}
                <div className="text-[10px] text-slate-500 text-right flex items-center justify-end gap-1 pt-1 border-t border-emerald-100">
                  <span>{new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                </div>
              </div>

            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => handleCopyMessage(previewStudent, previewMessageText)}
                className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-2xs"
              >
                <Copy className="w-4 h-4 text-slate-600" />
                <span>Salin Teks Pesan</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewStudent(null)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 hover:text-slate-800 text-xs font-bold transition cursor-pointer"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleSendWa(previewStudent, previewMessageText);
                    setPreviewStudent(null);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-black transition flex items-center gap-2 shadow-md cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Buka WhatsApp Sekarang</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: SESUAIKAN TEMPLATE PESAN WHATSAPP                               */}
      {/* ========================================================================= */}
      {showTemplateModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-in fade-in duration-150"
          onClick={() => setShowTemplateModal(false)}
        >
          <div 
            className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shrink-0">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm sm:text-base leading-tight">
                    Sesuaikan Template Pesan WhatsApp
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Gunakan tag dinamis seperti <code>{'{namaLengkap}'}</code>, <code>{'{noPendaftaran}'}</code>, <code>{'{directLink}'}</code>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowTemplateModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 flex-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Teks Template Pesan WhatsApp:
                </label>
                <textarea
                  value={editingTemplate}
                  onChange={(e) => setEditingTemplate(e.target.value)}
                  rows={14}
                  className="w-full p-3.5 rounded-2xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50/50 leading-relaxed"
                />
              </div>

              {/* Tag Variabel Dinamis */}
              <div className="p-3.5 rounded-2xl bg-slate-100 border border-slate-200 text-xs space-y-1.5">
                <div className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">
                  Variabel Dinamis yang Tersedia:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    '{namaLengkap}', 
                    '{namaPanggilan}', 
                    '{noPendaftaran}', 
                    '{nisn}', 
                    '{asalSekolah}', 
                    '{jadwalDaftarUlang}', 
                    '{directLink}', 
                    '{websiteUrl}', 
                    '{tahunPelajaran}',
                    '{namaAkunOrtu}'
                  ].map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setEditingTemplate(prev => prev + ' ' + tag)}
                      className="px-2 py-0.5 rounded-md bg-white border border-slate-300 font-mono text-[11px] text-emerald-800 font-bold hover:bg-emerald-50 transition cursor-pointer"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={handleResetTemplate}
                className="px-3.5 py-2 rounded-xl text-slate-600 hover:text-slate-800 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Standar</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowTemplateModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-800 text-xs font-bold transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSaveTemplate}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition cursor-pointer shadow-md"
                >
                  Simpan Template
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: UBAH / PERBAIKI NOMOR WHATSAPP PENDAFTAR                        */}
      {/* ========================================================================= */}
      {editingPhoneStudent && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-in fade-in duration-150"
          onClick={() => setEditingPhoneStudent(null)}
        >
          <div 
            className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 p-5 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900">Ubah Nomor WhatsApp Acuan</h4>
                  <p className="text-[11px] text-slate-500">{editingPhoneStudent.namaLengkap}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingPhoneStudent(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePhone} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nomor Handphone / WhatsApp:
                </label>
                <div className="relative">
                  <Smartphone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={inputCustomPhone}
                    onChange={(e) => setInputCustomPhone(e.target.value)}
                    placeholder="Contoh: 08123456789 atau 628123456789"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 font-mono text-xs font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  Format awalan dapat berupa 08... atau 62... (sistem otomatis menstandarkan ke format internasional).
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingPhoneStudent(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-800 text-xs font-bold transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition cursor-pointer shadow-md"
                >
                  Simpan Nomor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
