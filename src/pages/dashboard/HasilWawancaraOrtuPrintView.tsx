import React, { useState } from 'react';
import { HasilObservasiOrtuData } from '../../types';
import { SignaturePad } from '../../components/SignaturePad';
import { Printer, X, FileText, CheckCircle2, PenTool, Save, Check, Smartphone } from 'lucide-react';

interface Props {
  data: HasilObservasiOrtuData;
  onClose: () => void;
  onConfirmSave?: (ttdOrtu: string, ttdPewawancara: string) => void;
  isPreSaveReview?: boolean;
  signingRole?: 'pewawancara' | 'ortu';
}

export const HasilWawancaraOrtuPrintView: React.FC<Props> = ({ 
  data, 
  onClose,
  onConfirmSave,
  isPreSaveReview = false,
  signingRole = 'pewawancara'
}) => {
  const [ttdOrtu, setTtdOrtu] = useState<string>(data.ttdOrtuBase64 || '');
  const [ttdPewawancara, setTtdPewawancara] = useState<string>(data.ttdPewawancaraBase64 || '');

  const handlePrint = () => {
    window.print();
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

  const isOrtuRole = signingRole === 'ortu';

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
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block animate-pulse"></span>
              {isOrtuRole ? (
                <span>Review & Tanda Tangan Hasil Wawancara (HP Orang Tua)</span>
              ) : isPreSaveReview ? (
                <span>Review Pratinjau PDF Hasil Wawancara & Tanda Tangan Elektronik</span>
              ) : (
                <span>Dokumen PDF Hasil Wawancara Orang Tua (OTM)</span>
              )}
            </h3>
            <p className="text-xs text-slate-500">
              {isOrtuRole 
                ? 'Silakan telaah hasil wawancara di bawah ini dan bubuhkan tanda tangan Ayah/Bunda langsung di layar HP.'
                : isPreSaveReview 
                ? 'Periksa kembali data wawancara bersama orang tua dan bubuhkan tanda tangan digital sebelum disimpan'
                : 'Template cetak & arsip resmi SMPIT Pondok Duta'}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handlePrint}
              className="px-3.5 sm:px-4 py-2 bg-slate-800 hover:bg-slate-900 active:scale-95 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Simpan PDF</span>
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

        {/* Scrollable Preview Canvas & Signature Area */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-8 bg-slate-100/70 custom-scrollbar space-y-6">

          {/* Kotak peringatan kuning telah dihapus sepenuhnya sesuai permintaan user agar tidak terbaca orang tua saat tanda tangan */}

          {/* Printable Official Document Content (Matching createPDFTemplate in Code.gs) */}
          <div className="print-container space-y-6 text-slate-900 text-xs sm:text-sm bg-white p-6 sm:p-10 rounded-2xl shadow-md border border-slate-200 max-w-3xl mx-auto">
            {/* Header */}
            <div className="text-center pb-4 border-b-2 border-slate-800 space-y-1">
              <h2 className="text-base sm:text-lg font-bold uppercase tracking-wide text-slate-900 m-0">
                HASIL WAWANCARA ORANG TUA PENERIMAAN SISWA BARU
              </h2>
              <h3 className="text-sm sm:text-base font-bold text-emerald-800 m-0">
                SMPIT PONDOK DUTA
              </h3>
              <p className="text-xs text-slate-500 m-0">
                Tanggal Wawancara: {data.tanggalWawancara}
              </p>
            </div>

            {/* Biodata Box */}
            <div className="border border-slate-300 rounded-xl p-4 bg-slate-50 text-xs space-y-1.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="flex"><span className="w-32 font-bold text-slate-700">Nama Siswa:</span> <span className="font-semibold text-slate-900">{data.namaSiswa}</span></div>
                <div className="flex"><span className="w-32 font-bold text-slate-700">Nama Panggilan:</span> <span className="text-slate-900">{data.namaPanggilan}</span></div>
                <div className="flex"><span className="w-32 font-bold text-slate-700">Asal Sekolah:</span> <span className="text-slate-900">{data.sekolahAsal}</span></div>
                <div className="flex"><span className="w-32 font-bold text-slate-700">Pewawancara:</span> <span className="font-semibold text-slate-900">{data.namaPewawancara}</span></div>
                <div className="flex"><span className="w-32 font-bold text-slate-700">Nama Ayah:</span> <span className="text-slate-900">{data.namaAyah}</span></div>
                <div className="flex"><span className="w-32 font-bold text-slate-700">Nama Ibu:</span> <span className="text-slate-900">{data.namaIbu}</span></div>
              </div>
            </div>

            {/* Table: Pertanyaan | Data Awal (Ref) | Hasil Wawancara */}
            <table className="w-full border-collapse border border-slate-400 text-[11px] sm:text-xs">
              <thead>
                <tr className="bg-slate-200 text-slate-800">
                  <th className="border border-slate-400 p-2 text-center w-[35%]">Pertanyaan / Topik</th>
                  <th className="border border-slate-400 p-2 text-center w-[30%]">Data Awal / Jawaban Ortu (Ref)</th>
                  <th className="border border-slate-400 p-2 text-center w-[35%]">Hasil Wawancara / Catatan</th>
                </tr>
              </thead>
              <tbody>
                {data.jsonAnswers.map((item, idx) => {
                  // Catatan Khusus Pewawancara disembunyikan secara hening dari pratinjau sesuai instruksi user
                  const qUpper = (item.question || '').toUpperCase();
                  if (qUpper.includes('CATATAN KHUSUS') || qUpper.includes('KESIMPULAN AKHIR')) {
                    return null;
                  }
                  if (item.isHeader) {
                    return (
                      <tr key={idx}>
                        <td colSpan={3} className="bg-slate-800 text-white font-bold text-center py-2 px-3">
                          {item.question}
                        </td>
                      </tr>
                    );
                  }
                  return (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="border border-slate-300 p-2 align-top font-medium text-slate-900 whitespace-pre-line leading-relaxed">
                        {item.question}
                      </td>
                      <td className="border border-slate-300 p-2 align-top bg-slate-50/70 text-slate-700 leading-relaxed">
                        {item.refAnswer || '-'}
                      </td>
                      <td className="border border-slate-300 p-2 align-top text-slate-900 font-medium leading-relaxed">
                        {item.newAnswer || '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Signature Area (ttd-container) dengan Tanda Tangan Elektronik */}
            <div className="pt-8 grid grid-cols-2 text-center text-xs">
              <div className="flex flex-col items-center">
                <div className="h-24 w-full flex items-center justify-center">
                  {ttdOrtu ? (
                    <img 
                      src={ttdOrtu} 
                      alt="Tanda Tangan Orang Tua" 
                      className="max-h-20 max-w-[200px] object-contain"
                    />
                  ) : (
                    <div className="border border-dashed border-slate-300 rounded-lg p-2 text-slate-400 text-[10px] italic">
                      [Tanda Tangan Digital Orang Tua]
                    </div>
                  )}
                </div>
                <div className="w-52 border-t border-slate-800 pt-1 font-medium text-slate-900">
                  ( {data.namaAyah || data.namaIbu || 'Orang Tua / Wali Murid'} )
                </div>
                <span className="text-[10px] text-slate-500">Orang Tua / Wali</span>
              </div>

              <div className="flex flex-col items-center">
                <div className="h-24 w-full flex items-center justify-center">
                  {ttdPewawancara ? (
                    <img 
                      src={ttdPewawancara} 
                      alt="Tanda Tangan Pewawancara" 
                      className="max-h-20 max-w-[200px] object-contain"
                    />
                  ) : (
                    <div className="border border-dashed border-slate-300 rounded-lg p-2 text-slate-400 text-[10px] italic">
                      [Tanda Tangan Digital Pewawancara]
                    </div>
                  )}
                </div>
                <div className="w-52 border-t border-slate-800 pt-1 font-semibold text-slate-900">
                  ( {data.namaPewawancara} )
                </div>
                <span className="text-[10px] text-slate-500">Pewawancara SPMB</span>
              </div>
            </div>
          </div>

          {/* AREA TANDA TANGAN ELEKTRONIK (DIGITAL SIGNATURE PAD) */}
          <div className="no-print max-w-3xl mx-auto rounded-2xl bg-white border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
                  {isOrtuRole ? <Smartphone className="w-4 h-4" /> : <PenTool className="w-4 h-4" />}
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                    {isOrtuRole 
                      ? 'Bubuhkan Tanda Tangan Ayah/Bunda Langsung di Layar HP'
                      : 'Bubuhkan Tanda Tangan Elektronik'}
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    {isOrtuRole
                      ? 'Goreskan tanda tangan menggunakan jari langsung di dalam kotak berikut.'
                      : 'Mendukung tanda tangan langsung orang tua dan pewawancara (layar sentuh / mouse).'}
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

            {/* JIKA DIAKSES DARI HP ORANG TUA: TAMPILKAN PAD ORTU SECARA PENUH */}
            {isOrtuRole ? (
              <div className="space-y-4 pt-1">
                <SignaturePad
                  label="Tanda Tangan Orang Tua / Wali Murid"
                  sublabel="Sentuh dan goreskan tanda tangan Ayah/Bunda menggunakan jari"
                  value={ttdOrtu}
                  onChange={(val) => setTtdOrtu(val)}
                  height={150}
                />
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-600 text-[11px] flex items-center justify-between">
                  <span>Pewawancara: <strong>{data.namaPewawancara}</strong></span>
                  <span className="text-[10px] text-slate-500 italic">
                    {ttdPewawancara ? '✓ Pewawancara sudah tanda tangan' : 'Pengesahan dilakukan setelah orang tua tanda tangan'}
                  </span>
                </div>
              </div>
            ) : (
              /* JIKA DIAKSES OLEH PEWAWANCARA: BISA TANDATANGAN KEDUANYA ATAU MELIHAT TTD ORTU DARI HP */
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
                    sublabel={data.isTtdOrtuSigned ? "Sudah ditandatangani ortu dari HP (bisa digores ulang jika perlu)" : "Bisa ditandatangani langsung di sini atau di HP ortu"}
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
            )}
          </div>

        </div>

        {/* Modal Bottom Action Bar (No Print) */}
        <div className="no-print px-5 sm:px-8 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-1.5 text-[11px]">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Dokumen Wawancara OTM: <strong>{data.namaSiswa}</strong> ({data.noPendaftaran})</span>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition cursor-pointer"
            >
              {onConfirmSave ? 'Kembali' : 'Tutup'}
            </button>

            {onConfirmSave && (
              <button
                onClick={handleSaveWithSignature}
                disabled={isOrtuRole && !ttdOrtu}
                className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md cursor-pointer active:scale-95"
              >
                <Save className="w-4 h-4" />
                <span>
                  {isOrtuRole 
                    ? 'Setujui & Simpan Tanda Tangan di HP' 
                    : 'Sahkan & Simpan Hasil Wawancara'}
                </span>
              </button>
            )}

            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / Cetak PDF</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
