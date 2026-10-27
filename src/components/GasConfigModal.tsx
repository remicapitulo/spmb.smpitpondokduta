import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { gasService } from '../services/gasService';
import { GOOGLE_APPS_SCRIPT_CODE, DEFAULT_SPREADSHEET_ID } from '../services/gasCodeSnippet';
import { 
  Database, 
  Link, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  X, 
  HelpCircle, 
  HardDrive,
  FileSpreadsheet,
  ExternalLink,
  Copy,
  Check,
  UploadCloud,
  DownloadCloud,
  Sparkles,
  Code2,
  FolderOpen,
  Image as ImageIcon,
  Upload,
  Trash2,
  Crop,
  Settings
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfigChanged?: () => void;
  onOpenPanduan?: () => void;
}

export const GasConfigModal: React.FC<Props> = ({ isOpen, onClose, onConfigChanged, onOpenPanduan }) => {
  const initialSettings = gasService.getAppSettings();

  const [spreadsheetId, setSpreadsheetId] = useState(gasService.getSpreadsheetId() || DEFAULT_SPREADSHEET_ID);
  const [url, setUrl] = useState(gasService.getGasUrl());

  // State Pengaturan Super Admin (Sheet "Setting")
  const [driveFolderUrl, setDriveFolderUrl] = useState(initialSettings.driveFolderUrl);
  const [logoUrl, setLogoUrl] = useState(initialSettings.logoUrl);
  const [logoDriveUrl, setLogoDriveUrl] = useState(initialSettings.logoDriveUrl || '');
  const [heroPhotoUrl, setHeroPhotoUrl] = useState(initialSettings.heroPhotoUrl);
  const [heroDriveUrl, setHeroDriveUrl] = useState(initialSettings.heroDriveUrl || '');
  const [heroCropMode, setHeroCropMode] = useState<'cutout' | 'full'>(initialSettings.heroCropMode || 'cutout');
  const [isCloudSynced, setIsCloudSynced] = useState<boolean>(Boolean(initialSettings.isCloudSynced));

  const [isBusy, setIsBusy] = useState(false);
  const [busyLabel, setBusyLabel] = useState('');
  const [statusResult, setStatusResult] = useState<{
    success: boolean;
    message: string;
    sheets?: string[];
    updatedHeaders?: string[];
  } | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedSheetId, setCopiedSheetId] = useState(false);
  const [showCodePreview, setShowCodePreview] = useState(false);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const heroInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      const current = gasService.getAppSettings();
      setDriveFolderUrl(current.driveFolderUrl);
      setLogoUrl(current.logoUrl);
      setLogoDriveUrl(current.logoDriveUrl || '');
      setHeroPhotoUrl(current.heroPhotoUrl);
      setHeroDriveUrl(current.heroDriveUrl || '');
      setHeroCropMode(current.heroCropMode || 'cutout');
      setIsCloudSynced(Boolean(current.isCloudSynced));
      setSpreadsheetId(gasService.getSpreadsheetId() || DEFAULT_SPREADSHEET_ID);
      setUrl(gasService.getGasUrl());

      // Sinkronkan & pastikan Foto Badge / Logo yang sudah diupload otomatis masuk ke Sheet "Setting"
      gasService.syncSettingsFromCloud().then((synced) => {
        setDriveFolderUrl(synced.driveFolderUrl);
        setLogoUrl(synced.logoUrl);
        setLogoDriveUrl(synced.logoDriveUrl || '');
        setHeroPhotoUrl(synced.heroPhotoUrl);
        setHeroDriveUrl(synced.heroDriveUrl || '');
        setHeroCropMode(synced.heroCropMode || 'cutout');
        setIsCloudSynced(Boolean(synced.isCloudSynced));
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const readFileAsDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      if (!file.type.startsWith('image/')) {
        resolve('');
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        resolve(typeof ev.target?.result === 'string' ? ev.target.result : '');
      };
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    });
  };

  // Saat Admin memilih file Logo, langsung kompres (<30KB) dan langsung unggah ke Folder Drive & Sheet "Setting"
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setIsBusy(true);
    setBusyLabel('Mengunggah Logo Sekolah ke Folder Google Drive & Sheet "Setting"...');
    setStatusResult(null);

    const rawDataUrl = await readFileAsDataUrl(file);
    if (!rawDataUrl) {
      setIsBusy(false);
      return;
    }

    const res = await gasService.saveAppSettings(
      {
        driveFolderUrl: driveFolderUrl.trim(),
        logoUrl: rawDataUrl,
        heroPhotoUrl: heroPhotoUrl.trim(),
        heroCropMode
      },
      url
    );

    setLogoUrl(res.settings.logoUrl);
    setLogoDriveUrl(res.settings.logoDriveUrl || '');
    setIsCloudSynced(Boolean(res.settings.isCloudSynced));
    setIsBusy(false);
    setStatusResult({
      success: res.success,
      message: res.success
        ? 'Logo Sekolah berhasil diunggah ke Database Cloud (Sheet "Setting" & Folder Drive) dan langsung tampil di semua perangkat!'
        : res.message
    });
    if (onConfigChanged) onConfigChanged();
  };

  // Saat Admin memilih file Foto Badge Beranda, langsung kompres (<38KB) dan langsung unggah ke Folder Drive & Sheet "Setting"
  const handleHeroPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setIsBusy(true);
    setBusyLabel('Mengunggah Foto Badge Beranda ke Folder Google Drive & Sheet "Setting"...');
    setStatusResult(null);

    const rawDataUrl = await readFileAsDataUrl(file);
    if (!rawDataUrl) {
      setIsBusy(false);
      return;
    }

    const res = await gasService.saveAppSettings(
      {
        driveFolderUrl: driveFolderUrl.trim(),
        logoUrl: logoUrl.trim(),
        heroPhotoUrl: rawDataUrl,
        heroCropMode
      },
      url
    );

    setHeroPhotoUrl(res.settings.heroPhotoUrl);
    setHeroDriveUrl(res.settings.heroDriveUrl || '');
    setIsCloudSynced(Boolean(res.settings.isCloudSynced));
    setIsBusy(false);
    setStatusResult({
      success: res.success,
      message: res.success
        ? 'Foto Badge Beranda berhasil diunggah ke Database Cloud (Sheet "Setting" & Folder Drive) dan langsung tampil di semua perangkat!'
        : res.message
    });
    if (onConfigChanged) onConfigChanged();
  };

  const handleSaveAll = async () => {
    const cleanId = gasService.setSpreadsheetId(spreadsheetId);
    setSpreadsheetId(cleanId);
    gasService.setGasUrl(url);

    setIsBusy(true);
    setBusyLabel('Menyimpan & menyinkronkan Folder Drive, Logo & Foto Badge ke Sheet "Setting"...');
    setStatusResult(null);

    const res = await gasService.saveAppSettings(
      {
        driveFolderUrl: driveFolderUrl.trim(),
        logoUrl: logoUrl.trim(),
        heroPhotoUrl: heroPhotoUrl.trim(),
        heroCropMode
      },
      url
    );

    setLogoUrl(res.settings.logoUrl);
    setLogoDriveUrl(res.settings.logoDriveUrl || '');
    setHeroPhotoUrl(res.settings.heroPhotoUrl);
    setHeroDriveUrl(res.settings.heroDriveUrl || '');
    setIsCloudSynced(Boolean(res.settings.isCloudSynced));

    setIsBusy(false);
    setStatusResult({
      success: res.success,
      message: res.message
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
    if (onConfigChanged) onConfigChanged();
  };

  const handleTest = async () => {
    const cleanId = gasService.setSpreadsheetId(spreadsheetId);
    setSpreadsheetId(cleanId);
    gasService.setGasUrl(url);
    setIsBusy(true);
    setBusyLabel('Menguji koneksi ke Spreadsheet & GAS...');
    setStatusResult(null);
    const res = await gasService.testConnection(url, cleanId);
    setIsBusy(false);
    setStatusResult(res);
    if (onConfigChanged) onConfigChanged();
  };

  const handleSetupSheets = async () => {
    const cleanId = gasService.setSpreadsheetId(spreadsheetId);
    setSpreadsheetId(cleanId);
    gasService.setGasUrl(url);
    setIsBusy(true);
    setBusyLabel('Memeriksa 9 Sheet & menyinkronkan seluruh baris Header kolom...');
    setStatusResult(null);
    const res = await gasService.setupRemoteSheets(url);
    setIsBusy(false);
    setStatusResult(res);
    if (onConfigChanged) onConfigChanged();
  };

  const handlePushToCloud = async () => {
    const cleanId = gasService.setSpreadsheetId(spreadsheetId);
    setSpreadsheetId(cleanId);
    gasService.setGasUrl(url);
    await gasService.saveAppSettings(
      {
        driveFolderUrl: driveFolderUrl.trim(),
        logoUrl: logoUrl.trim(),
        heroPhotoUrl: heroPhotoUrl.trim(),
        heroCropMode
      },
      url
    );
    setIsBusy(true);
    setBusyLabel('Mengunggah seluruh data aplikasi, Data Induk & Sheet "Setting" ke Google Spreadsheet...');
    setStatusResult(null);
    const res = await gasService.pushAllLocalToSpreadsheet(url);
    setIsBusy(false);
    setStatusResult(res);
    if (onConfigChanged) onConfigChanged();
  };

  const handlePullFromCloud = async () => {
    const cleanId = gasService.setSpreadsheetId(spreadsheetId);
    setSpreadsheetId(cleanId);
    gasService.setGasUrl(url);
    setIsBusy(true);
    setBusyLabel('Menarik data & Sheet "Setting" dari Google Spreadsheet...');
    setStatusResult(null);
    const res = await gasService.syncFromSpreadsheet(url);
    const updated = gasService.getAppSettings();
    setDriveFolderUrl(updated.driveFolderUrl);
    setLogoUrl(updated.logoUrl);
    setHeroPhotoUrl(updated.heroPhotoUrl);
    setHeroCropMode(updated.heroCropMode || 'cutout');
    setIsBusy(false);
    setStatusResult(res);
    if (onConfigChanged) onConfigChanged();
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleCopySheetId = () => {
    navigator.clipboard.writeText(spreadsheetId);
    setCopiedSheetId(true);
    setTimeout(() => setCopiedSheetId(false), 2000);
  };

  const handleResetData = async () => {
    setIsBusy(true);
    setBusyLabel('Membersihkan cache lokal & menarik ulang data dari Database Google Spreadsheet...');
    await gasService.resetToMockData();
    setIsBusy(false);
    setStatusResult({
      success: true,
      message: 'Cache lokal berhasil dibersihkan dan data telah disinkronkan ulang langsung dari Database Google Spreadsheet.'
    });
    if (onConfigChanged) onConfigChanged();
  };

  const isLive = gasService.isLiveGasConfigured();
  const lastSync = gasService.getLastSyncTime();

  const modalNode = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/65 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-3xl rounded-3xl bg-white shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between px-5 sm:px-6 py-4 bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/15 border border-white/25 flex items-center justify-center shrink-0">
              <Database className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-extrabold tracking-tight">
                  Koneksi Database &amp; Pengaturan Super Admin
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-400 text-slate-950">
                  Khusus Admin
                </span>
              </div>
              <p className="text-xs text-emerald-100/90 mt-0.5">
                Terhubung ke Spreadsheet <span className="font-mono font-bold text-amber-200">DataBaseSiswa</span> &amp; Sheet <span className="font-mono font-bold text-amber-200">Setting</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs text-slate-700 flex-1">
          {/* Status Mode Banner */}
          <div className="p-3.5 rounded-2xl border flex flex-wrap items-center justify-between gap-2 bg-slate-50 border-slate-200">
            <div className="flex items-center gap-2.5">
              <span className={`w-3 h-3 rounded-full shrink-0 ${isLive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              <div>
                <div className="font-bold text-slate-900">
                  Status: {isLive ? 'Terhubung ke Cloud Google Spreadsheet (Live Sync)' : 'Spreadsheet Terdaftar — Menunggu URL Web App GAS'}
                </div>
                {lastSync && (
                  <div className="text-[11px] text-slate-500">
                    Sinkronisasi terakhir: {new Date(lastSync).toLocaleString('id-ID')}
                  </div>
                )}
              </div>
            </div>
            {onOpenPanduan && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenPanduan();
                }}
                className="px-3 py-1.5 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold flex items-center gap-1.5 transition cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Panduan Lengkap</span>
              </button>
            )}
          </div>

          {/* =========================================================================
              BAGIAN UTAMA SUPER ADMIN: SHEET "Setting" (FOLDER DRIVE, LOGO & FOTO BADGE)
             ========================================================================= */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-50/80 via-white to-emerald-50/60 border-2 border-amber-200/90 space-y-4 shadow-xs">
            <div className="flex items-center justify-between gap-2 flex-wrap border-b border-amber-200/70 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                  <Settings className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm">
                    Pengaturan Super Admin (Tersimpan di Sheet <code className="text-emerald-800 font-mono">"Setting"</code>)
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Kelola Link Folder Google Drive, Logo Sekolah, dan Foto Badge Animasi di Halaman Beranda
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-900 font-mono text-[10px] font-extrabold">
                Sheet: Setting
              </span>
            </div>

            {/* 1. Input Link Folder Google Drive */}
            <div className="space-y-1.5 bg-white p-3.5 rounded-xl border border-slate-200/90">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <label className="font-extrabold text-slate-800 flex items-center gap-1.5 text-xs">
                  <FolderOpen className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>1. Link Folder Google Drive (Penyimpanan PDF Hasil Wawancara)</span>
                </label>
                {driveFolderUrl && (
                  <a
                    href={driveFolderUrl.startsWith('http') ? driveFolderUrl : `https://drive.google.com/drive/folders/${driveFolderUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 underline"
                  >
                    <span>Buka Folder Drive</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
              <input
                type="text"
                value={driveFolderUrl}
                onChange={(e) => setDriveFolderUrl(e.target.value)}
                placeholder="https://drive.google.com/drive/folders/1jAcyugqheVYkOG-RnuuqQgeUMvfwrVEo"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 font-mono text-xs text-slate-900"
              />
              <p className="text-[10px] text-slate-500">
                Masukkan Link URL lengkap Folder Google Drive atau ID Folder tempat menyimpan file PDF hasil wawancara orang tua &amp; observasi siswa.
              </p>
            </div>

            {/* Grid 2 Kolom: 2. Upload Logo & 3. Upload Foto Badge Beranda */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {/* 2. Upload Logo Sekolah */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 flex flex-col justify-between space-y-3">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-1">
                    <label className="font-extrabold text-slate-800 flex items-center gap-1.5 text-xs">
                      <ImageIcon className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>2. Upload Logo Sekolah</span>
                    </label>
                    {logoUrl && (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[9px] font-extrabold flex items-center gap-1">
                        <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                        <span>Tersimpan di Cloud</span>
                      </span>
                    )}
                  </div>

                  {/* Preview Logo */}
                  <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                    {logoUrl ? (
                      <img
                        src={gasService.resolveImageUrl(logoUrl)}
                        alt="Logo SMPIT Pondok Duta"
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 rounded-xl object-contain bg-white border border-slate-200 p-1 shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-800 via-emerald-700 to-emerald-600 flex items-center justify-center text-amber-300 font-extrabold text-base shrink-0">
                        PD
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-slate-800 text-xs truncate">
                        {logoUrl ? 'Logo Kustom Aktif (Cloud)' : 'Logo Standar (PD)'}
                      </div>
                      <div className="text-[10px] text-slate-500 leading-snug">
                        Tampil otomatis di semua perangkat (Header &amp; Footer)
                      </div>
                      {logoDriveUrl && (
                        <a
                          href={logoDriveUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 hover:underline mt-0.5"
                        >
                          <span>Lihat File di Folder Drive</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Status Cloud / Input Link Eksternal */}
                  <div>
                    <span className="text-[10px] font-semibold text-slate-500 block mb-1">
                      {logoUrl.startsWith('data:image/')
                        ? 'Status Penyimpanan Database Cloud (Sheet "Setting" & Drive):'
                        : 'Link Gambar Logo (Google Drive / URL):'}
                    </span>
                    {logoUrl.startsWith('data:image/') ? (
                      <div className="px-3 py-1.5 rounded-lg bg-emerald-50/90 border border-emerald-200 text-[11px] font-bold text-emerald-900 flex items-center justify-between gap-2">
                        <span className="truncate">
                          ✓ Tersimpan di Sheet &quot;Setting&quot; ({Math.round(logoUrl.length / 1024)} KB)
                        </span>
                        <a
                          href={driveFolderUrl || 'https://drive.google.com/drive/folders/1jAcyugqheVYkOG-RnuuqQgeUMvfwrVEo'}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] text-emerald-700 underline shrink-0"
                        >
                          Folder Drive
                        </a>
                      </div>
                    ) : (
                      <input
                        type="text"
                        value={logoUrl}
                        onChange={(e) => setLogoUrl(e.target.value)}
                        placeholder="https://drive.google.com/... atau klik Upload Logo"
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 font-mono text-[11px] text-slate-800"
                      />
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => logoInputRef.current?.click()}
                    className="flex-1 py-2 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition cursor-pointer disabled:opacity-50"
                  >
                    <Upload className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                    <span>Upload Logo ke Cloud</span>
                  </button>
                  {logoUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        setLogoUrl('');
                        setLogoDriveUrl('');
                      }}
                      title="Reset ke Logo Standar"
                      className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </div>
              </div>

              {/* 3. Pengaturan Foto Badge E-Flyer di Beranda */}
              <div className="bg-white p-4 rounded-xl border border-slate-200/90 flex flex-col justify-between space-y-3.5 shadow-2xs">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <label className="font-extrabold text-slate-800 flex items-center gap-1.5 text-xs sm:text-sm">
                      <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>3. Foto Badge E-Flyer di Beranda (Google Drive HD)</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setHeroCropMode(heroCropMode === 'cutout' ? 'full' : 'cutout')}
                      className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[11px] font-bold flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Crop className="w-3.5 h-3.5" />
                      <span>{heroCropMode === 'cutout' ? 'Mode: Potongan Siswa' : 'Mode: E-Flyer Utuh'}</span>
                    </button>
                  </div>

                  {/* Preview Foto Badge Beranda */}
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                    {heroPhotoUrl || heroDriveUrl ? (
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-white border border-slate-200 shrink-0 shadow-2xs">
                        <img
                          src={gasService.resolveImageUrl(heroPhotoUrl || heroDriveUrl)}
                          alt="Preview Foto Badge Beranda"
                          referrerPolicy="no-referrer"
                          className={
                            heroCropMode === 'cutout'
                              ? 'w-full h-[175%] object-cover object-[50%_58%] -mt-[34%]'
                              : 'w-full h-full object-contain'
                          }
                        />
                      </div>
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-extrabold text-[10px] text-center leading-tight p-1 shrink-0">
                        Default Visual
                      </div>
                    )}
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-800 text-xs">
                          {heroPhotoUrl || heroDriveUrl ? 'Foto Beranda Aktif' : 'Ilustrasi Default Aktif'}
                        </span>
                        {gasService.extractDriveFileId(heroPhotoUrl || heroDriveUrl) ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[9.5px]">
                            ✓ Google Drive HD Asli (Jernih &amp; Tidak Pecah)
                          </span>
                        ) : heroPhotoUrl?.startsWith('data:image/') ? (
                          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[9.5px]">
                            ⚠️ Kompresi Lokal ({Math.round(heroPhotoUrl.length / 1024)} KB)
                          </span>
                        ) : null}
                      </div>

                      <div className="text-[10px] text-slate-500 leading-snug">
                        Otomatis tersinkronisasi ke semua layar (HP &amp; Laptop).
                      </div>

                      {(heroDriveUrl || gasService.extractDriveFileId(heroPhotoUrl)) && (
                        <a
                          href={gasService.resolveImageUrl(heroPhotoUrl || heroDriveUrl)}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 hover:text-emerald-800 underline"
                        >
                          <span>Buka File Asli Resolusi Penuh di Tab Baru</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Input Utama: Link File Gambar Asli dari Google Drive */}
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between gap-1 flex-wrap">
                      <label className="text-[11px] font-bold text-slate-800 flex items-center gap-1">
                        <Link className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Link File Asli dari Google Drive (Sangat Direkomendasikan):</span>
                      </label>
                      {heroPhotoUrl?.startsWith('data:image/') && (
                        <button
                          type="button"
                          onClick={() => {
                            setHeroPhotoUrl('');
                            setHeroDriveUrl('');
                          }}
                          className="text-[10px] text-emerald-700 hover:text-emerald-800 font-bold underline"
                        >
                          Kosongkan untuk Input Link Drive
                        </button>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <input
                        type="text"
                        value={heroPhotoUrl?.startsWith('data:image/') ? '' : heroPhotoUrl}
                        onChange={(e) => {
                          const val = e.target.value.trim();
                          setHeroPhotoUrl(val);
                          setHeroDriveUrl(val);
                        }}
                        placeholder="Contoh: https://drive.google.com/file/d/1ABCxyz.../view?usp=sharing"
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 font-mono text-[11px] text-slate-900 shadow-2xs"
                      />

                      {/* Notifikasi Deteksi Google Drive ID */}
                      {gasService.extractDriveFileId(heroPhotoUrl) && (
                        <div className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-[10px] font-semibold flex items-center justify-between gap-2">
                          <span className="truncate">
                            ✨ File Google Drive Terdeteksi (ID: {gasService.extractDriveFileId(heroPhotoUrl)})
                          </span>
                          <span className="text-emerald-700 font-bold shrink-0">
                            Resolusi Penuh (Tanpa Kompresi)
                          </span>
                        </div>
                      )}

                      {/* Panduan 3 Langkah Cara Ambil Link dari Google Drive */}
                      <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200/90 text-amber-950 text-[10.5px] space-y-1">
                        <div className="font-bold flex items-center gap-1.5 text-amber-900 text-[11px]">
                          <HelpCircle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                          <span>Cara Mengambil Link File Asli dari Google Drive agar Jernih:</span>
                        </div>
                        <ol className="list-decimal list-inside space-y-0.5 text-amber-900/90 text-[10px] leading-relaxed pl-1">
                          <li>Buka file foto/eflayer di <strong>Google Drive</strong> Anda.</li>
                          <li>Klik kanan file &gt; pilih <strong>Bagikan (Share)</strong>.</li>
                          <li>Pada bagian <em>Akses umum</em>, ubah menjadi <strong>&quot;Siapa saja yang memiliki link&quot;</strong> &gt; peran <strong>&quot;Pelihat&quot;</strong>.</li>
                          <li>Klik <strong>Salin link</strong>, lalu tempelkan (*paste*) pada kotak di atas dan klik tombol simpan di bawah.</li>
                        </ol>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Alternatif: Upload File dari Perangkat & Tombol Hapus */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => heroInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                      title="Upload file langsung dari perangkat (akan dikompres otomatis untuk sel spreadsheet)"
                    >
                      <Upload className="w-3 h-3 text-slate-500 shrink-0" />
                      <span>Atau Upload File dari Komputer/HP (Alternatif)</span>
                    </button>
                    <input
                      ref={heroInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleHeroPhotoUpload}
                      className="hidden"
                    />
                  </div>

                  {(heroPhotoUrl || heroDriveUrl) && (
                    <button
                      type="button"
                      onClick={() => {
                        setHeroPhotoUrl('');
                        setHeroDriveUrl('');
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[10.5px] font-bold flex items-center gap-1 transition cursor-pointer"
                      title="Hapus foto badge dan gunakan visual default"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Hapus Foto</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Tombol Simpan Pengaturan Super Admin ke Sheet "Setting" */}
            <button
              type="button"
              onClick={handleSaveAll}
              disabled={isBusy}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-700 hover:from-emerald-800 hover:to-teal-800 text-white font-extrabold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-amber-300 shrink-0" />
              <span>Simpan &amp; Sinkronkan Pengaturan (Folder Drive, Logo &amp; Foto Badge) ke Sheet &quot;Setting&quot;</span>
            </button>
          </div>

          {/* =========================================================================
              BAGIAN KONFIGURASI SPREADSHEET & SCRIPT GAS
             ========================================================================= */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/90 space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <label className="font-extrabold text-emerald-950 flex items-center gap-2 text-xs sm:text-sm">
                <FileSpreadsheet className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Target Google Spreadsheet Database</span>
              </label>
              <a
                href={gasService.getSpreadsheetUrl(spreadsheetId)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[11px] shadow-xs transition"
              >
                <span>Buka Spreadsheet</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={spreadsheetId}
                onChange={(e) => setSpreadsheetId(e.target.value)}
                placeholder="1sKTeUlnxa9aquB8rBZfULrx7ZUaP1v-7pFBzu5EW3m8"
                className="flex-1 px-3.5 py-2 rounded-xl bg-white border border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 font-mono text-xs text-slate-900 font-semibold"
              />
              <button
                type="button"
                onClick={handleCopySheetId}
                className="px-3 py-2 rounded-xl bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs flex items-center gap-1.5 shrink-0 transition cursor-pointer"
                title="Salin ID Spreadsheet"
              >
                {copiedSheetId ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span className="hidden sm:inline">{copiedSheetId ? 'Tersalin' : 'Salin ID'}</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-0.5">
              <span className="text-[11px] font-semibold text-emerald-900 mr-1">9 Tabel Sheet Otomatis:</span>
              {[
                'Setting',
                'Users',
                'Siswa',
                'Data Induk Sekolah',
                'OTM',
                'Hasil_Wawancara',
                'Observasi_Siswa',
                'Wawancara_Siswa',
                'Kelulusan'
              ].map((sh) => (
                <span
                  key={sh}
                  className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-bold border ${
                    sh === 'Setting'
                      ? 'bg-amber-100 border-amber-300 text-amber-950'
                      : sh === 'Siswa' || sh === 'Data Induk Sekolah'
                      ? 'bg-emerald-100 border-emerald-300 text-emerald-950'
                      : 'bg-white border-emerald-200 text-emerald-900'
                  }`}
                >
                  {sh}
                </span>
              ))}
            </div>
          </div>

          {/* URL Web App GAS & Salin Kode Code.gs */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div>
                <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>URL Web App &amp; Script Google Apps Script (Code.gs)</span>
                </h4>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Kode <code>Code.gs</code> terbaru sudah mendukung pembuatan otomatis Sheet <strong>"Setting"</strong>.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowCodePreview(!showCodePreview)}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold text-[11px] transition cursor-pointer"
                >
                  {showCodePreview ? 'Sembunyikan Kode' : 'Lihat Kode'}
                </button>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Kode GAS Tersalin!' : 'Salin Kode Code.gs'}</span>
                </button>
              </div>
            </div>

            {showCodePreview && (
              <pre className="p-3 rounded-xl bg-slate-900 text-emerald-300 font-mono text-[10px] overflow-x-auto max-h-44 leading-relaxed">
                {GOOGLE_APPS_SCRIPT_CODE}
              </pre>
            )}

            <div className="relative">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-xs font-mono text-slate-900"
              />
              <Link className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          {/* Status / Test Result Box */}
          {isBusy && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-2.5 font-semibold">
              <RefreshCw className="w-4 h-4 text-emerald-700 animate-spin shrink-0" />
              <span>{busyLabel}</span>
            </div>
          )}

          {statusResult && !isBusy && (
            <div
              className={`p-3.5 rounded-2xl border text-xs flex items-start gap-2.5 ${
                statusResult.success
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-amber-50 border-amber-200 text-amber-950'
              }`}
            >
              {statusResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1.5">
                <div className="font-semibold leading-relaxed">{statusResult.message}</div>
                {statusResult.updatedHeaders && statusResult.updatedHeaders.length > 0 && (
                  <div className="text-[11px] text-emerald-900 bg-emerald-100/80 border border-emerald-300/80 px-2.5 py-1.5 rounded-lg font-medium leading-relaxed">
                    ✨ Baris 1 Header kolom berhasil diperbarui pada sheet: <strong>{statusResult.updatedHeaders.join(', ')}</strong> (Seluruh 65 kolom kini 100% selaras dengan struktur data).
                  </div>
                )}
                {statusResult.sheets && statusResult.sheets.length > 0 && (
                  <div className="text-[11px] text-emerald-800">
                    Sheet aktif di Spreadsheet: <strong>{statusResult.sheets.join(', ')}</strong>
                  </div>
                )}
              </div>
            </div>
          )}

          {savedSuccess && (
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Pengaturan berhasil disimpan &amp; diterapkan!</span>
            </div>
          )}

          {/* Cloud Database Sync Tools */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 font-extrabold text-xs sm:text-sm text-amber-300">
                <Sparkles className="w-4 h-4 shrink-0" />
                <span>Sinkronisasi Database 2-Arah</span>
              </div>
              <button
                type="button"
                onClick={handleTest}
                disabled={isBusy}
                className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold text-emerald-300 flex items-center gap-1.5 transition cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isBusy ? 'animate-spin' : ''}`} />
                <span>Uji Koneksi</span>
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={handleSetupSheets}
                disabled={isBusy}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-[11px] border border-white/15 transition disabled:opacity-50 cursor-pointer"
                title="Membuat seluruh 9 sheet dan menyinkronkan baris 1 header kolom agar 100% cocok dengan kode"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                <span>1. Setup &amp; Sinkron Header</span>
              </button>
              <button
                type="button"
                onClick={handlePushToCloud}
                disabled={isBusy}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] shadow-xs transition disabled:opacity-50 cursor-pointer"
              >
                <UploadCloud className="w-3.5 h-3.5 shrink-0" />
                <span>2. Upload Data ke Sheet</span>
              </button>
              <button
                type="button"
                onClick={handlePullFromCloud}
                disabled={isBusy}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-[11px] shadow-xs transition disabled:opacity-50 cursor-pointer"
              >
                <DownloadCloud className="w-3.5 h-3.5 shrink-0" />
                <span>3. Tarik Data dari Sheet</span>
              </button>
            </div>
          </div>

          {/* Local Storage fallback explanation */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong>Mode Database Cloud Aktif:</strong> Seluruh data dibaca langsung dari Google Spreadsheet (tanpa data dummy di kode).
              </span>
            </div>
            <button
              type="button"
              onClick={handleResetData}
              className="text-xs text-emerald-700 hover:text-emerald-800 font-bold underline cursor-pointer shrink-0"
            >
              Bersihkan Cache &amp; Tarik Ulang Database
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-500 font-mono truncate max-w-[65%]">
            ID: {spreadsheetId}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition cursor-pointer"
          >
            Selesai &amp; Tutup
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalNode, document.body) : modalNode;
};
