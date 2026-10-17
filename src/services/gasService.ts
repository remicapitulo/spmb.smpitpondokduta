import { 
  DataSiswa, 
  WawancaraSiswaData, 
  HasilObservasiOrtuData, 
  ObservasiSiswaData, 
  StatusKelulusanInfo,
  FormWawancaraOrtuPDF,
  UserAccount
} from '../types';
import { 
  INITIAL_DATA_SISWA, 
  INITIAL_OTM_RAW_MAP, 
  INITIAL_HASIL_WAWANCARA_ORTU_MAP, 
  INITIAL_OBSERVASI_SISWA_LIST, 
  INITIAL_WAWANCARA_SISWA, 
  INITIAL_STATUS_KELULUSAN 
} from './mockData';
import { DEFAULT_SPREADSHEET_ID, DEFAULT_GAS_WEB_APP_URL } from './gasCodeSnippet';

const GAS_URL_KEY = 'spmb_pondok_duta_gas_url';
const SPREADSHEET_ID_KEY = 'spmb_pondok_duta_spreadsheet_id';
const LAST_SYNC_KEY = 'spmb_pondok_duta_last_sync';
const LOCAL_SISWA_KEY = 'spmb_pd_siswa_data';
const LOCAL_OTM_RAW_KEY = 'spmb_pd_otm_raw_map';
const LOCAL_HASIL_ORTU_KEY = 'spmb_pd_hasil_ortu_map';
const LOCAL_OBS_SISWA_KEY = 'spmb_pd_observasi_siswa_list';
const LOCAL_WS_KEY = 'spmb_pd_wawancara_siswa_data';
const LOCAL_LULUS_KEY = 'spmb_pd_status_kelulusan';
const LOCAL_USERS_KEY = 'spmb_pd_users_db';
const LOCAL_CURRENT_USER_KEY = 'spmb_pd_current_user';

export const INITIAL_USER_ACCOUNTS: UserAccount[] = [
  {
    id: 'USR-001',
    kodePendaftaran: 'PD-2026-001',
    namaSiswa: 'Muhammad Fatih Al-Ayyubi',
    namaOrangTua: 'Ir. Bambang Sulistyo',
    sekolahAsal: 'SDIT Pondok Duta',
    nomorHp: '081298765432',
    emailOrangTua: 'bambang.fatih@gmail.com',
    createdAt: '2026-01-10T08:30:00Z',
    role: 'siswa'
  },
  {
    id: 'USR-002',
    kodePendaftaran: 'PD-2026-002',
    namaSiswa: 'Aisyah Nur Ramadhani',
    namaOrangTua: 'Drs. H. Ahmad Dahlan',
    sekolahAsal: 'SD Islam Pondok Duta',
    nomorHp: '081311223344',
    emailOrangTua: 'ahmad.aisyah@gmail.com',
    createdAt: '2026-01-11T09:15:00Z',
    role: 'siswa'
  },
  {
    id: 'USR-003',
    kodePendaftaran: 'PD-2026-003',
    namaSiswa: 'Dzaky Faeyza Pratama',
    namaOrangTua: 'Hendra Wijaya, S.T.',
    sekolahAsal: 'SDIT Thariq Bin Ziyad',
    nomorHp: '081599887766',
    emailOrangTua: 'hendra.dzaky@gmail.com',
    createdAt: '2026-01-12T10:00:00Z',
    role: 'siswa'
  }
];

export const INITIAL_PEWAWANCARA_ACCOUNTS: UserAccount[] = [
  {
    id: 'GURU-001',
    kodePendaftaran: 'PW-2026-001',
    namaSiswa: 'Ustadz Salman Al-Farisi, Lc., M.Pd.',
    namaOrangTua: 'Tim Pewawancara OTM',
    sekolahAsal: 'SMPIT Pondok Duta',
    nomorHp: '081210002001',
    emailOrangTua: 'salman@pondokduta.sch.id',
    createdAt: '2026-01-01T07:00:00Z',
    role: 'guru',
    jabatan: 'Pewawancara OTM & Penguji'
  },
  {
    id: 'GURU-002',
    kodePendaftaran: 'PW-2026-002',
    namaSiswa: 'Ustadz H. Ahmad Dahlan, S.Pd.I',
    namaOrangTua: 'Ketua Panitia & Tim Penguji',
    sekolahAsal: 'SMPIT Pondok Duta',
    nomorHp: '081210002002',
    emailOrangTua: 'ahmad.dahlan@pondokduta.sch.id',
    createdAt: '2026-01-01T07:00:00Z',
    role: 'guru',
    jabatan: 'Penguji Observasi Siswa & Pewawancara'
  },
  {
    id: 'GURU-003',
    kodePendaftaran: 'PW-2026-003',
    namaSiswa: 'Ustadzah Siti Maryam, S.Pd.',
    namaOrangTua: 'Tim Pewawancara & Penguji',
    sekolahAsal: 'SMPIT Pondok Duta',
    nomorHp: '081210002003',
    emailOrangTua: 'siti.maryam@pondokduta.sch.id',
    createdAt: '2026-01-01T07:00:00Z',
    role: 'guru',
    jabatan: 'Pewawancara OTM & Penguji Siswa'
  },
  {
    id: 'GURU-004',
    kodePendaftaran: 'GURU-2026-001',
    namaSiswa: 'Ustadz Muhammad Fauzan, Lc.',
    namaOrangTua: 'Tim Pewawancara & Penguji',
    sekolahAsal: 'SMPIT Pondok Duta',
    nomorHp: '081210002004',
    emailOrangTua: 'fauzan@pondokduta.sch.id',
    createdAt: '2026-01-01T07:00:00Z',
    role: 'guru',
    jabatan: 'Pewawancara & Penguji Tahfidz'
  }
];

export const INITIAL_ADMIN_ACCOUNTS: UserAccount[] = [
  {
    id: 'ADM-001',
    kodePendaftaran: 'ADMIN-2026-001',
    namaSiswa: 'Administrator SPMB Pondok Duta',
    namaOrangTua: 'Admin Utama & Integrasi GAS API',
    sekolahAsal: 'SMPIT Pondok Duta',
    nomorHp: '081287123456',
    emailOrangTua: 'admin.spmb@pondokduta.sch.id',
    createdAt: '2026-01-01T06:00:00Z',
    role: 'admin',
    jabatan: 'Administrator Sistem & GAS API'
  },
  {
    id: 'ADM-002',
    kodePendaftaran: 'ADMIN-PD26',
    namaSiswa: 'Super Admin IT Pondok Duta',
    namaOrangTua: 'Pengelola Database & GAS API',
    sekolahAsal: 'SMPIT Pondok Duta',
    nomorHp: '081287123457',
    emailOrangTua: 'it.spmb@pondokduta.sch.id',
    createdAt: '2026-01-01T06:00:00Z',
    role: 'admin',
    jabatan: 'Super Admin IT & GAS API'
  }
];

// Generator kode pendaftaran acak, unik & sulit ditebak (misal: PD26-7K9W2X)
export function generateRandomKodePendaftaran(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let rand = '';
  for (let i = 0; i < 6; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `PD26-${rand}`;
}

export function extractSpreadsheetId(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return DEFAULT_SPREADSHEET_ID;
  const match = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) {
    return match[1];
  }
  return trimmed;
}

// Inisialisasi LocalStorage
function initLocalStorage() {
  if (!localStorage.getItem(SPREADSHEET_ID_KEY)) {
    localStorage.setItem(SPREADSHEET_ID_KEY, DEFAULT_SPREADSHEET_ID);
  }
  if (!localStorage.getItem(GAS_URL_KEY)) {
    localStorage.setItem(GAS_URL_KEY, DEFAULT_GAS_WEB_APP_URL);
  }
  if (!localStorage.getItem(LOCAL_SISWA_KEY)) {
    localStorage.setItem(LOCAL_SISWA_KEY, JSON.stringify(INITIAL_DATA_SISWA));
  }
  if (!localStorage.getItem(LOCAL_OTM_RAW_KEY)) {
    localStorage.setItem(LOCAL_OTM_RAW_KEY, JSON.stringify(INITIAL_OTM_RAW_MAP));
  }
  if (!localStorage.getItem(LOCAL_HASIL_ORTU_KEY)) {
    localStorage.setItem(LOCAL_HASIL_ORTU_KEY, JSON.stringify(INITIAL_HASIL_WAWANCARA_ORTU_MAP));
  }
  if (!localStorage.getItem(LOCAL_OBS_SISWA_KEY)) {
    localStorage.setItem(LOCAL_OBS_SISWA_KEY, JSON.stringify(INITIAL_OBSERVASI_SISWA_LIST));
  }
  if (!localStorage.getItem(LOCAL_WS_KEY)) {
    localStorage.setItem(LOCAL_WS_KEY, JSON.stringify(INITIAL_WAWANCARA_SISWA));
  }
  if (!localStorage.getItem(LOCAL_LULUS_KEY)) {
    localStorage.setItem(LOCAL_LULUS_KEY, JSON.stringify(INITIAL_STATUS_KELULUSAN));
  }
  if (!localStorage.getItem(LOCAL_USERS_KEY)) {
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(INITIAL_USER_ACCOUNTS));
  }
}

initLocalStorage();

async function postToGas(gasUrl: string, payload: Record<string, any>): Promise<any> {
  if (!gasUrl || !navigator.onLine) return null;
  try {
    // Menggunakan text/plain;charset=utf-8 agar browser tidak memicu CORS preflight OPTIONS
    // pada Google Apps Script dan kita dapat membaca JSON response secara langsung
    const response = await fetch(gasUrl, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify(payload)
    });
    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch {
      return { success: response.ok, raw: text };
    }
  } catch (err) {
    console.warn('Background GAS sync warning:', err);
    return null;
  }
}

export const gasService = {
  getSpreadsheetId(): string {
    return localStorage.getItem(SPREADSHEET_ID_KEY) || DEFAULT_SPREADSHEET_ID;
  },

  setSpreadsheetId(input: string): string {
    const cleanId = extractSpreadsheetId(input);
    localStorage.setItem(SPREADSHEET_ID_KEY, cleanId);
    return cleanId;
  },

  getSpreadsheetUrl(customId?: string): string {
    const id = customId ? extractSpreadsheetId(customId) : this.getSpreadsheetId();
    return `https://docs.google.com/spreadsheets/d/${id}/edit`;
  },

  getLastSyncTime(): string | null {
    return localStorage.getItem(LAST_SYNC_KEY);
  },

  setLastSyncTime(iso?: string) {
    localStorage.setItem(LAST_SYNC_KEY, iso || new Date().toISOString());
  },

  getGasUrl(): string {
    return localStorage.getItem(GAS_URL_KEY) || DEFAULT_GAS_WEB_APP_URL;
  },

  setGasUrl(url: string) {
    if (url.trim()) {
      localStorage.setItem(GAS_URL_KEY, url.trim());
    } else {
      localStorage.removeItem(GAS_URL_KEY);
    }
  },

  isLiveGasConfigured(): boolean {
    const url = this.getGasUrl();
    return !!(url && url.includes('script.google.com/macros/s/'));
  },

  // Uji akses baca langsung ke Google Spreadsheet (GVIZ JSON) jika Spreadsheet diset "Siapa saja yang memiliki link -> Pelihat"
  async testSpreadsheetDirectAccess(customSheetId?: string): Promise<{
    success: boolean;
    message: string;
    rowCount?: number;
  }> {
    const sheetId = extractSpreadsheetId(customSheetId || this.getSpreadsheetId());
    try {
      const gvizUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json`;
      const res = await fetch(gvizUrl, { method: 'GET', mode: 'cors' });
      const text = await res.text();

      if (text.includes('google.visualization.Query.setResponse')) {
        const jsonStart = text.indexOf('{');
        const jsonEnd = text.lastIndexOf('}');
        if (jsonStart !== -1 && jsonEnd !== -1) {
          const parsed = JSON.parse(text.substring(jsonStart, jsonEnd + 1));
          const rows = parsed?.table?.rows || [];
          this.setLastSyncTime();
          return {
            success: true,
            rowCount: rows.length,
            message: `Terhubung langsung ke Spreadsheet (${sheetId})! Ditemukan ${rows.length} baris data pada sheet pertama.`
          };
        }
      }
      return {
        success: false,
        message: `Spreadsheet (${sheetId}) saat ini masih berstatus Privat. Untuk koneksi penuh (Baca & Tulis 7 Sheet), tempelkan kode Code.gs ke menu Extensions > Apps Script di dalam Spreadsheet Anda lalu Deploy sebagai Web App.`
      };
    } catch {
      return {
        success: false,
        message: `Spreadsheet (${sheetId}) memerlukan jembatan Web App Google Apps Script (GAS) atau akses berbagi link publik.`
      };
    }
  },

  async testConnection(testUrl?: string, customSheetId?: string): Promise<{
    success: boolean;
    message: string;
    sheets?: string[];
    spreadsheetName?: string;
  }> {
    const url = (testUrl !== undefined ? testUrl : this.getGasUrl()).trim();
    const sheetId = extractSpreadsheetId(customSheetId || this.getSpreadsheetId());

    if (!url) {
      const directRes = await this.testSpreadsheetDirectAccess(sheetId);
      if (directRes.success) {
        return {
          success: true,
          message: `${directRes.message} (Mode Baca Langsung Aktif. Tambahkan URL Web App GAS untuk fitur Simpan/Tulis ke Spreadsheet).`
        };
      }
      return {
        success: false,
        message: `ID Spreadsheet (${sheetId}) telah terdaftar! Silakan klik "Salin Kode GAS", tempel di Extensions > Apps Script pada Spreadsheet Anda, klik Deploy > Web App, lalu masukkan URL Web App (/exec) di atas untuk mengaktifkan baca-tulis otomatis.`
      };
    }

    try {
      const separator = url.includes('?') ? '&' : '?';
      const pingUrl = `${url}${separator}action=ping`;
      const response = await fetch(pingUrl, { method: 'GET', mode: 'cors' });
      const data = await response.json();
      if (data && data.success) {
        this.setLastSyncTime();
        return {
          success: true,
          spreadsheetName: data.spreadsheetName,
          sheets: data.sheets,
          message: data.message || `Koneksi ke Google Apps Script & Spreadsheet (${sheetId}) berhasil!`
        };
      }
      return {
        success: false,
        message: data?.message || data?.error || 'Format respon GAS tidak sesuai.'
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return { 
        success: false, 
        message: `Gagal menghubungi GAS (${message}). Pastikan URL berakhiran /exec dan deploy Web App diset "Who has access: Anyone (Siapa saja)".` 
      };
    }
  },

  // Inisialisasi 7 Sheet Database di Spreadsheet secara remote melalui GAS Web App
  async setupRemoteSheets(customGasUrl?: string): Promise<{
    success: boolean;
    message: string;
    sheets?: string[];
  }> {
    const gasUrl = (customGasUrl || this.getGasUrl()).trim();
    if (!gasUrl) {
      return {
        success: false,
        message: 'Masukkan URL Web App Google Apps Script (/exec) terlebih dahulu untuk membuat 7 Sheet otomatis.'
      };
    }

    const res = await postToGas(gasUrl, {
      action: 'setupSheets',
      spreadsheetId: this.getSpreadsheetId()
    });

    if (res && res.success) {
      this.setLastSyncTime();
      return {
        success: true,
        sheets: res.allSheets,
        message: res.message || 'Berhasil membuat 7 Sheet Database di Google Spreadsheet!'
      };
    }

    return {
      success: false,
      message: res?.message || res?.error || 'Gagal menjalankan setupSheets di Google Apps Script.'
    };
  },

  // Upload / Push seluruh data di aplikasi ke Google Spreadsheet 1sKTeUlnxa9aquB8rBZfULrx7ZUaP1v-7pFBzu5EW3m8
  async pushAllLocalToSpreadsheet(customGasUrl?: string): Promise<{
    success: boolean;
    message: string;
  }> {
    const gasUrl = (customGasUrl || this.getGasUrl()).trim();
    if (!gasUrl) {
      return {
        success: false,
        message: 'Masukkan URL Web App Google Apps Script (/exec) terlebih dahulu untuk mengunggah data ke Spreadsheet.'
      };
    }

    const rawUsers = localStorage.getItem(LOCAL_USERS_KEY);
    const users: UserAccount[] = rawUsers ? JSON.parse(rawUsers) : INITIAL_USER_ACCOUNTS;
    const allUsers = [
      ...users,
      ...INITIAL_PEWAWANCARA_ACCOUNTS,
      ...INITIAL_ADMIN_ACCOUNTS
    ];

    const rawSiswa = localStorage.getItem(LOCAL_SISWA_KEY);
    const siswaList: DataSiswa[] = rawSiswa ? JSON.parse(rawSiswa) : INITIAL_DATA_SISWA;

    const rawOtm = localStorage.getItem(LOCAL_OTM_RAW_KEY);
    const otmMap = rawOtm ? JSON.parse(rawOtm) : INITIAL_OTM_RAW_MAP;

    const rawHasil = localStorage.getItem(LOCAL_HASIL_ORTU_KEY);
    const hasilOrtuMap = rawHasil ? JSON.parse(rawHasil) : INITIAL_HASIL_WAWANCARA_ORTU_MAP;

    const rawObs = localStorage.getItem(LOCAL_OBS_SISWA_KEY);
    const observasiList = rawObs ? JSON.parse(rawObs) : INITIAL_OBSERVASI_SISWA_LIST;

    const rawLulus = localStorage.getItem(LOCAL_LULUS_KEY);
    const kelulusanList = rawLulus ? JSON.parse(rawLulus) : INITIAL_STATUS_KELULUSAN;

    const res = await postToGas(gasUrl, {
      action: 'syncAllToSheet',
      spreadsheetId: this.getSpreadsheetId(),
      users: allUsers,
      siswaList,
      otmMap,
      hasilOrtuMap,
      observasiList,
      kelulusanList
    });

    if (res && res.success) {
      this.setLastSyncTime();
      return {
        success: true,
        message: res.message || `Seluruh data (${siswaList.length} Siswa, ${allUsers.length} Akun, Jawaban OTM, Wawancara & Kelulusan) berhasil diunggah ke Spreadsheet!`
      };
    }

    return {
      success: false,
      message: res?.message || res?.error || 'Gagal mengunggah data ke Google Spreadsheet.'
    };
  },

  // Tarik / Sinkronisasi seluruh data dari Google Spreadsheet ke aplikasi lokal
  async syncFromSpreadsheet(customGasUrl?: string): Promise<{
    success: boolean;
    message: string;
  }> {
    const gasUrl = (customGasUrl || this.getGasUrl()).trim();
    if (!gasUrl) {
      return {
        success: false,
        message: 'Masukkan URL Web App Google Apps Script (/exec) terlebih dahulu untuk menarik data lengkap dari Spreadsheet.'
      };
    }

    try {
      const separator = gasUrl.includes('?') ? '&' : '?';
      const response = await fetch(`${gasUrl}${separator}action=getAllData`, {
        method: 'GET',
        mode: 'cors'
      });
      const json = await response.json();

      if (json && json.success && json.data) {
        const db = json.data;
        const hasRemoteData =
          (Array.isArray(db.siswaList) && db.siswaList.length > 0) ||
          (Array.isArray(db.users) && db.users.length > 0);

        if (!hasRemoteData) {
          // Jika Spreadsheet baru diinisialisasi dan masih kosong, otomatis unggah data awal aplikasi ke Spreadsheet
          return await this.pushAllLocalToSpreadsheet(gasUrl);
        }

        if (Array.isArray(db.users) && db.users.length > 0) {
          const siswaOnly = db.users.filter((u: UserAccount) => u.role === 'siswa');
          if (siswaOnly.length > 0) {
            localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(siswaOnly));
          }
        }

        if (Array.isArray(db.siswaList) && db.siswaList.length > 0) {
          localStorage.setItem(LOCAL_SISWA_KEY, JSON.stringify(db.siswaList));
        }

        if (db.otmMap && Object.keys(db.otmMap).length > 0) {
          const currentOtm = JSON.parse(localStorage.getItem(LOCAL_OTM_RAW_KEY) || '{}');
          localStorage.setItem(LOCAL_OTM_RAW_KEY, JSON.stringify({ ...currentOtm, ...db.otmMap }));
        }

        if (db.hasilOrtuMap && Object.keys(db.hasilOrtuMap).length > 0) {
          const currentHasil = JSON.parse(localStorage.getItem(LOCAL_HASIL_ORTU_KEY) || '{}');
          localStorage.setItem(LOCAL_HASIL_ORTU_KEY, JSON.stringify({ ...currentHasil, ...db.hasilOrtuMap }));
        }

        if (Array.isArray(db.observasiList) && db.observasiList.length > 0) {
          localStorage.setItem(LOCAL_OBS_SISWA_KEY, JSON.stringify(db.observasiList));
        }

        if (Array.isArray(db.kelulusanList) && db.kelulusanList.length > 0) {
          localStorage.setItem(LOCAL_LULUS_KEY, JSON.stringify(db.kelulusanList));
        }

        this.setLastSyncTime();
        return {
          success: true,
          message: `Sinkronisasi berhasil dari Spreadsheet "${db.spreadsheetName || this.getSpreadsheetId()}"! (${db.siswaList?.length || 0} Data Siswa diperbarui).`
        };
      }

      return {
        success: false,
        message: json?.message || json?.error || 'Data Spreadsheet masih kosong. Silakan klik "Upload Data ke Spreadsheet" terlebih dahulu.'
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        message: `Gagal menarik data dari GAS (${msg}).`
      };
    }
  },

  // Mendapatkan daftar siswa yang ditarik dari sheet "OTM" (sesuai fungsi getStudentList() di GAS)
  async getStudentList() {
    const gasUrl = this.getGasUrl();
    if (gasUrl && navigator.onLine) {
      try {
        const separator = gasUrl.includes('?') ? '&' : '?';
        const res = await fetch(`${gasUrl}${separator}action=getStudentList`, { mode: 'cors' });
        const json = await res.json();
        if (json && json.success && Array.isArray(json.data) && json.data.length > 0) {
          this.setLastSyncTime();
          return json.data;
        }
      } catch (e) {
        console.warn('Fallback to local storage for getStudentList:', e);
      }
    }

    const rawSiswa = localStorage.getItem(LOCAL_SISWA_KEY);
    const siswaList: DataSiswa[] = rawSiswa ? JSON.parse(rawSiswa) : INITIAL_DATA_SISWA;

    const rawHasil = localStorage.getItem(LOCAL_HASIL_ORTU_KEY);
    const hasilMap: { [noPend: string]: HasilObservasiOrtuData } = rawHasil ? JSON.parse(rawHasil) : INITIAL_HASIL_WAWANCARA_ORTU_MAP;

    const rawOtm = localStorage.getItem(LOCAL_OTM_RAW_KEY);
    const otmMap = rawOtm ? JSON.parse(rawOtm) : INITIAL_OTM_RAW_MAP;

    return siswaList.map((s, idx) => {
      const hasil = hasilMap[s.noPendaftaran];
      const hasSignature = Boolean(hasil?.isTtdOrtuSigned || hasil?.ttdOrtuBase64);
      return {
        rowIndex: idx + 2,
        id: s.noPendaftaran,
        nama: s.namaLengkap,
        panggilan: s.namaPanggilan || s.namaLengkap.split(' ')[0],
        sekolah: s.asalSekolah,
        ayah: s.namaAyah,
        ibu: s.namaIbu,
        rawData: otmMap[s.noPendaftaran] || {},
        existingPdf: hasil?.status === 'selesai' ? hasil.pdfUrl : (hasil?.pdfUrl || null),
        hasDraft: Boolean(hasil),
        isTtdOrtuSigned: hasSignature,
        draftStatus: hasil?.status || (hasil ? 'selesai' : 'belum_wawancara')
      };
    });
  },

  // Mengambil Raw Data OTM (jawaban 34 butir) untuk sebuah nomor pendaftaran
  getOtmRawData(noPendaftaran: string): { [refId: number]: string } {
    const raw = localStorage.getItem(LOCAL_OTM_RAW_KEY);
    const map = raw ? JSON.parse(raw) : INITIAL_OTM_RAW_MAP;
    return map[noPendaftaran] || INITIAL_OTM_RAW_MAP['PD-2026-001'] || {};
  },

  // Mengambil hasil observasi ortu jika sudah pernah diwawancara / draft
  getHasilWawancaraOrtu(noPendaftaran: string): HasilObservasiOrtuData | null {
    const raw = localStorage.getItem(LOCAL_HASIL_ORTU_KEY);
    const map: { [noPend: string]: HasilObservasiOrtuData } = raw ? JSON.parse(raw) : INITIAL_HASIL_WAWANCARA_ORTU_MAP;
    return map[noPendaftaran] || null;
  },

  // Simpan Draft Hasil Wawancara OTM (Bisa diakses dan ditandatangani ortu langsung di HP mereka)
  saveDraftWawancaraOrtu(formObject: {
    idSiswa: string;
    namaSiswa: string;
    sekolahAsal: string;
    namaPanggilan: string;
    namaAyah: string;
    namaIbu: string;
    namaPewawancara: string;
    jsonAnswers: any[];
    catatanKhusus?: string;
    ttdOrtuBase64?: string;
    ttdPewawancaraBase64?: string;
  }): { success: boolean; data: HasilObservasiOrtuData; message: string } {
    const rawHasil = localStorage.getItem(LOCAL_HASIL_ORTU_KEY);
    const map: { [noPend: string]: HasilObservasiOrtuData } = rawHasil ? JSON.parse(rawHasil) : INITIAL_HASIL_WAWANCARA_ORTU_MAP;

    const existing = map[formObject.idSiswa];
    const dateStr = new Date().toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');
    const hasTtdOrtu = Boolean(formObject.ttdOrtuBase64 || existing?.ttdOrtuBase64);

    const draftData: HasilObservasiOrtuData = {
      id: existing?.id || ('HO-DRAFT-' + Date.now()),
      idSiswa: formObject.idSiswa,
      noPendaftaran: formObject.idSiswa,
      namaSiswa: formObject.namaSiswa,
      namaPanggilan: formObject.namaPanggilan,
      sekolahAsal: formObject.sekolahAsal,
      namaAyah: formObject.namaAyah,
      namaIbu: formObject.namaIbu,
      namaPewawancara: formObject.namaPewawancara,
      tanggalWawancara: existing?.tanggalWawancara || dateStr,
      jsonAnswers: formObject.jsonAnswers,
      catatanKhusus: formObject.catatanKhusus || existing?.catatanKhusus || '-',
      ttdOrtuBase64: formObject.ttdOrtuBase64 || existing?.ttdOrtuBase64 || '',
      ttdPewawancaraBase64: formObject.ttdPewawancaraBase64 || existing?.ttdPewawancaraBase64 || '',
      status: hasTtdOrtu ? 'menunggu_ttd_ortu' : 'draft',
      isTtdOrtuSigned: hasTtdOrtu,
      createdAt: existing?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    map[formObject.idSiswa] = draftData;
    localStorage.setItem(LOCAL_HASIL_ORTU_KEY, JSON.stringify(map));

    const gasUrl = this.getGasUrl();
    if (gasUrl) {
      postToGas(gasUrl, {
        action: 'saveDraftWawancaraOrtu',
        data: draftData
      });
    }

    return {
      success: true,
      data: draftData,
      message: 'Draft wawancara berhasil disimpan. Orang tua kini dapat mereview dan menandatangani langsung di HP mereka melalui menu Wawancara Orang Tua.'
    };
  },

  // Simpan Tanda Tangan Orang Tua dari HP (Portal Calon Siswa / Ortu)
  saveTtdOrtuFromHp(noPendaftaran: string, ttdOrtuBase64: string): { success: boolean; data?: HasilObservasiOrtuData; message: string } {
    const rawHasil = localStorage.getItem(LOCAL_HASIL_ORTU_KEY);
    const map: { [noPend: string]: HasilObservasiOrtuData } = rawHasil ? JSON.parse(rawHasil) : INITIAL_HASIL_WAWANCARA_ORTU_MAP;

    if (!map[noPendaftaran]) {
      const rawSiswa = localStorage.getItem(LOCAL_SISWA_KEY);
      const siswaList: DataSiswa[] = rawSiswa ? JSON.parse(rawSiswa) : INITIAL_DATA_SISWA;
      const st = siswaList.find(s => s.noPendaftaran === noPendaftaran);
      if (!st) {
        return { success: false, message: 'Data siswa tidak ditemukan.' };
      }
      map[noPendaftaran] = {
        id: 'HO-HP-' + Date.now(),
        idSiswa: noPendaftaran,
        noPendaftaran: noPendaftaran,
        namaSiswa: st.namaLengkap,
        namaPanggilan: st.namaPanggilan || st.namaLengkap.split(' ')[0],
        sekolahAsal: st.asalSekolah,
        namaAyah: st.namaAyah,
        namaIbu: st.namaIbu,
        namaPewawancara: 'Ustadz Salman Al-Farisi, Lc., M.Pd.',
        tanggalWawancara: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-'),
        jsonAnswers: [],
        catatanKhusus: '-',
        ttdOrtuBase64: ttdOrtuBase64,
        status: 'menunggu_ttd_ortu',
        isTtdOrtuSigned: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    } else {
      map[noPendaftaran] = {
        ...map[noPendaftaran],
        ttdOrtuBase64: ttdOrtuBase64,
        isTtdOrtuSigned: true,
        status: 'menunggu_ttd_ortu',
        updatedAt: new Date().toISOString()
      };
    }

    localStorage.setItem(LOCAL_HASIL_ORTU_KEY, JSON.stringify(map));

    const gasUrl = this.getGasUrl();
    if (gasUrl) {
      postToGas(gasUrl, {
        action: 'saveTtdOrtuFromHp',
        data: map[noPendaftaran]
      });
    }

    return {
      success: true,
      data: map[noPendaftaran],
      message: 'Tanda tangan elektronik Ayah/Bunda berhasil disimpan! Lembar wawancara di akun pewawancara telah diperbarui dengan tanda tangan ini.'
    };
  },

  // Tim 1: Simpan Lembar Observasi Wawancara Ortu & Generate PDF (Final Pengesahan)
  async processWawancaraOrtu(formObject: {
    idSiswa: string;
    namaSiswa: string;
    sekolahAsal: string;
    namaPanggilan: string;
    namaAyah: string;
    namaIbu: string;
    namaPewawancara: string;
    jsonAnswers: any[];
    ttdOrtuBase64?: string;
    ttdPewawancaraBase64?: string;
  }): Promise<{ success: boolean; pdfUrl: string; message: string; data: HasilObservasiOrtuData }> {
    const dateStr = new Date().toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');
    let pdfUrl = `https://docs.google.com/spreadsheets/d/${this.getSpreadsheetId()}/edit`;

    const answers = formObject.jsonAnswers;
    const catatanItem = answers.find(item => item.question && item.question.includes("CATATAN KHUSUS"));
    const catatanKhususText = catatanItem ? (catatanItem.newAnswer || "-") : "-";

    // Kirim ke GAS terlebih dahulu jika online agar mendapatkan URL PDF Google Drive asli
    const gasUrl = this.getGasUrl();
    if (gasUrl && navigator.onLine) {
      const gasRes = await postToGas(gasUrl, {
        action: 'processForm',
        ...formObject,
        jsonAnswers: JSON.stringify(formObject.jsonAnswers)
      });
      if (gasRes && gasRes.pdfUrl) {
        pdfUrl = gasRes.pdfUrl;
      }
      this.setLastSyncTime();
    }

    const savedData: HasilObservasiOrtuData = {
      id: 'HO-' + Date.now(),
      idSiswa: formObject.idSiswa,
      noPendaftaran: formObject.idSiswa,
      namaSiswa: formObject.namaSiswa,
      namaPanggilan: formObject.namaPanggilan,
      sekolahAsal: formObject.sekolahAsal,
      namaAyah: formObject.namaAyah,
      namaIbu: formObject.namaIbu,
      namaPewawancara: formObject.namaPewawancara,
      tanggalWawancara: dateStr,
      jsonAnswers: answers,
      catatanKhusus: catatanKhususText,
      ttdOrtuBase64: formObject.ttdOrtuBase64,
      ttdPewawancaraBase64: formObject.ttdPewawancaraBase64,
      pdfUrl: pdfUrl,
      status: 'selesai',
      isTtdOrtuSigned: Boolean(formObject.ttdOrtuBase64),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const rawHasil = localStorage.getItem(LOCAL_HASIL_ORTU_KEY);
    const map: { [noPend: string]: HasilObservasiOrtuData } = rawHasil ? JSON.parse(rawHasil) : INITIAL_HASIL_WAWANCARA_ORTU_MAP;
    map[formObject.idSiswa] = savedData;
    localStorage.setItem(LOCAL_HASIL_ORTU_KEY, JSON.stringify(map));

    return {
      success: true,
      pdfUrl: pdfUrl,
      message: 'Sukses! Data observasi orang tua tersimpan ke Spreadsheet dan PDF telah dibuat.',
      data: savedData
    };
  },

  // Tim 2: Simpan Observasi Siswa (Tahsin, Tahfidz, Adab, Akademik - Terpisah dari Orang Tua!)
  async saveObservasiSiswa(data: ObservasiSiswaData): Promise<{ success: boolean; data: ObservasiSiswaData; message: string }> {
    const raw = localStorage.getItem(LOCAL_OBS_SISWA_KEY);
    const list: ObservasiSiswaData[] = raw ? JSON.parse(raw) : INITIAL_OBSERVASI_SISWA_LIST;
    const idx = list.findIndex(o => o.noPendaftaran === data.noPendaftaran);

    const pdfUrl = data.pdfUrl || `https://docs.google.com/spreadsheets/d/${this.getSpreadsheetId()}/edit`;
    const finalized: ObservasiSiswaData = {
      ...data,
      pdfUrl: pdfUrl,
      createdAt: data.createdAt || new Date().toISOString()
    };

    if (idx >= 0) {
      list[idx] = finalized;
    } else {
      list.push(finalized);
    }
    localStorage.setItem(LOCAL_OBS_SISWA_KEY, JSON.stringify(list));

    this.updateStatusKelulusan(finalized);

    const gasUrl = this.getGasUrl();
    if (gasUrl && navigator.onLine) {
      await postToGas(gasUrl, { action: 'saveObservasiSiswa', ...finalized });
      this.setLastSyncTime();
    }

    return {
      success: true,
      data: finalized,
      message: 'Lembar observasi siswa berhasil disimpan oleh Tim Penguji Siswa!'
    };
  },

  // Mengambil lembar observasi siswa untuk satu siswa
  getObservasiSiswa(noPendaftaran: string): ObservasiSiswaData | null {
    const raw = localStorage.getItem(LOCAL_OBS_SISWA_KEY);
    const list: ObservasiSiswaData[] = raw ? JSON.parse(raw) : INITIAL_OBSERVASI_SISWA_LIST;
    return list.find(o => o.noPendaftaran === noPendaftaran) || null;
  },

  // Mengambil semua lembar observasi siswa
  getAllObservasiSiswa(): ObservasiSiswaData[] {
    const raw = localStorage.getItem(LOCAL_OBS_SISWA_KEY);
    return raw ? JSON.parse(raw) : INITIAL_OBSERVASI_SISWA_LIST;
  },

  // Simpan Asesmen Mandiri Siswa
  async saveWawancaraSiswa(data: WawancaraSiswaData): Promise<{ success: boolean; data: WawancaraSiswaData }> {
    const raw = localStorage.getItem(LOCAL_WS_KEY);
    const all: WawancaraSiswaData[] = raw ? JSON.parse(raw) : [];
    const idx = all.findIndex(w => w.noPendaftaran === data.noPendaftaran);
    const updated = { ...data, updatedAt: new Date().toISOString() };

    if (idx >= 0) {
      all[idx] = updated;
    } else {
      all.push(updated);
    }
    localStorage.setItem(LOCAL_WS_KEY, JSON.stringify(all));

    const gasUrl = this.getGasUrl();
    if (gasUrl && navigator.onLine) {
      await postToGas(gasUrl, { action: 'saveWawancaraSiswa', data: updated });
      this.setLastSyncTime();
    }

    return { success: true, data: updated };
  },

  // Simpan Form Isian 34 Pertanyaan Orang Tua (PDF Form)
  async saveFormIsianOrtu(data: FormWawancaraOrtuPDF): Promise<{ success: boolean; message: string }> {
    const raw = localStorage.getItem(LOCAL_OTM_RAW_KEY);
    const map = raw ? JSON.parse(raw) : INITIAL_OTM_RAW_MAP;

    // Convert into row index (10 to 44)
    const rowMap = {
      10: data.q1_kesiapanBiaya || '',
      11: data.q2_pekerjaanAyah || '',
      12: data.q3_pekerjaanBunda || '',
      13: data.q4_penghasilanAyah || '',
      14: data.q5_penghasilanBunda || '',
      15: (data.q6_pendampingBelajar || []).join(', '),
      16: data.q7_sholat5Waktu || '',
      17: (data.q8_pengasuhPulangSekolah || []).join(', '),
      18: (data.q9_kegiatanNonFormal || []).join(', '),
      19: data.q10_riwayatPenyakit || '',
      20: data.q11_prestasi || '',
      21: data.q12_sifatPositif || '',
      22: data.q13_sifatNegatif || '',
      23: data.q14_sikapTerhadapOrtu || '',
      24: data.q15_pernahMelawanOrtu || '',
      25: data.q16_halBerkesan || '',
      26: data.q17_ayahMerokok || 'Tidak',
      27: data.q18_bundaMerokok || 'Tidak',
      28: data.q19_keluargaLainMerokok || 'Tidak ada',
      29: data.q20_durasiBersamaAnak || '',
      30: data.q21_kegiatanBersamaDiRumah || '',
      31: data.q22_traumaBullying || 'Tidak ada',
      32: data.q23_anakPernahMerokok || 'Tidak pernah',
      33: data.q24_pendapatRokokPornografi || '',
      34: data.q25_fasilitasGadget || 'Tidak',
      35: data.q26_frekuensiGadget || 'Waktu libur',
      36: data.q27_bersediaAwasiGadget || 'Ya, sejak SD',
      37: data.q28_installAplikasiBelajarAnak || 'Ya',
      38: data.q29_installAplikasiPengawasanOrtu || 'Ya',
      39: data.q30_jarakKeSekolah || '0 - 5 km',
      40: data.q31_kendaraanSekolah || 'Motor',
      41: data.q32_izinBawaMotorSendiri || 'Tidak',
      42: data.q33_harapanSekolah || '',
      43: data.q34_ttdMeterai || 'Ya',
      44: data.pernyataanSetuju ? 'SETUJU (Pernyataan benar dan dapat dipertanggungjawabkan)' : 'BELUM SETUJU'
    };

    map[data.noPendaftaran] = rowMap;
    localStorage.setItem(LOCAL_OTM_RAW_KEY, JSON.stringify(map));

    const gasUrl = this.getGasUrl();
    if (gasUrl && navigator.onLine) {
      const rawSiswa = localStorage.getItem(LOCAL_SISWA_KEY);
      const siswaList: DataSiswa[] = rawSiswa ? JSON.parse(rawSiswa) : INITIAL_DATA_SISWA;
      const st = siswaList.find(s => s.noPendaftaran === data.noPendaftaran);
      await postToGas(gasUrl, {
        action: 'saveFormIsianOrtu',
        noPendaftaran: data.noPendaftaran,
        otmMap: rowMap,
        siswa: st || {}
      });
      this.setLastSyncTime();
    }

    return { success: true, message: 'Form Wawancara Orang Tua (34 butir) berhasil disimpan di Sheet OTM!' };
  },

  // Simpan Data Siswa
  async saveDataSiswa(siswa: DataSiswa): Promise<{ success: boolean; data: DataSiswa }> {
    const raw = localStorage.getItem(LOCAL_SISWA_KEY);
    const all: DataSiswa[] = raw ? JSON.parse(raw) : INITIAL_DATA_SISWA;
    const index = all.findIndex(s => s.noPendaftaran === siswa.noPendaftaran);
    if (index >= 0) {
      all[index] = { ...siswa, updatedAt: new Date().toISOString() };
    } else {
      all.push({ ...siswa, createdAt: new Date().toISOString() });
    }
    localStorage.setItem(LOCAL_SISWA_KEY, JSON.stringify(all));

    const gasUrl = this.getGasUrl();
    if (gasUrl && navigator.onLine) {
      await postToGas(gasUrl, { action: 'saveDataSiswa', siswa });
      this.setLastSyncTime();
    }

    return { success: true, data: siswa };
  },

  // Detail Siswa
  async getSiswaDetail(noPendaftaran: string) {
    const rawSiswa = localStorage.getItem(LOCAL_SISWA_KEY);
    const list: DataSiswa[] = rawSiswa ? JSON.parse(rawSiswa) : INITIAL_DATA_SISWA;
    const siswa = list.find(s => s.noPendaftaran.toLowerCase() === noPendaftaran.toLowerCase());
    if (!siswa) return null;

    const rawWs = localStorage.getItem(LOCAL_WS_KEY);
    const allWs: WawancaraSiswaData[] = rawWs ? JSON.parse(rawWs) : INITIAL_WAWANCARA_SISWA;
    const wawancaraSiswa = allWs.find(w => w.noPendaftaran.toLowerCase() === noPendaftaran.toLowerCase());

    const otmRaw = this.getOtmRawData(noPendaftaran);
    const hasilOrtu = this.getHasilWawancaraOrtu(noPendaftaran);
    const observasiSiswa = this.getObservasiSiswa(noPendaftaran);

    return {
      siswa,
      wawancaraSiswa,
      otmRaw,
      hasilOrtu,
      observasiSiswa
    };
  },

  // Cek Status Kelulusan
  async checkStatusKelulusan(keyword: string): Promise<StatusKelulusanInfo | null> {
    const term = keyword.trim().toLowerCase();
    if (!term) return null;

    const raw = localStorage.getItem(LOCAL_LULUS_KEY);
    const list: StatusKelulusanInfo[] = raw ? JSON.parse(raw) : INITIAL_STATUS_KELULUSAN;
    
    return list.find(item => 
      item.noPendaftaran.toLowerCase() === term || 
      item.nisn.toLowerCase() === term ||
      item.namaLengkap.toLowerCase().includes(term)
    ) || null;
  },

  updateStatusKelulusan(obs: ObservasiSiswaData) {
    const raw = localStorage.getItem(LOCAL_LULUS_KEY);
    const list: StatusKelulusanInfo[] = raw ? JSON.parse(raw) : INITIAL_STATUS_KELULUSAN;
    const idx = list.findIndex(l => l.noPendaftaran === obs.noPendaftaran);

    const statusMap = {
      'Diterima': 'LULUS',
      'Cadangan': 'CADANGAN',
      'Tidak Diterima': 'TIDAK_LULUS'
    } as const;

    const newStatus = statusMap[obs.rekomendasi] || 'PROSES_SELEKSI';
    const info: StatusKelulusanInfo = {
      noPendaftaran: obs.noPendaftaran,
      nisn: list[idx]?.nisn || '0112345678',
      namaLengkap: obs.namaSiswa,
      asalSekolah: list[idx]?.asalSekolah || 'SD/MI Pendaftar',
      jalur: 'Jalur Reguler / Gelombang 1',
      status: newStatus,
      skorAkhir: obs.rataRata,
      pesanPengumuman: newStatus === 'LULUS' 
        ? `Selamat! Berdasarkan hasil evaluasi observasi penguji siswa dan wawancara orang tua, ananda dinyatakan LULUS & DITERIMA di SMPIT PONDOK DUTA.`
        : (newStatus === 'CADANGAN' 
          ? `Ananda berada pada posisi CADANGAN dengan nilai rata-rata ${obs.rataRata}.`
          : `Mohon maaf, ananda belum memenuhi kuota penerimaan SMPIT Pondok Duta tahun ini.`),
      jadwalDaftarUlang: newStatus === 'LULUS' ? 'Hubungi CS SMPIT: 0822-2500-2011' : '-'
    };

    if (idx >= 0) {
      list[idx] = info;
    } else {
      list.push(info);
    }
    localStorage.setItem(LOCAL_LULUS_KEY, JSON.stringify(list));
  },

  // --- DATABASE USER & AUTENTIKASI ---
  getUsers(): UserAccount[] {
    const raw = localStorage.getItem(LOCAL_USERS_KEY);
    const list: UserAccount[] = raw ? JSON.parse(raw) : INITIAL_USER_ACCOUNTS;
    return list.filter(u => u.role === 'siswa');
  },

  getPewawancaraAccounts(): UserAccount[] {
    return INITIAL_PEWAWANCARA_ACCOUNTS;
  },

  getAdminAccounts(): UserAccount[] {
    return INITIAL_ADMIN_ACCOUNTS;
  },

  getCurrentUser(): UserAccount | null {
    const raw = localStorage.getItem(LOCAL_CURRENT_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  },

  setCurrentUser(user: UserAccount | null): void {
    if (user) {
      localStorage.setItem(LOCAL_CURRENT_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(LOCAL_CURRENT_USER_KEY);
    }
  },

  logoutUser(): void {
    localStorage.removeItem(LOCAL_CURRENT_USER_KEY);
  },

  // Pendaftaran Akun Siswa & Orang Tua Baru
  registerUser(payload: {
    namaSiswa: string;
    namaOrangTua: string;
    sekolahAsal: string;
    nomorHp: string;
    emailOrangTua: string;
  }): { success: boolean; kodePendaftaran: string; user: UserAccount; message: string } {
    const users = this.getUsers();

    let uniqueCode = '';
    let isUnique = false;
    let attempts = 0;
    while (!isUnique && attempts < 100) {
      attempts++;
      uniqueCode = generateRandomKodePendaftaran();
      if (!users.some(u => u.kodePendaftaran.toUpperCase() === uniqueCode.toUpperCase())) {
        isUnique = true;
      }
    }

    const newUser: UserAccount = {
      id: `USR-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      kodePendaftaran: uniqueCode,
      namaSiswa: payload.namaSiswa.trim(),
      namaOrangTua: payload.namaOrangTua.trim(),
      sekolahAsal: payload.sekolahAsal.trim(),
      nomorHp: payload.nomorHp.trim(),
      emailOrangTua: payload.emailOrangTua.trim(),
      createdAt: new Date().toISOString(),
      role: 'siswa'
    };

    users.push(newUser);
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));

    const rawSiswa = localStorage.getItem(LOCAL_SISWA_KEY);
    const siswaList: DataSiswa[] = rawSiswa ? JSON.parse(rawSiswa) : INITIAL_DATA_SISWA;

    const newStudentData: DataSiswa = {
      id: `SISWA-${Date.now()}`,
      noPendaftaran: uniqueCode,
      createdAt: new Date().toISOString(),
      namaLengkap: payload.namaSiswa.trim(),
      namaPanggilan: payload.namaSiswa.trim().split(' ')[0],
      nisn: `00${Math.floor(10000000 + Math.random() * 90000000)}`,
      jenisKelamin: 'Laki-laki',
      tempatLahir: 'Depok',
      tanggalLahir: '2013-01-01',
      agama: 'Islam',
      kewarganegaraan: 'Indonesia',
      anakNomorKe: 1,
      jumlahSaudaraKandung: 1,
      jumlahSaudaraTiri: 0,
      jumlahSaudaraAngkat: 0,
      bahasaSehariHari: 'Bahasa Indonesia',
      alamat: 'Dalam proses pengisian berkas pendaftaran',
      kelurahan: 'Tugu',
      kecamatan: 'Cimanggis',
      kotaKabupaten: 'Depok',
      nomorTelepon: payload.nomorHp.trim(),
      nomorHandphone: payload.nomorHp.trim(),
      bertempatTinggalPada: 'Orang Tua',
      jarakKeSekolahKm: '2.0',
      saranaBerangkatSekolah: 'Motor',
      beratBadanKg: 40,
      tinggiBadanCm: 150,
      golonganDarah: 'O',
      penyakitBerat: '-',
      kelainanJasmani: '-',
      masukSebagai: 'Siswa Baru',
      asalSekolah: payload.sekolahAsal.trim(),
      nomorIjazah: '-',
      kegemaranKesenian: '-',
      kegemaranOlahraga: '-',
      kegemaranOrganisasi: '-',
      menerimaBeasiswa: '-',
      memenangkanKejuaraan: '-',
      namaAyah: payload.namaOrangTua.trim(),
      tempatTanggalLahirAyah: '-',
      agamaAyah: 'Islam',
      kewarganegaraanAyah: 'Indonesia',
      pendidikanAyah: 'S1',
      pekerjaanAyah: 'Wiraswasta / Karyawan',
      penghasilanAyah: 'Rp. 5jt - Rp. 10jt',
      alamatAyah: 'Alamat orang tua siswa',
      noHpAyah: payload.nomorHp.trim(),
      emailAyah: payload.emailOrangTua.trim(),
      statusPerkawinanAyah: 'Suami',
      namaIbu: payload.namaOrangTua.trim(),
      tempatTanggalLahirIbu: '-',
      agamaIbu: 'Islam',
      kewarganegaraanIbu: 'Indonesia',
      pendidikanIbu: 'S1',
      pekerjaanIbu: 'Ibu Rumah Tangga / Karyawan',
      penghasilanIbu: 'dibawah Rp. 5jt',
      alamatIbu: 'Alamat orang tua siswa',
      noHpIbu: payload.nomorHp.trim(),
      emailIbu: payload.emailOrangTua.trim(),
      statusPerkawinanIbu: 'Istri'
    };

    siswaList.push(newStudentData);
    localStorage.setItem(LOCAL_SISWA_KEY, JSON.stringify(siswaList));

    // Sinkronisasi otomatis ke Google Spreadsheet jika GAS Web App sudah terhubung
    const gasUrl = this.getGasUrl();
    if (gasUrl && navigator.onLine) {
      postToGas(gasUrl, {
        action: 'registerUser',
        user: newUser,
        siswa: newStudentData
      });
      this.setLastSyncTime();
    }

    this.setCurrentUser(newUser);

    return {
      success: true,
      kodePendaftaran: uniqueCode,
      user: newUser,
      message: `Pendaftaran akun berhasil! Kode pendaftaran Anda adalah ${uniqueCode}.`
    };
  },

  // Login cukup memasukkan kode (Calon Siswa, Pewawancara, atau Admin)
  loginWithKode(kode: string): { success: boolean; user?: UserAccount; message: string } {
    const cleanKode = kode.trim().toUpperCase();
    if (!cleanKode) {
      return { 
        success: false, 
        message: 'Silakan masukkan Kode Calon Siswa, Kode Pewawancara, atau Kode Admin Anda.' 
      };
    }

    // 1. Cek apakah menggunakan Kode Admin (Role 3: Admin)
    const adminList = this.getAdminAccounts();
    const foundAdmin = adminList.find(
      a => a.kodePendaftaran.trim().toUpperCase() === cleanKode
    );

    if (foundAdmin) {
      const adminAccount: UserAccount = {
        ...foundAdmin,
        role: 'admin'
      };
      this.setCurrentUser(adminAccount);
      return {
        success: true,
        user: adminAccount,
        message: `Login Admin berhasil! Selamat datang, ${adminAccount.namaSiswa}.`
      };
    }

    // 2. Cek apakah menggunakan Kode Pewawancara (Role 2: Pewawancara)
    const pewawancaraList = this.getPewawancaraAccounts();
    const foundPewawancara = pewawancaraList.find(
      p => p.kodePendaftaran.trim().toUpperCase() === cleanKode
    );

    if (foundPewawancara) {
      const guruAccount: UserAccount = {
        ...foundPewawancara,
        role: 'guru'
      };
      this.setCurrentUser(guruAccount);
      return {
        success: true,
        user: guruAccount,
        message: `Login Pewawancara berhasil! Selamat bertugas, ${guruAccount.namaSiswa}.`
      };
    }

    // 3. Cek apakah menggunakan Kode Calon Siswa (Role 1: Calon Siswa)
    const users = this.getUsers();
    let found = users.find(u => u.kodePendaftaran.trim().toUpperCase() === cleanKode);

    if (!found) {
      const rawSiswa = localStorage.getItem(LOCAL_SISWA_KEY);
      const siswaList: DataSiswa[] = rawSiswa ? JSON.parse(rawSiswa) : INITIAL_DATA_SISWA;
      const matchingSiswa = siswaList.find(s => s.noPendaftaran.trim().toUpperCase() === cleanKode);
      if (matchingSiswa) {
        found = {
          id: `USR-${matchingSiswa.id}`,
          kodePendaftaran: matchingSiswa.noPendaftaran,
          namaSiswa: matchingSiswa.namaLengkap,
          namaOrangTua: matchingSiswa.namaAyah || matchingSiswa.namaIbu || 'Orang Tua',
          sekolahAsal: matchingSiswa.asalSekolah,
          nomorHp: matchingSiswa.nomorHandphone,
          emailOrangTua: `${matchingSiswa.namaPanggilan.toLowerCase()}@example.com`,
          createdAt: matchingSiswa.createdAt,
          role: 'siswa'
        };
        users.push(found);
        localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
      }
    }

    if (!found) {
      return {
        success: false,
        message: `Kode "${cleanKode}" tidak ditemukan. Pastikan Anda memasukkan Kode Calon Siswa, Kode Pewawancara, atau Kode Admin yang benar.`
      };
    }

    const siswaAccount: UserAccount = {
      ...found,
      role: 'siswa'
    };

    this.setCurrentUser(siswaAccount);
    return {
      success: true,
      user: siswaAccount,
      message: `Login berhasil! Selamat datang, ${siswaAccount.namaSiswa}.`
    };
  },

  resetToMockData() {
    localStorage.setItem(LOCAL_SISWA_KEY, JSON.stringify(INITIAL_DATA_SISWA));
    localStorage.setItem(LOCAL_OTM_RAW_KEY, JSON.stringify(INITIAL_OTM_RAW_MAP));
    localStorage.setItem(LOCAL_HASIL_ORTU_KEY, JSON.stringify(INITIAL_HASIL_WAWANCARA_ORTU_MAP));
    localStorage.setItem(LOCAL_OBS_SISWA_KEY, JSON.stringify(INITIAL_OBSERVASI_SISWA_LIST));
    localStorage.setItem(LOCAL_WS_KEY, JSON.stringify(INITIAL_WAWANCARA_SISWA));
    localStorage.setItem(LOCAL_LULUS_KEY, JSON.stringify(INITIAL_STATUS_KELULUSAN));
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(INITIAL_USER_ACCOUNTS));
    localStorage.removeItem(LOCAL_CURRENT_USER_KEY);
  }
};
