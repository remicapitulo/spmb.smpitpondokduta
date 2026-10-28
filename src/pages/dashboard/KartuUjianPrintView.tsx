import React, { useState, useEffect, useRef } from 'react';
import { DataSiswa, getAcademicYear } from '../../types';
import { gasService } from '../../services/gasService';
import { Download, X, CheckCircle2, Loader2, FileText, Image as ImageIcon, QrCode, ShieldCheck } from 'lucide-react';
import QRCode from 'qrcode';
import html2canvas from 'html2canvas';
import { downloadElementAsPdf } from '../../utils/downloadPdfDocument';
import { patchGetComputedStyle, sanitizeDocumentForCanvas } from '../../utils/colorSanitizer';
import { LOGO_PONDOK_DUTA_BASE64 } from '../../assets/logoBase64';

interface Props {
  siswa: DataSiswa;
  onClose: () => void;
}

export const KartuUjianPrintView: React.FC<Props> = ({ siswa: rawSiswaProp, onClose }) => {
  const dbSiswa = rawSiswaProp?.noPendaftaran ? gasService.getSiswaByNo(rawSiswaProp.noPendaftaran) : null;
  const siswa: DataSiswa = {
    ...dbSiswa,
    ...rawSiswaProp,
    namaLengkap: (rawSiswaProp.namaLengkap && rawSiswaProp.namaLengkap !== 'Calon Peserta Didik')
      ? rawSiswaProp.namaLengkap
      : (dbSiswa?.namaLengkap || ''),
    namaPanggilan: rawSiswaProp.namaPanggilan || dbSiswa?.namaPanggilan || (rawSiswaProp.namaLengkap || dbSiswa?.namaLengkap || '').split(' ')[0] || '',
    asalSekolah: (rawSiswaProp.asalSekolah && rawSiswaProp.asalSekolah !== 'SD/MI Asal')
      ? rawSiswaProp.asalSekolah
      : (dbSiswa?.asalSekolah || ''),
    namaAyah: rawSiswaProp.namaAyah || dbSiswa?.namaAyah || '',
    noHpAyah: rawSiswaProp.noHpAyah || rawSiswaProp.nomorHandphone || dbSiswa?.noHpAyah || dbSiswa?.nomorHandphone || ''
  } as DataSiswa;

  const [logoBase64, setLogoBase64] = useState<string>(LOGO_PONDOK_DUTA_BASE64);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isDownloadingPdf, setIsDownloadingPdf] = useState<boolean>(false);
  const [isDownloadingPng, setIsDownloadingPng] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string>('');
  const cardRef = useRef<HTMLDivElement | null>(null);

  // Preload logo kustom dari pengaturan jika ada, fallback ke Base64 lokal resmi
  useEffect(() => {
    const rawLogo = gasService.getAppSettings().logoUrl;
    if (!rawLogo || rawLogo === '/logo-smpit-pondok-duta.png') {
      setLogoBase64(LOGO_PONDOK_DUTA_BASE64);
      return;
    }
    const resolvedUrl = gasService.resolveImageUrl(rawLogo);
    if (!resolvedUrl) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || 270;
        canvas.height = img.naturalHeight || 270;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          setLogoBase64(canvas.toDataURL('image/png'));
        } else {
          setLogoBase64(LOGO_PONDOK_DUTA_BASE64);
        }
      } catch {
        setLogoBase64(LOGO_PONDOK_DUTA_BASE64);
      }
    };
    img.onerror = () => setLogoBase64(LOGO_PONDOK_DUTA_BASE64);
    img.src = resolvedUrl;
  }, []);

  useEffect(() => {
    // Generate 100% Real Scannable QR Code yang dapat dibuka langsung dari HP
    let hostOrigin = typeof window !== 'undefined' && window.location ? window.location.origin : '';
    if (hostOrigin.includes('localhost') || hostOrigin.includes('127.0.0.1')) {
      hostOrigin = 'https://ais-pre-v4ovydp5l654kzwgy4biwq-755407641990.asia-southeast1.run.app';
    } else if (hostOrigin.includes('ais-dev-')) {
      hostOrigin = hostOrigin.replace('ais-dev-', 'ais-pre-');
    }

    const ortuStr = siswa.namaAyah || siswa.namaIbu || '';
    const hpStr = siswa.noHpAyah || siswa.noHpIbu || siswa.nomorHandphone || siswa.nomorTelepon || '';

    // Gunakan URL ringkas agar kepadatan titik QR Code rendah (kotak besar & tegas),
    // sehingga kamera HP langsung mendeteksi QR dari layar laptop/HP dalam <0.5 detik tanpa perlu zoom!
    const queryParams = new URLSearchParams({
      verifikasi: 'true',
      no: siswa.noPendaftaran || ''
    });
    if (siswa.namaLengkap && siswa.namaLengkap !== 'Calon Peserta Didik') {
      queryParams.set('nama', siswa.namaLengkap);
    }
    if (siswa.asalSekolah && siswa.asalSekolah !== 'SD/MI Asal') {
      queryParams.set('asal', siswa.asalSekolah);
    }
    if (ortuStr && ortuStr !== '-') {
      queryParams.set('ortu', ortuStr);
    }
    if (hpStr && hpStr !== '-') {
      queryParams.set('hp', hpStr);
    }

    const verificationUrl = `${hostOrigin}/?${queryParams.toString()}`;

    QRCode.toDataURL(verificationUrl, {
      width: 600,
      margin: 2,
      color: {
        dark: '#000000', // Hitam pekat solid untuk deteksi optik kamera HP instan & akurat
        light: '#ffffff'
      },
      errorCorrectionLevel: 'L'
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => {
        console.error('Gagal generate QR Code:', err);
      });
  }, [siswa.noPendaftaran, siswa.namaLengkap, siswa.asalSekolah, siswa.nisn, siswa.nik, siswa.namaAyah, siswa.noHpAyah]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Handler Unduh Kartu Peserta Format PDF Resmi (Dokumen Cetak Ukuran A4 - Langsung Unduh File PDF)
  const handleDownloadPdf = async () => {
    if (isDownloadingPdf || isDownloadingPng) return;
    setIsDownloadingPdf(true);
    setDownloadSuccess('');

    try {
      const cardElement = cardRef.current;
      if (!cardElement) {
        throw new Error('Element kartu tidak ditemukan');
      }

      const safeName = (siswa.namaLengkap || 'Murid').trim().replace(/[^a-zA-Z0-9_-]/g, '_');
      const fileName = `Kartu_Peserta_SPMB_${siswa.noPendaftaran || 'PD'}_${safeName}.pdf`;

      await downloadElementAsPdf({
        element: cardElement,
        fileName,
        pdfTitle: `Kartu Peserta SPMB - ${siswa.namaLengkap}`,
        footerText: `Dokumen resmi SPMB SMPIT Pondok Duta · TP ${getAcademicYear()} · Diterbitkan digital & sah terverifikasi via QR Code.`,
        margin: 10
      });

      setDownloadSuccess('Berhasil mengunduh dokumen PDF Kartu Peserta!');
      setTimeout(() => setDownloadSuccess(''), 4000);
    } catch (error) {
      console.error('Gagal mengunduh PDF Kartu Peserta:', error);
      alert('Gagal mengunduh dokumen PDF. ' + (error instanceof Error ? error.message : ''));
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  // Handler Unduh Kartu Peserta Format Gambar (PNG HD Berkualitas Tinggi)
  const handleDownloadPng = async () => {
    if (isDownloadingPdf || isDownloadingPng) return;
    setIsDownloadingPng(true);
    setDownloadSuccess('');

    const restoreComputedStyle = patchGetComputedStyle(window);

    try {
      const cardElement = cardRef.current;
      if (!cardElement) {
        throw new Error('Element kartu tidak ditemukan');
      }

      const canvas = await html2canvas(cardElement, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        logging: false,
        windowWidth: 1024,
        scrollX: 0,
        scrollY: 0,
        onclone: (clonedDoc) => {
          sanitizeDocumentForCanvas(clonedDoc);
          const clonedCard = clonedDoc.getElementById('printable-kartu-peserta');
          if (clonedCard) {
            clonedCard.style.width = '760px';
            clonedCard.style.minWidth = '760px';
            clonedCard.style.maxWidth = '760px';
          }
        }
      });

      const safeName = (siswa.namaLengkap || 'Murid').trim().replace(/[^a-zA-Z0-9_-]/g, '_');
      const fileName = `Kartu_Peserta_SPMB_${siswa.noPendaftaran || 'PD'}_${safeName}.png`;

      canvas.toBlob((blob) => {
        if (!blob) {
          alert('Gagal membuat gambar PNG.');
          return;
        }
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        setTimeout(() => {
          document.body.removeChild(link);
          URL.revokeObjectURL(blobUrl);
        }, 800);
        setDownloadSuccess('Berhasil mengunduh gambar PNG Kartu Peserta!');
        setTimeout(() => setDownloadSuccess(''), 4000);
      }, 'image/png', 1.0);
    } catch (error) {
      console.error('Gagal unduh PNG:', error);
      alert('Gagal mengunduh gambar PNG. Silakan coba opsi Unduh PDF.');
    } finally {
      restoreComputedStyle();
      setIsDownloadingPng(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-xs p-2 sm:p-4 md:p-6 animate-in fade-in duration-200"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-4xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 flex flex-col max-h-[94vh] overflow-hidden my-auto">
        
        {/* Controls Header */}
        <div className="no-print flex items-center justify-between px-4 sm:px-6 py-3 border-b border-slate-200 bg-white shrink-0 z-10 gap-2">
          <div className="min-w-0 flex-1 pr-1">
            <h3 className="text-xs sm:text-base font-bold text-slate-900 truncate flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block animate-pulse shrink-0"></span>
              <span>Pratinjau Kartu Peserta Ujian &amp; Observasi</span>
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-500 truncate mt-0.5">
              Dokumen resmi SPMB SMPIT Pondok Duta (Siap Cetak &amp; Unduh PDF / Gambar)
            </p>
          </div>
          <button
            onClick={onClose}
            title="Tutup (Esc)"
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notifikasi Sukses Unduh */}
        {downloadSuccess && (
          <div className="no-print bg-emerald-600 text-white px-4 py-2 text-xs font-semibold flex items-center justify-between transition-all">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-200" />
              <span>{downloadSuccess}</span>
            </div>
            <button onClick={() => setDownloadSuccess('')} className="text-emerald-100 hover:text-white text-xs">✕</button>
          </div>
        )}

        {/* Scrollable Preview Canvas (Pas di layar tanpa melebihi layout) */}
        <div className="overflow-y-auto overflow-x-hidden flex-1 p-3 sm:p-6 bg-slate-100/70 custom-scrollbar">

          {/* Printable Official Card Body (Responsive di layar, otomatis 794px saat cetak PDF/PNG) */}
          <div 
            ref={cardRef}
            id="printable-kartu-peserta"
            className="print-container w-full max-w-[760px] mx-auto border-4 border-double border-emerald-900 rounded-2xl p-4 sm:p-6 bg-white space-y-4 text-slate-900 shadow-sm relative overflow-hidden font-sans"
            style={{ fontFamily: "'Plus Jakarta Sans', Arial, Helvetica, sans-serif" }}
          >
            {/* Background Accent Subtle Watermark */}
            <div className="absolute right-0 top-0 translate-x-1/4 -translate-y-1/4 w-80 h-80 bg-emerald-50 rounded-full blur-3xl pointer-events-none opacity-40"></div>
            
            {/* KOP KARTU RESMI DINAS SEKOLAH (GARIS GANDA TEBAL-TIPIS RESMI) */}
            <div className="border-b-4 border-double border-slate-900 pb-3 relative">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {/* Logo Resmi Sekolah Base64 (0% Taint / 100% CORS Safe) */}
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white border border-emerald-300 flex items-center justify-center p-1 shadow-2xs shrink-0 overflow-hidden">
                    <img
                      src={logoBase64 || LOGO_PONDOK_DUTA_BASE64}
                      alt="Logo Resmi SMPIT Pondok Duta"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="min-w-0 space-y-0.5">
                    <div className="text-[10px] sm:text-[11px] font-bold text-slate-600 uppercase tracking-widest">
                      YAYASAN PERGURUAN ISLAM PONDOK DUTA
                    </div>
                    <div className="text-lg sm:text-2xl font-black text-slate-900 leading-tight tracking-wide">
                      SMPIT PONDOK DUTA
                    </div>
                    <div className="text-[9px] sm:text-[9.5px] text-slate-600 leading-snug">
                      <span className="font-bold text-emerald-800">Terakreditasi "A" BAN-PDM</span> | NPSN: 20276180 | NSS: 202026601007
                    </div>
                    <div className="text-[8.5px] sm:text-[9px] text-slate-500 leading-snug">
                      Perumahan Pondok Duta, Jl. Duta Plaza No. 1, Kel. Tugu, Kec. Cimanggis, Kota Depok 16451 | Telp: (021) 29378301
                    </div>
                  </div>
                </div>

                <div className="shrink-0 self-start sm:self-center text-right">
                  <div className="px-3.5 py-2 rounded-xl bg-slate-900 text-white text-center shadow-xs border border-slate-800 space-y-0.5">
                    <span className="block text-[10.5px] sm:text-[11.5px] font-black uppercase tracking-wider leading-none">
                      KARTU TANDA PESERTA
                    </span>
                    <span className="block text-[9px] sm:text-[9.5px] text-emerald-300 font-semibold leading-none pt-0.5">
                      OBSERVASI &amp; WAWANCARA
                    </span>
                    <span className="block text-[8.5px] sm:text-[9px] font-mono text-slate-300 font-bold leading-none pt-0.5">
                      TP {getAcademicYear()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Banner Nomor Registrasi */}
            <div className="p-3 bg-emerald-50/90 border border-emerald-200 rounded-xl flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                  NOMOR REGISTRASI / PENDAFTARAN
                </span>
                <span className="text-xl sm:text-2xl font-black font-mono text-emerald-950 tracking-wider">
                  {siswa.noPendaftaran}
                </span>
              </div>
              <div className="text-right flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-emerald-100 border border-emerald-300 text-emerald-900 font-bold text-[11px] sm:text-xs">
                  {siswa.jalurPendaftaran || 'Jalur Reguler SPMB'}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-800 text-white text-[11px] sm:text-xs font-bold inline-flex items-center gap-1 shadow-2xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                  <span>TERDAFTAR RESMI</span>
                </span>
              </div>
            </div>

            {/* Main Card Content (2 Columns: Foto+QR di kiri, Biodata Lengkap di kanan) */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5 relative">
              
              {/* Kolom Kiri: Foto 3x4 & QR Code Verifikasi HP Ukuran Besar */}
              <div className="w-full sm:w-[190px] shrink-0 flex flex-row sm:flex-col items-center justify-around sm:justify-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                {/* 3x4 Pas Foto Box */}
                <div className="w-[120px] sm:w-[140px] h-[155px] sm:h-[175px] border-2 border-dashed border-slate-300 rounded-xl bg-white flex flex-col items-center justify-center p-2 text-center text-slate-400 shrink-0 shadow-2xs">
                  <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 mb-1.5 text-xs">
                    3x4
                  </div>
                  <span className="text-[10px] font-bold text-slate-700">PAS FOTO RESMI</span>
                  <span className="text-[8.5px] text-slate-500">Ukuran 3 x 4 cm</span>
                  <span className="text-[8px] text-slate-400 mt-0.5">Warna (Biru / Merah)</span>
                </div>

                {/* 100% Real Scannable QR Code Ukuran Besar & Tajam */}
                <div className="w-[164px] border border-slate-200 rounded-xl p-2 bg-white flex flex-col items-center text-center shadow-2xs shrink-0">
                  <span className="text-[9px] font-bold text-slate-700 flex items-center justify-center gap-1 mb-1">
                    <QrCode className="w-3 h-3 text-emerald-800" />
                    <span>PINDAI DARI HP</span>
                  </span>
                  <div className="w-[148px] h-[148px] border border-slate-200 rounded-lg p-1 mx-auto flex items-center justify-center bg-white">
                    {qrDataUrl ? (
                      <img 
                        src={qrDataUrl} 
                        alt={`QR Code Verifikasi ${siswa.noPendaftaran}`}
                        className="w-full h-full object-contain"
                        style={{ imageRendering: 'pixelated' }}
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-50 animate-pulse rounded flex items-center justify-center text-[9px] text-slate-500 font-mono">
                        Membuat QR...
                      </div>
                    )}
                  </div>
                  <span className="text-[9px] font-mono font-bold text-slate-800 mt-1 block truncate max-w-[145px] bg-slate-100 px-1.5 py-0.5 rounded">
                    {siswa.noPendaftaran}
                  </span>
                  <span className="text-[8px] text-emerald-700 font-bold block mt-0.5">
                    Verifikasi Data Resmi
                  </span>
                </div>
              </div>

              {/* Kolom Kanan: Biodata Lengkap Murid & Jadwal */}
              <div className="w-full flex-1 min-w-0 space-y-3 text-xs">
                {/* Tabel Data Diri dengan Align Kolom Sempurna (100% Rapi & Sejajar) */}
                <table className="w-full text-xs font-sans">
                  <tbody>
                    <tr className="border-b border-slate-100">
                      <td className="py-1.5 text-slate-600 w-36 sm:w-44 font-semibold">Nama Lengkap Murid</td>
                      <td className="py-1.5 text-slate-400 w-3 font-bold">:</td>
                      <td className="py-1.5 font-bold text-slate-900 text-[13px] break-words">{siswa.namaLengkap}</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-1.5 text-slate-600 font-semibold">Nama Panggilan</td>
                      <td className="py-1.5 text-slate-400 font-bold">:</td>
                      <td className="py-1.5 text-slate-800 font-medium">{siswa.namaPanggilan || siswa.namaLengkap?.split(' ')[0] || '-'}</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-1.5 text-slate-600 font-semibold">NISN / NIK</td>
                      <td className="py-1.5 text-slate-400 font-bold">:</td>
                      <td className="py-1.5 text-slate-800 font-mono font-semibold">{siswa.nisn || '-'} / {siswa.nik || '-'}</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-1.5 text-slate-600 font-semibold">Jenis Kelamin</td>
                      <td className="py-1.5 text-slate-400 font-bold">:</td>
                      <td className="py-1.5 text-slate-800">{siswa.jenisKelamin || 'Laki-laki'}</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-1.5 text-slate-600 font-semibold">Tempat, Tanggal Lahir</td>
                      <td className="py-1.5 text-slate-400 font-bold">:</td>
                      <td className="py-1.5 text-slate-800">{siswa.tempatLahir || '-'}, {siswa.tanggalLahir || '-'}</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-1.5 text-slate-600 font-semibold">Asal Sekolah SD/MI</td>
                      <td className="py-1.5 text-slate-400 font-bold">:</td>
                      <td className="py-1.5 font-bold text-slate-900">{siswa.asalSekolah || '-'}</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-1.5 text-slate-600 font-semibold">Nama Orang Tua / Wali</td>
                      <td className="py-1.5 text-slate-400 font-bold">:</td>
                      <td className="py-1.5 text-slate-800 font-medium">{siswa.namaAyah || siswa.namaIbu || '-'}</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-1.5 text-slate-600 font-semibold">Nomor WhatsApp / HP</td>
                      <td className="py-1.5 text-slate-400 font-bold">:</td>
                      <td className="py-1.5 text-slate-800 font-mono">{siswa.noHpAyah || siswa.noHpIbu || siswa.nomorTelepon || '-'}</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-1.5 text-slate-600 font-semibold">Pilihan Jalur SPMB</td>
                      <td className="py-1.5 text-slate-400 font-bold">:</td>
                      <td className="py-1.5 font-bold text-emerald-800">{siswa.jalurPendaftaran || 'Jalur Reguler SPMB'}</td>
                    </tr>
                  </tbody>
                </table>

                {/* Jadwal & Lokasi Ujian / Observasi Resmi */}
                <div className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-200 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="border-l-3 border-emerald-600 pl-2.5">
                    <span className="text-slate-500 block font-semibold text-[10px] uppercase">Jadwal Pelaksanaan:</span>
                    <span className="font-bold text-slate-900 block text-xs">Sabtu, 17 Januari 2026</span>
                    <span className="block text-emerald-900 font-semibold text-[11px]">Pukul 08.00 - 11.30 WIB</span>
                  </div>
                  <div className="border-l-3 border-emerald-600 pl-2.5">
                    <span className="text-slate-500 block font-semibold text-[10px] uppercase">Ruang &amp; Agenda:</span>
                    <span className="font-bold text-slate-900 block text-xs">Ruang Aula - Gedung SMPIT Lt. 1</span>
                    <span className="block text-slate-600 font-medium text-[11px]">Observasi Murid &amp; Wawancara OTM</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Tata Tertib Sesi Observasi */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[10px] text-slate-600 space-y-1">
              <span className="font-bold text-slate-800 block text-[11px]">Tata Tertib Peserta:</span>
              <p className="leading-relaxed">
                1. Wajib hadir di lokasi 15 menit sebelum observasi dimulai dengan membawa Kartu Peserta ini.<br />
                2. Mengenakan seragam asal SD/MI masing-masing (putri berjilbab syar&apos;i).<br />
                3. Orang tua / wali murid wajib hadir mendampingi untuk sesi observasi wawancara orang tua (OTM).<br />
                4. Membawa perlengkapan alat tulis pensil 2B, pulpen, dan Al-Qur&apos;an / Juz &apos;Amma pribadi.
              </p>
            </div>

            {/* Blok Pengesahan Digital Resmi & Stempel Panitia SPMB */}
            <div className="p-3 rounded-xl border border-emerald-300 bg-emerald-50/90 flex items-center justify-between gap-3 text-emerald-950">
              <div className="flex items-center gap-3 text-left">
                <div className="w-10 h-10 rounded-xl bg-emerald-800 text-amber-300 flex items-center justify-center shrink-0 shadow-xs">
                  <ShieldCheck className="w-6 h-6 text-emerald-200" />
                </div>
                <div className="space-y-0.5">
                  <div className="font-bold text-xs text-emerald-950 flex items-center gap-1.5">
                    <span>DOKUMEN RESMI TERVERIFIKASI SAH SECARA HUKUM</span>
                  </div>
                  <p className="text-[9.5px] text-slate-600 leading-tight">
                    Kartu Peserta ini diterbitkan secara digital oleh Sistem SPMB SMPIT Pondok Duta. Keaslian dokumen terverifikasi via QR Code. <strong>Sah dan absah tanpa memerlukan tanda tangan basah panitia / calon murid.</strong>
                  </p>
                </div>
              </div>
              <div className="shrink-0 text-right pl-3 border-l border-emerald-200">
                <span className="inline-block px-3 py-1.5 rounded-full bg-emerald-800 text-white font-extrabold text-[10.5px] tracking-wide shadow-xs">
                  ✓ SAH &amp; TERDAFTAR
                </span>
                <span className="block text-[8px] text-slate-400 font-mono mt-0.5 text-center">
                  PANITIA SPMB SMPIT PD
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* Modal Bottom Action Bar dengan Tombol Unduh PDF, Unduh PNG, dan Cetak */}
        <div className="no-print px-4 sm:px-6 py-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-1.5 text-[11px] truncate">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="truncate">Kartu Peserta SPMB: <strong>{siswa.namaLengkap}</strong> ({siswa.noPendaftaran})</span>
          </div>
          <div className="flex flex-wrap items-center gap-2 self-stretch sm:self-auto justify-end">
            <button
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition cursor-pointer"
            >
              Tutup
            </button>
            
            {/* Tombol Unduh Gambar PNG */}
            <button
              type="button"
              onClick={handleDownloadPng}
              disabled={isDownloadingPng || isDownloadingPdf}
              className="px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-50 text-slate-800 text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer active:scale-95"
              title="Unduh file gambar PNG resolusi tinggi untuk disimpan di HP"
            >
              {isDownloadingPng ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-600" />
                  <span>Menyiapkan PNG...</span>
                </>
              ) : (
                <>
                  <ImageIcon className="w-3.5 h-3.5 text-slate-700" />
                  <span>Unduh PNG</span>
                </>
              )}
            </button>

            {/* Tombol Utama: Unduh PDF Resmi */}
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isDownloadingPdf || isDownloadingPng}
              className="flex-1 sm:flex-initial px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-95"
              title="Unduh dokumen PDF resmi ukuran A4 siap cetak"
            >
              {isDownloadingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menyiapkan PDF...</span>
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 text-emerald-400" />
                  <span>Unduh PDF Resmi</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
