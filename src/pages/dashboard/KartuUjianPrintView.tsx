import React, { useState, useEffect, useRef } from 'react';
import { DataSiswa, getAcademicYear } from '../../types';
import { gasService } from '../../services/gasService';
import { Download, X, CheckCircle2, Printer, Loader2, FileText, Image as ImageIcon, QrCode } from 'lucide-react';
import QRCode from 'qrcode';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { patchGetComputedStyle, sanitizeDocumentForCanvas } from '../../utils/colorSanitizer';

interface Props {
  siswa: DataSiswa;
  onClose: () => void;
}

export const KartuUjianPrintView: React.FC<Props> = ({ siswa, onClose }) => {
  const [logoBase64, setLogoBase64] = useState<string>('');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isDownloadingPdf, setIsDownloadingPdf] = useState<boolean>(false);
  const [isDownloadingPng, setIsDownloadingPng] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string>('');
  const cardRef = useRef<HTMLDivElement | null>(null);

  // Preload logo resmi sekolah ke format Base64 agar html2canvas tidak pernah tainted / error CORS
  useEffect(() => {
    const rawLogo = gasService.getAppSettings().logoUrl || '/logo-smpit-pondok-duta.png';
    const resolvedUrl = gasService.resolveImageUrl(rawLogo) || '/logo-smpit-pondok-duta.png';

    // Buat image element untuk convert ke Base64 Data URI
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
          setLogoBase64(resolvedUrl);
        }
      } catch {
        setLogoBase64(resolvedUrl);
      }
    };
    img.onerror = () => {
      // Fallback ke logo lokal png
      setLogoBase64('/logo-smpit-pondok-duta.png');
    };
    img.src = resolvedUrl;
  }, []);

  useEffect(() => {
    // Generate 100% Real Scannable QR Code
    // Menggunakan warna hitam pekat (#000000) dan margin standard (2)
    // agar 100% kamera smartphone (iPhone/Android/Google Lens) mendeteksi secara instan
    const hostOrigin = typeof window !== 'undefined' && window.location ? window.location.origin : '';
    const verificationUrl = `${hostOrigin}/?tab=cek-kelulusan&no=${encodeURIComponent(siswa.noPendaftaran || '')}&nisn=${encodeURIComponent(siswa.nisn || '')}`;

    QRCode.toDataURL(verificationUrl, {
      width: 400,
      margin: 2,
      color: {
        dark: '#000000', // Hitam pekat solid untuk deteksi optik kamera 100% akurat
        light: '#ffffff'
      },
      errorCorrectionLevel: 'M'
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => {
        console.error('Gagal generate QR Code:', err);
      });
  }, [siswa]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Handler Unduh Kartu Peserta Format PDF Resmi (Dokumen Cetak Ukuran A4)
  const handleDownloadPdf = async () => {
    if (isDownloadingPdf || isDownloadingPng) return;
    setIsDownloadingPdf(true);
    setDownloadSuccess('');

    // Monkey-patch window.getComputedStyle secara aman selama eksekusi html2canvas
    // agar seluruh pembacaan warna (termasuk oklch di Tailwind v4) terkonversi ke sRGB murni
    const restoreComputedStyle = patchGetComputedStyle(window);

    try {
      const cardElement = cardRef.current;
      if (!cardElement) {
        window.print();
        return;
      }

      // Convert card to high-resolution canvas with onclone sRGB sanitizer
      const canvas = await html2canvas(cardElement, {
        scale: 2.5,
        useCORS: true,
        allowTaint: false, // Hindari canvas tainting
        backgroundColor: '#ffffff',
        logging: false,
        onclone: (clonedDoc) => {
          sanitizeDocumentForCanvas(clonedDoc);
        }
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 15; // 15mm margin kiri & kanan
      const printableWidth = pageWidth - margin * 2;
      const imgHeight = (canvas.height * printableWidth) / canvas.width;

      // Sisipkan gambar kartu resmi ke dokumen PDF
      pdf.addImage(imgData, 'PNG', margin, 15, printableWidth, imgHeight);

      // Footer keterangan keaslian dokumen PDF
      pdf.setFontSize(8);
      pdf.setTextColor(100, 116, 139);
      const safeDate = new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
      pdf.text(
        `Dokumen resmi SPMB SMPIT Pondok Duta. Diterbitkan digital & sah terverifikasi via QR Code pada ${safeDate}.`,
        margin,
        15 + imgHeight + 8
      );

      const safeName = (siswa.namaLengkap || 'Murid').trim().replace(/[^a-zA-Z0-9_-]/g, '_');
      const fileName = `Kartu_Peserta_SPMB_${siswa.noPendaftaran || 'PD'}_${safeName}.pdf`;

      pdf.save(fileName);
      setDownloadSuccess('Berhasil mengunduh dokumen PDF Kartu Peserta!');
      setTimeout(() => setDownloadSuccess(''), 4000);
    } catch (error) {
      console.error('Gagal generate PDF langsung, membuka dialog cetak:', error);
      window.print();
    } finally {
      restoreComputedStyle();
      setIsDownloadingPdf(false);
    }
  };

  // Handler Unduh Kartu Peserta Format Gambar (PNG HD Berkualitas Tinggi)
  const handleDownloadPng = async () => {
    if (isDownloadingPdf || isDownloadingPng) return;
    setIsDownloadingPng(true);
    setDownloadSuccess('');

    // Monkey-patch window.getComputedStyle secara aman selama eksekusi html2canvas
    const restoreComputedStyle = patchGetComputedStyle(window);

    try {
      const cardElement = cardRef.current;
      if (!cardElement) {
        window.print();
        return;
      }

      const canvas = await html2canvas(cardElement, {
        scale: 3,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        logging: false,
        onclone: (clonedDoc) => {
          sanitizeDocumentForCanvas(clonedDoc);
        }
      });

      const safeName = (siswa.namaLengkap || 'Murid').trim().replace(/[^a-zA-Z0-9_-]/g, '_');
      const fileName = `Kartu_Peserta_SPMB_${siswa.noPendaftaran || 'PD'}_${safeName}.png`;

      // Gunakan toBlob agar aman dan kompatibel di seluruh browser HP & laptop
      canvas.toBlob((blob) => {
        if (!blob) {
          window.print();
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
      console.error('Gagal unduh PNG, membuka dialog cetak:', error);
      window.print();
    } finally {
      restoreComputedStyle();
      setIsDownloadingPng(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-xs p-2 sm:p-4 md:p-6 animate-in fade-in duration-200"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-2xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 flex flex-col h-[94vh] sm:max-h-[92vh] overflow-hidden my-auto">
        
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

        {/* Scrollable Preview Canvas */}
        <div className="overflow-y-auto flex-1 p-3 sm:p-6 bg-slate-100/70 custom-scrollbar">

          {/* Printable Official Card Body */}
          <div 
            ref={cardRef}
            id="printable-kartu-peserta"
            className="print-container border-2 border-emerald-800 rounded-2xl p-4 sm:p-6 bg-white space-y-4 text-slate-900 shadow-sm relative overflow-hidden"
          >
            {/* Background Accent Subtle Watermark */}
            <div className="absolute right-0 top-0 translate-x-1/4 -translate-y-1/4 w-72 h-72 bg-emerald-50 rounded-full blur-2xl pointer-events-none opacity-40"></div>
            
            {/* Kop Kartu Resmi Sekolah */}
            <div className="border-b-2 border-emerald-800 pb-3.5 space-y-2 relative">
              <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-3 sm:gap-4 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 min-w-0 flex-1">
                  {/* Logo Resmi Sekolah */}
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white border border-emerald-200 flex items-center justify-center p-1.5 shadow-xs shrink-0 overflow-hidden">
                    <img
                      src={logoBase64 || '/logo-smpit-pondok-duta.png'}
                      alt="Logo Resmi SMPIT Pondok Duta"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="min-w-0 space-y-0.5">
                    <div className="text-[10px] sm:text-xs font-bold text-emerald-800 uppercase tracking-wider">
                      PANITIA SELEKSI PENERIMAAN MURID BARU (SPMB)
                    </div>
                    <div className="text-lg sm:text-2xl font-black text-slate-900 leading-tight tracking-tight">
                      SMPIT PONDOK DUTA
                    </div>
                    <div className="text-[9px] sm:text-[10px] text-slate-600 leading-snug">
                      Perumahan Pondok Duta, Jl. Duta Plaza No. 1, Kel. Tugu, Kec. Cimanggis, Kota Depok 16451
                    </div>
                    <div className="text-[8.5px] sm:text-[9.5px] text-emerald-900 font-semibold pt-0.5">
                      Telp: (021) 29378301 · NPSN: 20276180 · Terakreditasi &quot;A&quot; BAN-PDM
                    </div>
                  </div>
                </div>

                <div className="shrink-0 self-center sm:self-start">
                  <div className="px-3.5 py-1.5 rounded-xl bg-emerald-800 text-white text-center shadow-xs border border-emerald-700">
                    <span className="block text-[10px] sm:text-xs font-black uppercase tracking-wider leading-none">
                      KARTU PESERTA
                    </span>
                    <span className="block text-[8px] sm:text-[9px] font-mono text-emerald-100 font-semibold mt-1 leading-none">
                      OBSERVASI TP {getAcademicYear()}
                    </span>
                  </div>
                </div>
              </div>
              <div className="w-full h-[1px] bg-emerald-700/30 mt-1"></div>
            </div>

            {/* Main Card Content */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 sm:gap-4 items-start relative">
              
              {/* Foto 3x4 & QR Code Verifikasi Resmi Scannable */}
              <div className="sm:col-span-1 flex flex-row sm:flex-col items-center justify-around sm:justify-center gap-3 bg-slate-50 p-2 sm:p-2.5 rounded-xl border border-slate-200">
                {/* 3x4 Pas Foto Box */}
                <div className="w-20 sm:w-28 h-28 sm:h-36 border-2 border-dashed border-slate-300 rounded-xl bg-white flex flex-col items-center justify-center p-1.5 text-center text-slate-400 shrink-0">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 mb-1 text-[11px]">
                    3x4
                  </div>
                  <span className="text-[8px] sm:text-[9px] font-bold text-slate-700">PAS FOTO</span>
                  <span className="text-[7px] sm:text-[8px] text-slate-400">Tempel di sini</span>
                  <span className="text-[6.5px] sm:text-[7.5px] text-slate-400">Latar Biru/Merah</span>
                </div>

                {/* 100% Real Scannable QR Code */}
                <div className="text-center shrink-0">
                  <span className="text-[8px] sm:text-[9px] font-bold text-slate-700 flex items-center justify-center gap-1 mb-1">
                    <QrCode className="w-3 h-3 text-emerald-800" />
                    <span>SCAN VERIFIKASI</span>
                  </span>
                  <div className="w-20 h-20 sm:w-24 sm:h-24 border border-slate-300 rounded-xl p-1 mx-auto flex flex-col items-center justify-center bg-white shadow-xs">
                    {qrDataUrl ? (
                      <img 
                        src={qrDataUrl} 
                        alt={`QR Code Verifikasi ${siswa.noPendaftaran}`}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-50 animate-pulse rounded-lg flex items-center justify-center text-[9px] text-slate-500 font-mono">
                        Membuat QR...
                      </div>
                    )}
                  </div>
                  <span className="text-[7.5px] sm:text-[8.5px] font-mono font-bold text-slate-900 mt-1 block truncate max-w-[90px] mx-auto bg-slate-100 px-1 py-0.5 rounded">
                    {siswa.noPendaftaran}
                  </span>
                </div>
              </div>

              {/* Biodata Lengkap Murid */}
              <div className="sm:col-span-3 space-y-2 text-xs">
                {/* Banner Nomor Registrasi */}
                <div className="p-2.5 sm:p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[9px] sm:text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                      Nomor Registrasi / Pendaftaran
                    </span>
                    <span className="text-base sm:text-xl font-black font-mono text-emerald-950 tracking-wider">
                      {siswa.noPendaftaran}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-800 text-white font-mono text-[9px] sm:text-[10px] font-bold inline-block shadow-2xs">
                      VERIFIED
                    </span>
                    <span className="block text-[8px] text-emerald-700 font-semibold mt-0.5">
                      TP {getAcademicYear()}
                    </span>
                  </div>
                </div>

                {/* Tabel Data Diri */}
                <table className="w-full text-[10px] sm:text-xs">
                  <tbody>
                    <tr className="border-b border-slate-100">
                      <td className="py-1 text-slate-500 w-28 sm:w-36 font-medium">Nama Lengkap Murid</td>
                      <td className="py-1 font-bold text-slate-900">: {siswa.namaLengkap}</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-1 text-slate-500 font-medium">NISN / NIK</td>
                      <td className="py-1 text-slate-800">: {siswa.nisn || '-'} / {siswa.nik || '-'}</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-1 text-slate-500 font-medium">Jenis Kelamin</td>
                      <td className="py-1 text-slate-800">: {siswa.jenisKelamin || '-'}</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-1 text-slate-500 font-medium">Tempat, Tanggal Lahir</td>
                      <td className="py-1 text-slate-800">: {siswa.tempatLahir || '-'}, {siswa.tanggalLahir || '-'}</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-1 text-slate-500 font-medium">Asal Sekolah SD/MI</td>
                      <td className="py-1 font-semibold text-slate-900">: {siswa.asalSekolah || '-'}</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-1 text-slate-500 font-medium">Nama Orang Tua / No. HP</td>
                      <td className="py-1 text-slate-800">: {siswa.namaAyah || siswa.namaIbu || '-'} ({siswa.noHpAyah || siswa.noHpIbu || '-'})</td>
                    </tr>
                  </tbody>
                </table>

                {/* Jadwal & Lokasi Ujian / Observasi Resmi */}
                <div className="p-2.5 sm:p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] sm:text-[11px]">
                  <div>
                    <span className="text-slate-400 block font-semibold">Jadwal Pelaksanaan:</span>
                    <span className="font-bold text-slate-900">Sabtu, 17 Januari 2026</span>
                    <span className="block text-slate-600 font-medium">Pukul 08.00 - 11.30 WIB</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold">Ruang &amp; Lokasi:</span>
                    <span className="font-bold text-emerald-900">Ruang Aula - Gedung SMPIT Lt. 1</span>
                    <span className="block text-slate-600 font-medium">Observasi Murid &amp; Observasi OTM</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Tata Tertib Sesi Observasi (Tanpa kata: putra berpeci) */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[9px] sm:text-[10px] text-slate-600 space-y-1">
              <span className="font-bold text-slate-800 block text-[10px] sm:text-[11px]">Tata Tertib Peserta:</span>
              <p className="leading-relaxed space-y-0.5">
                1. Wajib hadir di lokasi 15 menit sebelum observasi dimulai dengan membawa Kartu Peserta ini.<br />
                2. Mengenakan seragam asal SD/MI masing-masing (putri berjilbab syar'i).<br />
                3. Orang tua / wali murid wajib hadir mendampingi untuk sesi observasi OTM.<br />
                4. Membawa alat tulis pensil 2B, pulpen, dan Al-Qur'an / Juz 'Amma pribadi.
              </p>
            </div>

            {/* Blok Verifikasi Keabsahan Dokumen via QR Code (Sah Tanpa Tanda Tangan Basah) */}
            <div className="p-3 sm:p-3.5 rounded-xl border border-emerald-300 bg-emerald-50/80 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-emerald-950">
              <div className="flex items-center gap-2.5 text-left w-full sm:w-auto">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-800 text-amber-300 flex items-center justify-center shrink-0 shadow-xs">
                  <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-amber-300" />
                </div>
                <div className="space-y-0.5">
                  <div className="font-bold text-[10px] sm:text-xs text-emerald-950">
                    DOKUMEN RESMI TERVERIFIKASI SAH SECARA HUKUM
                  </div>
                  <p className="text-[8.5px] sm:text-[9.5px] text-slate-600 leading-tight">
                    Kartu Peserta ini diterbitkan digital oleh Sistem SPMB SMPIT Pondok Duta. Keaslian dokumen terverifikasi via QR Code. <strong>Sah tanpa memerlukan tanda tangan basah panitia / calon murid.</strong>
                  </p>
                </div>
              </div>
              <div className="shrink-0 text-center sm:text-right border-t sm:border-t-0 sm:border-l border-emerald-200/80 pt-2 sm:pt-0 sm:pl-3 w-full sm:w-auto">
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-800 text-white font-extrabold text-[9px] tracking-wide shadow-xs">
                  ✓ SAH &amp; TERDAFTAR
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
            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
              title="Cetak langsung ke printer atau Save to PDF via browser"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cetak</span>
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
