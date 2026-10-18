import React from 'react';
import { DataIndukSiswa, getAcademicYear } from '../../types';
import { gasService } from '../../services/gasService';
import { Download, X, Award, CheckCircle2, ShieldCheck, User } from 'lucide-react';

interface Props {
  data: DataIndukSiswa;
  onClose: () => void;
}

export const BukuIndukPrintView: React.FC<Props> = ({ data, onClose }) => {
  const logoUrl = gasService.resolveImageUrl(gasService.getAppSettings().logoUrl) || '/logo-smpit-pondok-duta.png';
  const tahunPelajaran = getAcademicYear();
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
        <div className="no-print flex items-center justify-between px-4 sm:px-6 py-3 sm:py-3.5 border-b border-slate-200 bg-slate-50 shrink-0 z-10 gap-2">
          <div className="min-w-0 flex-1 pr-1">
            <h3 className="text-xs sm:text-base font-bold text-slate-900 truncate flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block animate-pulse shrink-0"></span>
              <span>Lembar Cetak Buku Induk Siswa (Standar Resmi)</span>
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-500 truncate mt-0.5">
              Dokumen resmi arsip data pokok peserta didik SMPIT Pondok Duta
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

        {/* Scrollable Document Body */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-8 bg-slate-100/70 custom-scrollbar">
          <div className="print-container max-w-3xl mx-auto bg-white p-8 sm:p-12 shadow-md border border-slate-200 rounded-xl font-serif text-slate-900 text-xs sm:text-sm leading-relaxed">
            
            {/* KOP RESMI SEKOLAH */}
            <div className="border-b-2 border-slate-900 pb-4 mb-6 flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-4 text-center sm:text-left">
              <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 p-1 bg-white border border-emerald-200 rounded-2xl flex items-center justify-center shadow-2xs">
                <img
                  src={logoUrl}
                  alt="Logo Resmi SMPIT Pondok Duta"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="min-w-0 flex-1 space-y-0.5">
                <div className="text-[10px] sm:text-xs uppercase font-sans tracking-widest text-slate-600 font-semibold">
                  YAYASAN PERGURUAN ISLAM PONDOK DUTA
                </div>
                <h1 className="text-xl sm:text-2xl font-black font-sans tracking-wide text-slate-900 mt-0.5">
                  SMPIT PONDOK DUTA CIMANGGIS DEPOK
                </h1>
                <p className="text-[10px] sm:text-xs text-slate-600 font-sans mt-0.5">
                  Perumahan Pondok Duta, Jl. Duta Plaza No. 1, Kel. Tugu, Kec. Cimanggis, Kota Depok 16451 | NPSN: 20276180 | Telp: (021) 29378301
                </p>
                <div className="mt-2 inline-block px-3 py-0.5 rounded bg-slate-900 text-white font-sans text-[11px] font-bold uppercase tracking-wider">
                  LEMBAR DATA BUKU INDUK MURID (TP {tahunPelajaran})
                </div>
              </div>
            </div>

            {/* IDENTITAS POKOK BUKU INDUK */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-lg border border-slate-300 font-sans text-xs mb-6">
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

            {/* SECTION A: KETERANGAN TENTANG DIRI SISWA */}
            <div className="mb-6">
              <h3 className="font-sans font-bold text-xs uppercase bg-slate-800 text-white px-3 py-1 mb-2 tracking-wide">
                A. KETERANGAN TENTANG DIRI PESERTA DIDIK
              </h3>
              <table className="w-full text-xs border-collapse">
                <tbody>
                  <tr className="border-b border-slate-200">
                    <td className="w-6 py-1 text-slate-500">1.</td>
                    <td className="w-48 py-1 font-semibold text-slate-700">Nama Lengkap</td>
                    <td className="py-1 font-bold text-slate-900">: {data.namaLengkap}</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="py-1 text-slate-500">2.</td>
                    <td className="py-1 font-semibold text-slate-700">Nama Panggilan</td>
                    <td className="py-1">: {data.namaPanggilan}</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="py-1 text-slate-500">3.</td>
                    <td className="py-1 font-semibold text-slate-700">Jenis Kelamin</td>
                    <td className="py-1">: {data.jenisKelamin}</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="py-1 text-slate-500">4.</td>
                    <td className="py-1 font-semibold text-slate-700">Tempat, Tanggal Lahir</td>
                    <td className="py-1">: {data.tempatLahir}, {data.tanggalLahir}</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="py-1 text-slate-500">5.</td>
                    <td className="py-1 font-semibold text-slate-700">Agama</td>
                    <td className="py-1">: {data.agama}</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="py-1 text-slate-500">6.</td>
                    <td className="py-1 font-semibold text-slate-700">Kewarganegaraan</td>
                    <td className="py-1">: {data.kewarganegaraan}</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="py-1 text-slate-500">7.</td>
                    <td className="py-1 font-semibold text-slate-700">Anak Ke- / Saudara</td>
                    <td className="py-1">: Anak ke-{data.anakNomorKe} dari (Kandung: {data.jumlahSaudaraKandung}, Tiri: {data.jumlahSaudaraTiri}, Angkat: {data.jumlahSaudaraAngkat}) bersaudara</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="py-1 text-slate-500">8.</td>
                    <td className="py-1 font-semibold text-slate-700">Bahasa Sehari-hari</td>
                    <td className="py-1">: {data.bahasaSehariHari}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* SECTION B: TEMPAT TINGGAL */}
            <div className="mb-6">
              <h3 className="font-sans font-bold text-xs uppercase bg-slate-800 text-white px-3 py-1 mb-2 tracking-wide">
                B. KETERANGAN TEMPAT TINGGAL
              </h3>
              <table className="w-full text-xs border-collapse">
                <tbody>
                  <tr className="border-b border-slate-200">
                    <td className="w-6 py-1 text-slate-500">9.</td>
                    <td className="w-48 py-1 font-semibold text-slate-700">Alamat Tempat Tinggal</td>
                    <td className="py-1">: {data.alamat}</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="py-1 text-slate-500">10.</td>
                    <td className="py-1 font-semibold text-slate-700">Kelurahan / Kecamatan</td>
                    <td className="py-1">: Kel. {data.kelurahan}, Kec. {data.kecamatan}</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="py-1 text-slate-500">11.</td>
                    <td className="py-1 font-semibold text-slate-700">Kota / Kabupaten</td>
                    <td className="py-1">: {data.kotaKabupaten}</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="py-1 text-slate-500">12.</td>
                    <td className="py-1 font-semibold text-slate-700">Telepon / Handphone</td>
                    <td className="py-1 font-mono">: {data.nomorHandphone || data.nomorTelepon || '-'}</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="py-1 text-slate-500">13.</td>
                    <td className="py-1 font-semibold text-slate-700">Tinggal Pada / Jarak / Sarana</td>
                    <td className="py-1">: {data.bertempatTinggalPada} | Jarak: {data.jarakKeSekolahKm} km | Transportasi: {data.saranaBerangkatSekolah}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* SECTION C: KESEHATAN */}
            <div className="mb-6">
              <h3 className="font-sans font-bold text-xs uppercase bg-slate-800 text-white px-3 py-1 mb-2 tracking-wide">
                C. KETERANGAN KESEHATAN JASMANI
              </h3>
              <table className="w-full text-xs border-collapse">
                <tbody>
                  <tr className="border-b border-slate-200">
                    <td className="w-6 py-1 text-slate-500">14.</td>
                    <td className="w-48 py-1 font-semibold text-slate-700">Berat &amp; Tinggi Badan</td>
                    <td className="py-1">: Berat: {data.beratBadanKg} kg | Tinggi: {data.tinggiBadanCm} cm | Gol. Darah: {data.golonganDarah}</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="py-1 text-slate-500">15.</td>
                    <td className="py-1 font-semibold text-slate-700">Penyakit Berat / Kelainan</td>
                    <td className="py-1">: {data.penyakitBerat || '-'} | Kelainan jasmani: {data.kelainanJasmani || '-'}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* SECTION D: PENDIDIKAN SEBELUMNYA */}
            <div className="mb-6">
              <h3 className="font-sans font-bold text-xs uppercase bg-slate-800 text-white px-3 py-1 mb-2 tracking-wide">
                D. PENDIDIKAN SEBELUMNYA &amp; MINAT PRESTASI
              </h3>
              <table className="w-full text-xs border-collapse">
                <tbody>
                  <tr className="border-b border-slate-200">
                    <td className="w-6 py-1 text-slate-500">16.</td>
                    <td className="w-48 py-1 font-semibold text-slate-700">Diterima Sebagai</td>
                    <td className="py-1 font-semibold">: {data.masukSebagai} (Tahun Pelajaran {data.tahunPelajaran})</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="py-1 text-slate-500">17.</td>
                    <td className="py-1 font-semibold text-slate-700">Sekolah Asal (SD / MI)</td>
                    <td className="py-1 font-bold">: {data.asalSekolah}</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="py-1 text-slate-500">18.</td>
                    <td className="py-1 font-semibold text-slate-700">Nomor Ijazah SD</td>
                    <td className="py-1 font-mono">: {data.nomorIjazah || '-'}</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="py-1 text-slate-500">19.</td>
                    <td className="py-1 font-semibold text-slate-700">Kegemaran (Kesenian/Olahraga)</td>
                    <td className="py-1">: {data.kegemaranKesenian} / {data.kegemaranOlahraga} / Organisasi: {data.kegemaranOrganisasi}</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="py-1 text-slate-500">20.</td>
                    <td className="py-1 font-semibold text-slate-700">Prestasi / Kejuaraan</td>
                    <td className="py-1">: {data.memenangkanKejuaraan || '-'} | Beasiswa: {data.menerimaBeasiswa || '-'}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* SECTION E: KETERANGAN ORANG TUA / WALI */}
            <div className="mb-6">
              <h3 className="font-sans font-bold text-xs uppercase bg-slate-800 text-white px-3 py-1 mb-2 tracking-wide">
                E. KETERANGAN ORANG TUA KANDUNG &amp; WALI
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Data Ayah */}
                <div className="border border-slate-300 p-2.5 rounded bg-slate-50/50">
                  <div className="font-sans font-bold text-xs text-slate-800 border-b pb-1 mb-1">
                    1. DATA AYAH KANDUNG
                  </div>
                  <div className="space-y-0.5 text-[11px]">
                    <div><span className="text-slate-500">Nama:</span> <strong className="text-slate-900">{data.namaAyah}</strong></div>
                    <div><span className="text-slate-500">TTL:</span> {data.tempatTanggalLahirAyah || '-'}</div>
                    <div><span className="text-slate-500">Pendidikan:</span> {data.pendidikanAyah || '-'}</div>
                    <div><span className="text-slate-500">Pekerjaan:</span> {data.pekerjaanAyah || '-'}</div>
                    <div><span className="text-slate-500">Penghasilan:</span> {data.penghasilanAyah || '-'}</div>
                    <div><span className="text-slate-500">No HP:</span> <span className="font-mono">{data.noHpAyah || '-'}</span></div>
                  </div>
                </div>

                {/* Data Ibu */}
                <div className="border border-slate-300 p-2.5 rounded bg-slate-50/50">
                  <div className="font-sans font-bold text-xs text-slate-800 border-b pb-1 mb-1">
                    2. DATA IBU KANDUNG
                  </div>
                  <div className="space-y-0.5 text-[11px]">
                    <div><span className="text-slate-500">Nama:</span> <strong className="text-slate-900">{data.namaIbu}</strong></div>
                    <div><span className="text-slate-500">TTL:</span> {data.tempatTanggalLahirIbu || '-'}</div>
                    <div><span className="text-slate-500">Pendidikan:</span> {data.pendidikanIbu || '-'}</div>
                    <div><span className="text-slate-500">Pekerjaan:</span> {data.pekerjaanIbu || '-'}</div>
                    <div><span className="text-slate-500">Penghasilan:</span> {data.penghasilanIbu || '-'}</div>
                    <div><span className="text-slate-500">No HP:</span> <span className="font-mono">{data.noHpIbu || '-'}</span></div>
                  </div>
                </div>
              </div>

              {/* Data Wali jika ada */}
              {data.namaWali && data.namaWali !== '-' && (
                <div className="border border-slate-300 p-2.5 rounded bg-slate-50/50 mt-2 text-[11px]">
                  <span className="font-bold text-slate-800 font-sans">3. DATA WALI: </span>
                  <span>{data.namaWali} (Hubungan: {data.statusHubunganWali || '-'}) | Pekerjaan: {data.pekerjaanWali || '-'} | No HP: {data.noHpWali || '-'}</span>
                </div>
              )}
            </div>

            {/* PENGESAHAN KEPALA SEKOLAH & TEMPAT PAS FOTO */}
            <div className="pt-4 border-t-2 border-slate-900 flex items-end justify-between font-sans text-xs">
              <div className="w-24 h-32 border-2 border-dashed border-slate-400 rounded flex flex-col items-center justify-center text-slate-400 text-[10px] text-center p-1">
                <User className="w-6 h-6 mb-1 opacity-50" />
                <span>Pas Foto<br/>3 x 4 cm</span>
              </div>

              <div className="text-center space-y-1">
                <div>Depok, {data.tanggalDiterima || new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                <div className="text-slate-600 font-semibold">Kepala Sekolah SMPIT Pondok Duta,</div>
                <div className="h-16"></div>
                <div className="font-bold underline text-slate-900">M. FAUZI, M.Pd.I</div>
                <div className="text-[10px] text-slate-500 font-mono">NIP / NPY: 19820514 200801 1 003</div>
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
