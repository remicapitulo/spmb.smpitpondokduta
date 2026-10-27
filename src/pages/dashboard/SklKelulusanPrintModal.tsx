import React, { useRef, useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { StatusKelulusanInfo, PembiayaanCategory, getAcademicYear } from '../../types';
import { gasService } from '../../services/gasService';
import { formatRupiah } from '../../services/pembiayaanData';
import { LOGO_PONDOK_DUTA_BASE64 } from '../../assets/logoBase64';
import { downloadElementAsPdf } from '../../utils/downloadPdfDocument';
import { 
  X, 
  Download, 
  Printer, 
  FileText, 
  CheckCircle2, 
  CreditCard, 
  Award, 
  GraduationCap, 
  Calendar, 
  QrCode as QrCodeIcon,
  ShieldCheck,
  Tag,
  Loader2,
  ChevronRight,
  BadgePercent
} from 'lucide-react';

interface Props {
  data: {
    noPendaftaran: string;
    namaLengkap: string;
    nisn?: string;
    asalSekolah?: string;
    jalur?: string;
    status?: 'LULUS' | 'CADANGAN' | 'TIDAK_LULUS' | 'PROSES_SELEKSI';
    jadwalDaftarUlang?: string;
    kategoriPembiayaan?: string;
    pesanPengumuman?: string;
  };
  onClose: () => void;
  onOpenRincianKategori?: () => void;
}

export const SklKelulusanPrintModal: React.FC<Props> = ({
  data,
  onClose,
  onOpenRincianKategori
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'page1' | 'page2'>('all');
  const [logoBase64, setLogoBase64] = useState<string>(LOGO_PONDOK_DUTA_BASE64);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [isDownloading, setIsDownloading] = useState(false);
  const docRef = useRef<HTMLDivElement | null>(null);
  const tahunPelajaran = getAcademicYear();

  // Dapatkan observasi siswa & kelulusan untuk data paling akurat
  const obsData = gasService.getObservasiSiswa(data.noPendaftaran);
  const kelulusanData = gasService.getStatusKelulusan(data.noPendaftaran);
  const siswaData = gasService.getSiswaByNo(data.noPendaftaran);
  const indukData = gasService.getDataIndukList().find(d => d.noPendaftaran === data.noPendaftaran);

  const effectiveNisn = data.nisn && data.nisn !== '-' ? data.nisn : (siswaData?.nisn || indukData?.nisn || kelulusanData?.nisn || '-');
  const effectiveAsalSekolah = data.asalSekolah || siswaData?.asalSekolah || kelulusanData?.asalSekolah || 'SD/MI Pendaftar';
  const effectiveJadwal = data.jadwalDaftarUlang || obsData?.tanggalMaksimalDaftarUlang || kelulusanData?.jadwalDaftarUlang || '20 - 25 Januari 2027';
  const defaultSheetKat = gasService.getPembiayaanList()[0]?.kategori || '';
  const effectiveKategoriName = data.kategoriPembiayaan || obsData?.kategoriPembiayaan || kelulusanData?.kategoriPembiayaan || defaultSheetKat;
  
  const activeBiaya: PembiayaanCategory = gasService.getPembiayaanByCategory(effectiveKategoriName);
  const normalBiaya: PembiayaanCategory = gasService.getPembiayaanList()[0] || activeBiaya;

  // Preload logo kustom
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

  // Generate QR Code Pengesahan Digital
  useEffect(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const verifyPayload = `${origin}/?tab=cek-kelulusan&no=${encodeURIComponent(data.noPendaftaran)}&verifikasi=true`;
    QRCode.toDataURL(verifyPayload, {
      width: 180,
      margin: 1,
      color: { dark: '#047857', light: '#ffffff' }
    })
      .then((url) => setQrCodeUrl(url))
      .catch((err) => console.warn('QR Code generation warning:', err));
  }, [data.noPendaftaran]);

  const handleDownloadPdf = async () => {
    if (!docRef.current || isDownloading) return;
    setIsDownloading(true);
    try {
      const safeName = (data.namaLengkap || 'Murid').replace(/\s+/g, '_');
      const safeNo = (data.noPendaftaran || 'PD').replace(/\s+/g, '_');
      await downloadElementAsPdf({
        element: docRef.current,
        fileName: `SKL_Resmi_SPMB_${safeNo}_${safeName}.pdf`,
        pdfTitle: `Surat Keterangan Lulus (SKL) SPMB - ${data.namaLengkap}`,
        footerText: `Dokumen Resmi SKL & Rincian Daftar Ulang SMPIT Pondok Duta TP ${tahunPelajaran} · Terverifikasi Sah.`,
        margin: 10
      });
    } catch (e) {
      console.error('Gagal mengunduh PDF SKL:', e);
      alert('Gagal membuat file PDF. Silakan gunakan tombol Print di browser.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-2 sm:p-4 md:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col max-h-[95vh] overflow-hidden my-auto">
        
        {/* Modal Controls Header (Sticky top - No Print) */}
        <div className="no-print bg-slate-900 text-white px-5 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-600/30 border border-emerald-400/40 text-emerald-300">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                  Dokumen Resmi 2 Halaman
                </span>
                <span className="text-xs text-slate-400">| SKL &amp; Rincian Daftar Ulang</span>
              </div>
              <h3 className="font-extrabold text-sm sm:text-base text-white tracking-wide">
                Pratinjau Surat Keterangan Lulus (SKL) Murid
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {onOpenRincianKategori && (
              <button
                type="button"
                onClick={onOpenRincianKategori}
                className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                title="Pilih atau sesuaikan rujukan kategori pembiayaan"
              >
                <Tag className="w-4 h-4" />
                <span className="hidden sm:inline">Pilihan Rincian Biaya</span>
                <span className="sm:hidden">Rincian Biaya</span>
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

        {/* Tab Selector: Semua Halaman, Lembar 1, Lembar 2 (No-Print) */}
        <div className="no-print bg-slate-100 border-b border-slate-200 px-5 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-300'
              }`}
            >
              Semua Halaman (2 Lembar)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('page1')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'page1'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-300'
              }`}
            >
              Lembar 1: Surat Kelulusan (SKL)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('page2')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'page2'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-300'
              }`}
            >
              Lembar 2: Lampiran Rincian Biaya
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <span className="font-semibold">Kategori Pembiayaan:</span>
            <span className="font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
              {activeBiaya.kategori}
            </span>
          </div>
        </div>

        {/* Document Scrollable Body */}
        <div className="overflow-y-auto p-4 sm:p-8 bg-slate-200/60 custom-scrollbar flex-1">
          <div 
            ref={docRef}
            id="printable-skl-document"
            className="print-container max-w-3xl mx-auto space-y-8"
            style={{ fontFamily: "'Plus Jakarta Sans', Arial, Helvetica, sans-serif" }}
          >
            
            {/* ========================================================================= */}
            {/* LEMBAR 1 (F4 Folio Page 1): PENGUMUMAN HASIL KELULUSAN / SKL RESMI        */}
            {/* ========================================================================= */}
            {(activeTab === 'all' || activeTab === 'page1') && (
              <div 
                className="a4-page-slice bg-white rounded-2xl border border-slate-200 text-slate-900"
                style={{
                  width: '794px',
                  minHeight: '1218px',
                  boxSizing: 'border-box',
                  padding: '38px 42px',
                  margin: '0 auto',
                  backgroundColor: '#ffffff',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  fontFamily: "'Plus Jakarta Sans', Arial, Helvetica, sans-serif"
                }}
              >
                <div className="space-y-4">
                  {/* Kop Surat Resmi */}
                  <div className="border-b-4 border-double border-emerald-900 pb-3 flex items-center gap-4 text-left">
                    <div className="w-20 h-20 shrink-0 p-1 bg-white border border-emerald-200 rounded-xl flex items-center justify-center">
                      <img
                        src={logoBase64 || LOGO_PONDOK_DUTA_BASE64}
                        alt="Logo Resmi SMPIT Pondok Duta"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="text-xs font-bold tracking-widest text-emerald-800 uppercase">
                        YAYASAN PERGURUAN ISLAM PONDOK DUTA
                      </div>
                      <div className="text-xl font-black text-slate-900 uppercase tracking-wide">
                        SMP ISLAM TERPADU PONDOK DUTA
                      </div>
                      <p className="text-[10.5px] text-slate-600 font-medium">
                        <span className="font-bold text-emerald-800">Terakreditasi "A" BAN-PDM</span> | NPSN: 20276180 | NSS: 202026601007
                      </p>
                      <p className="text-[10px] text-slate-500 leading-snug">
                        Perumahan Pondok Duta, Jl. Duta Plaza No. 1, Kel. Tugu, Kec. Cimanggis, Kota Depok, Jawa Barat 16451
                      </p>
                      <p className="text-[9.5px] text-emerald-900 font-semibold">
                        Telp: (021) 29378301 · Website: smpitpondokduta.sch.id · Email: info@smpitpondokduta.sch.id
                      </p>
                    </div>
                  </div>

                  {/* Judul Surat Resmi */}
                  <div className="text-center space-y-1 pt-1 pb-1">
                    <div className="font-black text-[17px] uppercase text-slate-900 tracking-wide underline decoration-slate-900 decoration-2">
                      PENGUMUMAN HASIL TES SISTEM PENERIMAAN MURID BARU (SPMB)
                    </div>
                    <div className="text-[14.5px] font-extrabold text-slate-800 uppercase">
                      SMP ISLAM TERPADU PONDOK DUTA
                    </div>
                    <div className="text-[13px] font-bold text-emerald-900">
                      TAHUN PELAJARAN {tahunPelajaran}
                    </div>
                  </div>

                  {/* Salam Pembuka */}
                  <p className="leading-relaxed text-[13px] italic font-medium text-slate-700">
                    Assalamu’alaikum Wr. Wb.
                  </p>

                  <p className="leading-relaxed text-[13px] text-slate-800">
                    Yang bertanda tangan di bawah ini, Kepala Sekolah Menengah Pertama Islam Terpadu (SMPIT) Pondok Duta menerangkan bahwa :
                  </p>

                  {/* Kotak Identitas Murid */}
                  <div 
                    style={{
                      backgroundColor: '#f8fafc',
                      border: '1.5px solid #cbd5e1',
                      borderRadius: '14px',
                      padding: '16px 24px',
                      textAlign: 'center'
                    }}
                  >
                    <div style={{ fontSize: '22px', fontWeight: 900, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {data.namaLengkap}
                    </div>
                    <div style={{ fontFamily: 'monospace', fontSize: '13.5px', fontWeight: 700, color: '#475569', marginTop: '4px' }}>
                      No. Peserta / Registrasi : <span style={{ color: '#064e3b', fontWeight: 900 }}>{data.noPendaftaran}</span>
                    </div>
                    <div style={{ fontSize: '12.5px', color: '#64748b', marginTop: '4px' }}>
                      NISN: <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#1e293b' }}>{effectiveNisn}</span> | Asal Sekolah: <span style={{ fontWeight: 700, color: '#1e293b' }}>{effectiveAsalSekolah}</span>
                    </div>
                  </div>

                  {/* Pernyataan Diterima (Table Layout 100% immune to html2canvas inline-block text clipping) */}
                  <div style={{ textAlign: 'center', margin: '8px 0' }}>
                    <div style={{ fontSize: '13px', color: '#475569', fontWeight: 600, marginBottom: '6px' }}>
                      Dinyatakan :
                    </div>
                    <table 
                      role="presentation"
                      align="center"
                      style={{
                        margin: '0 auto',
                        width: '480px',
                        maxWidth: '92%',
                        borderCollapse: 'separate',
                        borderSpacing: 0,
                        backgroundColor: '#ecfdf5',
                        border: '2px solid #059669',
                        borderRadius: '16px'
                      }}
                    >
                      <tbody>
                        <tr>
                          <td 
                            align="center"
                            style={{
                              padding: '18px 30px',
                              textAlign: 'center',
                              backgroundColor: '#ecfdf5',
                              borderRadius: '14px',
                              verticalAlign: 'middle'
                            }}
                          >
                            <div 
                              style={{ 
                                color: '#064e3b', 
                                fontWeight: 900, 
                                fontSize: '26px', 
                                lineHeight: '32px',
                                textTransform: 'uppercase',
                                letterSpacing: '2px'
                              }}
                            >
                              ( DITERIMA )
                            </div>
                            <div 
                              style={{ 
                                color: '#065f46', 
                                fontWeight: 800, 
                                fontSize: '14.5px', 
                                marginTop: '5px', 
                                lineHeight: '20px' 
                              }}
                            >
                              Menjadi murid SMP Islam Terpadu Pondok Duta (Kelas VII)
                            </div>
                            <div 
                              style={{ 
                                color: '#047857', 
                                fontWeight: 700, 
                                fontSize: '12px', 
                                marginTop: '4px', 
                                lineHeight: '18px' 
                              }}
                            >
                              Terhitung mulai Tahun Pelajaran {tahunPelajaran}.
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <p className="leading-relaxed text-[13px] text-slate-800 text-left">
                    Kami mengucapkan selamat atas keberhasilan putra-putri Bapak/Ibu, semoga menjadi kebahagiaan dan kebanggaan bagi Bapak/Ibu sekeluarga.
                  </p>

                  {/* Informasi Pelaksanaan Daftar Ulang */}
                  <div 
                    style={{
                      padding: '14px 22px',
                      borderRadius: '12px',
                      backgroundColor: '#f8fafc',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '13px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Calendar className="w-4 h-4 text-emerald-700 shrink-0" />
                      <span style={{ fontWeight: 700, color: '#1e293b' }}>Pelaksanaan Daftar Ulang :</span>
                      <span style={{ fontWeight: 900, color: '#064e3b', textDecoration: 'underline' }}>{effectiveJadwal}</span>
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: 800, color: '#475569', backgroundColor: '#ffffff', padding: '5px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                      Rincian Biaya : Terlampir di Lembar 2
                    </span>
                  </div>

                  <p className="leading-relaxed text-[13px] text-slate-700">
                    Demikian hasil tes ini kami sampaikan, atas perhatian dan kerjasamanya kami ucapkan terima kasih.
                  </p>

                  <p className="leading-relaxed text-[13px] italic font-medium text-slate-700">
                    Wassalamu’alaikum Wr. Wb.
                  </p>
                </div>

                {/* Footer Lembar 1: QR Code Verifikasi & Tanggal Saja (Tanpa Nama Pejabat/Kepsek) */}
                <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-4 mt-6">
                  
                  {/* QR Code Verifikasi Resmi */}
                  <div className="flex items-center gap-3">
                    {qrCodeUrl ? (
                      <div className="p-1 bg-white rounded-xl border border-slate-300 shrink-0">
                        <img src={qrCodeUrl} alt="QR Code Verifikasi Resmi" className="w-18 h-18 object-contain" />
                      </div>
                    ) : (
                      <div className="w-18 h-18 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-center shrink-0">
                        <QrCodeIcon className="w-8 h-8 text-slate-700" />
                      </div>
                    )}
                    <div className="text-left space-y-0.5">
                      <span className="text-[11.5px] font-bold text-slate-900 block">
                        Verifikasi Keabsahan Dokumen
                      </span>
                      <p className="text-[10px] text-slate-500 leading-snug max-w-[240px]">
                        Pindai QR Code untuk memvalidasi keaslian Surat Keterangan Lulus resmi SMPIT Pondok Duta.
                      </p>
                      <div className="text-[9.5px] font-mono text-emerald-800 font-bold">
                        Ref: SPMB-PD/{data.noPendaftaran}/{new Date().getFullYear()}
                      </div>
                    </div>
                  </div>

                  {/* Cukup Tanggal Saja Sesuai Instruksi User */}
                  <div className="text-right shrink-0">
                    <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#0f172a' }}>
                      Depok, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                  </div>

                </div>

              </div>
            )}

            {/* ========================================================================= */}
            {/* LEMBAR 2 (F4 Folio Page 2): RINCIAN DAFTAR ULANG & PEMBIAYAAN            */}
            {/* ========================================================================= */}
            {(activeTab === 'all' || activeTab === 'page2') && (
              <div 
                className="a4-page-slice bg-white rounded-2xl border border-slate-200 text-slate-900"
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

                  {/* Badge Header Judul Lampiran */}
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

                  {/* Data Calon Murid (Murni Murid, Tanpa Kategori & Ring) */}
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
                        <span style={{ fontFamily: 'monospace', fontWeight: 900, color: '#0f172a', fontSize: '13px' }}>: {data.noPendaftaran}</span>
                      </div>
                      <div className="flex items-center">
                        <span style={{ width: '135px', color: '#475569', fontWeight: 600 }}>Nama Calon Murid</span>
                        <span style={{ fontWeight: 900, color: '#0f172a', textTransform: 'uppercase', fontSize: '13px' }}>: {data.namaLengkap}</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center">
                        <span style={{ width: '105px', color: '#475569', fontWeight: 600 }}>NISN</span>
                        <span style={{ fontFamily: 'monospace', fontWeight: 800, color: '#0f172a', fontSize: '13px' }}>: {effectiveNisn}</span>
                      </div>
                      <div className="flex items-center">
                        <span style={{ width: '105px', color: '#475569', fontWeight: 600 }}>Asal SD/MI</span>
                        <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '13px' }}>: {effectiveAsalSekolah}</span>
                      </div>
                    </div>
                  </div>

                  {/* I. PERSYARATAN DAFTAR ULANG */}
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

                  {/* II. TEMPAT, TANGGAL DAN WAKTU DAFTAR ULANG */}
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
                        <span style={{ fontWeight: 900, color: '#064e3b', textDecoration: 'underline' }}>{effectiveJadwal}</span>
                      </div>
                      <div>
                        <span style={{ color: '#475569', display: 'block', fontSize: '10.5px', textTransform: 'uppercase', fontWeight: 800 }}>Hari &amp; Waktu :</span>
                        <span style={{ fontWeight: 800, color: '#0f172a' }}>Senin – Jum’at / 08.00 – 12.00 WIB</span>
                      </div>
                    </div>
                  </div>

                  {/* III. TABEL BIAYA SPMB (LEBIH TEGAS, PRESISI, DAN JELAS TERBACA) */}
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
                        Uang Muka dibayarkan setelah pengumuman kelulusan sesuai jadwal daftar ulang yang ditetapkan pada tanggal <strong style={{ color: '#064e3b', fontWeight: 900 }}>{effectiveJadwal}</strong> (Apabila lewat dari batas waktu yang ditentukan mohon untuk konfirmasi ke sekolah).
                      </li>
                      <li>
                        Sisa Uang Pangkal dapat dilakukan dengan cara diangsur selama <strong style={{ color: '#0f172a', fontWeight: 800 }}>6 (enam) bulan</strong>.
                      </li>
                      <li>
                        Bagi murid yang mengundurkan diri dikenakan biaya sebesar <strong style={{ color: '#991b1b', fontWeight: 900 }}>50% dari DP 1</strong> (berdasarkan poin No. 1).
                      </li>
                      <li>
                        Batas pengunduran diri maksimal tanggal sebelum masa orientasi/tahun ajaran baru dimulai.
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
            )}

          </div>
        </div>

        {/* Modal Bottom Footer (No-Print) */}
        <div className="no-print bg-white px-5 sm:px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500 text-center sm:text-left">
            <span>Dokumen resmi </span>
            <strong className="text-emerald-800">SKL &amp; Rincian Daftar Ulang</strong>
            <span> siap dicetak atau diunduh sebagai PDF resmi.</span>
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
                  <span>Menyiapkan Dokumen PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Unduh PDF Resmi (2 Lembar)</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
