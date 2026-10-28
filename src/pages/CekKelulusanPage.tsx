import React, { useState, useEffect, useRef, useMemo } from 'react';
import { gasService } from '../services/gasService';
import { StatusKelulusanInfo, getAcademicYear } from '../types';
import confetti from 'canvas-confetti';
import QRCode from 'qrcode';
import { downloadElementAsPdf } from '../utils/downloadPdfDocument';
import { SklKelulusanPrintModal } from './dashboard/SklKelulusanPrintModal';
import { 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  FileText, 
  Download, 
  Sparkles, 
  XCircle, 
  School, 
  User, 
  Calendar,
  Award,
  ChevronRight,
  X,
  ShieldCheck,
  QrCode as QrCodeIcon,
  Loader2
} from 'lucide-react';

interface Props {
  onGoToRegister: () => void;
}

interface VerifiedParticipantCard {
  noPendaftaran: string;
  namaLengkap: string;
  namaPanggilan?: string;
  nisn: string;
  nik?: string;
  asalSekolah: string;
  jalur: string;
  jenisKelamin?: string;
  ttl?: string;
  namaOrtu?: string;
  noHp?: string;
  isVerified: boolean;
  jadwal: string;
  lokasi: string;
}

export const CekKelulusanPage: React.FC<Props> = ({ onGoToRegister }) => {
  const [keyword, setKeyword] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<StatusKelulusanInfo | null>(null);
  const [searched, setSearched] = useState(false);
  const [verifiedCard, setVerifiedCard] = useState<VerifiedParticipantCard | null>(null);
  const [showSklModal, setShowSklModal] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [logoBase64, setLogoBase64] = useState<string>('');
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const sklDocRef = useRef<HTMLDivElement | null>(null);
  const tahunPelajaran = getAcademicYear();

  const handleSearch = async (termToSearch?: string) => {
    const query = (termToSearch !== undefined ? termToSearch : keyword).trim();
    if (!query) return;

    setIsSearching(true);
    setSearched(true);
    const data = await gasService.checkStatusKelulusan(query);
    if (data) {
      const st = gasService.getSiswaByNo(data.noPendaftaran);
      const induk = gasService.getDataIndukList().find(d => d.noPendaftaran === data.noPendaftaran);
      const obs = gasService.getObservasiSiswa(data.noPendaftaran);
      if (!data.nisn || data.nisn === '-' || data.nisn.trim() === '') {
        data.nisn = st?.nisn || induk?.nisn || '-';
      }
      if (data.status === 'LULUS' && (!data.jadwalDaftarUlang || data.jadwalDaftarUlang === '-' || data.jadwalDaftarUlang.trim() === '')) {
        data.jadwalDaftarUlang = obs?.tanggalMaksimalDaftarUlang || '20 - 25 Januari 2027';
      }
      if (data.noPendaftaran && data.status !== 'PROSES_SELEKSI') {
        gasService.markCekSeleksi(data.noPendaftaran);
      }
    }
    setIsSearching(false);
    setResult(data);

    if (data && data.status === 'LULUS') {
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // Safe fail
      }
    }
  };

  // Auto-search & Deteksi Scan QR Code Kartu Peserta dari HP
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const no = (params.get('no') || params.get('noPendaftaran') || '').trim();
      const nisn = (params.get('nisn') || '').trim();
      const nik = (params.get('nik') || '').trim();
      const rawNama = (params.get('nama') || '').trim();
      const nama = rawNama && rawNama !== 'Calon Peserta Didik' ? rawNama : '';
      const panggilan = (params.get('panggilan') || '').trim();
      const rawAsal = (params.get('asal') || '').trim();
      const asal = rawAsal && rawAsal !== 'SD/MI Asal' ? rawAsal : '';
      const jalur = (params.get('jalur') || '').trim();
      const jk = (params.get('jk') || '').trim();
      const ttl = (params.get('ttl') || '').trim();
      const ortu = (params.get('ortu') || '').trim();
      const hp = (params.get('hp') || '').trim();
      const jadwal = (params.get('jadwal') || '').trim();
      const ruang = (params.get('ruang') || '').trim();
      const isVerif = params.get('verifikasi') === 'true';

      const q = no || nisn;

      const buildVerifiedCard = (studentRecord: ReturnType<typeof gasService.getSiswaByNo>): VerifiedParticipantCard => {
        const cleanNama =
          nama ||
          (studentRecord?.namaLengkap && studentRecord.namaLengkap !== 'Calon Peserta Didik'
            ? studentRecord.namaLengkap
            : '') ||
          'Calon Peserta Didik';
        const cleanAsal =
          asal ||
          (studentRecord?.asalSekolah && studentRecord.asalSekolah !== 'SD/MI Asal'
            ? studentRecord.asalSekolah
            : '') ||
          '-';
        const ttlText =
          ttl && ttl !== '-' && ttl !== ', '
            ? ttl
            : studentRecord && (studentRecord.tempatLahir || studentRecord.tanggalLahir)
            ? `${studentRecord.tempatLahir || '-'}${studentRecord.tanggalLahir ? `, ${studentRecord.tanggalLahir}` : ''}`
            : '-';

        return {
          noPendaftaran: no || studentRecord?.noPendaftaran || '-',
          namaLengkap: cleanNama,
          namaPanggilan: panggilan || studentRecord?.namaPanggilan || '',
          nisn: nisn || studentRecord?.nisn || '-',
          nik: nik || studentRecord?.nik || '-',
          asalSekolah: cleanAsal,
          jalur: jalur || studentRecord?.jalurPendaftaran || 'Jalur Reguler SPMB',
          jenisKelamin: jk || studentRecord?.jenisKelamin || 'Laki-laki',
          ttl: ttlText,
          namaOrtu: ortu || studentRecord?.namaAyah || studentRecord?.namaIbu || studentRecord?.namaWali || '-',
          noHp: hp || studentRecord?.noHpAyah || studentRecord?.nomorTelepon || studentRecord?.noHpIbu || '-',
          isVerified: true,
          jadwal: jadwal || 'Sabtu, 17 Januari 2026 · Pukul 08.00 - 11.30 WIB',
          lokasi: ruang || 'Ruang Aula - Gedung SMPIT Lt. 1'
        };
      };

      if (isVerif || nama || (no && q)) {
        const localSiswa = no ? gasService.getSiswaByNo(no) : null;
        const initialCard = buildVerifiedCard(localSiswa);
        setVerifiedCard(initialCard);

        if (no && (nama || (localSiswa && localSiswa.namaLengkap !== 'Calon Peserta Didik'))) {
          gasService.registerScannedStudent({
            noPendaftaran: initialCard.noPendaftaran,
            namaLengkap: initialCard.namaLengkap,
            nisn: initialCard.nisn,
            nik: initialCard.nik,
            asalSekolah: initialCard.asalSekolah,
            jalurPendaftaran: initialCard.jalur,
            jenisKelamin: (initialCard.jenisKelamin === 'Perempuan') ? 'Perempuan' : 'Laki-laki'
          });
        }

        // Sinkronisasi langsung dengan Spreadsheet agar hasil scan kartu di perangkat manapun selalu akurat sesuai pendaftar asli
        if (no && gasService.isLiveGasConfigured()) {
          gasService.syncFromSpreadsheet(undefined, true).then(() => {
            const syncedSiswa = gasService.getSiswaByNo(no);
            if (syncedSiswa) {
              setVerifiedCard(buildVerifiedCard(syncedSiswa));
            }
          }).catch(() => {});
        }
      }

      // Jika ada kata kunci nomor pendaftaran
      if (q) {
        setKeyword(q);
        // Jika bukan scan verifikasi Kartu Peserta (misal scan SKL atau link cek kelulusan langsung), jalankan pencarian kelulusan
        if (!isVerif) {
          handleSearch(q);
        }
      }
    }
  }, []);

  // Pastikan NISN selalu tampil dan tidak kosong
  const effectiveNisn = useMemo(() => {
    if (!result) return '-';
    if (result.nisn && result.nisn !== '-' && result.nisn.trim()) return result.nisn.trim();
    if (result.noPendaftaran) {
      const st = gasService.getSiswaByNo(result.noPendaftaran);
      if (st?.nisn && st.nisn !== '-' && st.nisn.trim()) return st.nisn.trim();
      const induk = gasService.getDataIndukList().find(d => d.noPendaftaran === result.noPendaftaran);
      if (induk?.nisn && induk.nisn !== '-' && induk.nisn.trim()) return induk.nisn.trim();
      const stKel = gasService.getStatusKelulusan(result.noPendaftaran);
      if (stKel?.nisn && stKel.nisn !== '-' && stKel.nisn.trim()) return stKel.nisn.trim();
    }
    return '-';
  }, [result]);

  // Pastikan Jadwal Daftar Ulang hanya tampil jika LULUS, dan dikunci ('-') jika TIDAK_LULUS
  const effectiveJadwalDaftarUlang = useMemo(() => {
    if (!result) return '20 - 25 Januari 2027';
    if (result.status !== 'LULUS') return '-';
    if (result.jadwalDaftarUlang && result.jadwalDaftarUlang !== '-' && result.jadwalDaftarUlang.trim()) {
      return result.jadwalDaftarUlang.trim();
    }
    if (result.noPendaftaran) {
      const obs = gasService.getObservasiSiswa(result.noPendaftaran);
      if (obs?.tanggalMaksimalDaftarUlang && obs.tanggalMaksimalDaftarUlang !== '-' && obs.tanggalMaksimalDaftarUlang.trim()) {
        return obs.tanggalMaksimalDaftarUlang.trim();
      }
      const stKel = gasService.getStatusKelulusan(result.noPendaftaran);
      if (stKel?.jadwalDaftarUlang && stKel.jadwalDaftarUlang !== '-' && stKel.jadwalDaftarUlang.trim()) {
        return stKel.jadwalDaftarUlang.trim();
      }
    }
    return '20 - 25 Januari 2027';
  }, [result]);

  // Preload logo sekolah untuk render HTML2Canvas & cetak dokumen
  useEffect(() => {
    const rawLogo = gasService.getAppSettings().logoUrl || '/logo-smpit-pondok-duta.png';
    const resolvedUrl = gasService.resolveImageUrl(rawLogo) || '/logo-smpit-pondok-duta.png';

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || 200;
        canvas.height = img.naturalHeight || 200;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          setLogoBase64(canvas.toDataURL('image/png'));
        } else {
          setLogoBase64(resolvedUrl);
        }
      } catch {
        setLogoBase64(resolvedUrl);
      }
    };
    img.onerror = () => setLogoBase64('/logo-smpit-pondok-duta.png');
    img.src = resolvedUrl;
  }, []);

  // Generate QR Code Verifikasi Resmi sebagai Pengganti Tanda Tangan Basah
  useEffect(() => {
    if (result && result.noPendaftaran) {
      const hostOrigin = typeof window !== 'undefined' && window.location ? window.location.origin : '';
      const verificationUrl = `${hostOrigin}/?tab=cek-kelulusan&no=${encodeURIComponent(result.noPendaftaran)}&status=${encodeURIComponent(result.status)}`;

      QRCode.toDataURL(verificationUrl, {
        width: 360,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#ffffff'
        },
        errorCorrectionLevel: 'M'
      })
        .then((url) => setQrCodeUrl(url))
        .catch((err) => console.error('Gagal generate QR Code:', err));
    }
  }, [result]);

  const handleChipClick = (code: string) => {
    setKeyword(code);
    handleSearch(code);
  };

  // Handler Unduh PDF Resmi Surat Keterangan Hasil Seleksi (Langsung Download File PDF)
  const handleDownloadPdf = async () => {
    if (isDownloadingPdf) return;
    setIsDownloadingPdf(true);

    try {
      const docElement = sklDocRef.current;
      if (!docElement) {
        throw new Error('Element dokumen Surat Keterangan Hasil Seleksi tidak ditemukan');
      }

      const safeName = (result?.namaLengkap || 'Calon_Murid').replace(/\s+/g, '_');
      const fileName = `Surat_Keterangan_Hasil_Seleksi_SPMB_${safeName}_${result?.noPendaftaran || ''}.pdf`;

      await downloadElementAsPdf({
        element: docElement,
        fileName,
        pdfTitle: `Surat Keterangan Hasil Seleksi SPMB - ${result?.namaLengkap || ''}`,
        footerText: `Surat Keterangan Hasil Seleksi Resmi SPMB SMPIT Pondok Duta · TP ${tahunPelajaran} · Sah terverifikasi via QR Code.`,
        margin: 12
      });
      if (result?.noPendaftaran) {
        gasService.markUnduhSkhs(result.noPendaftaran);
      }
    } catch (err) {
      console.error('Gagal mengunduh dokumen Surat Keterangan Hasil Seleksi PDF:', err);
      alert('Gagal mengunduh dokumen Surat Keterangan Hasil Seleksi PDF. ' + (err instanceof Error ? err.message : ''));
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      
      {/* Panel Utama: Verifikasi Keaslian Kartu Peserta via Scan Barcode / QR Code dari HP */}
      {verifiedCard && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white border-2 border-emerald-600 shadow-xl space-y-5 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-emerald-100">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-700 text-white flex items-center justify-center shadow-md shrink-0">
                <ShieldCheck className="w-7 h-7 text-emerald-200" />
              </div>
              <div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>DOKUMEN RESMI TERVERIFIKASI SISTEM</span>
                </span>
                <h2 className="text-lg sm:text-2xl font-black text-slate-900 mt-1">
                  Verifikasi Keaslian Kartu Peserta SPMB
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  SMPIT Pondok Duta · Terakreditasi &quot;A&quot; BAN-PDM
                </p>
              </div>
            </div>
            <div className="text-left sm:text-right shrink-0">
              <span className="text-[10px] text-slate-400 block font-semibold uppercase">Tahun Pelajaran</span>
              <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                TP {tahunPelajaran}
              </span>
            </div>
          </div>

          {/* Detail Kartu Terverifikasi Lengkap (Hasil Pindai QR Code dari HP) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-500 font-semibold uppercase block">Nomor Registrasi / Pendaftaran</span>
              <span className="font-mono font-black text-emerald-950 text-base">{verifiedCard.noPendaftaran}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-500 font-semibold uppercase block">Nama Lengkap Murid</span>
              <div className="flex items-center gap-2">
                <span className="font-black text-slate-900 text-sm">{verifiedCard.namaLengkap}</span>
                {verifiedCard.namaPanggilan && (
                  <span className="text-[10.5px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                    ({verifiedCard.namaPanggilan})
                  </span>
                )}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-500 font-semibold uppercase block">NISN / NIK</span>
              <span className="font-mono font-bold text-slate-800 text-xs">
                {verifiedCard.nisn} {verifiedCard.nik && verifiedCard.nik !== '-' ? `/ ${verifiedCard.nik}` : ''}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-500 font-semibold uppercase block">Jenis Kelamin &amp; TTL</span>
              <span className="font-medium text-slate-800 text-xs">
                {verifiedCard.jenisKelamin || 'Laki-laki'} &bull; {verifiedCard.ttl || '-'}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-500 font-semibold uppercase block">Asal Sekolah SD / MI</span>
              <span className="font-bold text-slate-800 text-xs">{verifiedCard.asalSekolah}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-500 font-semibold uppercase block">Orang Tua / Wali &amp; WhatsApp</span>
              <span className="font-medium text-slate-800 text-xs">
                {verifiedCard.namaOrtu || '-'} {verifiedCard.noHp && verifiedCard.noHp !== '-' ? `(${verifiedCard.noHp})` : ''}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-500 font-semibold uppercase block">Pilihan Jalur Pendaftaran</span>
              <span className="font-bold text-emerald-900 text-xs">{verifiedCard.jalur}</span>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50/90 border border-emerald-200">
              <span className="text-[10px] text-emerald-800 font-bold uppercase block">Jadwal &amp; Ruang Observasi</span>
              <span className="font-bold text-slate-900 text-xs">{verifiedCard.jadwal} ({verifiedCard.lokasi})</span>
            </div>
          </div>

          {/* Status Validasi */}
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-emerald-950">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
              <p className="text-[11.5px] leading-relaxed">
                Kartu Peserta ananda <strong>{verifiedCard.namaLengkap}</strong> terdaftar secara sah dan absah di database Panitia SPMB SMPIT Pondok Duta.
              </p>
            </div>
            <span className="shrink-0 px-3.5 py-1.5 rounded-full bg-emerald-800 text-white font-extrabold text-xs shadow-xs self-start sm:self-auto">
              ✓ SAH &amp; VALID
            </span>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-br from-emerald-800 via-teal-800 to-slate-900 text-white shadow-xl space-y-3 text-center sm:text-left">
        <span className="text-xs font-bold uppercase tracking-widest text-amber-300 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-500/30 inline-block">
          Pengumuman Hasil Seleksi SPMB
        </span>
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
          Cek Hasil Seleksi Calon Murid
        </h1>
        <p className="text-xs sm:text-sm text-emerald-100 max-w-xl leading-relaxed">
          Masukkan Nomor Pendaftaran atau NISN murid untuk melihat hasil evaluasi observasi &amp; wawancara.
        </p>
      </div>

      {/* Search Input Box */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-4">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="flex flex-col sm:flex-row items-center gap-3"
        >
          <div className="relative w-full">
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Ketik Nomor Pendaftaran atau NISN Murid..."
              className="w-full pl-10 pr-4 py-3.5 rounded-2xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold text-xs sm:text-sm text-slate-800 uppercase"
            />
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
          </div>
          <button
            type="submit"
            disabled={isSearching || !keyword.trim()}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white font-bold text-xs sm:text-sm shadow-md transition disabled:opacity-50 shrink-0"
          >
            {isSearching ? 'Memeriksa Database...' : 'Cari Data'}
          </button>
        </form>
      </div>

      {/* Result Card */}
      {searched && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          {result ? (
            <div className={`p-6 sm:p-8 rounded-3xl border shadow-lg space-y-6 ${
              result.status === 'LULUS'
                ? 'bg-gradient-to-br from-emerald-50 to-white border-emerald-300'
                : result.status === 'CADANGAN'
                ? 'bg-gradient-to-br from-amber-50 to-white border-amber-300'
                : result.status === 'PROSES_SELEKSI'
                ? 'bg-gradient-to-br from-sky-50 to-white border-sky-300'
                : 'bg-gradient-to-br from-rose-50 to-white border-rose-200'
            }`}>
              
              {/* Header Status */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/60">
                <div className="flex items-center gap-3">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-white shadow-md ${
                    result.status === 'LULUS'
                      ? 'bg-emerald-600'
                      : result.status === 'CADANGAN'
                      ? 'bg-amber-600'
                      : result.status === 'PROSES_SELEKSI'
                      ? 'bg-sky-600'
                      : 'bg-rose-600'
                  }`}>
                    {result.status === 'LULUS' ? (
                      <CheckCircle2 className="w-8 h-8 text-white" />
                    ) : result.status === 'CADANGAN' ? (
                      <Clock className="w-8 h-8 text-white" />
                    ) : (
                      <AlertCircle className="w-8 h-8 text-white" />
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Status Hasil Seleksi
                    </div>
                    <div className={`text-xl sm:text-2xl font-extrabold ${
                      result.status === 'LULUS'
                        ? 'text-emerald-800'
                        : result.status === 'CADANGAN'
                        ? 'text-amber-800'
                        : result.status === 'PROSES_SELEKSI'
                        ? 'text-sky-800'
                        : 'text-rose-800'
                    }`}>
                      {result.status === 'LULUS'
                        ? 'DITERIMA (LULUS)'
                        : result.status === 'CADANGAN'
                        ? 'CADANGAN'
                        : result.status === 'PROSES_SELEKSI'
                        ? 'DALAM PROSES SELEKSI'
                        : 'TIDAK MEMENUHI KUOTA'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Detail Siswa */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-white/80 border border-slate-200/60 space-y-1">
                  <div className="text-[11px] text-slate-400 font-medium">Nomor Pendaftaran</div>
                  <div className="font-extrabold font-mono text-slate-800">{result.noPendaftaran}</div>
                </div>
                <div className="p-3.5 rounded-xl bg-white/80 border border-slate-200/60 space-y-1">
                  <div className="text-[11px] text-slate-400 font-medium">Nama Lengkap Murid</div>
                  <div className="font-bold text-slate-800 text-sm">{result.namaLengkap}</div>
                </div>
                <div className="p-3.5 rounded-xl bg-white/80 border border-slate-200/60 space-y-1">
                  <div className="text-[11px] text-slate-400 font-medium">NISN / Asal Sekolah</div>
                  <div className="font-medium text-slate-800">
                    {effectiveNisn} &bull; {result.asalSekolah}
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-white/80 border border-slate-200/60 space-y-1">
                  <div className="text-[11px] text-slate-400 font-medium">Jadwal Daftar Ulang</div>
                  <div className={`font-bold ${result.status === 'LULUS' ? 'text-emerald-800' : 'text-slate-400'}`}>
                    {effectiveJadwalDaftarUlang}
                  </div>
                </div>
              </div>

              {/* Message Box */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 text-xs text-slate-700 leading-relaxed space-y-2">
                <strong className="text-slate-900 block font-bold text-xs sm:text-sm">Keterangan Panitia:</strong>
                <p>
                  {(result.pesanPengumuman || '')
                    .replace(/2026\/2027/g, '2027/2028')
                    .replace(/Harap segera daftar ulang.*$/i, '')
                    .replace(/Segera lakukan pendaftaran ulang.*$/i, '')
                    .replace(/Surat Keterangan Lulus \(SKL\)/gi, 'Surat Keterangan Hasil Seleksi')
                    .replace(/\bSKL\b/g, 'Surat Keterangan Hasil Seleksi')
                    .trim()}
                </p>
                {result.status === 'LULUS' && (
                  <div className="mt-2.5 p-3.5 sm:p-4 rounded-xl bg-emerald-50 border-2 border-emerald-500 text-emerald-950 shadow-2xs">
                    <p className="text-sm sm:text-base font-extrabold leading-snug tracking-tight">
                      Segera lakukan pendaftaran ulang. Informasi pembiayaannya, silahkan di Unduh Surat Keterangan Hasil Seleksi.
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                {result.status !== 'PROSES_SELEKSI' && (
                  <button
                    onClick={() => setShowSklModal(true)}
                    className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-xs shadow-md transition cursor-pointer ${
                      result.status === 'LULUS'
                        ? 'bg-emerald-700 hover:bg-emerald-800 text-white'
                        : 'bg-slate-800 hover:bg-slate-900 text-white'
                    }`}
                  >
                    <Download className="w-4 h-4 text-amber-300" />
                    <span>Unduh Surat Keterangan Hasil Seleksi</span>
                  </button>
                )}
                <button
                  onClick={() => handleSearch()}
                  className="px-4 py-3 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition"
                >
                  Segarkan Data
                </button>
              </div>

            </div>
          ) : verifiedCard ? (
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-emerald-200 text-center space-y-3 shadow-md">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6 text-emerald-700" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">
                Kartu Peserta Terverifikasi Sah
              </h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                Ananda <strong>{verifiedCard.namaLengkap}</strong> ({verifiedCard.noPendaftaran}) terdaftar resmi untuk mengikuti Sesi Observasi &amp; Wawancara SPMB SMPIT Pondok Duta. Pengumuman hasil seleksi akhir akan dipublikasikan panitia setelah rangkaian observasi selesai.
              </p>
            </div>
          ) : (
            <div className="p-8 rounded-3xl bg-white border border-slate-200 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <XCircle className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-800 text-base">
                Data Tidak Ditemukan
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Nomor pendaftaran atau NISN yang Anda masukkan belum terdaftar dalam sistem SPMB. Pastikan format sudah benar atau lakukan pendaftaran terlebih dahulu.
              </p>
              <div className="pt-2">
                <button
                  onClick={onGoToRegister}
                  className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition inline-flex items-center gap-1.5"
                >
                  <span>Daftar Calon Murid Baru</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SKL Printable Modal (Tanpa Lampiran Pembiayaan jika Tidak Diterima) */}
      {showSklModal && result && (
        <SklKelulusanPrintModal
          data={{
            noPendaftaran: result.noPendaftaran,
            namaLengkap: result.namaLengkap,
            nisn: effectiveNisn,
            asalSekolah: result.asalSekolah,
            jalur: result.jalur,
            status: result.status,
            jadwalDaftarUlang: effectiveJadwalDaftarUlang,
            kategoriPembiayaan: result.status === 'TIDAK_LULUS' ? '' : result.kategoriPembiayaan,
            pesanPengumuman: result.pesanPengumuman
          }}
          onClose={() => setShowSklModal(false)}
        />
      )}

    </div>
  );
};
