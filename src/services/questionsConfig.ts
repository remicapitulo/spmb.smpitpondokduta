// Konfigurasi Pertanyaan Wawancara Orang Tua sesuai file index.html dan form isian orang tua.pdf
export interface QuestionConfigItem {
  id: string;
  type?: 'header' | 'question';
  text: string;
  refId: number | null;
}

export const QUESTIONS_CONFIG: QuestionConfigItem[] = [
  { id: 'i1', text: 'Dari mana mendapatkan informasi tentang sekolah?', refId: null },

  { type: 'header', id: 'h_a', text: 'A. KOMITMEN PEMBIAYAAN', refId: null },
  { id: 'q1', text: '1. Kesiapan pembiayaan (SPP, Uang Kegiatan Tahunan, Uang Kegiatan Khusus Kelas 9, Buku, dll) sesuai brosur?', refId: 10 },
  { id: 'q2', text: '2. Apa pekerjaan Ayah / Wali?', refId: 11 }, 
  { id: 'q3', text: '3. Apa pekerjaan Bunda / Wali?', refId: 12 }, 
  { id: 'q4', text: '4. Penghasilan Ayah / Wali per bulan?', refId: 13 },
  { id: 'q5', text: '5. Penghasilan Bunda / Wali per bulan?', refId: 14 },
  
  { type: 'header', id: 'h_b', text: 'B. KEBIASAAN & LATAR BELAKANG', refId: null },
  { id: 'q6', text: '1. Siapa yang mendampingi ananda belajar?', refId: 15 },
  { id: 'q7', text: '2. Apakah membiasakan sholat 5 waktu?', refId: 16 },
  { id: 'q8', text: '3. Siapa mengasuh ananda sepulang sekolah?', refId: 17 },
  { id: 'q9', text: '4. Kegiatan ananda selain sekolah formal?', refId: 18 },
  { id: 'q10', text: '5. Penyakit yang pernah/sedang diderita?', refId: 19 },
  { id: 'q11', text: '6. Prestasi yang pernah diraih?', refId: 20 },
  { id: 'q12', text: '7. Sifat positif ananda?', refId: 21 },
  { id: 'q13', text: '8. Sifat negatif ananda?', refId: 22 },
  { id: 'q14', text: '9. Sikap ananda terhadap orang tua?', refId: 23 },
  { id: 'q15', text: '10. Apakah ananda pernah melawan orang tua?', refId: 24 },
  { id: 'q16', text: '11. Hal yang membuat orang tua berkesan terhadap ananda?', refId: 25 },

  { type: 'header', id: 'h_c', text: 'C. LINGKUNGAN KELUARGA', refId: null },
  { id: 'q17', text: '1. Apakah Ayah merokok?', refId: 26 },
  { id: 'q18', text: '2. Apakah Bunda merokok?', refId: 27 },
  { id: 'q19', text: '3. Apakah ada keluarga lain merokok di rumah?', refId: 28 },
  { id: 'q20', text: '4. Berapa lama orang tua bersama ananda di rumah? (waktu efektif, jam tidur dan sekolah tidak di hitung)?', refId: 29 },
  { id: 'q21', text: '5. Kegiatan yang biasa dilakukan bersama ananda ketika Ayah/Bunda berada di rumah?', refId: 30 },
  { id: 'q22', text: '6. Apakah pernah mengalami trauma/korban bullying/perundungan?', refId: 31 },
  { id: 'q23', text: '7. Apakah ananda pernah merokok?', refId: 32 },
  { id: 'q24', text: '8. Bagaimana pendapat Ayah/Bunda tentang rokok, pornografi, dan kenakalan remaja?', refId: 33 },  
  
  { type: 'header', id: 'h_d', text: 'D. PENGGUNAAN GADGET', refId: null },
  { id: 'q25', text: '1. Fasilitas Gadget untuk ananda?', refId: 34 },
  { id: 'q26', text: '2. Seberapa sering menggunakan gadget?', refId: 35 },
  { id: 'q27', text: '3. Bersediakah Ayah/Bunda mengawasi penggunaan gadget Ananda di rumah? Jika YA. Sejak kapan?', refId: 36 },
  { id: 'q28', text: '4. Bersediakah menginstall aplikasi pembelajaran?', refId: 37 },
  { id: 'q29', text: '5. Bersediakah Ayah/Bunda meng-Install Aplikasi Pengawasan Pembelajaran Ananda pada Handphone Ayah/Bunda? Jika TIDAK. Apa alasannya?', refId: 38 },
  { id: 'q30', text: '6. Jarak tempuh rumah ke sekolah?', refId: 39 },
  { id: 'q31', text: '7. Apa kendaraan yang digunakan untuk mengantar ananda ke sekolah?', refId: 40 },
  { id: 'q32', text: '8. Apakah Ayah/Bunda mengizinkan ananda membawa motor sendiri? Jika MENGIZINKAN. Apa alasannya?', refId: 41 },
  { id: 'q33', text: '9. Apa harapan Ayah/Bunda menyekolahkan ananda di sekolah ini?', refId: 42 },

  { type: 'header', id: 'h_e', text: 'E. SIMULASI PERATURAN SEKOLAH', refId: null },
  { id: 'i2', text: '1. Masalah bangun pagi, Keterlambatan dan Pemakaian seragam. Tanggapan Orang Tua?', refId: null },
  { id: 'i3', text: '2. Aturan rambut rapi (Cukur 3x teguran) untuk anak laki-laki atau Make-up untuk anak perempuan. Tanggapan Orang Tua?', refId: null },
  { id: 'i4', text: '3. Konsekuensi tidak mengerjakan tugas/PR?. Tanggapan Orang Tua?', refId: null },
  { id: 'i5', text: '4. Aturan penggunaan HP dan Larangan membawa barang-barang yang tidak ada hubungan dengan pembelajaran?. Tanggapan Orang Tua?', refId: null },
  { 
    id: 'i9', 
    text: '5. Pandangan tentang Pacaran:\n• Bagaimana pandangan Ayah/Bunda tentang pacaran di kalangan remaja?\n• Jika anak melanggar aturan sekolah terkait pacaran, teguran seperti apa yang menurut ayah/bunda masih dalam batas wajar?', 
    refId: null 
  },
  { 
    id: 'i10', 
    text: '6. Pandangan tentang Komunikasi Guru dan Orang Tua:\n• Jika anak mendengar pembicaraan guru dalam forum rapat atau diskusi tentang dirinya terkait perkembangan belajar kelebihan dan kekurangan lalu menceritakannya di rumah, bagaimana Ayah/Bunda menyikapinya?\n• Bagaimana Ayah/Bunda membangun komunikasi dengan pihak sekolah dalam situasi tersebut?', 
    refId: null 
  },

  { type: 'header', id: 'h_f', text: 'F. INFORMASI LAINNYA', refId: null },
  { id: 'i6', text: '1. Informasi Ekskul. WAJIB: Biotek, Public Speaking dan Pramuka. PILIHAN: Futsal, Taekwondo, Bulu Tangkis, Basket, Cooking Class, Desain Grafis, Tari Tradisional, Panahan, Pencak Silat dan Melukis', refId: null },
  { id: 'i7', text: '2. Penjelasan Duta Camp & Field Trip. Area cangkupan: Jakarta, Jawa Barat, Jawa Tengah, dan Jawa Timur. Tanggapan Orang Tua?', refId: null },
  { id: 'i8', text: '3. Penjelasan WIFI sekolah yang digunakan hanya untuk pembelajaran harian, sedangkan untuk UTS/UAS/UKK/US wajib mengisi kuota masing-masing.', refId: null },

  { type: 'header', id: 'h_g', text: 'G. PERNYATAAN ORANG TUA', refId: null },
  { id: 'q34', text: 'Apakah Ayah/Bunda bersedia menandatangani surat pernyataan di atas meterai 10.000 ?', refId: 43 },
  { id: 'q35', text: 'Pernyataan saya di atas adalah benar apa adanya tanpa rekayasa apapun. Saya bersedia mempertanggungjawabkannya dan setuju mengirimkan data ini sebagai hasil wawancara di SMPIT Pondok Duta', refId: 44 },
  
  { id: 'catatan', text: 'CATATAN KHUSUS / KESIMPULAN AKHIR', refId: null }
];

export const DAFTAR_PEWAWANCARA_LIST: string[] = [
  'Ustadz Salman Al-Farisi, Lc., M.Pd.',
  'Ustadz H. Ahmad Dahlan, S.Pd.I',
  'Ustadzah Siti Maryam, S.Pd.',
  'Ustadz Muhammad Fauzan, Lc.',
  'Ustadz Ridwan Kamil, S.Th.I',
  'Ustadzah Nurul Hidayati, S.Pd.I',
  'Ustadz Arif Rahman Hakim, M.Pd.',
  'Ustadzah Khadijah Azzahra, S.Sos.',
  'Ustadz Dedi Supriyadi, S.Ag.',
  'Ustadzah Fitriani Rahmawati, S.Pd.',
  'Ustadz Irfan Maulana, M.Pd.',
  'Ustadzah Zahra Amalia, S.Pd.'
];

export const DAFTAR_PENGUJI_SISWA_LIST: string[] = [
  'Ustadz H. Ahmad Dahlan, S.Pd.I',
  'Ustadz Salman Al-Farisi, Lc., M.Pd.',
  'Ustadzah Siti Maryam, S.Pd.',
  'Ustadz Muhammad Fauzan, Lc.',
  'Ustadz Arif Rahman Hakim, M.Pd.',
  'Ustadzah Fitriani Rahmawati, S.Pd.',
  'Ustadz Dedi Supriyadi, S.Ag.',
  'Ustadz Abdul Hakim, S.Pd.I',
  'Ustadzah Khadijah Azzahra, S.Sos.',
  'Ustadz Farhan Mubarok, Lc.'
];
