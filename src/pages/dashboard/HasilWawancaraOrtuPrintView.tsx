import React, { useState } from 'react';
import { HasilObservasiOrtuData, getAcademicYear } from '../../types';
import { gasService } from '../../services/gasService';
import { SignaturePad } from '../../components/SignaturePad';
import { Download, X, FileText, CheckCircle2, PenTool, Save, Check, Smartphone, Loader2 } from 'lucide-react';
import { downloadElementAsPdf } from '../../utils/downloadPdfDocument';

interface Props {
  data: HasilObservasiOrtuData;
  onClose: () => void;
  onConfirmSave?: (ttdOrtu: string, ttdPewawancara: string) => void;
  isPreSaveReview?: boolean;
  signingRole?: 'pewawancara' | 'ortu';
  hideDownload?: boolean;
}

export const HasilWawancaraOrtuPrintView: React.FC<Props> = ({ 
  data, 
  onClose,
  onConfirmSave,
  isPreSaveReview = false,
  signingRole = 'pewawancara',
  hideDownload = false
}) => {
  const [ttdOrtu, setTtdOrtu] = useState<string>(data.ttdOrtuBase64 || '');
  const [ttdPewawancara, setTtdPewawancara] = useState<string>(data.ttdPewawancaraBase64 || '');
  const logoUrl = gasService.resolveImageUrl(gasService.getAppSettings().logoUrl) || '/logo-smpit-pondok-duta.png';
  const tahunPelajaran = getAcademicYear();

  const docRef = React.useRef<HTMLDivElement | null>(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState<boolean>(false);

  const handleDownloadPdf = async () => {
    if (isDownloadingPdf) return;
    setIsDownloadingPdf(true);

    try {
      const docElement = docRef.current;
      if (!docElement) {
        throw new Error('Elemen dokumen wawancara tidak ditemukan');
      }

      const safeName = (data.namaSiswa || 'Murid').replace(/\s+/g, '_');
      const safeId = (data.idSiswa || 'PD').replace(/\s+/g, '_');
      const fileName = `Hasil_Wawancara_OTM_${safeId}_${safeName}.pdf`;

      await downloadElementAsPdf({
        element: docElement,
        fileName,
        pdfTitle: `Hasil Wawancara OTM - ${data.namaSiswa}`,
        footerText: `Hasil Wawancara Orang Tua Murid SPMB SMPIT Pondok Duta TP ${tahunPelajaran} · Sah terverifikasi digital.`,
        margin: 10
      });
    } catch (err) {
      console.error('Gagal unduh PDF Wawancara:', err);
      alert('Gagal mengunduh dokumen PDF. ' + (err instanceof Error ? err.message : ''));
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

  const handleSaveWithSignature = () => {
    if (onConfirmSave) {
      onConfirmSave(ttdOrtu, ttdPewawancara);
    }
  };

  const isOrtuRole = signingRole === 'ortu' || hideDownload;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-2 sm:p-4 md:p-6 animate-in fade-in duration-200"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-4xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 flex flex-col h-[94vh] sm:max-h-[90vh] overflow-hidden my-auto">
        
        {/* Controls Header (Clean, single close button, no top print button) */}
        <div className="no-print flex items-center justify-between px-4 sm:px-6 py-3 sm:py-3.5 border-b border-slate-200 bg-white shrink-0 z-10 gap-2">
          <div className="min-w-0 flex-1 pr-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block animate-pulse shrink-0"></span>
              <h3 className="text-xs sm:text-base font-bold text-slate-900 truncate">
                {isOrtuRole ? 'Tanda Tangan Hasil Observasi Orang Tua' : isPreSaveReview ? 'Review Pratinjau Dokumen Hasil Observasi' : 'Dokumen Hasil Observasi Orang Tua'}
              </h3>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 truncate mt-0.5">
              {isOrtuRole 
                ? 'Silakan telaah hasil wawancara dan bubuhkan tanda tangan Ayah/Bunda langsung di layar HP.'
                : isPreSaveReview 
                ? 'Periksa kembali data observasi bersama orang tua dan bubuhkan tanda tangan digital sebelum disimpan.'
                : 'Arsip resmi SMPIT Pondok Duta'}
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

        {/* Scrollable Preview Canvas & Signature Area */}
        <div className="overflow-y-auto flex-1 p-3 sm:p-8 bg-slate-100/70 custom-scrollbar space-y-4 sm:space-y-6">

          {/* Kotak peringatan kuning telah dihapus sepenuhnya sesuai permintaan user agar tidak terbaca orang tua saat tanda tangan */}

          {/* Printable Official Document Content (Matching createPDFTemplate in Code.gs) */}
          <div 
            ref={docRef} 
            id="printable-wawancara-doc" 
            className="print-container space-y-4 sm:space-y-6 text-slate-900 text-xs sm:text-sm bg-white p-4 sm:p-10 rounded-2xl shadow-md border border-slate-200 max-w-3xl mx-auto"
          >
            {/* Kop Surat Resmi dengan Logo Sekolah */}
            <div className="border-b-4 border-double border-emerald-900 pb-3 flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-4 text-center sm:text-left">
              <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 p-1 bg-white border border-emerald-200 rounded-2xl flex items-center justify-center shadow-2xs">
                <img
                  src={logoUrl}
                  alt="Logo Resmi SMPIT Pondok Duta"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="min-w-0 flex-1 space-y-0.5">
                <div className="text-[11px] sm:text-xs font-bold tracking-widest text-emerald-800 uppercase">
                  YAYASAN PERGURUAN ISLAM PONDOK DUTA
                </div>
                <div className="text-base sm:text-xl font-black text-slate-900 uppercase tracking-wide">
                  SMPIT PONDOK DUTA
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

            <div className="text-center pb-2 pt-1 border-b border-slate-200 space-y-0.5">
              <h2 className="text-sm sm:text-base font-extrabold uppercase tracking-wide text-slate-900 m-0">
                HASIL WAWANCARA ORANG TUA MURID BARU (TP {tahunPelajaran})
              </h2>
              <div className="text-[11px] text-slate-600 font-mono font-bold">
                Nomor: {(() => {
                  const cleanDigits = (data.idSiswa || '').replace(/[^0-9]/g, '');
                  const padNo = cleanDigits ? cleanDigits.slice(-4).padStart(3, '0') : '001';
                  const d = data.tanggalWawancara ? new Date(data.tanggalWawancara) : new Date();
                  const validD = isNaN(d.getTime()) ? new Date() : d;
                  const romans = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
                  const romanMonth = romans[validD.getMonth()] || 'I';
                  return `${padNo}/SPMB-SMPIT/WW-OTM/${romanMonth}/${validD.getFullYear()}`;
                })()}
              </div>
              <p className="text-[10px] text-slate-500 m-0 font-medium">
                Tanggal Pelaksanaan Wawancara: {data.tanggalWawancara}
              </p>
            </div>

            {/* Biodata Box */}
            <div className="border border-slate-200 sm:border-slate-300 rounded-xl p-3 sm:p-4 bg-slate-50 text-xs space-y-1.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2">
                <div className="flex"><span className="w-28 sm:w-32 font-bold text-slate-700 shrink-0">Nama Murid:</span> <span className="font-semibold text-slate-900">{data.namaSiswa}</span></div>
                <div className="flex"><span className="w-28 sm:w-32 font-bold text-slate-700 shrink-0">Nama Panggilan:</span> <span className="text-slate-900">{data.namaPanggilan}</span></div>
                <div className="flex"><span className="w-28 sm:w-32 font-bold text-slate-700 shrink-0">Asal Sekolah:</span> <span className="text-slate-900">{data.sekolahAsal}</span></div>
                <div className="flex"><span className="w-28 sm:w-32 font-bold text-slate-700 shrink-0">Pewawancara:</span> <span className="font-semibold text-slate-900">{data.namaPewawancara}</span></div>
                <div className="flex"><span className="w-28 sm:w-32 font-bold text-slate-700 shrink-0">Nama Ayah:</span> <span className="text-slate-900">{data.namaAyah}</span></div>
                <div className="flex"><span className="w-28 sm:w-32 font-bold text-slate-700 shrink-0">Nama Ibu:</span> <span className="text-slate-900">{data.namaIbu}</span></div>
              </div>
            </div>

            {/* TAMPILAN MOBILE: CARD VIEW (Permintaan User: tampilkan dalam bentuk card di review tampilan Mobile agar mudah dibaca) */}
            <div className="block sm:hidden print:hidden space-y-3">
              <div className="flex items-center gap-1.5 pb-0.5 text-slate-500 text-[11px] font-semibold">
                <FileText className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Ringkasan Hasil Tanya Jawab Wawancara:</span>
              </div>
              {(() => {
                let curMobileHeader = '';
                return data.jsonAnswers.map((item, idx) => {
                  const qUpper = (item.question || '').toUpperCase();
                  if (qUpper.includes('KESIMPULAN AKHIR')) {
                    return null;
                  }

                  const isCatatanKhusus = qUpper.includes('CATATAN KHUSUS');
                  if (isCatatanKhusus) {
                    if (!item.newAnswer || !item.newAnswer.trim()) return null;
                    return (
                      <div key={idx} className="bg-amber-50 rounded-xl border border-amber-300 p-3 shadow-2xs space-y-2">
                        <div className="font-bold text-amber-950 text-xs leading-snug">
                          📌 {item.question}
                        </div>
                        <div className="bg-white rounded-lg p-2.5 text-[11px] text-slate-800 border border-amber-200">
                          <span className="font-bold text-amber-800 text-[10px] block uppercase tracking-wider mb-0.5">
                            Catatan Khusus Pewawancara:
                          </span>
                          <span className="font-medium whitespace-pre-line leading-relaxed">
                            {item.newAnswer}
                          </span>
                        </div>
                      </div>
                    );
                  }
                  if (item.isHeader) {
                    curMobileHeader = item.question || '';
                    return (
                      <div 
                        key={idx} 
                        className="bg-slate-800 text-white font-extrabold text-[11px] uppercase tracking-wider py-2 px-3 rounded-xl shadow-xs mt-3 flex items-center justify-between"
                      >
                        <span>{item.question}</span>
                      </div>
                    );
                  }

                  const isSectionEF = curMobileHeader.includes('E. SIMULASI PERATURAN') || 
                                     curMobileHeader.includes('F. INFORMASI LAINNYA') ||
                                     item.question.includes('Masalah bangun pagi') ||
                                     item.question.includes('Aturan rambut rapi') ||
                                     item.question.includes('Konsekuensi tidak mengerjakan') ||
                                     item.question.includes('Aturan penggunaan HP') ||
                                     item.question.includes('Pandangan tentang Pacaran') ||
                                     item.question.includes('Pandangan tentang Komunikasi Guru') ||
                                     item.question.includes('Informasi Ekskul') ||
                                     item.question.includes('Penjelasan Duta Camp') ||
                                     item.question.includes('Penjelasan WIFI sekolah');

                  const isSectionG = curMobileHeader.includes('G. PERNYATAAN ORANG TUA') ||
                                    item.question.includes('10.000') ||
                                    item.question.includes('rekayasa apapun');

                  // E & F: Kolom isian jawaban dipindahkan ke bawah pertanyaan tanpa kolom kosong
                  if (isSectionEF) {
                    return (
                      <div key={idx} className="bg-white rounded-xl border border-slate-200 p-3 shadow-2xs space-y-2">
                        <div className="font-bold text-slate-900 text-xs leading-snug">
                          {item.question}
                        </div>
                        <div className="bg-emerald-50 rounded-lg p-2.5 text-[11px] text-emerald-950 border border-emerald-200">
                          <span className="font-bold text-emerald-800 text-[10px] block uppercase tracking-wider mb-0.5">
                            Hasil Wawancara / Tanggapan:
                          </span>
                          <span className="font-medium whitespace-pre-line leading-relaxed">
                            {item.newAnswer || '-'}
                          </span>
                        </div>
                      </div>
                    );
                  }

                  // G: Hilangkan kotak isian jawaban. Isian orang tua diletakkan di bawah pertanyaan
                  if (isSectionG) {
                    return (
                      <div key={idx} className="bg-white rounded-xl border border-emerald-200 bg-emerald-50 p-3 shadow-2xs space-y-2">
                        <div className="font-bold text-slate-900 text-xs leading-snug">
                          {item.question}
                        </div>
                        <div className="flex items-center gap-2 pt-0.5">
                          <span className="text-[11px] font-semibold text-slate-600">Isian / Pernyataan Orang Tua:</span>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg bg-emerald-100 text-emerald-900 font-bold text-xs border border-emerald-300">
                            {item.refAnswer || item.newAnswer || 'Bersedia / Setuju'}
                          </span>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={idx} className="bg-white rounded-xl border border-slate-200 p-3 shadow-2xs space-y-2">
                      <div className="font-bold text-slate-900 text-xs leading-snug">
                        {item.question}
                      </div>
                      {item.refAnswer && (
                        <div className="bg-slate-50 rounded-lg p-2 text-[11px] text-slate-600 border border-slate-100">
                          <span className="font-bold text-slate-400 text-[10px] block uppercase tracking-wider mb-0.5">
                            Data Awal / Jawaban Ortu:
                          </span>
                          <span className="leading-relaxed">{item.refAnswer}</span>
                        </div>
                      )}
                      <div className="bg-emerald-50 rounded-lg p-2.5 text-[11px] text-emerald-950 border border-emerald-200">
                        <span className="font-bold text-emerald-800 text-[10px] block uppercase tracking-wider mb-0.5">
                          Hasil Wawancara / Catatan:
                        </span>
                        <span className="font-medium whitespace-pre-line leading-relaxed">
                          {item.newAnswer || '-'}
                        </span>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>

            {/* TAMPILAN DESKTOP & PRINT RESMI: TABEL STANDAR A4 */}
            <div className="hidden sm:block print:block overflow-x-auto -mx-2 sm:mx-0">
              <table className="w-full min-w-[500px] sm:min-w-full border-collapse border border-slate-400 text-[11px] sm:text-xs">
                <thead>
                  <tr className="bg-slate-200 text-slate-800">
                    <th className="border border-slate-400 p-2 text-center w-[35%]">Pertanyaan / Topik</th>
                    <th className="border border-slate-400 p-2 text-center w-[30%]">Data Awal / Jawaban Ortu (Ref)</th>
                    <th className="border border-slate-400 p-2 text-center w-[35%]">Hasil Wawancara / Catatan</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    let curHeader = '';
                    return data.jsonAnswers.map((item, idx) => {
                      const qUpper = (item.question || '').toUpperCase();
                      if (qUpper.includes('KESIMPULAN AKHIR')) {
                        return null;
                      }

                      const isCatatanKhusus = qUpper.includes('CATATAN KHUSUS');
                      if (isCatatanKhusus) {
                        if (!item.newAnswer || !item.newAnswer.trim()) return null;
                        return (
                          <tr key={idx} className="bg-amber-50">
                            <td colSpan={3} className="border border-slate-300 p-2.5 align-top space-y-1.5">
                              <div className="font-bold text-amber-950 text-xs">
                                📌 {item.question}
                              </div>
                              <div className="p-2 rounded-lg bg-white border border-amber-300 text-slate-800 text-xs whitespace-pre-line leading-relaxed">
                                {item.newAnswer}
                              </div>
                            </td>
                          </tr>
                        );
                      }
                      if (item.isHeader) {
                        curHeader = item.question || '';
                        return (
                          <tr key={idx}>
                            <td colSpan={3} className="bg-slate-800 text-white font-bold text-center py-2 px-3">
                              {item.question}
                            </td>
                          </tr>
                        );
                      }

                      const isSectionEF = curHeader.includes('E. SIMULASI PERATURAN') || 
                                         curHeader.includes('F. INFORMASI LAINNYA') ||
                                         item.question.includes('Masalah bangun pagi') ||
                                         item.question.includes('Aturan rambut rapi') ||
                                         item.question.includes('Konsekuensi tidak mengerjakan') ||
                                         item.question.includes('Aturan penggunaan HP') ||
                                         item.question.includes('Pandangan tentang Pacaran') ||
                                         item.question.includes('Pandangan tentang Komunikasi Guru') ||
                                         item.question.includes('Informasi Ekskul') ||
                                         item.question.includes('Penjelasan Duta Camp') ||
                                         item.question.includes('Penjelasan WIFI sekolah');

                      const isSectionG = curHeader.includes('G. PERNYATAAN ORANG TUA') ||
                                        item.question.includes('10.000') ||
                                        item.question.includes('rekayasa apapun');

                      // E & F: Kolom isian jawaban dipindahkan ke bawah pertanyaan tanpa kolom kosong
                      if (isSectionEF) {
                        return (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td colSpan={3} className="border border-slate-300 p-2.5 align-top space-y-1.5">
                              <div className="font-semibold text-slate-900 whitespace-pre-line leading-relaxed">
                                {item.question}
                              </div>
                              <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-slate-900">
                                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block mb-0.5">
                                  Hasil Wawancara / Tanggapan:
                                </span>
                                <span className="font-medium whitespace-pre-line leading-relaxed text-xs">
                                  {item.newAnswer || '-'}
                                </span>
                              </div>
                            </td>
                          </tr>
                        );
                      }

                      // G: Hilangkan kotak isian jawaban. Isian orang tua diletakkan di bawah pertanyaan
                      if (isSectionG) {
                        return (
                          <tr key={idx} className="hover:bg-slate-50 bg-slate-50">
                            <td colSpan={3} className="border border-slate-300 p-2.5 align-top space-y-1.5">
                              <div className="font-semibold text-slate-900 whitespace-pre-line leading-relaxed">
                                {item.question}
                              </div>
                              <div className="flex items-center gap-2 pt-0.5">
                                <span className="text-[11px] font-semibold text-slate-600">Isian / Pernyataan Orang Tua:</span>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg bg-emerald-100 text-emerald-900 font-bold text-xs border border-emerald-300 shadow-2xs">
                                  {item.refAnswer || item.newAnswer || 'Bersedia / Setuju'}
                                </span>
                              </div>
                            </td>
                          </tr>
                        );
                      }

                      // Bagian Standar (A, B, C, D)
                      return (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="border border-slate-300 p-2 align-top font-medium text-slate-900 whitespace-pre-line leading-relaxed">
                            {item.question}
                          </td>
                          <td className="border border-slate-300 p-2 align-top bg-slate-50 text-slate-700 leading-relaxed">
                            {item.refAnswer || '-'}
                          </td>
                          <td className="border border-slate-300 p-2 align-top text-slate-900 font-medium leading-relaxed">
                            {item.newAnswer || '-'}
                          </td>
                        </tr>
                      );
                    });
                  })()}
                </tbody>
              </table>
            </div>

            {/* Tampilan Tanda Tangan Resmi di Lembar Dokumen (Hanya Tampil di Pratinjau Pewawancara / Cetak PDF, Ditutup di Akun Siswa/Ortu) */}
            {!isOrtuRole && (
              <div className="pt-8 grid grid-cols-2 gap-4 sm:gap-8 text-center text-xs">
                <div className="flex flex-col items-center justify-between min-h-[145px]">
                  <div className="h-20 w-full flex items-center justify-center">
                    {ttdOrtu ? (
                      <img 
                        src={ttdOrtu} 
                        alt="Tanda Tangan Orang Tua" 
                        className="max-h-18 max-w-[200px] object-contain"
                      />
                    ) : (
                      <div className="border border-dashed border-slate-300 rounded-lg p-2 text-slate-400 text-[10px] italic">
                        [Tanda Tangan Digital Orang Tua]
                      </div>
                    )}
                  </div>
                  <div className="w-full max-w-[280px] border-t border-slate-800 pt-1.5 px-2">
                    <div className="font-semibold text-slate-900 text-xs sm:text-[13px] break-words leading-tight">
                      ( {data.namaAyah || data.namaIbu || 'Orang Tua / Wali Murid'} )
                    </div>
                    <span className="text-[10px] sm:text-[11px] text-slate-500 block mt-0.5 font-medium">Orang Tua / Wali</span>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-between min-h-[145px]">
                  <div className="h-20 w-full flex items-center justify-center">
                    {ttdPewawancara ? (
                      <img 
                        src={ttdPewawancara} 
                        alt="Tanda Tangan Pewawancara" 
                        className="max-h-18 max-w-[200px] object-contain"
                      />
                    ) : (
                      <div className="border border-dashed border-slate-300 rounded-lg p-2 text-slate-400 text-[10px] italic">
                        [Tanda Tangan Digital Pewawancara]
                      </div>
                    )}
                  </div>
                  <div className="w-full max-w-[280px] border-t border-slate-800 pt-1.5 px-2">
                    <div className="font-semibold text-slate-900 text-xs sm:text-[13px] break-words leading-tight">
                      ( {data.namaPewawancara} )
                    </div>
                    <span className="text-[10px] sm:text-[11px] text-slate-500 block mt-0.5 font-medium">Pewawancara SPMB</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* AREA TANDA TANGAN ELEKTRONIK: Di Akun Murid/Ortu CUKUP GORESAN TANDATANGAN ORANG TUA SAJA */}
          {isOrtuRole ? (
            <div className="no-print max-w-3xl mx-auto bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-100">
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 shrink-0">
                  <PenTool className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                    Tanda Tangan Orang Tua / Wali Murid
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-snug">
                    Sentuh dan bubuhkan tanda tangan Ayah/Bunda langsung menggunakan jari atau stylus di layar HP
                  </p>
                </div>
              </div>
              <SignaturePad
                label=""
                value={ttdOrtu}
                onChange={(val) => setTtdOrtu(val)}
                height={160}
              />
            </div>
          ) : (
            /* JIKA DIAKSES OLEH PEWAWANCARA: BISA TANDATANGAN KEDUANYA ATAU MELIHAT TTD ORTU DARI HP */
            <div className="no-print max-w-3xl mx-auto rounded-2xl bg-white border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
                    <PenTool className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                      Bubuhkan Tanda Tangan Elektronik
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Mendukung tanda tangan langsung orang tua dan pewawancara (layar sentuh / mouse).
                    </p>
                  </div>
                </div>
                {(ttdOrtu || ttdPewawancara) && (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    <span>Siap Disimpan</span>
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-800">1. Tanda Tangan Orang Tua / Wali</span>
                    {data.isTtdOrtuSigned && (
                      <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">
                        Masuk dari HP Ortu
                      </span>
                    )}
                  </div>
                  <SignaturePad
                    label=""
                    sublabel={data.isTtdOrtuSigned ? "Sudah ditandatangani ortu dari HP (dapat diperbarui jika diperlukan)" : "Dapat ditandatangani langsung di sini atau di HP ortu"}
                    value={ttdOrtu}
                    onChange={(val) => setTtdOrtu(val)}
                  />
                </div>
                <div>
                  <div className="mb-1">
                    <span className="text-xs font-bold text-slate-800">2. Tanda Tangan Pewawancara ({data.namaPewawancara.split(',')[0]})</span>
                  </div>
                  <SignaturePad
                    label=""
                    sublabel="Ditandatangani oleh Tim Pewawancara OTM"
                    value={ttdPewawancara}
                    onChange={(val) => setTtdPewawancara(val)}
                  />
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Bottom Action Bar (No Print - Single Unduh PDF button) */}
        <div className="no-print px-4 sm:px-8 py-3 sm:py-3.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-1.5 text-[11px] truncate">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="truncate">Dokumen Observasi: <strong>{data.namaSiswa}</strong> ({data.noPendaftaran})</span>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
            <button
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition cursor-pointer"
            >
              {onConfirmSave ? 'Kembali' : 'Tutup'}
            </button>

            {onConfirmSave && (
              <button
                onClick={handleSaveWithSignature}
                disabled={isOrtuRole && !ttdOrtu}
                className="flex-1 sm:flex-initial px-4 sm:px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md cursor-pointer active:scale-95"
              >
                <Save className="w-4 h-4 shrink-0" />
                <span className="truncate">
                  {isOrtuRole 
                    ? 'Setujui & Simpan TTD' 
                    : 'Sahkan & Simpan Hasil'}
                </span>
              </button>
            )}

            {!isOrtuRole && !hideDownload && (
              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={isDownloadingPdf}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-95 shrink-0"
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
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
