export const DEFAULT_SPREADSHEET_ID = "1sKTeUlnxa9aquB8rBZfULrx7ZUaP1v-7pFBzu5EW3m8";
export const DEFAULT_GAS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycby09NHcW7jTdpBWP048-F0drORorN3LSEfXy-vrF2wT4YVKaZATCJUVi6m2IV8ImxOK/exec";
export const DEFAULT_DRIVE_FOLDER_URL = "https://drive.google.com/drive/folders/1jAcyugqheVYkOG-RnuuqQgeUMvfwrVEo";

export const GOOGLE_APPS_SCRIPT_CODE = `/**
 * =========================================================================
 * GOOGLE APPS SCRIPT (GAS) API - SPMB SMPIT PONDOK DUTA
 * Terhubung ke Google Spreadsheet ID: 1sKTeUlnxa9aquB8rBZfULrx7ZUaP1v-7pFBzu5EW3m8
 * Backend Database 9 Sheet (Termasuk Sheet "Setting", "Data Induk Sekolah" & Upload Drive)
 * =========================================================================
 */

const SPREADSHEET_ID = "1sKTeUlnxa9aquB8rBZfULrx7ZUaP1v-7pFBzu5EW3m8";
const DEFAULT_FOLDER_ID = "1jAcyugqheVYkOG-RnuuqQgeUMvfwrVEo";

const SHEET_SETTING = "Setting";
const SHEET_USERS = "Users";
const SHEET_SISWA = "Siswa";
const SHEET_DATA_INDUK = "Data Induk Sekolah";
const SHEET_OTM_NAME = "OTM";
const SHEET_DB_NAME = "Hasil_Wawancara";
const SHEET_SISWA_OBS = "Observasi_Siswa";
const SHEET_WAWANCARA_SISWA = "Wawancara_Siswa";
const SHEET_KELULUSAN = "Kelulusan";
const SHEET_PEMBIAYAAN = "Pembiayaan";

// Header Kolom Database Sheet "Kelulusan" (13 Kolom Resmi termasuk 3 Kolom Status Pengumuman per Baris Siswa)
const KELULUSAN_HEADERS = [
  "No Pendaftaran",
  "NISN",
  "Nama Lengkap",
  "Asal Sekolah",
  "Jalur",
  "Status Kelulusan",
  "Skor Akhir",
  "Pesan Pengumuman",
  "Jadwal Daftar Ulang",
  "Updated At",
  "Status Kirim Pesan",
  "Status Cek Seleksi",
  "Status Unduh SKHS"
];

// Header Kolom Database Sheet "Pembiayaan" (16 Kolom Resmi Rincian Daftar Ulang)
const PEMBIAYAAN_HEADERS = [
  "Kategori",
  "Ring",
  "Gelombang",
  "Gedung",
  "BPP",
  "Seragam",
  "Subtotal I",
  "Buku",
  "Outing Perkemahan",
  "KBM",
  "Komite",
  "OSIS",
  "Subtotal II",
  "SPP",
  "Total Biaya",
  "Catatan"
];

// Header Kolom Lengkap Biodata Siswa (Sesuai Struktur Form Biodata Lengkap & Data Induk - 65 Kolom)
const SISWA_HEADERS = [
  "No Pendaftaran",
  "Nama Lengkap",
  "Nama Panggilan",
  "NISN",
  "Jenis Kelamin",
  "Tempat Lahir",
  "Tanggal Lahir",
  "Agama",
  "Asal Sekolah",
  "Alamat",
  "Kelurahan",
  "Kecamatan",
  "Kota/Kabupaten",
  "No HP Ortu",
  "Nama Ayah",
  "Pekerjaan Ayah",
  "Penghasilan Ayah",
  "No HP Ayah",
  "Nama Ibu",
  "Pekerjaan Ibu",
  "Penghasilan Ibu",
  "No HP Ibu",
  "NIK Siswa",
  "Kewarganegaraan",
  "Anak Ke",
  "Jml Sdr Kandung",
  "Jml Sdr Tiri",
  "Jml Sdr Angkat",
  "Bahasa Sehari-hari",
  "Berat Badan (kg)",
  "Tinggi Badan (cm)",
  "Golongan Darah",
  "Penyakit Berat",
  "Kelainan Jasmani",
  "Bertempat Tinggal Pada",
  "Jarak ke Sekolah (km)",
  "Sarana Berangkat",
  "Masuk Sebagai",
  "Nomor Ijazah SD",
  "Kesenian",
  "Olahraga",
  "Organisasi",
  "Menerima Beasiswa",
  "Prestasi",
  "TTL Ayah",
  "Agama Ayah",
  "Pendidikan Ayah",
  "Alamat Ayah",
  "Email Ayah",
  "TTL Ibu",
  "Agama Ibu",
  "Pendidikan Ibu",
  "Alamat Ibu",
  "Email Ibu",
  "Nama Wali",
  "TTL Wali",
  "Agama Wali",
  "Pendidikan Wali",
  "Pekerjaan Wali",
  "Penghasilan Wali",
  "Alamat Wali",
  "No HP Wali",
  "Hubungan Wali",
  "JSON Biodata Lengkap",
  "Updated At"
];

// Header Kolom Lengkap Buku Induk Siswa (Standar Resmi Buku Induk Dikdasmen & Dapodik - TANPA JSON)
const DATA_INDUK_HEADERS = [
  "No Urut",
  "NIS / NISS",
  "NISN",
  "NIK Siswa",
  "No Pendaftaran",
  "Nama Lengkap Siswa",
  "Nama Panggilan",
  "Jenis Kelamin",
  "Tempat Lahir",
  "Tanggal Lahir",
  "Agama",
  "Kewarganegaraan",
  "Anak Ke",
  "Jml Saudara Kandung",
  "Jml Saudara Tiri",
  "Jml Saudara Angkat",
  "Bahasa Sehari-hari",
  "Berat Badan (kg)",
  "Tinggi Badan (cm)",
  "Golongan Darah",
  "Penyakit Berat Pernah Diderita",
  "Kelainan Jasmani",
  "Alamat Tempat Tinggal",
  "Kelurahan",
  "Kecamatan",
  "Kota / Kabupaten",
  "No Telepon / Handphone",
  "Bertempat Tinggal Pada",
  "Jarak ke Sekolah (km)",
  "Sarana Berangkat Sekolah",
  "Masuk Sebagai",
  "Asal Sekolah (SD/MI)",
  "Nomor Ijazah SD",
  "Kesenian",
  "Olahraga",
  "Organisasi",
  "Menerima Beasiswa",
  "Prestasi / Kejuaraan",
  "Nama Lengkap Ayah",
  "TTL Ayah",
  "Agama Ayah",
  "Pendidikan Terakhir Ayah",
  "Pekerjaan Ayah",
  "Penghasilan Ayah",
  "Alamat Ayah",
  "No HP / WhatsApp Ayah",
  "Email Ayah",
  "Status Perkawinan Ayah",
  "Nama Lengkap Ibu",
  "TTL Ibu",
  "Agama Ibu",
  "Pendidikan Terakhir Ibu",
  "Pekerjaan Ibu",
  "Penghasilan Ibu",
  "Alamat Ibu",
  "No HP / WhatsApp Ibu",
  "Email Ibu",
  "Status Perkawinan Ibu",
  "Nama Wali",
  "TTL Wali",
  "Agama Wali",
  "Pendidikan Wali",
  "Pekerjaan Wali",
  "Penghasilan Wali",
  "Alamat Wali",
  "No HP Wali",
  "Status Hubungan Wali",
  "Status Kelulusan",
  "Tahun Pelajaran",
  "Tanggal Diterima",
  "Catatan Khusus",
  "Updated At"
];

function getSpreadsheet() {
  try {
    if (SPREADSHEET_ID && SPREADSHEET_ID.trim() !== "") {
      return SpreadsheetApp.openById(SPREADSHEET_ID.trim());
    }
  } catch (e) {}
  return SpreadsheetApp.getActiveSpreadsheet();
}

function extractDriveFolderId(input) {
  if (!input) return DEFAULT_FOLDER_ID;
  var str = String(input).trim();
  if (!str) return DEFAULT_FOLDER_ID;

  if (str.indexOf("/folders/") !== -1) {
    var parts = str.split("/folders/");
    if (parts.length > 1) {
      var idPart = parts[1].split("/")[0].split("?")[0].split("&")[0].trim();
      if (idPart) return idPart;
    }
  }
  if (str.indexOf("id=") !== -1) {
    var idParts = str.split("id=");
    if (idParts.length > 1) {
      var cleanId = idParts[1].split("&")[0].split("/")[0].trim();
      if (cleanId) return cleanId;
    }
  }
  return str;
}

/**
 * Mengunggah gambar Base64 langsung ke dalam Folder Google Drive.
 */
function uploadImageToDriveFolder(base64DataUrl, filePrefix, folderLinkOrId) {
  if (!base64DataUrl || typeof base64DataUrl !== "string" || !base64DataUrl.startsWith("data:image/")) {
    return null;
  }
  try {
    const folderId = extractDriveFolderId(folderLinkOrId || DEFAULT_FOLDER_ID);
    const folder = DriveApp.getFolderById(folderId);

    const parts = base64DataUrl.split(",");
    if (parts.length < 2) return null;
    const header = parts[0];
    const base64Str = parts[1];

    let mimeType = "image/jpeg";
    let ext = "jpg";
    if (header.indexOf("image/png") !== -1) {
      mimeType = "image/png";
      ext = "png";
    } else if (header.indexOf("image/webp") !== -1) {
      mimeType = "image/webp";
      ext = "webp";
    }

    const fileName = filePrefix + "_SMPIT_Pondok_Duta." + ext;

    try {
      const existingFiles = folder.getFilesByName(fileName);
      while (existingFiles.hasNext()) {
        existingFiles.next().setTrashed(true);
      }
    } catch (cleanupErr) {}

    const decoded = Utilities.base64Decode(base64Str);
    const blob = Utilities.newBlob(decoded, mimeType, fileName);
    const file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    const fileId = file.getId();
    return {
      fileId: fileId,
      fileName: fileName,
      imageUrl: "https://lh3.googleusercontent.com/d/" + fileId,
      thumbnailUrl: "https://drive.google.com/thumbnail?id=" + fileId + "&sz=w1200",
      driveViewUrl: "https://drive.google.com/file/d/" + fileId + "/view"
    };
  } catch (err) {
    return null;
  }
}

function safeCellString(val) {
  const str = String(val === undefined || val === null ? "" : val);
  if (str.length > 48500) {
    return str.substring(0, 48500);
  }
  return str;
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// =========================================================================
// HIGH-PERFORMANCE ENGINE CACHING (CacheService RAM Server Google)
// Mempercepat pembacaan data hingga 10x - 20x lipat (< 200 milidetik!)
// =========================================================================
const CACHE_KEY_PREFIX = "SPMB_PD_V2_";
const CACHE_TTL_SECONDS = 1800; // 30 Menit di RAM Cache Google

function getAppCache(key) {
  try {
    const cache = CacheService.getScriptCache();
    const cached = cache.get(CACHE_KEY_PREFIX + key);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (e) {}
  return null;
}

function setAppCache(key, dataObj) {
  try {
    const cache = CacheService.getScriptCache();
    const str = JSON.stringify(dataObj);
    // Limit CacheService per key adalah 100 KB
    if (str && str.length < 95000) {
      cache.put(CACHE_KEY_PREFIX + key, str, CACHE_TTL_SECONDS);
    }
  } catch (e) {}
}

function clearAppCache() {
  try {
    const cache = CacheService.getScriptCache();
    cache.removeAll([
      CACHE_KEY_PREFIX + "ALL_DATA",
      CACHE_KEY_PREFIX + "STUDENT_LIST",
      CACHE_KEY_PREFIX + "DATA_INDUK",
      CACHE_KEY_PREFIX + "SETTINGS"
    ]);
  } catch (e) {}
}

/**
 * Membuat dan memastikan seluruh 9 Sheet Database beserta header kolom lengkap.
 */
function setupSheets(customHeadersMap) {
  const ss = getSpreadsheet();
  const createdSheets = [];
  const updatedHeaders = [];

  function ensureSheet(name, headers, headerRowIndex) {
    let sheet = ss.getSheetByName(name);
    if (!sheet) {
      sheet = ss.insertSheet(name);
      createdSheets.push(name);
    }
    const hRow = headerRowIndex || 1;
    if (!headers || headers.length === 0) return sheet;

    const lastCol = sheet.getLastColumn();
    const lastRow = sheet.getLastRow();

    if (lastRow < hRow) {
      // Sheet baru atau belum ada baris header
      sheet.getRange(hRow, 1, 1, headers.length).setValues([headers]);
      const headerRange = sheet.getRange(hRow, 1, 1, headers.length);
      headerRange.setBackground("#065f46");
      headerRange.setFontColor("#ffffff");
      headerRange.setFontWeight("bold");
      sheet.setFrozenRows(hRow);
      updatedHeaders.push(name);
      return sheet;
    }

    // Sheet sudah ada: periksa apakah header baris hRow berbeda dengan target headers
    const colsToRead = Math.max(lastCol, headers.length);
    let existingHeaders = [];
    if (colsToRead > 0) {
      existingHeaders = sheet.getRange(hRow, 1, 1, colsToRead).getValues()[0] || [];
    }

    let needsUpdate = false;
    if (existingHeaders.length < headers.length) {
      needsUpdate = true;
    } else {
      for (let i = 0; i < headers.length; i++) {
        const cur = String(existingHeaders[i] || "").trim();
        const tgt = String(headers[i] || "").trim();
        if (cur !== tgt) {
          needsUpdate = true;
          break;
        }
      }
    }

    if (needsUpdate) {
      // Jika kolom lama lebih banyak dari target baru, bersihkan sel header yang tidak terpakai
      if (lastCol > headers.length) {
        sheet.getRange(hRow, headers.length + 1, 1, lastCol - headers.length).clearContent().setBackground("#ffffff");
      }
      sheet.getRange(hRow, 1, 1, headers.length).setValues([headers]);
      const headerRange = sheet.getRange(hRow, 1, 1, headers.length);
      headerRange.setBackground("#065f46");
      headerRange.setFontColor("#ffffff");
      headerRange.setFontWeight("bold");
      sheet.setFrozenRows(hRow);
      updatedHeaders.push(name);
    }

    return sheet;
  }

  // 1. Sheet Setting
  const settingSheet = ensureSheet(SHEET_SETTING, [
    "Key Pengaturan", "Nilai / Link / Data", "Keterangan", "Updated At"
  ]);
  if (settingSheet.getLastRow() === 1) {
    const nowIso = new Date().toISOString();
    settingSheet.appendRow([
      "DRIVE_FOLDER_LINK",
      "https://drive.google.com/drive/folders/" + DEFAULT_FOLDER_ID,
      "Link Folder Google Drive untuk menyimpan PDF hasil wawancara, Logo & Foto Badge",
      nowIso
    ]);
    settingSheet.appendRow([
      "LOGO_URL",
      "",
      "Link Google Drive / Data Gambar Logo Sekolah SMPIT Pondok Duta",
      nowIso
    ]);
    settingSheet.appendRow([
      "HERO_PHOTO_URL",
      "",
      "Link Google Drive / Data Gambar Foto Badge di Halaman Beranda",
      nowIso
    ]);
    settingSheet.appendRow([
      "HERO_CROP_MODE",
      "cutout",
      "Mode tampilan foto badge di Beranda (cutout / full)",
      nowIso
    ]);
  }

  // 2. Sheet Users
  ensureSheet(SHEET_USERS, [
    "ID User", "Kode Pendaftaran", "Nama Siswa / Pengguna", "Nama Orang Tua / Ket",
    "Sekolah Asal", "Nomor HP", "Email", "Role", "Jabatan", "Created At"
  ]);

  // 3. Sheet Siswa (Gunakan SISWA_HEADERS 65 kolom lengkap atau custom headers dari web app)
  const activeSiswaHeaders = (customHeadersMap && customHeadersMap.Siswa) || SISWA_HEADERS;
  ensureSheet(SHEET_SISWA, activeSiswaHeaders);

  // 4. Sheet Data Induk Sekolah (RESMI - SELURUH KOLOM LENGKAP TANPA JSON)
  const activeDataIndukHeaders = (customHeadersMap && customHeadersMap.DataInduk) || DATA_INDUK_HEADERS;
  ensureSheet(SHEET_DATA_INDUK, activeDataIndukHeaders);

  // 5. Sheet OTM
  let otmSheet = ss.getSheetByName(SHEET_OTM_NAME);
  if (!otmSheet) {
    otmSheet = ss.insertSheet(SHEET_OTM_NAME);
    createdSheets.push(SHEET_OTM_NAME);
  }
  const otmHeaders = [
    "No Pendaftaran", "Nama Lengkap Siswa", "Nama Panggilan", "Jenis Kelamin",
    "Asal Sekolah", "NISN", "Nama Ayah", "Nama Ibu", "No HP WhatsApp", "Timestamp"
  ];
  for (let q = 1; q <= 35; q++) {
    otmHeaders.push("Q" + q + " (Ref Index " + (q + 9) + ")");
  }
  if (otmSheet.getLastRow() === 0) {
    otmSheet.appendRow(["DATABASE KUESIONER WAWANCARA ORANG TUA (OTM) - SPMB SMPIT PONDOK DUTA"]);
    otmSheet.appendRow(otmHeaders);
    const hRange = otmSheet.getRange(2, 1, 1, otmHeaders.length);
    hRange.setBackground("#065f46");
    hRange.setFontColor("#ffffff");
    hRange.setFontWeight("bold");
    otmSheet.setFrozenRows(2);
    updatedHeaders.push(SHEET_OTM_NAME);
  } else {
    // Selalu pastikan baris 2 OTM sinkron dengan otmHeaders
    otmSheet.getRange(2, 1, 1, otmHeaders.length).setValues([otmHeaders]);
    const hRange = otmSheet.getRange(2, 1, 1, otmHeaders.length);
    hRange.setBackground("#065f46");
    hRange.setFontColor("#ffffff");
    hRange.setFontWeight("bold");
    otmSheet.setFrozenRows(2);
  }

  // 6. Sheet Hasil_Wawancara
  ensureSheet(SHEET_DB_NAME, [
    "Timestamp", "ID Siswa", "Nama Siswa", "Nama Panggilan",
    "Kesimpulan / Catatan Khusus", "Pewawancara", "Link PDF",
    "Status Wawancara", "TTD Ortu Signed", "JSON Detail Hasil"
  ]);

  // 7. Sheet Observasi_Siswa
  ensureSheet(SHEET_SISWA_OBS, [
    "Timestamp", "ID Siswa", "Nama Siswa", "Nama Penguji",
    "Nilai Tahsin", "Catatan Tahsin",
    "Nilai Tahfidz", "Juz Diuji", "Catatan Tahfidz",
    "Nilai Karakter", "Catatan Karakter",
    "Nilai Akademik", "Catatan Akademik",
    "Total Skor", "Rata-Rata", "Rekomendasi", "Catatan Penguji", "Link PDF", "JSON Detail Observasi"
  ]);

  // 8. Sheet Wawancara_Siswa
  ensureSheet(SHEET_WAWANCARA_SISWA, [
    "Timestamp", "No Pendaftaran", "Nama Lengkap", "Asal Sekolah",
    "Motivasi Masuk", "Target Hafalan", "JSON Detail Asesmen"
  ]);

  // 9. Sheet Kelulusan (13 Kolom Resmi termasuk 3 Kolom Status Pengumuman per Baris Siswa)
  const activeKelulusanHeaders = (customHeadersMap && customHeadersMap.Kelulusan) || KELULUSAN_HEADERS;
  const lulusSheet = ensureSheet(SHEET_KELULUSAN, activeKelulusanHeaders);

  // Migrasi & pembersihan otomatis jika ada sisa baris __TRACKING_PENGUMUMAN__ lama di Sheet Wawancara_Siswa
  let legacyTrackingMap = {};
  try {
    const wsSheet = ss.getSheetByName(SHEET_WAWANCARA_SISWA);
    if (wsSheet && wsSheet.getLastRow() >= 2) {
      const wsRows = wsSheet.getDataRange().getValues();
      for (let r = wsRows.length - 1; r >= 1; r--) {
        if (String(wsRows[r][1] || "").trim() === "__TRACKING_PENGUMUMAN__") {
          const jsonStr = String(wsRows[r][6] || "");
          if (jsonStr) {
            try {
              const parsedWs = JSON.parse(jsonStr);
              if (parsedWs && parsedWs.kegiatanWaktuLuang) {
                legacyTrackingMap = JSON.parse(parsedWs.kegiatanWaktuLuang) || {};
              }
            } catch (e) {}
          }
          wsSheet.deleteRow(r + 1);
        }
      }
    }
  } catch (cleanErr) {}

  // Pastikan setiap baris siswa di Sheet Kelulusan memiliki nilai default "BELUM" pada 3 kolom status jika masih kosong
  try {
    if (lulusSheet && lulusSheet.getLastRow() >= 2) {
      const lRows = lulusSheet.getDataRange().getValues();
      for (let r = 1; r < lRows.length; r++) {
        const noPend = String(lRows[r][0] || "").trim().toUpperCase();
        if (!noPend) continue;
        const leg = legacyTrackingMap[noPend] || {};
        let colK = String(lRows[r][10] || "").trim();
        let colL = String(lRows[r][11] || "").trim();
        let colM = String(lRows[r][12] || "").trim();
        let changed = false;
        if (!colK) {
          colK = leg.sentAt ? formatStatusPengumumanCell(leg.sentAt) : "BELUM";
          changed = true;
        }
        if (!colL) {
          colL = leg.cekSeleksiAt ? formatStatusPengumumanCell(leg.cekSeleksiAt) : "BELUM";
          changed = true;
        }
        if (!colM) {
          colM = leg.unduhSkhsAt ? formatStatusPengumumanCell(leg.unduhSkhsAt) : "BELUM";
          changed = true;
        }
        if (changed) {
          lulusSheet.getRange(r + 1, 11, 1, 3).setValues([[colK, colL, colM]]);
        }
      }
    }
  } catch (lulusMigErr) {}

  // 10. Sheet Pembiayaan (Rincian Biaya Daftar Ulang Resmi - 16 Kolom)
  const activePembiayaanHeaders = (customHeadersMap && customHeadersMap.Pembiayaan) || PEMBIAYAAN_HEADERS;
  ensureSheet(SHEET_PEMBIAYAAN, activePembiayaanHeaders);

  // Migrasi otomatis baris di Sheet Siswa jika ada baris yang belum terurai lengkap 65 kolom
  try {
    const sSheet = ss.getSheetByName(SHEET_SISWA);
    if (sSheet && sSheet.getLastRow() >= 2) {
      const allRows = sSheet.getDataRange().getValues();
      for (let r = 1; r < allRows.length; r++) {
        const rowVals = allRows[r];
        if (rowVals.length < activeSiswaHeaders.length) {
          let jsonObj = null;
          for (let c = rowVals.length - 1; c >= 20; c--) {
            const cellVal = rowVals[c];
            if (typeof cellVal === "string" && cellVal.indexOf("{") !== -1 && cellVal.indexOf("noPendaftaran") !== -1) {
              try {
                jsonObj = JSON.parse(cellVal);
                break;
              } catch (e) {}
            }
          }
          if (jsonObj) {
            const expRow = buildFullSiswaRow(jsonObj);
            sSheet.getRange(r + 1, 1, 1, expRow.length).setValues([expRow]);
          }
        }
      }
    }
  } catch (migErr) {}

  return {
    success: true,
    spreadsheetId: ss.getId(),
    spreadsheetName: ss.getName(),
    spreadsheetUrl: ss.getUrl(),
    createdSheets: createdSheets,
    updatedHeaders: updatedHeaders,
    allSheets: ss.getSheets().map(function(s) { return s.getName(); }),
    message: updatedHeaders.length > 0
      ? "Header kolom Sheet (" + updatedHeaders.join(", ") + ") berhasil diperbarui dan disinkronkan sesuai kode terbaru!"
      : "Seluruh 9 Sheet Database SPMB SMPIT Pondok Duta siap digunakan."
  };
}

function getSettingsFromSheet() {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_SETTING);
  const settings = {
    driveFolderUrl: "https://drive.google.com/drive/folders/" + DEFAULT_FOLDER_ID,
    logoUrl: "",
    logoDriveUrl: "",
    heroPhotoUrl: "",
    heroDriveUrl: "",
    heroCropMode: "cutout"
  };
  if (!sheet || sheet.getLastRow() < 2) return settings;
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    const key = String(rows[i][0] || "").trim();
    const val = String(rows[i][1] || "");
    if (key === "DRIVE_FOLDER_LINK" && val) settings.driveFolderUrl = val;
    if (key === "LOGO_URL") settings.logoUrl = val;
    if (key === "LOGO_DRIVE_LINK") settings.logoDriveUrl = val;
    if (key === "HERO_PHOTO_URL") settings.heroPhotoUrl = val;
    if (key === "HERO_DRIVE_LINK") settings.heroDriveUrl = val;
    if (key === "HERO_CROP_MODE" && val) settings.heroCropMode = val;
  }
  return settings;
}

function saveSettingsToSheet(payload) {
  setupSheets();
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_SETTING);
  const settings = payload.settings || payload;
  const nowIso = new Date().toISOString();

  const currentSettings = getSettingsFromSheet();
  const targetFolderUrl = settings.driveFolderUrl || currentSettings.driveFolderUrl || ("https://drive.google.com/drive/folders/" + DEFAULT_FOLDER_ID);

  if (settings.driveFolderUrl !== undefined) {
    upsertRowByKey(sheet, 0, "DRIVE_FOLDER_LINK", [
      "DRIVE_FOLDER_LINK",
      safeCellString(settings.driveFolderUrl),
      "Link Folder Google Drive untuk menyimpan PDF hasil wawancara, Logo & Foto Badge",
      nowIso
    ], 2);
  }

  if (settings.logoUrl !== undefined) {
    let logoVal = settings.logoUrl;
    const logoUpload = uploadImageToDriveFolder(logoVal, "Logo_Sekolah", targetFolderUrl);
    if (logoUpload && logoUpload.imageUrl) {
      upsertRowByKey(sheet, 0, "LOGO_DRIVE_LINK", [
        "LOGO_DRIVE_LINK",
        logoUpload.driveViewUrl,
        "Link File Logo di dalam Folder Google Drive",
        nowIso
      ], 2);
    }
    upsertRowByKey(sheet, 0, "LOGO_URL", [
      "LOGO_URL",
      safeCellString(logoVal),
      logoUpload ? ("Terupload di Drive (" + logoUpload.driveViewUrl + ")") : "Link atau Data Gambar Logo Sekolah SMPIT Pondok Duta",
      nowIso
    ], 2);
  }

  if (settings.heroPhotoUrl !== undefined) {
    let heroVal = settings.heroPhotoUrl;
    const heroUpload = uploadImageToDriveFolder(heroVal, "Foto_Badge_Beranda", targetFolderUrl);
    if (heroUpload && heroUpload.imageUrl) {
      upsertRowByKey(sheet, 0, "HERO_DRIVE_LINK", [
        "HERO_DRIVE_LINK",
        heroUpload.driveViewUrl,
        "Link File Foto Badge Beranda di dalam Folder Google Drive",
        nowIso
      ], 2);
    } else if (settings.heroDriveUrl) {
      upsertRowByKey(sheet, 0, "HERO_DRIVE_LINK", [
        "HERO_DRIVE_LINK",
        safeCellString(settings.heroDriveUrl),
        "Link File Foto Badge Beranda Asli Google Drive",
        nowIso
      ], 2);
    } else if (heroVal && (heroVal.indexOf("drive.google.com") !== -1 || heroVal.indexOf("lh3.googleusercontent.com") !== -1)) {
      upsertRowByKey(sheet, 0, "HERO_DRIVE_LINK", [
        "HERO_DRIVE_LINK",
        safeCellString(heroVal),
        "Link File Foto Badge Beranda Asli Google Drive",
        nowIso
      ], 2);
    }

    upsertRowByKey(sheet, 0, "HERO_PHOTO_URL", [
      "HERO_PHOTO_URL",
      safeCellString(heroVal),
      heroUpload ? ("Terupload di Drive (" + heroUpload.driveViewUrl + ")") : "Link atau Data Gambar Foto Badge di Halaman Beranda",
      nowIso
    ], 2);
  }

  if (settings.heroCropMode !== undefined) {
    upsertRowByKey(sheet, 0, "HERO_CROP_MODE", [
      "HERO_CROP_MODE",
      safeCellString(settings.heroCropMode),
      "Mode tampilan foto badge di Beranda (cutout / full)",
      nowIso
    ], 2);
  }

  return {
    success: true,
    settings: getSettingsFromSheet(),
    message: "Pengaturan Super Admin berhasil disimpan ke Sheet 'Setting' & Folder Google Drive!"
  };
}

function doGet(e) {
  if (e && e.parameter && e.parameter.action) {
    const action = e.parameter.action;
    let result = { success: false, action: action };

    try {
      const isForceOrNoCache = e.parameter.nocache === "true" || e.parameter.refresh === "true" || e.parameter.force === "true";
      if (isForceOrNoCache) {
        clearAppCache();
      }

      const ss = getSpreadsheet();
      if (action === "ping") {
        result.success = true;
        result.spreadsheetId = ss.getId();
        result.spreadsheetName = ss.getName();
        result.spreadsheetUrl = ss.getUrl();
        result.sheets = ss.getSheets().map(function(s) { return s.getName(); });
        result.settings = getSettingsFromSheet();
        result.message = "Terhubung ke Google Spreadsheet: " + ss.getName();
      } else if (action === "setupSheets" || action === "syncHeaders") {
        clearAppCache();
        result = setupSheets();
      } else if (action === "clearCache") {
        clearAppCache();
        result.success = true;
        result.message = "Cache Google Apps Script berhasil dibersihkan!";
      } else if (action === "getSettings") {
        const cached = isForceOrNoCache ? null : getAppCache("SETTINGS");
        if (cached) {
          return jsonResponse({ success: true, settings: cached, fromCache: true });
        }
        result.settings = getSettingsFromSheet();
        if (!isForceOrNoCache) setAppCache("SETTINGS", result.settings);
        result.success = true;
      } else if (action === "getStudentList" || action === "getSiswaList") {
        const cached = isForceOrNoCache ? null : getAppCache("STUDENT_LIST");
        if (cached) {
          return jsonResponse({ success: true, data: cached, fromCache: true });
        }
        result.data = getStudentList();
        if (!isForceOrNoCache) setAppCache("STUDENT_LIST", result.data);
        result.success = true;
      } else if (action === "getAllData") {
        const cached = isForceOrNoCache ? null : getAppCache("ALL_DATA");
        if (cached) {
          return jsonResponse({ success: true, data: cached, fromCache: true });
        }
        result.data = getAllDatabaseData();
        if (!isForceOrNoCache) setAppCache("ALL_DATA", result.data);
        result.success = true;
      } else if (action === "getDataInduk") {
        const cached = getAppCache("DATA_INDUK");
        if (cached) {
          return jsonResponse({ success: true, data: cached, fromCache: true });
        }
        result.data = getDataIndukFromSheet();
        setAppCache("DATA_INDUK", result.data);
        result.success = true;
      } else if (action === "getPembiayaanList" || action === "getPembiayaan") {
        const cached = getAppCache("PEMBIAYAAN_LIST");
        if (cached) {
          return jsonResponse({ success: true, data: cached, fromCache: true });
        }
        result.data = getPembiayaanFromSheet();
        setAppCache("PEMBIAYAAN_LIST", result.data);
        result.success = true;
      }
    } catch (err) {
      result.error = err.toString();
      result.message = "Error GAS: " + err.toString();
    }

    return jsonResponse(result);
  }

  return jsonResponse({
    success: true,
    message: "Web App API SPMB SMPIT Pondok Duta Aktif (High Performance Engine)",
    spreadsheetId: SPREADSHEET_ID
  });
}

function doPost(e) {
  let result = { success: false };
  try {
    let postData = {};
    if (e && e.postData && e.postData.contents) {
      postData = JSON.parse(e.postData.contents);
    } else if (e && e.parameter) {
      postData = e.parameter;
    }

    const action = postData.action;

    // Bersihkan cache jika ada operasi simpan/tulis agar request baca berikutnya selalu fresh
    clearAppCache();

    if (action === "setupSheets" || action === "syncHeaders") {
      result = setupSheets(postData.headers);
    } else if (action === "saveSettings") {
      result = saveSettingsToSheet(postData);
    } else if (action === "uploadAssetToDrive") {
      const currentSettings = getSettingsFromSheet();
      const folderUrl = postData.driveFolderUrl || currentSettings.driveFolderUrl;
      const uploaded = uploadImageToDriveFolder(postData.base64Data, postData.filePrefix || "Asset_SPMB", folderUrl);
      if (uploaded) {
        result = {
          success: true,
          fileId: uploaded.fileId,
          imageUrl: uploaded.imageUrl,
          driveViewUrl: uploaded.driveViewUrl,
          message: "File gambar berhasil diunggah ke Folder Google Drive!"
        };
      } else {
        result = {
          success: false,
          message: "Gagal mengunggah ke Google Drive, menggunakan penyimpanan Sheet Setting."
        };
      }
    } else if (action === "processForm" || action === "saveWawancaraOrtu") {
      const proc = processForm(postData);
      result = { success: true, message: proc.message, pdfUrl: proc.pdfUrl };
    } else if (action === "saveDraftWawancaraOrtu" || action === "saveTtdOrtuFromHp") {
      result = saveDraftOrTtdOrtu(postData);
    } else if (action === "saveObservasiSiswa") {
      result = processObservasiSiswa(postData);
    } else if (action === "registerUser") {
      result = saveUserAndStudentToSheet(postData);
    } else if (action === "saveDataSiswa") {
      result = upsertSiswaToSheet(postData.siswa || postData);
    } else if (action === "saveFormIsianOrtu") {
      result = upsertOtmAnswersToSheet(postData);
    } else if (action === "saveWawancaraSiswa") {
      result = upsertWawancaraSiswaToSheet(postData.data || postData);
    } else if (action === "updateStatusPengumuman" || action === "saveWaSentLog" || action === "saveStatusPengumuman") {
      result = updateStatusPengumumanInSheet(postData);
    } else if (action === "saveDataInduk" || action === "saveBatchDataInduk" || action === "syncDataInduk") {
      result = saveBatchDataIndukToSheet(postData);
    } else if (action === "updateNis") {
      result = updateStudentNisInSheet(postData.noPendaftaran, postData.nis);
    } else if (action === "savePembiayaanList") {
      result = savePembiayaanListToSheet(postData);
    } else if (action === "syncAllToSheet") {
      result = syncAllLocalToSheet(postData);
    } else {
      result = { success: false, message: "Action tidak dikenali: " + action };
    }
  } catch (err) {
    result = { success: false, error: err.toString(), message: err.toString() };
  }

  return jsonResponse(result);
}

function upsertRowByKey(sheet, keyColIndex, keyValue, rowValues, startRow) {
  const minRow = startRow || 2;
  const lastRow = sheet.getLastRow();
  const safeValues = rowValues.map(function(v) {
    return typeof v === "string" ? safeCellString(v) : (v === undefined || v === null ? "" : v);
  });
  if (lastRow >= minRow) {
    const data = sheet.getRange(minRow, 1, lastRow - minRow + 1, sheet.getLastColumn()).getValues();
    for (let i = 0; i < data.length; i++) {
      if (String(data[i][keyColIndex]).trim().toUpperCase() === String(keyValue).trim().toUpperCase()) {
        const targetRow = minRow + i;
        sheet.getRange(targetRow, 1, 1, safeValues.length).setValues([safeValues]);
        return { updated: true, row: targetRow };
      }
    }
  }
  sheet.appendRow(safeValues);
  return { updated: false, row: sheet.getLastRow() };
}

function normalizePhone62(val) {
  if (val === undefined || val === null) return "";
  var raw = String(val).trim();
  if (!raw || raw === "-" || raw === "0") return "";
  var clean = raw.replace(/[^0-9]/g, "");
  if (!clean || clean.length < 7) return raw;
  if (clean.indexOf("00") === 0) {
    clean = clean.substring(2);
  }
  if (clean.indexOf("620") === 0) {
    clean = "62" + clean.substring(3);
  } else if (clean.indexOf("0") === 0) {
    clean = "62" + clean.substring(1);
  } else if (clean.indexOf("8") === 0 && clean.length >= 8 && clean.length <= 11) {
    clean = "62" + clean;
  }
  return clean;
}

function saveUserAndStudentToSheet(payload) {
  setupSheets();
  const ss = getSpreadsheet();
  const user = payload.user;
  const siswa = payload.siswa;

  if (user) {
    const userSheet = ss.getSheetByName(SHEET_USERS);
    upsertRowByKey(userSheet, 1, user.kodePendaftaran, [
      user.id || "",
      user.kodePendaftaran || "",
      user.namaSiswa || "",
      user.namaOrangTua || "",
      user.sekolahAsal || "",
      normalizePhone62(user.nomorHp || ""),
      user.emailOrangTua || "",
      user.role || "siswa",
      user.jabatan || "",
      user.createdAt || new Date().toISOString()
    ], 2);
  }

  if (siswa) {
    upsertSiswaToSheet(siswa);
  }

  return {
    success: true,
    message: "Akun & data awal siswa berhasil disimpan ke Spreadsheet."
  };
}

function buildFullSiswaRow(siswa) {
  if (!siswa) return [];
  return [
    siswa.noPendaftaran || "",
    siswa.namaLengkap || "",
    siswa.namaPanggilan || "",
    siswa.nisn || "",
    siswa.jenisKelamin || "",
    siswa.tempatLahir || "",
    siswa.tanggalLahir || "",
    siswa.agama || "Islam",
    siswa.asalSekolah || "",
    siswa.alamat || "",
    siswa.kelurahan || "",
    siswa.kecamatan || "",
    siswa.kotaKabupaten || "",
    siswa.nomorHandphone || "",
    siswa.namaAyah || "",
    siswa.pekerjaanAyah || "",
    siswa.penghasilanAyah || "",
    siswa.noHpAyah || "",
    siswa.namaIbu || "",
    siswa.pekerjaanIbu || "",
    siswa.penghasilanIbu || "",
    siswa.noHpIbu || "",
    siswa.nik || "",
    siswa.kewarganegaraan || "Indonesia",
    siswa.anakNomorKe !== undefined ? siswa.anakNomorKe : (siswa.anakKe || ""),
    siswa.jumlahSaudaraKandung !== undefined ? siswa.jumlahSaudaraKandung : (siswa.jumlahSaudara || ""),
    siswa.jumlahSaudaraTiri || "0",
    siswa.jumlahSaudaraAngkat || "0",
    siswa.bahasaSehariHari || "Bahasa Indonesia",
    siswa.beratBadanKg || "",
    siswa.tinggiBadanCm || "",
    siswa.golonganDarah || "-",
    siswa.penyakitBerat || (siswa.riwayatPenyakit || "-"),
    siswa.kelainanJasmani || "-",
    siswa.bertempatTinggalPada || "Orang Tua",
    siswa.jarakKeSekolahKm || "",
    siswa.saranaBerangkatSekolah || "",
    siswa.masukSebagai || "Siswa Baru",
    siswa.nomorIjazah || "-",
    siswa.kegemaranKesenian || "-",
    siswa.kegemaranOlahraga || "-",
    siswa.kegemaranOrganisasi || "-",
    siswa.menerimaBeasiswa || "-",
    siswa.memenangkanKejuaraan || (siswa.prestasi || "-"),
    siswa.tempatTanggalLahirAyah || "",
    siswa.agamaAyah || "Islam",
    siswa.pendidikanAyah || "",
    siswa.alamatAyah || "",
    siswa.emailAyah || "",
    siswa.tempatTanggalLahirIbu || "",
    siswa.agamaIbu || "Islam",
    siswa.pendidikanIbu || "",
    siswa.alamatIbu || "",
    siswa.emailIbu || "",
    siswa.namaWali || "-",
    siswa.tempatTanggalLahirWali || "-",
    siswa.agamaWali || "-",
    siswa.pendidikanWali || "-",
    siswa.pekerjaanWali || "-",
    siswa.penghasilanWali || "-",
    siswa.alamatWali || "-",
    siswa.noHpWali || "-",
    siswa.statusHubunganWali || "-",
    JSON.stringify(siswa),
    new Date().toISOString()
  ];
}

function mapRowToSiswaObject(row) {
  if (!row || !row[0]) return null;
  let baseObj = {};
  // Cari apakah ada cell JSON di baris ini sebagai fallback atribut tambahan
  for (let c = row.length - 1; c >= 20; c--) {
    const val = row[c];
    if (typeof val === "string" && val.indexOf("{") !== -1 && val.indexOf("noPendaftaran") !== -1) {
      try {
        const parsed = JSON.parse(val);
        if (parsed && typeof parsed === "object") {
          baseObj = parsed;
          break;
        }
      } catch (e) {}
    }
  }

  // Kolom eksplisit di Spreadsheet (row[0] s/d row[21]) SELALU menjadi sumber kebenaran utama (mengalahkan JSON lama jika diedit manual di Sheet)
  return Object.assign({}, baseObj, {
    noPendaftaran: String(row[0] || baseObj.noPendaftaran || "").trim(),
    namaLengkap: String(row[1] || baseObj.namaLengkap || "").trim(),
    namaPanggilan: String(row[2] || baseObj.namaPanggilan || "").trim(),
    nisn: String(row[3] !== undefined && row[3] !== "" ? row[3] : (baseObj.nisn || "")).trim(),
    jenisKelamin: String(row[4] || baseObj.jenisKelamin || "Laki-laki"),
    tempatLahir: String(row[5] || baseObj.tempatLahir || ""),
    tanggalLahir: String(row[6] || baseObj.tanggalLahir || ""),
    agama: String(row[7] || baseObj.agama || "Islam"),
    asalSekolah: String(row[8] || baseObj.asalSekolah || "").trim(),
    alamat: String(row[9] || baseObj.alamat || ""),
    kelurahan: String(row[10] || baseObj.kelurahan || ""),
    kecamatan: String(row[11] || baseObj.kecamatan || ""),
    kotaKabupaten: String(row[12] || baseObj.kotaKabupaten || ""),
    nomorHandphone: String(row[13] || baseObj.nomorHandphone || ""),
    namaAyah: String(row[14] || baseObj.namaAyah || ""),
    pekerjaanAyah: String(row[15] || baseObj.pekerjaanAyah || ""),
    penghasilanAyah: String(row[16] || baseObj.penghasilanAyah || ""),
    noHpAyah: String(row[17] || baseObj.noHpAyah || ""),
    namaIbu: String(row[18] || baseObj.namaIbu || ""),
    pekerjaanIbu: String(row[19] || baseObj.pekerjaanIbu || ""),
    penghasilanIbu: String(row[20] || baseObj.penghasilanIbu || ""),
    noHpIbu: String(row[21] || baseObj.noHpIbu || ""),
    nik: String(row[22] || ""),
    kewarganegaraan: String(row[23] || "Indonesia"),
    anakNomorKe: row[24] !== undefined && row[24] !== "" ? row[24] : 1,
    jumlahSaudaraKandung: row[25] !== undefined && row[25] !== "" ? row[25] : 0,
    jumlahSaudaraTiri: row[26] !== undefined && row[26] !== "" ? row[26] : 0,
    jumlahSaudaraAngkat: row[27] !== undefined && row[27] !== "" ? row[27] : 0,
    bahasaSehariHari: String(row[28] || "Bahasa Indonesia"),
    beratBadanKg: row[29] !== undefined && row[29] !== "" ? row[29] : "",
    tinggiBadanCm: row[30] !== undefined && row[30] !== "" ? row[30] : "",
    golonganDarah: String(row[31] || "-"),
    penyakitBerat: String(row[32] || "-"),
    kelainanJasmani: String(row[33] || "-"),
    bertempatTinggalPada: String(row[34] || "Orang Tua"),
    jarakKeSekolahKm: row[35] !== undefined && row[35] !== "" ? row[35] : 1,
    saranaBerangkatSekolah: String(row[36] || "Motor"),
    masukSebagai: String(row[37] || "Siswa Baru"),
    nomorIjazah: String(row[38] || "-"),
    kegemaranKesenian: String(row[39] || "-"),
    kegemaranOlahraga: String(row[40] || "-"),
    kegemaranOrganisasi: String(row[41] || "-"),
    menerimaBeasiswa: String(row[42] || "-"),
    memenangkanKejuaraan: String(row[43] || "-"),
    tempatTanggalLahirAyah: String(row[44] || ""),
    agamaAyah: String(row[45] || "Islam"),
    pendidikanAyah: String(row[46] || ""),
    alamatAyah: String(row[47] || ""),
    emailAyah: String(row[48] || ""),
    tempatTanggalLahirIbu: String(row[49] || ""),
    agamaIbu: String(row[50] || "Islam"),
    pendidikanIbu: String(row[51] || ""),
    alamatIbu: String(row[52] || ""),
    emailIbu: String(row[53] || ""),
    namaWali: String(row[54] || "-"),
    tempatTanggalLahirWali: String(row[55] || "-"),
    agamaWali: String(row[56] || "-"),
    pendidikanWali: String(row[57] || "-"),
    pekerjaanWali: String(row[58] || "-"),
    penghasilanWali: String(row[59] || "-"),
    alamatWali: String(row[60] || "-"),
    noHpWali: String(row[61] || "-"),
    statusHubunganWali: String(row[62] || "-")
  });
}

/**
 * Menyimpan data siswa ke Sheet "Siswa" dengan memetakan seluruh rincian biodata ke kolom masing-masing
 * sehingga tabel di database terisi lengkap tanpa harus mengurai JSON.
 */
function upsertSiswaToSheet(siswa) {
  setupSheets();
  const ss = getSpreadsheet();
  const siswaSheet = ss.getSheetByName(SHEET_SISWA);

  const fullRow = buildFullSiswaRow(siswa);
  upsertRowByKey(siswaSheet, 0, siswa.noPendaftaran, fullRow, 2);

  const otmSheet = ss.getSheetByName(SHEET_OTM_NAME);
  const lastRow = otmSheet.getLastRow();
  let existsInOtm = false;
  if (lastRow >= 3) {
    const ids = otmSheet.getRange(3, 1, lastRow - 2, 1).getValues();
    for (let i = 0; i < ids.length; i++) {
      if (String(ids[i][0]).trim().toUpperCase() === String(siswa.noPendaftaran).trim().toUpperCase()) {
        existsInOtm = true;
        otmSheet.getRange(3 + i, 2, 1, 8).setValues([[
          siswa.namaLengkap || "",
          siswa.namaPanggilan || "",
          siswa.jenisKelamin || "",
          siswa.asalSekolah || "",
          siswa.nisn || "",
          siswa.namaAyah || "",
          siswa.namaIbu || "",
          siswa.nomorHandphone || ""
        ]]);
        break;
      }
    }
  }
  if (!existsInOtm) {
    const newOtmRow = [
      siswa.noPendaftaran || "",
      siswa.namaLengkap || "",
      siswa.namaPanggilan || "",
      siswa.jenisKelamin || "",
      siswa.asalSekolah || "",
      siswa.nisn || "",
      siswa.namaAyah || "",
      siswa.namaIbu || "",
      siswa.nomorHandphone || "",
      new Date().toISOString()
    ];
    for (let k = 10; k <= 44; k++) newOtmRow.push("");
    otmSheet.appendRow(newOtmRow);
  }

  return { success: true, message: "Biodata lengkap siswa berhasil disimpan di database (seluruh kolom terisi tanpa JSON)." };
}

/**
 * Konversi objek DataIndukSiswa menjadi baris data murni (Array tanpa JSON)
 * untuk disimpan ke Sheet "Data Induk Sekolah".
 */
function buildDataIndukRow(item, index) {
  return [
    item.noUrut || (index !== undefined ? index + 1 : 1),
    item.nis || "-",
    item.nisn || "-",
    item.nik || "-",
    item.noPendaftaran || "-",
    item.namaLengkap || "-",
    item.namaPanggilan || "-",
    item.jenisKelamin || "-",
    item.tempatLahir || "-",
    item.tanggalLahir || "-",
    item.agama || "Islam",
    item.kewarganegaraan || "Indonesia",
    item.anakNomorKe !== undefined ? item.anakNomorKe : "-",
    item.jumlahSaudaraKandung !== undefined ? item.jumlahSaudaraKandung : "-",
    item.jumlahSaudaraTiri !== undefined ? item.jumlahSaudaraTiri : "0",
    item.jumlahSaudaraAngkat !== undefined ? item.jumlahSaudaraAngkat : "0",
    item.bahasaSehariHari || "Bahasa Indonesia",
    item.beratBadanKg || "-",
    item.tinggiBadanCm || "-",
    item.golonganDarah || "-",
    item.penyakitBerat || "-",
    item.kelainanJasmani || "-",
    item.alamat || "-",
    item.kelurahan || "-",
    item.kecamatan || "-",
    item.kotaKabupaten || "-",
    item.nomorHandphone || item.nomorTelepon || "-",
    item.bertempatTinggalPada || "Orang Tua",
    item.jarakKeSekolahKm || "-",
    item.saranaBerangkatSekolah || "-",
    item.masukSebagai || "Siswa Baru",
    item.asalSekolah || "-",
    item.nomorIjazah || "-",
    item.kegemaranKesenian || "-",
    item.kegemaranOlahraga || "-",
    item.kegemaranOrganisasi || "-",
    item.menerimaBeasiswa || "-",
    item.memenangkanKejuaraan || "-",
    item.namaAyah || "-",
    item.tempatTanggalLahirAyah || "-",
    item.agamaAyah || "Islam",
    item.pendidikanAyah || "-",
    item.pekerjaanAyah || "-",
    item.penghasilanAyah || "-",
    item.alamatAyah || "-",
    item.noHpAyah || "-",
    item.emailAyah || "-",
    item.statusPerkawinanAyah || "-",
    item.namaIbu || "-",
    item.tempatTanggalLahirIbu || "-",
    item.agamaIbu || "Islam",
    item.pendidikanIbu || "-",
    item.pekerjaanIbu || "-",
    item.penghasilanIbu || "-",
    item.alamatIbu || "-",
    item.noHpIbu || "-",
    item.emailIbu || "-",
    item.statusPerkawinanIbu || "-",
    item.namaWali || "-",
    item.tempatTanggalLahirWali || "-",
    item.agamaWali || "-",
    item.pendidikanWali || "-",
    item.pekerjaanWali || "-",
    item.penghasilanWali || "-",
    item.alamatWali || "-",
    item.noHpWali || "-",
    item.statusHubunganWali || "-",
    item.statusKelulusan || "LULUS",
    item.tahunPelajaran || "2027/2028",
    item.tanggalDiterima || Utilities.formatDate(new Date(), "Asia/Jakarta", "dd-MM-yyyy"),
    item.catatanKhusus || "-",
    item.updatedAt || new Date().toISOString()
  ];
}

/**
 * Menyimpan kumpulan data siswa lulus ke Sheet "Data Induk Sekolah" (Kolom lengkap tanpa JSON).
 */
function saveBatchDataIndukToSheet(payload) {
  setupSheets();
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_DATA_INDUK);
  const items = Array.isArray(payload.dataIndukList) ? payload.dataIndukList : (payload.data ? [payload.data] : []);

  let updatedCount = 0;
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const key = item.noPendaftaran;
    if (!key) continue;
    const rowValues = buildDataIndukRow(item, i);
    // Kolom kunci adalah Index 4 (No Pendaftaran)
    upsertRowByKey(sheet, 4, key, rowValues, 2);
    updatedCount++;
  }

  return {
    success: true,
    count: updatedCount,
    message: "Berhasil menyimpan " + updatedCount + " data siswa ke Sheet 'Data Induk Sekolah' tanpa JSON!"
  };
}

/**
 * Memperbarui Nomor Induk Siswa (NIS / NISS) langsung di Sheet "Data Induk Sekolah".
 */
function updateStudentNisInSheet(noPendaftaran, nis) {
  setupSheets();
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_DATA_INDUK);
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    return { success: false, message: "Sheet Data Induk Sekolah masih kosong." };
  }

  const data = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).getValues();
  for (let i = 0; i < data.length; i++) {
    // Index 4 adalah No Pendaftaran
    if (String(data[i][4]).trim().toUpperCase() === String(noPendaftaran).trim().toUpperCase()) {
      const targetRow = 2 + i;
      sheet.getRange(targetRow, 2).setValue(String(nis).trim()); // Kolom 2: NIS / NISS
      sheet.getRange(targetRow, sheet.getLastColumn()).setValue(new Date().toISOString()); // Kolom Terakhir: Updated At
      return {
        success: true,
        message: "NIS " + nis + " untuk siswa " + data[i][5] + " (" + noPendaftaran + ") berhasil disimpan di Sheet 'Data Induk Sekolah'!"
      };
    }
  }

  return {
    success: false,
    message: "Siswa dengan Nomor Pendaftaran " + noPendaftaran + " belum ada di Sheet Data Induk Sekolah."
  };
}

/**
 * Membaca seluruh data dari Sheet "Data Induk Sekolah" untuk ditampilkan di aplikasi.
 */
function getDataIndukFromSheet() {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_DATA_INDUK);
  const result = [];
  if (!sheet || sheet.getLastRow() < 2) return result;

  const rows = sheet.getDataRange().getValues();
  const seenInduk = {};
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    const noPend = String(r[4] || "").trim();
    if (noPend) {
      const key = noPend.toUpperCase();
      if (seenInduk[key]) continue;
      seenInduk[key] = true;
      result.push({
        id: "INDUK-" + noPend,
        noUrut: Number(r[0]) || (result.length + 1),
        nis: String(r[1] || ""),
        nisn: String(r[2] || ""),
        nik: String(r[3] || ""),
        noPendaftaran: noPend,
        namaLengkap: String(r[5] || ""),
        namaPanggilan: String(r[6] || ""),
        jenisKelamin: String(r[7] || "Laki-laki"),
        tempatLahir: String(r[8] || ""),
        tanggalLahir: String(r[9] || ""),
        agama: String(r[10] || "Islam"),
        kewarganegaraan: String(r[11] || "Indonesia"),
        anakNomorKe: r[12] || 1,
        jumlahSaudaraKandung: r[13] || 0,
        jumlahSaudaraTiri: r[14] || 0,
        jumlahSaudaraAngkat: r[15] || 0,
        bahasaSehariHari: String(r[16] || "Bahasa Indonesia"),
        beratBadanKg: r[17] || "",
        tinggiBadanCm: r[18] || "",
        golonganDarah: String(r[19] || "-"),
        penyakitBerat: String(r[20] || "-"),
        kelainanJasmani: String(r[21] || "-"),
        alamat: String(r[22] || ""),
        kelurahan: String(r[23] || ""),
        kecamatan: String(r[24] || ""),
        kotaKabupaten: String(r[25] || ""),
        nomorTelepon: String(r[26] || ""),
        nomorHandphone: String(r[26] || ""),
        bertempatTinggalPada: String(r[27] || "Orang Tua"),
        jarakKeSekolahKm: r[28] || "",
        saranaBerangkatSekolah: String(r[29] || ""),
        masukSebagai: String(r[30] || "Siswa Baru"),
        asalSekolah: String(r[31] || ""),
        nomorIjazah: String(r[32] || "-"),
        kegemaranKesenian: String(r[33] || "-"),
        kegemaranOlahraga: String(r[34] || "-"),
        kegemaranOrganisasi: String(r[35] || "-"),
        menerimaBeasiswa: String(r[36] || "-"),
        memenangkanKejuaraan: String(r[37] || "-"),
        namaAyah: String(r[38] || ""),
        tempatTanggalLahirAyah: String(r[39] || ""),
        agamaAyah: String(r[40] || "Islam"),
        pendidikanAyah: String(r[41] || ""),
        pekerjaanAyah: String(r[42] || ""),
        penghasilanAyah: String(r[43] || ""),
        alamatAyah: String(r[44] || ""),
        noHpAyah: String(r[45] || ""),
        emailAyah: String(r[46] || ""),
        statusPerkawinanAyah: String(r[47] || "-"),
        namaIbu: String(r[48] || ""),
        tempatTanggalLahirIbu: String(r[49] || ""),
        agamaIbu: String(r[50] || "Islam"),
        pendidikanIbu: String(r[51] || ""),
        pekerjaanIbu: String(r[52] || ""),
        penghasilanIbu: String(r[53] || ""),
        alamatIbu: String(r[54] || ""),
        noHpIbu: String(r[55] || ""),
        emailIbu: String(r[56] || ""),
        statusPerkawinanIbu: String(r[57] || "-"),
        namaWali: String(r[58] || "-"),
        tempatTanggalLahirWali: String(r[59] || "-"),
        agamaWali: String(r[60] || "-"),
        pendidikanWali: String(r[61] || "-"),
        pekerjaanWali: String(r[62] || "-"),
        penghasilanWali: String(r[63] || "-"),
        alamatWali: String(r[64] || "-"),
        noHpWali: String(r[65] || "-"),
        statusHubunganWali: String(r[66] || "-"),
        statusKelulusan: String(r[67] || "LULUS"),
        tahunPelajaran: String(r[68] || "2027/2028"),
        tanggalDiterima: String(r[69] || ""),
        catatanKhusus: String(r[70] || "-"),
        updatedAt: String(r[71] || "")
      });
    }
  }
  return result;
}

function upsertOtmAnswersToSheet(payload) {
  setupSheets();
  const ss = getSpreadsheet();
  const otmSheet = ss.getSheetByName(SHEET_OTM_NAME);
  const noPendaftaran = payload.noPendaftaran;
  const rawMap = payload.otmMap || {};
  const siswa = payload.siswa || {};

  const rowValues = [
    noPendaftaran,
    siswa.namaLengkap || payload.namaSiswa || "",
    siswa.namaPanggilan || "",
    siswa.jenisKelamin || "",
    siswa.asalSekolah || "",
    siswa.nisn || "",
    siswa.namaAyah || "",
    siswa.namaIbu || "",
    siswa.nomorHandphone || "",
    new Date().toISOString()
  ];

  for (let idx = 10; idx <= 44; idx++) {
    rowValues.push(rawMap[idx] !== undefined ? String(rawMap[idx]) : "");
  }

  upsertRowByKey(otmSheet, 0, noPendaftaran, rowValues, 3);
  return { success: true, message: "Jawaban kuesioner OTM berhasil disimpan ke Sheet OTM." };
}

function upsertWawancaraSiswaToSheet(data) {
  setupSheets();
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_WAWANCARA_SISWA);

  if (String(data.noPendaftaran || "").trim() === "__TRACKING_PENGUMUMAN__") {
    // Alihkan ke penyimpanan per-baris di Sheet Kelulusan (bukan 1 sel JSON di Wawancara_Siswa)
    let parsedLogs = {};
    try {
      parsedLogs = typeof data.kegiatanWaktuLuang === "string" ? JSON.parse(data.kegiatanWaktuLuang) : (data.logs || {});
    } catch (e) {}
    return updateStatusPengumumanInSheet({ logs: parsedLogs });
  }

  upsertRowByKey(sheet, 1, data.noPendaftaran, [
    new Date().toISOString(),
    data.noPendaftaran || "",
    data.namaLengkap || "",
    data.asalSekolah || "",
    data.motivasiMasuk || "",
    data.targetHafalan || "",
    JSON.stringify(data)
  ], 2);

  return { success: true, message: "Data wawancara siswa berhasil disimpan ke Spreadsheet." };
}

function formatStatusPengumumanCell(val) {
  if (val === undefined || val === null || val === "" || val === false) return "BELUM";
  var str = String(val).trim();
  if (!str || str.toUpperCase() === "BELUM" || str === "-" || str.toUpperCase() === "TIDAK" || str.toUpperCase() === "FALSE") {
    return "BELUM";
  }
  if (str.toUpperCase().indexOf("SUDAH") === 0) {
    return str;
  }
  try {
    var d = new Date(str);
    if (!isNaN(d.getTime())) {
      return "SUDAH (" + Utilities.formatDate(d, "Asia/Jakarta", "dd/MM/yyyy HH:mm") + " WIB)";
    }
  } catch (e) {}
  return "SUDAH (" + str + ")";
}

/**
 * Menyimpan 3 Kolom Status Pengumuman (Status Kirim Pesan, Status Cek Seleksi, Status Unduh SKHS)
 * secara per-baris mengikuti data masing-masing siswa di Sheet "Kelulusan".
 */
function updateStatusPengumumanInSheet(payload) {
  setupSheets();
  const ss = getSpreadsheet();
  const lulusSheet = ss.getSheetByName(SHEET_KELULUSAN);
  if (!lulusSheet || lulusSheet.getLastRow() < 2) {
    return { success: false, message: "Sheet Kelulusan masih kosong." };
  }

  const lastRow = lulusSheet.getLastRow();
  const data = lulusSheet.getRange(2, 1, lastRow - 1, Math.max(lulusSheet.getLastColumn(), 13)).getValues();
  const nowIso = new Date().toISOString();
  let updatedCount = 0;

  // 1. Jika pembaruan untuk 1 siswa spesifik (noPendaftaran)
  if (payload.noPendaftaran) {
    const targetNo = String(payload.noPendaftaran).trim().toUpperCase();
    for (let i = 0; i < data.length; i++) {
      if (String(data[i][0] || "").trim().toUpperCase() === targetNo) {
        const targetRow = 2 + i;
        const curKirim = String(data[i][10] || "BELUM").trim() || "BELUM";
        const curCek = String(data[i][11] || "BELUM").trim() || "BELUM";
        const curUnduh = String(data[i][12] || "BELUM").trim() || "BELUM";

        const nextKirim = payload.statusKirimPesan !== undefined
          ? formatStatusPengumumanCell(payload.statusKirimPesan)
          : curKirim;
        const nextCek = payload.statusCekSeleksi !== undefined
          ? formatStatusPengumumanCell(payload.statusCekSeleksi)
          : curCek;
        const nextUnduh = payload.statusUnduhSkhs !== undefined
          ? formatStatusPengumumanCell(payload.statusUnduhSkhs)
          : curUnduh;

        lulusSheet.getRange(targetRow, 10, 1, 4).setValues([[nowIso, nextKirim, nextCek, nextUnduh]]);
        updatedCount++;
        return {
          success: true,
          updated: true,
          noPendaftaran: targetNo,
          statusKirimPesan: nextKirim,
          statusCekSeleksi: nextCek,
          statusUnduhSkhs: nextUnduh,
          message: "Status pengumuman untuk " + targetNo + " berhasil disimpan di Sheet Kelulusan."
        };
      }
    }
    return {
      success: false,
      message: "Siswa dengan No Pendaftaran " + payload.noPendaftaran + " belum terdaftar di Sheet Kelulusan."
    };
  }

  // 2. Jika pembaruan berupa kumpulan logs (map per noPendaftaran)
  if (payload.logs && typeof payload.logs === "object") {
    const logsMap = payload.logs;
    for (let i = 0; i < data.length; i++) {
      const rowNo = String(data[i][0] || "").trim().toUpperCase();
      if (!rowNo) continue;
      const logEntry = logsMap[rowNo];
      if (logEntry) {
        const targetRow = 2 + i;
        const nextKirim = logEntry.sentAt ? formatStatusPengumumanCell(logEntry.sentAt) : "BELUM";
        const nextCek = logEntry.cekSeleksiAt ? formatStatusPengumumanCell(logEntry.cekSeleksiAt) : "BELUM";
        const nextUnduh = logEntry.unduhSkhsAt ? formatStatusPengumumanCell(logEntry.unduhSkhsAt) : "BELUM";
        lulusSheet.getRange(targetRow, 10, 1, 4).setValues([[nowIso, nextKirim, nextCek, nextUnduh]]);
        updatedCount++;
      }
    }
    return {
      success: true,
      count: updatedCount,
      message: "Berhasil memperbarui 3 kolom status pengumuman untuk " + updatedCount + " baris siswa di Sheet Kelulusan."
    };
  }

  return { success: false, message: "Parameter updateStatusPengumuman tidak lengkap." };
}

function saveDraftOrTtdOrtu(payload) {
  setupSheets();
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_DB_NAME);
  const record = payload.record || payload;
  const idSiswa = record.idSiswa || record.noPendaftaran || payload.noPendaftaran;

  const catatanKhususText = record.catatanKhusus || "-";
  const statusStr = record.isTtdOrtuSigned ? "ttd_ortu_tersimpan" : "draft_menunggu_ttd_ortu";

  upsertRowByKey(sheet, 1, idSiswa, [
    new Date().toISOString(),
    idSiswa,
    record.namaSiswa || "",
    record.namaPanggilan || "",
    catatanKhususText,
    record.namaPewawancara || "",
    record.pdfUrl || "",
    statusStr,
    record.isTtdOrtuSigned ? "YA" : "BELUM",
    JSON.stringify(record)
  ], 2);

  return {
    success: true,
    message: record.isTtdOrtuSigned
      ? "Tanda tangan Orang Tua berhasil disimpan di Google Spreadsheet!"
      : "Draft wawancara berhasil dikirim ke Portal Siswa (Google Spreadsheet)!"
  };
}

function syncAllLocalToSheet(payload) {
  setupSheets(payload && payload.headers);
  const ss = getSpreadsheet();

  if (payload.settings) {
    saveSettingsToSheet({ settings: payload.settings });
  }

  if (Array.isArray(payload.users)) {
    const userSheet = ss.getSheetByName(SHEET_USERS);
    payload.users.forEach(function(u) {
      upsertRowByKey(userSheet, 1, u.kodePendaftaran, [
        u.id || "",
        u.kodePendaftaran || "",
        u.namaSiswa || "",
        u.namaOrangTua || "",
        u.sekolahAsal || "",
        u.nomorHp || "",
        u.emailOrangTua || "",
        u.role || "siswa",
        u.jabatan || "",
        u.createdAt || new Date().toISOString()
      ], 2);
    });
  }

  if (Array.isArray(payload.siswaList)) {
    payload.siswaList.forEach(function(s) {
      upsertSiswaToSheet(s);
    });
  }

  if (Array.isArray(payload.dataIndukList)) {
    saveBatchDataIndukToSheet({ dataIndukList: payload.dataIndukList });
  }

  if (payload.otmMap && typeof payload.otmMap === "object") {
    const siswaById = {};
    if (Array.isArray(payload.siswaList)) {
      payload.siswaList.forEach(function(s) { siswaById[s.noPendaftaran] = s; });
    }
    Object.keys(payload.otmMap).forEach(function(noPend) {
      upsertOtmAnswersToSheet({
        noPendaftaran: noPend,
        otmMap: payload.otmMap[noPend],
        siswa: siswaById[noPend] || {}
      });
    });
  }

  if (payload.hasilOrtuMap && typeof payload.hasilOrtuMap === "object") {
    const hwSheet = ss.getSheetByName(SHEET_DB_NAME);
    Object.keys(payload.hasilOrtuMap).forEach(function(noPend) {
      const rec = payload.hasilOrtuMap[noPend];
      if (rec) {
        upsertRowByKey(hwSheet, 1, noPend, [
          rec.createdAt || new Date().toISOString(),
          noPend,
          rec.namaSiswa || "",
          rec.namaPanggilan || "",
          rec.catatanKhusus || "-",
          rec.namaPewawancara || "",
          rec.pdfUrl || "",
          rec.status || "selesai",
          rec.isTtdOrtuSigned ? "YA" : "BELUM",
          JSON.stringify(rec)
        ], 2);
      }
    });
  }

  if (Array.isArray(payload.observasiList)) {
    const obsSheet = ss.getSheetByName(SHEET_SISWA_OBS);
    payload.observasiList.forEach(function(obs) {
      upsertRowByKey(obsSheet, 1, obs.noPendaftaran, [
        obs.createdAt || new Date().toISOString(),
        obs.noPendaftaran || "",
        obs.namaSiswa || "",
        obs.namaPenguji || "",
        obs.nilaiTahsin || 0,
        obs.catatanTahsin || "",
        obs.nilaiTahfidz || 0,
        obs.juzDiuji || "",
        obs.catatanTahfidz || "",
        obs.nilaiKarakterAdab || 0,
        obs.catatanKarakterAdab || "",
        obs.nilaiAkademikDasar || 0,
        obs.catatanAkademikDasar || "",
        obs.totalSkor || 0,
        obs.rataRata || 0,
        obs.rekomendasi || "Diterima",
        obs.catatanPenguji || "",
        obs.pdfUrl || "",
        JSON.stringify(obs)
      ], 2);
    });
  }

  if (Array.isArray(payload.kelulusanList)) {
    const lulusSheet = ss.getSheetByName(SHEET_KELULUSAN);
    const existingStatusMap = {};
    if (lulusSheet && lulusSheet.getLastRow() >= 2) {
      const lRows = lulusSheet.getDataRange().getValues();
      for (let i = 1; i < lRows.length; i++) {
        const k = String(lRows[i][0] || "").trim().toUpperCase();
        if (k) {
          existingStatusMap[k] = {
            kirim: String(lRows[i][10] || "").trim(),
            cek: String(lRows[i][11] || "").trim(),
            unduh: String(lRows[i][12] || "").trim()
          };
        }
      }
    }
    payload.kelulusanList.forEach(function(kl) {
      const key = String(kl.noPendaftaran || "").trim().toUpperCase();
      const prev = existingStatusMap[key] || {};
      const statusKirim = kl.statusKirimPesan !== undefined
        ? formatStatusPengumumanCell(kl.statusKirimPesan)
        : (prev.kirim || "BELUM");
      const statusCek = kl.statusCekSeleksi !== undefined
        ? formatStatusPengumumanCell(kl.statusCekSeleksi)
        : (prev.cek || "BELUM");
      const statusUnduh = kl.statusUnduhSkhs !== undefined
        ? formatStatusPengumumanCell(kl.statusUnduhSkhs)
        : (prev.unduh || "BELUM");

      upsertRowByKey(lulusSheet, 0, kl.noPendaftaran, [
        kl.noPendaftaran || "",
        kl.nisn || "",
        kl.namaLengkap || "",
        kl.asalSekolah || "",
        kl.jalur || "Jalur Reguler / Gelombang 1",
        kl.status || "PROSES_SELEKSI",
        kl.skorAkhir || 0,
        kl.pesanPengumuman || "",
        kl.jadwalDaftarUlang || "-",
        new Date().toISOString(),
        statusKirim,
        statusCek,
        statusUnduh
      ], 2);
    });
  }

  if (Array.isArray(payload.pembiayaanList) && payload.pembiayaanList.length > 0) {
    savePembiayaanListToSheet({ pembiayaanList: payload.pembiayaanList });
  }

  return {
    success: true,
    spreadsheetName: ss.getName(),
    spreadsheetUrl: ss.getUrl(),
    message: "Seluruh data berhasil disinkronkan ke Google Spreadsheet '" + ss.getName() + "'!"
  };
}

function savePembiayaanListToSheet(payload) {
  setupSheets();
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_PEMBIAYAAN);
  if (!sheet) return { success: false, message: "Sheet Pembiayaan tidak ditemukan." };
  const list = payload.pembiayaanList || [];
  if (!Array.isArray(list) || list.length === 0) return { success: true, count: 0 };

  const lastRow = sheet.getLastRow();
  if (lastRow >= 2) {
    sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).clearContent();
  }

  const rows = list.map(function(item) {
    return [
      item.kategori || "",
      item.ring || "",
      item.gelombang || "",
      Number(item.gedung) || 0,
      Number(item.bpp) || 0,
      Number(item.seragam) || 0,
      Number(item.subtotalI) || 0,
      Number(item.buku) || 0,
      Number(item.outingPerkemahan) || 0,
      Number(item.kbm) || 0,
      Number(item.komite) || 0,
      Number(item.osis) || 0,
      Number(item.subtotalII) || 0,
      Number(item.spp) || 0,
      Number(item.totalBiaya) || 0,
      item.catatan || ""
    ];
  });

  sheet.getRange(2, 1, rows.length, PEMBIAYAAN_HEADERS.length).setValues(rows);
  return { success: true, count: rows.length, message: "Berhasil menyimpan " + rows.length + " data pembiayaan." };
}

/**
 * Membaca seluruh data kategori pembiayaan dari Sheet "Pembiayaan" (16 Kolom Resmi)
 */
function getPembiayaanFromSheet() {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_PEMBIAYAAN);
  if (!sheet || sheet.getLastRow() < 2) return [];

  const rows = sheet.getDataRange().getValues();
  const list = [];

  function cleanNum(val) {
    if (val === undefined || val === null || val === "" || val === "-") return 0;
    if (typeof val === "number") return isNaN(val) ? 0 : val;
    var cleaned = String(val).replace(/[^0-9-]/g, "");
    var n = parseInt(cleaned, 10);
    return isNaN(n) ? 0 : n;
  }

  for (var i = 1; i < rows.length; i++) {
    var row = rows[i];
    var kat = String(row[0] || "").trim();
    if (!kat) continue;

    var gedung = cleanNum(row[3]);
    var bpp = cleanNum(row[4]);
    var seragam = cleanNum(row[5]);
    var subtotalI = cleanNum(row[6]) > 0 ? cleanNum(row[6]) : (gedung + bpp + seragam);

    var buku = cleanNum(row[7]);
    var outing = cleanNum(row[8]);
    var kbm = cleanNum(row[9]);
    var komite = cleanNum(row[10]);
    var osis = cleanNum(row[11]);
    var subtotalII = cleanNum(row[12]) > 0 ? cleanNum(row[12]) : (buku + outing + kbm + komite + osis);

    var spp = cleanNum(row[13]);
    var totalBiaya = cleanNum(row[14]) > 0 ? cleanNum(row[14]) : (subtotalI + subtotalII + spp);

    list.push({
      kategori: kat,
      ring: String(row[1] || "Ring 1").trim(),
      gelombang: String(row[2] || "Gelombang 2").trim(),
      gedung: gedung,
      bpp: bpp,
      seragam: seragam,
      subtotalI: subtotalI,
      buku: buku,
      outingPerkemahan: outing,
      kbm: kbm,
      komite: komite,
      osis: osis,
      subtotalII: subtotalII,
      spp: spp,
      totalBiaya: totalBiaya,
      catatan: String(row[15] || "").trim()
    });
  }
  return list;
}

function getAllDatabaseData() {
  const ss = getSpreadsheet();
  const result = {
    spreadsheetId: ss.getId(),
    spreadsheetName: ss.getName(),
    settings: getSettingsFromSheet(),
    users: [],
    siswaList: [],
    dataIndukList: [],
    otmMap: {},
    hasilOrtuMap: {},
    observasiList: [],
    wawancaraSiswaList: [],
    kelulusanList: [],
    pembiayaanList: []
  };

  const userSheet = ss.getSheetByName(SHEET_USERS);
  if (userSheet && userSheet.getLastRow() >= 2) {
    const rows = userSheet.getDataRange().getValues();
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][1]) {
        result.users.push({
          id: String(rows[i][0] || "USR-" + i),
          kodePendaftaran: String(rows[i][1]),
          namaSiswa: String(rows[i][2] || ""),
          namaOrangTua: String(rows[i][3] || ""),
          sekolahAsal: String(rows[i][4] || ""),
          nomorHp: String(rows[i][5] || ""),
          emailOrangTua: String(rows[i][6] || ""),
          role: String(rows[i][7] || "siswa"),
          jabatan: String(rows[i][8] || ""),
          createdAt: String(rows[i][9] || "")
        });
      }
    }
  }

  const siswaSheet = ss.getSheetByName(SHEET_SISWA);
  if (siswaSheet && siswaSheet.getLastRow() >= 2) {
    const rows = siswaSheet.getDataRange().getValues();
    const seenSiswa = {};
    for (let i = 1; i < rows.length; i++) {
      const studentObj = mapRowToSiswaObject(rows[i]);
      if (studentObj && studentObj.noPendaftaran) {
        const key = String(studentObj.noPendaftaran).trim().toUpperCase();
        if (seenSiswa[key]) continue;
        seenSiswa[key] = true;
        result.siswaList.push(studentObj);
      }
    }
  }

  // Tarik Data Induk Sekolah
  result.dataIndukList = getDataIndukFromSheet();

  // Tarik Data Kategori Pembiayaan (16 Kolom Resmi)
  result.pembiayaanList = getPembiayaanFromSheet();

  const otmSheet = ss.getSheetByName(SHEET_OTM_NAME);
  if (otmSheet && otmSheet.getLastRow() >= 3) {
    const rows = otmSheet.getDataRange().getValues();
    for (let i = 2; i < rows.length; i++) {
      const noPend = String(rows[i][0] || "").trim();
      if (noPend) {
        const mapObj = {};
        for (let idx = 10; idx <= 44; idx++) {
          if (rows[i][idx] !== undefined && rows[i][idx] !== "") {
            mapObj[idx] = String(rows[i][idx]);
          }
        }
        result.otmMap[noPend] = mapObj;
      }
    }
  }

  const hwSheet = ss.getSheetByName(SHEET_DB_NAME);
  if (hwSheet && hwSheet.getLastRow() >= 2) {
    const rows = hwSheet.getDataRange().getValues();
    for (let i = 1; i < rows.length; i++) {
      const noPend = String(rows[i][1] || "").trim();
      const jsonStr = rows[i][9];
      if (noPend && jsonStr) {
        try {
          result.hasilOrtuMap[noPend] = JSON.parse(jsonStr);
        } catch (e) {}
      }
    }
  }

  const obsSheet = ss.getSheetByName(SHEET_SISWA_OBS);
  if (obsSheet && obsSheet.getLastRow() >= 2) {
    const rows = obsSheet.getDataRange().getValues();
    for (let i = 1; i < rows.length; i++) {
      const idSiswa = String(rows[i][1] || "").trim();
      if (!idSiswa) continue;
      var obsObj = null;
      var jsonStr = rows[i][18];
      if (jsonStr) {
        try {
          obsObj = JSON.parse(jsonStr);
        } catch (e) {}
      }
      if (!obsObj) {
        var nTahsin = rows[i][4] !== "" ? Number(rows[i][4]) : "";
        var nTahfidz = rows[i][6] !== "" ? Number(rows[i][6]) : "";
        var nKarakter = rows[i][9] !== "" ? Number(rows[i][9]) : "";
        var nAkademik = rows[i][11] !== "" ? Number(rows[i][11]) : "";
        obsObj = {
          noPendaftaran: idSiswa,
          namaSiswa: String(rows[i][2] || "").trim(),
          namaPenguji: String(rows[i][3] || "").trim(),
          nilaiTahsin: nTahsin,
          catatanTahsin: String(rows[i][5] || "").trim(),
          nilaiTahfidz: nTahfidz,
          juzDiuji: String(rows[i][7] || "").trim(),
          catatanTahfidz: String(rows[i][8] || "").trim(),
          nilaiKarakterAdab: nKarakter,
          catatanKarakterAdab: String(rows[i][10] || "").trim(),
          nilaiAkademikDasar: nAkademik,
          catatanAkademikDasar: String(rows[i][12] || "").trim(),
          totalSkor: Number(rows[i][13] || 0),
          rataRata: Number(rows[i][14] || 0),
          rekomendasi: String(rows[i][15] || "").trim(),
          catatanPenguji: String(rows[i][16] || "").trim(),
          pdfUrl: String(rows[i][17] || "").trim()
        };
      }
      result.observasiList.push(obsObj);
    }
  }

  const wsSheet = ss.getSheetByName(SHEET_WAWANCARA_SISWA);
  if (wsSheet && wsSheet.getLastRow() >= 2) {
    const rows = wsSheet.getDataRange().getValues();
    for (let i = 1; i < rows.length; i++) {
      const noPendWs = String(rows[i][1] || "").trim();
      if (noPendWs === "__TRACKING_PENGUMUMAN__") continue;
      const jsonStr = rows[i][6];
      if (jsonStr) {
        try {
          result.wawancaraSiswaList.push(JSON.parse(jsonStr));
        } catch (e) {}
      }
    }
  }

  const lulusSheet = ss.getSheetByName(SHEET_KELULUSAN);
  if (lulusSheet && lulusSheet.getLastRow() >= 2) {
    const rows = lulusSheet.getDataRange().getValues();
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][0]) {
        result.kelulusanList.push({
          noPendaftaran: String(rows[i][0]).trim(),
          nisn: String(rows[i][1] || ""),
          namaLengkap: String(rows[i][2] || ""),
          asalSekolah: String(rows[i][3] || ""),
          jalur: String(rows[i][4] || "Jalur Reguler"),
          status: String(rows[i][5] || "PROSES_SELEKSI").trim(),
          skorAkhir: Number(rows[i][6] || 0),
          pesanPengumuman: String(rows[i][7] || ""),
          jadwalDaftarUlang: String(rows[i][8] || "-"),
          updatedAt: String(rows[i][9] || ""),
          statusKirimPesan: String(rows[i][10] || "BELUM").trim() || "BELUM",
          statusCekSeleksi: String(rows[i][11] || "BELUM").trim() || "BELUM",
          statusUnduhSkhs: String(rows[i][12] || "BELUM").trim() || "BELUM"
        });
      }
    }
  }

  return result;
}

function getStudentList() {
  const ss = getSpreadsheet();
  const otmSheet = ss.getSheetByName(SHEET_OTM_NAME);
  const dbSheet = ss.getSheetByName(SHEET_DB_NAME);

  const data = otmSheet.getDataRange().getValues();
  let existingMap = {};
  let statusMap = {};
  let ttdMap = {};

  if (dbSheet && dbSheet.getLastRow() > 1) {
    const dbData = dbSheet.getDataRange().getValues();
    for (let j = 1; j < dbData.length; j++) {
      const sId = String(dbData[j][1]).trim();
      const pUrl = dbData[j][6];
      const st = dbData[j][7] || "selesai";
      const ttdSigned = dbData[j][8] === "YA";
      if (sId) {
        if (pUrl) existingMap[sId] = pUrl;
        statusMap[sId] = st;
        ttdMap[sId] = ttdSigned;
      }
    }
  }

  let students = [];
  for (let i = 2; i < data.length; i++) {
    if (data[i][1] && String(data[i][1]).trim() !== "") {
      let idStr = String(data[i][0]).trim();
      students.push({
        rowIndex: i,
        id: idStr,
        nama: data[i][1] || "",
        panggilan: data[i][2] || "",
        sekolah: data[i][4] || "",
        ayah: data[i][6] || "",
        ibu: data[i][7] || "",
        rawData: data[i],
        existingPdf: existingMap[idStr] || null,
        hasDraft: Boolean(statusMap[idStr]),
        isTtdOrtuSigned: Boolean(ttdMap[idStr]),
        draftStatus: statusMap[idStr] || "belum_wawancara"
      });
    }
  }
  return students;
}

function processForm(formObject) {
  setupSheets();
  const ss = getSpreadsheet();
  let targetSheet = ss.getSheetByName(SHEET_DB_NAME);

  const answers = typeof formObject.jsonAnswers === 'string' ? JSON.parse(formObject.jsonAnswers) : (formObject.jsonAnswers || []);
  const catatanItem = answers.find(function(item) { return item.question && item.question.includes("CATATAN KHUSUS"); });
  const catatanKhususText = catatanItem ? (catatanItem.newAnswer || "-") : (formObject.catatanKhusus || "-");

  const currentSettings = getSettingsFromSheet();
  const folderId = extractDriveFolderId(formObject.driveFolderUrl || currentSettings.driveFolderUrl);

  let pdfUrl = formObject.pdfUrl || "";
  const dateStr = Utilities.formatDate(new Date(), "Asia/Jakarta", "dd-MM-yyyy");
  const pdfName = "Wawancara_" + (formObject.namaSiswa || "Siswa").replace(/\\s+/g, '_') + "_" + dateStr + ".pdf";

  try {
    const folder = DriveApp.getFolderById(folderId);
    const htmlBody = createPDFTemplate(formObject, dateStr);
    const blob = Utilities.newBlob(htmlBody, MimeType.HTML).setName(pdfName);
    const pdfFile = folder.createFile(blob).getAs(MimeType.PDF);
    const savedFile = folder.createFile(pdfFile);
    savedFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    pdfUrl = savedFile.getUrl();
  } catch (e) {
    if (!pdfUrl) {
      pdfUrl = currentSettings.driveFolderUrl || ("https://docs.google.com/spreadsheets/d/" + ss.getId() + "/edit");
    }
  }

  const recordData = {
    id: "HO-" + Date.now(),
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
    ttdOrtuBase64: formObject.ttdOrtuBase64 || "",
    ttdPewawancaraBase64: formObject.ttdPewawancaraBase64 || "",
    pdfUrl: pdfUrl,
    status: "selesai",
    isTtdOrtuSigned: Boolean(formObject.ttdOrtuBase64)
  };

  upsertRowByKey(targetSheet, 1, formObject.idSiswa, [
    new Date(),
    formObject.idSiswa,
    formObject.namaSiswa,
    formObject.namaPanggilan,
    catatanKhususText,
    formObject.namaPewawancara,
    pdfUrl,
    "selesai",
    formObject.ttdOrtuBase64 ? "YA" : "BELUM",
    JSON.stringify(recordData)
  ], 2);

  return {
    message: "Sukses! Data tersimpan di Spreadsheet dan PDF telah dibuat di Folder Google Drive.",
    pdfUrl: pdfUrl
  };
}

function createPDFTemplate(data, dateStr) {
  const answers = typeof data.jsonAnswers === 'string' ? JSON.parse(data.jsonAnswers) : (data.jsonAnswers || []);
  let tableRows = "";

  answers.forEach(function(item) {
    if (item.question && item.question.includes("CATATAN KHUSUS")) {
      return;
    }
    if (item.isHeader) {
      tableRows += '<tr><td colspan="3" style="background-color: #065f46; color: white; font-weight: bold; text-align: center; padding: 8px;">' + item.question + '</td></tr>';
    } else {
      tableRows += '<tr>' +
        '<td style="width: 35%; padding: 6px; border: 1px solid #666; vertical-align: top;">' + (item.question || "-") + '</td>' +
        '<td style="width: 30%; background-color: #f9f9f9; font-size: 11px; padding: 6px; border: 1px solid #666; vertical-align: top;">' + (item.refAnswer || "-") + '</td>' +
        '<td style="width: 35%; padding: 6px; border: 1px solid #666; vertical-align: top;">' + (item.newAnswer || "-") + '</td>' +
        '</tr>';
    }
  });

  const ttdOrtuImg = data.ttdOrtuBase64 ? '<img src="' + data.ttdOrtuBase64 + '" style="max-height:70px; display:block; margin:0 auto;" />' : '<div class="ttd-space"></div>';
  const ttdPewawancaraImg = data.ttdPewawancaraBase64 ? '<img src="' + data.ttdPewawancaraBase64 + '" style="max-height:70px; display:block; margin:0 auto;" />' : '<div class="ttd-space"></div>';

  return '<html><head><style>' +
    'body { font-family: sans-serif; padding: 20px; font-size: 12px; }' +
    '.header { text-align: center; margin-bottom: 20px; border-bottom: 3px double #333; padding-bottom: 10px; }' +
    'h2, h3 { margin: 5px 0; }' +
    '.biodata-box { margin-bottom: 20px; border: 1px solid #ddd; padding: 10px; background: #fdfdfd; }' +
    '.biodata-row { display: flex; margin-bottom: 5px; }' +
    '.label { width: 140px; font-weight: bold; }' +
    '.val { flex: 1; }' +
    'table { width: 100%; border-collapse: collapse; margin-top: 10px; }' +
    'th, td { border: 1px solid #666; padding: 6px; vertical-align: top; }' +
    'th { background-color: #ddd; text-align: center; font-weight: bold; }' +
    '.ttd-container { margin-top: 40px; display: table; width: 100%; }' +
    '.ttd-box { display: table-cell; text-align: center; width: 50%; vertical-align: bottom; }' +
    '.ttd-space { height: 75px; }' +
    '.ttd-line { border-top: 1px solid #000; width: 80%; margin: 0 auto; margin-top: 5px; }' +
    '</style></head><body>' +
    '<div class="header">' +
    '<h2>HASIL WAWANCARA ORANG TUA PENERIMAAN SISWA BARU</h2>' +
    '<h3>SMPIT PONDOK DUTA</h3>' +
    '<p>Tanggal Wawancara: ' + dateStr + '</p>' +
    '</div>' +
    '<div class="biodata-box">' +
    '<div class="biodata-row"><span class="label">Nama Siswa:</span> <span class="val">' + (data.namaSiswa || "-") + '</span></div>' +
    '<div class="biodata-row"><span class="label">Nama Panggilan:</span> <span class="val">' + (data.namaPanggilan || "-") + '</span></div>' +
    '<div class="biodata-row"><span class="label">Asal Sekolah:</span> <span class="val">' + (data.sekolahAsal || "-") + '</span></div>' +
    '<div class="biodata-row"><span class="label">Nama Ayah:</span> <span class="val">' + (data.namaAyah || "-") + '</span></div>' +
    '<div class="biodata-row"><span class="label">Nama Ibu:</span> <span class="val">' + (data.namaIbu || "-") + '</span></div>' +
    '<div class="biodata-row"><span class="label">Pewawancara:</span> <span class="val">' + (data.namaPewawancara || "-") + '</span></div>' +
    '</div>' +
    '<table><thead><tr><th>Pertanyaan / Topik</th><th>Data Awal / Jawaban Ortu (Ref)</th><th>Hasil Wawancara / Catatan</th></tr></thead>' +
    '<tbody>' + tableRows + '</tbody></table>' +
    '<div class="ttd-container">' +
    '<div class="ttd-box">' + ttdOrtuImg + '<div class="ttd-line"></div><p>( Orang Tua / Wali )</p></div>' +
    '<div class="ttd-box">' + ttdPewawancaraImg + '<div class="ttd-line"></div><p>( ' + (data.namaPewawancara || "Pewawancara") + ' )</p></div>' +
    '</div></body></html>';
}

function processObservasiSiswa(data) {
  setupSheets();
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_SISWA_OBS);

  upsertRowByKey(sheet, 1, data.noPendaftaran, [
    new Date(),
    data.noPendaftaran || "",
    data.namaSiswa || "",
    data.namaPenguji || "",
    data.nilaiTahsin || 0,
    data.catatanTahsin || "",
    data.nilaiTahfidz || 0,
    data.juzDiuji || "",
    data.catatanTahfidz || "",
    data.nilaiKarakterAdab || 0,
    data.catatanKarakterAdab || "",
    data.nilaiAkademikDasar || 0,
    data.catatanAkademikDasar || "",
    data.totalSkor || 0,
    data.rataRata || 0,
    data.rekomendasi || "Diterima",
    data.catatanPenguji || "",
    data.pdfUrl || "",
    JSON.stringify(data)
  ], 2);

  const lulusSheet = ss.getSheetByName(SHEET_KELULUSAN);
  const statusMap = {
    "Diterima": "LULUS",
    "Cadangan": "CADANGAN",
    "Tidak Diterima": "TIDAK_LULUS"
  };
  const newStatus = statusMap[data.rekomendasi] || "PROSES_SELEKSI";
  const pesan = newStatus === "LULUS"
    ? "Selamat! Berdasarkan hasil evaluasi observasi siswa dan wawancara orang tua, ananda dinyatakan DITERIMA di SMPIT PONDOK DUTA TP 2027/2028."
    : (newStatus === "CADANGAN"
      ? "Ananda berada pada posisi CADANGAN dengan nilai rata-rata " + data.rataRata + "."
      : "Mohon maaf, ananda belum memenuhi kuota penerimaan SMPIT Pondok Duta tahun ini.");

  const jadwalDaftarUlangVal = newStatus === "LULUS"
    ? (data.tanggalMaksimalDaftarUlang || "20 - 25 Januari 2027")
    : "-";

  let existingKirim = "BELUM";
  let existingCek = "BELUM";
  let existingUnduh = "BELUM";
  if (lulusSheet && lulusSheet.getLastRow() >= 2) {
    const lRows = lulusSheet.getDataRange().getValues();
    for (let i = 1; i < lRows.length; i++) {
      if (String(lRows[i][0] || "").trim().toUpperCase() === String(data.noPendaftaran || "").trim().toUpperCase()) {
        if (lRows[i][10]) existingKirim = String(lRows[i][10]).trim() || "BELUM";
        if (lRows[i][11]) existingCek = String(lRows[i][11]).trim() || "BELUM";
        if (lRows[i][12]) existingUnduh = String(lRows[i][12]).trim() || "BELUM";
        break;
      }
    }
  }

  upsertRowByKey(lulusSheet, 0, data.noPendaftaran, [
    data.noPendaftaran || "",
    data.nisn || "",
    data.namaSiswa || "",
    data.asalSekolah || "SD/MI Pendaftar",
    "Jalur Reguler / Gelombang 1",
    newStatus,
    data.rataRata || 0,
    pesan,
    jadwalDaftarUlangVal,
    new Date().toISOString(),
    existingKirim,
    existingCek,
    existingUnduh
  ], 2);

  return { success: true, message: "Observasi Siswa & Status Kelulusan berhasil disimpan di Spreadsheet!" };
}
`;
