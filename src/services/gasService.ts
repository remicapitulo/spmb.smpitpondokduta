import { 
  DataSiswa, 
  WawancaraSiswaData, 
  HasilObservasiOrtuData, 
  ObservasiSiswaData, 
  StatusKelulusanInfo,
  FormWawancaraOrtuPDF,
  UserAccount,
  DataIndukSiswa
} from '../types';
import { DEFAULT_SPREADSHEET_ID, DEFAULT_GAS_WEB_APP_URL, DEFAULT_DRIVE_FOLDER_URL } from './gasCodeSnippet';

export interface AppSettingsConfig {
  driveFolderUrl: string;
  logoUrl: string;
  logoDriveUrl?: string;
  heroPhotoUrl: string;
  heroDriveUrl?: string;
  heroCropMode: 'cutout' | 'full';
  isCloudSynced?: boolean;
  updatedAt?: string;
}

/**
 * Mengubah link Google Drive (misal https://drive.google.com/file/d/ID/view atau link thumbnail)
 * menjadi direct high-resolution image URL (=s0) agar 100% jernih, tajam, dan tidak pecah/buram.
 */
export function resolveRenderableImageUrl(rawUrl?: string): string {
  if (!rawUrl) return '';
  const trimmed = rawUrl.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('data:image/')) return trimmed;

  // 1. Format: https://drive.google.com/file/d/FILE_ID/...
  const fileMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9-_]+)/);
  if (fileMatch && fileMatch[1]) {
    // Parameter =s0 memastikan Google CDN mengirimkan resolusi asli/maksimal tanpa kompresi buram
    return `https://lh3.googleusercontent.com/d/${fileMatch[1]}=s0`;
  }

  // 2. Format: https://drive.google.com/open?id=FILE_ID atau ?id=FILE_ID
  const idMatch = trimmed.match(/[?&]id=([a-zA-Z0-9-_]+)/);
  if (idMatch && idMatch[1] && trimmed.includes('drive.google.com')) {
    return `https://lh3.googleusercontent.com/d/${idMatch[1]}=s0`;
  }

  // 3. Format: https://lh3.googleusercontent.com/d/FILE_ID (tambahkan =s0 jika belum memiliki parameter scale)
  const lh3Match = trimmed.match(/lh3\.googleusercontent\.com\/d\/([a-zA-Z0-9-_]+)/);
  if (lh3Match && lh3Match[1]) {
    if (!trimmed.includes('=') && !trimmed.includes('&sz=')) {
      return `https://lh3.googleusercontent.com/d/${lh3Match[1]}=s0`;
    }
  }

  return trimmed;
}

/**
 * Menjamin dataUrl Base64 selalu di bawah batas karakter sel Google Spreadsheet (< 38.000 karakter)
 * sehingga tidak pernah gagal disimpan ke Sheet "Setting" maupun saat diunggah ke Folder Drive.
 */
export function compressDataUrlToSafeSheetSize(
  dataUrl: string,
  maxChars = 38000,
  startMaxDim = 560,
  preferPng = false
): Promise<string> {
  return new Promise((resolve) => {
    if (!dataUrl || !dataUrl.startsWith('data:image/')) {
      resolve(dataUrl || '');
      return;
    }
    if (dataUrl.length <= maxChars && typeof document === 'undefined') {
      resolve(dataUrl);
      return;
    }
    if (typeof document === 'undefined') {
      resolve(dataUrl.substring(0, maxChars));
      return;
    }

    const img = new Image();
    img.onload = () => {
      let maxDim = startMaxDim;
      let quality = 0.78;
      let currentUrl = dataUrl;

      const renderPass = (dim: number, mime: string, q: number): string => {
        const canvas = document.createElement('canvas');
        let w = img.width || dim;
        let h = img.height || dim;
        if (w > dim || h > dim) {
          if (w > h) {
            h = Math.max(1, Math.round((h * dim) / w));
            w = dim;
          } else {
            w = Math.max(1, Math.round((w * dim) / h));
            h = dim;
          }
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) return currentUrl;
        if (mime === 'image/jpeg') {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, w, h);
        }
        ctx.drawImage(img, 0, 0, w, h);
        return canvas.toDataURL(mime, q);
      };

      if (preferPng) {
        const pngTry = renderPass(Math.min(maxDim, 240), 'image/png', 0.9);
        if (pngTry.length <= maxChars) {
          resolve(pngTry);
          return;
        }
      }

      currentUrl = renderPass(maxDim, 'image/jpeg', quality);
      let attempts = 0;
      while (currentUrl.length > maxChars && attempts < 8) {
        attempts++;
        quality = Math.max(0.42, quality - 0.08);
        maxDim = Math.max(240, Math.round(maxDim * 0.82));
        currentUrl = renderPass(maxDim, 'image/jpeg', quality);
      }

      resolve(currentUrl);
    };
    img.onerror = () => resolve(dataUrl.length <= maxChars ? dataUrl : '');
    img.src = dataUrl;
  });
}

const GAS_URL_KEY = 'spmb_pondok_duta_gas_url';
const SPREADSHEET_ID_KEY = 'spmb_pondok_duta_spreadsheet_id';
const LAST_SYNC_KEY = 'spmb_pondok_duta_last_sync';
const APP_SETTINGS_KEY = 'spmb_pondok_duta_app_settings';
const LEGACY_HERO_PHOTO_KEY = 'spmb_pd_eflayer_full_v1';
const LEGACY_HERO_CROP_KEY = 'spmb_pd_eflayer_crop_mode_v1';
const LOCAL_SISWA_KEY = 'spmb_pd_siswa_data';
const LOCAL_DATA_INDUK_KEY = 'spmb_pd_data_induk_list';
const LOCAL_OTM_RAW_KEY = 'spmb_pd_otm_raw_map';
const LOCAL_HASIL_ORTU_KEY = 'spmb_pd_hasil_ortu_map';
const LOCAL_OBS_SISWA_KEY = 'spmb_pd_observasi_siswa_list';
const LOCAL_WS_KEY = 'spmb_pd_wawancara_siswa_data';
const LOCAL_LULUS_KEY = 'spmb_pd_status_kelulusan';
const LOCAL_USERS_KEY = 'spmb_pd_users_db';
const LOCAL_CURRENT_USER_KEY = 'spmb_pd_current_user';
const PURE_DB_MODE_KEY = 'spmb_pd_pure_db_mode_v2';

// State deduplikasi dan throttling sinkronisasi Google Apps Script
let _lastSyncTimeMs = 0;
let _ongoingSyncPromise: Promise<{ success: boolean; message: string }> | null = null;

export const INITIAL_USER_ACCOUNTS: UserAccount[] = [];
export const INITIAL_PEWAWANCARA_ACCOUNTS: UserAccount[] = [];
export const INITIAL_ADMIN_ACCOUNTS: UserAccount[] = [];

/**
 * Mengonversi data pendaftaran siswa (DataSiswa) menjadi entri Buku Induk Sekolah (DataIndukSiswa)
 * yang seluruh kolomnya lengkap tanpa JSON.
 */
export function convertDataSiswaToDataInduk(siswa: DataSiswa, nis = '', noUrut?: number): DataIndukSiswa {
  return {
    id: `INDUK-${siswa.noPendaftaran}`,
    noUrut: noUrut || 1,
    nis: nis || '',
    nisn: siswa.nisn || '',
    nik: siswa.nik || '',
    noPendaftaran: siswa.noPendaftaran,
    namaLengkap: siswa.namaLengkap,
    namaPanggilan: siswa.namaPanggilan || (siswa.namaLengkap ? siswa.namaLengkap.split(' ')[0] : ''),
    jenisKelamin: siswa.jenisKelamin || 'Laki-laki',
    tempatLahir: siswa.tempatLahir || '',
    tanggalLahir: siswa.tanggalLahir || '',
    agama: siswa.agama || 'Islam',
    kewarganegaraan: siswa.kewarganegaraan || 'Indonesia',
    anakNomorKe: siswa.anakNomorKe !== undefined ? siswa.anakNomorKe : (siswa.anakKe || 1),
    jumlahSaudaraKandung: siswa.jumlahSaudaraKandung !== undefined ? siswa.jumlahSaudaraKandung : (siswa.jumlahSaudara || 0),
    jumlahSaudaraTiri: siswa.jumlahSaudaraTiri || 0,
    jumlahSaudaraAngkat: siswa.jumlahSaudaraAngkat || 0,
    bahasaSehariHari: siswa.bahasaSehariHari || 'Bahasa Indonesia',
    beratBadanKg: siswa.beratBadanKg || '',
    tinggiBadanCm: siswa.tinggiBadanCm || '',
    golonganDarah: siswa.golonganDarah || '-',
    penyakitBerat: siswa.penyakitBerat || (siswa.riwayatPenyakit || '-'),
    kelainanJasmani: siswa.kelainanJasmani || '-',
    alamat: siswa.alamat || '',
    kelurahan: siswa.kelurahan || '',
    kecamatan: siswa.kecamatan || '',
    kotaKabupaten: siswa.kotaKabupaten || '',
    nomorTelepon: siswa.nomorTelepon || '',
    nomorHandphone: siswa.nomorHandphone || siswa.nomorTelepon || '',
    bertempatTinggalPada: siswa.bertempatTinggalPada || 'Orang Tua',
    jarakKeSekolahKm: siswa.jarakKeSekolahKm || '',
    saranaBerangkatSekolah: siswa.saranaBerangkatSekolah || '',
    masukSebagai: siswa.masukSebagai || 'Siswa Baru',
    asalSekolah: siswa.asalSekolah || '',
    nomorIjazah: siswa.nomorIjazah || '-',
    kegemaranKesenian: siswa.kegemaranKesenian || '-',
    kegemaranOlahraga: siswa.kegemaranOlahraga || '-',
    kegemaranOrganisasi: siswa.kegemaranOrganisasi || '-',
    menerimaBeasiswa: siswa.menerimaBeasiswa || '-',
    memenangkanKejuaraan: siswa.memenangkanKejuaraan || (siswa.prestasi || '-'),
    namaAyah: siswa.namaAyah || '',
    tempatTanggalLahirAyah: siswa.tempatTanggalLahirAyah || '',
    agamaAyah: siswa.agamaAyah || 'Islam',
    pendidikanAyah: siswa.pendidikanAyah || '',
    pekerjaanAyah: siswa.pekerjaanAyah || '',
    penghasilanAyah: siswa.penghasilanAyah || '',
    alamatAyah: siswa.alamatAyah || '',
    noHpAyah: siswa.noHpAyah || '',
    emailAyah: siswa.emailAyah || '',
    statusPerkawinanAyah: siswa.statusPerkawinanAyah || '-',
    namaIbu: siswa.namaIbu || '',
    tempatTanggalLahirIbu: siswa.tempatTanggalLahirIbu || '',
    agamaIbu: siswa.agamaIbu || 'Islam',
    pendidikanIbu: siswa.pendidikanIbu || '',
    pekerjaanIbu: siswa.pekerjaanIbu || '',
    penghasilanIbu: siswa.penghasilanIbu || '',
    alamatIbu: siswa.alamatIbu || '',
    noHpIbu: siswa.noHpIbu || '',
    emailIbu: siswa.emailIbu || '',
    statusPerkawinanIbu: siswa.statusPerkawinanIbu || '-',
    namaWali: siswa.namaWali || '-',
    tempatTanggalLahirWali: siswa.tempatTanggalLahirWali || '-',
    agamaWali: siswa.agamaWali || '-',
    pendidikanWali: siswa.pendidikanWali || '-',
    pekerjaanWali: siswa.pekerjaanWali || '-',
    penghasilanWali: siswa.penghasilanWali || '-',
    alamatWali: siswa.alamatWali || '-',
    noHpWali: siswa.noHpWali || '-',
    statusHubunganWali: siswa.statusHubunganWali || '-',
    statusKelulusan: 'LULUS',
    tahunPelajaran: '2027/2028',
    tanggalDiterima: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }),
    catatanKhusus: '-',
    updatedAt: new Date().toISOString()
  };
}

// Generator kode pendaftaran acak, unik & sulit ditebak (misal: PD27-7K9W2X)
export function generateRandomKodePendaftaran(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let rand = '';
  for (let i = 0; i < 6; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `PD27-${rand}`;
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

// Inisialisasi LocalStorage (murni membaca dari Database Google Spreadsheet tanpa data dummy)
function initLocalStorage() {
  if (!localStorage.getItem(SPREADSHEET_ID_KEY)) {
    localStorage.setItem(SPREADSHEET_ID_KEY, DEFAULT_SPREADSHEET_ID);
  }
  if (!localStorage.getItem(GAS_URL_KEY)) {
    localStorage.setItem(GAS_URL_KEY, DEFAULT_GAS_WEB_APP_URL);
  }

  // Bersihkan sisa cache data dummy lama di browser sekali saja agar murni menarik dari Database Spreadsheet
  if (!localStorage.getItem(PURE_DB_MODE_KEY)) {
    localStorage.setItem(LOCAL_SISWA_KEY, JSON.stringify([]));
    localStorage.setItem(LOCAL_OTM_RAW_KEY, JSON.stringify({}));
    localStorage.setItem(LOCAL_HASIL_ORTU_KEY, JSON.stringify({}));
    localStorage.setItem(LOCAL_OBS_SISWA_KEY, JSON.stringify([]));
    localStorage.setItem(LOCAL_WS_KEY, JSON.stringify([]));
    localStorage.setItem(LOCAL_LULUS_KEY, JSON.stringify([]));
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify([]));
    localStorage.setItem(PURE_DB_MODE_KEY, 'true');
  } else {
    if (!localStorage.getItem(LOCAL_SISWA_KEY)) {
      localStorage.setItem(LOCAL_SISWA_KEY, JSON.stringify([]));
    }
    if (!localStorage.getItem(LOCAL_OTM_RAW_KEY)) {
      localStorage.setItem(LOCAL_OTM_RAW_KEY, JSON.stringify({}));
    }
    if (!localStorage.getItem(LOCAL_HASIL_ORTU_KEY)) {
      localStorage.setItem(LOCAL_HASIL_ORTU_KEY, JSON.stringify({}));
    }
    if (!localStorage.getItem(LOCAL_OBS_SISWA_KEY)) {
      localStorage.setItem(LOCAL_OBS_SISWA_KEY, JSON.stringify([]));
    }
    if (!localStorage.getItem(LOCAL_WS_KEY)) {
      localStorage.setItem(LOCAL_WS_KEY, JSON.stringify([]));
    }
    if (!localStorage.getItem(LOCAL_LULUS_KEY)) {
      localStorage.setItem(LOCAL_LULUS_KEY, JSON.stringify([]));
    }
    if (!localStorage.getItem(LOCAL_USERS_KEY)) {
      localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify([]));
    }
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

  resolveImageUrl(rawUrl?: string): string {
    return resolveRenderableImageUrl(rawUrl);
  },

  getAppSettings(): AppSettingsConfig {
    try {
      const raw = localStorage.getItem(APP_SETTINGS_KEY);
      const legacyHero = localStorage.getItem(LEGACY_HERO_PHOTO_KEY) || '';
      const legacyCrop = (localStorage.getItem(LEGACY_HERO_CROP_KEY) as 'cutout' | 'full') || 'cutout';
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          driveFolderUrl: parsed.driveFolderUrl || DEFAULT_DRIVE_FOLDER_URL,
          logoUrl: parsed.logoUrl || '/logo-smpit-pondok-duta.png',
          logoDriveUrl: parsed.logoDriveUrl || '',
          heroPhotoUrl: parsed.heroPhotoUrl !== undefined ? parsed.heroPhotoUrl : legacyHero,
          heroDriveUrl: parsed.heroDriveUrl || '',
          heroCropMode: parsed.heroCropMode || legacyCrop,
          isCloudSynced: parsed.isCloudSynced,
          updatedAt: parsed.updatedAt
        };
      }
      return {
        driveFolderUrl: DEFAULT_DRIVE_FOLDER_URL,
        logoUrl: '/logo-smpit-pondok-duta.png',
        logoDriveUrl: '',
        heroPhotoUrl: legacyHero,
        heroDriveUrl: '',
        heroCropMode: legacyCrop
      };
    } catch {
      return {
        driveFolderUrl: DEFAULT_DRIVE_FOLDER_URL,
        logoUrl: '/logo-smpit-pondok-duta.png',
        logoDriveUrl: '',
        heroPhotoUrl: '',
        heroDriveUrl: '',
        heroCropMode: 'cutout'
      };
    }
  },

  async saveAppSettings(partial: Partial<AppSettingsConfig>, customGasUrl?: string): Promise<{
    success: boolean;
    settings: AppSettingsConfig;
    message: string;
  }> {
    const current = this.getAppSettings();
    const rawLogo = partial.logoUrl !== undefined ? partial.logoUrl : current.logoUrl;
    const rawHero = partial.heroPhotoUrl !== undefined ? partial.heroPhotoUrl : current.heroPhotoUrl;

    // Pastikan ukuran data gambar selalu < 38.000 karakter agar 100% muat di sel Sheet "Setting" & cepat diunggah ke Folder Drive
    const safeLogo = rawLogo.startsWith('data:image/')
      ? await compressDataUrlToSafeSheetSize(rawLogo, 30000, 240, true)
      : rawLogo;
    const safeHero = rawHero.startsWith('data:image/')
      ? await compressDataUrlToSafeSheetSize(rawHero, 38000, 560, false)
      : rawHero;

    const updated: AppSettingsConfig = {
      ...current,
      ...partial,
      logoUrl: safeLogo,
      heroPhotoUrl: safeHero,
      updatedAt: new Date().toISOString()
    };

    try {
      localStorage.setItem(APP_SETTINGS_KEY, JSON.stringify(updated));
      if (updated.heroPhotoUrl) {
        localStorage.setItem(LEGACY_HERO_PHOTO_KEY, updated.heroPhotoUrl);
      } else {
        localStorage.removeItem(LEGACY_HERO_PHOTO_KEY);
      }
      localStorage.setItem(LEGACY_HERO_CROP_KEY, updated.heroCropMode);
    } catch (e) {
      console.warn('LocalStorage quota warning when saving settings:', e);
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('spmb_settings_updated'));
    }

    const gasUrl = (customGasUrl || this.getGasUrl()).trim();
    if (gasUrl && navigator.onLine) {
      // 1. Coba unggah sebagai file fisik ke Folder Google Drive terlebih dahulu (bila Code.gs sudah memiliki uploadAssetToDrive)
      if (safeLogo.startsWith('data:image/')) {
        const upLogo = await postToGas(gasUrl, {
          action: 'uploadAssetToDrive',
          base64Data: safeLogo,
          filePrefix: 'Logo_Sekolah',
          driveFolderUrl: updated.driveFolderUrl
        });
        if (upLogo && upLogo.success && upLogo.driveViewUrl) {
          updated.logoDriveUrl = upLogo.driveViewUrl;
        }
      }
      if (safeHero.startsWith('data:image/')) {
        const upHero = await postToGas(gasUrl, {
          action: 'uploadAssetToDrive',
          base64Data: safeHero,
          filePrefix: 'Foto_Badge_Beranda',
          driveFolderUrl: updated.driveFolderUrl
        });
        if (upHero && upHero.success && upHero.driveViewUrl) {
          updated.heroDriveUrl = upHero.driveViewUrl;
        }
      }

      // 2. Simpan ke Sheet "Setting" di Google Spreadsheet DataBaseSiswa
      const res = await postToGas(gasUrl, {
        action: 'saveSettings',
        settings: updated
      });
      this.setLastSyncTime();
      if (res && res.success) {
        if (res.settings) {
          if (res.settings.logoDriveUrl) updated.logoDriveUrl = res.settings.logoDriveUrl;
          if (res.settings.heroDriveUrl) updated.heroDriveUrl = res.settings.heroDriveUrl;
        }
        updated.isCloudSynced = true;
        try {
          localStorage.setItem(APP_SETTINGS_KEY, JSON.stringify(updated));
        } catch {}
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('spmb_settings_updated'));
        }
        return {
          success: true,
          settings: updated,
          message:
            res.message ||
            'Berhasil! Logo, Foto Badge Beranda & Link Folder Drive telah tersimpan di Sheet "Setting" & Folder Cloud (tampil di semua perangkat).'
        };
      } else if (res && (res.error || res.message)) {
        return {
          success: false,
          settings: updated,
          message: `Gagal menyimpan ke Sheet Setting: ${res.message || res.error}`
        };
      }
    }

    return {
      success: true,
      settings: updated,
      message: 'Pengaturan disimpan secara lokal. Pastikan koneksi internet aktif untuk sinkronisasi ke Sheet "Setting".'
    };
  },

  /**
   * Menarik pengaturan Logo, Foto Badge Beranda & Link Folder Drive langsung dari Sheet "Setting"
   * saat aplikasi dibuka dari perangkat/browser manapun.
   * Jika perangkat Admin memiliki Foto Badge / Logo lokal yang belum masuk ke Sheet "Setting",
   * otomatis mengunggahnya ke Sheet "Setting" agar perangkat lain ikut menampilkan foto tersebut.
   */
  async syncSettingsFromCloud(customGasUrl?: string): Promise<AppSettingsConfig> {
    const gasUrl = (customGasUrl || this.getGasUrl()).trim();
    const localSettings = this.getAppSettings();
    if (!gasUrl || !navigator.onLine) return localSettings;

    try {
      const separator = gasUrl.includes('?') ? '&' : '?';
      const response = await fetch(`${gasUrl}${separator}action=getSettings`, {
        method: 'GET',
        mode: 'cors'
      });
      const json = await response.json();
      if (json && json.success && json.settings) {
        const remote = json.settings;

        // Jika di Sheet "Setting" HERO_PHOTO_URL atau LOGO_URL masih kosong, sedangkan di browser ini ada fotonya,
        // otomatis kompres (<38KB) dan unggah ke Sheet "Setting" sekarang juga!
        const needAutoPushHero = !remote.heroPhotoUrl && Boolean(localSettings.heroPhotoUrl);
        const needAutoPushLogo = !remote.logoUrl && Boolean(localSettings.logoUrl);

        if (needAutoPushHero || needAutoPushLogo) {
          const pushed = await this.saveAppSettings(
            {
              driveFolderUrl: remote.driveFolderUrl || localSettings.driveFolderUrl || DEFAULT_DRIVE_FOLDER_URL,
              logoUrl: remote.logoUrl || localSettings.logoUrl || '',
              heroPhotoUrl: remote.heroPhotoUrl || localSettings.heroPhotoUrl || '',
              heroCropMode: (remote.heroCropMode as 'cutout' | 'full') || localSettings.heroCropMode || 'cutout'
            },
            gasUrl
          );
          return pushed.settings;
        }

        const merged: AppSettingsConfig = {
          driveFolderUrl: remote.driveFolderUrl || localSettings.driveFolderUrl || DEFAULT_DRIVE_FOLDER_URL,
          logoUrl: remote.logoUrl || localSettings.logoUrl || '',
          logoDriveUrl: remote.logoDriveUrl || localSettings.logoDriveUrl || '',
          heroPhotoUrl: remote.heroPhotoUrl || localSettings.heroPhotoUrl || '',
          heroDriveUrl: remote.heroDriveUrl || localSettings.heroDriveUrl || '',
          heroCropMode: (remote.heroCropMode as 'cutout' | 'full') || localSettings.heroCropMode || 'cutout',
          isCloudSynced: Boolean(remote.logoUrl || remote.heroPhotoUrl),
          updatedAt: new Date().toISOString()
        };

        try {
          localStorage.setItem(APP_SETTINGS_KEY, JSON.stringify(merged));
          if (merged.heroPhotoUrl) {
            localStorage.setItem(LEGACY_HERO_PHOTO_KEY, merged.heroPhotoUrl);
          }
          localStorage.setItem(LEGACY_HERO_CROP_KEY, merged.heroCropMode);
        } catch {}

        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('spmb_settings_updated'));
        }
        return merged;
      }
    } catch (e) {
      console.warn('syncSettingsFromCloud warning:', e);
    }
    return localSettings;
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
    const allUsers: UserAccount[] = rawUsers ? JSON.parse(rawUsers) : [];

    const rawSiswa = localStorage.getItem(LOCAL_SISWA_KEY);
    const siswaList: DataSiswa[] = rawSiswa ? JSON.parse(rawSiswa) : [];

    const rawOtm = localStorage.getItem(LOCAL_OTM_RAW_KEY);
    const otmMap = rawOtm ? JSON.parse(rawOtm) : {};

    const rawHasil = localStorage.getItem(LOCAL_HASIL_ORTU_KEY);
    const hasilOrtuMap = rawHasil ? JSON.parse(rawHasil) : {};

    const rawObs = localStorage.getItem(LOCAL_OBS_SISWA_KEY);
    const observasiList = rawObs ? JSON.parse(rawObs) : [];

    const rawLulus = localStorage.getItem(LOCAL_LULUS_KEY);
    const kelulusanList = rawLulus ? JSON.parse(rawLulus) : [];

    const rawDataInduk = localStorage.getItem(LOCAL_DATA_INDUK_KEY);
    const dataIndukList: DataIndukSiswa[] = rawDataInduk ? JSON.parse(rawDataInduk) : [];

    const settings = this.getAppSettings();

    const res = await postToGas(gasUrl, {
      action: 'syncAllToSheet',
      spreadsheetId: this.getSpreadsheetId(),
      settings,
      users: allUsers,
      siswaList,
      dataIndukList,
      otmMap,
      hasilOrtuMap,
      observasiList,
      kelulusanList
    });

    if (res && res.success) {
      this.setLastSyncTime();
      return {
        success: true,
        message: res.message || `Seluruh data (${siswaList.length} Siswa, ${dataIndukList.length} Data Induk, ${allUsers.length} Akun, Sheet Setting, Jawaban OTM, Wawancara & Kelulusan) berhasil diunggah ke Spreadsheet!`
      };
    }

    return {
      success: false,
      message: res?.message || res?.error || 'Gagal mengunggah data ke Google Spreadsheet.'
    };
  },

  // Tarik / Sinkronisasi seluruh data dari Google Spreadsheet ke aplikasi lokal
  async syncFromSpreadsheet(customGasUrl?: string, forceRefresh: boolean = false): Promise<{
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

    // 1. Throttling: Jika baru saja sinkron dalam 15 detik terakhir dan tidak dipaksa (force), gunakan data lokal
    const now = Date.now();
    if (!forceRefresh && (now - _lastSyncTimeMs < 15000)) {
      return {
        success: true,
        message: 'Data lokal sudah yang terbaru (sinkronisasi aktif).'
      };
    }

    // 2. Request Deduplication: Jika ada request sync yang sedang berjalan, ikuti promise yang sama
    if (_ongoingSyncPromise) {
      return _ongoingSyncPromise;
    }

    _ongoingSyncPromise = (async () => {
      try {
        const separator = gasUrl.includes('?') ? '&' : '?';
        const response = await fetch(`${gasUrl}${separator}action=getAllData`, {
          method: 'GET',
          mode: 'cors'
        });
        const json = await response.json();

        if (json && json.success && json.data) {
          _lastSyncTimeMs = Date.now();
          const db = json.data;

          if (db.settings && typeof db.settings === 'object') {
            const currentSettings = this.getAppSettings();
            const needAutoPushHero = !db.settings.heroPhotoUrl && Boolean(currentSettings.heroPhotoUrl);
            const needAutoPushLogo = !db.settings.logoUrl && Boolean(currentSettings.logoUrl);

            const mergedSettings: AppSettingsConfig = {
              driveFolderUrl: db.settings.driveFolderUrl || currentSettings.driveFolderUrl || DEFAULT_DRIVE_FOLDER_URL,
              logoUrl: db.settings.logoUrl || currentSettings.logoUrl || '',
              logoDriveUrl: db.settings.logoDriveUrl || currentSettings.logoDriveUrl || '',
              heroPhotoUrl: db.settings.heroPhotoUrl || currentSettings.heroPhotoUrl || '',
              heroDriveUrl: db.settings.heroDriveUrl || currentSettings.heroDriveUrl || '',
              heroCropMode: (db.settings.heroCropMode as 'cutout' | 'full') || currentSettings.heroCropMode || 'cutout',
              isCloudSynced: Boolean(db.settings.logoUrl && db.settings.heroPhotoUrl),
              updatedAt: new Date().toISOString()
            };

            if (needAutoPushHero || needAutoPushLogo) {
              await this.saveAppSettings(mergedSettings, gasUrl);
            } else {
              localStorage.setItem(APP_SETTINGS_KEY, JSON.stringify(mergedSettings));
              if (mergedSettings.heroPhotoUrl) {
                localStorage.setItem(LEGACY_HERO_PHOTO_KEY, mergedSettings.heroPhotoUrl);
              }
              localStorage.setItem(LEGACY_HERO_CROP_KEY, mergedSettings.heroCropMode);
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new Event('spmb_settings_updated'));
              }
            }
          }

          // Timpa penuh data lokal dengan data dari Google Spreadsheet (tanpa sisa data dummy)
          localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(Array.isArray(db.users) ? db.users : []));
          localStorage.setItem(LOCAL_SISWA_KEY, JSON.stringify(Array.isArray(db.siswaList) ? db.siswaList : []));
          if (Array.isArray(db.dataIndukList)) {
            localStorage.setItem(LOCAL_DATA_INDUK_KEY, JSON.stringify(db.dataIndukList));
          }
          localStorage.setItem(LOCAL_OTM_RAW_KEY, JSON.stringify(db.otmMap && typeof db.otmMap === 'object' ? db.otmMap : {}));
          localStorage.setItem(LOCAL_HASIL_ORTU_KEY, JSON.stringify(db.hasilOrtuMap && typeof db.hasilOrtuMap === 'object' ? db.hasilOrtuMap : {}));
          localStorage.setItem(LOCAL_OBS_SISWA_KEY, JSON.stringify(Array.isArray(db.observasiList) ? db.observasiList : []));
          if (Array.isArray(db.wawancaraSiswaList)) {
            localStorage.setItem(LOCAL_WS_KEY, JSON.stringify(db.wawancaraSiswaList));
          }

          // Auto-heal kelulusanList agar NISN dan Jadwal Daftar Ulang tidak pernah hilang jika sheet kelulusan kosong/terhapus
          const rawKelulusan: any[] = Array.isArray(db.kelulusanList) ? db.kelulusanList : [];
          const healedKelulusan: StatusKelulusanInfo[] = rawKelulusan.map(kl => {
            let nisn = (kl.nisn || '').trim();
            let asalSekolah = (kl.asalSekolah || '').trim();
            let jadwal = (kl.jadwalDaftarUlang || '').trim();

            if (!nisn || nisn === '-') {
              const st = (db.siswaList || []).find((s: any) => 
                (s.noPendaftaran || '').toLowerCase() === (kl.noPendaftaran || '').toLowerCase() ||
                (s.namaLengkap || '').toLowerCase() === (kl.namaLengkap || '').toLowerCase()
              );
              if (st?.nisn && st.nisn !== '-') {
                nisn = st.nisn.trim();
              } else {
                const di = (db.dataIndukList || []).find((i: any) => 
                  (i.noPendaftaran || '').toLowerCase() === (kl.noPendaftaran || '').toLowerCase() ||
                  (i.namaLengkap || '').toLowerCase() === (kl.namaLengkap || '').toLowerCase()
                );
                if (di?.nisn && di.nisn !== '-') {
                  nisn = di.nisn.trim();
                }
              }
            }

            if (kl.status === 'LULUS' && (!jadwal || jadwal === '-')) {
              const obs = (db.observasiList || []).find((o: any) => 
                (o.noPendaftaran || '').toLowerCase() === (kl.noPendaftaran || '').toLowerCase()
              );
              if (obs?.tanggalMaksimalDaftarUlang && obs.tanggalMaksimalDaftarUlang !== '-' && obs.tanggalMaksimalDaftarUlang.trim()) {
                jadwal = obs.tanggalMaksimalDaftarUlang.trim();
              } else {
                jadwal = '20 - 25 Januari 2027';
              }
            }

            return {
              ...kl,
              nisn: nisn || '-',
              asalSekolah: asalSekolah || 'SD/MI Pendaftar',
              jadwalDaftarUlang: kl.status === 'LULUS' ? (jadwal || '20 - 25 Januari 2027') : '-'
            };
          });

          localStorage.setItem(LOCAL_LULUS_KEY, JSON.stringify(healedKelulusan));

          this.setLastSyncTime();
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event('spmb_db_updated'));
          }
          return {
            success: true,
            message: `Sinkronisasi berhasil dari Spreadsheet "${db.spreadsheetName || this.getSpreadsheetId()}"! (${db.siswaList?.length || 0} Data Siswa, ${db.dataIndukList?.length || 0} Data Induk & ${db.users?.length || 0} Akun dimuat dari Database).`
          };
        }

        return {
          success: false,
          message: json?.message || json?.error || 'Gagal membaca data dari Spreadsheet.'
        };
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        return {
          success: false,
          message: `Gagal menarik data dari GAS (${msg}).`
        };
      } finally {
        _ongoingSyncPromise = null;
      }
    })();

    return _ongoingSyncPromise;
  },

  // Mendapatkan daftar siswa yang ditarik langsung dari Database Google Spreadsheet (High-Performance Engine)
  // Menerapkan pola Instant Cache-First + Stale-While-Revalidate agar halaman terbuka dalam 0 milidetik
  async getStudentList(forceRefresh: boolean = false) {
    const rawSiswa = localStorage.getItem(LOCAL_SISWA_KEY);
    const siswaList: DataSiswa[] = rawSiswa ? JSON.parse(rawSiswa) : [];

    const gasUrl = this.getGasUrl();
    const isOnline = typeof navigator !== 'undefined' && navigator.onLine;

    // Jika data lokal masih kosong sama sekali, tunggu sinkronisasi pertama
    if (siswaList.length === 0 && gasUrl && isOnline) {
      try {
        await this.syncFromSpreadsheet(gasUrl, true);
      } catch (e) {
        console.warn('Initial sync failed for getStudentList:', e);
      }
    } else if (gasUrl && isOnline) {
      // Jika data lokal sudah ada, jalankan sinkronisasi di latar belakang (background sync)
      // tanpa menahan/memblokir render halaman, sehingga UI langsung tampil seketika (0 ms!)
      const now = Date.now();
      if (forceRefresh || (now - _lastSyncTimeMs > 20000)) {
        this.syncFromSpreadsheet(gasUrl, forceRefresh).catch((e) => {
          console.warn('Background sync failed for getStudentList:', e);
        });
      }
    }

    const currentRawSiswa = localStorage.getItem(LOCAL_SISWA_KEY);
    const currentList: DataSiswa[] = currentRawSiswa ? JSON.parse(currentRawSiswa) : siswaList;

    const rawHasil = localStorage.getItem(LOCAL_HASIL_ORTU_KEY);
    const hasilMap: { [noPend: string]: HasilObservasiOrtuData } = rawHasil ? JSON.parse(rawHasil) : {};

    const rawOtm = localStorage.getItem(LOCAL_OTM_RAW_KEY);
    const otmMap = rawOtm ? JSON.parse(rawOtm) : {};

    return currentList.map((s, idx) => {
      const hasil = hasilMap[s.noPendaftaran];
      const hasSignature = Boolean(hasil?.isTtdOrtuSigned || hasil?.ttdOrtuBase64);
      return {
        rowIndex: idx + 2,
        id: s.noPendaftaran,
        nisn: s.nisn || '',
        nama: s.namaLengkap,
        panggilan: s.namaPanggilan || (s.namaLengkap ? s.namaLengkap.split(' ')[0] : ''),
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

  // Mengambil Raw Data OTM (jawaban 34 butir) untuk sebuah nomor pendaftaran langsung dari hasil sinkronisasi Database
  getOtmRawData(noPendaftaran: string): { [refId: number]: string } {
    if (!noPendaftaran) return {};
    const raw = localStorage.getItem(LOCAL_OTM_RAW_KEY);
    const map = raw ? JSON.parse(raw) : {};
    return map[noPendaftaran] || {};
  },

  // Mengambil hasil observasi ortu jika sudah pernah diwawancara / draft
  getHasilWawancaraOrtu(noPendaftaran: string): HasilObservasiOrtuData | null {
    if (!noPendaftaran) return null;
    const raw = localStorage.getItem(LOCAL_HASIL_ORTU_KEY);
    const map: { [noPend: string]: HasilObservasiOrtuData } = raw ? JSON.parse(raw) : {};
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
    const map: { [noPend: string]: HasilObservasiOrtuData } = rawHasil ? JSON.parse(rawHasil) : {};

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
    const map: { [noPend: string]: HasilObservasiOrtuData } = rawHasil ? JSON.parse(rawHasil) : {};

    if (!map[noPendaftaran]) {
      const rawSiswa = localStorage.getItem(LOCAL_SISWA_KEY);
      const siswaList: DataSiswa[] = rawSiswa ? JSON.parse(rawSiswa) : [];
      const st = siswaList.find(s => s.noPendaftaran === noPendaftaran);
      if (!st) {
        return { success: false, message: 'Data siswa tidak ditemukan di database.' };
      }
      const defaultPewawancara = this.getPewawancaraAccounts()[0]?.namaSiswa || '-';
      map[noPendaftaran] = {
        id: 'HO-HP-' + Date.now(),
        idSiswa: noPendaftaran,
        noPendaftaran: noPendaftaran,
        namaSiswa: st.namaLengkap,
        namaPanggilan: st.namaPanggilan || (st.namaLengkap ? st.namaLengkap.split(' ')[0] : ''),
        sekolahAsal: st.asalSekolah,
        namaAyah: st.namaAyah,
        namaIbu: st.namaIbu,
        namaPewawancara: defaultPewawancara,
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
    const appSettings = this.getAppSettings();
    let pdfUrl = appSettings.driveFolderUrl || `https://docs.google.com/spreadsheets/d/${this.getSpreadsheetId()}/edit`;

    const answers = formObject.jsonAnswers;
    const catatanItem = answers.find(item => item.question && item.question.includes("CATATAN KHUSUS"));
    const catatanKhususText = catatanItem ? (catatanItem.newAnswer || "-") : "-";

    // Kirim ke GAS terlebih dahulu jika online agar mendapatkan URL PDF Google Drive asli
    const gasUrl = this.getGasUrl();
    if (gasUrl && navigator.onLine) {
      const gasRes = await postToGas(gasUrl, {
        action: 'processForm',
        driveFolderUrl: appSettings.driveFolderUrl,
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
    const map: { [noPend: string]: HasilObservasiOrtuData } = rawHasil ? JSON.parse(rawHasil) : {};
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
    const list: ObservasiSiswaData[] = raw ? JSON.parse(raw) : [];
    const idx = list.findIndex(o => o.noPendaftaran === data.noPendaftaran);

    // Amankan dan lengkapi NISN & Asal Sekolah agar tidak pernah hilang
    const stSiswa = this.getSiswaByNo(data.noPendaftaran);
    const rawInduk = localStorage.getItem(LOCAL_DATA_INDUK_KEY);
    const indukList: any[] = rawInduk ? JSON.parse(rawInduk) : [];
    const stInduk = indukList.find((i: any) => i.noPendaftaran === data.noPendaftaran || i.namaLengkap === data.namaSiswa);
    const rawLulus = localStorage.getItem(LOCAL_LULUS_KEY);
    const lulusList: StatusKelulusanInfo[] = rawLulus ? JSON.parse(rawLulus) : [];
    const stLulus = lulusList.find(l => l.noPendaftaran === data.noPendaftaran);

    const resolvedNisn = (data.nisn && data.nisn !== '-' && data.nisn.trim())
      ? data.nisn.trim()
      : ((stSiswa?.nisn && stSiswa.nisn !== '-')
        ? stSiswa.nisn.trim()
        : ((stInduk?.nisn && stInduk.nisn !== '-')
          ? stInduk.nisn.trim()
          : ((stLulus?.nisn && stLulus.nisn !== '-')
            ? stLulus.nisn.trim()
            : '-')));

    const resolvedAsalSekolah = (data.asalSekolah && data.asalSekolah.trim())
      ? data.asalSekolah.trim()
      : (stSiswa?.asalSekolah || stLulus?.asalSekolah || 'SD/MI Pendaftar');

    const resolvedJadwal = (data.tanggalMaksimalDaftarUlang && data.tanggalMaksimalDaftarUlang.trim() && data.tanggalMaksimalDaftarUlang !== '-')
      ? data.tanggalMaksimalDaftarUlang.trim()
      : (stLulus?.jadwalDaftarUlang && stLulus.jadwalDaftarUlang !== '-' ? stLulus.jadwalDaftarUlang : '20 - 25 Januari 2027');

    const pdfUrl = data.pdfUrl || `https://docs.google.com/spreadsheets/d/${this.getSpreadsheetId()}/edit`;
    const finalized: ObservasiSiswaData = {
      ...data,
      nisn: resolvedNisn,
      asalSekolah: resolvedAsalSekolah,
      tanggalMaksimalDaftarUlang: resolvedJadwal,
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
      await postToGas(gasUrl, { 
        action: 'saveObservasiSiswa', 
        ...finalized,
        nisn: resolvedNisn,
        asalSekolah: resolvedAsalSekolah,
        tanggalMaksimalDaftarUlang: resolvedJadwal
      });
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
    if (!noPendaftaran) return null;
    const raw = localStorage.getItem(LOCAL_OBS_SISWA_KEY);
    const list: ObservasiSiswaData[] = raw ? JSON.parse(raw) : [];
    return list.find(o => o.noPendaftaran === noPendaftaran) || null;
  },

  // Mengambil semua lembar observasi siswa
  getAllObservasiSiswa(): ObservasiSiswaData[] {
    const raw = localStorage.getItem(LOCAL_OBS_SISWA_KEY);
    return raw ? JSON.parse(raw) : [];
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
    const map = raw ? JSON.parse(raw) : {};

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
      const siswaList: DataSiswa[] = rawSiswa ? JSON.parse(rawSiswa) : [];
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
    const all: DataSiswa[] = raw ? JSON.parse(raw) : [];
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

  // Detail Siswa (langsung dari Database Google Spreadsheet)
  getSiswaByNo(noPendaftaran: string): DataSiswa | null {
    if (!noPendaftaran) return null;
    const rawSiswa = localStorage.getItem(LOCAL_SISWA_KEY);
    const list: DataSiswa[] = rawSiswa ? JSON.parse(rawSiswa) : [];
    return list.find(s => (s.noPendaftaran || '').toLowerCase() === noPendaftaran.toLowerCase()) || null;
  },

  async getSiswaDetail(noPendaftaran: string) {
    if (!noPendaftaran) return null;
    let rawSiswa = localStorage.getItem(LOCAL_SISWA_KEY);
    let list: DataSiswa[] = rawSiswa ? JSON.parse(rawSiswa) : [];
    let siswa = list.find(s => s.noPendaftaran.toLowerCase() === noPendaftaran.toLowerCase());

    if (!siswa && this.isLiveGasConfigured() && navigator.onLine) {
      await this.syncFromSpreadsheet();
      rawSiswa = localStorage.getItem(LOCAL_SISWA_KEY);
      list = rawSiswa ? JSON.parse(rawSiswa) : [];
      siswa = list.find(s => s.noPendaftaran.toLowerCase() === noPendaftaran.toLowerCase());
    }

    if (!siswa) return null;

    const rawWs = localStorage.getItem(LOCAL_WS_KEY);
    const allWs: WawancaraSiswaData[] = rawWs ? JSON.parse(rawWs) : [];
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

  // Cek Status Kelulusan (Cache-First + Fast Targeted Lookup ke Database Spreadsheet)
  async checkStatusKelulusan(keyword: string): Promise<StatusKelulusanInfo | null> {
    const term = keyword.trim().toLowerCase();
    if (!term) return null;

    // 1. Cek langsung di cache lokal (0ms response time!)
    const raw = localStorage.getItem(LOCAL_LULUS_KEY);
    const list: StatusKelulusanInfo[] = raw ? JSON.parse(raw) : [];
    
    let found = list.find(item => 
      (item.noPendaftaran || '').toLowerCase() === term || 
      (item.nisn || '').toLowerCase() === term ||
      (item.namaLengkap || '').toLowerCase().includes(term)
    ) || null;

    // Jika belum ditemukan di lokal dan sedang online, tanyakan ke endpoint cepat checkKelulusan di GAS
    if (!found && this.isLiveGasConfigured() && navigator.onLine) {
      const gasUrl = this.getGasUrl();
      try {
        const separator = gasUrl.includes('?') ? '&' : '?';
        const res = await fetch(`${gasUrl}${separator}action=checkKelulusan&term=${encodeURIComponent(keyword.trim())}`, {
          mode: 'cors'
        });
        const json = await res.json();
        if (json && json.success && json.data) {
          found = json.data;
        } else {
          // Fallback sinkronisasi penuh
          await this.syncFromSpreadsheet(gasUrl, true);
          const updatedRaw = localStorage.getItem(LOCAL_LULUS_KEY);
          const updatedList: StatusKelulusanInfo[] = updatedRaw ? JSON.parse(updatedRaw) : [];
          found = updatedList.find(item => 
            (item.noPendaftaran || '').toLowerCase() === term || 
            (item.nisn || '').toLowerCase() === term ||
            (item.namaLengkap || '').toLowerCase().includes(term)
          ) || null;
        }
      } catch (err) {
        console.warn('Fast kelulusan check failed:', err);
      }
    }

    // Sinkronisasi otomatis & pemulihan jika calon murid ada di data pendaftar/observasi
    if (!found) {
      const rawSiswa = localStorage.getItem(LOCAL_SISWA_KEY);
      const siswaList: DataSiswa[] = rawSiswa ? JSON.parse(rawSiswa) : [];
      const st = siswaList.find(s => 
        (s.noPendaftaran || '').toLowerCase() === term || 
        (s.nisn || '').toLowerCase() === term ||
        (s.namaLengkap || '').toLowerCase().includes(term)
      );

      if (st) {
        const obs = this.getObservasiSiswa(st.noPendaftaran);
        const isLulus = obs ? obs.rekomendasi === 'Diterima' : true;
        found = {
          noPendaftaran: st.noPendaftaran,
          nisn: st.nisn || '-',
          namaLengkap: st.namaLengkap,
          asalSekolah: st.asalSekolah || '-',
          jalur: 'Jalur Reguler / Gelombang 1',
          status: isLulus ? 'LULUS' : (obs?.rekomendasi === 'Cadangan' ? 'CADANGAN' : 'TIDAK_LULUS'),
          skorAkhir: obs?.rataRata || 85,
          pesanPengumuman: isLulus 
            ? `Selamat! Berdasarkan hasil evaluasi observasi siswa dan wawancara orang tua, ananda dinyatakan DITERIMA di SMPIT PONDOK DUTA TP 2027/2028.`
            : `Hasil evaluasi seleksi ananda sedang diproses panitia.`,
          jadwalDaftarUlang: isLulus ? (obs?.tanggalMaksimalDaftarUlang || '20 - 25 Januari 2027') : '-'
        };
      }
    }

    if (found) {
      // Pastikan NISN tidak kosong atau '-' jika ada di Data Siswa atau Data Induk
      if (!found.nisn || found.nisn === '-' || found.nisn.trim() === '') {
        const rawSiswa = localStorage.getItem(LOCAL_SISWA_KEY);
        const siswaList: DataSiswa[] = rawSiswa ? JSON.parse(rawSiswa) : [];
        const st = siswaList.find(s => 
          (s.noPendaftaran || '').toLowerCase() === (found?.noPendaftaran || '').toLowerCase() ||
          (s.namaLengkap || '').toLowerCase() === (found?.namaLengkap || '').toLowerCase()
        );
        const rawInduk = localStorage.getItem(LOCAL_DATA_INDUK_KEY);
        const indukList: any[] = rawInduk ? JSON.parse(rawInduk) : [];
        const di = indukList.find((i: any) => 
          (i.noPendaftaran || '').toLowerCase() === (found?.noPendaftaran || '').toLowerCase() ||
          (i.namaLengkap || '').toLowerCase() === (found?.namaLengkap || '').toLowerCase()
        );
        if (st?.nisn && st.nisn !== '-') {
          found.nisn = st.nisn;
        } else if (di?.nisn && di.nisn !== '-') {
          found.nisn = di.nisn;
        }
      }

      // Pastikan Jadwal Daftar Ulang tidak kosong atau '-' jika berstatus LULUS
      if (found.status === 'LULUS' && (!found.jadwalDaftarUlang || found.jadwalDaftarUlang === '-' || found.jadwalDaftarUlang.trim() === '')) {
        const obs = this.getObservasiSiswa(found.noPendaftaran);
        found.jadwalDaftarUlang = (obs?.tanggalMaksimalDaftarUlang && obs.tanggalMaksimalDaftarUlang.trim() && obs.tanggalMaksimalDaftarUlang !== '-')
          ? obs.tanggalMaksimalDaftarUlang.trim()
          : '20 - 25 Januari 2027';
      }

      if (found.pesanPengumuman) {
        found.pesanPengumuman = found.pesanPengumuman.replace(/2026\/2027/g, '2027/2028');
      }

      // Simpan kembali data yang sudah dipulihkan ke local storage
      const existingIdx = list.findIndex(l => l.noPendaftaran === found?.noPendaftaran);
      if (existingIdx >= 0) {
        list[existingIdx] = found;
      } else {
        list.push(found);
      }
      localStorage.setItem(LOCAL_LULUS_KEY, JSON.stringify(list));
    }

    return found;
  },

  getStatusKelulusan(noPendaftaran: string): StatusKelulusanInfo | null {
    const raw = localStorage.getItem(LOCAL_LULUS_KEY);
    const list: StatusKelulusanInfo[] = raw ? JSON.parse(raw) : [];
    return list.find(l => l.noPendaftaran === noPendaftaran) || null;
  },

  updateStatusKelulusan(obs: ObservasiSiswaData) {
    const raw = localStorage.getItem(LOCAL_LULUS_KEY);
    const list: StatusKelulusanInfo[] = raw ? JSON.parse(raw) : [];
    const idx = list.findIndex(l => l.noPendaftaran === obs.noPendaftaran);

    const rawSiswa = localStorage.getItem(LOCAL_SISWA_KEY);
    const siswaList: DataSiswa[] = rawSiswa ? JSON.parse(rawSiswa) : [];
    const st = siswaList.find(s => s.noPendaftaran === obs.noPendaftaran || s.namaLengkap === obs.namaSiswa);

    const rawInduk = localStorage.getItem(LOCAL_DATA_INDUK_KEY);
    const indukList: any[] = rawInduk ? JSON.parse(rawInduk) : [];
    const di = indukList.find((i: any) => i.noPendaftaran === obs.noPendaftaran || i.namaLengkap === obs.namaSiswa);

    const statusMap = {
      'Diterima': 'LULUS',
      'Cadangan': 'CADANGAN',
      'Tidak Diterima': 'TIDAK_LULUS'
    } as const;

    const newStatus = statusMap[obs.rekomendasi] || 'PROSES_SELEKSI';
    const effectiveJadwal = (obs.tanggalMaksimalDaftarUlang && obs.tanggalMaksimalDaftarUlang.trim() && obs.tanggalMaksimalDaftarUlang !== '-')
      ? obs.tanggalMaksimalDaftarUlang.trim()
      : (list[idx]?.jadwalDaftarUlang && list[idx]?.jadwalDaftarUlang !== '-' ? list[idx].jadwalDaftarUlang : '20 - 25 Januari 2027');

    const effectiveNisn = (obs.nisn && obs.nisn !== '-' && obs.nisn.trim())
      ? obs.nisn.trim()
      : ((st?.nisn && st.nisn !== '-') 
        ? st.nisn 
        : ((di?.nisn && di.nisn !== '-') 
          ? di.nisn 
          : (list[idx]?.nisn && list[idx]?.nisn !== '-' ? list[idx].nisn : '-')));

    const effectiveAsal = (obs.asalSekolah && obs.asalSekolah !== '-' && obs.asalSekolah.trim())
      ? obs.asalSekolah.trim()
      : ((st?.asalSekolah && st.asalSekolah !== '-') ? st.asalSekolah : (list[idx]?.asalSekolah || di?.asalSekolah || 'SD/MI Pendaftar'));

    const info: StatusKelulusanInfo = {
      noPendaftaran: obs.noPendaftaran,
      nisn: effectiveNisn,
      namaLengkap: obs.namaSiswa,
      asalSekolah: effectiveAsal,
      jalur: 'Jalur Reguler / Gelombang 1',
      status: newStatus,
      skorAkhir: obs.rataRata,
      pesanPengumuman: newStatus === 'LULUS' 
        ? `Selamat! Berdasarkan hasil evaluasi observasi siswa dan wawancara orang tua, ananda dinyatakan DITERIMA di SMPIT PONDOK DUTA TP 2027/2028.`
        : (newStatus === 'CADANGAN' 
          ? `Ananda berada pada posisi CADANGAN dengan nilai rata-rata ${obs.rataRata}.`
          : `Mohon maaf, ananda belum memenuhi kuota penerimaan SMPIT Pondok Duta tahun ini.`),
      jadwalDaftarUlang: newStatus === 'LULUS' ? effectiveJadwal : '-'
    };

    if (idx >= 0) {
      list[idx] = info;
    } else {
      list.push(info);
    }
    localStorage.setItem(LOCAL_LULUS_KEY, JSON.stringify(list));
  },

  applyJadwalDaftarUlangToAllLulus(jadwal: string): { success: boolean; count: number; message: string } {
    const trimmed = (jadwal || '').trim() || '20 - 25 Januari 2027';
    const raw = localStorage.getItem(LOCAL_LULUS_KEY);
    const list: StatusKelulusanInfo[] = raw ? JSON.parse(raw) : [];
    let count = 0;
    const updated = list.map(item => {
      if (item.status === 'LULUS') {
        count++;
        return { ...item, jadwalDaftarUlang: trimmed };
      }
      return item;
    });
    localStorage.setItem(LOCAL_LULUS_KEY, JSON.stringify(updated));

    // Update juga di observasi siswa
    const rawObs = localStorage.getItem(LOCAL_OBS_SISWA_KEY);
    if (rawObs) {
      try {
        const obsList: ObservasiSiswaData[] = JSON.parse(rawObs);
        const updatedObs = obsList.map(o => {
          if (o.rekomendasi === 'Diterima') {
            return { ...o, tanggalMaksimalDaftarUlang: trimmed };
          }
          return o;
        });
        localStorage.setItem(LOCAL_OBS_SISWA_KEY, JSON.stringify(updatedObs));
      } catch {
        // ignore
      }
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('spmb_db_updated'));
    }

    return {
      success: true,
      count,
      message: `Berhasil memperbarui jadwal daftar ulang (${trimmed}) untuk ${count} calon murid berstatus LULUS.`
    };
  },

  // --- DATABASE USER & AUTENTIKASI (MURNI DARI SHEET Akun_User DATABASE) ---
  getAllUsersFromDb(): UserAccount[] {
    const raw = localStorage.getItem(LOCAL_USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  },

  getUsers(): UserAccount[] {
    return this.getAllUsersFromDb().filter(u => u.role === 'siswa');
  },

  getPewawancaraAccounts(): UserAccount[] {
    return this.getAllUsersFromDb().filter(u => u.role === 'guru');
  },

  getAdminAccounts(): UserAccount[] {
    return this.getAllUsersFromDb().filter(u => u.role === 'admin');
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

  // Pendaftaran Akun Siswa & Orang Tua Baru (Langsung tersimpan ke Database Spreadsheet)
  registerUser(payload: {
    namaSiswa: string;
    namaOrangTua: string;
    sekolahAsal: string;
    nomorHp: string;
    emailOrangTua: string;
  }): { success: boolean; kodePendaftaran: string; user: UserAccount; message: string } {
    const allUsers = this.getAllUsersFromDb();

    let uniqueCode = '';
    let isUnique = false;
    let attempts = 0;
    while (!isUnique && attempts < 100) {
      attempts++;
      uniqueCode = generateRandomKodePendaftaran();
      if (!allUsers.some(u => u.kodePendaftaran.toUpperCase() === uniqueCode.toUpperCase())) {
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

    allUsers.push(newUser);
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(allUsers));

    const rawSiswa = localStorage.getItem(LOCAL_SISWA_KEY);
    const siswaList: DataSiswa[] = rawSiswa ? JSON.parse(rawSiswa) : [];

    const newStudentData: DataSiswa = {
      id: `SISWA-${Date.now()}`,
      noPendaftaran: uniqueCode,
      createdAt: new Date().toISOString(),
      namaLengkap: payload.namaSiswa.trim(),
      namaPanggilan: payload.namaSiswa.trim().split(' ')[0],
      nisn: '',
      jenisKelamin: 'Laki-laki',
      tempatLahir: '',
      tanggalLahir: '',
      agama: 'Islam',
      kewarganegaraan: 'Indonesia',
      anakNomorKe: 1,
      jumlahSaudaraKandung: 0,
      jumlahSaudaraTiri: 0,
      jumlahSaudaraAngkat: 0,
      bahasaSehariHari: 'Bahasa Indonesia',
      alamat: '',
      kelurahan: '',
      kecamatan: '',
      kotaKabupaten: '',
      nomorTelepon: payload.nomorHp.trim(),
      nomorHandphone: payload.nomorHp.trim(),
      bertempatTinggalPada: 'Orang Tua',
      jarakKeSekolahKm: '',
      saranaBerangkatSekolah: 'Motor',
      beratBadanKg: 0,
      tinggiBadanCm: 0,
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
      tempatTanggalLahirAyah: '',
      agamaAyah: 'Islam',
      kewarganegaraanAyah: 'Indonesia',
      pendidikanAyah: 'S1',
      pekerjaanAyah: '',
      penghasilanAyah: 'Rp. 5jt - Rp. 10jt',
      alamatAyah: '',
      noHpAyah: payload.nomorHp.trim(),
      emailAyah: payload.emailOrangTua.trim(),
      statusPerkawinanAyah: 'Suami',
      namaIbu: payload.namaOrangTua.trim(),
      tempatTanggalLahirIbu: '',
      agamaIbu: 'Islam',
      kewarganegaraanIbu: 'Indonesia',
      pendidikanIbu: 'S1',
      pekerjaanIbu: '',
      penghasilanIbu: 'dibawah Rp. 5jt',
      alamatIbu: '',
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

  // Login dengan sinkronisasi langsung ke Database Google Spreadsheet terlebih dahulu bila belum tersinkronisasi
  async loginWithKodeAsync(kode: string): Promise<{ success: boolean; user?: UserAccount; message: string }> {
    const cleanKode = kode.trim().toUpperCase();
    if (!cleanKode) {
      return {
        success: false,
        message: 'Silakan masukkan Kode Akses Anda.'
      };
    }

    // Jika data user di browser masih kosong atau kode belum ditemukan, tarik data terbaru dari Database Spreadsheet
    const allUsers = this.getAllUsersFromDb();
    const existsLocally = allUsers.some(u => (u.kodePendaftaran || '').trim().toUpperCase() === cleanKode);
    if ((!existsLocally || allUsers.length === 0) && this.isLiveGasConfigured() && navigator.onLine) {
      await this.syncFromSpreadsheet();
    }

    return this.loginWithKode(cleanKode);
  },

  // Login membaca dari data Sheet Akun_User & Data_Siswa yang telah disinkronkan dari Database
  loginWithKode(kode: string): { success: boolean; user?: UserAccount; message: string } {
    const cleanKode = kode.trim().toUpperCase();
    if (!cleanKode) {
      return { 
        success: false, 
        message: 'Silakan masukkan Kode Akses Anda.' 
      };
    }

    // 1. Cek di daftar Admin dari Database (Sheet Akun_User)
    const adminList = this.getAdminAccounts();
    const foundAdmin = adminList.find(
      a => (a.kodePendaftaran || '').trim().toUpperCase() === cleanKode
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
        message: `Login berhasil! Selamat datang, ${adminAccount.namaSiswa}.`
      };
    }

    // 2. Cek di daftar Pewawancara/Guru dari Database (Sheet Akun_User)
    const pewawancaraList = this.getPewawancaraAccounts();
    const foundPewawancara = pewawancaraList.find(
      p => (p.kodePendaftaran || '').trim().toUpperCase() === cleanKode
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
        message: `Login berhasil! Selamat bertugas, ${guruAccount.namaSiswa}.`
      };
    }

    // 3. Cek di daftar Siswa dari Database (Sheet Akun_User atau Sheet Data_Siswa)
    const allUsers = this.getAllUsersFromDb();
    let found = allUsers.find(u => (u.kodePendaftaran || '').trim().toUpperCase() === cleanKode);

    if (!found) {
      const rawSiswa = localStorage.getItem(LOCAL_SISWA_KEY);
      const siswaList: DataSiswa[] = rawSiswa ? JSON.parse(rawSiswa) : [];
      const matchingSiswa = siswaList.find(s => (s.noPendaftaran || '').trim().toUpperCase() === cleanKode);
      if (matchingSiswa) {
        found = {
          id: `USR-${matchingSiswa.id || matchingSiswa.noPendaftaran}`,
          kodePendaftaran: matchingSiswa.noPendaftaran,
          namaSiswa: matchingSiswa.namaLengkap,
          namaOrangTua: matchingSiswa.namaAyah || matchingSiswa.namaIbu || 'Orang Tua',
          sekolahAsal: matchingSiswa.asalSekolah,
          nomorHp: matchingSiswa.nomorHandphone,
          emailOrangTua: matchingSiswa.emailAyah || matchingSiswa.emailIbu || '',
          createdAt: matchingSiswa.createdAt || new Date().toISOString(),
          role: 'siswa'
        };
        allUsers.push(found);
        localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(allUsers));
      }
    }

    if (!found) {
      return {
        success: false,
        message: `Kode "${cleanKode}" tidak ditemukan di database. Pastikan kode yang Anda masukkan sudah terdaftar di Google Spreadsheet.`
      };
    }

    const siswaAccount: UserAccount = {
      ...found,
      role: found.role || 'siswa'
    };

    this.setCurrentUser(siswaAccount);
    return {
      success: true,
      user: siswaAccount,
      message: `Login berhasil! Selamat datang, ${siswaAccount.namaSiswa}.`
    };
  },

  // =========================================================================
  // --- MANAJEMEN BUKU INDUK SISWA (DATA INDUK SEKOLAH TANPA JSON) ---
  // =========================================================================

  getDataIndukList(): DataIndukSiswa[] {
    const raw = localStorage.getItem(LOCAL_DATA_INDUK_KEY);
    return raw ? JSON.parse(raw) : [];
  },

  async saveDataIndukList(list: DataIndukSiswa[]): Promise<{ success: boolean; message: string }> {
    localStorage.setItem(LOCAL_DATA_INDUK_KEY, JSON.stringify(list));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('spmb_db_updated'));
    }

    const gasUrl = this.getGasUrl();
    if (gasUrl && navigator.onLine) {
      const res = await postToGas(gasUrl, {
        action: 'saveDataInduk',
        dataIndukList: list
      });
      this.setLastSyncTime();
      if (res && res.success) {
        return {
          success: true,
          message: res.message || 'Data Induk Sekolah berhasil disimpan dan tersinkronisasi ke Google Spreadsheet!'
        };
      }
    }

    return {
      success: true,
      message: 'Data Induk Sekolah tersimpan secara lokal. Hubungkan Web App GAS untuk sinkronisasi cloud.'
    };
  },

  async updateStudentNis(noPendaftaran: string, nis: string): Promise<{ success: boolean; message: string }> {
    const list = this.getDataIndukList();
    const idx = list.findIndex(d => d.noPendaftaran === noPendaftaran);
    if (idx === -1) {
      return { success: false, message: 'Data siswa belum tercatat di Buku Induk Sekolah.' };
    }

    list[idx] = {
      ...list[idx],
      nis: nis.trim(),
      updatedAt: new Date().toISOString()
    };

    localStorage.setItem(LOCAL_DATA_INDUK_KEY, JSON.stringify(list));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('spmb_db_updated'));
    }

    const gasUrl = this.getGasUrl();
    if (gasUrl && navigator.onLine) {
      await postToGas(gasUrl, {
        action: 'updateNis',
        noPendaftaran,
        nis: nis.trim()
      });
      this.setLastSyncTime();
    }

    return {
      success: true,
      message: `Nomor Induk Siswa (NIS: ${nis.trim()}) untuk ${list[idx].namaLengkap} berhasil disimpan!`
    };
  },

  async copyLulusToDataInduk(noPendaftaranList: string[]): Promise<{
    count: number;
    added: DataIndukSiswa[];
    message: string;
  }> {
    const currentInduk = this.getDataIndukList();
    const rawSiswa = localStorage.getItem(LOCAL_SISWA_KEY);
    const siswaList: DataSiswa[] = rawSiswa ? JSON.parse(rawSiswa) : [];
    const added: DataIndukSiswa[] = [];

    noPendaftaranList.forEach(noPend => {
      const st = siswaList.find(s => s.noPendaftaran === noPend);
      if (st) {
        const existingIdx = currentInduk.findIndex(d => d.noPendaftaran === noPend);
        const nextUrut = existingIdx >= 0 ? (currentInduk[existingIdx].noUrut || existingIdx + 1) : (currentInduk.length + 1);
        const converted = convertDataSiswaToDataInduk(st, existingIdx >= 0 ? currentInduk[existingIdx].nis : '', nextUrut);

        if (existingIdx >= 0) {
          currentInduk[existingIdx] = {
            ...converted,
            nis: currentInduk[existingIdx].nis || converted.nis,
            noUrut: currentInduk[existingIdx].noUrut || nextUrut
          };
          added.push(currentInduk[existingIdx]);
        } else {
          currentInduk.push(converted);
          added.push(converted);
        }
      }
    });

    localStorage.setItem(LOCAL_DATA_INDUK_KEY, JSON.stringify(currentInduk));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('spmb_db_updated'));
    }

    const gasUrl = this.getGasUrl();
    if (gasUrl && navigator.onLine) {
      await postToGas(gasUrl, {
        action: 'saveDataInduk',
        dataIndukList: currentInduk
      });
      this.setLastSyncTime();
    }

    return {
      count: added.length,
      added,
      message: `Alhamdulillah! ${added.length} data siswa lulus berhasil disalin ke Data Induk Sekolah (kolom lengkap tanpa JSON).`
    };
  },

  async removeFromDataInduk(noPendaftaran: string): Promise<{ success: boolean; message: string }> {
    const list = this.getDataIndukList();
    const filtered = list.filter(d => d.noPendaftaran !== noPendaftaran);
    const renumbered = filtered.map((item, idx) => ({ ...item, noUrut: idx + 1 }));

    localStorage.setItem(LOCAL_DATA_INDUK_KEY, JSON.stringify(renumbered));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('spmb_db_updated'));
    }

    const gasUrl = this.getGasUrl();
    if (gasUrl && navigator.onLine) {
      await postToGas(gasUrl, {
        action: 'saveDataInduk',
        dataIndukList: renumbered
      });
      this.setLastSyncTime();
    }

    return {
      success: true,
      message: 'Siswa berhasil dihapus dari Buku Induk Sekolah.'
    };
  },

  async autoGenerateNis(prefix = '2728', startNumber = 1): Promise<{
    success: boolean;
    updatedCount: number;
    message: string;
  }> {
    const list = this.getDataIndukList();
    if (list.length === 0) {
      return {
        success: false,
        updatedCount: 0,
        message: 'Belum ada data murid di Buku Induk Sekolah. Silakan salin murid lulus seleksi terlebih dahulu.'
      };
    }

    // 1. Buat salinan sementara untuk menghitung urutan penomoran NIS:
    // a. Kelompok Jenis Kelamin: Laki-laki (Ikhwan) terlebih dahulu, kemudian Perempuan (Akhwat)
    // b. Di dalam masing-masing kelompok jenis kelamin, diurutkan menurut abjad Nama Lengkap (A - Z)
    const lakiList: DataIndukSiswa[] = [];
    const perempuanList: DataIndukSiswa[] = [];
    const othersList: DataIndukSiswa[] = [];

    list.forEach(item => {
      const jk = (item.jenisKelamin || '').trim().toLowerCase();
      if (jk === 'l' || jk.startsWith('laki') || jk === 'pria' || jk === 'ikhwan') {
        lakiList.push(item);
      } else if (jk === 'p' || jk.startsWith('perempuan') || jk === 'wanita' || jk === 'akhwat') {
        perempuanList.push(item);
      } else {
        othersList.push(item);
      }
    });

    const sortByName = (a: DataIndukSiswa, b: DataIndukSiswa) => {
      return (a.namaLengkap || '').trim().localeCompare((b.namaLengkap || '').trim(), 'id', { sensitivity: 'base' });
    };

    lakiList.sort(sortByName);
    perempuanList.sort(sortByName);
    othersList.sort(sortByName);

    const sortedForNis = [...lakiList, ...perempuanList, ...othersList];

    // 2. Berikan nomor urut NIS secara sekuensial kepada murid yang telah diurutkan berdasarkan jenis kelamin dan abjad
    const nisAssignmentMap: Record<string, string> = {};
    let currentCounter = startNumber;

    sortedForNis.forEach((item) => {
      const formattedNum = String(currentCounter).padStart(3, '0');
      const generatedNis = `${prefix}${formattedNum}`;
      currentCounter++;
      const key = item.noPendaftaran ? item.noPendaftaran.trim().toUpperCase() : item.id;
      if (key) {
        nisAssignmentMap[key] = generatedNis;
      }
    });

    // 3. Terapkan nomor NIS ke database DENGAN TETAP MEMPERTAHANKAN POSISI / URUTAN ASLI DATABASE
    // Posisi baris murid di database TIDAK BERUBAH dan No Urut baris tetap berurutan 1, 2, 3...
    const updatedDatabaseList = list.map((item, idx) => {
      const key = item.noPendaftaran ? item.noPendaftaran.trim().toUpperCase() : item.id;
      const assignedNis = (key && nisAssignmentMap[key]) ? nisAssignmentMap[key] : (item.nis || `${prefix}${String(startNumber + idx).padStart(3, '0')}`);
      return {
        ...item,
        noUrut: idx + 1, // No Urut baris tetap konsisten mengikuti urutan baris database
        nis: assignedNis,
        updatedAt: new Date().toISOString()
      };
    });

    localStorage.setItem(LOCAL_DATA_INDUK_KEY, JSON.stringify(updatedDatabaseList));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('spmb_db_updated'));
      window.dispatchEvent(new Event('storage'));
    }

    const gasUrl = this.getGasUrl();
    if (gasUrl && navigator.onLine) {
      await postToGas(gasUrl, {
        action: 'saveDataInduk',
        dataIndukList: updatedDatabaseList
      });
      this.setLastSyncTime();
    }

    return {
      success: true,
      updatedCount: updatedDatabaseList.length,
      message: `Alhamdulillah! Berhasil men-generate Nomor Induk Siswa (NIS) untuk ${updatedDatabaseList.length} murid. Posisi data database tetap dipertahankan dan nomor NIS terurut kelompok Jenis Kelamin & Abjad Nama Murid.`
    };
  },

  async syncDataIndukToSpreadsheet(): Promise<{ success: boolean; message: string }> {
    const gasUrl = this.getGasUrl();
    if (!gasUrl) {
      return { success: false, message: 'URL Web App GAS belum dikonfigurasi.' };
    }
    const list = this.getDataIndukList();
    const res = await postToGas(gasUrl, {
      action: 'saveDataInduk',
      dataIndukList: list
    });
    if (res && res.success) {
      this.setLastSyncTime();
      return {
        success: true,
        message: res.message || `Berhasil menyinkronkan ${list.length} data ke Sheet 'Data Induk Sekolah'!`
      };
    }
    return {
      success: false,
      message: res?.message || 'Gagal menyinkronkan ke Sheet Data Induk Sekolah.'
    };
  },

  async resetToMockData() {
    localStorage.setItem(LOCAL_SISWA_KEY, JSON.stringify([]));
    localStorage.setItem(LOCAL_DATA_INDUK_KEY, JSON.stringify([]));
    localStorage.setItem(LOCAL_OTM_RAW_KEY, JSON.stringify({}));
    localStorage.setItem(LOCAL_HASIL_ORTU_KEY, JSON.stringify({}));
    localStorage.setItem(LOCAL_OBS_SISWA_KEY, JSON.stringify([]));
    localStorage.setItem(LOCAL_WS_KEY, JSON.stringify([]));
    localStorage.setItem(LOCAL_LULUS_KEY, JSON.stringify([]));
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify([]));
    if (this.isLiveGasConfigured() && navigator.onLine) {
      await this.syncFromSpreadsheet();
    }
  }
};
