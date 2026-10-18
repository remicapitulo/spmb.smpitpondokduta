import React, { useState } from 'react';
import { GOOGLE_APPS_SCRIPT_CODE } from '../services/gasCodeSnippet';
import { 
  FileCode2, 
  Copy, 
  Check, 
  Globe, 
  Github, 
  FileSpreadsheet, 
  Layers, 
  Download, 
  ExternalLink,
  X 
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const PanduanDeployModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'gas' | 'netlify' | 'github' | 'pwa'>('gas');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-4xl rounded-2xl bg-white shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-600 text-white shadow-sm">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">
                Panduan Arsitektur & Deployment SPMB Pondok Duta
              </h2>
              <p className="text-xs text-slate-500">
                Langkah demi langkah: GitHub, Netlify, Google Apps Script & PWA
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 px-6 bg-white gap-2 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab('gas')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-2 transition ${
              activeTab === 'gas'
                ? 'border-emerald-600 text-emerald-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>1. Google Sheets & GAS API</span>
          </button>
          <button
            onClick={() => setActiveTab('netlify')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-2 transition ${
              activeTab === 'netlify'
                ? 'border-emerald-600 text-emerald-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>2. Deployment ke Netlify</span>
          </button>
          <button
            onClick={() => setActiveTab('github')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-2 transition ${
              activeTab === 'github'
                ? 'border-emerald-600 text-emerald-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Github className="w-4 h-4" />
            <span>3. Struktur Repository GitHub</span>
          </button>
          <button
            onClick={() => setActiveTab('pwa')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-2 transition ${
              activeTab === 'pwa'
                ? 'border-emerald-600 text-emerald-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>4. Pengujian & Instalasi PWA</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-700 leading-relaxed flex-1">
          {activeTab === 'gas' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900">
                <h4 className="font-bold text-sm mb-1 flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                  Konfigurasi Google Apps Script (Backend & Google Drive PDF)
                </h4>
                <p>
                  Aplikasi ini menggunakan Google Apps Script sebagai serverless API gratis yang terhubung langsung dengan Google Sheets sebagai basis data dan Google Drive untuk menyimpan arsip PDF hasil wawancara & observasi guru.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0 text-xs">
                    1
                  </span>
                  <div>
                    <strong className="text-slate-900">Buka Spreadsheet Database Anda:</strong>
                    <p className="mt-0.5 text-slate-600">
                      Buka <a href="https://docs.google.com/spreadsheets/d/1sKTeUlnxa9aquB8rBZfULrx7ZUaP1v-7pFBzu5EW3m8/edit" target="_blank" rel="noreferrer" className="text-emerald-700 font-bold underline inline-flex items-center gap-0.5">Spreadsheet SPMB SMPIT Pondok Duta (ID: 1sKTeUlnxa9aquB8rBZfULrx7ZUaP1v-7pFBzu5EW3m8) <ExternalLink className="w-3 h-3" /></a>. ID Spreadsheet ini telah ditanamkan secara otomatis di dalam kode <code>Code.gs</code>.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0 text-xs">
                    2
                  </span>
                  <div>
                    <strong className="text-slate-900">Buka Script Editor:</strong>
                    <p className="mt-0.5 text-slate-600">
                      Di Google Spreadsheet, klik menu <strong>Ekstensi (Extensions)</strong> &gt; <strong>Apps Script</strong>.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0 text-xs">
                    3
                  </span>
                  <div className="w-full">
                    <div className="flex items-center justify-between">
                      <strong className="text-slate-900">Salin & Tempel Kode Apps Script (Code.gs):</strong>
                      <button
                        onClick={handleCopyCode}
                        className="flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs shadow-sm transition"
                      >
                        {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copied ? 'Tersalin!' : 'Salin Kode GAS (1-Click)'}</span>
                      </button>
                    </div>
                    <p className="mt-1 text-slate-600">
                      Hapus isi file bawaan <code>Code.gs</code>, lalu tempel kode lengkap di bawah ini:
                    </p>
                    <div className="mt-2 relative">
                      <pre className="p-3 bg-slate-900 text-slate-100 rounded-xl font-mono text-[11px] overflow-x-auto max-h-48">
                        {GOOGLE_APPS_SCRIPT_CODE}
                      </pre>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0 text-xs">
                    4
                  </span>
                  <div>
                    <strong className="text-slate-900">Jalankan Inisialisasi Otomatis (setupSheets):</strong>
                    <p className="mt-0.5 text-slate-600">
                      Pilih fungsi <code>setupSheets</code> di dropdown toolbar Apps Script, lalu klik <strong>Jalankan (Run)</strong>. Ini akan secara otomatis membuat 9 sheet database: <strong>Data Induk Sekolah</strong> (kolom lengkap tanpa JSON), <code>Siswa</code>, <code>Setting</code>, <code>Users</code>, <code>OTM</code>, <code>Hasil_Wawancara</code>, <code>Observasi_Siswa</code>, <code>Wawancara_Siswa</code>, dan <code>Kelulusan</code> beserta header kolom lengkap.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0 text-xs">
                    5
                  </span>
                  <div>
                    <strong className="text-slate-900">Deploy sebagai Aplikasi Web (Web App):</strong>
                    <p className="mt-0.5 text-slate-600">
                      Klik tombol biru <strong>Terapkan (Deploy)</strong> &gt; <strong>Penerapan Baru (New Deployment)</strong> &gt; Ikon Gerigi &gt; pilih <strong>Aplikasi Web (Web App)</strong>.<br />
                      - <strong>Jalankan sebagai (Execute as):</strong> Saya (email Anda)<br />
                      - <strong>Siapa yang memiliki akses (Who has access):</strong> <strong>Siapa saja (Anyone)</strong> (PENTING untuk CORS & komunikasi Netlify)<br />
                      Klik <strong>Terapkan</strong>, berikan izin Google Drive, lalu salin URL Web App yang berakhiran <code>/exec</code> ke menu Pengaturan GAS di aplikasi ini.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'netlify' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 text-teal-900">
                <h4 className="font-bold text-sm mb-1 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-teal-700" />
                  Panduan Deploy Frontend ke Netlify
                </h4>
                <p>
                  Netlify menyediakan Continuous Deployment otomatis setiap kali Anda melakukan <code>git push</code> ke repository GitHub, lengkap dengan SSL HTTPS gratis yang merupakan syarat wajib PWA (Progressive Web App).
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <h5 className="font-bold text-slate-900">Langkah 1: Login ke Netlify</h5>
                  <p className="text-slate-600 mt-1">
                    Buka <a href="https://app.netlify.com" target="_blank" rel="noreferrer" className="text-emerald-700 underline">app.netlify.com</a> dan masuk menggunakan akun GitHub Anda.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <h5 className="font-bold text-slate-900">Langkah 2: Tambah Situs Baru (Add New Site)</h5>
                  <p className="text-slate-600 mt-1">
                    Klik <strong>Add new site</strong> &gt; <strong>Import an existing project</strong> &gt; Pilih <strong>GitHub</strong> &gt; Pilih repository SPMB SMPIT Pondok Duta Anda.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <h5 className="font-bold text-slate-900">Langkah 3: Konfigurasi Build Settings Netlify</h5>
                  <div className="mt-2 bg-slate-900 text-slate-200 p-3 rounded-lg font-mono text-[11px] space-y-1">
                    <div><strong>Build command:</strong> <code>npm run build</code></div>
                    <div><strong>Publish directory:</strong> <code>dist</code></div>
                    <div><strong>Node Version:</strong> <code>20</code> atau <code>22</code></div>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <h5 className="font-bold text-slate-900">Langkah 4: Konfigurasi Redirect SPA (Single Page App)</h5>
                  <p className="text-slate-600 mt-1">
                    Untuk memastikan rute SPA berfungsi saat reload, pastikan ada file <code>public/_redirects</code> dengan konten:
                  </p>
                  <pre className="mt-1.5 p-2 bg-slate-900 text-emerald-400 rounded-lg font-mono text-[11px]">
                    /*    /index.html   200
                  </pre>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <h5 className="font-bold text-slate-900">Langkah 5: Klik Deploy Site</h5>
                  <p className="text-slate-600 mt-1">
                    Dalam 1-2 menit, situs Anda akan aktif dengan domain misalnya <code>spmb-pondokduta.netlify.app</code>. Anda dapat menambahkan custom domain sekolah jika diinginkan.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'github' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-slate-900">
                <h4 className="font-bold text-sm mb-1 flex items-center gap-2">
                  <Github className="w-4 h-4 text-slate-800" />
                  Struktur Direktori Project GitHub
                </h4>
                <p>
                  Berikut struktur file yang rapi dan terstandarisasi untuk repository GitHub Anda:
                </p>
              </div>

              <pre className="p-4 bg-slate-900 text-emerald-400 rounded-xl font-mono text-[11px] overflow-x-auto leading-relaxed">
{`spmb-smpit-pondok-duta/
├── .gitignore
├── README.md               # Dokumentasi lengkap & cara instalasi
├── Code.gs                 # Kode backend Google Apps Script & PDF
├── index.html              # HTML5 entry point + PWA meta tags
├── package.json            # Dependensi React, Tailwind, Vite, VitePWA
├── vite.config.ts          # Konfigurasi bundler + VitePWA plugin
├── tsconfig.json           # Konfigurasi TypeScript
├── public/
│   ├── _redirects          # Netlify SPA redirect
│   ├── manifest.json       # Web App Manifest PWA
│   ├── sw.js               # Service Worker caching offline
│   ├── icon.svg            # Logo vektor SMPIT Pondok Duta
│   ├── pwa-192x192.png     # Ikon PWA standar 192px
│   ├── pwa-512x512.png     # Ikon PWA standar 512px
│   ├── pwa-maskable-512x512.png # Ikon Android maskable
│   └── apple-touch-icon.png# Ikon Safari iOS 180px
└── src/
    ├── main.tsx            # Entry point & PWA registration
    ├── App.tsx             # Root router & role switcher
    ├── index.css           # Tailwind CSS + print styling
    ├── types/              # Type definitions (Siswa, Wawancara, Observasi)
    ├── hooks/              # usePWAInstall, useOnlineStatus
    ├── services/           # gasService.ts, mockData.ts
    ├── components/         # Navbar, Footer, PWAInstallButton, Modals
    └── pages/
        ├── HomePage.tsx
        ├── SyaratPage.tsx
        ├── AlurPage.tsx
        ├── CekKelulusanPage.tsx
        └── dashboard/
            ├── SiswaDashboard.tsx
            ├── GuruDashboard.tsx
            ├── KartuUjianPrintView.tsx
            └── HasilWawancaraPrintView.tsx`}
              </pre>
            </div>
          )}

          {activeTab === 'pwa' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900">
                <h4 className="font-bold text-sm mb-1 flex items-center gap-2">
                  <Download className="w-4 h-4 text-amber-700" />
                  Dukungan PWA Multi-Device (Desktop, Android, Tablet, iOS)
                </h4>
                <p>
                  Aplikasi ini memenuhi kriteria PWA modern: Manifest JSON lengkap, Service Worker caching, Safe-Zone Maskable Icons, dan in-app beforeinstallprompt listener.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <strong className="text-slate-900 block mb-1">Di Google Chrome (Desktop / Laptop):</strong>
                  <p className="text-slate-600 text-[11px]">
                    Muncul tombol "Install Aplikasi" di navigasi dan banner utama. Pengguna juga dapat mengeklik ikon komputer kecil di sebelah kanan address bar browser Chrome untuk memasang aplikasi ke desktop Windows/Mac.
                  </p>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <strong className="text-slate-900 block mb-1">Di HP & Tablet Android:</strong>
                  <p className="text-slate-600 text-[11px]">
                    Sistem mendeteksi event <code>beforeinstallprompt</code> sehingga tombol "Install Aplikasi SPMB" langsung membuka prompt instalasi resmi Android tanpa melalui Google PlayStore.
                  </p>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <strong className="text-slate-900 block mb-1">Di iPhone & iPad (iOS Safari):</strong>
                  <p className="text-slate-600 text-[11px]">
                    Karena Safari tidak mendukung <code>beforeinstallprompt</code>, aplikasi menyediakan modal petunjuk visual: Ketuk tombol <em>Share (Bagikan)</em> lalu pilih <em>Tambahkan ke Layar Utama (Add to Home Screen)</em>.
                  </p>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <strong className="text-slate-900 block mb-1">Kemampuan Offline:</strong>
                  <p className="text-slate-600 text-[11px]">
                    Dengan <code>sw.js</code>, seluruh aset statis, kartu ujian yang telah dimuat, dan formulir dapat tetap dibuka saat jaringan internet tidak stabil di lokasi observasi sekolah.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between rounded-b-2xl">
          <span className="text-[11px] text-slate-500">
            Sistem Penerimaan Murid Baru (SPMB) SMPIT Pondok Duta
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition"
          >
            Tutup Panduan
          </button>
        </div>
      </div>
    </div>
  );
};
