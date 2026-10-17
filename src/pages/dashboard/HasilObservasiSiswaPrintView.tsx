import React from 'react';
import { ObservasiSiswaData } from '../../types';
import { Printer, X } from 'lucide-react';

interface Props {
  data: ObservasiSiswaData;
  onClose: () => void;
}

export const HasilObservasiSiswaPrintView: React.FC<Props> = ({ data, onClose }) => {
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
              Lembar Observasi Siswa (Tahsin, Tahfidz, Adab, Akademik)
            </h3>
            <p className="text-xs text-slate-500">
              Khusus Tim Penguji Observasi Calon Siswa SMPIT Pondok Duta
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handlePrint}
              className="px-3.5 sm:px-4 py-2 bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Cetak PDF</span>
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
        <div className="print-container space-y-6 text-slate-900 text-xs bg-white p-6 sm:p-10 rounded-2xl shadow-md border border-slate-200 max-w-3xl mx-auto">
          {/* Kop Surat */}
          <div className="border-b-4 border-double border-emerald-900 pb-3 text-center space-y-1">
            <div className="text-xs font-bold tracking-widest text-emerald-800 uppercase">
              YAYASAN PONDOK DUTA
            </div>
            <div className="text-base sm:text-lg font-extrabold text-slate-900 uppercase tracking-wide">
              SMPIT PONDOK DUTA CIMANGGIS DEPOK
            </div>
            <p className="text-[10px] text-slate-500">
              Terakreditasi "A" Unggul | NSS: 202026601007 | NPSN: 20228391
            </p>
            <p className="text-[10px] text-slate-500">
              Jl. Duta Raya No. 45, Cimanggis, Kota Depok, Jawa Barat 16451 | Telp: (021) 871-2345
            </p>
          </div>

          <div className="text-center font-bold text-sm underline uppercase tracking-wide py-1">
            LEMBAR OBSERVASI CALON SISWA (TIM PENGUJI SISWA)
          </div>

          {/* Info Siswa */}
          <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
            <div>
              <span className="text-slate-500">Nomor Pendaftaran: </span>
              <strong className="font-mono text-emerald-900">{data.noPendaftaran}</strong>
            </div>
            <div>
              <span className="text-slate-500">Tanggal Observasi: </span>
              <strong>{data.tanggalObservasi}</strong>
            </div>
            <div>
              <span className="text-slate-500">Nama Calon Siswa: </span>
              <strong className="text-slate-900">{data.namaSiswa}</strong>
            </div>
            <div>
              <span className="text-slate-500">Guru / Penguji Siswa: </span>
              <strong className="text-slate-900">{data.namaPenguji}</strong>
            </div>
          </div>

          {/* Rubrik Table */}
          <table className="w-full border-collapse border border-slate-300 text-xs">
            <thead>
              <tr className="bg-slate-100">
                <th className="border border-slate-300 p-2 text-center w-10">No</th>
                <th className="border border-slate-300 p-2 text-left w-52">Komponen Observasi Siswa</th>
                <th className="border border-slate-300 p-2 text-center w-24">Skor (0-100)</th>
                <th className="border border-slate-300 p-2 text-left">Catatan & Rubrik Evaluasi Penguji</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-slate-300 p-2 text-center">1</td>
                <td className="border border-slate-300 p-2 font-semibold">Tahsin & Tajwid Al-Qur'an</td>
                <td className="border border-slate-300 p-2 text-center font-bold text-emerald-700">{data.nilaiTahsin}</td>
                <td className="border border-slate-300 p-2">{data.catatanTahsin || '-'}</td>
              </tr>
              <tr>
                <td className="border border-slate-300 p-2 text-center">2</td>
                <td className="border border-slate-300 p-2 font-semibold">
                  Tahfidz (Hafalan Al-Qur'an)
                  <span className="block text-[10px] text-slate-500 font-normal">Diuji: {data.juzDiuji || 'Juz 30'}</span>
                </td>
                <td className="border border-slate-300 p-2 text-center font-bold text-emerald-700">{data.nilaiTahfidz}</td>
                <td className="border border-slate-300 p-2">{data.catatanTahfidz || '-'}</td>
              </tr>
              <tr>
                <td className="border border-slate-300 p-2 text-center">3</td>
                <td className="border border-slate-300 p-2 font-semibold">Karakter, Adab & Kemandirian</td>
                <td className="border border-slate-300 p-2 text-center font-bold text-emerald-700">{data.nilaiKarakterAdab}</td>
                <td className="border border-slate-300 p-2">{data.catatanKarakterAdab || '-'}</td>
              </tr>
              <tr>
                <td className="border border-slate-300 p-2 text-center">4</td>
                <td className="border border-slate-300 p-2 font-semibold">Potensi Akademik Dasar</td>
                <td className="border border-slate-300 p-2 text-center font-bold text-emerald-700">{data.nilaiAkademikDasar}</td>
                <td className="border border-slate-300 p-2">{data.catatanAkademikDasar || '-'}</td>
              </tr>
              <tr className="bg-slate-50 font-bold">
                <td colSpan={2} className="border border-slate-300 p-2 text-right">TOTAL SKOR / RATA-RATA:</td>
                <td className="border border-slate-300 p-2 text-center text-emerald-900">{data.totalSkor} / {data.rataRata}</td>
                <td className="border border-slate-300 p-2">
                  Rekomendasi Penguji: <span className="uppercase text-emerald-800">{data.rekomendasi}</span>
                </td>
              </tr>
            </tbody>
          </table>

          {/* Catatan Penguji */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <span className="font-bold text-slate-800 block">Catatan Khusus Penguji Siswa:</span>
            <p className="text-slate-700">{data.catatanPenguji || '-'}</p>
          </div>

          {/* Tanda Tangan */}
          <div className="grid grid-cols-2 text-center text-xs pt-4">
            <div>
              Mengetahui,<br />
              <strong>Kepala SMPIT Pondok Duta</strong>
              <div className="h-16" />
              <u>(Drs. H. Mulyadi, M.Pd.)</u><br />
              NIP. 19740510 200212 1 003
            </div>
            <div>
              Depok, {data.tanggalObservasi}<br />
              <strong>Penguji Observasi Siswa</strong>
              <div className="h-16" />
              <u>({data.namaPenguji})</u><br />
              Tim Penguji Observasi Santri Baru
            </div>
          </div>

        </div>
        </div>

        {/* Modal Bottom Action Bar (No Print) */}
        <div className="no-print px-5 sm:px-8 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-1.5 text-[11px]">
            <span className="font-semibold text-slate-700">No. Pendaftaran: {data.noPendaftaran}</span>
            <span>•</span>
            <span className="text-emerald-700 font-bold">Rekomendasi: {data.rekomendasi} ({data.rataRata}/100)</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition cursor-pointer"
            >
              Tutup
            </button>
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition flex items-center gap-1 shadow-xs cursor-pointer"
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
