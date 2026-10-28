export type UserRole = 'public' | 'siswa' | 'guru' | 'admin' | 'pengawas' | 'wawancara-otm' | 'observasi-siswa';

/**
 * Menghitung Tahun Pelajaran SPMB secara resmi.
 * Tahun Pelajaran aktif saat ini: "2027/2028"
 */
export const getAcademicYear = (): string => {
  return '2027/2028';
};

export interface DataSiswa {
  id: string;
  noPendaftaran: string;
  jalurPendaftaran?: string;
  nis?: string; // Nomor Induk Siswa (NIS) Sekolah
  nik?: string; // NIK dari KK
  createdAt: string;
  updatedAt?: string;

  // --- SEKSI 1: DATA PERSONAL SISWA (Nomor 1 - 23) ---
  namaLengkap: string; // 1. Nama Lengkap Siswa *
  namaPanggilan: string; // 2. Nama Panggilan Siswa *
  nisn: string; // 3. Nomor Induk Siswa Nasional (NISN) *
  jenisKelamin: 'Laki-laki' | 'Perempuan'; // 4. Jenis Kelamin *
  tempatLahir: string; // 5. Tempat Lahir *
  tanggalLahir: string; // 6. Tanggal Lahir *
  agama: 'Islam' | 'Katolik' | 'Protestan' | 'Hindu' | 'Budha' | 'Konghucu' | 'Kepercayaan'; // 7. Agama *
  kewarganegaraan: 'Indonesia' | 'Asing'; // 8. Kewarganegaraan *
  anakNomorKe: number | string; // 9. Anak nomor ke *
  jumlahSaudaraKandung: number | string; // 10. Jumlah Saudara Kandung *
  jumlahSaudaraTiri: number | string; // 11. Jumlah Saudara Tiri *
  jumlahSaudaraAngkat: number | string; // 12. Jumlah Saudara Angkat *
  bahasaSehariHari: string; // 13. Bahasa Sehari-hari *
  alamat: string; // 14. Alamat Tempat Tinggal *
  kelurahan: string; // 15. Kelurahan *
  kecamatan: string; // 16. Kecamatan *
  kotaKabupaten: string; // 17. Kota/Kabupaten *
  nomorTelepon: string; // 18. Nomor Telepon *
  nomorHandphone: string; // 19. Nomor Handphone *
  bertempatTinggalPada: 'Orang Tua' | 'Wali'; // 20. Bertempat Tinggal Pada *
  jarakKeSekolahKm: string | number; // 21. Jarak Tempat Tinggal ke Sekolah (km) *
  saranaBerangkatSekolah: 'Jalan kaki' | 'Sepeda' | 'Motor' | 'Mobil' | 'Jemputan' | 'Yang lain'; // 22. Sarana Berangkat ke Sekolah *
  beratBadanKg: string | number; // 23. Berat Badan (kg) *

  // --- SEKSI 2: DATA KESEHATAN SISWA (Nomor 24 - 27) ---
  tinggiBadanCm: string | number; // 24. Tinggi Badan (cm) *
  golonganDarah: 'A' | 'B' | 'O' | 'AB' | string; // 25. Golongan Darah *
  penyakitBerat: string; // 26. Penyakit berat yang pernah diderita * (ketik "-" jika tidak ada)
  kelainanJasmani: string; // 27. Kelainan Jasmani * (ketik "-" jika tidak ada)

  // --- SEKSI 3: DATA ASAL SEKOLAH SISWA (Nomor 28 - 30) ---
  masukSebagai: 'Siswa Baru' | 'Siswa Pindahan Kelas 7' | 'Siswa Pindahan Kelas 8' | 'Siswa Pindahan Kelas 9'; // 28. Masuk sekolah ini sebagai *
  asalSekolah: string; // 29. Asal Sekolah *
  nomorIjazah?: string; // 30. Nomor Ijazah (jika belum keluar, ketik "-")

  // --- SEKSI 4: DATA KEGEMARAN SISWA (Nomor 31 - 33) ---
  kegemaranKesenian: string; // 31. Kesenian *
  kegemaranOlahraga: string; // 32. Olahraga *
  kegemaranOrganisasi: string; // 33. Kemasyarakatan/Organisasi *

  // --- SEKSI 5: DATA PRESTASI SISWA (Nomor 34 - 35) ---
  menerimaBeasiswa: string; // 34. Menerima Beasiswa *
  memenangkanKejuaraan: string; // 35. Memenangkan Kejuaraan *

  // --- SEKSI 6: DATA ORANG TUA / WALI SISWA (Nomor 36 - 67) ---
  // 1. DATA AYAH (Nomor 36 - 46)
  namaAyah: string; // 36. Nama Lengkap Ayah *
  tempatTanggalLahirAyah: string; // 37. Tempat dan Tanggal Lahir Ayah *
  agamaAyah: string; // 38. Agama Ayah *
  kewarganegaraanAyah: 'Indonesia' | 'Asing'; // 39. Kewarganegaraan Ayah *
  pendidikanAyah: 'SD' | 'SMP' | 'SMA/SMK' | 'S1' | 'S2' | 'S3' | string; // 40. Pendidikan Terakhir Ayah *
  pekerjaanAyah: string; // 41. Pekerjaan Ayah *
  penghasilanAyah: 'dibawah Rp. 5jt' | 'Rp. 5jt - Rp. 10jt' | 'Rp. 10jt - Rp. 15jt' | 'diatas 15jt' | string; // 42. Penghasilan Ayah *
  alamatAyah: string; // 43. Alamat Rumah Ayah *
  noHpAyah: string; // 44. Nomor Telepon / HP Ayah *
  emailAyah: string; // 45. E-mail Ayah *
  statusPerkawinanAyah: 'Cerai Hidup' | 'Cerai Meninggal' | 'Suami' | string; // 46. Status Perkawinan dengan Ibu Siswa *

  // 2. DATA IBU (Nomor 47 - 57)
  namaIbu: string; // 47. Nama Lengkap Ibu *
  tempatTanggalLahirIbu: string; // 48. Tempat dan Tanggal Lahir Ibu *
  agamaIbu: string; // 49. Agama Ibu *
  kewarganegaraanIbu: 'Indonesia' | 'Asing'; // 50. Kewarganegaraan Ibu *
  pendidikanIbu: 'SD' | 'SMP' | 'SMA/SMK' | 'S1' | 'S2' | 'S3' | string; // 51. Pendidikan Terakhir Ibu *
  pekerjaanIbu: string; // 52. Pekerjaan Ibu *
  penghasilanIbu: 'dibawah Rp. 5jt' | 'Rp. 5jt - Rp. 10jt' | 'Rp. 10jt - Rp. 15jt' | 'diatas 15jt' | string; // 53. Penghasilan Ibu *
  alamatIbu: string; // 54. Alamat Rumah Ibu *
  noHpIbu: string; // 55. Nomor Telepon / HP Ibu *
  emailIbu: string; // 56. Email Ibu *
  statusPerkawinanIbu: 'Cerai Hidup' | 'Cerai Meninggal' | 'Istri' | string; // 57. Status Perkawinan dengan Ayah Siswa *

  // 3. DATA WALI (Nomor 58 - 67, Opsional jika tinggal dengan Wali)
  namaWali?: string; // 58. Nama Lengkap Wali
  tempatTanggalLahirWali?: string; // 59. Tempat dan Tanggal Lahir Wali
  agamaWali?: string; // 60. Agama Wali
  kewarganegaraanWali?: string; // 61. Kewarganegaraan Wali
  pendidikanWali?: string; // 62. Pendidikan Wali
  pekerjaanWali?: string; // 63. Pekerjaan Wali
  penghasilanWali?: string; // 63b. Penghasilan Wali
  alamatWali?: string; // 64. Alamat Rumah Wali
  noHpWali?: string; // 65. Nomor Telepon/ HP Wali
  emailWali?: string; // 66. Email Wali
  statusHubunganWali?: string; // 67. Status Hubungan dengan siswa

  // Backward compatibility aliases
  anakKe?: number;
  jumlahSaudara?: number;
  rtRw?: string;
  riwayatPenyakit?: string;
  prestasi?: string;
}

// 34 Pertanyaan Lengkap Form Isian Orang Tua (PDF Lampiran)
export interface FormWawancaraOrtuPDF {
  noPendaftaran: string;
  namaSiswa: string;
  namaPanggilan: string;
  asalSekolah: string;
  namaAyah: string;
  namaIbu: string;

  // C. Materi Wawancara (34 Butir)
  q1_kesiapanBiaya: string; // Opsi: Siap membayar LUNAS... / Siap membayar DP 7.500.000...
  q2_pekerjaanAyah: string;
  q3_pekerjaanBunda: string;
  q4_penghasilanAyah: string; // di bawah 5jt / 5-10jt / 10-15jt / di atas 15jt
  q5_penghasilanBunda: string;
  q6_pendampingBelajar: string[]; // Ayah, Bunda, Guru Privat, Yang lain
  q7_sholat5Waktu: string; // Selalu, Sering, Kadang - kadang, Tidak Pernah
  q8_pengasuhPulangSekolah: string[]; // Ayah, Bunda, Keluarga lain, ART, Yang lain
  q9_kegiatanNonFormal: string[]; // Kursus/les luar rumah, Pendidikan Al-Qur'an, Privat di rumah, Yang lain
  q10_riwayatPenyakit: string;
  q11_prestasi: string;
  q12_sifatPositif: string;
  q13_sifatNegatif: string;
  q14_sikapTerhadapOrtu: string;
  q15_pernahMelawanOrtu: string; // Selalu, Sering, Jarang, Tidak pernah
  q16_halBerkesan: string;
  q17_ayahMerokok: 'Ya' | 'Tidak';
  q18_bundaMerokok: 'Ya' | 'Tidak';
  q19_keluargaLainMerokok: string; // Tidak ada / sebutkan
  q20_durasiBersamaAnak: string; // Hanya waktu efektif
  q21_kegiatanBersamaDiRumah: string;
  q22_traumaBullying: string; // Tidak ada / sebutkan
  q23_anakPernahMerokok: string; // Tidak pernah / sebutkan
  q24_pendapatRokokPornografi: string;
  q25_fasilitasGadget: string; // Tidak / sebutkan
  q26_frekuensiGadget: string; // Setiap hari, Seminggu sekali, Waktu libur, Tidak pernah, Yang lain
  q27_bersediaAwasiGadget: string; // Tidak / Yang lain (sejak kapan)
  q28_installAplikasiBelajarAnak: string; // Ya / sebutkan alasan
  q29_installAplikasiPengawasanOrtu: string; // Ya / sebutkan alasan
  q30_jarakKeSekolah: string; // 0 - 5 km / di atas 5km
  q31_kendaraanSekolah: string; // Sepeda, Motor, Mobil, Yang lain
  q32_izinBawaMotorSendiri: string; // Tidak / sebutkan alasan
  q33_harapanSekolah: string;
  q34_ttdMeterai: 'Ya' | 'Tidak';
  pernyataanSetuju: boolean;
  updatedAt: string;
}

// Model Jawaban Observasi Orang Tua per butir (sesuai index.html)
export interface WawancaraOrtuAnswerItem {
  id?: string;
  isHeader?: boolean;
  question: string;
  refAnswer?: string; // Data Awal / Jawaban Ortu (Ref)
  newAnswer: string;  // Input Wawancara / Catatan Pewawancara
}

// Hasil Observasi Wawancara Orang Tua (Khusus Tim Pewawancara Ortu)
export interface HasilObservasiOrtuData {
  id: string;
  idSiswa: string;
  noPendaftaran: string;
  namaSiswa: string;
  namaPanggilan: string;
  sekolahAsal: string;
  namaAyah: string;
  namaIbu: string;
  namaPewawancara: string;
  tanggalWawancara: string;
  jsonAnswers: WawancaraOrtuAnswerItem[];
  catatanKhusus: string;
  ttdOrtuBase64?: string;
  ttdPewawancaraBase64?: string;
  pdfUrl?: string;
  status?: 'draft' | 'menunggu_ttd_ortu' | 'selesai';
  isTtdOrtuSigned?: boolean;
  createdAt: string;
  updatedAt?: string;
}

// Lembar Observasi Siswa (Terpisah - Khusus Tim Penguji Siswa)
export interface ObservasiSiswaData {
  id: string;
  siswaId: string;
  noPendaftaran: string;
  namaSiswa: string;
  namaPenguji: string;
  tanggalObservasi: string;
  ttdPengujiBase64?: string;

  // Rubrik Observasi Siswa
  nilaiTahsin: number;
  catatanTahsin: string;

  nilaiTahfidz: number;
  juzDiuji: string;
  catatanTahfidz: string;

  nilaiKarakterAdab: number;
  catatanKarakterAdab: string;

  nilaiAkademikDasar: number;
  catatanAkademikDasar: string;

  // 5. Psikotes & Kematangan Belajar
  nilaiPsikotes?: number;
  catatanPsikotes?: string;

  totalSkor: number;
  rataRata: number;
  rekomendasi: 'Diterima' | 'Cadangan' | 'Tidak Diterima';
  catatanPenguji: string;

  // Integrasi Batas Maksimal Tanggal Daftar Ulang ke Lembar Hasil Kelulusan Murid
  tanggalMaksimalDaftarUlang?: string;
  nisn?: string;
  asalSekolah?: string;

  // Integrasi Rincian Daftar Ulang (Rujukan Kategori) dari Sheet Pembiayaan
  kategoriPembiayaan?: string;
  rincianBiaya?: PembiayaanCategory;

  // Optional compat fields
  namaPewawancara?: string;
  nilaiWawancaraOrtu?: number;
  catatanWawancaraOrtu?: string;
  catatanUmum?: string;

  pdfUrl?: string;
  createdAt: string;
}

// Model Tabel Database Sheet "Pembiayaan" (16 Kolom Resmi)
export interface PembiayaanCategory {
  kategori: string;          // 1. Kategori
  ring: string;              // 2. Ring
  gelombang: string;         // 3. Gelombang
  gedung: number;            // 4. Gedung
  bpp: number;               // 5. BPP
  seragam: number;           // 6. Seragam
  subtotalI: number;         // 7. Subtotal I (Gedung + BPP + Seragam)
  buku: number;              // 8. Buku
  outingPerkemahan: number;  // 9. Outing Perkemahan
  kbm: number;               // 10. KBM
  komite: number;            // 11. Komite
  osis: number;              // 12. OSIS
  subtotalII: number;        // 13. Subtotal II (Buku + Outing + KBM + Komite + OSIS)
  spp: number;               // 14. SPP
  totalBiaya: number;        // 15. Total Biaya (Subtotal I + Subtotal II + SPP)
  catatan: string;           // 16. Catatan
}

// Asesmen Mandiri Siswa (Calon Siswa)
export interface WawancaraSiswaData {
  id: string;
  siswaId: string;
  noPendaftaran: string;
  namaLengkap: string;
  kebiasaanSholat: 'Selalu Berjamaah di Masjid' | 'Tepat Waktu Mandiri' | 'Kadang Perlu Diingatkan' | 'Sering Terlambat';
  kemampuanMembacaQuran: 'Belum Lancar' | 'Cukup Lancar' | 'Lancar Ber-Tajwid' | 'Sangat Fasih & Tartil';
  jumlahJuzHafalan: 'Belum Ada' | 'Juz 30 (Sebagian)' | 'Juz 30 (Lengkap)' | 'Juz 29 - 30 (2 Juz)' | '3 - 5 Juz' | '> 5 Juz';
  suratFavorit: string;
  motivasiMasukSMPIT: string;
  minatBakat: string[];
  citaCita: string;
  kegiatanWaktuLuang: string;
  updatedAt: string;
}

export type ObservasiGuruData = ObservasiSiswaData;

export interface StatusKelulusanInfo {
  noPendaftaran: string;
  nisn: string;
  namaLengkap: string;
  asalSekolah: string;
  jalur: string;
  status: 'LULUS' | 'CADANGAN' | 'TIDAK_LULUS' | 'PROSES_SELEKSI';
  pesanPengumuman: string;
  jadwalDaftarUlang?: string;
  skorAkhir?: number;
  kategoriPembiayaan?: string;
  rincianBiaya?: PembiayaanCategory;
  updatedAt?: string;
  statusKirimPesan?: string;
  statusCekSeleksi?: string;
  statusUnduhSkhs?: string;
}

export interface DataIndukSiswa {
  id: string; // ID Buku Induk
  noUrut?: number; // No Urut Buku Induk
  nis: string; // Nomor Induk Siswa Sekolah (NIS / NISS) diberikan oleh Admin/Guru/Pengawas
  nisn: string; // Nomor Induk Siswa Nasional
  nik: string; // NIK Siswa
  noPendaftaran: string; // No Pendaftaran SPMB
  namaLengkap: string;
  namaPanggilan: string;
  jenisKelamin: 'Laki-laki' | 'Perempuan' | string;
  tempatLahir: string;
  tanggalLahir: string;
  agama: string;
  kewarganegaraan: string;
  anakNomorKe: number | string;
  jumlahSaudaraKandung: number | string;
  jumlahSaudaraTiri: number | string;
  jumlahSaudaraAngkat: number | string;
  bahasaSehariHari: string;
  beratBadanKg: string | number;
  tinggiBadanCm: string | number;
  golonganDarah: string;
  penyakitBerat: string;
  kelainanJasmani: string;
  alamat: string;
  kelurahan: string;
  kecamatan: string;
  kotaKabupaten: string;
  nomorTelepon: string;
  nomorHandphone: string;
  bertempatTinggalPada: string;
  jarakKeSekolahKm: string | number;
  saranaBerangkatSekolah: string;
  masukSebagai: string;
  asalSekolah: string;
  nomorIjazah: string;
  kegemaranKesenian: string;
  kegemaranOlahraga: string;
  kegemaranOrganisasi: string;
  menerimaBeasiswa: string;
  memenangkanKejuaraan: string;
  namaAyah: string;
  tempatTanggalLahirAyah: string;
  agamaAyah: string;
  pendidikanAyah: string;
  pekerjaanAyah: string;
  penghasilanAyah: string;
  alamatAyah: string;
  noHpAyah: string;
  emailAyah: string;
  statusPerkawinanAyah?: string;
  namaIbu: string;
  tempatTanggalLahirIbu: string;
  agamaIbu: string;
  pendidikanIbu: string;
  pekerjaanIbu: string;
  penghasilanIbu: string;
  alamatIbu: string;
  noHpIbu: string;
  emailIbu: string;
  statusPerkawinanIbu?: string;
  namaWali?: string;
  tempatTanggalLahirWali?: string;
  agamaWali?: string;
  pendidikanWali?: string;
  pekerjaanWali?: string;
  penghasilanWali?: string;
  alamatWali?: string;
  noHpWali?: string;
  statusHubunganWali?: string;
  statusKelulusan: string;
  tahunPelajaran: string;
  tanggalDiterima: string;
  catatanKhusus?: string;
  updatedAt?: string;
}

export interface UserAccount {
  id: string;
  kodePendaftaran: string; // Kode siswa, kode pewawancara, atau kode admin untuk login
  namaSiswa: string; // Nama Siswa, Nama Pewawancara, atau Nama Admin
  namaOrangTua: string;
  sekolahAsal: string;
  nomorHp: string;
  emailOrangTua: string;
  createdAt: string;
  role: 'siswa' | 'guru' | 'admin' | 'pengawas';
  jabatan?: string;
}

export interface MuridPengumumanWaItem {
  noPendaftaran: string;
  namaLengkap: string;
  namaPanggilan: string;
  nisn: string;
  asalSekolah: string;
  status?: string;
  skorAkhir?: number;
  jadwalDaftarUlang?: string;
  kategoriPembiayaan?: string;
  // Nomor HP acuan pendaftaran user pertama kali (Sheet Users / Akun_User)
  nomorHpAkun: string;
  namaAkunOrtu: string;
  emailAkun: string;
  hasUserAccount: boolean;
  // Log pengiriman WA & deteksi aktivitas orang tua
  isWaSent: boolean;
  waSentAt?: string;
  waSentBy?: string;
  isCekSeleksi?: boolean;
  cekSeleksiAt?: string;
  isUnduhSkhs?: boolean;
  unduhSkhsAt?: string;
}

export type MuridLulusWaItem = MuridPengumumanWaItem;


