import React, { useState } from 'react';
import { getAcademicYear } from '../types';
import { 
  FileCheck2, 
  CheckCircle, 
  AlertCircle, 
  ArrowRight, 
  Users, 
  HelpCircle,
  Phone,
  MapPin,
  Mail,
  MessageCircle
} from 'lucide-react';

interface Props {
  onGoToRegister: () => void;
}

export const SyaratPage: React.FC<Props> = ({ onGoToRegister }) => {
  const [checkedItems, setCheckedItems] = useState<{ [key: string]: boolean }>({});
  const tahunPelajaran = getAcademicYear();

  const dokumenList = [
    {
      id: 'uang-pendaftaran',
      title: '1. Membayar Uang Pendaftaran',
      desc: 'Melakukan pembayaran biaya pendaftaran sesuai ketentuan panitia SPMB SIT Pondok Duta.'
    },
    {
      id: 'formulir',
      title: '2. Mengisi Formulir yang Telah Disediakan',
      desc: 'Mengisi formulir pendaftaran (dapat diisi secara online melalui Portal Murid di aplikasi ini maupun offline di ruang pendaftaran).'
    },
    {
      id: 'akta',
      title: '3. Fotokopi Akta Kelahiran Sebanyak 2 Lembar',
      desc: 'Wajib melampirkan 2 lembar fotokopi Akta Kelahiran (Akta Kelahiran asli diperlihatkan saat verifikasi).'
    },
    {
      id: 'kk',
      title: '4. Fotokopi Kartu Keluarga (KK) Sebanyak 2 Lembar',
      desc: 'Wajib melampirkan 2 lembar fotokopi Kartu Keluarga (KK) yang masih berlaku.'
    },
    {
      id: 'skl',
      title: '5. Fotokopi Surat Keterangan Lulus (SKL) Sebanyak 2 Lembar (Legalisir)',
      desc: 'Melampirkan 2 lembar fotokopi SKL dari SD/MI asal yang telah dilegalisir.'
    },
    {
      id: 'nisn',
      title: '6. Fotokopi NISN Sebanyak 1 Lembar (Legalisir)',
      desc: 'Melampirkan 1 lembar bukti Nomor Induk Siswa Nasional (NISN Murid) (NISN) yang telah dilegalisir.'
    },
    {
      id: 'surat-pindah',
      title: '7. Surat Pindah dari Sekolah Asal (Khusus Murid Pindahan)',
      desc: 'Bagi calon murid pindahan, wajib melampirkan surat keterangan pindah resmi dari sekolah asal.'
    },
    {
      id: 'skkb',
      title: '8. Surat Keterangan Kelakuan Baik dari Sekolah Asal (Khusus Murid Pindahan)',
      desc: 'Bagi calon murid pindahan, wajib melampirkan Surat Keterangan Kelakuan Baik dari sekolah asal.'
    },
  ];

  const toggleCheck = (id: string) => {
    setCheckedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const completedCount = Object.values(checkedItems).filter(Boolean).length;

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      
      {/* Header Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-br from-emerald-800 to-teal-900 text-white shadow-xl space-y-3">
        <div className="text-xs font-bold uppercase tracking-widest text-amber-300">
          Informasi Resmi Brosur SPMB {tahunPelajaran}
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
          Syarat Pendaftaran Murid Baru
        </h1>
        <p className="text-xs sm:text-sm text-emerald-100 max-w-2xl leading-relaxed">
          Persyaratan resmi Sistem Penerimaan Murid Baru (SPMB) <strong>SMPIT Pondok Duta</strong> Tahun Ajaran {tahunPelajaran} sesuai ketentuan Yayasan Perguruan Islam Pondok Duta (YPIPD).
        </p>
      </div>

      {/* Ringkasan Syarat Pendaftaran Sesuai Brosur */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Ketentuan Pendaftaran Utama</h3>
          </div>
          <ul className="space-y-2.5 text-xs text-slate-600">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Membayar uang pendaftaran</strong> melalui loket administrasi atau rekening resmi sekolah.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Mengisi formulir pendaftaran</strong> yang telah disediakan (online via Portal Murid atau offline di ruang pendaftaran).</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Mengikuti <strong>Pelaksanaan Tes Kematangan Murid (TKM)</strong> dan <strong>Wawancara Orang Tua Murid</strong>.</span>
            </li>
          </ul>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
              <AlertCircle className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Dokumen yang Wajib Dilampirkan</h3>
          </div>
          <ul className="space-y-2 text-xs text-slate-600">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>Fotokopi <strong>Akta Kelahiran</strong> sebanyak <strong>2 lembar</strong> <em>(akta kelahiran asli diperlihatkan)</em>.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>Fotokopi <strong>Kartu Keluarga (KK)</strong> sebanyak <strong>2 lembar</strong>.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>Fotokopi <strong>Surat Keterangan Lulus (SKL)</strong> sebanyak <strong>2 lembar (legalisir)</strong>.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>Fotokopi <strong>NISN</strong> sebanyak <strong>1 lembar (legalisir)</strong>.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span><strong>Surat pindah</strong> & <strong>Surat Keterangan Kelakuan Baik</strong> dari sekolah asal <em>(khusus siswa pindahan)</em>.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Interactive Checklist Berkas */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-emerald-600" />
              <span>Checklist Kelengkapan Syarat Pendaftaran SMPIT Pondok Duta</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Klik pada item di bawah ini untuk menandai berkas yang sudah Anda siapkan.
            </p>
          </div>
          <div className="text-xs font-semibold text-emerald-800">
            Terpenuhi: <strong>{completedCount}</strong> dari {dokumenList.length} Syarat
          </div>
        </div>

        <div className="space-y-3">
          {dokumenList.map((dok) => {
            const isChecked = !!checkedItems[dok.id];
            return (
              <div
                key={dok.id}
                onClick={() => toggleCheck(dok.id)}
                className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition ${
                  isChecked
                    ? 'bg-emerald-50/60 border-emerald-300 text-slate-800'
                    : 'bg-slate-50/50 border-slate-200 hover:bg-slate-100/60 text-slate-700'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => {}}
                  className="mt-1 h-4 w-4 rounded-sm border-slate-300 text-emerald-600 focus:ring-emerald-500 pointer-events-none"
                />
                <div className="flex-1">
                  <div className={`font-semibold text-xs ${isChecked ? 'text-emerald-950 font-bold line-through opacity-80' : 'text-slate-800'}`}>
                    {dok.title}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {dok.desc}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Informasi Kontak & Ruang Pendaftaran (Responsif & Anti-Overflow di Layar HP) */}
        <div className="w-full rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50/40 border border-amber-200/90 p-4 sm:p-5 text-xs text-amber-950 shadow-xs overflow-hidden">
          <div className="flex items-center gap-2.5 mb-3 border-b border-amber-200/60 pb-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 shadow-2xs">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h4 className="font-extrabold text-amber-950 text-xs sm:text-sm leading-tight">
                Informasi Kontak &amp; Ruang Pendaftaran
              </h4>
              <p className="text-[10px] text-amber-800/80">Layanan resmi panitia SPMB SMPIT Pondok Duta</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {/* WhatsApp CS */}
            <a
              href="https://wa.me/6282225002011?text=Assalamu'alaikum%20Panitia%20SPMB%20SMPIT%20Pondok%20Duta..."
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white border border-amber-200/80 hover:border-emerald-500 hover:bg-emerald-50/30 text-slate-800 transition group shadow-2xs"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition">
                <MessageCircle className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">WhatsApp CS (Resmi)</span>
                <span className="font-mono font-extrabold text-slate-900 text-xs block">0822-2500-2011</span>
              </div>
            </a>

            {/* Telepon Kantor */}
            <a
              href="tel:02129378301"
              className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white border border-amber-200/80 hover:border-amber-400 hover:bg-amber-50/30 text-slate-800 transition shadow-2xs"
            >
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                <Phone className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">Telepon Kantor</span>
                <span className="font-mono font-bold text-slate-900 text-xs block">(021) 29378301</span>
              </div>
            </a>

            {/* Email Resmi */}
            <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white border border-amber-200/80 text-slate-800 sm:col-span-2 shadow-2xs">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                <Mail className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">Email Resmi</span>
                <a 
                  href="mailto:info@smpitpondokduta.sch.id" 
                  className="font-medium text-emerald-800 hover:underline text-xs break-all block"
                >
                  info@smpitpondokduta.sch.id
                </a>
              </div>
            </div>

            {/* Lokasi Ruang Pendaftaran */}
            <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white border border-amber-200/80 text-slate-800 sm:col-span-2 shadow-2xs">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1 text-[11px] leading-relaxed">
                <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">Lokasi Ruang Pendaftaran</span>
                <span className="text-slate-800 block">
                  Jl. Duta Plaza No. 1, Perumahan Pondok Duta 1, Kel. Tugu, Kec. Cimanggis, Kota Depok, Jawa Barat 16451
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* CTA to Registration */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs text-slate-500">
            Sudah menyiapkan berkas persyaratan di atas?
          </span>
          <button
            onClick={onGoToRegister}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
          >
            <span>Daftar Akun & Isi Formulir Sekarang</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
};

