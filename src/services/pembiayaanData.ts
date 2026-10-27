import { PembiayaanCategory } from '../types';

/**
 * Format angka atau string ke mata uang Rupiah standar (contoh: "Rp 5.500.000")
 */
export function formatRupiah(value: number | string | undefined | null): string {
  if (value === undefined || value === null || value === '' || value === '-') {
    return 'Rp 0';
  }
  if (typeof value === 'string' && value.trim().startsWith('Rp')) {
    return value.trim();
  }
  const numeric = typeof value === 'number' ? value : parseFloat(String(value).replace(/[^0-9.-]+/g, ''));
  if (isNaN(numeric) || numeric === 0) {
    return 'Rp 0';
  }
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(numeric);
}

/**
 * Parsing string mata uang (misal: "Rp 5.500.000" atau "5.500.000") menjadi angka murni number (misal: 5500000)
 */
export function parseRupiah(value: string | number | undefined | null): number {
  if (value === undefined || value === null || value === '' || value === '-') {
    return 0;
  }
  if (typeof value === 'number') {
    return isNaN(value) ? 0 : value;
  }
  const cleaned = String(value).replace(/[^0-9-]/g, '');
  const parsed = parseInt(cleaned, 10);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * 16 Kolom Resmi Sheet Database "Pembiayaan" di Google Spreadsheet:
 * Kategori, Ring, Gelombang, Gedung, BPP, Seragam, Subtotal I, Buku, Outing Perkemahan, KBM, Komite, OSIS, Subtotal II, SPP, Total Biaya, Catatan.
 */
export const PEMBIAYAAN_HEADERS: string[] = [
  'Kategori',
  'Ring',
  'Gelombang',
  'Gedung',
  'BPP',
  'Seragam',
  'Subtotal I',
  'Buku',
  'Outing Perkemahan',
  'KBM',
  'Komite',
  'OSIS',
  'Subtotal II',
  'SPP',
  'Total Biaya',
  'Catatan'
];

/**
 * Data Kategori Pembiayaan MURNI DARI DATABASE GOOGLE SPREADSHEET (Sheet: "Pembiayaan")
 * Seluruh data dummy dihilangkan. Sistem hanya membaca dari baris tabel database Google Sheets Anda.
 */
export const DEFAULT_PEMBIAYAAN_LIST: PembiayaanCategory[] = [];

export const EMPTY_PEMBIAYAAN_CATEGORY: PembiayaanCategory = {
  kategori: 'Pilih Kategori Pembiayaan',
  ring: '-',
  gelombang: '-',
  gedung: 0,
  bpp: 0,
  seragam: 0,
  subtotalI: 0,
  buku: 0,
  outingPerkemahan: 0,
  kbm: 0,
  komite: 0,
  osis: 0,
  subtotalII: 0,
  spp: 0,
  totalBiaya: 0,
  catatan: ''
};

/**
 * Hitung otomatis subtotal dan total biaya dari komponen-komponen pembiayaan
 */
export function calculatePembiayaanTotals(item: Partial<PembiayaanCategory>): PembiayaanCategory {
  const gedung = parseRupiah(item.gedung ?? 0);
  const bpp = parseRupiah(item.bpp ?? 0);
  const seragam = parseRupiah(item.seragam ?? 0);
  const subtotalI = gedung + bpp + seragam;

  const buku = parseRupiah(item.buku ?? 0);
  const outing = parseRupiah(item.outingPerkemahan ?? 0);
  const kbm = parseRupiah(item.kbm ?? 0);
  const komite = parseRupiah(item.komite ?? 0);
  const osis = parseRupiah(item.osis ?? 0);
  const subtotalII = buku + outing + kbm + komite + osis;

  const spp = parseRupiah(item.spp ?? 0);
  const totalBiaya = subtotalI + subtotalII + spp;

  return {
    kategori: item.kategori || '',
    ring: item.ring || 'Ring 1',
    gelombang: item.gelombang || 'Gelombang 2',
    gedung,
    bpp,
    seragam,
    subtotalI,
    buku,
    outingPerkemahan: outing,
    kbm,
    komite,
    osis,
    subtotalII,
    spp,
    totalBiaya,
    catatan: item.catatan || ''
  };
}
