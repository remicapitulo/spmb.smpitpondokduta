import React, { useState } from 'react';
import { DataSiswa } from '../../types';
import { 
  DATA_WILAYAH_RUJUKAN, 
  DAFTAR_SEKOLAH_ASAL 
} from '../../services/wilayahData';
import { 
  User, 
  Heart, 
  School, 
  Sparkles, 
  Users, 
  Shield, 
  Save, 
  CheckCircle2, 
  FileText,
  MapPin,
  Phone,
  Mail,
  Award,
  Activity,
  Layers,
  Edit3,
  ListFilter
} from 'lucide-react';

interface Props {
  formData: Partial<DataSiswa>;
  onChange: (updated: Partial<DataSiswa>) => void;
  onSave: (e: React.FormEvent) => void;
  saving: boolean;
}

export const FormBiodataSiswaLengkap: React.FC<Props> = ({
  formData,
  onChange,
  onSave,
  saving
}) => {
  const [activeSection, setActiveSection] = useState<string>('all');
  
  // Deteksi mode manual atau rujukan
  const initialIsWilayahPreset = DATA_WILAYAH_RUJUKAN.some(
    (k) => k.nama.toLowerCase() === (formData.kotaKabupaten || '').toLowerCase()
  );
  const [isManualWilayah, setIsManualWilayah] = useState(!initialIsWilayahPreset && Boolean(formData.kotaKabupaten));

  const initialIsSekolahPreset = DAFTAR_SEKOLAH_ASAL.includes(formData.asalSekolah || '');
  const [isManualSekolah, setIsManualSekolah] = useState(!initialIsSekolahPreset && Boolean(formData.asalSekolah));

  const updateField = (field: keyof DataSiswa, value: any) => {
    onChange({
      ...formData,
      [field]: value
    });
  };

  return (
    <form onSubmit={onSave} className="space-y-6">
      
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-950 text-white shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-200 text-xs font-semibold mb-2 border border-white/15">
              <FileText className="w-3.5 h-3.5" />
              <span>Standar Form Isian Data Siswa Resmi SMPIT Pondok Duta</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black">
              Data Calon Siswa
            </h2>
            <p className="text-xs text-emerald-100/90 mt-1 max-w-2xl leading-relaxed">
              Memuat seluruh data pokok siswa, riwayat kesehatan, asal sekolah, minat prestasi, serta biodata orang tua & wali sesuai berkas pendaftaran fisik.
            </p>
          </div>

          <div className="flex flex-col items-end gap-2 shrink-0">
            <span className="font-mono text-xs font-bold bg-white/15 px-3 py-1.5 rounded-xl border border-white/20">
              No. Reg: {formData.noPendaftaran || 'PD-2026-001'}
            </span>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs flex items-center gap-2 shadow-lg transition disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Menyimpan...' : 'Simpan Data Calon Siswa'}</span>
            </button>
          </div>
        </div>

        {/* Section Quick Jump Filter */}
        <div className="mt-6 pt-4 border-t border-white/15 flex flex-wrap gap-1.5 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveSection('all')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              activeSection === 'all'
                ? 'bg-white text-emerald-900 font-bold shadow-xs'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            Semua Bagian
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('sec1')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeSection === 'sec1'
                ? 'bg-white text-emerald-900 font-bold shadow-xs'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            1. Personal (1-23)
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('sec2')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeSection === 'sec2'
                ? 'bg-white text-emerald-900 font-bold shadow-xs'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            2. Kesehatan (24-28)
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('sec3')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeSection === 'sec3'
                ? 'bg-white text-emerald-900 font-bold shadow-xs'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            3. Asal Sekolah (29-31)
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('sec4')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeSection === 'sec4'
                ? 'bg-white text-emerald-900 font-bold shadow-xs'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            4. Minat & Prestasi (32-36)
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('sec5')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeSection === 'sec5'
                ? 'bg-white text-emerald-900 font-bold shadow-xs'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            5. Data Ayah (37-47)
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('sec6')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeSection === 'sec6'
                ? 'bg-white text-emerald-900 font-bold shadow-xs'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            6. Data Ibu (48-58)
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('sec7')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeSection === 'sec7'
                ? 'bg-white text-emerald-900 font-bold shadow-xs'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            7. Data Wali (59-67)
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* SEKSI 1: DATA PERSONAL SISWA (Nomor 1 - 23) */}
      {/* ============================================================== */}
      {(activeSection === 'all' || activeSection === 'sec1') && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-5 text-xs">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800">
              <User className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest block">
                Bagian 1 (Nomor 1 s/d 23)
              </span>
              <h3 className="text-base font-bold text-slate-900">
                Data Personal Calon Siswa
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* 1. Nama Lengkap */}
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                1. Nama Lengkap Siswa *
              </label>
              <input
                type="text"
                required
                value={formData.namaLengkap || ''}
                onChange={(e) => updateField('namaLengkap', e.target.value)}
                placeholder="Sesuai akte lahir / KK"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 font-medium"
              />
            </div>

            {/* 2. Nama Panggilan */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                2. Nama Panggilan Siswa *
              </label>
              <input
                type="text"
                required
                value={formData.namaPanggilan || ''}
                onChange={(e) => updateField('namaPanggilan', e.target.value)}
                placeholder="Nama panggilan sehari-hari"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 font-medium"
              />
            </div>

            {/* 3. NISN */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                3. Nomor Induk Siswa Nasional (NISN) *
              </label>
              <input
                type="text"
                required
                value={formData.nisn || ''}
                onChange={(e) => updateField('nisn', e.target.value)}
                placeholder="10 digit nomor NISN"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono"
              />
            </div>

            {/* 4. NIK / No. KK */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                4. Nomor Induk Kependudukan (NIK / KK) *
              </label>
              <input
                type="text"
                required
                value={formData.nik || ''}
                onChange={(e) => updateField('nik', e.target.value)}
                placeholder="16 digit NIK calon siswa"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono"
              />
            </div>

            {/* 5. Jenis Kelamin */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                5. Jenis Kelamin *
              </label>
              <select
                value={formData.jenisKelamin || 'Laki-laki'}
                onChange={(e) => updateField('jenisKelamin', e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white"
              >
                <option value="Laki-laki">Laki-laki</option>
                <option value="Perempuan">Perempuan</option>
              </select>
            </div>

            {/* 6. Tempat Lahir */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                6. Tempat Lahir *
              </label>
              <input
                type="text"
                required
                value={formData.tempatLahir || ''}
                onChange={(e) => updateField('tempatLahir', e.target.value)}
                placeholder="Kota kelahiran"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300"
              />
            </div>

            {/* 7. Tanggal Lahir */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                7. Tanggal Lahir *
              </label>
              <input
                type="date"
                required
                value={formData.tanggalLahir || ''}
                onChange={(e) => updateField('tanggalLahir', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300"
              />
            </div>

            {/* 8. Agama */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                8. Agama *
              </label>
              <select
                value={formData.agama || 'Islam'}
                onChange={(e) => updateField('agama', e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white"
              >
                <option value="Islam">Islam</option>
                <option value="Katolik">Katolik</option>
                <option value="Protestan">Protestan</option>
                <option value="Hindu">Hindu</option>
                <option value="Budha">Budha</option>
                <option value="Konghucu">Konghucu</option>
                <option value="Kepercayaan">Kepercayaan</option>
              </select>
            </div>

            {/* 9. Kewarganegaraan */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                9. Kewarganegaraan *
              </label>
              <select
                value={formData.kewarganegaraan || 'Indonesia'}
                onChange={(e) => updateField('kewarganegaraan', e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white"
              >
                <option value="Indonesia">Indonesia</option>
                <option value="Asing">Asing</option>
              </select>
            </div>

            {/* 10. Anak nomor ke */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                10. Anak nomor ke *
              </label>
              <input
                type="number"
                min={1}
                required
                value={formData.anakNomorKe ?? 1}
                onChange={(e) => updateField('anakNomorKe', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300"
              />
            </div>

            {/* 11. Jumlah Saudara Kandung */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                11. Jumlah Saudara Kandung *
              </label>
              <input
                type="number"
                min={0}
                required
                value={formData.jumlahSaudaraKandung ?? 0}
                onChange={(e) => updateField('jumlahSaudaraKandung', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300"
              />
            </div>

            {/* 12. Jumlah Saudara Tiri */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                12. Jumlah Saudara Tiri *
              </label>
              <input
                type="number"
                min={0}
                required
                value={formData.jumlahSaudaraTiri ?? 0}
                onChange={(e) => updateField('jumlahSaudaraTiri', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300"
              />
            </div>

            {/* 13. Jumlah Saudara Angkat */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                13. Jumlah Saudara Angkat *
              </label>
              <input
                type="number"
                min={0}
                required
                value={formData.jumlahSaudaraAngkat ?? 0}
                onChange={(e) => updateField('jumlahSaudaraAngkat', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300"
              />
            </div>

            {/* 14. Bahasa Sehari-hari */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                14. Bahasa Sehari-hari *
              </label>
              <input
                type="text"
                required
                value={formData.bahasaSehariHari || 'Bahasa Indonesia'}
                onChange={(e) => updateField('bahasaSehariHari', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300"
              />
            </div>

            {/* 15. Alamat Tempat Tinggal */}
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                15. Alamat Lengkap Tempat Tinggal *
              </label>
              <input
                type="text"
                required
                value={formData.alamat || ''}
                onChange={(e) => updateField('alamat', e.target.value)}
                placeholder="Nama Jalan, No. Rumah, RT/RW"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300"
              />
            </div>

            {/* WILAYAH ADMINISTRATIF: 18. Kota, 17. Kecamatan, 16. Kelurahan */}
            <div className="sm:col-span-2 lg:col-span-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-700" />
                  <span className="font-bold text-slate-800">
                    Wilayah Administrasi Tempat Tinggal (Nomor 18, 17, 16)
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                    Rujukan Pemerintah: Depok, Jakarta & Bogor
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsManualWilayah(!isManualWilayah)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-bold bg-white text-slate-700 hover:bg-slate-100 border border-slate-300 shadow-2xs transition self-start sm:self-auto"
                >
                  <Edit3 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{isManualWilayah ? 'Gunakan Pilihan Rujukan (Depok/Jakarta/Bogor)' : 'Mode Input Manual Bebas'}</span>
                </button>
              </div>

              {!isManualWilayah ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* 18. Kota / Kabupaten */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      18. Kota / Kabupaten *
                    </label>
                    <select
                      value={
                        DATA_WILAYAH_RUJUKAN.some(k => k.nama.toLowerCase() === (formData.kotaKabupaten || '').toLowerCase())
                          ? formData.kotaKabupaten
                          : 'Lainnya'
                      }
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === 'Lainnya') {
                          setIsManualWilayah(true);
                        } else {
                          const targetKota = DATA_WILAYAH_RUJUKAN.find(k => k.nama === val);
                          const firstKec = targetKota?.kecamatan[0]?.nama || '';
                          const firstKel = targetKota?.kecamatan[0]?.kelurahan[0] || '';
                          onChange({
                            ...formData,
                            kotaKabupaten: val,
                            kecamatan: firstKec,
                            kelurahan: firstKel
                          });
                        }
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-emerald-500"
                    >
                      {DATA_WILAYAH_RUJUKAN.map((k) => (
                        <option key={k.nama} value={k.nama}>
                          {k.nama}
                        </option>
                      ))}
                      <option value="Lainnya">-- Kota Lainnya (Input Manual) --</option>
                    </select>
                  </div>

                  {/* 17. Kecamatan */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      17. Kecamatan *
                    </label>
                    {DATA_WILAYAH_RUJUKAN.find(k => k.nama.toLowerCase() === (formData.kotaKabupaten || '').toLowerCase()) ? (
                      <select
                        value={formData.kecamatan || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === '__MANUAL__') {
                            setIsManualWilayah(true);
                          } else {
                            const curKota = DATA_WILAYAH_RUJUKAN.find(k => k.nama.toLowerCase() === (formData.kotaKabupaten || '').toLowerCase());
                            const curKec = curKota?.kecamatan.find(kc => kc.nama === val);
                            const firstKel = curKec?.kelurahan[0] || '';
                            onChange({
                              ...formData,
                              kecamatan: val,
                              kelurahan: firstKel
                            });
                          }
                        }}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-emerald-500"
                      >
                        {DATA_WILAYAH_RUJUKAN.find(k => k.nama.toLowerCase() === (formData.kotaKabupaten || '').toLowerCase())?.kecamatan.map((kec) => (
                          <option key={kec.nama} value={kec.nama}>
                            Kec. {kec.nama}
                          </option>
                        ))}
                        <option value="__MANUAL__">-- Kecamatan Lainnya (Ketik Manual) --</option>
                      </select>
                    ) : (
                      <input
                        type="text"
                        required
                        value={formData.kecamatan || ''}
                        onChange={(e) => updateField('kecamatan', e.target.value)}
                        placeholder="Nama Kecamatan"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white"
                      />
                    )}
                  </div>

                  {/* 16. Kelurahan */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      16. Kelurahan / Desa *
                    </label>
                    {DATA_WILAYAH_RUJUKAN.find(k => k.nama.toLowerCase() === (formData.kotaKabupaten || '').toLowerCase())
                      ?.kecamatan.find(kc => kc.nama.toLowerCase() === (formData.kecamatan || '').toLowerCase()) ? (
                      <select
                        value={formData.kelurahan || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === '__MANUAL__') {
                            setIsManualWilayah(true);
                          } else {
                            updateField('kelurahan', val);
                          }
                        }}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-emerald-500"
                      >
                        {DATA_WILAYAH_RUJUKAN.find(k => k.nama.toLowerCase() === (formData.kotaKabupaten || '').toLowerCase())
                          ?.kecamatan.find(kc => kc.nama.toLowerCase() === (formData.kecamatan || '').toLowerCase())
                          ?.kelurahan.map((kel) => (
                            <option key={kel} value={kel}>
                              Kel. {kel}
                            </option>
                          ))}
                        <option value="__MANUAL__">-- Kelurahan Lainnya (Ketik Manual) --</option>
                      </select>
                    ) : (
                      <input
                        type="text"
                        required
                        value={formData.kelurahan || ''}
                        onChange={(e) => updateField('kelurahan', e.target.value)}
                        placeholder="Nama Kelurahan"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white"
                      />
                    )}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      18. Kota / Kabupaten (Input Manual) *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.kotaKabupaten || ''}
                      onChange={(e) => updateField('kotaKabupaten', e.target.value)}
                      placeholder="Contoh: Kota Depok / Bekasi / Bandung"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      17. Kecamatan (Input Manual) *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.kecamatan || ''}
                      onChange={(e) => updateField('kecamatan', e.target.value)}
                      placeholder="Contoh: Cimanggis"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      16. Kelurahan / Desa (Input Manual) *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.kelurahan || ''}
                      onChange={(e) => updateField('kelurahan', e.target.value)}
                      placeholder="Contoh: Tugu"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 19. Nomor Telepon Rumah */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                19. Nomor Telepon Rumah * (isi "-" jika tidak ada)
              </label>
              <input
                type="text"
                value={formData.nomorTelepon || '-'}
                onChange={(e) => updateField('nomorTelepon', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono"
              />
            </div>

            {/* 20. Nomor Handphone / WA Siswa */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                20. Nomor Handphone Siswa / Orang Tua *
              </label>
              <input
                type="text"
                required
                value={formData.nomorHandphone || ''}
                onChange={(e) => updateField('nomorHandphone', e.target.value)}
                placeholder="08xxxxxxxxxx"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono"
              />
            </div>

            {/* 21. Bertempat Tinggal Pada */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                21. Bertempat Tinggal Pada *
              </label>
              <select
                value={formData.bertempatTinggalPada || 'Orang Tua'}
                onChange={(e) => updateField('bertempatTinggalPada', e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white"
              >
                <option value="Orang Tua">Orang Tua</option>
                <option value="Wali">Wali</option>
              </select>
            </div>

            {/* 22. Jarak ke Sekolah (km) */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                22. Jarak Tempat Tinggal ke Sekolah (km) *
              </label>
              <input
                type="text"
                required
                value={formData.jarakKeSekolahKm || '2'}
                onChange={(e) => updateField('jarakKeSekolahKm', e.target.value)}
                placeholder="Contoh: 1.5 atau 3"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300"
              />
            </div>

            {/* 23. Sarana Berangkat Sekolah */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                23. Sarana Berangkat ke Sekolah *
              </label>
              <select
                value={formData.saranaBerangkatSekolah || 'Motor'}
                onChange={(e) => updateField('saranaBerangkatSekolah', e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white"
              >
                <option value="Jalan kaki">Jalan kaki</option>
                <option value="Sepeda">Sepeda</option>
                <option value="Motor">Motor</option>
                <option value="Mobil">Mobil</option>
                <option value="Jemputan">Jemputan</option>
                <option value="Yang lain">Yang lain</option>
              </select>
            </div>

          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SEKSI 2: DATA KESEHATAN SISWA (Nomor 24 - 28) */}
      {/* ============================================================== */}
      {(activeSection === 'all' || activeSection === 'sec2') && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-5 text-xs">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="p-2.5 rounded-xl bg-rose-100 text-rose-800">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-rose-700 uppercase tracking-widest block">
                Bagian 2 (Nomor 24 s/d 28)
              </span>
              <h3 className="text-base font-bold text-slate-900">
                Data Kesehatan & Fisik Siswa
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* 24. Berat Badan */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                24. Berat Badan (kg) *
              </label>
              <input
                type="number"
                required
                value={formData.beratBadanKg ?? ''}
                onChange={(e) => updateField('beratBadanKg', e.target.value)}
                placeholder="Contoh: 40"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300"
              />
            </div>

            {/* 25. Tinggi Badan */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                25. Tinggi Badan (cm) *
              </label>
              <input
                type="number"
                required
                value={formData.tinggiBadanCm ?? ''}
                onChange={(e) => updateField('tinggiBadanCm', e.target.value)}
                placeholder="Contoh: 145"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300"
              />
            </div>

            {/* 26. Golongan Darah */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                26. Golongan Darah *
              </label>
              <select
                value={formData.golonganDarah || 'O'}
                onChange={(e) => updateField('golonganDarah', e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white"
              >
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="O">O</option>
                <option value="AB">AB</option>
                <option value="Belum Tahu">Belum Tahu</option>
              </select>
            </div>

            {/* 27. Penyakit Berat */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                27. Penyakit Berat yang Pernah Diderita *
              </label>
              <input
                type="text"
                required
                value={formData.penyakitBerat || '-'}
                onChange={(e) => updateField('penyakitBerat', e.target.value)}
                placeholder="Ketik '-' jika tidak ada"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300"
              />
            </div>

            {/* 28. Kelainan Jasmani */}
            <div className="sm:col-span-2 lg:col-span-4">
              <label className="block font-semibold text-slate-700 mb-1">
                28. Kelainan Jasmani / Kebutuhan Khusus *
              </label>
              <input
                type="text"
                required
                value={formData.kelainanJasmani || '-'}
                onChange={(e) => updateField('kelainanJasmani', e.target.value)}
                placeholder="Ketik '-' jika tidak ada kelainan fisik"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300"
              />
            </div>

          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SEKSI 3: DATA ASAL SEKOLAH SISWA (Nomor 29 - 31) */}
      {/* ============================================================== */}
      {(activeSection === 'all' || activeSection === 'sec3') && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-5 text-xs">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="p-2.5 rounded-xl bg-blue-100 text-blue-800">
              <School className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-blue-700 uppercase tracking-widest block">
                Bagian 3 (Nomor 29 s/d 31)
              </span>
              <h3 className="text-base font-bold text-slate-900">
                Data Asal Sekolah Siswa
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* 29. Masuk Sebagai */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                29. Masuk Sekolah ini Sebagai *
              </label>
              <select
                value={formData.masukSebagai || 'Siswa Baru'}
                onChange={(e) => updateField('masukSebagai', e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white"
              >
                <option value="Siswa Baru">Siswa Baru</option>
                <option value="Siswa Pindahan Kelas 7">Siswa Pindahan Kelas 7</option>
                <option value="Siswa Pindahan Kelas 8">Siswa Pindahan Kelas 8</option>
                <option value="Siswa Pindahan Kelas 9">Siswa Pindahan Kelas 9</option>
              </select>
            </div>

            {/* 30. Asal Sekolah */}
            <div className="sm:col-span-2">
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-semibold text-slate-700">
                  30. Nama Asal Sekolah SD/MI *
                </label>
                <button
                  type="button"
                  onClick={() => setIsManualSekolah(!isManualSekolah)}
                  className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>{isManualSekolah ? 'Pilih dari Dropdown' : 'Ketik Manual'}</span>
                </button>
              </div>

              {!isManualSekolah ? (
                <select
                  value={
                    DAFTAR_SEKOLAH_ASAL.includes(formData.asalSekolah || '')
                      ? formData.asalSekolah
                      : '__MANUAL__'
                  }
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '__MANUAL__') {
                      setIsManualSekolah(true);
                    } else {
                      updateField('asalSekolah', val);
                    }
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="" disabled>-- Pilih Asal Sekolah SD/MI --</option>
                  {DAFTAR_SEKOLAH_ASAL.map((sch) => (
                    <option key={sch} value={sch}>
                      {sch}
                    </option>
                  ))}
                  <option value="__MANUAL__">-- Sekolah Lainnya (Input Manual) --</option>
                </select>
              ) : (
                <div className="space-y-1">
                  <input
                    type="text"
                    required
                    value={formData.asalSekolah || ''}
                    onChange={(e) => updateField('asalSekolah', e.target.value)}
                    placeholder="Ketik nama lengkap SD/MI asal (misal: SDIT / SDN / MI...)"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="text-[10px] text-slate-500">
                    Mode input manual aktif. Anda dapat mengetikkan nama sekolah manapun secara bebas.
                  </span>
                </div>
              )}
            </div>

            {/* 31. Nomor Ijazah */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                31. Nomor Ijazah SD/MI * (jika belum terbit isi "-")
              </label>
              <input
                type="text"
                value={formData.nomorIjazah || '-'}
                onChange={(e) => updateField('nomorIjazah', e.target.value)}
                placeholder="Nomor seri ijazah kelulusan"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono"
              />
            </div>

          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SEKSI 4: DATA KEGEMARAN & PRESTASI (Nomor 32 - 36) */}
      {/* ============================================================== */}
      {(activeSection === 'all' || activeSection === 'sec4') && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-5 text-xs">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="p-2.5 rounded-xl bg-amber-100 text-amber-800">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-amber-700 uppercase tracking-widest block">
                Bagian 4 (Nomor 32 s/d 36)
              </span>
              <h3 className="text-base font-bold text-slate-900">
                Data Kegemaran (Hobi) & Prestasi Siswa
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* 32. Kegemaran Kesenian */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                32. Kegemaran Kesenian *
              </label>
              <input
                type="text"
                required
                value={formData.kegemaranKesenian || 'Kaligrafi'}
                onChange={(e) => updateField('kegemaranKesenian', e.target.value)}
                placeholder="Kaligrafi, menggambar, nasyid, dll"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300"
              />
            </div>

            {/* 33. Kegemaran Olahraga */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                33. Kegemaran Olahraga *
              </label>
              <input
                type="text"
                required
                value={formData.kegemaranOlahraga || 'Bulu Tangkis'}
                onChange={(e) => updateField('kegemaranOlahraga', e.target.value)}
                placeholder="Bulu tangkis, futsal, renang, memanah"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300"
              />
            </div>

            {/* 34. Kegemaran Organisasi */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                34. Kemasyarakatan / Organisasi *
              </label>
              <input
                type="text"
                required
                value={formData.kegemaranOrganisasi || 'Pramuka'}
                onChange={(e) => updateField('kegemaranOrganisasi', e.target.value)}
                placeholder="Pramuka, dokter kecil, rohis"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300"
              />
            </div>

            {/* 35. Menerima Beasiswa */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                35. Menerima Beasiswa * (isi "-" jika tidak ada)
              </label>
              <input
                type="text"
                required
                value={formData.menerimaBeasiswa || '-'}
                onChange={(e) => updateField('menerimaBeasiswa', e.target.value)}
                placeholder="Ketik nama beasiswa atau '-'"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300"
              />
            </div>

            {/* 36. Memenangkan Kejuaraan */}
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                36. Memenangkan Kejuaraan / Prestasi Lomba *
              </label>
              <input
                type="text"
                required
                value={formData.memenangkanKejuaraan || '-'}
                onChange={(e) => updateField('memenangkanKejuaraan', e.target.value)}
                placeholder="Contoh: Juara 1 MHQ / Juara 2 Olimpiade Matematika"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300"
              />
            </div>

          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SEKSI 5: DATA AYAH KANDUNG (Nomor 37 - 47) */}
      {/* ============================================================== */}
      {(activeSection === 'all' || activeSection === 'sec5') && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-5 text-xs">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="p-2.5 rounded-xl bg-indigo-100 text-indigo-800">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-widest block">
                Bagian 5 (Nomor 37 s/d 47)
              </span>
              <h3 className="text-base font-bold text-slate-900">
                Data Lengkap Ayah Kandung
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* 37. Nama Lengkap Ayah */}
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                37. Nama Lengkap Ayah *
              </label>
              <input
                type="text"
                required
                value={formData.namaAyah || ''}
                onChange={(e) => updateField('namaAyah', e.target.value)}
                placeholder="Nama ayah beserta gelar"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium"
              />
            </div>

            {/* 38. Tempat & Tgl Lahir Ayah */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                38. Tempat dan Tanggal Lahir Ayah *
              </label>
              <input
                type="text"
                required
                value={formData.tempatTanggalLahirAyah || ''}
                onChange={(e) => updateField('tempatTanggalLahirAyah', e.target.value)}
                placeholder="Contoh: Depok, 12 Agustus 1980"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300"
              />
            </div>

            {/* 39. Agama Ayah */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                39. Agama Ayah *
              </label>
              <input
                type="text"
                required
                value={formData.agamaAyah || 'Islam'}
                onChange={(e) => updateField('agamaAyah', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300"
              />
            </div>

            {/* 40. Kewarganegaraan Ayah */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                40. Kewarganegaraan Ayah *
              </label>
              <select
                value={formData.kewarganegaraanAyah || 'Indonesia'}
                onChange={(e) => updateField('kewarganegaraanAyah', e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white"
              >
                <option value="Indonesia">Indonesia</option>
                <option value="Asing">Asing</option>
              </select>
            </div>

            {/* 41. Pendidikan Ayah */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                41. Pendidikan Terakhir Ayah *
              </label>
              <select
                value={formData.pendidikanAyah || 'S1'}
                onChange={(e) => updateField('pendidikanAyah', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white"
              >
                <option value="SD">SD</option>
                <option value="SMP">SMP</option>
                <option value="SMA/SMK">SMA/SMK</option>
                <option value="D3">D3</option>
                <option value="S1">S1</option>
                <option value="S2">S2</option>
                <option value="S3">S3</option>
              </select>
            </div>

            {/* 42. Pekerjaan Ayah */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                42. Pekerjaan Ayah *
              </label>
              <input
                type="text"
                required
                value={formData.pekerjaanAyah || ''}
                onChange={(e) => updateField('pekerjaanAyah', e.target.value)}
                placeholder="PNS / Swasta / Wiraswasta / TNI / POLRI"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300"
              />
            </div>

            {/* 43. Penghasilan Ayah */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                43. Penghasilan Ayah per Bulan *
              </label>
              <select
                value={formData.penghasilanAyah || 'Rp. 5jt - Rp. 10jt'}
                onChange={(e) => updateField('penghasilanAyah', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white"
              >
                <option value="dibawah Rp. 5jt">dibawah Rp. 5jt</option>
                <option value="Rp. 5jt - Rp. 10jt">Rp. 5jt - Rp. 10jt</option>
                <option value="Rp. 10jt - Rp. 15jt">Rp. 10jt - Rp. 15jt</option>
                <option value="diatas 15jt">diatas 15jt</option>
              </select>
            </div>

            {/* 44. Alamat Ayah */}
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                44. Alamat Rumah Ayah *
              </label>
              <input
                type="text"
                required
                value={formData.alamatAyah || ''}
                onChange={(e) => updateField('alamatAyah', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300"
              />
            </div>

            {/* 45. No HP Ayah */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                45. Nomor Telepon / HP WhatsApp Ayah *
              </label>
              <input
                type="text"
                required
                value={formData.noHpAyah || ''}
                onChange={(e) => updateField('noHpAyah', e.target.value)}
                placeholder="08xxxxxxxxxx"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono"
              />
            </div>

            {/* 46. Email Ayah */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                46. E-mail Ayah *
              </label>
              <input
                type="email"
                required
                value={formData.emailAyah || ''}
                onChange={(e) => updateField('emailAyah', e.target.value)}
                placeholder="ayah@gmail.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300"
              />
            </div>

            {/* 47. Status Perkawinan Ayah */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                47. Status Perkawinan Ayah dengan Ibu *
              </label>
              <select
                value={formData.statusPerkawinanAyah || 'Suami'}
                onChange={(e) => updateField('statusPerkawinanAyah', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white"
              >
                <option value="Suami">Suami (Menikah Sah)</option>
                <option value="Cerai Hidup">Cerai Hidup</option>
                <option value="Cerai Meninggal">Cerai Meninggal</option>
              </select>
            </div>

          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SEKSI 6: DATA IBU KANDUNG (Nomor 48 - 58) */}
      {/* ============================================================== */}
      {(activeSection === 'all' || activeSection === 'sec6') && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-5 text-xs">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="p-2.5 rounded-xl bg-purple-100 text-purple-800">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-purple-700 uppercase tracking-widest block">
                Bagian 6 (Nomor 48 s/d 58)
              </span>
              <h3 className="text-base font-bold text-slate-900">
                Data Lengkap Ibu Kandung
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* 48. Nama Lengkap Ibu */}
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                48. Nama Lengkap Ibu *
              </label>
              <input
                type="text"
                required
                value={formData.namaIbu || ''}
                onChange={(e) => updateField('namaIbu', e.target.value)}
                placeholder="Nama ibu beserta gelar"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium"
              />
            </div>

            {/* 49. Tempat & Tgl Lahir Ibu */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                49. Tempat dan Tanggal Lahir Ibu *
              </label>
              <input
                type="text"
                required
                value={formData.tempatTanggalLahirIbu || ''}
                onChange={(e) => updateField('tempatTanggalLahirIbu', e.target.value)}
                placeholder="Contoh: Jakarta, 24 Mei 1983"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300"
              />
            </div>

            {/* 50. Agama Ibu */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                50. Agama Ibu *
              </label>
              <input
                type="text"
                required
                value={formData.agamaIbu || 'Islam'}
                onChange={(e) => updateField('agamaIbu', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300"
              />
            </div>

            {/* 51. Kewarganegaraan Ibu */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                51. Kewarganegaraan Ibu *
              </label>
              <select
                value={formData.kewarganegaraanIbu || 'Indonesia'}
                onChange={(e) => updateField('kewarganegaraanIbu', e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white"
              >
                <option value="Indonesia">Indonesia</option>
                <option value="Asing">Asing</option>
              </select>
            </div>

            {/* 52. Pendidikan Ibu */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                52. Pendidikan Terakhir Ibu *
              </label>
              <select
                value={formData.pendidikanIbu || 'S1'}
                onChange={(e) => updateField('pendidikanIbu', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white"
              >
                <option value="SD">SD</option>
                <option value="SMP">SMP</option>
                <option value="SMA/SMK">SMA/SMK</option>
                <option value="D3">D3</option>
                <option value="S1">S1</option>
                <option value="S2">S2</option>
                <option value="S3">S3</option>
              </select>
            </div>

            {/* 53. Pekerjaan Ibu */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                53. Pekerjaan Ibu *
              </label>
              <input
                type="text"
                required
                value={formData.pekerjaanIbu || ''}
                onChange={(e) => updateField('pekerjaanIbu', e.target.value)}
                placeholder="Ibu Rumah Tangga / Guru / PNS / Karyawan"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300"
              />
            </div>

            {/* 54. Penghasilan Ibu */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                54. Penghasilan Ibu per Bulan *
              </label>
              <select
                value={formData.penghasilanIbu || 'Rp. 5jt - Rp. 10jt'}
                onChange={(e) => updateField('penghasilanIbu', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white"
              >
                <option value="Tidak Berpenghasilan (IRT)">Tidak Berpenghasilan (IRT)</option>
                <option value="dibawah Rp. 5jt">dibawah Rp. 5jt</option>
                <option value="Rp. 5jt - Rp. 10jt">Rp. 5jt - Rp. 10jt</option>
                <option value="Rp. 10jt - Rp. 15jt">Rp. 10jt - Rp. 15jt</option>
                <option value="diatas 15jt">diatas 15jt</option>
              </select>
            </div>

            {/* 55. Alamat Ibu */}
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                55. Alamat Rumah Ibu *
              </label>
              <input
                type="text"
                required
                value={formData.alamatIbu || ''}
                onChange={(e) => updateField('alamatIbu', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300"
              />
            </div>

            {/* 56. No HP Ibu */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                56. Nomor Telepon / HP WhatsApp Ibu *
              </label>
              <input
                type="text"
                required
                value={formData.noHpIbu || ''}
                onChange={(e) => updateField('noHpIbu', e.target.value)}
                placeholder="08xxxxxxxxxx"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono"
              />
            </div>

            {/* 57. Email Ibu */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                57. Email Ibu *
              </label>
              <input
                type="email"
                required
                value={formData.emailIbu || ''}
                onChange={(e) => updateField('emailIbu', e.target.value)}
                placeholder="ibu@gmail.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300"
              />
            </div>

            {/* 58. Status Perkawinan Ibu */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                58. Status Perkawinan Ibu dengan Ayah *
              </label>
              <select
                value={formData.statusPerkawinanIbu || 'Istri'}
                onChange={(e) => updateField('statusPerkawinanIbu', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white"
              >
                <option value="Istri">Istri (Menikah Sah)</option>
                <option value="Cerai Hidup">Cerai Hidup</option>
                <option value="Cerai Meninggal">Cerai Meninggal</option>
              </select>
            </div>

          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SEKSI 7: DATA WALI SISWA (Nomor 59 - 67, Opsional) */}
      {/* ============================================================== */}
      {(activeSection === 'all' || activeSection === 'sec7') && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-5 text-xs">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="p-2.5 rounded-xl bg-teal-100 text-teal-800">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-teal-700 uppercase tracking-widest block">
                Bagian 7 (Nomor 59 s/d 67 - Opsional)
              </span>
              <h3 className="text-base font-bold text-slate-900">
                Data Wali Calon Siswa (Diisi jika bertempat tinggal dengan Wali)
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* 59. Nama Lengkap Wali */}
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                59. Nama Lengkap Wali (isi "-" jika tidak ada)
              </label>
              <input
                type="text"
                value={formData.namaWali || '-'}
                onChange={(e) => updateField('namaWali', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300"
              />
            </div>

            {/* 60. Tempat & Tgl Lahir Wali */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                60. Tempat dan Tanggal Lahir Wali
              </label>
              <input
                type="text"
                value={formData.tempatTanggalLahirWali || '-'}
                onChange={(e) => updateField('tempatTanggalLahirWali', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300"
              />
            </div>

            {/* 61. Agama Wali */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                61. Agama Wali
              </label>
              <input
                type="text"
                value={formData.agamaWali || 'Islam'}
                onChange={(e) => updateField('agamaWali', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300"
              />
            </div>

            {/* 62. Kewarganegaraan Wali */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                62. Kewarganegaraan Wali
              </label>
              <input
                type="text"
                value={formData.kewarganegaraanWali || 'Indonesia'}
                onChange={(e) => updateField('kewarganegaraanWali', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300"
              />
            </div>

            {/* 63. Pendidikan Wali */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                63. Pendidikan Terakhir Wali
              </label>
              <input
                type="text"
                value={formData.pendidikanWali || '-'}
                onChange={(e) => updateField('pendidikanWali', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300"
              />
            </div>

            {/* 64. Pekerjaan Wali */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                64. Pekerjaan Wali
              </label>
              <input
                type="text"
                value={formData.pekerjaanWali || '-'}
                onChange={(e) => updateField('pekerjaanWali', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300"
              />
            </div>

            {/* 65. Alamat Wali */}
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                65. Alamat Rumah Wali
              </label>
              <input
                type="text"
                value={formData.alamatWali || '-'}
                onChange={(e) => updateField('alamatWali', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300"
              />
            </div>

            {/* 66. No HP Wali */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                66. Nomor Telepon / HP Wali
              </label>
              <input
                type="text"
                value={formData.noHpWali || '-'}
                onChange={(e) => updateField('noHpWali', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono"
              />
            </div>

            {/* 67. Hubungan Wali */}
            <div className="sm:col-span-2 lg:col-span-3">
              <label className="block font-semibold text-slate-700 mb-1">
                67. Status Hubungan Wali dengan Siswa (Paman / Bibi / Kakek / Nenek / Lainnya)
              </label>
              <input
                type="text"
                value={formData.statusHubunganWali || '-'}
                onChange={(e) => updateField('statusHubunganWali', e.target.value)}
                placeholder="Contoh: Paman kandung / Kakek"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300"
              />
            </div>

          </div>
        </div>
      )}

      {/* Sticky Bottom Save Action Bar */}
      <div className="sticky bottom-4 z-20 p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-600">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Seluruh data biodata calon siswa tersimpan secara lengkap & tersinkronisasi.</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto px-8 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Sedang Menyimpan...' : 'Simpan Data Calon Siswa'}</span>
          </button>
        </div>
      </div>

    </form>
  );
};
