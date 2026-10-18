import React, { useState, useEffect } from 'react';
import { ObservasiSiswaData, getAcademicYear } from '../../types';
import { gasService } from '../../services/gasService';
import QRCode from 'qrcode';
import { Download, X, ShieldCheck, QrCode as QrCodeIcon, CheckCircle2 } from 'lucide-react';

interface Props {
  data: ObservasiSiswaData;
  onClose: () => void;
}

export const HasilObservasiSiswaPrintView: React.FC<Props> = ({ data, onClose }) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const logoUrl = gasService.resolveImageUrl(gasService.getAppSettings().logoUrl) || '/logo-smpit-pondok-duta.png';
  const tahunPelajaran = getAcademicYear();

  useEffect(() => {
    if (data && data.noPendaftaran) {
      const hostOrigin = typeof window !== 'undefined' && window.location ? window.location.origin : '';
      const verifyUrl = `${hostOrigin}/?tab=cek-kelulusan&no=${encodeURIComponent(data.noPendaftaran)}&obs=verified`;

      QRCode.toDataURL(verifyUrl, {
        width: 320,
        margin: 1,
        color: { dark: '#000000', light: '#ffffff' },
        errorCorrectionLevel: 'M'
      })
        .then((url) => setQrCodeUrl(url))
        .catch(() => {});
    }
  }, [data]);

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-2 sm:p-4 md:p-6 animate-in fade-in duration-200"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-4xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 flex flex-col h-[94vh] sm:max-h-[90vh] overflow-hidden my-auto">
        
        {/* Controls Header (Clean, no top print button) */}
        <div className="no-print flex items-center justify-between px-4 sm:px-6 py-3 sm:py-3.5 border-b border-slate-200 bg-white shrink-0 z-10 gap-2">
          <div className="min-w-0 flex-1 pr-1">
            <h3 className="text-xs sm:text-base font-bold text-slate-900 truncate flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 inline-block animate-pulse shrink-0"></span>
              <span>Lembar Observasi Siswa (Tahsin, Tahfidz, Adab, Akademik)</span>
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-500 truncate mt-0.5">
              Khusus Tim Penguji Observasi Calon Murid SMPIT Pondok Duta
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

        {/* Scrollable Preview Canvas */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-8 bg-slate-100/70 custom-scrollbar">

        {/* Printable Official Document */}
        <div className="print-container space-y-5 text-slate-900 text-xs bg-white p-6 sm:p-10 rounded-2xl shadow-md border border-slate-200 max-w-3xl mx-auto">
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
                SMPIT PONDOK DUTA CIMANGGIS DEPOK
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

          <div className="text-center py-1 space-y-0.5 border-b border-slate-200 pb-2">
            <div className="font-extrabold text-sm sm:text-base underline uppercase tracking-wide text-slate-900">
              LEMBAR OBSERVASI CALON MURID BARU (TP {tahunPelajaran})
            </div>
            <div className="text-[11px] text-slate-600 font-mono font-bold">
              Nomor: {(() => {
                const cleanDigits = (data.noPendaftaran || '').replace(/[^0-9]/g, '');
                const padNo = cleanDigits ? cleanDigits.slice(-4).padStart(3, '0') : '001';
                const d = data.tanggalObservasi ? new Date(data.tanggalObservasi) : new Date();
                const validD = isNaN(d.getTime()) ? new Date() : d;
                const romans = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
                const romanMonth = romans[validD.getMonth()] || 'I';
                return `${padNo}/SPMB-SMPIT/OBS-SW/${romanMonth}/${validD.getFullYear()}`;
              })()}
            </div>
          </div>

          {/* Info Siswa */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs">
            <div>
              <span className="text-slate-500 block text-[10px]">Nomor Pendaftaran: </span>
              <strong className="font-mono text-emerald-900">{data.noPendaftaran}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">NISN Calon Murid: </span>
              <strong className="font-mono text-slate-900">{data.nisn || gasService.getSiswaByNo(data.noPendaftaran)?.nisn || '-'}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Tanggal Observasi: </span>
              <strong>{data.tanggalObservasi}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Nama Calon Murid: </span>
              <strong className="text-slate-900">{data.namaSiswa}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Asal SD/MI: </span>
              <strong className="text-slate-900">{data.asalSekolah || gasService.getSiswaByNo(data.noPendaftaran)?.asalSekolah || '-'}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Guru / Penguji Siswa: </span>
              <strong className="text-slate-900">{data.namaPenguji}</strong>
            </div>
            <div className="col-span-2 sm:col-span-3">
              <span className="text-slate-500 block text-[10px]">Batas Maksimal Daftar Ulang: </span>
              <strong className="text-emerald-800">{data.tanggalMaksimalDaftarUlang || '20 - 25 Januari 2027'}</strong>
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
              <tr>
                <td className="border border-slate-300 p-2 text-center">5</td>
                <td className="border border-slate-300 p-2 font-semibold">Psikotes &amp; Potensi Belajar</td>
                <td className="border border-slate-300 p-2 text-center font-bold text-emerald-700">{data.nilaiPsikotes !== undefined ? data.nilaiPsikotes : 85}</td>
                <td className="border border-slate-300 p-2">{data.catatanPsikotes || '-'}</td>
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

          {/* Pengesahan Dokumen Resmi via QR Code (Tanda tangan manual dihapus, digantikan QR Code verifikasi resmi) */}
          <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              {qrCodeUrl ? (
                <div className="p-1 bg-white rounded-xl border border-slate-300 shadow-2xs shrink-0">
                  <img src={qrCodeUrl} alt="QR Code Verifikasi Resmi" className="w-18 h-18 sm:w-20 sm:h-20 object-contain" />
                </div>
              ) : (
                <div className="w-18 h-18 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-center shrink-0">
                  <QrCodeIcon className="w-8 h-8 text-slate-700" />
                </div>
              )}
              <div className="text-left space-y-0.5">
                <span className="text-[11px] font-bold text-slate-900 block">
                  Verifikasi Dokumen Evaluasi
                </span>
                <p className="text-[10px] text-slate-600 leading-snug max-w-[260px]">
                  Pindai QR Code untuk memvalidasi keaslian hasil lembar observasi resmi SPMB SMPIT Pondok Duta.
                </p>
                <div className="text-[9.5px] font-mono text-emerald-800 font-bold">
                  Ref: OBS-PD/{data.noPendaftaran}/{new Date().getFullYear()}
                </div>
              </div>
            </div>

            <div className="text-center sm:text-right shrink-0">
              <div className="text-xs font-bold text-slate-800">
                Depok, {data.tanggalObservasi || new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
              <div className="text-[11px] text-slate-600 font-medium mt-0.5">
                Tim Penguji SPMB SMPIT Pondok Duta
              </div>
            </div>
          </div>

        </div>
        </div>

        {/* Modal Bottom Action Bar (No Print - Single Unduh PDF button) */}
        <div className="no-print px-4 sm:px-6 py-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-1.5 text-[11px] truncate">
            <span className="font-semibold text-slate-700">No. Pendaftaran: {data.noPendaftaran}</span>
            <span>•</span>
            <span className="text-emerald-700 font-bold truncate">Rekomendasi: {data.rekomendasi} ({data.rataRata}/100)</span>
          </div>
          <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
            <button
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition cursor-pointer"
            >
              Tutup
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Unduh PDF</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
