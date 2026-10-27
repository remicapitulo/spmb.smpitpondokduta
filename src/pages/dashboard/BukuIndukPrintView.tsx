import React, { useState, useRef, useEffect } from 'react';
import { DataIndukSiswa, getAcademicYear } from '../../types';
import { gasService } from '../../services/gasService';
import { Download, X, Award, CheckCircle2, ShieldCheck, User, Loader2 } from 'lucide-react';
import { downloadElementAsPdf } from '../../utils/downloadPdfDocument';
import { LOGO_PONDOK_DUTA_BASE64 } from '../../assets/logoBase64';

interface Props {
  data: DataIndukSiswa;
  onClose: () => void;
}

export const BukuIndukPrintView: React.FC<Props> = ({ data, onClose }) => {
  const [logoBase64, setLogoBase64] = useState<string>(LOGO_PONDOK_DUTA_BASE64);
  const [downloadFeedback, setDownloadFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const tahunPelajaran = getAcademicYear();
  const docRef = useRef<HTMLDivElement | null>(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  // Preload logo kustom dari pengaturan jika ada, fallback ke logo lokal resmi Base64 (100% aman CORS)
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
        canvas.width = img.naturalWidth || 200;
        canvas.height = img.naturalHeight || 200;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          setLogoBase64(canvas.toDataURL('image/png'));
        }
      } catch {
        setLogoBase64(LOGO_PONDOK_DUTA_BASE64);
      }
    };
    img.onerror = () => setLogoBase64(LOGO_PONDOK_DUTA_BASE64);
    img.src = resolvedUrl;
  }, []);

  const handleDownloadPdf = async () => {
    if (isDownloadingPdf) return;
    setIsDownloadingPdf(true);
    setDownloadFeedback(null);

    try {
      const docElement = docRef.current;
      if (!docElement) {
        throw new Error('Elemen dokumen buku induk tidak ditemukan');
      }

      const safeName = (data.namaLengkap || 'Murid').replace(/\s+/g, '_');
      const safeNis = (data.nis || data.noPendaftaran || 'PD').replace(/\s+/g, '_');
      const fileName = `Buku_Induk_Siswa_${safeNis}_${safeName}.pdf`;

      await downloadElementAsPdf({
        element: docElement,
        fileName,
        pdfTitle: `Lembar Buku Induk Murid - ${data.namaLengkap}`,
        footerText: `Buku Induk Siswa Resmi SMPIT Pondok Duta TP ${tahunPelajaran} · Terdaftar & Sah.`,
        margin: 10
      });

      setDownloadFeedback({
        type: 'success',
        text: `Dokumen PDF "${fileName}" berhasil diunduh ke perangkat Anda.`
      });
      setTimeout(() => setDownloadFeedback(null), 6000);
    } catch (err) {
      console.error('Gagal unduh PDF Buku Induk:', err);
      setDownloadFeedback({
        type: 'error',
        text: 'Gagal mengunduh dokumen PDF Buku Induk. ' + (err instanceof Error ? err.message : '')
      });
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-2 sm:p-4 md:p-6 animate-in fade-in duration-200"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-4xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 flex flex-col h-[94vh] sm:max-h-[90vh] overflow-hidden my-auto font-sans">
        
        {/* Controls Header (Clean, no top print button) */}
        <div className="no-print flex items-center justify-between px-4 sm:px-6 py-3 sm:py-3.5 border-b border-slate-200 bg-slate-50 shrink-0 z-10 gap-2">
          <div className="min-w-0 flex-1 pr-1">
            <h3 className="text-xs sm:text-base font-bold text-slate-900 truncate flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block animate-pulse shrink-0"></span>
              <span>Lembar Cetak Buku Induk Murid (Standar Resmi)</span>
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-500 truncate mt-0.5">
              Dokumen resmi arsip data pokok murid SMPIT Pondok Duta
            </p>
          </div>
          <button
            onClick={onClose}
            title="Tutup (Esc)"
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-200 transition cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notifikasi Status Unduh */}
        {downloadFeedback && (
          <div className={`no-print px-4 py-2 text-xs font-semibold flex items-center justify-between shrink-0 transition-all ${
            downloadFeedback.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
          }`}>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-200" />
              <span>{downloadFeedback.text}</span>
            </div>
            <button onClick={() => setDownloadFeedback(null)} className="text-white hover:opacity-80 text-xs">✕</button>
          </div>
        )}

        {/* Scrollable Document Body */}
        <div className="overflow-y-auto flex-1 p-3 sm:p-6 bg-slate-100/70 custom-scrollbar space-y-6">
          <div 
            ref={docRef} 
            id="printable-buku-induk" 
            className="print-container max-w-3xl mx-auto space-y-6 text-slate-900 text-xs sm:text-[13px] leading-relaxed font-sans"
            style={{ fontFamily: "'Plus Jakarta Sans', Arial, Helvetica, sans-serif" }}
          >
            {/* ================================================================= */}
            {/* HALAMAN 1 (A4 Page 1): IDENTITAS POKOK, BAGIAN A, B, C, D         */}
            {/* ================================================================= */}
            <div 
              className="a4-page-slice bg-white p-7 sm:p-10 shadow-md border border-slate-200 rounded-2xl space-y-4"
              style={{ fontFamily: "'Plus Jakarta Sans', Arial, Helvetica, sans-serif" }}
            >
              {/* KOP RESMI SEKOLAH */}
              <div className="border-b-4 border-double border-slate-900 pb-3 flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-4 text-center sm:text-left">
                <div className="w-18 h-18 shrink-0 p-1 bg-white border border-emerald-300 rounded-2xl flex items-center justify-center shadow-2xs">
                  <img
                    src={logoBase64 || LOGO_PONDOK_DUTA_BASE64}
                    alt="Logo Resmi SMPIT Pondok Duta"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="min-w-0 flex-1 space-y-0.5">
                  <div className="text-[11px] uppercase font-sans tracking-widest text-slate-600 font-bold">
                    YAYASAN PERGURUAN ISLAM PONDOK DUTA
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black font-sans tracking-wide text-slate-900 leading-tight">
                    SMPIT PONDOK DUTA
                  </h1>
                  <p className="text-[10px] text-slate-600 font-sans">
                    <span className="font-bold text-emerald-800">Terakreditasi "A" BAN-PDM</span> | NPSN: 20276180 | NSS: 202026601007
                  </p>
                  <p className="text-[9.5px] text-slate-500 font-sans leading-snug">
                    Perumahan Pondok Duta, Jl. Duta Plaza No. 1, Kel. Tugu, Kec. Cimanggis, Kota Depok 16451 | Telp: (021) 29378301
                  </p>
                  <div className="mt-1 inline-block px-3 py-0.5 rounded bg-slate-900 text-white font-sans text-[10.5px] font-bold uppercase tracking-wider shadow-2xs">
                    LEMBAR DATA BUKU INDUK MURID (TP {tahunPelajaran})
                  </div>
                </div>
              </div>

              {/* IDENTITAS POKOK BUKU INDUK */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block font-semibold">Nomor Induk (NIS):</span>
                  <span className="font-mono font-black text-sm text-emerald-800">{data.nis || '-'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block font-semibold">NISN:</span>
                  <span className="font-mono font-bold text-slate-900">{data.nisn || '-'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block font-semibold">NIK Siswa:</span>
                  <span className="font-mono font-bold text-slate-900">{data.nik || '-'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block font-semibold">No Pendaftaran:</span>
                  <span className="font-mono font-bold text-slate-700">{data.noPendaftaran || '-'}</span>
                </div>
              </div>

              {/* SECTION A: KETERANGAN TENTANG DIRI MURID */}
              <div className="space-y-1.5">
                <div className="font-bold text-xs uppercase bg-slate-800 text-white px-3 py-1.5 rounded tracking-wide shadow-2xs">
                  A. KETERANGAN TENTANG DIRI MURID
                </div>
                <table className="w-full text-xs border-collapse table-fixed">
                  <tbody>
                    <tr className="border-b border-slate-100">
                      <td className="w-7 py-1 text-slate-500 font-medium align-top">1.</td>
                      <td className="w-56 py-1 font-semibold text-slate-700 align-top">Nama Lengkap</td>
                      <td className="w-3 py-1 text-slate-400 font-bold align-top">:</td>
                      <td className="py-1 font-bold text-slate-900 align-top">{data.namaLengkap}</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-1 text-slate-500 font-medium align-top">2.</td>
                      <td className="py-1 font-semibold text-slate-700 align-top">Nama Panggilan</td>
                      <td className="py-1 text-slate-400 font-bold align-top">:</td>
                      <td className="py-1 text-slate-900 align-top">{data.namaPanggilan || '-'}</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-1 text-slate-500 font-medium align-top">3.</td>
                      <td className="py-1 font-semibold text-slate-700 align-top">Jenis Kelamin</td>
                      <td className="py-1 text-slate-400 font-bold align-top">:</td>
                      <td className="py-1 text-slate-900 align-top">{data.jenisKelamin || '-'}</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-1 text-slate-500 font-medium align-top">4.</td>
                      <td className="py-1 font-semibold text-slate-700 align-top">Tempat, Tanggal Lahir</td>
                      <td className="py-1 text-slate-400 font-bold align-top">:</td>
                      <td className="py-1 text-slate-900 align-top">{data.tempatLahir}, {data.tanggalLahir}</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-1 text-slate-500 font-medium align-top">5.</td>
                      <td className="py-1 font-semibold text-slate-700 align-top">Agama</td>
                      <td className="py-1 text-slate-400 font-bold align-top">:</td>
                      <td className="py-1 text-slate-900 align-top">{data.agama || 'Islam'}</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-1 text-slate-500 font-medium align-top">6.</td>
                      <td className="py-1 font-semibold text-slate-700 align-top">Kewarganegaraan</td>
                      <td className="py-1 text-slate-400 font-bold align-top">:</td>
                      <td className="py-1 text-slate-900 align-top">{data.kewarganegaraan || 'Indonesia'}</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-1 text-slate-500 font-medium align-top">7.</td>
                      <td className="py-1 font-semibold text-slate-700 align-top">Anak Ke- / Saudara</td>
                      <td className="py-1 text-slate-400 font-bold align-top">:</td>
                      <td className="py-1 text-slate-900 align-top">Anak ke-{data.anakNomorKe || '1'} dari (Kandung: {data.jumlahSaudaraKandung || '0'}, Tiri: {data.jumlahSaudaraTiri || '0'}, Angkat: {data.jumlahSaudaraAngkat || '0'}) bersaudara</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-1 text-slate-500 font-medium align-top">8.</td>
                      <td className="py-1 font-semibold text-slate-700 align-top">Bahasa Sehari-hari</td>
                      <td className="py-1 text-slate-400 font-bold align-top">:</td>
                      <td className="py-1 text-slate-900 align-top">{data.bahasaSehariHari || 'Bahasa Indonesia'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* SECTION B: TEMPAT TINGGAL */}
              <div className="space-y-1.5">
                <div className="font-bold text-xs uppercase bg-slate-800 text-white px-3 py-1.5 rounded tracking-wide shadow-2xs">
                  B. KETERANGAN TEMPAT TINGGAL
                </div>
                <table className="w-full text-xs border-collapse table-fixed">
                  <tbody>
                    <tr className="border-b border-slate-100">
                      <td className="w-7 py-1 text-slate-500 font-medium align-top">9.</td>
                      <td className="w-56 py-1 font-semibold text-slate-700 align-top">Alamat Tempat Tinggal</td>
                      <td className="w-3 py-1 text-slate-400 font-bold align-top">:</td>
                      <td className="py-1 text-slate-900 align-top leading-relaxed">{data.alamat || '-'}</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-1 text-slate-500 font-medium align-top">10.</td>
                      <td className="py-1 font-semibold text-slate-700 align-top">Kelurahan / Kecamatan</td>
                      <td className="py-1 text-slate-400 font-bold align-top">:</td>
                      <td className="py-1 text-slate-900 align-top">Kel. {data.kelurahan || '-'}, Kec. {data.kecamatan || '-'}</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-1 text-slate-500 font-medium align-top">11.</td>
                      <td className="py-1 font-semibold text-slate-700 align-top">Kota / Kabupaten</td>
                      <td className="py-1 text-slate-400 font-bold align-top">:</td>
                      <td className="py-1 text-slate-900 align-top">{data.kotaKabupaten || 'Kota Depok'}</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-1 text-slate-500 font-medium align-top">12.</td>
                      <td className="py-1 font-semibold text-slate-700 align-top">Telepon / Handphone</td>
                      <td className="py-1 text-slate-400 font-bold align-top">:</td>
                      <td className="py-1 text-slate-900 font-mono align-top">{data.nomorHandphone || data.nomorTelepon || '-'}</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-1 text-slate-500 font-medium align-top">13.</td>
                      <td className="py-1 font-semibold text-slate-700 align-top">Tinggal Pada / Jarak / Sarana</td>
                      <td className="py-1 text-slate-400 font-bold align-top">:</td>
                      <td className="py-1 text-slate-900 align-top">{data.bertempatTinggalPada || 'Orang Tua'} | Jarak: {data.jarakKeSekolahKm || '1'} km | Transportasi: {data.saranaBerangkatSekolah || 'Motor'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* SECTION C: KESEHATAN */}
              <div className="space-y-1.5">
                <div className="font-bold text-xs uppercase bg-slate-800 text-white px-3 py-1.5 rounded tracking-wide shadow-2xs">
                  C. KETERANGAN KESEHATAN JASMANI
                </div>
                <table className="w-full text-xs border-collapse table-fixed">
                  <tbody>
                    <tr className="border-b border-slate-100">
                      <td className="w-7 py-1 text-slate-500 font-medium align-top">14.</td>
                      <td className="w-56 py-1 font-semibold text-slate-700 align-top">Berat &amp; Tinggi Badan</td>
                      <td className="w-3 py-1 text-slate-400 font-bold align-top">:</td>
                      <td className="py-1 text-slate-900 align-top">Berat: {data.beratBadanKg || '-'} kg | Tinggi: {data.tinggiBadanCm || '-'} cm | Gol. Darah: {data.golonganDarah || '-'}</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-1 text-slate-500 font-medium align-top">15.</td>
                      <td className="py-1 font-semibold text-slate-700 align-top">Penyakit Berat / Kelainan</td>
                      <td className="py-1 text-slate-400 font-bold align-top">:</td>
                      <td className="py-1 text-slate-900 align-top">{data.penyakitBerat || '-'} | Kelainan jasmani: {data.kelainanJasmani || '-'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* SECTION D: PENDIDIKAN SEBELUMNYA */}
              <div className="space-y-1.5">
                <div className="font-bold text-xs uppercase bg-slate-800 text-white px-3 py-1.5 rounded tracking-wide shadow-2xs">
                  D. PENDIDIKAN SEBELUMNYA &amp; MINAT PRESTASI
                </div>
                <table className="w-full text-xs border-collapse table-fixed">
                  <tbody>
                    <tr className="border-b border-slate-100">
                      <td className="w-7 py-1 text-slate-500 font-medium align-top">16.</td>
                      <td className="w-56 py-1 font-semibold text-slate-700 align-top">Diterima Sebagai</td>
                      <td className="w-3 py-1 text-slate-400 font-bold align-top">:</td>
                      <td className="py-1 font-semibold text-slate-900 align-top">{data.masukSebagai || 'Siswa Baru Kelas 7'} (Tahun Pelajaran {data.tahunPelajaran || tahunPelajaran})</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-1 text-slate-500 font-medium align-top">17.</td>
                      <td className="py-1 font-semibold text-slate-700 align-top">Sekolah Asal (SD / MI)</td>
                      <td className="py-1 text-slate-400 font-bold align-top">:</td>
                      <td className="py-1 font-bold text-slate-900 align-top">{data.asalSekolah}</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-1 text-slate-500 font-medium align-top">18.</td>
                      <td className="py-1 font-semibold text-slate-700 align-top">Nomor Ijazah SD</td>
                      <td className="py-1 text-slate-400 font-bold align-top">:</td>
                      <td className="py-1 font-mono text-slate-900 align-top">{data.nomorIjazah || '-'}</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-1 text-slate-500 font-medium align-top">19.</td>
                      <td className="py-1 font-semibold text-slate-700 align-top">Kegemaran (Kesenian/Olahraga)</td>
                      <td className="py-1 text-slate-400 font-bold align-top">:</td>
                      <td className="py-1 text-slate-900 align-top">{data.kegemaranKesenian || '-'} / {data.kegemaranOlahraga || '-'} / Organisasi: {data.kegemaranOrganisasi || '-'}</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-1 text-slate-500 font-medium align-top">20.</td>
                      <td className="py-1 font-semibold text-slate-700 align-top">Prestasi / Kejuaraan</td>
                      <td className="py-1 text-slate-400 font-bold align-top">:</td>
                      <td className="py-1 text-slate-900 align-top">{data.memenangkanKejuaraan || '-'} | Beasiswa: {data.menerimaBeasiswa || '-'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="pt-2 text-right text-[10px] text-slate-400 font-medium border-t border-slate-100">
                Lembar 1 dari 2 &bull; Dokumen Resmi Buku Induk Siswa SMPIT Pondok Duta
              </div>
            </div>

            {/* ================================================================= */}
            {/* HALAMAN 2 (A4 Page 2): DATA ORANG TUA/WALI, PENGESAHAN & PAS FOTO */}
            {/* ================================================================= */}
            <div 
              className="a4-page-slice bg-white p-7 sm:p-10 shadow-md border border-slate-200 rounded-2xl space-y-4"
              style={{ fontFamily: "'Plus Jakarta Sans', Arial, Helvetica, sans-serif" }}
            >
              {/* SUB-KOP LEMBAR LANJUTAN */}
              <div className="border-b-2 border-slate-900 pb-2.5 flex items-center justify-between text-xs">
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-500">
                    BUKU INDUK SISWA &bull; SMPIT PONDOK DUTA DEPOK
                  </div>
                  <div className="text-sm font-black text-slate-900">
                    {data.namaLengkap} <span className="text-emerald-700 font-mono">({data.nis || data.noPendaftaran})</span>
                  </div>
                </div>
                <div className="text-right text-[10px] text-slate-500 font-mono font-bold bg-slate-100 px-2 py-1 rounded">
                  Lembar Lanjutan (Halaman 2)
                </div>
              </div>

              {/* SECTION E: KETERANGAN ORANG TUA / WALI */}
              <div className="space-y-2.5">
                <div className="font-bold text-xs uppercase bg-slate-800 text-white px-3 py-1.5 rounded tracking-wide shadow-2xs">
                  E. KETERANGAN ORANG TUA KANDUNG &amp; WALI
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Data Ayah */}
                  <div className="border border-slate-200 p-3.5 rounded-xl bg-slate-50/70">
                    <div className="font-bold text-xs text-slate-900 border-b border-slate-200 pb-1.5 mb-2 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-700"></span>
                      <span>1. DATA AYAH KANDUNG</span>
                    </div>
                    <table className="w-full text-xs">
                      <tbody>
                        <tr className="border-b border-slate-100/60"><td className="w-24 py-1 text-slate-500 font-medium">Nama</td><td className="w-2">:</td><td className="py-1 font-bold text-slate-900">{data.namaAyah}</td></tr>
                        <tr className="border-b border-slate-100/60"><td className="py-1 text-slate-500 font-medium">TTL</td><td>:</td><td className="py-1 text-slate-800">{data.tempatTanggalLahirAyah || '-'}</td></tr>
                        <tr className="border-b border-slate-100/60"><td className="py-1 text-slate-500 font-medium">Pendidikan</td><td>:</td><td className="py-1 text-slate-800">{data.pendidikanAyah || '-'}</td></tr>
                        <tr className="border-b border-slate-100/60"><td className="py-1 text-slate-500 font-medium">Pekerjaan</td><td>:</td><td className="py-1 text-slate-800">{data.pekerjaanAyah || '-'}</td></tr>
                        <tr className="border-b border-slate-100/60"><td className="py-1 text-slate-500 font-medium">Penghasilan</td><td>:</td><td className="py-1 text-slate-800">{data.penghasilanAyah || '-'}</td></tr>
                        <tr><td className="py-1 text-slate-500 font-medium">No HP</td><td>:</td><td className="py-1 font-mono text-slate-900 font-bold">{data.noHpAyah || '-'}</td></tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Data Ibu */}
                  <div className="border border-slate-200 p-3.5 rounded-xl bg-slate-50/70">
                    <div className="font-bold text-xs text-slate-900 border-b border-slate-200 pb-1.5 mb-2 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-700"></span>
                      <span>2. DATA IBU KANDUNG</span>
                    </div>
                    <table className="w-full text-xs">
                      <tbody>
                        <tr className="border-b border-slate-100/60"><td className="w-24 py-1 text-slate-500 font-medium">Nama</td><td className="w-2">:</td><td className="py-1 font-bold text-slate-900">{data.namaIbu}</td></tr>
                        <tr className="border-b border-slate-100/60"><td className="py-1 text-slate-500 font-medium">TTL</td><td>:</td><td className="py-1 text-slate-800">{data.tempatTanggalLahirIbu || '-'}</td></tr>
                        <tr className="border-b border-slate-100/60"><td className="py-1 text-slate-500 font-medium">Pendidikan</td><td>:</td><td className="py-1 text-slate-800">{data.pendidikanIbu || '-'}</td></tr>
                        <tr className="border-b border-slate-100/60"><td className="py-1 text-slate-500 font-medium">Pekerjaan</td><td>:</td><td className="py-1 text-slate-800">{data.pekerjaanIbu || '-'}</td></tr>
                        <tr className="border-b border-slate-100/60"><td className="py-1 text-slate-500 font-medium">Penghasilan</td><td>:</td><td className="py-1 text-slate-800">{data.penghasilanIbu || '-'}</td></tr>
                        <tr><td className="py-1 text-slate-500 font-medium">No HP</td><td>:</td><td className="py-1 font-mono text-slate-900 font-bold">{data.noHpIbu || '-'}</td></tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Data Wali jika ada */}
                {data.namaWali && data.namaWali !== '-' && (
                  <div className="border border-slate-200 p-3 rounded-xl bg-slate-50 text-xs">
                    <span className="font-bold text-slate-900">3. DATA WALI: </span>
                    <span className="text-slate-800">{data.namaWali} (Hubungan: {data.statusHubunganWali || '-'}) | Pekerjaan: {data.pekerjaanWali || '-'} | No HP: {data.noHpWali || '-'}</span>
                  </div>
                )}
              </div>

              {/* SECTION F: CATATAN PERKEMBANGAN SISWA */}
              <div className="space-y-1.5">
                <div className="font-bold text-xs uppercase bg-slate-800 text-white px-3 py-1.5 rounded tracking-wide shadow-2xs">
                  F. CATATAN KHUSUS &amp; KETERANGAN LAINNYA
                </div>
                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-700 min-h-[50px] leading-relaxed">
                  {data.catatanKhusus && data.catatanKhusus !== '-' 
                    ? data.catatanKhusus 
                    : 'Murid terdaftar secara sah di Buku Induk Murid SMPIT Pondok Duta. Memenuhi seluruh persyaratan administrasi dan dinyatakan resmi diterima sebagai murid baru.'}
                </div>
              </div>

              {/* PENGESAHAN KEPALA SEKOLAH & TEMPAT PAS FOTO */}
              <div className="pt-4 border-t-2 border-slate-900 flex items-end justify-between text-xs">
                {/* 3x4 Pas Foto */}
                <div className="w-24 h-32 border-2 border-dashed border-slate-400 rounded-xl flex flex-col items-center justify-center text-slate-400 text-[10px] text-center p-1.5 bg-slate-50 shadow-2xs">
                  <User className="w-6 h-6 mb-1 opacity-50" />
                  <span className="font-bold text-slate-600">Pas Foto<br/>3 x 4 cm</span>
                  <span className="text-[8px] text-slate-400 mt-0.5">Warna</span>
                </div>

                {/* Tanda Tangan & Cap Kepala Sekolah */}
                <div className="text-center space-y-1">
                  <div className="text-slate-800">
                    Depok, {data.tanggalDiterima || new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                  <div className="text-slate-600 font-semibold text-xs">
                    Kepala Sekolah SMPIT Pondok Duta,
                  </div>
                  <div className="h-16 flex items-center justify-center">
                    <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      [Tanda Tangan &amp; Stempel Resmi]
                    </span>
                  </div>
                  <div className="font-bold underline text-slate-900 text-sm tracking-wide">
                    M. FAUZI, M.Pd.I
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono font-medium">
                    NIP / NPY: 19820514 200801 1 003
                  </div>
                </div>
              </div>

              <div className="pt-2 text-right text-[10px] text-slate-400 font-medium border-t border-slate-100">
                Lembar 2 dari 2 &bull; Dokumen Resmi Buku Induk Siswa SMPIT Pondok Duta
              </div>
            </div>

          </div>
        </div>

        {/* Modal Bottom Action Bar (No Print - Single Unduh PDF button) */}
        <div className="no-print px-4 sm:px-6 py-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-1.5 text-[11px] truncate">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="truncate">Buku Induk Siswa: <strong>{data.namaLengkap}</strong> (NIS: {data.nis || '-'})</span>
          </div>
          <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
            <button
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition cursor-pointer"
            >
              Tutup
            </button>
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isDownloadingPdf}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
            >
              {isDownloadingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                  <span>Menyiapkan PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-emerald-400" />
                  <span>Unduh PDF</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
