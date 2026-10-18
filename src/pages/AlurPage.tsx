import React from 'react';
import { getAcademicYear } from '../types';
import { 
  UserPlus, 
  CreditCard, 
  Users2, 
  CheckCircle2, 
  ArrowRight,
  MapPin,
  Shirt,
  GraduationCap,
  Phone,
  MessageCircle
} from 'lucide-react';

interface Props {
  onGoToRegister: () => void;
  onGoToCheckResult: () => void;
}

export const AlurPage: React.FC<Props> = ({ onGoToRegister, onGoToCheckResult }) => {
  const tahunPelajaran = getAcademicYear();

  const steps = [
    {
      num: '1',
      icon: UserPlus,
      title: '1. PENDAFTARAN',
      subtitle: 'Pendaftaran dan Pengambilan / Pengembalian Formulir',
      items: [
        '1) Pendaftaran online melalui CS SMPIT (WA: 0822-2500-2011) atau melalui Portal Aplikasi SPMB ini.',
        '2) Pendaftaran offline di ruang pendaftaran SMPIT Pondok Duta.',
        '3) Mengembalikan formulir pendaftaran (atau melengkapi biodata online di Portal Murid).'
      ]
    },
    {
      num: '2',
      icon: Users2,
      title: '2. TES KEMATANGAN MURID (TKM)',
      subtitle: 'Pelaksanaan Tes Kematangan Murid (TKM) & Observasi',
      items: [
        '1. Wawancara Orang Tua Murid (SMP)',
        '2. Observasi Murid & Tes Agama (SMP)',
        '3. Test Potensi Akademik (SMP)'
      ]
    },
    {
      num: '3',
      icon: CheckCircle2,
      title: '3. PENGUMUMAN HASIL TES',
      subtitle: 'Pengumuman Hasil Tes Kematangan Murid (TKM)',
      items: [
        '• Hasil Tes dapat diambil di Ruang Tata Usaha unit SMPIT Pondok Duta.',
        '• Calon murid SMPIT juga dapat mengecek status kelulusan secara online melalui menu Cek Kelulusan.'
      ]
    },
    {
      num: '4',
      icon: CreditCard,
      title: '4. DAFTAR ULANG',
      subtitle: 'Penyelesaian Administrasi Keuangan SPMB',
      items: [
        '• Melakukan pembayaran Administrasi Keuangan sesuai dengan jadwal dan biaya pendaftaran SPMB yang tertera.'
      ]
    },
    {
      num: '5',
      icon: Shirt,
      title: '5. PENGUKURAN SERAGAM',
      subtitle: 'Konfirmasi & Jadwal Seragam Sekolah',
      items: [
        '• Menunggu konfirmasi dan jadwal pengukuran seragam dari sekolah.'
      ]
    },
    {
      num: '6',
      icon: GraduationCap,
      title: 'MASA PENGENALAN LINGKUNGAN SEKOLAH (MPLS)',
      subtitle: 'Tahap Akhir Penyambutan Murid Baru SMPIT Pondok Duta',
      items: [
        '• Mengikuti kegiatan Masa Pengenalan Lingkungan Sekolah (MPLS) Tahun Ajaran ' + tahunPelajaran + ' di kampus SMPIT Pondok Duta.'
      ]
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      
      {/* Header Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-br from-teal-900 via-emerald-800 to-emerald-950 text-white shadow-xl space-y-3">
        <div className="text-xs font-bold uppercase tracking-widest text-amber-300">
          YAYASAN PERGURUAN ISLAM PONDOK DUTA (YPIPD)
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
          Alur Pendaftaran Murid Baru
        </h1>
        <p className="text-xs sm:text-sm text-emerald-100 max-w-2xl leading-relaxed">
          Alur resmi Sistem Penerimaan Murid Baru (SPMB) Tahun Ajaran {tahunPelajaran}.
        </p>
      </div>

      {/* Step by Step Timeline Cards */}
      <div className="space-y-5">
        {steps.map((st, idx) => {
          const Icon = st.icon;
          return (
            <div
              key={st.num}
              className="relative p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col md:flex-row md:items-start gap-5"
            >
              {/* Number Badge & Icon */}
              <div className="flex items-center gap-3.5 shrink-0">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-700 to-emerald-600 text-white flex items-center justify-center font-extrabold text-lg shadow-sm">
                  {st.num}
                </div>
                <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700">
                  <Icon className="w-5 h-5" />
                </div>
              </div>

              {/* Text Info */}
              <div className="flex-1 space-y-2">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    {st.title}
                  </h3>
                  <p className="text-xs font-semibold text-emerald-700">
                    {st.subtitle}
                  </p>
                </div>
                <ul className="space-y-1 text-xs text-slate-600 leading-relaxed">
                  {st.items.map((line, i) => (
                    <li key={i} className="whitespace-pre-line">
                      {line}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action shortcut on specific steps */}
              {idx === 0 && (
                <button
                  onClick={onGoToRegister}
                  className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shrink-0 self-start transition cursor-pointer"
                >
                  Daftar Online &rarr;
                </button>
              )}
              {idx === 2 && (
                <button
                  onClick={onGoToCheckResult}
                  className="px-4 py-2.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 font-bold text-xs shrink-0 self-start transition cursor-pointer"
                >
                  Cek Kelulusan &rarr;
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Kontak CS Resmi SMPIT & Lokasi Kampus */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-amber-300 text-xs font-bold uppercase tracking-wider">
              <MessageCircle className="w-4 h-4" />
              <span>Layanan Informasi & Pendaftaran Online (WA Only)</span>
            </div>
            <h3 className="font-extrabold text-lg sm:text-xl text-white">
              Customer Service (CS) SPMB SMPIT Pondok Duta
            </h3>
          </div>

          <a
            href="https://wa.me/6282225002011"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-3 rounded-2xl bg-emerald-950/90 hover:bg-emerald-900/80 border border-emerald-600/60 transition inline-flex items-center gap-3 self-start sm:self-auto"
          >
            <div>
              <div className="text-[10px] font-bold text-amber-300 uppercase">CS SMPIT Pondok Duta</div>
              <div className="text-base font-extrabold text-white font-mono">0822-2500-2011</div>
            </div>
          </a>
        </div>

        <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-slate-300">
          <div className="space-y-1">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span><strong>Alamat:</strong> Jl. Duta Plaza No.1, Perumahan Pondok Duta 1, Tugu, Cimanggis, Depok</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
              <span><strong>Telepon:</strong> (021) 29378301 · <strong>Email:</strong> info@smpitpondokduta.sch.id · <strong>Sosmed:</strong> @sekolahislampondokduta</span>
            </div>
          </div>

          <button
            onClick={onGoToRegister}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition shrink-0 cursor-pointer"
          >
            <span>Mulai Pendaftaran Online</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
};
