import React, { useState } from 'react';
import { gasService } from '../services/gasService';
import { StatusKelulusanInfo } from '../types';
import confetti from 'canvas-confetti';
import { 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  FileText, 
  Printer, 
  Sparkles, 
  XCircle, 
  School, 
  User, 
  Calendar,
  Award,
  ChevronRight,
  X
} from 'lucide-react';

interface Props {
  onGoToRegister: () => void;
}

export const CekKelulusanPage: React.FC<Props> = ({ onGoToRegister }) => {
  const [keyword, setKeyword] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<StatusKelulusanInfo | null>(null);
  const [searched, setSearched] = useState(false);
  const [showSklModal, setShowSklModal] = useState(false);

  const handleSearch = async (termToSearch?: string) => {
    const query = termToSearch || keyword;
    if (!query.trim()) return;

    setIsSearching(true);
    setSearched(true);
    const data = await gasService.checkStatusKelulusan(query);
    setIsSearching(false);
    setResult(data);

    if (data && data.status === 'LULUS') {
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // Safe fail
      }
    }
  };

  const handleChipClick = (code: string) => {
    setKeyword(code);
    handleSearch(code);
  };

  const handlePrintSkl = () => {
    window.print();
  };

  return (
    <div className="max-w-3xl mx-auto space-y-10">
      
      {/* Header Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-br from-emerald-800 via-teal-800 to-slate-900 text-white shadow-xl space-y-3 text-center sm:text-left">
        <span className="text-xs font-bold uppercase tracking-widest text-amber-300 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-500/30 inline-block">
          Pengumuman Hasil Seleksi SPMB
        </span>
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
          Cek Status Kelulusan Calon Siswa
        </h1>
        <p className="text-xs sm:text-sm text-emerald-100 max-w-xl leading-relaxed">
          Masukkan Nomor Pendaftaran (contoh: <code>PD-2026-001</code>) atau NISN siswa untuk melihat hasil evaluasi observasi & wawancara.
        </p>
      </div>

      {/* Search Input Box */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-4">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="flex flex-col sm:flex-row items-center gap-3"
        >
          <div className="relative w-full">
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Ketik No. Pendaftaran (PD-2026-...) atau NISN..."
              className="w-full pl-10 pr-4 py-3.5 rounded-2xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold text-xs sm:text-sm text-slate-800 uppercase"
            />
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
          </div>
          <button
            type="submit"
            disabled={isSearching || !keyword.trim()}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white font-bold text-xs sm:text-sm shadow-md transition disabled:opacity-50 shrink-0"
          >
            {isSearching ? 'Memeriksa...' : 'Cari Data'}
          </button>
        </form>

        {/* Quick Test Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-2 text-xs text-slate-500">
          <span className="font-semibold text-[11px]">Contoh Data Uji Cepat:</span>
          <button
            type="button"
            onClick={() => handleChipClick('PD-2026-001')}
            className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-mono text-[11px] font-semibold transition"
          >
            PD-2026-001 (Lulus)
          </button>
          <button
            type="button"
            onClick={() => handleChipClick('PD-2026-002')}
            className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 font-mono text-[11px] font-semibold transition"
          >
            PD-2026-002 (Proses)
          </button>
          <button
            type="button"
            onClick={() => handleChipClick('0112345678')}
            className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 font-mono text-[11px] font-semibold transition"
          >
            0112345678 (NISN)
          </button>
        </div>
      </div>

      {/* Result Card */}
      {searched && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          {result ? (
            <div className={`p-6 sm:p-8 rounded-3xl border shadow-lg space-y-6 ${
              result.status === 'LULUS'
                ? 'bg-gradient-to-br from-emerald-50 to-white border-emerald-300'
                : result.status === 'CADANGAN'
                ? 'bg-gradient-to-br from-amber-50 to-white border-amber-300'
                : result.status === 'PROSES_SELEKSI'
                ? 'bg-gradient-to-br from-sky-50 to-white border-sky-300'
                : 'bg-gradient-to-br from-rose-50 to-white border-rose-200'
            }`}>
              
              {/* Header Status */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/60">
                <div className="flex items-center gap-3">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-white shadow-md ${
                    result.status === 'LULUS'
                      ? 'bg-emerald-600'
                      : result.status === 'CADANGAN'
                      ? 'bg-amber-600'
                      : result.status === 'PROSES_SELEKSI'
                      ? 'bg-sky-600'
                      : 'bg-rose-600'
                  }`}>
                    {result.status === 'LULUS' ? (
                      <CheckCircle2 className="w-8 h-8 text-white" />
                    ) : result.status === 'CADANGAN' ? (
                      <Clock className="w-8 h-8 text-white" />
                    ) : (
                      <AlertCircle className="w-8 h-8 text-white" />
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Status Hasil Seleksi
                    </div>
                    <div className={`text-xl sm:text-2xl font-extrabold ${
                      result.status === 'LULUS'
                        ? 'text-emerald-800'
                        : result.status === 'CADANGAN'
                        ? 'text-amber-800'
                        : result.status === 'PROSES_SELEKSI'
                        ? 'text-sky-800'
                        : 'text-rose-800'
                    }`}>
                      {result.status === 'LULUS'
                        ? 'DITERIMA (LULUS)'
                        : result.status === 'CADANGAN'
                        ? 'CADANGAN'
                        : result.status === 'PROSES_SELEKSI'
                        ? 'DALAM PROSES SELEKSI'
                        : 'TIDAK MEMENUHI KUOTA'}
                    </div>
                  </div>
                </div>

                {result.skorAkhir && (
                  <div className="p-3 rounded-2xl bg-white border border-slate-200/80 text-center shrink-0">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Nilai Rata-rata</div>
                    <div className="text-2xl font-extrabold text-emerald-700">{result.skorAkhir}</div>
                  </div>
                )}
              </div>

              {/* Detail Siswa */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-white/80 border border-slate-200/60 space-y-1">
                  <div className="text-[11px] text-slate-400 font-medium">Nomor Pendaftaran</div>
                  <div className="font-extrabold font-mono text-slate-800">{result.noPendaftaran}</div>
                </div>
                <div className="p-3.5 rounded-xl bg-white/80 border border-slate-200/60 space-y-1">
                  <div className="text-[11px] text-slate-400 font-medium">Nama Lengkap Siswa</div>
                  <div className="font-bold text-slate-800 text-sm">{result.namaLengkap}</div>
                </div>
                <div className="p-3.5 rounded-xl bg-white/80 border border-slate-200/60 space-y-1">
                  <div className="text-[11px] text-slate-400 font-medium">NISN / Asal Sekolah</div>
                  <div className="font-medium text-slate-800">{result.nisn} &bull; {result.asalSekolah}</div>
                </div>
                <div className="p-3.5 rounded-xl bg-white/80 border border-slate-200/60 space-y-1">
                  <div className="text-[11px] text-slate-400 font-medium">Jadwal Daftar Ulang</div>
                  <div className="font-bold text-emerald-800">{result.jadwalDaftarUlang || '-'}</div>
                </div>
              </div>

              {/* Message Box */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200/80 text-xs text-slate-700 leading-relaxed space-y-1">
                <strong className="text-slate-900 block font-bold">Keterangan Panitia:</strong>
                <p>{result.pesanPengumuman}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                {result.status === 'LULUS' && (
                  <button
                    onClick={() => setShowSklModal(true)}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Cetak Surat Keterangan Lulus (SKL)</span>
                  </button>
                )}
                <button
                  onClick={() => handleSearch()}
                  className="px-4 py-3 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition"
                >
                  Segarkan Data
                </button>
              </div>

            </div>
          ) : (
            <div className="p-8 rounded-3xl bg-white border border-slate-200 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <XCircle className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-800 text-base">
                Data Tidak Ditemukan
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Nomor pendaftaran atau NISN yang Anda masukkan belum terdaftar dalam sistem SPMB. Pastikan format sudah benar atau lakukan pendaftaran terlebih dahulu.
              </p>
              <div className="pt-2">
                <button
                  onClick={onGoToRegister}
                  className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition inline-flex items-center gap-1.5"
                >
                  <span>Daftar Calon Siswa Baru</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SKL Printable Modal */}
      {showSklModal && result && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col max-h-[92vh] overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Controls Header (Sticky top - No Print) */}
            <div className="no-print bg-white/95 backdrop-blur-md px-6 py-3.5 border-b border-slate-100 flex items-center justify-between shrink-0 rounded-t-3xl z-10">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-700" />
                <span className="text-xs font-bold text-slate-700">
                  Pratinjau Surat Keterangan Lulus (SKL) Resmi
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintSkl}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak / Simpan PDF</span>
                </button>
                <button
                  onClick={() => setShowSklModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition cursor-pointer"
                  title="Tutup"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Official SKL Document Format (Scrollable Body) */}
            <div className="overflow-y-auto p-6 sm:p-10 space-y-6 text-slate-900 text-xs sm:text-sm print-container">
              {/* Kop Surat */}
              <div className="border-b-4 border-double border-emerald-900 pb-4 text-center space-y-1">
                <div className="text-xs sm:text-sm font-bold tracking-widest text-emerald-800 uppercase">
                  YAYASAN PONDOK DUTA
                </div>
                <div className="text-lg sm:text-xl font-extrabold text-slate-900 uppercase tracking-wide">
                  SMPIT PONDOK DUTA CIMANGGIS DEPOK
                </div>
                <p className="text-[10px] text-slate-500">
                  Terakreditasi "A" Unggul | NSS: 202026601007 | NPSN: 20228391
                </p>
                <p className="text-[10px] text-slate-500">
                  Jl. Duta Raya No. 45, Cimanggis, Kota Depok, Jawa Barat 16451 | Telp: (021) 871-2345
                </p>
              </div>

              {/* Judul Surat */}
              <div className="text-center space-y-1 py-2">
                <div className="font-extrabold text-sm sm:text-base underline uppercase text-slate-900">
                  SURAT KETERANGAN LULUS SELEKSI SPMB
                </div>
                <div className="text-[11px] text-slate-500 font-mono">
                  Nomor: 042/SPMB-SMPIT/PD/I/{new Date().getFullYear()}
                </div>
              </div>

              {/* Isi Surat */}
              <p className="leading-relaxed">
                Ketua Panitia Sistem Penerimaan Murid Baru (SPMB) SMPIT Pondok Duta Cimanggis Depok dengan ini menerangkan bahwa:
              </p>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs font-medium">
                <div className="grid grid-cols-3">
                  <span className="text-slate-500">Nomor Pendaftaran</span>
                  <span className="col-span-2 font-bold font-mono text-slate-900">: {result.noPendaftaran}</span>
                </div>
                <div className="grid grid-cols-3">
                  <span className="text-slate-500">Nama Calon Siswa</span>
                  <span className="col-span-2 font-bold text-slate-900">: {result.namaLengkap}</span>
                </div>
                <div className="grid grid-cols-3">
                  <span className="text-slate-500">NISN</span>
                  <span className="col-span-2 text-slate-900">: {result.nisn}</span>
                </div>
                <div className="grid grid-cols-3">
                  <span className="text-slate-500">Asal SD/MI</span>
                  <span className="col-span-2 text-slate-900">: {result.asalSekolah}</span>
                </div>
                <div className="grid grid-cols-3">
                  <span className="text-slate-500">Jalur Penerimaan</span>
                  <span className="col-span-2 text-slate-900">: {result.jalur}</span>
                </div>
              </div>

              <p className="leading-relaxed">
                Telah mengikuti seluruh rangkaian tahapan observasi baca Al-Qur'an (Tahsin), hafalan (Tahfidz), potensi akademik, serta wawancara orang tua murid, dan dinyatakan:
              </p>

              {/* Status Box */}
              <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-600 text-center">
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-widest block">Keputusan Panitia:</span>
                <span className="text-xl sm:text-2xl font-black text-emerald-900 tracking-wider">
                  DITERIMA SEBAGAI SANTRI / SISWA BARU
                </span>
                <span className="block text-xs text-emerald-700 font-semibold mt-1">
                  SMPIT PONDOK DUTA TAHUN PELAJARAN 2026/2027
                </span>
              </div>

              <p className="leading-relaxed text-[11px] text-slate-600">
                Demikian surat keterangan ini diterbitkan untuk dipergunakan dalam proses daftar ulang. Orang tua/wali calon siswa diharapkan melakukan daftar ulang selambat-lambatnya tanggal <strong>{result.jadwalDaftarUlang || '25 Januari 2026'}</strong>.
              </p>

              {/* Tanda Tangan */}
              <div className="pt-6 grid grid-cols-2 text-center text-xs">
                <div>
                  Mengetahui,<br />
                  <strong>Kepala SMPIT Pondok Duta</strong>
                  <div className="h-16" />
                  <u>(Drs. H. Mulyadi, M.Pd.)</u><br />
                  NIP. 19740510 200212 1 003
                </div>
                <div>
                  Depok, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}<br />
                  <strong>Ketua Panitia SPMB</strong>
                  <div className="h-16" />
                  <u>(Ust. H. Ahmad Dahlan, S.Pd.I)</u><br />
                  NIP. 19850214 201001 1 002
                </div>
              </div>
            </div>

            {/* Modal Footer Controls (Sticky bottom - No Print) */}
            <div className="no-print bg-slate-50/95 backdrop-blur-md px-6 py-3 border-t border-slate-100 flex items-center justify-between shrink-0 rounded-b-3xl text-xs">
              <span className="text-[11px] text-slate-500 hidden sm:inline">
                Gunakan menu Cetak atau simpan sebagai file PDF untuk keperluan daftar ulang.
              </span>
              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={() => setShowSklModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold transition cursor-pointer"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={handlePrintSkl}
                  className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak Dokumen</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
