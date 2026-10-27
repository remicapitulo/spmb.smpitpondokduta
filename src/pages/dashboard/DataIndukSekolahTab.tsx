import React, { useState, useEffect, useMemo } from 'react';
import { DataIndukSiswa, DataSiswa, StatusKelulusanInfo } from '../../types';
import { gasService } from '../../services/gasService';
import { BukuIndukPrintView } from './BukuIndukPrintView';
import { 
  BookOpen, 
  CheckCircle2, 
  Copy, 
  Search, 
  Save, 
  Printer, 
  Download, 
  RefreshCw, 
  Hash, 
  Sparkles, 
  UserCheck, 
  Trash2, 
  FileSpreadsheet, 
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Check,
  Users,
  Filter,
  X
} from 'lucide-react';

interface Props {
  students: any[];
  currentUser?: any;
  onRefreshStudentList: () => Promise<void>;
}

export const DataIndukSekolahTab: React.FC<Props> = ({ 
  students, 
  currentUser, 
  onRefreshStudentList 
}) => {
  const [dataIndukList, setDataIndukList] = useState<DataIndukSiswa[]>(() => gasService.getDataIndukList());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterCandidateMode, setFilterCandidateMode] = useState<'lulus' | 'all'>('lulus');
  
  // State Seleksi Siswa Lulus untuk Disalin
  const [selectedToCopy, setSelectedToCopy] = useState<string[]>([]);
  
  // State Edit NIS Inline
  const [editingNisMap, setEditingNisMap] = useState<{ [noPend: string]: string }>({});
  const [savedNisNotify, setSavedNisNotify] = useState<{ [noPend: string]: boolean }>({});
  
  // Modal Print Lembar Buku Induk
  const [selectedPrintItem, setSelectedPrintItem] = useState<DataIndukSiswa | null>(null);

  // Modal Generator NIS Otomatis
  const [showNisModal, setShowNisModal] = useState(false);
  const [nisPrefix, setNisPrefix] = useState('2728');
  const [nisStartNum, setNisStartNum] = useState(1);

  useEffect(() => {
    loadDataInduk();
    const handleDbUpdate = () => loadDataInduk();
    window.addEventListener('spmb_db_updated', handleDbUpdate);
    window.addEventListener('storage', handleDbUpdate);
    return () => {
      window.removeEventListener('spmb_db_updated', handleDbUpdate);
      window.removeEventListener('storage', handleDbUpdate);
    };
  }, []);

  const loadDataInduk = () => {
    const list = gasService.getDataIndukList();
    setDataIndukList(list);
    // Inisialisasi map input NIS
    const nisMap: { [noPend: string]: string } = {};
    list.forEach(item => {
      nisMap[item.noPendaftaran] = item.nis || '';
    });
    setEditingNisMap(nisMap);
  };

  // Ambil daftar seluruh siswa dengan status kelulusan "LULUS" atau rekomendasi observasi "Diterima"
  const lulusStudents = useMemo(() => {
    // Ambil data kelulusan dari localStorage
    const rawLulus = localStorage.getItem('spmb_pd_status_kelulusan');
    const lulusList: StatusKelulusanInfo[] = rawLulus ? JSON.parse(rawLulus) : [];
    const lulusNoPendSet = new Set<string>();

    lulusList.forEach(l => {
      if (l.status === 'LULUS') lulusNoPendSet.add(l.noPendaftaran.toUpperCase());
    });

    const rawObs = localStorage.getItem('spmb_pd_observasi_siswa_list');
    const obsList: any[] = rawObs ? JSON.parse(rawObs) : [];
    obsList.forEach(o => {
      if (o.rekomendasi === 'Diterima') lulusNoPendSet.add(o.noPendaftaran.toUpperCase());
    });

    const rawSiswa = localStorage.getItem('spmb_pd_siswa_data');
    const allSiswaRaw: DataSiswa[] = rawSiswa ? JSON.parse(rawSiswa) : [];
    
    // Deduplikasi kandidat siswa berdasarkan noPendaftaran agar tidak ada data ganda
    const seenPend = new Set<string>();
    const allSiswa: DataSiswa[] = [];
    allSiswaRaw.forEach(s => {
      const np = (s.noPendaftaran || '').trim().toUpperCase();
      if (!np || !seenPend.has(np)) {
        if (np) seenPend.add(np);
        allSiswa.push(s);
      }
    });

    if (filterCandidateMode === 'lulus') {
      const filtered = allSiswa.filter(s => lulusNoPendSet.has(s.noPendaftaran.toUpperCase()));
      return filtered.length > 0 ? filtered : allSiswa;
    }
    return allSiswa;
  }, [students, filterCandidateMode]);

  // Siswa yang sudah masuk ke Data Induk
  const existingIndukMap = useMemo(() => {
    const map = new Set<string>();
    dataIndukList.forEach(d => map.add(d.noPendaftaran.toUpperCase()));
    return map;
  }, [dataIndukList]);

  // Filter Siswa Lulus yang BELUM disalin ke Data Induk
  const pendingLulusStudents = useMemo(() => {
    return lulusStudents.filter(s => !existingIndukMap.has(s.noPendaftaran.toUpperCase()));
  }, [lulusStudents, existingIndukMap]);

  // Handler Pilih Semua Murid Lulus yang belum disalin
  const handleToggleSelectAll = () => {
    if (selectedToCopy.length === pendingLulusStudents.length && pendingLulusStudents.length > 0) {
      setSelectedToCopy([]);
    } else {
      setSelectedToCopy(pendingLulusStudents.map(s => s.noPendaftaran));
    }
  };

  const handleToggleSelectOne = (noPend: string) => {
    setSelectedToCopy(prev => 
      prev.includes(noPend) ? prev.filter(c => c !== noPend) : [...prev, noPend]
    );
  };

  // Eksekusi Salin Murid Lulus ke Data Induk Sekolah
  const handleCopySelectedToDataInduk = async () => {
    if (selectedToCopy.length === 0) {
      alert('Silakan centang siswa lulus yang ingin disalin ke Data Induk Sekolah terlebih dahulu.');
      return;
    }

    setSaving(true);
    const res = await gasService.copyLulusToDataInduk(selectedToCopy);
    setSaving(false);
    setSelectedToCopy([]);
    loadDataInduk();
    alert(res.message);
  };

  // Handler Simpan NIS Individual
  const handleSaveNis = async (noPendaftaran: string) => {
    const nisValue = editingNisMap[noPendaftaran] || '';
    if (!nisValue.trim()) {
      alert('Silakan isi Nomor Induk Murid (NIS) terlebih dahulu.');
      return;
    }

    setSaving(true);
    const res = await gasService.updateStudentNis(noPendaftaran, nisValue);
    setSaving(false);

    if (res.success) {
      setSavedNisNotify(prev => ({ ...prev, [noPendaftaran]: true }));
      setTimeout(() => {
        setSavedNisNotify(prev => ({ ...prev, [noPendaftaran]: false }));
      }, 2500);
      loadDataInduk();
    } else {
      alert(res.message);
    }
  };

  // Handler Generator NIS Massal
  const handleExecuteAutoGenerateNis = async () => {
    setSaving(true);
    const res = await gasService.autoGenerateNis(nisPrefix.trim(), Number(nisStartNum) || 1);
    setSaving(false);
    setShowNisModal(false);
    loadDataInduk();
    alert(res.message);
  };

  // Handler Hapus Siswa dari Data Induk
  const handleDeleteFromDataInduk = async (noPend: string, nama: string) => {
    if (confirm(`Apakah Anda yakin ingin mengeluarkan ${nama} (${noPend}) dari Buku Induk Sekolah?`)) {
      setSaving(true);
      await gasService.removeFromDataInduk(noPend);
      setSaving(false);
      loadDataInduk();
    }
  };

  // Handler Sinkronisasi ke Sheet Data Induk Sekolah
  const handleSyncToGoogleSheets = async () => {
    setLoading(true);
    const res = await gasService.syncDataIndukToSpreadsheet();
    setLoading(false);
    alert(res.message);
  };

  // Handler Ekspor CSV Tabel Lengkap Tanpa JSON
  const handleExportCsv = () => {
    if (dataIndukList.length === 0) {
      alert('Belum ada data di Buku Induk Sekolah untuk diekspor.');
      return;
    }

    const headers = [
      "No Urut", "NIS", "NISN", "NIK Siswa", "No Pendaftaran", "Nama Lengkap", "Nama Panggilan",
      "Jenis Kelamin", "Tempat Lahir", "Tanggal Lahir", "Agama", "Kewarganegaraan",
      "Anak Ke", "Jml Sdr Kandung", "Jml Sdr Tiri", "Jml Sdr Angkat", "Bahasa Sehari-hari",
      "Berat Badan (kg)", "Tinggi Badan (cm)", "Golongan Darah", "Penyakit Berat", "Kelainan Jasmani",
      "Alamat Tinggal", "Kelurahan", "Kecamatan", "Kota/Kabupaten", "No HP / Telepon",
      "Bertempat Tinggal Pada", "Jarak Sekolah (km)", "Sarana Transportasi", "Masuk Sebagai",
      "Asal Sekolah", "Nomor Ijazah SD", "Kesenian", "Olahraga", "Organisasi", "Beasiswa", "Prestasi",
      "Nama Ayah", "TTL Ayah", "Agama Ayah", "Pendidikan Ayah", "Pekerjaan Ayah", "Penghasilan Ayah", "Alamat Ayah", "No HP Ayah", "Email Ayah",
      "Nama Ibu", "TTL Ibu", "Agama Ibu", "Pendidikan Ibu", "Pekerjaan Ibu", "Penghasilan Ibu", "Alamat Ibu", "No HP Ibu", "Email Ibu",
      "Nama Wali", "TTL Wali", "Agama Wali", "Pendidikan Wali", "Pekerjaan Wali", "Penghasilan Wali", "Alamat Wali", "No HP Wali", "Hubungan Wali",
      "Status Kelulusan", "Tahun Pelajaran", "Tanggal Diterima", "Catatan Khusus"
    ];

    const escapeCsv = (val: any) => {
      const str = String(val === undefined || val === null ? '' : val);
      return `"${str.replace(/"/g, '""')}"`;
    };

    const rows = dataIndukList.map((item, idx) => [
      item.noUrut || idx + 1,
      item.nis,
      item.nisn,
      item.nik,
      item.noPendaftaran,
      item.namaLengkap,
      item.namaPanggilan,
      item.jenisKelamin,
      item.tempatLahir,
      item.tanggalLahir,
      item.agama,
      item.kewarganegaraan,
      item.anakNomorKe,
      item.jumlahSaudaraKandung,
      item.jumlahSaudaraTiri,
      item.jumlahSaudaraAngkat,
      item.bahasaSehariHari,
      item.beratBadanKg,
      item.tinggiBadanCm,
      item.golonganDarah,
      item.penyakitBerat,
      item.kelainanJasmani,
      item.alamat,
      item.kelurahan,
      item.kecamatan,
      item.kotaKabupaten,
      item.nomorHandphone || item.nomorTelepon,
      item.bertempatTinggalPada,
      item.jarakKeSekolahKm,
      item.saranaBerangkatSekolah,
      item.masukSebagai,
      item.asalSekolah,
      item.nomorIjazah,
      item.kegemaranKesenian,
      item.kegemaranOlahraga,
      item.kegemaranOrganisasi,
      item.menerimaBeasiswa,
      item.memenangkanKejuaraan,
      item.namaAyah,
      item.tempatTanggalLahirAyah,
      item.agamaAyah,
      item.pendidikanAyah,
      item.pekerjaanAyah,
      item.penghasilanAyah,
      item.alamatAyah,
      item.noHpAyah,
      item.emailAyah,
      item.namaIbu,
      item.tempatTanggalLahirIbu,
      item.agamaIbu,
      item.pendidikanIbu,
      item.pekerjaanIbu,
      item.penghasilanIbu,
      item.alamatIbu,
      item.noHpIbu,
      item.emailIbu,
      item.namaWali,
      item.tempatTanggalLahirWali,
      item.agamaWali,
      item.pendidikanWali,
      item.pekerjaanWali,
      item.penghasilanWali,
      item.alamatWali,
      item.noHpWali,
      item.statusHubunganWali,
      item.statusKelulusan,
      item.tahunPelajaran,
      item.tanggalDiterima,
      item.catatanKhusus
    ].map(escapeCsv).join(','));

    const csvContent = '\uFEFF' + [headers.map(escapeCsv).join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Buku_Induk_Murid_SMPIT_Pondok_Duta_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Filter Data Induk
  const filteredDataInduk = useMemo(() => {
    const term = searchKeyword.trim().toLowerCase();
    if (!term) return dataIndukList;
    return dataIndukList.filter(item => 
      (item.namaLengkap || '').toLowerCase().includes(term) ||
      (item.nis || '').toLowerCase().includes(term) ||
      (item.nisn || '').toLowerCase().includes(term) ||
      (item.nik || '').toLowerCase().includes(term) ||
      (item.noPendaftaran || '').toLowerCase().includes(term) ||
      (item.asalSekolah || '').toLowerCase().includes(term)
    );
  }, [dataIndukList, searchKeyword]);

  const studentsWithNisCount = useMemo(() => {
    return dataIndukList.filter(d => Boolean(d.nis && d.nis.trim())).length;
  }, [dataIndukList]);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* ===================================================================== */}
      {/* 1. HEADER BANNER & STATISTIK DATA INDUK                               */}
      {/* ===================================================================== */}
      <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-teal-900 via-emerald-900 to-slate-900 text-white shadow-xl border border-emerald-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-300 text-xs font-semibold border border-white/15 mb-2.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Portal Buku Induk Murid &amp; Nomor Induk Sekolah (NIS)</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white">
              Data Induk Sekolah (Sheet &quot;Data Induk Sekolah&quot;)
            </h1>
            <p className="text-xs text-emerald-100/90 mt-1 max-w-2xl leading-relaxed">
              Koleksi seluruh data murid yang lulus seleksi dengan kolom lengkap resmi tanpa JSON. Admin, Guru, dan Pengawas dapat memberikan Nomor Induk Murid (NIS) masing-masing serta mencetak lembar buku induk resmi.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto shrink-0">
            <button
              onClick={handleSyncToGoogleSheets}
              disabled={loading || saving}
              className="px-4 py-2.5 rounded-xl bg-white text-emerald-950 font-extrabold text-xs flex items-center gap-2 shadow hover:bg-emerald-50 active:scale-95 transition cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Menyinkronkan...' : 'Sinkronkan ke Spreadsheet'}</span>
            </button>
            <button
              onClick={handleExportCsv}
              className="px-4 py-2.5 rounded-xl bg-emerald-700/80 hover:bg-emerald-600 text-white font-extrabold text-xs flex items-center gap-2 border border-emerald-500/30 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Ekspor Excel (CSV)</span>
            </button>
          </div>
        </div>

        {/* STATISTIK COUNTERS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/15 text-xs">
          <div className="bg-white/10 p-3 rounded-2xl border border-white/10">
            <span className="text-[10px] text-emerald-200 uppercase font-semibold block">Total Pendaftar SPMB:</span>
            <span className="text-lg font-black text-white">{students.length} Siswa</span>
          </div>
          <div className="bg-white/10 p-3 rounded-2xl border border-white/10">
            <span className="text-[10px] text-emerald-200 uppercase font-semibold block">Lulus Seleksi:</span>
            <span className="text-lg font-black text-amber-300">{lulusStudents.length} Siswa</span>
          </div>
          <div className="bg-white/10 p-3 rounded-2xl border border-white/10">
            <span className="text-[10px] text-emerald-200 uppercase font-semibold block">Masuk Buku Induk:</span>
            <span className="text-lg font-black text-emerald-300">{dataIndukList.length} Siswa</span>
          </div>
          <div className="bg-white/10 p-3 rounded-2xl border border-white/10">
            <span className="text-[10px] text-emerald-200 uppercase font-semibold block">Sudah Diberi NIS:</span>
            <span className="text-lg font-black text-teal-200">{studentsWithNisCount} Siswa</span>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 2. PANEL SALIN SISWA LULUS KE DATA INDUK SEKOLAH                     */}
      {/* ===================================================================== */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-700">
              <Copy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900">
                Pilih Murid Lulus &amp; Salin ke Data Induk Sekolah
              </h2>
              <p className="text-xs text-slate-500">
                Pilih calon murid yang lulus tes seleksi untuk disalin ke sheet &quot;Data Induk Sekolah&quot; (semua 70 kolom tanpa JSON).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleSelectAll}
              disabled={pendingLulusStudents.length === 0}
              className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer disabled:opacity-40"
            >
              {selectedToCopy.length === pendingLulusStudents.length && pendingLulusStudents.length > 0
                ? 'Batal Pilih Semua'
                : 'Pilih Semua Siswa'}
            </button>
            <button
              onClick={handleCopySelectedToDataInduk}
              disabled={selectedToCopy.length === 0 || saving}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-sm transition disabled:opacity-40 cursor-pointer"
            >
              <Copy className="w-4 h-4" />
              <span>Salin Terpilih ({selectedToCopy.length})</span>
            </button>
          </div>
        </div>

        {/* Filter Toggle: Hanya Murid Lulus vs Semua Calon Murid */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 pb-1">
          <div className="inline-flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setFilterCandidateMode('lulus')}
              className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                filterCandidateMode === 'lulus'
                  ? 'bg-white text-emerald-800 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Hanya Murid Lulus Seleksi
            </button>
            <button
              type="button"
              onClick={() => setFilterCandidateMode('all')}
              className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                filterCandidateMode === 'all'
                  ? 'bg-white text-emerald-800 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua Calon Murid Terdaftar
            </button>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            Tersedia <strong>{pendingLulusStudents.length}</strong> siswa yang belum masuk Data Induk
          </span>
        </div>

        {/* DAFTAR SISWA LULUS UNTUK DIPILIH */}
        {pendingLulusStudents.length === 0 ? (
          <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <strong>Semua Murid Lulus Sudah Disalin!</strong> Seluruh data murid yang lulus tes seleksi telah terkumpul dalam Data Induk Sekolah. Anda dapat mengelola NIS dan mencetak lembar buku induk pada tabel di bawah.
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {pendingLulusStudents.map((siswa, idx) => {
              const isSelected = selectedToCopy.includes(siswa.noPendaftaran);
              return (
                <div
                  key={`pending-siswa-${siswa.noPendaftaran}-${idx}`}
                  onClick={() => handleToggleSelectOne(siswa.noPendaftaran)}
                  className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected 
                      ? 'bg-amber-50/80 border-amber-400 shadow-xs' 
                      : 'bg-slate-50 hover:bg-slate-100/70 border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleSelectOne(siswa.noPendaftaran)}
                      className="w-4 h-4 accent-amber-600 rounded cursor-pointer"
                    />
                    <div className="truncate">
                      <div className="font-bold text-xs text-slate-900 truncate">
                        {siswa.namaLengkap}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-2">
                        <span className="font-mono">{siswa.noPendaftaran}</span>
                        <span>•</span>
                        <span className="truncate">{siswa.asalSekolah || 'SD/MI'}</span>
                      </div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold shrink-0">
                    LULUS
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ===================================================================== */}
      {/* 3. TABEL DATA INDUK SEKOLAH & MANAJEMEN NOMOR INDUK SISWA (NIS)       */}
      {/* ===================================================================== */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
        
        {/* Table Controls & Search */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200/80 shadow-2xs">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                Tabel Buku Induk Murid SMPIT Pondok Duta
              </h2>
              <span className="inline-block text-[11px] font-semibold text-slate-500 mt-0.5">
                Menampilkan <strong>{filteredDataInduk.length}</strong> dari {dataIndukList.length} murid terdaftar
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <div className="relative flex-1 sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari Nama, NIS, NISN, No Pend..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="w-full pl-10 pr-9 py-2.5 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium shadow-2xs"
              />
              {searchKeyword && (
                <button
                  type="button"
                  onClick={() => setSearchKeyword('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowNisModal(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 active:scale-98 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition cursor-pointer shrink-0"
            >
              <Hash className="w-4 h-4 text-indigo-200" />
              <span>Auto-Generate NIS</span>
            </button>
          </div>
        </div>

        {/* TABEL DATA INDUK LENGKAP */}
        <div className="overflow-x-auto border border-slate-200 rounded-2xl">
          <table className="w-full text-xs text-left text-slate-700">
            <thead className="bg-slate-100 text-slate-800 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-3 text-center">No</th>
                <th className="py-3 px-3 min-w-[170px]">Nomor Induk Murid (NIS)</th>
                <th className="py-3 px-3">No. Pendaftaran</th>
                <th className="py-3 px-3 min-w-[180px]">Nama Lengkap</th>
                <th className="py-3 px-2 text-center">L/P</th>
                <th className="py-3 px-3">NISN / NIK</th>
                <th className="py-3 px-3 min-w-[150px]">Asal Sekolah</th>
                <th className="py-3 px-3 min-w-[160px]">Nama Orang Tua</th>
                <th className="py-3 px-3 min-w-[140px]">No HP</th>
                <th className="py-3 px-3 text-center">Aksi &amp; Unduh PDF</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredDataInduk.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400">
                    Belum ada data murid di Buku Induk Sekolah. Silakan pilih dan salin siswa yang lulus seleksi di atas.
                  </td>
                </tr>
              ) : (
                filteredDataInduk.map((item, idx) => {
                  const currentNisValue = editingNisMap[item.noPendaftaran] !== undefined 
                    ? editingNisMap[item.noPendaftaran] 
                    : (item.nis || '');
                  const isSavedNotify = savedNisNotify[item.noPendaftaran];

                  return (
                    <tr key={`induk-row-${item.noPendaftaran}-${item.noUrut || idx}`} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-3 text-center font-bold text-slate-500">
                        {item.noUrut || idx + 1}
                      </td>

                      {/* KOLOM NOMOR INDUK SISWA (NIS) DENGAN INPUT INLINE */}
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={currentNisValue}
                            onChange={(e) => setEditingNisMap({
                              ...editingNisMap,
                              [item.noPendaftaran]: e.target.value
                            })}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveNis(item.noPendaftaran);
                            }}
                            placeholder="Ketik NIS..."
                            className={`w-28 font-mono text-xs font-bold px-2.5 py-1.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-emerald-500 transition ${
                              isSavedNotify 
                                ? 'bg-emerald-50 border-emerald-500 text-emerald-900' 
                                : item.nis 
                                  ? 'bg-slate-50 border-slate-300 text-slate-900' 
                                  : 'bg-amber-50/60 border-amber-300 text-amber-900'
                            }`}
                          />
                          <button
                            onClick={() => handleSaveNis(item.noPendaftaran)}
                            disabled={saving}
                            title="Simpan Nomor Induk Siswa"
                            className={`p-1.5 rounded-lg text-xs font-bold flex items-center justify-center transition cursor-pointer ${
                              isSavedNotify
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-200 hover:bg-emerald-600 hover:text-white text-slate-700'
                            }`}
                          >
                            {isSavedNotify ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>

                      <td className="py-3 px-3 font-mono font-semibold text-slate-600">
                        {item.noPendaftaran}
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">{item.namaLengkap}</div>
                        <div className="text-[10px] text-slate-400">Panggilan: {item.namaPanggilan || '-'}</div>
                      </td>

                      <td className="py-3 px-2 text-center font-bold">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                          item.jenisKelamin === 'Perempuan' 
                            ? 'bg-pink-100 text-pink-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {item.jenisKelamin === 'Perempuan' ? 'P' : 'L'}
                        </span>
                      </td>

                      <td className="py-3 px-3 font-mono text-[11px]">
                        <div>NISN: {item.nisn || '-'}</div>
                        <div className="text-slate-400">NIK: {item.nik || '-'}</div>
                      </td>

                      <td className="py-3 px-3 text-slate-700">
                        {item.asalSekolah || '-'}
                      </td>

                      <td className="py-3 px-3 text-slate-700">
                        <div>Ayah: {item.namaAyah || '-'}</div>
                        <div className="text-slate-500">Ibu: {item.namaIbu || '-'}</div>
                      </td>

                      <td className="py-3 px-3 font-mono text-[11px] text-slate-600">
                        {item.nomorHandphone || item.noHpAyah || item.noHpIbu || '-'}
                      </td>

                      {/* AKSI CETAK & HAPUS */}
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setSelectedPrintItem(item)}
                            title="Buka & Unduh Lembar Buku Induk Murid (PDF)"
                            className="px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-bold flex items-center gap-1 shadow-xs transition cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Unduh PDF</span>
                          </button>
                          <button
                            onClick={() => handleDeleteFromDataInduk(item.noPendaftaran, item.namaLengkap)}
                            title="Hapus dari Data Induk"
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 4. MODAL AUTO-GENERATE NIS                                            */}
      {/* ===================================================================== */}
      {showNisModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-600 text-white shadow-sm">
                <Hash className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Auto-Generate Nomor Induk Murid (NIS)
                </h3>
                <p className="text-xs text-slate-500">
                  Menghasilkan NIS berurutan otomatis, dikelompokkan Jenis Kelamin dan Abjad Nama (A - Z)
                </p>
              </div>
            </div>

            <div className="space-y-4 text-xs font-medium text-slate-700">
              <div>
                <label className="block text-slate-600 font-bold mb-1">
                  Prefix / Kode Tahun Angkatan (Contoh: 2728 untuk 2027/2028):
                </label>
                <input
                  type="text"
                  value={nisPrefix}
                  onChange={(e) => setNisPrefix(e.target.value)}
                  placeholder="2728"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">
                  Nomor Urut Awal:
                </label>
                <input
                  type="number"
                  value={nisStartNum}
                  onChange={(e) => setNisStartNum(Number(e.target.value))}
                  min={1}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-[11px] space-y-1.5">
                <div>
                  <strong>Aturan Pengurutan:</strong> Nomor NIS diurutkan berdasarkan kelompok <strong>Jenis Kelamin</strong> (Laki-laki dahulu, lalu Perempuan), kemudian menurut <strong>Abjad Nama Murid (A - Z)</strong>. Posisi baris database tidak diubah.
                </div>
                <div>
                  <strong>Contoh Hasil:</strong> Murid dengan prioritas pertama mendapat NIS: <span className="font-mono font-black text-indigo-700">{nisPrefix}{String(nisStartNum).padStart(3, '0')}</span>, murid kedua: <span className="font-mono font-black text-indigo-700">{nisPrefix}{String(nisStartNum + 1).padStart(3, '0')}</span>, dst.
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowNisModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleExecuteAutoGenerateNis}
                disabled={saving}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow transition cursor-pointer disabled:opacity-50"
              >
                {saving ? 'Memproses...' : 'Terapkan NIS Sekarang'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 5. MODAL CETAK LEMBAR BUKU INDUK SISWA                                */}
      {/* ===================================================================== */}
      {selectedPrintItem && (
        <BukuIndukPrintView
          data={selectedPrintItem}
          onClose={() => setSelectedPrintItem(null)}
        />
      )}

    </div>
  );
};
