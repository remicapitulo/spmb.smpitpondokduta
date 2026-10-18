# SPMB SMPIT Pondok Duta - Progressive Web App (PWA)

Website & PWA Resmi **Sistem Penerimaan Murid Baru (SPMB) SMPIT PONDOK DUTA Cimanggis Depok** Tahun Pelajaran 2027/2028.

Aplikasi ini dirancang dengan arsitektur modern berbasis **React + TypeScript + Tailwind CSS**, didukung **Progressive Web App (PWA)** untuk instalasi di Desktop, Android, iOS, dan Tablet dengan kemampuan offline caching, serta terintegrasi langsung dengan **Google Sheets** dan **Google Apps Script (GAS) API** sebagai backend serverless & PDF generator ke Google Drive.

---

## 🚀 Fitur Utama

### 1. Halaman Publik (Tanpa Login)
- **Beranda (Home)**: Profil sekolah, visi-misi generasi Qur'ani, program unggulan (Tahfidz, Sains, Bilingual, Adab), jadwal SPMB, dan tombol pasang PWA.
- **Syarat Pendaftaran**: Kriteria usia, persyaratan administratif, dan *interactive checklist* berkas fisik & digital.
- **Alur Pendaftaran**: Infografis interaktif langkah pendaftaran dari registrasi hingga daftar ulang.
- **Cek Status Kelulusan**: Pencarian cepat nomor registrasi/NISN dengan animasi selebrasi, rincian evaluasi, dan cetak Surat Keterangan Lulus (SKL) resmi.

### 2. Portal Calon Siswa / Orang Tua Murid (OTM)
- **Formulir Data Siswa (Sesuai Form Isian Data Siswa)**: Pengisian lengkap 67 parameter mencakup Biodata Personal, Kesehatan/Jasmani, Asal Sekolah, Prestasi & Beasiswa, Data Ayah Kandung, Data Ibu Kandung, dan Data Wali.
- **Formulir Wawancara Mandiri Siswa**: Form isian awal/asesmen mandiri calon siswa mencakup kebiasaan ibadah sholat 5 waktu, kemampuan tahsin & tajwid, capaian hafalan juz Qur'an, surat favorit, serta motivasi masuk SMPIT.
- **Formulir Wawancara Orang Tua (34 Butir Lengkap)**: Form kuesioner mendalam 34 pertanyaan yang diisi mandiri oleh Orang Tua (kesiapan komitmen finansial/SPP, pekerjaan & penghasilan, pendamping belajar, rutinitas sholat, riwayat penyakit/kebiasaan ananda, pengawasan gadget, harapan pendidikan, hingga persetujuan meterai).
- **Cetak Kartu Ujian/Wawancara**: Generasi kartu peserta otomatis setelah melengkapi data dengan pas foto placeholder, QR verifikasi, jadwal dan ruang observasi, serta tata tertib.

### 3. Portal Guru / Pewawancara (Internal) - Terpisah Berdasarkan Tim Penguji
- **Tim 1: Pewawancara Orang Tua (OTM) - Terintegrasi index.html & Code.gs**:
  - Dropdown pencarian nama/data siswa yang ditarik secara dinamis dari Google Sheet `"OTM"`.
  - Panel pembanding jawaban referensi (Ref) yang diisi orang tua versus kolom catatan pewawancara.
  - Peringatan (*Alert*) otomatis jika siswa sudah pernah diwawancarai sebelumnya beserta tombol langsung ke berkas PDF di Google Drive.
  - Fitur simpan yang memicu pembuatan file PDF resmi di Google Drive dan URL-nya tersimpan di sheet `"Hasil_Wawancara"`.
- **Tim 2: Penguji Observasi Siswa (Terpisah)**:
  - Form khusus tim penguji santri baru terpisah dari tim wawancara orang tua.
  - Rubrik pengujian: Tahsin & Tajwid Al-Qur'an, Tahfidz (Hafalan juz diuji), Karakter Adab & Kemandirian, serta Potensi Belajar/Akademik Dasar.
  - Perhitungan skor total & rata-rata otomatis, rekomendasi kelulusan (Diterima / Cadangan / Tidak Diterima), dan penyimpanan mandiri ke sheet `"Observasi_Siswa"`.

---

## 🛠️ Panduan Integrasi Google Apps Script (GAS)

1. Buat Google Spreadsheet baru di [Google Sheets](https://sheets.new).
2. Masuk ke menu **Ekstensi > Apps Script**.
3. Buka file `Code.gs` di repository ini, salin seluruh kodenya dan tempel ke editor Apps Script.
4. Pilih fungsi `setupSheets` di menu bar atas, lalu klik **Jalankan** untuk membuat sheet `Siswa`, `OTM`, dan `Hasil_Wawancara` otomatis.
5. Klik **Terapkan (Deploy)** > **Penerapan Baru (New Deployment)**:
   - Jenis: **Aplikasi Web (Web App)**
   - Jalankan sebagai: **Saya (Me)**
   - Siapa yang memiliki akses: **Siapa saja (Anyone)**
6. Salin URL Aplikasi Web yang berakhiran `/exec`.
7. Masuk ke website SPMB, buka menu **GAS API Config**, lalu tempelkan URL tersebut dan klik **Simpan URL**.

---

## 🌐 Panduan Deployment ke Netlify via GitHub

1. Push repository ini ke GitHub:
   ```bash
   git init
   git add .
   git commit -m "feat: initial commit SPMB SMPIT Pondok Duta PWA"
   git branch -M main
   git remote add origin https://github.com/<username>/spmb-smpit-pondok-duta.git
   git push -u origin main
   ```
2. Buka [Netlify](https://app.netlify.com) dan hubungkan akun GitHub Anda.
3. Pilih repository `spmb-smpit-pondok-duta`.
4. Konfigurasi build:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
5. Klik **Deploy Site**. File `public/_redirects` sudah disertakan untuk mendukung SPA routing.

---

## 📱 Instalasi Progressive Web App (PWA)

Aplikasi ini dapat di-install secara langsung tanpa AppStore/PlayStore:
- **Google Chrome Desktop / Android**: Klik tombol "Install Aplikasi SPMB" di navbar atau banner beranda.
- **iOS Safari (iPhone/iPad)**: Ketuk tombol **Share** di browser Safari > gulir ke bawah > pilih **Tambahkan ke Layar Utama (Add to Home Screen)**.
