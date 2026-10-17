import React, { useState } from 'react';
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
  Code2
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfigChanged?: () => void;
  onOpenPanduan?: () => void;
}

export const GasConfigModal: React.FC<Props> = ({ isOpen, onClose, onConfigChanged, onOpenPanduan }) => {
  const [spreadsheetId, setSpreadsheetId] = useState(gasService.getSpreadsheetId() || DEFAULT_SPREADSHEET_ID);
  const [url, setUrl] = useState(gasService.getGasUrl());
  const [isBusy, setIsBusy] = useState(false);
  const [busyLabel, setBusyLabel] = useState('');
  const [statusResult, setStatusResult] = useState<{ success: boolean; message: string; sheets?: string[] } | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedSheetId, setCopiedSheetId] = useState(false);
  const [showCodePreview, setShowCodePreview] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    const cleanId = gasService.setSpreadsheetId(spreadsheetId);
    setSpreadsheetId(cleanId);
    gasService.setGasUrl(url);
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
    setBusyLabel('Membuat 7 Sheet Database otomatis di Spreadsheet...');
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
    setIsBusy(true);
    setBusyLabel('Mengunggah seluruh data aplikasi ke Google Spreadsheet...');
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
    setBusyLabel('Menarik data terbaru dari Google Spreadsheet...');
    setStatusResult(null);
    const res = await gasService.syncFromSpreadsheet(url);
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

  const handleResetData = () => {
    gasService.resetToMockData();
    setStatusResult({
      success: true,
      message: 'Data lokal simulasi berhasil di-reset ke data awal SMPIT Pondok Duta.'
    });
    if (onConfigChanged) onConfigChanged();
  };

  const isLive = gasService.isLiveGasConfigured();
  const lastSync = gasService.getLastSyncTime();

  const modalNode = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/65 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between px-5 sm:px-6 py-4 bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/15 border border-white/25 flex items-center justify-center shrink-0">
              <Database className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-extrabold tracking-tight">
                  Koneksi Database Google Spreadsheet
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-400 text-slate-950">
                  Tanpa OAuth
                </span>
              </div>
              <p className="text-xs text-emerald-100/90 mt-0.5">
                Integrasi langsung ke Spreadsheet SMPIT Pondok Duta via Google Apps Script
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

          {/* 1. Target Google Spreadsheet ID */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/90 space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <label className="font-extrabold text-emerald-950 flex items-center gap-2 text-xs sm:text-sm">
                <FileSpreadsheet className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>1. Target Google Spreadsheet Database</span>
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
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-white border border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 font-mono text-xs text-slate-900 font-semibold"
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
              <span className="text-[11px] font-semibold text-emerald-900 mr-1">7 Tabel Sheet Otomatis:</span>
              {['Users', 'Siswa', 'OTM', 'Hasil_Wawancara', 'Observasi_Siswa', 'Wawancara_Siswa', 'Kelulusan'].map((sh) => (
                <span
                  key={sh}
                  className="px-2 py-0.5 rounded-md bg-white border border-emerald-200 text-emerald-900 font-mono text-[10px] font-bold"
                >
                  {sh}
                </span>
              ))}
            </div>
          </div>

          {/* 2. Salin Kode Google Apps Script (Code.gs) */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div>
                <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>2. Pasang Script Penghubung di Spreadsheet Anda</span>
                </h4>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  ID Spreadsheet <code className="font-mono font-bold text-emerald-800">1sKTeUlnxa9aquB8rBZfULrx7ZUaP1v-7pFBzu5EW3m8</code> sudah tertanam di dalam kode ini.
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

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
              <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                <span className="font-extrabold text-emerald-700 block">Langkah A</span>
                Di Spreadsheet Anda, klik menu <strong>Extensions &gt; Apps Script</strong> lalu tempel kode di atas.
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                <span className="font-extrabold text-emerald-700 block">Langkah B</span>
                Klik tombol <strong>Deploy &gt; New deployment</strong>, pilih jenis <strong>Web app</strong>.
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                <span className="font-extrabold text-emerald-700 block">Langkah C</span>
                Set <em>Who has access</em> ke <strong>Anyone (Siapa saja)</strong>, klik Deploy &amp; salin URL <code>/exec</code>.
              </div>
            </div>
          </div>

          {/* 3. Input URL Web App GAS */}
          <div className="space-y-2">
            <label className="block font-extrabold text-slate-900 text-xs sm:text-sm">
              3. URL Web App Google Apps Script (Berakhiran <code>/exec</code>)
            </label>
            <div className="relative">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-xs font-mono text-slate-900"
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
              <div className="space-y-1">
                <div className="font-semibold leading-relaxed">{statusResult.message}</div>
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
              <span>Konfigurasi ID Spreadsheet &amp; URL GAS berhasil disimpan!</span>
            </div>
          )}

          {/* Primary Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            <button
              type="button"
              onClick={handleTest}
              disabled={isBusy}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isBusy ? 'animate-spin' : ''}`} />
              <span>Uji Koneksi Spreadsheet</span>
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isBusy}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition disabled:opacity-50 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Simpan Konfigurasi</span>
            </button>
          </div>

          {/* Cloud Database Sync Tools */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-extrabold text-xs sm:text-sm text-amber-300">
                <Sparkles className="w-4 h-4 shrink-0" />
                <span>Sinkronisasi Database 2-Arah (Cloud Spreadsheet)</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Setelah URL Web App GAS diisi, Anda dapat membuat ke-7 Sheet secara otomatis, mengunggah data lokal ke Spreadsheet, atau menarik data terbaru dari Spreadsheet:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={handleSetupSheets}
                disabled={isBusy}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-[11px] border border-white/15 transition disabled:opacity-50 cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                <span>1. Buat 7 Sheet Otomatis</span>
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
                <strong>Cadangan Lokal Aktif:</strong> Data tetap tersimpan aman di perangkat meskipun internet terputus.
              </span>
            </div>
            <button
              type="button"
              onClick={handleResetData}
              className="text-xs text-rose-600 hover:text-rose-700 font-bold underline cursor-pointer shrink-0"
            >
              Reset Data Simulasi
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
