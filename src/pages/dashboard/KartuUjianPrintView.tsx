import React from 'react';
import { DataSiswa, getAcademicYear } from '../../types';
import { Printer, X, QrCode, CheckCircle2 } from 'lucide-react';

interface Props {
  siswa: DataSiswa;
  onClose: () => void;
}

export const KartuUjianPrintView: React.FC<Props> = ({ siswa, onClose }) => {
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
      <div className="w-full max-w-2xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 flex flex-col max-h-[88vh] overflow-hidden my-auto">
        
        {/* Controls Header (Sticky / No Print) */}
        <div className="no-print flex items-center justify-between px-5 sm:px-7 py-3.5 sm:py-4 border-b border-slate-200 bg-white shrink-0 z-10">
          <div className="pr-2">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block animate-pulse"></span>
              Pratinjau Kartu Peserta Ujian & Wawancara
            </h3>
            <p className="text-xs text-slate-500">
              Dokumen siap cetak resmi SPMB SMPIT Pondok Duta
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
        <div className="overflow-y-auto flex-1 p-4 sm:p-6 bg-slate-100/70 custom-scrollbar">

        {/* Printable Official Card Body */}
        <div className="print-container border-2 border-emerald-800 rounded-2xl p-6 bg-white space-y-5 text-slate-900">
          
          {/* Kop Kartu */}
          <div className="flex items-center justify-between border-b-2 border-emerald-800 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-800 text-amber-300 flex items-center justify-center font-black text-xl">
                PD
              </div>
              <div>
                <div className="text-xs font-bold text-emerald-800 uppercase tracking-widest">
                  PANITIA SPMB TP {getAcademicYear()}
                </div>
                <div className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  SMPIT PONDOK DUTA CIMANGGIS
                </div>
                <div className="text-[10px] text-slate-500">
                  Jl. Duta Raya No. 45 Cimanggis Depok | Telp: (021) 871-2345
                </div>
              </div>
            </div>

            <div className="text-right">
              <span className="px-2.5 py-1 rounded-md bg-emerald-800 text-white text-[11px] font-extrabold uppercase tracking-wider">
                KARTU PESERTA
              </span>
            </div>
          </div>

          {/* Main Card Content */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-start">
            
            {/* Foto Placeholder */}
            <div className="sm:col-span-1 flex flex-col items-center">
              <div className="w-32 h-40 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 flex flex-col items-center justify-center p-2 text-center text-slate-400">
                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500 mb-1">
                  3x4
                </div>
                <span className="text-[10px] font-semibold">PAS FOTO SISWA</span>
                <span className="text-[9px] text-slate-400">Latar Biru/Merah</span>
              </div>
              <div className="mt-2 text-center">
                <span className="text-[10px] font-mono font-bold text-slate-500">QR VERIFIKASI</span>
                <div className="w-16 h-16 border border-slate-300 rounded-lg p-1 mx-auto flex items-center justify-center bg-white shadow-xs">
                  <QrCode className="w-12 h-12 text-slate-800" />
                </div>
              </div>
            </div>

            {/* Biodata Info */}
            <div className="sm:col-span-3 space-y-2 text-xs">
              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl">
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                  Nomor Registrasi / Pendaftaran
                </span>
                <span className="text-xl font-black font-mono text-emerald-950 tracking-wider">
                  {siswa.noPendaftaran}
                </span>
              </div>

              <table className="w-full text-[11px] sm:text-xs">
                <tbody>
                  <tr className="border-b border-slate-100">
                    <td className="py-1 text-slate-500 w-32 font-medium">Nama Lengkap</td>
                    <td className="py-1 font-bold text-slate-900">: {siswa.namaLengkap}</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="py-1 text-slate-500 font-medium">NISN / NIK</td>
                    <td className="py-1 text-slate-800">: {siswa.nisn} / {siswa.nik}</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="py-1 text-slate-500 font-medium">Jenis Kelamin</td>
                    <td className="py-1 text-slate-800">: {siswa.jenisKelamin}</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="py-1 text-slate-500 font-medium">Tempat, Tanggal Lahir</td>
                    <td className="py-1 text-slate-800">: {siswa.tempatLahir}, {siswa.tanggalLahir}</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="py-1 text-slate-500 font-medium">Asal Sekolah SD/MI</td>
                    <td className="py-1 font-semibold text-slate-900">: {siswa.asalSekolah}</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="py-1 text-slate-500 font-medium">Nama Orang Tua / HP</td>
                    <td className="py-1 text-slate-800">: {siswa.namaAyah} ({siswa.noHpAyah})</td>
                  </tr>
                </tbody>
              </table>

              {/* Jadwal Ujian Card */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-400 block font-semibold">Jadwal Observasi:</span>
                  <span className="font-bold text-slate-800">Sabtu, 17 Januari 2026</span>
                  <span className="block text-slate-500">Pukul 08.00 - 11.30 WIB</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold">Ruang & Meja:</span>
                  <span className="font-bold text-slate-800">Ruang A - Gedung SMPIT Lt. 2</span>
                  <span className="block text-emerald-700 font-semibold">Sesi Wawancara OTM: 09.30 WIB</span>
                </div>
              </div>
            </div>

          </div>

          {/* Tata Tertib Sesi Observasi */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[10px] text-slate-600 space-y-1">
            <span className="font-bold text-slate-800 block">Tata Tertib Peserta:</span>
            <p>
              1. Wajib hadir di lokasi 15 menit sebelum observasi dimulai dengan membawa Kartu Peserta ini.<br />
              2. Mengenakan seragam asal SD/MI masing-masing (putra berpeci, putri berjilbab syar'i).<br />
              3. Orang tua / wali murid wajib hadir mendampingi untuk sesi wawancara OTM.<br />
              4. Membawa alat tulis pensil 2B, pulpen, dan Al-Qur'an / Juz 'Amma pribadi.
            </p>
          </div>

          {/* Tanda Tangan */}
          <div className="grid grid-cols-2 text-center text-xs pt-2">
            <div>
              Calon Siswa / Peserta,
              <div className="h-12" />
              <u>({siswa.namaLengkap})</u>
            </div>
            <div>
              Depok, Panitia SPMB,
              <div className="h-12" />
              <u>(Ust. H. Ahmad Dahlan, S.Pd.I)</u><br />
              <span className="text-[10px] text-slate-400">Ketua Panitia</span>
            </div>
          </div>

        </div>
        </div>

        {/* Modal Bottom Action Bar (No Print) */}
        <div className="no-print px-5 sm:px-7 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-1.5 text-[11px]">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Format cetak standar A4/F4 (Pas Foto 3x4 & QR Verifikasi)</span>
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
              <span>Cetak Sekarang</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
