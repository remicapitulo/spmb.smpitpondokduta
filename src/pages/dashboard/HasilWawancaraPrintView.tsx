import React, { useState, useRef, useEffect } from 'react';
import { ObservasiGuruData, getAcademicYear } from '../../types';
import { Download, X, ShieldCheck, Loader2 } from 'lucide-react';
import { downloadElementAsPdf } from '../../utils/downloadPdfDocument';

interface Props {
  observasi: ObservasiGuruData;
  onClose: () => void;
}

export const HasilWawancaraPrintView: React.FC<Props> = ({ observasi, onClose }) => {
  const docRef = useRef<HTMLDivElement | null>(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const tahunPelajaran = getAcademicYear();

  const handleDownloadPdf = async () => {
    if (isDownloadingPdf) return;
    setIsDownloadingPdf(true);

    try {
      const docElement = docRef.current;
      if (!docElement) {
        throw new Error('Elemen dokumen wawancara tidak ditemukan');
      }

      const safeName = (observasi.namaSiswa || 'Murid').replace(/\s+/g, '_');
      const safeId = (observasi.noPendaftaran || observasi.id || 'PD').replace(/\s+/g, '_');
      const fileName = `Lembar_Evaluasi_Wawancara_${safeId}_${safeName}.pdf`;

      await downloadElementAsPdf({
        element: docElement,
        fileName,
        pdfTitle: `Lembar Evaluasi Wawancara - ${observasi.namaSiswa}`,
        footerText: `Lembar Observasi & Hasil Wawancara Resmi SPMB SMPIT Pondok Duta TP ${tahunPelajaran} · Sah terverifikasi digital.`,
        margin: 10
      });
    } catch (err) {
      console.error('Gagal unduh PDF Wawancara:', err);
      alert('Gagal mengunduh dokumen PDF Wawancara. ' + (err instanceof Error ? err.message : ''));
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-3 sm:p-6 animate-in fade-in duration-200"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-4xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 flex flex-col max-h-[88vh] overflow-hidden my-auto">
        
        {/* Controls Header (Sticky / No Print) */}
        <div className="no-print flex items-center justify-between px-5 sm:px-8 py-3.5 sm:py-4 border-b border-slate-200 bg-white shrink-0 z-10">
          <div className="pr-2">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-600 inline-block animate-pulse"></span>
              Lembar Observasi & Hasil Wawancara Resmi
            </h3>
            <p className="text-xs text-slate-500">
              Dokumen resmi evaluasi penguji SMPIT Pondok Duta
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isDownloadingPdf}
              className="px-3.5 sm:px-4 py-2 bg-purple-700 hover:bg-purple-800 disabled:opacity-50 active:scale-95 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
            >
              {isDownloadingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-purple-200" />
                  <span>Menyiapkan PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Unduh PDF</span>
                </>
              )}
            </button>
            <button
              onClick={onClose}
              title="Tutup (Esc)"
              className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Preview Canvas */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-8 bg-slate-100/70 custom-scrollbar">

        {/* Printable Official Document */}
        <div 
          ref={docRef} 
          id="printable-wawancara-doc" 
          className="print-container space-y-5 text-slate-900 text-xs bg-white p-6 sm:p-10 rounded-2xl shadow-md border border-slate-200 max-w-3xl mx-auto"
        >
          {/* Kop Surat */}
          <div className="border-b-4 border-double border-emerald-900 pb-3 text-center space-y-1">
            <div className="text-xs font-bold tracking-widest text-emerald-800 uppercase">
              YAYASAN PONDOK DUTA
            </div>
            <div className="text-base sm:text-lg font-extrabold text-slate-900 uppercase tracking-wide">
              SMPIT PONDOK DUTA CIMANGGIS DEPOK
            </div>
            <p className="text-[10px] text-slate-500">
              <a
                href="https://ban-pdm.id/satuanpendidikan/20276180"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-800 font-bold hover:underline"
                title="Buka sertifikat resmi akreditasi BAN-PDM"
              >
                Terakreditasi "A" (BAN-PDM)
              </a> | NPSN: 20276180 | NSS: 202026601007
            </p>
            <p className="text-[10px] text-slate-500">
              Perumahan Pondok Duta, Jl. Duta Plaza No. 1, Kel. Tugu, Kec. Cimanggis, Kota Depok 16451 | Telp: (021) 29378301 | Email: info@smpitpondokduta.sch.id
            </p>
          </div>

          <div className="text-center font-bold text-sm underline uppercase tracking-wide py-1">
            LEMBAR OBSERVASI CALON MURID & OBSERVASI ORANG TUA (OTM)
          </div>

          {/* Info Pendaftar */}
          <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
            <div>
              <span className="text-slate-500">Nomor Pendaftaran: </span>
              <strong className="font-mono text-emerald-900">{observasi.noPendaftaran}</strong>
            </div>
            <div>
              <span className="text-slate-500">Tanggal Observasi: </span>
              <strong>{observasi.tanggalObservasi}</strong>
            </div>
            <div>
              <span className="text-slate-500">Nama Calon Siswa: </span>
              <strong className="text-slate-900">{observasi.namaSiswa}</strong>
            </div>
            <div>
              <span className="text-slate-500">Guru Pewawancara: </span>
              <strong className="text-slate-900">{observasi.namaPewawancara}</strong>
            </div>
          </div>

          {/* Rubrik Penilaian Table */}
          <table className="w-full border-collapse border border-slate-300 text-xs">
            <thead>
              <tr className="bg-slate-100">
                <th className="border border-slate-300 p-2 text-center w-10">No</th>
                <th className="border border-slate-300 p-2 text-left w-48">Komponen Observasi</th>
                <th className="border border-slate-300 p-2 text-center w-24">Skor (0-100)</th>
                <th className="border border-slate-300 p-2 text-left">Catatan & Rubrik Evaluasi</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-slate-300 p-2 text-center">1</td>
                <td className="border border-slate-300 p-2 font-semibold">Tahsin & Tajwid Al-Qur'an</td>
                <td className="border border-slate-300 p-2 text-center font-bold text-emerald-700">{observasi.nilaiTahsin}</td>
                <td className="border border-slate-300 p-2">{observasi.catatanTahsin || '-'}</td>
              </tr>
              <tr>
                <td className="border border-slate-300 p-2 text-center">2</td>
                <td className="border border-slate-300 p-2 font-semibold">
                  Tahfidz (Hafalan Al-Qur'an)
                  <span className="block text-[10px] text-slate-500 font-normal">Diuji: {observasi.juzDiuji || 'Juz 30'}</span>
                </td>
                <td className="border border-slate-300 p-2 text-center font-bold text-emerald-700">{observasi.nilaiTahfidz}</td>
                <td className="border border-slate-300 p-2">{observasi.catatanTahfidz || '-'}</td>
              </tr>
              <tr>
                <td className="border border-slate-300 p-2 text-center">3</td>
                <td className="border border-slate-300 p-2 font-semibold">Karakter, Adab & Kemandirian</td>
                <td className="border border-slate-300 p-2 text-center font-bold text-emerald-700">{observasi.nilaiKarakterAdab}</td>
                <td className="border border-slate-300 p-2">{observasi.catatanKarakterAdab || '-'}</td>
              </tr>
              <tr>
                <td className="border border-slate-300 p-2 text-center">4</td>
                <td className="border border-slate-300 p-2 font-semibold">Potensi Akademik Dasar</td>
                <td className="border border-slate-300 p-2 text-center font-bold text-emerald-700">{observasi.nilaiAkademikDasar}</td>
                <td className="border border-slate-300 p-2">{observasi.catatanAkademikDasar || '-'}</td>
              </tr>
              <tr>
                <td className="border border-slate-300 p-2 text-center">5</td>
                <td className="border border-slate-300 p-2 font-semibold">Wawancara Orang Tua (OTM)</td>
                <td className="border border-slate-300 p-2 text-center font-bold text-emerald-700">{observasi.nilaiWawancaraOrtu}</td>
                <td className="border border-slate-300 p-2">{observasi.catatanWawancaraOrtu || '-'}</td>
              </tr>
              <tr className="bg-slate-50 font-bold">
                <td colSpan={2} className="border border-slate-300 p-2 text-right">TOTAL SKOR / RATA-RATA:</td>
                <td className="border border-slate-300 p-2 text-center text-emerald-900">{observasi.totalSkor} / {observasi.rataRata}</td>
                <td className="border border-slate-300 p-2">
                  Rekomendasi: <span className="uppercase text-emerald-800">{observasi.rekomendasi}</span>
                </td>
              </tr>
            </tbody>
          </table>

          {/* Catatan Umum */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <span className="font-bold text-slate-800 block">Catatan Umum & Rekomendasi Pewawancara:</span>
            <p className="text-slate-700">{observasi.catatanUmum || '-'}</p>
          </div>

          {observasi.pdfUrl && (
            <div className="text-[10px] text-slate-500 font-mono">
              Tercatat di Google Drive: {observasi.pdfUrl}
            </div>
          )}

          {/* Tanggal Surat Resmi (Kolom tanda tangan telah dihapus, disisakan tanggal surat) */}
          <div className="pt-6 border-t border-slate-200">
            <div className="text-right text-xs font-semibold text-slate-700">
              Depok, {observasi.tanggalObservasi || new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          </div>

        </div>
        </div>

        {/* Modal Bottom Action Bar (No Print) */}
        <div className="no-print px-5 sm:px-8 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-1.5 text-[11px]">
            <span className="font-semibold text-slate-700">No. Pendaftaran: {observasi.noPendaftaran}</span>
            <span>•</span>
            <span className="text-purple-700 font-bold">Rata-rata: {observasi.rataRata}/100 ({observasi.rekomendasi})</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition cursor-pointer"
            >
              Tutup
            </button>
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isDownloadingPdf}
              className="px-3.5 py-1.5 rounded-lg bg-purple-700 hover:bg-purple-800 disabled:opacity-50 text-white text-xs font-bold transition flex items-center gap-1 shadow-xs cursor-pointer"
            >
              {isDownloadingPdf ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-200" />
                  <span>Menyiapkan PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
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
