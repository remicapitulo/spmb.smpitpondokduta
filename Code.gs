/**
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
  const str = String(input).trim();
  if (!str) return DEFAULT_FOLDER_ID;
  const match = str.match(/\/folders\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) return match[1];
  const idMatch = str.match(/id=([a-zA-Z0-9-_]+)/);
  if (idMatch && idMatch[1]) return idMatch[1];
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

/**
 * Membuat dan memastikan seluruh 9 Sheet Database beserta header kolom lengkap.
 */
function setupSheets() {
  const ss = getSpreadsheet();
  const createdSheets = [];

  function ensureSheet(name, headers) {
    let sheet = ss.getSheetByName(name);
    if (!sheet) {
      sheet = ss.insertSheet(name);
      createdSheets.push(name);
    }
    if (sheet.getLastRow() === 0 && headers && headers.length > 0) {
      sheet.appendRow(headers);
      const headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setBackground("#065f46");
      headerRange.setFontColor("#ffffff");
      headerRange.setFontWeight("bold");
      sheet.setFrozenRows(1);
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

  // 3. Sheet Siswa (Dilengkapi seluruh kolom rincian biodata tanpa hanya bergantung pada JSON)
  ensureSheet(SHEET_SISWA, [
    "No Pendaftaran", "Nama Lengkap", "Nama Panggilan", "NISN", "Jenis Kelamin",
    "Tempat Lahir", "Tanggal Lahir", "Agama", "Asal Sekolah", "Alamat",
    "Kelurahan", "Kecamatan", "Kota/Kabupaten", "No HP Ortu",
    "Nama Ayah", "Pekerjaan Ayah", "Penghasilan Ayah", "No HP Ayah",
    "Nama Ibu", "Pekerjaan Ibu", "Penghasilan Ibu", "No HP Ibu",
    "NIK Siswa", "Kewarganegaraan", "Anak Ke", "Jml Sdr Kandung", "Jml Sdr Tiri", "Jml Sdr Angkat",
    "Bahasa Sehari-hari", "Berat Badan (kg)", "Tinggi Badan (cm)", "Golongan Darah",
    "Penyakit Berat", "Kelainan Jasmani", "Bertempat Tinggal Pada", "Jarak ke Sekolah (km)",
    "Sarana Berangkat", "Masuk Sebagai", "Nomor Ijazah SD", "Kesenian", "Olahraga", "Organisasi",
    "Menerima Beasiswa", "Prestasi", "TTL Ayah", "Agama Ayah", "Pendidikan Ayah", "Alamat Ayah", "Email Ayah",
    "TTL Ibu", "Agama Ibu", "Pendidikan Ibu", "Alamat Ibu", "Email Ibu",
    "Nama Wali", "TTL Wali", "Agama Wali", "Pendidikan Wali", "Pekerjaan Wali", "Penghasilan Wali", "Alamat Wali", "No HP Wali", "Hubungan Wali",
    "JSON Biodata Lengkap", "Updated At"
  ]);

  // 4. Sheet Data Induk Sekolah (RESMI - SELURUH KOLOM LENGKAP TANPA JSON)
  ensureSheet(SHEET_DATA_INDUK, DATA_INDUK_HEADERS);

  // 5. Sheet OTM
  let otmSheet = ss.getSheetByName(SHEET_OTM_NAME);
  if (!otmSheet) {
    otmSheet = ss.insertSheet(SHEET_OTM_NAME);
    createdSheets.push(SHEET_OTM_NAME);
  }
  if (otmSheet.getLastRow() === 0) {
    const otmHeaders = [
      "No Pendaftaran", "Nama Lengkap Siswa", "Nama Panggilan", "Jenis Kelamin",
      "Asal Sekolah", "NISN", "Nama Ayah", "Nama Ibu", "No HP WhatsApp", "Timestamp"
    ];
    for (let q = 1; q <= 35; q++) {
      otmHeaders.push("Q" + q + " (Ref Index " + (q + 9) + ")");
    }
    otmSheet.appendRow(["DATABASE KUESIONER WAWANCARA ORANG TUA (OTM) - SPMB SMPIT PONDOK DUTA"]);
    otmSheet.appendRow(otmHeaders);
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

  // 9. Sheet Kelulusan
  ensureSheet(SHEET_KELULUSAN, [
    "No Pendaftaran", "NISN", "Nama Lengkap", "Asal Sekolah",
    "Jalur", "Status Kelulusan", "Skor Akhir", "Pesan Pengumuman", "Jadwal Daftar Ulang", "Updated At"
  ]);

  return {
    success: true,
    spreadsheetId: ss.getId(),
    spreadsheetName: ss.getName(),
    spreadsheetUrl: ss.getUrl(),
    createdSheets: createdSheets,
    allSheets: ss.getSheets().map(function(s) { return s.getName(); }),
    message: "Inisialisasi 9 Sheet Database (termasuk 'Data Induk Sekolah' & 'Setting') pada Spreadsheet '" + ss.getName() + "' berhasil!"
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
      const ss = getSpreadsheet();
      if (action === "ping") {
        result.success = true;
        result.spreadsheetId = ss.getId();
        result.spreadsheetName = ss.getName();
        result.spreadsheetUrl = ss.getUrl();
        result.sheets = ss.getSheets().map(function(s) { return s.getName(); });
        result.settings = getSettingsFromSheet();
        result.message = "Terhubung ke Google Spreadsheet: " + ss.getName();
      } else if (action === "setupSheets") {
        result = setupSheets();
      } else if (action === "getSettings") {
        result.success = true;
        result.settings = getSettingsFromSheet();
      } else if (action === "getStudentList" || action === "getSiswaList") {
        result.data = getStudentList();
        result.success = true;
      } else if (action === "getAllData") {
        result.data = getAllDatabaseData();
        result.success = true;
      } else if (action === "getDataInduk") {
        result.data = getDataIndukFromSheet();
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
    message: "Web App API SPMB SMPIT Pondok Duta Aktif",
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

    if (action === "setupSheets") {
      result = setupSheets();
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
    } else if (action === "saveDataInduk" || action === "saveBatchDataInduk" || action === "syncDataInduk") {
      result = saveBatchDataIndukToSheet(postData);
    } else if (action === "updateNis") {
      result = updateStudentNisInSheet(postData.noPendaftaran, postData.nis);
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
      user.nomorHp || "",
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

/**
 * Menyimpan data siswa ke Sheet "Siswa" dengan memetakan seluruh rincian biodata ke kolom masing-masing
 * sehingga tabel di database terisi lengkap tanpa harus mengurai JSON.
 */
function upsertSiswaToSheet(siswa) {
  setupSheets();
  const ss = getSpreadsheet();
  const siswaSheet = ss.getSheetByName(SHEET_SISWA);

  const fullRow = [
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
  setupSheets();
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_DATA_INDUK);
  const result = [];
  if (!sheet || sheet.getLastRow() < 2) return result;

  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (r[4]) { // Memiliki No Pendaftaran
      result.push({
        id: "INDUK-" + (r[4] || i),
        noUrut: Number(r[0]) || i,
        nis: String(r[1] || ""),
        nisn: String(r[2] || ""),
        nik: String(r[3] || ""),
        noPendaftaran: String(r[4] || ""),
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
  setupSheets();
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
    payload.kelulusanList.forEach(function(kl) {
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
        new Date().toISOString()
      ], 2);
    });
  }

  return {
    success: true,
    spreadsheetName: ss.getName(),
    spreadsheetUrl: ss.getUrl(),
    message: "Seluruh data berhasil disinkronkan ke Google Spreadsheet '" + ss.getName() + "'!"
  };
}

function getAllDatabaseData() {
  setupSheets();
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
    kelulusanList: []
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
    for (let i = 1; i < rows.length; i++) {
      const lastIdx = rows[i].length - 2;
      const jsonStr = rows[i][lastIdx] || rows[i][22];
      let parsed = null;
      if (typeof jsonStr === "string" && jsonStr.indexOf("{") !== -1) {
        try {
          parsed = JSON.parse(jsonStr);
          result.siswaList.push(parsed);
          continue;
        } catch (e) {}
      }
      if (rows[i][0]) {
        result.siswaList.push({
          noPendaftaran: String(rows[i][0]),
          namaLengkap: String(rows[i][1] || ""),
          namaPanggilan: String(rows[i][2] || ""),
          nisn: String(rows[i][3] || ""),
          jenisKelamin: String(rows[i][4] || "Laki-laki"),
          tempatLahir: String(rows[i][5] || ""),
          tanggalLahir: String(rows[i][6] || ""),
          agama: String(rows[i][7] || "Islam"),
          asalSekolah: String(rows[i][8] || ""),
          alamat: String(rows[i][9] || ""),
          kelurahan: String(rows[i][10] || ""),
          kecamatan: String(rows[i][11] || ""),
          kotaKabupaten: String(rows[i][12] || ""),
          nomorHandphone: String(rows[i][13] || ""),
          namaAyah: String(rows[i][14] || ""),
          pekerjaanAyah: String(rows[i][15] || ""),
          penghasilanAyah: String(rows[i][16] || ""),
          noHpAyah: String(rows[i][17] || ""),
          namaIbu: String(rows[i][18] || ""),
          pekerjaanIbu: String(rows[i][19] || ""),
          penghasilanIbu: String(rows[i][20] || ""),
          noHpIbu: String(rows[i][21] || ""),
          nik: String(rows[i][22] || "")
        });
      }
    }
  }

  // Tarik Data Induk Sekolah
  result.dataIndukList = getDataIndukFromSheet();

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
      const jsonStr = rows[i][18];
      if (jsonStr) {
        try {
          result.observasiList.push(JSON.parse(jsonStr));
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
          noPendaftaran: String(rows[i][0]),
          nisn: String(rows[i][1] || ""),
          namaLengkap: String(rows[i][2] || ""),
          asalSekolah: String(rows[i][3] || ""),
          jalur: String(rows[i][4] || "Jalur Reguler"),
          status: String(rows[i][5] || "PROSES_SELEKSI"),
          skorAkhir: Number(rows[i][6] || 0),
          pesanPengumuman: String(rows[i][7] || ""),
          jadwalDaftarUlang: String(rows[i][8] || "-")
        });
      }
    }
  }

  return result;
}

function getStudentList() {
  setupSheets();
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
  const pdfName = "Wawancara_" + (formObject.namaSiswa || "Siswa").replace(/\s+/g, '_') + "_" + dateStr + ".pdf";

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
    new Date().toISOString()
  ], 2);

  return { success: true, message: "Observasi Siswa & Status Kelulusan berhasil disimpan di Spreadsheet!" };
}
