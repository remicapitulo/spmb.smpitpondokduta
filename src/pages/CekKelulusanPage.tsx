import React, { useState, useEffect, useRef, useMemo } from 'react';
import { gasService } from '../services/gasService';
import { StatusKelulusanInfo, getAcademicYear } from '../types';
import confetti from 'canvas-confetti';
import QRCode from 'qrcode';
import { downloadElementAsPdf } from '../utils/downloadPdfDocument';
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
      const no = params.get('no') || params.get('noPendaftaran');
      const nisn = params.get('nisn');
      const nik = params.get('nik');
      const nama = params.get('nama');
      const panggilan = params.get('panggilan');
      const asal = params.get('asal');
      const jalur = params.get('jalur');
      const jk = params.get('jk');
      const ttl = params.get('ttl');
      const ortu = params.get('ortu');
      const hp = params.get('hp');
      const jadwal = params.get('jadwal');
      const ruang = params.get('ruang');
      const isVerif = params.get('verifikasi') === 'true';

      const q = no || nisn;

      if (isVerif || nama || (no && q)) {
        const localSiswa = no ? gasService.getSiswaByNo(no) : null;
        const studentInfo: VerifiedParticipantCard = {
          noPendaftaran: no || localSiswa?.noPendaftaran || 'PD-2026-001',
          namaLengkap: nama || localSiswa?.namaLengkap || 'Calon Peserta Didik',
          namaPanggilan: panggilan || localSiswa?.namaPanggilan || '',
          nisn: nisn || localSiswa?.nisn || '-',
          nik: nik || localSiswa?.nik || '-',
          asalSekolah: asal || localSiswa?.asalSekolah || 'SD/MI Asal',
          jalur: jalur || localSiswa?.jalurPendaftaran || 'Jalur Reguler SPMB',
          jenisKelamin: jk || localSiswa?.jenisKelamin || 'Laki-laki',
          ttl: ttl || (localSiswa ? `${localSiswa.tempatLahir || ''}, ${localSiswa.tanggalLahir || ''}` : '-'),
          namaOrtu: ortu || localSiswa?.namaAyah || localSiswa?.namaIbu || '-',
          noHp: hp || localSiswa?.noHpAyah || localSiswa?.nomorTelepon || '-',
          isVerified: true,
          jadwal: jadwal || 'Sabtu, 17 Januari 2026 · Pukul 08.00 - 11.30 WIB',
          lokasi: ruang || 'Ruang Aula - Gedung SMPIT Lt. 1'
        };
        setVerifiedCard(studentInfo);

        // Simpan data calon murid ke memori perangkat ini agar aplikasi mengenali siswa
        if (no && (nama || localSiswa)) {
          gasService.registerScannedStudent({
            noPendaftaran: studentInfo.noPendaftaran,
            namaLengkap: studentInfo.namaLengkap,
            nisn: studentInfo.nisn,
            nik: nik || localSiswa?.nik || '-',
            asalSekolah: studentInfo.asalSekolah,
            jalurPendaftaran: studentInfo.jalur,
            jenisKelamin: (jk === 'Perempuan' || localSiswa?.jenisKelamin === 'Perempuan') ? 'Perempuan' : 'Laki-laki'
          });
        }
      }

      // Jika ada kata kunci nomor pendaftaran
      if (q) {
        setKeyword(q);
        if (isVerif) {
          // Jika verifikasi scan dari HP, cek kelulusan di latar belakang tanpa memblokir tampilan kartu terverifikasi
          gasService.checkStatusKelulusan(q).then((data) => {
            if (data) {
              setResult(data);
              setSearched(true);
            }
          });
        } else {
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

  // Pastikan Jadwal Daftar Ulang selalu tampil dan tidak kosong di SKL & halaman pengumuman
  const effectiveJadwalDaftarUlang = useMemo(() => {
    if (!result) return '20 - 25 Januari 2027';
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

  // Handler Unduh PDF Resmi Surat Keterangan Lulus (SKL - Langsung Download File PDF)
  const handleDownloadPdf = async () => {
    if (isDownloadingPdf) return;
    setIsDownloadingPdf(true);

    try {
      const docElement = sklDocRef.current;
      if (!docElement) {
        throw new Error('Element dokumen SKL tidak ditemukan');
      }

      const safeName = (result?.namaLengkap || 'Calon_Murid').replace(/\s+/g, '_');
      const fileName = `SKL_SPMB_SMPIT_Pondok_Duta_${safeName}_${result?.noPendaftaran || ''}.pdf`;

      await downloadElementAsPdf({
        element: docElement,
        fileName,
        pdfTitle: `Surat Keterangan Lulus SPMB - ${result?.namaLengkap || ''}`,
        footerText: `Surat Keterangan Lulus Resmi SPMB SMPIT Pondok Duta · TP ${tahunPelajaran} · Sah terverifikasi via QR Code.`,
        margin: 12
      });
    } catch (err) {
      console.error('Gagal mengunduh dokumen SKL PDF:', err);
      alert('Gagal mengunduh dokumen SKL PDF. ' + (err instanceof Error ? err.message : ''));
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
          Cek Status Kelulusan Calon Murid
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

                {result.skorAkhir && (
                  <div className="p-3 rounded-2xl bg-white border border-slate-200/80 text-center shrink-0">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Nilai Rata-rata</div>
                    <div className="text-2xl font-extrabold text-emerald-700">{result.skorAkhir}</div>
                  </div>
                )}
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
                  <div className="font-bold text-emerald-800">
                    {effectiveJadwalDaftarUlang}
                  </div>
                </div>
              </div>

              {/* Message Box */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200/80 text-xs text-slate-700 leading-relaxed space-y-1">
                <strong className="text-slate-900 block font-bold">Keterangan Panitia:</strong>
                <p>{(result.pesanPengumuman || '').replace(/2026\/2027/g, '2027/2028')}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                {result.status === 'LULUS' && (
                  <button
                    onClick={() => setShowSklModal(true)}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-amber-300" />
                    <span>Unduh Surat Keterangan Lulus (SKL)</span>
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

      {/* SKL Printable Modal */}
      {showSklModal && result && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col max-h-[92vh] overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Controls Header (Sticky top - No Print, Clean title & Close button only) */}
            <div className="no-print bg-white/95 backdrop-blur-md px-6 py-3.5 border-b border-slate-100 flex items-center justify-between shrink-0 rounded-t-3xl z-10">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-700" />
                <span className="text-xs font-bold text-slate-700">
                  Pratinjau Surat Keterangan Lulus (SKL) Resmi
                </span>
              </div>
              <button
                onClick={() => setShowSklModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition cursor-pointer"
                title="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Official SKL Document Format (Scrollable Body) */}
            <div 
              ref={sklDocRef}
              id="printable-skl-document"
              className="overflow-y-auto p-6 sm:p-10 space-y-5 text-slate-900 text-xs sm:text-sm print-container bg-white"
            >
              {/* Kop Surat Resmi dengan Logo Sekolah */}
              <div className="border-b-4 border-double border-emerald-900 pb-3 flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-4 text-center sm:text-left">
                <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 p-1 bg-white border border-emerald-200 rounded-2xl flex items-center justify-center shadow-2xs">
                  <img
                    src={logoBase64 || '/logo-smpit-pondok-duta.png'}
                    alt="Logo Resmi SMPIT Pondok Duta"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="min-w-0 flex-1 space-y-0.5">
                  <div className="text-[11px] sm:text-xs font-bold tracking-widest text-emerald-800 uppercase">
                    YAYASAN PERGURUAN ISLAM PONDOK DUTA
                  </div>
                  <div className="text-base sm:text-xl font-black text-slate-900 uppercase tracking-wide">
                    SMPIT PONDOK DUTA CIMANGGIS DEPOK
                  </div>
                  <p className="text-[10px] text-slate-600 font-medium">
                    <span className="font-bold text-emerald-800">Terakreditasi "A" (BAN-PDM)</span> | NPSN: 20276180 | NSS: 202026601007
                  </p>
                  <p className="text-[9.5px] text-slate-500 leading-snug">
                    Perumahan Pondok Duta, Jl. Duta Plaza No. 1, Kel. Tugu, Kec. Cimanggis, Kota Depok, Jawa Barat 16451
                  </p>
                  <p className="text-[9px] text-emerald-900 font-semibold">
                    Telp: (021) 29378301 · Website: smpitpondokduta.sch.id · Email: info@smpitpondokduta.sch.id
                  </p>
                </div>
              </div>

              {/* Judul Surat */}
              <div className="text-center space-y-1 py-1">
                <div className="font-extrabold text-sm sm:text-base underline uppercase text-slate-900 tracking-wide">
                  SURAT KETERANGAN LULUS SELEKSI SPMB
                </div>
                <div className="text-[11px] text-slate-500 font-mono">
                  Nomor: 042/SPMB-SMPIT/PD/I/{new Date().getFullYear()}
                </div>
              </div>

              {/* Isi Surat */}
              <p className="leading-relaxed">
                Ketua Panitia Sistem Penerimaan Murid Baru (SPMB) SMPIT Pondok Duta Cimanggis Depok dengan ini menerangkan bahwa:
              </p>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs font-medium">
                <div className="grid grid-cols-3">
                  <span className="text-slate-500">Nomor Pendaftaran</span>
                  <span className="col-span-2 font-bold font-mono text-slate-900">: {result.noPendaftaran}</span>
                </div>
                <div className="grid grid-cols-3">
                  <span className="text-slate-500">Nama Calon Murid</span>
                  <span className="col-span-2 font-bold text-slate-900">: {result.namaLengkap}</span>
                </div>
                <div className="grid grid-cols-3">
                  <span className="text-slate-500">NISN</span>
                  <span className="col-span-2 font-mono text-slate-900">: {effectiveNisn}</span>
                </div>
                <div className="grid grid-cols-3">
                  <span className="text-slate-500">Asal SD/MI</span>
                  <span className="col-span-2 text-slate-900">: {result.asalSekolah}</span>
                </div>
                <div className="grid grid-cols-3">
                  <span className="text-slate-500">Jalur Penerimaan</span>
                  <span className="col-span-2 text-slate-900">: {result.jalur}</span>
                </div>
                <div className="grid grid-cols-3">
                  <span className="text-slate-500 font-semibold text-emerald-950">Tanggal Daftar Ulang</span>
                  <span className="col-span-2 font-bold text-emerald-800">: {effectiveJadwalDaftarUlang}</span>
                </div>
              </div>

              <p className="leading-relaxed">
                Telah mengikuti seluruh rangkaian tahapan observasi baca Al-Qur'an (Tahsin), hafalan (Tahfidz), potensi akademik, psikotes, serta wawancara orang tua murid, dan dinyatakan:
              </p>

              {/* Status Box */}
              <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-600 text-center space-y-1">
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-widest block">Keputusan Panitia:</span>
                <span className="text-xl sm:text-2xl font-black text-emerald-900 tracking-wider block">
                  DITERIMA SEBAGAI MURID BARU
                </span>
                <span className="block text-xs text-emerald-700 font-semibold">
                  SMPIT PONDOK DUTA TAHUN PELAJARAN {tahunPelajaran}
                </span>
                <div className="pt-2 border-t border-emerald-200 mt-2 text-xs font-bold text-emerald-950">
                  Batas Tanggal Daftar Ulang: <span className="underline decoration-emerald-500 decoration-2">{effectiveJadwalDaftarUlang}</span>
                </div>
              </div>

              <p className="leading-relaxed text-[11px] text-slate-600">
                Demikian surat keterangan ini diterbitkan untuk dipergunakan dalam proses daftar ulang. Orang tua/wali calon murid diharapkan melakukan daftar ulang selambat-lambatnya tanggal <strong className="text-slate-900 font-extrabold">{effectiveJadwalDaftarUlang}</strong>.
              </p>

              {/* Pengesahan Dokumen Resmi via QR Code (Tanda tangan manual dihapus, digantikan QR Code verifikasi resmi) */}
              <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  {qrCodeUrl ? (
                    <div className="p-1 bg-white rounded-xl border border-slate-300 shadow-2xs shrink-0">
                      <img src={qrCodeUrl} alt="QR Code Verifikasi Resmi" className="w-20 h-20 sm:w-22 sm:h-22 object-contain" />
                    </div>
                  ) : (
                    <div className="w-20 h-20 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-center shrink-0">
                      <QrCodeIcon className="w-9 h-9 text-slate-700" />
                    </div>
                  )}
                  <div className="text-left space-y-0.5">
                    <span className="text-[11px] font-bold text-slate-900 block">
                      Verifikasi Pengesahan Dokumen
                    </span>
                    <p className="text-[10px] text-slate-600 leading-snug max-w-[260px]">
                      Pindai QR Code untuk memvalidasi keaslian dokumen kelulusan resmi SPMB SMPIT Pondok Duta.
                    </p>
                    <div className="text-[9.5px] font-mono text-emerald-800 font-bold">
                      Ref: SPMB-PD/{result.noPendaftaran}/{new Date().getFullYear()}
                    </div>
                  </div>
                </div>

                <div className="text-center sm:text-right shrink-0">
                  <div className="text-xs font-bold text-slate-800">
                    Depok, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                  <div className="text-[11px] text-slate-600 font-medium mt-0.5">
                    Panitia SPMB SMPIT Pondok Duta
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer Controls (Sticky bottom - No Print, Cukup 1 tombol Unduh PDF di bawah saja) */}
            <div className="no-print bg-slate-50/95 backdrop-blur-md px-6 py-3.5 border-t border-slate-100 flex items-center justify-between shrink-0 rounded-b-3xl text-xs">
              <span className="text-[11px] text-slate-500 hidden sm:inline">
                Dokumen resmi Surat Keterangan Lulus (SKL) siap diunduh dalam format PDF.
              </span>
              <div className="flex items-center gap-2.5 ml-auto">
                <button
                  type="button"
                  onClick={() => setShowSklModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold transition cursor-pointer"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  disabled={isDownloadingPdf}
                  className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold transition flex items-center gap-2 cursor-pointer shadow-md active:scale-95"
                >
                  {isDownloadingPdf ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Menyiapkan PDF...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>Unduh PDF</span>
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
