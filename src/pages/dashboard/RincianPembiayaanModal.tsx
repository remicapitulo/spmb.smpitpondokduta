import React, { useRef, useState, useEffect } from 'react';
import { PembiayaanCategory, getAcademicYear } from '../../types';
import { gasService } from '../../services/gasService';
import { formatRupiah, calculatePembiayaanTotals } from '../../services/pembiayaanData';
import { LOGO_PONDOK_DUTA_BASE64 } from '../../assets/logoBase64';
import { downloadElementAsPdf } from '../../utils/downloadPdfDocument';
import { 
  X, 
  Download, 
  Printer, 
  FileText, 
  CreditCard, 
  CheckCircle2, 
  Building2, 
  Phone, 
  Calendar, 
  Clock, 
  MapPin, 
  BadgePercent, 
  Sparkles,
  Info,
  ChevronRight,
  Loader2,
  Tag
} from 'lucide-react';

interface Props {
  siswa: {
    noPendaftaran: string;
    namaLengkap: string;
    nisn?: string;
    asalSekolah?: string;
    jalur?: string;
  };
  selectedKategori: string;
  onSelectKategori?: (kategori: string) => void;
  onClose: () => void;
  onOpenFullSklPreview?: () => void;
  tanggalDaftarUlang?: string;
  tanggalBatasPengunduranDiri?: string;
}

export const RincianPembiayaanModal: React.FC<Props> = ({
  siswa,
  selectedKategori,
  onSelectKategori,
  onClose,
  onOpenFullSklPreview,
  tanggalDaftarUlang = '20 - 25 Januari 2027',
  tanggalBatasPengunduranDiri
}) => {
  const [categories, setCategories] = useState<PembiayaanCategory[]>(() => gasService.getPembiayaanList());
  const [currentKategoriName, setCurrentKategoriName] = useState<string>(selectedKategori || (categories[0]?.kategori || ''));
  const [logoBase64, setLogoBase64] = useState<string>(LOGO_PONDOK_DUTA_BASE64);
  const [isDownloading, setIsDownloading] = useState(false);
  const docRef = useRef<HTMLDivElement | null>(null);
  const tahunPelajaran = getAcademicYear();

  const obsData = gasService.getObservasiSiswa(siswa.noPendaftaran);
  const kelulusanData = gasService.getStatusKelulusan(siswa.noPendaftaran);
  const effectiveBatasPengunduranDiri =
    (tanggalBatasPengunduranDiri && tanggalBatasPengunduranDiri !== '-')
      ? tanggalBatasPengunduranDiri
      : (obsData?.tanggalBatasPengunduranDiri && obsData.tanggalBatasPengunduranDiri !== '-')
        ? obsData.tanggalBatasPengunduranDiri
        : (kelulusanData?.tanggalBatasPengunduranDiri && kelulusanData.tanggalBatasPengunduranDiri !== '-')
          ? kelulusanData.tanggalBatasPengunduranDiri
          : gasService.getDefaultBatasPengunduranDiri();

  useEffect(() => {
    // Sinkronkan daftar kategori terbaru jika ada update
    const list = gasService.getPembiayaanList();
    if (list && list.length > 0) {
      setCategories(list);
      if (!currentKategoriName) {
        setCurrentKategoriName(list[0].kategori);
      }
    }
  }, []);

  useEffect(() => {
    if (selectedKategori) {
      setCurrentKategoriName(selectedKategori);
    }
  }, [selectedKategori]);

  // Dapatkan rincian data kategori terpilih dan acuan biaya utama dari sheet
  const activeBiaya = gasService.getPembiayaanByCategory(currentKategoriName);
  const normalBiaya = categories[0] || gasService.getPembiayaanList()[0] || activeBiaya;

  // Preload logo kustom dari pengaturan jika ada
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

  const handleKategoriChange = (newKat: string) => {
    setCurrentKategoriName(newKat);
    if (onSelectKategori) {
      onSelectKategori(newKat);
    }
  };

  const handleDownloadPdf = async () => {
    if (!docRef.current || isDownloading) return;
    setIsDownloading(true);
    try {
      const safeName = (siswa.namaLengkap || 'Murid').replace(/\s+/g, '_');
      const safeNo = (siswa.noPendaftaran || 'PD').replace(/\s+/g, '_');
      await downloadElementAsPdf({
        element: docRef.current,
        fileName: `Rincian_Daftar_Ulang_SPMB_${safeNo}_${safeName}.pdf`,
        pdfTitle: `Rincian Pembiayaan SPMB - ${siswa.namaLengkap}`,
        footerText: `Lampiran Resmi Biaya SPMB SMPIT Pondok Duta TP ${tahunPelajaran} · Sah & Terverifikasi`,
        margin: 10
      });
    } catch (e) {
      console.error('Gagal mengunduh PDF Rincian Pembiayaan:', e);
      alert('Gagal mengunduh PDF. Silakan gunakan fungsi Print Browser.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-2 sm:p-4 md:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col max-h-[94vh] overflow-hidden my-auto">
        
        {/* Top Bar Controls (No-Print) */}
        <div className="no-print bg-slate-900 text-white px-5 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-600/30 border border-emerald-400/40 text-emerald-300">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                  Lampiran Surat Keterangan Hasil Seleksi Lembar ke-2
                </span>
                <span className="text-xs text-slate-400">| Format Baru Modern</span>
              </div>
              <h3 className="font-extrabold text-sm sm:text-base text-white tracking-wide">
                Rincian Biaya Daftar Ulang &amp; Ketentuan SPMB
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {onOpenFullSklPreview && (
              <button
                type="button"
                onClick={onOpenFullSklPreview}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                title="Buka Pratinjau Surat Keterangan Hasil Seleksi Lengkap 2 Halaman"
              >
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline">Pratinjau Surat Keterangan Hasil Seleksi</span>
                <span className="sm:hidden">Hasil Seleksi 2 Hal</span>
              </button>
            )}
            <button
              type="button"
              onClick={handlePrint}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition cursor-pointer"
              title="Cetak Dokumen"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-rose-600 text-slate-200 hover:text-white transition cursor-pointer"
              title="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Kategori Selector Bar (No-Print) */}
        <div className="no-print bg-slate-100/90 border-b border-slate-200 px-5 sm:px-6 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-emerald-700 shrink-0" />
            <label className="text-xs font-bold text-slate-800">
              Pilih Rujukan Kategori Pembiayaan:
            </label>
          </div>
          
          <div className="flex items-center gap-2 flex-1 max-w-xl">
            <select
              value={currentKategoriName}
              onChange={(e) => handleKategoriChange(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-bold text-xs text-slate-900 shadow-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              {categories.map((cat, idx) => {
                const numberedLabel = /^\d+\./.test(cat.kategori.trim()) ? cat.kategori : `${idx + 1}. ${cat.kategori}`;
                return (
                  <option key={idx} value={cat.kategori}>
                    {numberedLabel}
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {/* Document Body (Scrollable Container & Printable) */}
        <div className="overflow-y-auto p-4 sm:p-8 bg-slate-200/60 custom-scrollbar flex-1">
          <div 
            ref={docRef}
            id="printable-rincian-pembiayaan"
            className="a4-page-slice print-container bg-white rounded-2xl border border-slate-200 text-slate-900"
            style={{
              width: '794px',
              minHeight: '1218px',
              boxSizing: 'border-box',
              padding: '34px 40px',
              margin: '0 auto',
              backgroundColor: '#ffffff',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              fontFamily: "'Plus Jakarta Sans', Arial, Helvetica, sans-serif"
            }}
          >
            <div className="space-y-3.5">
              {/* Kop Resmi Sekolah */}
              <div className="border-b-4 border-double border-emerald-900 pb-2.5 flex items-center gap-3.5 text-left">
                <div className="w-18 h-18 shrink-0 p-1 bg-white border border-emerald-200 rounded-xl flex items-center justify-center">
                  <img
                    src={logoBase64 || LOGO_PONDOK_DUTA_BASE64}
                    alt="Logo Resmi SMPIT Pondok Duta"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="min-w-0 flex-1 space-y-0.5">
                  <div className="text-[11.5px] font-bold tracking-widest text-emerald-800 uppercase">
                    YAYASAN PERGURUAN ISLAM PONDOK DUTA
                  </div>
                  <div className="text-[19px] font-black text-slate-900 uppercase tracking-wide">
                    SMP ISLAM TERPADU PONDOK DUTA
                  </div>
                  <p className="text-[10px] text-slate-600 font-medium">
                    <span className="font-bold text-emerald-800">Terakreditasi "A" BAN-PDM</span> | NPSN: 20276180 | NSS: 202026601007
                  </p>
                  <p className="text-[9.5px] text-slate-500 leading-snug">
                    Jl. Duta Plaza No. 1, Perumahan Pondok Duta, Kel. Tugu, Kec. Cimanggis, Kota Depok, Jawa Barat 16451
                  </p>
                  <p className="text-[9px] text-emerald-900 font-semibold">
                    Telp: (021) 29378301 · Website: smpitpondokduta.sch.id · Email: info@smpitpondokduta.sch.id
                  </p>
                </div>
              </div>

              {/* Document Title Badge */}
              <div className="text-center space-y-1">
                <span 
                  style={{
                    display: 'inline-block',
                    padding: '3px 14px',
                    borderRadius: '9999px',
                    backgroundColor: '#ecfdf5',
                    color: '#065f46',
                    border: '1px solid #a7f3d0',
                    fontSize: '10.5px',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}
                >
                  LAMPIRAN PENGUMUMAN KELULUSAN SPMB · LEMBAR KE-2
                </span>
                <h2 className="text-[15.5px] font-black text-slate-900 uppercase tracking-wide">
                  RINCIAN BIAYA DAFTAR ULANG SISTEM PENERIMAAN MURID BARU (SPMB)
                </h2>
                <div className="text-[12px] font-bold text-slate-700">
                  TAHUN PELAJARAN {tahunPelajaran}
                </div>
              </div>

              {/* Identitas Calon Murid (Tanpa Kategori & Ring) */}
              <div 
                style={{
                  backgroundColor: '#f8fafc',
                  borderRadius: '12px',
                  padding: '10px 20px',
                  border: '1.5px solid #cbd5e1',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                  gap: '12px',
                  fontSize: '12px'
                }}
              >
                <div className="space-y-1">
                  <div className="flex items-center">
                    <span style={{ width: '135px', color: '#475569', fontWeight: 600 }}>Nomor Pendaftaran</span>
                    <span style={{ fontFamily: 'monospace', fontWeight: 900, color: '#0f172a', fontSize: '13px' }}>: {siswa.noPendaftaran}</span>
                  </div>
                  <div className="flex items-center">
                    <span style={{ width: '135px', color: '#475569', fontWeight: 600 }}>Nama Calon Murid</span>
                    <span style={{ fontWeight: 900, color: '#0f172a', textTransform: 'uppercase', fontSize: '13px' }}>: {siswa.namaLengkap}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center">
                    <span style={{ width: '105px', color: '#475569', fontWeight: 600 }}>NISN</span>
                    <span style={{ fontFamily: 'monospace', fontWeight: 800, color: '#0f172a', fontSize: '13px' }}>: {siswa.nisn || '-'}</span>
                  </div>
                  <div className="flex items-center">
                    <span style={{ width: '105px', color: '#475569', fontWeight: 600 }}>Asal SD/MI</span>
                    <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '13px' }}>: {siswa.asalSekolah || 'SD/MI Pendaftar'}</span>
                  </div>
                </div>
              </div>

              {/* Section I: Persyaratan Daftar Ulang */}
              <div className="space-y-2 text-xs">
                <div className="font-black text-[12px] text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                  <span className="w-4.5 h-4.5 rounded bg-emerald-800 text-white flex items-center justify-center text-[10px] font-bold">I</span>
                  <span>PERSYARATAN DAFTAR ULANG</span>
                </div>
                
                <div className="pl-5 space-y-2 text-[11.5px]">
                  <div className="flex items-start gap-2">
                    <span style={{ fontWeight: 900, color: '#0f172a' }}>1.</span>
                    <p style={{ color: '#0f172a', fontWeight: 500, lineHeight: '1.45' }}>
                      Melengkapi berkas persyaratan SPMB yang belum lengkap (Fotokopi Akte Kelahiran, KK, Rapor, NISN, Pasfoto).
                    </p>
                  </div>

                  <div>
                    <div className="flex items-start gap-2 mb-1.5">
                      <span style={{ fontWeight: 900, color: '#0f172a' }}>2.</span>
                      <span style={{ color: '#0f172a', fontWeight: 600, lineHeight: '1.45' }}>
                        Membayar Biaya Daftar Ulang melalui transfer ke Rekening Resmi SPMB SMPIT Pondok Duta :
                      </span>
                    </div>

                    {/* Kotak Nomor Rekening: Rapih, Luas, Angka Besar & Proporsional */}
                    <div 
                      style={{
                        marginLeft: '16px',
                        padding: '10px 18px',
                        backgroundColor: '#f0fdf4',
                        border: '1.5px solid #059669',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '12px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 900, fontSize: '12px', color: '#064e3b' }}>
                          BANK SYARIAH INDONESIA (BSI)
                        </span>
                        <span style={{ color: '#059669', fontWeight: 'bold' }}>•</span>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: '#065f46' }}>No. Rekening :</span>
                        <span 
                          style={{ 
                            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace', 
                            fontWeight: 900, 
                            fontSize: '16px', 
                            letterSpacing: '0.08em',
                            color: '#064e3b',
                            backgroundColor: '#ffffff',
                            padding: '4px 14px',
                            borderRadius: '8px',
                            border: '1.5px solid #059669',
                            display: 'inline-block'
                          }}
                        >
                          7116137334
                        </span>
                        <span style={{ fontWeight: 800, fontSize: '12px', color: '#064e3b' }}>
                          a.n. YPIPD SMPIT PONDOK DUTA
                        </span>
                      </div>

                      <div style={{ fontSize: '12px', color: '#1e293b' }}>
                        <span style={{ color: '#475569' }}>Konfirmasi WA : </span>
                        <span style={{ fontWeight: 900, color: '#064e3b' }}>Ibu Rahmaniar (085697709948)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section II: Tempat, Tanggal dan Waktu */}
              <div className="space-y-1.5 text-xs">
                <div className="font-black text-[12px] text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                  <span className="w-4.5 h-4.5 rounded bg-emerald-800 text-white flex items-center justify-center text-[10px] font-bold">II</span>
                  <span>TEMPAT, TANGGAL DAN WAKTU DAFTAR ULANG</span>
                </div>
                <div 
                  style={{
                    padding: '10px 18px',
                    borderRadius: '10px',
                    backgroundColor: '#f8fafc',
                    border: '1.5px solid #cbd5e1',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                    gap: '14px',
                    fontSize: '12px',
                    marginLeft: '16px'
                  }}
                >
                  <div>
                    <span style={{ color: '#475569', display: 'block', fontSize: '10.5px', textTransform: 'uppercase', fontWeight: 800 }}>Tempat :</span>
                    <span style={{ fontWeight: 800, color: '#0f172a' }}>Ruang Bendahara Lt. 2 Unit SDIT</span>
                  </div>
                  <div>
                    <span style={{ color: '#475569', display: 'block', fontSize: '10.5px', textTransform: 'uppercase', fontWeight: 800 }}>Batas Waktu :</span>
                    <span style={{ fontWeight: 900, color: '#064e3b', textDecoration: 'underline' }}>{tanggalDaftarUlang}</span>
                  </div>
                  <div>
                    <span style={{ color: '#475569', display: 'block', fontSize: '10.5px', textTransform: 'uppercase', fontWeight: 800 }}>Hari &amp; Waktu :</span>
                    <span style={{ fontWeight: 800, color: '#0f172a' }}>Senin – Jum’at / 08.00 – 12.00 WIB</span>
                  </div>
                </div>
              </div>

              {/* Section III: Tabel Rincian Biaya (Format Baru Modern) */}
              <div className="space-y-1.5">
                <div className="font-black text-[12px] text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                  <span className="w-4.5 h-4.5 rounded bg-emerald-800 text-white flex items-center justify-center text-[10px] font-bold">III</span>
                  <span>BIAYA DAFTAR ULANG SPMB (TA: {tahunPelajaran})</span>
                </div>

                {/* Table Layout dengan Grid Sel Utuh & Warna Huruf Tegas */}
                <table 
                  style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    border: '1.5px solid #475569',
                    fontSize: '11.5px',
                    backgroundColor: '#ffffff'
                  }}
                >
                  <thead>
                    <tr style={{ backgroundColor: '#0f172a', color: '#ffffff', fontSize: '11px' }}>
                      <th style={{ width: '42px', padding: '7px 4px', textAlign: 'center', border: '1px solid #334155', fontWeight: 900 }}>
                        NO
                      </th>
                      <th style={{ padding: '7px 14px', textAlign: 'left', border: '1px solid #334155', fontWeight: 900 }}>
                        KETERANGAN KOMPONEN
                      </th>
                      <th style={{ width: '150px', padding: '7px 14px', textAlign: 'right', border: '1px solid #334155', fontWeight: 900 }}>
                        HARGA NORMAL
                      </th>
                      <th style={{ width: '165px', padding: '7px 14px', textAlign: 'right', backgroundColor: '#064e3b', color: '#ffffff', border: '1px solid #064e3b', fontWeight: 900 }}>
                        BIAYA DAFTAR ULANG
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    
                    {/* Kelompok I */}
                    <tr style={{ backgroundColor: '#ecfdf5', color: '#064e3b', fontWeight: 900, fontSize: '11.5px' }}>
                      <td style={{ padding: '5px 6px', textAlign: 'center', border: '1px solid #cbd5e1' }}>I</td>
                      <td colSpan={3} style={{ padding: '5px 14px', border: '1px solid #cbd5e1', letterSpacing: '0.02em' }}>
                        UANG GEDUNG, BPP DAN SERAGAM
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: '5px 6px', textAlign: 'center', border: '1px solid #cbd5e1', fontWeight: 800, color: '#0f172a' }}>1</td>
                      <td style={{ padding: '5px 14px', border: '1px solid #cbd5e1', fontWeight: 700, color: '#0f172a' }}>Uang Gedung (*)</td>
                      <td style={{ padding: '5px 14px', textAlign: 'right', border: '1px solid #cbd5e1', fontFamily: 'monospace', fontWeight: 800, color: '#1e293b' }}>
                        {formatRupiah(normalBiaya.gedung)}
                      </td>
                      <td style={{ padding: '5px 14px', textAlign: 'right', border: '1px solid #cbd5e1', fontFamily: 'monospace', fontWeight: 900, color: '#0f172a' }}>
                        {formatRupiah(activeBiaya.gedung)}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: '5px 6px', textAlign: 'center', border: '1px solid #cbd5e1', fontWeight: 800, color: '#0f172a' }}>2</td>
                      <td style={{ padding: '5px 14px', border: '1px solid #cbd5e1', fontWeight: 700, color: '#0f172a' }}>Uang Penyelenggaraan Pendidikan (BPP)</td>
                      <td style={{ padding: '5px 14px', textAlign: 'right', border: '1px solid #cbd5e1', fontFamily: 'monospace', fontWeight: 800, color: '#1e293b' }}>
                        {formatRupiah(normalBiaya.bpp)}
                      </td>
                      <td style={{ padding: '5px 14px', textAlign: 'right', border: '1px solid #cbd5e1', fontFamily: 'monospace', fontWeight: 900, color: '#0f172a' }}>
                        {formatRupiah(activeBiaya.bpp)}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: '5px 6px', textAlign: 'center', border: '1px solid #cbd5e1', fontWeight: 800, color: '#0f172a' }}>3</td>
                      <td style={{ padding: '5px 14px', border: '1px solid #cbd5e1', fontWeight: 700, color: '#0f172a' }}>Uang Seragam 5 Stel</td>
                      <td style={{ padding: '5px 14px', textAlign: 'right', border: '1px solid #cbd5e1', fontFamily: 'monospace', fontWeight: 800, color: '#1e293b' }}>
                        {formatRupiah(normalBiaya.seragam)}
                      </td>
                      <td style={{ padding: '5px 14px', textAlign: 'right', border: '1px solid #cbd5e1', fontFamily: 'monospace', fontWeight: 900, color: '#0f172a' }}>
                        {formatRupiah(activeBiaya.seragam)}
                      </td>
                    </tr>
                    <tr style={{ backgroundColor: '#f1f5f9', fontWeight: 900, color: '#0f172a' }}>
                      <td style={{ padding: '5px 6px', textAlign: 'center', border: '1px solid #cbd5e1' }}></td>
                      <td style={{ padding: '5px 14px', border: '1px solid #cbd5e1', textTransform: 'uppercase', fontSize: '10.5px', letterSpacing: '0.03em' }}>
                        SUBTOTAL I (Gedung + BPP + Seragam)
                      </td>
                      <td style={{ padding: '5px 14px', textAlign: 'right', border: '1px solid #cbd5e1', fontFamily: 'monospace', fontWeight: 800, color: '#0f172a' }}>
                        {formatRupiah(normalBiaya.subtotalI)}
                      </td>
                      <td style={{ padding: '5px 14px', textAlign: 'right', border: '1px solid #cbd5e1', fontFamily: 'monospace', fontWeight: 900, color: '#064e3b', fontSize: '12px' }}>
                        {formatRupiah(activeBiaya.subtotalI)}
                      </td>
                    </tr>

                    {/* Kelompok II */}
                    <tr style={{ backgroundColor: '#ecfdf5', color: '#064e3b', fontWeight: 900, fontSize: '11.5px' }}>
                      <td style={{ padding: '5px 6px', textAlign: 'center', border: '1px solid #cbd5e1' }}>II</td>
                      <td colSpan={3} style={{ padding: '5px 14px', border: '1px solid #cbd5e1', letterSpacing: '0.02em' }}>
                        UANG KEGIATAN (Dibayarkan Setiap Tahun)
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: '5px 6px', textAlign: 'center', border: '1px solid #cbd5e1', fontWeight: 800, color: '#0f172a' }}>1</td>
                      <td style={{ padding: '5px 14px', border: '1px solid #cbd5e1', fontWeight: 700, color: '#0f172a' }}>Uang Buku Paket</td>
                      <td style={{ padding: '5px 14px', textAlign: 'right', border: '1px solid #cbd5e1', fontFamily: 'monospace', fontWeight: 800, color: '#1e293b' }}>
                        {formatRupiah(normalBiaya.buku)}
                      </td>
                      <td style={{ padding: '5px 14px', textAlign: 'right', border: '1px solid #cbd5e1', fontFamily: 'monospace', fontWeight: 900, color: '#0f172a' }}>
                        {formatRupiah(activeBiaya.buku)}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: '5px 6px', textAlign: 'center', border: '1px solid #cbd5e1', fontWeight: 800, color: '#0f172a' }}>2</td>
                      <td style={{ padding: '5px 14px', border: '1px solid #cbd5e1', fontWeight: 700, color: '#0f172a' }}>
                        <span>Uang Outing dan Perkemahan </span>
                        <span style={{ fontSize: '10px', color: '#475569', fontStyle: 'italic', fontWeight: 500 }}>
                          (* dibayarkan menjelang jadwal kegiatan)
                        </span>
                      </td>
                      <td style={{ padding: '5px 14px', textAlign: 'right', border: '1px solid #cbd5e1', fontFamily: 'monospace', fontWeight: 700, color: '#475569' }}>-</td>
                      <td style={{ padding: '5px 14px', textAlign: 'right', border: '1px solid #cbd5e1', fontFamily: 'monospace', fontWeight: 700, color: '#475569' }}>-</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '5px 6px', textAlign: 'center', border: '1px solid #cbd5e1', fontWeight: 800, color: '#0f172a' }}>3</td>
                      <td style={{ padding: '5px 14px', border: '1px solid #cbd5e1', fontWeight: 700, color: '#0f172a' }}>Uang Kegiatan Belajar Mengajar (KBM)</td>
                      <td style={{ padding: '5px 14px', textAlign: 'right', border: '1px solid #cbd5e1', fontFamily: 'monospace', fontWeight: 800, color: '#1e293b' }}>
                        {formatRupiah(normalBiaya.kbm)}
                      </td>
                      <td style={{ padding: '5px 14px', textAlign: 'right', border: '1px solid #cbd5e1', fontFamily: 'monospace', fontWeight: 900, color: '#0f172a' }}>
                        {formatRupiah(activeBiaya.kbm)}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: '5px 6px', textAlign: 'center', border: '1px solid #cbd5e1', fontWeight: 800, color: '#0f172a' }}>4</td>
                      <td style={{ padding: '5px 14px', border: '1px solid #cbd5e1', fontWeight: 700, color: '#0f172a' }}>Uang Komite</td>
                      <td style={{ padding: '5px 14px', textAlign: 'right', border: '1px solid #cbd5e1', fontFamily: 'monospace', fontWeight: 800, color: '#1e293b' }}>
                        {formatRupiah(normalBiaya.komite)}
                      </td>
                      <td style={{ padding: '5px 14px', textAlign: 'right', border: '1px solid #cbd5e1', fontFamily: 'monospace', fontWeight: 900, color: '#0f172a' }}>
                        {formatRupiah(activeBiaya.komite)}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: '5px 6px', textAlign: 'center', border: '1px solid #cbd5e1', fontWeight: 800, color: '#0f172a' }}>5</td>
                      <td style={{ padding: '5px 14px', border: '1px solid #cbd5e1', fontWeight: 700, color: '#0f172a' }}>Uang OSIS</td>
                      <td style={{ padding: '5px 14px', textAlign: 'right', border: '1px solid #cbd5e1', fontFamily: 'monospace', fontWeight: 800, color: '#1e293b' }}>
                        {formatRupiah(normalBiaya.osis)}
                      </td>
                      <td style={{ padding: '5px 14px', textAlign: 'right', border: '1px solid #cbd5e1', fontFamily: 'monospace', fontWeight: 900, color: '#0f172a' }}>
                        {formatRupiah(activeBiaya.osis)}
                      </td>
                    </tr>
                    <tr style={{ backgroundColor: '#f1f5f9', fontWeight: 900, color: '#0f172a' }}>
                      <td style={{ padding: '5px 6px', textAlign: 'center', border: '1px solid #cbd5e1' }}></td>
                      <td style={{ padding: '5px 14px', border: '1px solid #cbd5e1', textTransform: 'uppercase', fontSize: '10.5px', letterSpacing: '0.03em' }}>
                        SUBTOTAL II (Uang Kegiatan)
                      </td>
                      <td style={{ padding: '5px 14px', textAlign: 'right', border: '1px solid #cbd5e1', fontFamily: 'monospace', fontWeight: 800, color: '#0f172a' }}>
                        {formatRupiah(normalBiaya.subtotalII)}
                      </td>
                      <td style={{ padding: '5px 14px', textAlign: 'right', border: '1px solid #cbd5e1', fontFamily: 'monospace', fontWeight: 900, color: '#064e3b', fontSize: '12px' }}>
                        {formatRupiah(activeBiaya.subtotalII)}
                      </td>
                    </tr>

                    {/* Kelompok III: SPP */}
                    <tr style={{ backgroundColor: '#ffffff' }}>
                      <td style={{ padding: '6px', textAlign: 'center', fontWeight: 900, color: '#0f172a', border: '1px solid #cbd5e1' }}>III</td>
                      <td style={{ padding: '6px 14px', fontWeight: 900, color: '#0f172a', border: '1px solid #cbd5e1', fontSize: '12px' }}>
                        SPP BULAN JULI (Flat 3 Tahun)
                      </td>
                      <td style={{ padding: '6px 14px', textAlign: 'right', fontFamily: 'monospace', fontWeight: 800, color: '#0f172a', border: '1px solid #cbd5e1', fontSize: '12px' }}>
                        {formatRupiah(normalBiaya.spp)}
                      </td>
                      <td style={{ padding: '6px 14px', textAlign: 'right', fontFamily: 'monospace', fontWeight: 900, color: '#064e3b', border: '1px solid #cbd5e1', fontSize: '12.5px' }}>
                        {formatRupiah(activeBiaya.spp)}
                      </td>
                    </tr>

                    {/* Grand Total */}
                    <tr style={{ backgroundColor: '#064e3b', color: '#ffffff', fontWeight: 900, fontSize: '12.5px' }}>
                      <td style={{ padding: '7px 6px', textAlign: 'center', border: '1px solid #047857' }}>IV</td>
                      <td style={{ padding: '7px 14px', textTransform: 'uppercase', letterSpacing: '0.03em', border: '1px solid #047857' }}>
                        JUMLAH TOTAL BIAYA SPMB (I + II + III)
                      </td>
                      <td style={{ padding: '7px 14px', textAlign: 'right', fontFamily: 'monospace', border: '1px solid #047857', color: '#e2e8f0', fontWeight: 800, fontSize: '12.5px' }}>
                        {formatRupiah(normalBiaya.totalBiaya)}
                      </td>
                      <td style={{ padding: '7px 14px', textAlign: 'right', fontFamily: 'monospace', border: '1px solid #047857', color: '#fef08a', fontSize: '14px', fontWeight: 900 }}>
                        {formatRupiah(activeBiaya.totalBiaya)}
                      </td>
                    </tr>

                  </tbody>
                </table>
              </div>

              {/* Ketentuan Catatan Penting Daftar Ulang */}
              <div 
                style={{
                  padding: '10px 16px',
                  borderRadius: '10px',
                  backgroundColor: '#f8fafc',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '11px',
                  lineHeight: '1.45'
                }}
              >
                <span style={{ fontWeight: 900, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', fontSize: '11.5px', marginBottom: '4px' }}>
                  Ketentuan &amp; Catatan Penting Daftar Ulang :
                </span>
                <ol style={{ paddingLeft: '18px', margin: 0, color: '#1e293b' }} className="space-y-0.5 list-decimal">
                  <li>
                    Pembayaran dapat dilakukan secara <strong style={{ color: '#0f172a', fontWeight: 800 }}>Lunas</strong> atau diangsur dengan <strong style={{ color: '#064e3b', fontWeight: 900 }}>DP 1 minimal Rp 7.500.000</strong>.
                  </li>
                  <li>
                    Uang Muka dibayarkan setelah pengumuman kelulusan sesuai jadwal daftar ulang yang ditetapkan pada tanggal <strong style={{ color: '#064e3b', fontWeight: 900 }}>{tanggalDaftarUlang}</strong> (Apabila lewat batas waktu mohon konfirmasi ke sekolah).
                  </li>
                  <li>
                    Sisa Uang Pangkal dapat dilakukan dengan cara diangsur selama <strong style={{ color: '#0f172a', fontWeight: 800 }}>6 (enam) bulan</strong> terhitung dari tanggal daftar ulang.
                  </li>
                  <li>
                    Bagi murid yang mengundurkan diri dikenakan biaya sebesar <strong style={{ color: '#991b1b', fontWeight: 900 }}>50% dari DP 1</strong> (berdasarkan poin No. 1).
                  </li>
                  <li>
                    Batas pengunduran diri maksimal tanggal{' '}
                    <strong style={{ color: '#064e3b', fontWeight: 900 }}>
                      {effectiveBatasPengunduranDiri && effectiveBatasPengunduranDiri !== '-' ? effectiveBatasPengunduranDiri : '30 Juni 2027'}
                    </strong>.
                  </li>
                </ol>
              </div>
            </div>

            {/* Footer Lembar 2: Cukup Tanggal Saja Sesuai Instruksi User */}
            <div style={{ paddingTop: '10px', borderTop: '1.5px solid #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginTop: '12px' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#0f172a' }}>
                  Depok, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Modal Footer Controls (No-Print) */}
        <div className="no-print bg-white px-5 sm:px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500 text-center sm:text-left">
            <span>Rincian pembiayaan kategori </span>
            <strong className="text-emerald-800">{activeBiaya.kategori}</strong>
            <span> otomatis terlampir di lembar ke-2 SKL kelulusan.</span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
            >
              Tutup
            </button>
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isDownloading}
              className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold text-xs transition flex items-center gap-2 cursor-pointer shadow-md active:scale-95"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menyiapkan PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Unduh Lembar 2 (PDF)</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
