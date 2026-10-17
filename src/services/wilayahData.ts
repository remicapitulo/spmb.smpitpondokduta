// Data Referensi Wilayah Resmi Pemerintah (Kota Depok, DKI Jakarta, Bogor) & Daftar Sekolah Asal

export interface KecamatanInfo {
  nama: string;
  kelurahan: string[];
}

export interface KotaInfo {
  nama: string;
  kecamatan: KecamatanInfo[];
}

export const DAFTAR_SEKOLAH_ASAL = [
  'SDIT Pondok Duta',
  'SDIT Raflesia',
  'SDIT Al Hikmah',
  'SDIT Nurul Fikri',
  'SD Semut Semut The Natural School',
  'SDN Tugu 10',
];

export const DATA_WILAYAH_RUJUKAN: KotaInfo[] = [
  {
    nama: 'Kota Depok',
    kecamatan: [
      {
        nama: 'Cimanggis',
        kelurahan: ['Tugu', 'Pasir Gunung Selatan', 'Harjamukti', 'Cisalak Pasar', 'Mekarsari', 'Curug']
      },
      {
        nama: 'Sukmajaya',
        kelurahan: ['Bakti Jaya', 'Abadijaya', 'Cisalak', 'Sukmajaya', 'Mekar Jaya', 'Tirtajaya']
      },
      {
        nama: 'Cilodong',
        kelurahan: ['Cilodong', 'Jatimulya', 'Kalibaru', 'Kalimulya', 'Sukamaju']
      },
      {
        nama: 'Tapos',
        kelurahan: ['Cilangkap', 'Cimpaeun', 'Jatijajar', 'Leuwinanggung', 'Sukamaju Baru', 'Sukatani', 'Tapos']
      },
      {
        nama: 'Beji',
        kelurahan: ['Beji', 'Beji Timur', 'Kemiri Muka', 'Kukusan', 'Pondok Cina', 'Tanah Baru']
      },
      {
        nama: 'Pancoran Mas',
        kelurahan: ['Depok', 'Depok Jaya', 'Mampang', 'Pancoran Mas', 'Rangkapan Jaya', 'Rangkapan Jaya Baru']
      },
      {
        nama: 'Cipayung',
        kelurahan: ['Bojong Pondok Terong', 'Cipayung', 'Cipayung Jaya', 'Pondok Jaya', 'Ratujaya']
      },
      {
        nama: 'Sawangan',
        kelurahan: ['Bedahan', 'Cinangka', 'Kedaung', 'Pasir Putih', 'Pengasinan', 'Sawangan', 'Sawangan Baru']
      },
      {
        nama: 'Bojongsari',
        kelurahan: ['Bojongsari', 'Bojongsari Baru', 'Curug', 'Duren Mekar', 'Duren Seribu', 'Pondok Petir', 'Serua']
      },
      {
        nama: 'Limo',
        kelurahan: ['Grogol', 'Krukut', 'Limo', 'Meruyung']
      },
      {
        nama: 'Cinere',
        kelurahan: ['Cinere', 'Gandul', 'Pangkalan Jati', 'Pangkalan Jati Baru']
      }
    ]
  },
  {
    nama: 'Kota Jakarta Timur (DKI Jakarta)',
    kecamatan: [
      {
        nama: 'Ciracas',
        kelurahan: ['Cibubur', 'Ciracas', 'Kelapa Dua Wetan', 'Rambutan', 'Susukan']
      },
      {
        nama: 'Pasar Rebo',
        kelurahan: ['Baru', 'Cijantung', 'Gedong', 'Kalisari', 'Pekayon']
      },
      {
        nama: 'Cipayung',
        kelurahan: ['Bambu Apus', 'Ceger', 'Cilangkap', 'Cipayung', 'Lubang Buaya', 'Munjul', 'Pondok Ranggon', 'Setu']
      },
      {
        nama: 'Kramat Jati',
        kelurahan: ['Balekambang', 'Batu Ampar', 'Cawang', 'Cililitan', 'Dukuh', 'Kramat Jati', 'Tengah']
      },
      {
        nama: 'Duren Sawit',
        kelurahan: ['Duren Sawit', 'Klender', 'Malaka Jaya', 'Malaka Sari', 'Pondok Bambu', 'Pondok Kelapa', 'Pondok Kopi']
      },
      {
        nama: 'Jatinegara',
        kelurahan: ['Bidara Cina', 'Cipinang Besar Selatan', 'Cipinang Besar Utara', 'Cipinang Cempedak', 'Cipinang Muara', 'Kampung Melayu', 'Rawa Bunga']
      },
      {
        nama: 'Makasar',
        kelurahan: ['Cipinang Melayu', 'Halim Perdana Kusumah', 'Kebon Pala', 'Makasar', 'Pinang Ranti']
      },
      {
        nama: 'Pulo Gadung',
        kelurahan: ['Cipinang', 'Jati', 'Jatinegara Kaum', 'Kayu Putih', 'Pisangan Timur', 'Pulo Gadung', 'Rawamangun']
      },
      {
        nama: 'Cakung',
        kelurahan: ['Cakung Barat', 'Cakung Timur', 'Jatinegara', 'Penggilingan', 'Pulo Gebang', 'Rawa Terate', 'Ujung Menteng']
      },
      {
        nama: 'Matraman',
        kelurahan: ['Kayu Manis', 'Kebon Manggis', 'Pal Meriam', 'Pisangan Baru', 'Utan Kayu Selatan', 'Utan Kayu Utara']
      }
    ]
  },
  {
    nama: 'Kota Jakarta Selatan (DKI Jakarta)',
    kecamatan: [
      {
        nama: 'Jagakarsa',
        kelurahan: ['Ciganjur', 'Cipedak', 'Jagakarsa', 'Lenteng Agung', 'Srengseng Sawah', 'Tanjung Barat']
      },
      {
        nama: 'Pasar Minggu',
        kelurahan: ['Cilandak Timur', 'Jati Padang', 'Kebagusan', 'Pasar Minggu', 'Pejaten Barat', 'Pejaten Timur', 'Ragunan']
      },
      {
        nama: 'Cilandak',
        kelurahan: ['Cilandak Barat', 'Cipete Selatan', 'Gandaria Selatan', 'Lebak Bulus', 'Pondok Labu']
      },
      {
        nama: 'Mampang Prapatan',
        kelurahan: ['Bangka', 'Kuningan Barat', 'Mampang Prapatan', 'Pela Mampang', 'Tegal Parang']
      },
      {
        nama: 'Pancoran',
        kelurahan: ['Cikoko', 'Duren Tiga', 'Kalibata', 'Pancoran', 'Pengadegan', 'Rawajati']
      },
      {
        nama: 'Tebet',
        kelurahan: ['Bukit Duri', 'Kebon Baru', 'Manggarai', 'Manggarai Selatan', 'Menteng Dalam', 'Tebet Barat', 'Tebet Timur']
      },
      {
        nama: 'Kebayoran Baru',
        kelurahan: ['Cipete Utara', 'Gandaria Utara', 'Gunung', 'Kramat Pela', 'Melawai', 'Petogogan', 'Pulo', 'Rawa Barat', 'Selong', 'Senayan']
      },
      {
        nama: 'Kebayoran Lama',
        kelurahan: ['Cipulir', 'Grogol Selatan', 'Grogol Utara', 'Kebayoran Lama Selatan', 'Kebayoran Lama Utara', 'Pondok Pinang']
      },
      {
        nama: 'Pesanggrahan',
        kelurahan: ['Bintaro', 'Pesanggrahan', 'Petukangan Selatan', 'Petukangan Utara', 'Ulujami']
      },
      {
        nama: 'Setiabudi',
        kelurahan: ['Guntur', 'Karet', 'Karet Kuningan', 'Karet Semanggi', 'Kuningan Timur', 'Menteng Atas', 'Pasar Manggis', 'Setiabudi']
      }
    ]
  },
  {
    nama: 'Kota Bogor',
    kecamatan: [
      {
        nama: 'Bogor Timur',
        kelurahan: ['Baranangsiang', 'Katulampa', 'Sindangrasa', 'Sindangbarang', 'Sukasari', 'Tajur']
      },
      {
        nama: 'Bogor Tengah',
        kelurahan: ['Babakan', 'Babakan Pasar', 'Cibogor', 'Ciwaringin', 'Gudang', 'Kebon Kelapa', 'Pabaton', 'Paledang', 'Panaragan', 'Sempur', 'Tegallega']
      },
      {
        nama: 'Bogor Utara',
        kelurahan: ['Bantarjati', 'Cibuluh', 'Ciluar', 'Cimahpar', 'Ciparigi', 'Kedunghalang', 'Tanah Baru', 'Tegal Gundil']
      },
      {
        nama: 'Bogor Selatan',
        kelurahan: ['Batutulis', 'Bojongkerta', 'Bondongan', 'Cikaret', 'Cipaku', 'Empang', 'Genteng', 'Harjasari', 'Kertamaya', 'Lawanggintung', 'Muarasari', 'Mulyaharja', 'Pakuan', 'Pamoyanan', 'Rancamaya', 'Ranggamekar']
      },
      {
        nama: 'Bogor Barat',
        kelurahan: ['Balungbangjaya', 'Bubulak', 'Cilendek Barat', 'Cilendek Timur', 'Curug', 'Curugmekar', 'Gunungbatu', 'Loji', 'Margajaya', 'Menteng', 'Pasirjaya', 'Pasirkuda', 'Pasirmulya', 'Semplak', 'Sindangbarang', 'Situgede']
      },
      {
        nama: 'Tanah Sareal',
        kelurahan: ['Cibadak', 'Kayumanis', 'Kebon Pedes', 'Kedung Badak', 'Kedung Jaya', 'Kedung Waringin', 'Kencana', 'Mekarwangi', 'Sukadamai', 'Sukaresmi', 'Tanah Sareal']
      }
    ]
  },
  {
    nama: 'Kabupaten Bogor',
    kecamatan: [
      {
        nama: 'Cibinong',
        kelurahan: ['Cirimekar', 'Ciriung', 'Harapan Jaya', 'Karadenan', 'Nanggewer', 'Nanggewer Mekar', 'Pabuaran', 'Pabuaran Mekar', 'Pakansari', 'Pondok Rajeg', 'Sukahati', 'Tengah']
      },
      {
        nama: 'Bojonggede',
        kelurahan: ['Bojonggede', 'Bojong Baru', 'Cimanggis', 'Kedung Waringin', 'Ragajaya', 'Rawa Panjang', 'Susukan', 'Waringin Jaya']
      },
      {
        nama: 'Gunung Putri',
        kelurahan: ['Bojong Kulur', 'Bojong Nangka', 'Cicadas', 'Cikeas Udik', 'Gunung Putri', 'Karanggan', 'Nagrak', 'Tlajung Udik', 'Wanaherang']
      },
      {
        nama: 'Cileungsi',
        kelurahan: ['Cileungsi', 'Cileungsi Kidul', 'Cipenjo', 'Cipeucang', 'Dayeuh', 'Gandoang', 'Jatisari', 'Limusnunggal', 'Mekarsari', 'Pasir Angin', 'Setu Sari']
      },
      {
        nama: 'Sukaraja',
        kelurahan: ['Cadas Ngampar', 'Cibanon', 'Cikeas', 'Cijujung', 'Cimandala', 'Gunung Geulis', 'Nagrak', 'Pasir Jambu', 'Pasirlaja', 'Sukaraja']
      },
      {
        nama: 'Babakan Madang',
        kelurahan: ['Babakan Madang', 'Bojong Koneng', 'Cadas Ngampar', 'Citaringgul', 'Kadumangu', 'Karang Tengah', 'Sentul', 'Sumur Batu']
      },
      {
        nama: 'Citeureup',
        kelurahan: ['Citeureup', 'Gunung Sari', 'Hambalang', 'Karang Asem Barat', 'Karang Asem Timur', 'Leuwinutug', 'Pasir Mukti', 'Puspanegara', 'Puspasari', 'Sanja', 'Sukahati', 'Tajur', 'Tangkil']
      },
      {
        nama: 'Tajurhalang',
        kelurahan: ['Citayam', 'Kalisuren', 'Nanggerang', 'Sasak Panjang', 'Sukmajaya', 'Tajurhalang', 'Tonjong']
      }
    ]
  }
];
