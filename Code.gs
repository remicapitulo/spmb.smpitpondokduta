/**
 * =========================================================================
 * GOOGLE APPS SCRIPT (GAS) API - SPMB SMPIT PONDOK DUTA
 * Terhubung ke Google Spreadsheet ID: 1sKTeUlnxa9aquB8rBZfULrx7ZUaP1v-7pFBzu5EW3m8
 * Backend Database 7 Sheet & PDF Generator Hasil Wawancara / Observasi
 * =========================================================================
 */

const SPREADSHEET_ID = "1sKTeUlnxa9aquB8rBZfULrx7ZUaP1v-7pFBzu5EW3m8";
const FOLDER_ID = "1jAcyugqheVYkOG-RnuuqQgeUMvfwrVEo"; // Opsional: ID Folder Google Drive untuk arsip PDF

const SHEET_USERS = "Users";
const SHEET_SISWA = "Siswa";
const SHEET_OTM_NAME = "OTM";
const SHEET_DB_NAME = "Hasil_Wawancara";
const SHEET_SISWA_OBS = "Observasi_Siswa";
const SHEET_WAWANCARA_SISWA = "Wawancara_Siswa";
const SHEET_KELULUSAN = "Kelulusan";

function getSpreadsheet() {
  try {
    if (SPREADSHEET_ID && SPREADSHEET_ID.trim() !== "") {
      return SpreadsheetApp.openById(SPREADSHEET_ID.trim());
    }
  } catch (e) {
    // Fallback ke active spreadsheet jika dijalankan dari dalam container sheet
  }
  return SpreadsheetApp.getActiveSpreadsheet();
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Jalankan fungsi setupSheets() ini 1x di Editor Apps Script (atau dari tombol di Web App)
 * untuk membuat seluruh 7 Sheet Database beserta Header Kolom secara otomatis.
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

  // 1. Sheet Users
  ensureSheet(SHEET_USERS, [
    "ID User", "Kode Pendaftaran", "Nama Siswa / Pengguna", "Nama Orang Tua / Ket",
    "Sekolah Asal", "Nomor HP", "Email", "Role", "Jabatan", "Created At"
  ]);

  // 2. Sheet Siswa (Biodata Lengkap)
  ensureSheet(SHEET_SISWA, [
    "No Pendaftaran", "Nama Lengkap", "Nama Panggilan", "NISN", "Jenis Kelamin",
    "Tempat Lahir", "Tanggal Lahir", "Agama", "Asal Sekolah", "Alamat",
    "Kelurahan", "Kecamatan", "Kota/Kabupaten", "No HP Ortu",
    "Nama Ayah", "Pekerjaan Ayah", "Penghasilan Ayah", "No HP Ayah",
    "Nama Ibu", "Pekerjaan Ibu", "Penghasilan Ibu", "No HP Ibu",
    "JSON Biodata Lengkap", "Updated At"
  ]);

  // 3. Sheet OTM (Baris 1: Judul, Baris 2: Header Kolom untuk kompatibilitas getStudentList mulai baris 3)
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

  // 4. Sheet Hasil_Wawancara
  ensureSheet(SHEET_DB_NAME, [
    "Timestamp", "ID Siswa", "Nama Siswa", "Nama Panggilan",
    "Kesimpulan / Catatan Khusus", "Pewawancara", "Link PDF",
    "Status Wawancara", "TTD Ortu Signed", "JSON Detail Hasil"
  ]);

  // 5. Sheet Observasi_Siswa
  ensureSheet(SHEET_SISWA_OBS, [
    "Timestamp", "ID Siswa", "Nama Siswa", "Nama Penguji",
    "Nilai Tahsin", "Catatan Tahsin",
    "Nilai Tahfidz", "Juz Diuji", "Catatan Tahfidz",
    "Nilai Karakter", "Catatan Karakter",
    "Nilai Akademik", "Catatan Akademik",
    "Total Skor", "Rata-Rata", "Rekomendasi", "Catatan Penguji", "Link PDF", "JSON Detail Observasi"
  ]);

  // 6. Sheet Wawancara_Siswa
  ensureSheet(SHEET_WAWANCARA_SISWA, [
    "Timestamp", "No Pendaftaran", "Nama Lengkap", "Asal Sekolah",
    "Motivasi Masuk", "Target Hafalan", "JSON Detail Asesmen"
  ]);

  // 7. Sheet Kelulusan
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
    message: "Inisialisasi 7 Sheet Database pada Spreadsheet '" + ss.getName() + "' berhasil!"
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
        result.message = "Terhubung ke Google Spreadsheet: " + ss.getName();
      } else if (action === "setupSheets") {
        result = setupSheets();
      } else if (action === "getStudentList" || action === "getSiswaList") {
        result.data = getStudentList();
        result.success = true;
      } else if (action === "getAllData") {
        result.data = getAllDatabaseData();
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
  if (lastRow >= minRow) {
    const data = sheet.getRange(minRow, 1, lastRow - minRow + 1, sheet.getLastColumn()).getValues();
    for (let i = 0; i < data.length; i++) {
      if (String(data[i][keyColIndex]).trim().toUpperCase() === String(keyValue).trim().toUpperCase()) {
        const targetRow = minRow + i;
        sheet.getRange(targetRow, 1, 1, rowValues.length).setValues([rowValues]);
        return { updated: true, row: targetRow };
      }
    }
  }
  sheet.appendRow(rowValues);
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

function upsertSiswaToSheet(siswa) {
  setupSheets();
  const ss = getSpreadsheet();
  const siswaSheet = ss.getSheetByName(SHEET_SISWA);

  upsertRowByKey(siswaSheet, 0, siswa.noPendaftaran, [
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
    JSON.stringify(siswa),
    new Date().toISOString()
  ], 2);

  // Pastikan terdaftar juga di baris OTM agar tampil di daftar pewawancara
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

  return { success: true, message: "Biodata siswa tersimpan di Sheet Siswa & OTM." };
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
  return { success: true, message: "34 Jawaban Kuesioner OTM berhasil disimpan ke Sheet OTM." };
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
  return { success: true, message: "Asesmen mandiri siswa disimpan ke Sheet Wawancara_Siswa." };
}

function saveDraftOrTtdOrtu(payload) {
  setupSheets();
  const ss = getSpreadsheet();
  const targetSheet = ss.getSheetByName(SHEET_DB_NAME);
  const data = payload.data || payload;
  const idSiswa = data.noPendaftaran || data.idSiswa;

  upsertRowByKey(targetSheet, 1, idSiswa, [
    new Date().toISOString(),
    idSiswa,
    data.namaSiswa || "",
    data.namaPanggilan || "",
    data.catatanKhusus || "-",
    data.namaPewawancara || "-",
    data.pdfUrl || "",
    data.status || "draft",
    data.isTtdOrtuSigned ? "YA" : "BELUM",
    JSON.stringify(data)
  ], 2);

  return { success: true, message: "Draft / Tanda Tangan Orang Tua berhasil disinkronkan ke Sheet Hasil_Wawancara." };
}

function syncAllLocalToSheet(payload) {
  const initRes = setupSheets();
  const ss = getSpreadsheet();

  if (Array.isArray(payload.users)) {
    const userSheet = ss.getSheetByName(SHEET_USERS);
    payload.users.forEach(function(u) {
      upsertRowByKey(userSheet, 1, u.kodePendaftaran, [
        u.id || "", u.kodePendaftaran || "", u.namaSiswa || "", u.namaOrangTua || "",
        u.sekolahAsal || "", u.nomorHp || "", u.emailOrangTua || "", u.role || "siswa",
        u.jabatan || "", u.createdAt || new Date().toISOString()
      ], 2);
    });
  }

  if (Array.isArray(payload.siswaList)) {
    payload.siswaList.forEach(function(s) {
      upsertSiswaToSheet(s);
    });
  }

  if (payload.otmMap && typeof payload.otmMap === "object") {
    const siswaMap = {};
    if (Array.isArray(payload.siswaList)) {
      payload.siswaList.forEach(function(s) { siswaMap[s.noPendaftaran] = s; });
    }
    Object.keys(payload.otmMap).forEach(function(noPend) {
      upsertOtmAnswersToSheet({
        noPendaftaran: noPend,
        otmMap: payload.otmMap[noPend],
        siswa: siswaMap[noPend] || {}
      });
    });
  }

  if (payload.hasilOrtuMap && typeof payload.hasilOrtuMap === "object") {
    Object.keys(payload.hasilOrtuMap).forEach(function(noPend) {
      saveDraftOrTtdOrtu({ data: payload.hasilOrtuMap[noPend] });
    });
  }

  if (Array.isArray(payload.observasiList)) {
    payload.observasiList.forEach(function(obs) {
      processObservasiSiswa(obs);
    });
  }

  if (Array.isArray(payload.kelulusanList)) {
    const lulusSheet = ss.getSheetByName(SHEET_KELULUSAN);
    payload.kelulusanList.forEach(function(k) {
      upsertRowByKey(lulusSheet, 0, k.noPendaftaran, [
        k.noPendaftaran || "", k.nisn || "", k.namaLengkap || "", k.asalSekolah || "",
        k.jalur || "", k.status || "", k.skorAkhir || 0, k.pesanPengumuman || "",
        k.jadwalDaftarUlang || "-", new Date().toISOString()
      ], 2);
    });
  }

  return {
    success: true,
    spreadsheetName: initRes.spreadsheetName,
    message: "Seluruh data berhasil disinkronkan ke Google Spreadsheet (" + initRes.spreadsheetName + ")!"
  };
}

function getAllDatabaseData() {
  const ss = getSpreadsheet();
  const result = {
    spreadsheetId: ss.getId(),
    spreadsheetName: ss.getName(),
    users: [],
    siswaList: [],
    otmMap: {},
    hasilOrtuMap: {},
    observasiList: [],
    wawancaraSiswaList: [],
    kelulusanList: []
  };

  // 1. Users
  const userSheet = ss.getSheetByName(SHEET_USERS);
  if (userSheet && userSheet.getLastRow() >= 2) {
    const rows = userSheet.getDataRange().getValues();
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][1]) {
        result.users.push({
          id: String(rows[i][0] || ("USR-" + i)),
          kodePendaftaran: String(rows[i][1]).trim(),
          namaSiswa: String(rows[i][2] || ""),
          namaOrangTua: String(rows[i][3] || ""),
          sekolahAsal: String(rows[i][4] || ""),
          nomorHp: String(rows[i][5] || ""),
          emailOrangTua: String(rows[i][6] || ""),
          role: String(rows[i][7] || "siswa"),
          jabatan: String(rows[i][8] || ""),
          createdAt: String(rows[i][9] || new Date().toISOString())
        });
      }
    }
  }

  // 2. Siswa
  const siswaSheet = ss.getSheetByName(SHEET_SISWA);
  if (siswaSheet && siswaSheet.getLastRow() >= 2) {
    const rows = siswaSheet.getDataRange().getValues();
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][0]) {
        const jsonCol = rows[i][22];
        if (jsonCol && String(jsonCol).trim().startsWith("{")) {
          try {
            result.siswaList.push(JSON.parse(String(jsonCol)));
            continue;
          } catch (e) {}
        }
        result.siswaList.push({
          id: "SISWA-" + i,
          noPendaftaran: String(rows[i][0]).trim(),
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
          nomorTelepon: String(rows[i][13] || ""),
          namaAyah: String(rows[i][14] || ""),
          pekerjaanAyah: String(rows[i][15] || ""),
          penghasilanAyah: String(rows[i][16] || ""),
          noHpAyah: String(rows[i][17] || ""),
          namaIbu: String(rows[i][18] || ""),
          pekerjaanIbu: String(rows[i][19] || ""),
          penghasilanIbu: String(rows[i][20] || ""),
          noHpIbu: String(rows[i][21] || ""),
          createdAt: String(rows[i][23] || new Date().toISOString())
        });
      }
    }
  }

  // 3. OTM
  const otmSheet = ss.getSheetByName(SHEET_OTM_NAME);
  if (otmSheet && otmSheet.getLastRow() >= 3) {
    const rows = otmSheet.getDataRange().getValues();
    for (let i = 2; i < rows.length; i++) {
      const noPend = String(rows[i][0] || "").trim();
      if (noPend) {
        const mapItem = {};
        for (let col = 10; col <= 44 && col < rows[i].length; col++) {
          mapItem[col] = String(rows[i][col] || "");
        }
        result.otmMap[noPend] = mapItem;
      }
    }
  }

  // 4. Hasil Wawancara Ortu
  const dbSheet = ss.getSheetByName(SHEET_DB_NAME);
  if (dbSheet && dbSheet.getLastRow() >= 2) {
    const rows = dbSheet.getDataRange().getValues();
    for (let i = 1; i < rows.length; i++) {
      const idSiswa = String(rows[i][1] || "").trim();
      if (idSiswa) {
        const jsonCol = rows[i][9];
        if (jsonCol && String(jsonCol).trim().startsWith("{")) {
          try {
            const parsed = JSON.parse(String(jsonCol));
            if (rows[i][6]) parsed.pdfUrl = String(rows[i][6]);
            result.hasilOrtuMap[idSiswa] = parsed;
            continue;
          } catch (e) {}
        }
        result.hasilOrtuMap[idSiswa] = {
          id: "HO-" + i,
          idSiswa: idSiswa,
          noPendaftaran: idSiswa,
          namaSiswa: String(rows[i][2] || ""),
          namaPanggilan: String(rows[i][3] || ""),
          sekolahAsal: "",
          namaAyah: "",
          namaIbu: "",
          namaPewawancara: String(rows[i][5] || ""),
          tanggalWawancara: String(rows[i][0] || ""),
          jsonAnswers: [],
          catatanKhusus: String(rows[i][4] || "-"),
          pdfUrl: String(rows[i][6] || ""),
          status: String(rows[i][7] || "selesai"),
          isTtdOrtuSigned: String(rows[i][8]) === "YA",
          createdAt: new Date().toISOString()
        };
      }
    }
  }

  // 5. Observasi Siswa
  const obsSheet = ss.getSheetByName(SHEET_SISWA_OBS);
  if (obsSheet && obsSheet.getLastRow() >= 2) {
    const rows = obsSheet.getDataRange().getValues();
    for (let i = 1; i < rows.length; i++) {
      const idSiswa = String(rows[i][1] || "").trim();
      if (idSiswa) {
        const jsonCol = rows[i][18];
        if (jsonCol && String(jsonCol).trim().startsWith("{")) {
          try {
            result.observasiList.push(JSON.parse(String(jsonCol)));
            continue;
          } catch (e) {}
        }
        result.observasiList.push({
          id: "OBS-" + i,
          noPendaftaran: idSiswa,
          namaSiswa: String(rows[i][2] || ""),
          namaPenguji: String(rows[i][3] || ""),
          tanggalObservasi: String(rows[i][0] || ""),
          nilaiTahsin: Number(rows[i][4] || 0),
          catatanTahsin: String(rows[i][5] || ""),
          nilaiTahfidz: Number(rows[i][6] || 0),
          juzDiuji: String(rows[i][7] || ""),
          catatanTahfidz: String(rows[i][8] || ""),
          nilaiKarakterAdab: Number(rows[i][9] || 0),
          catatanKarakterAdab: String(rows[i][10] || ""),
          nilaiAkademikDasar: Number(rows[i][11] || 0),
          catatanAkademikDasar: String(rows[i][12] || ""),
          totalSkor: Number(rows[i][13] || 0),
          rataRata: Number(rows[i][14] || 0),
          rekomendasi: String(rows[i][15] || "Diterima"),
          catatanPenguji: String(rows[i][16] || ""),
          pdfUrl: String(rows[i][17] || ""),
          createdAt: new Date().toISOString()
        });
      }
    }
  }

  // 6. Kelulusan
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
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_OTM_NAME);
  if (!sheet || sheet.getLastRow() < 3) return [];
  const data = sheet.getDataRange().getValues();

  const dbSheet = ss.getSheetByName(SHEET_DB_NAME);
  const existingMap = {};
  const statusMap = {};
  const ttdMap = {};

  if (dbSheet && dbSheet.getLastRow() > 1) {
    const dbData = dbSheet.getDataRange().getValues();
    for (let j = 1; j < dbData.length; j++) {
      let idSiswa = String(dbData[j][1]).trim();
      existingMap[idSiswa] = dbData[j][6] || null;
      statusMap[idSiswa] = dbData[j][7] || "selesai";
      ttdMap[idSiswa] = String(dbData[j][8]) === "YA";
    }
  }

  const students = [];
  for (let i = 2; i < data.length; i++) {
    if (data[i][2] || data[i][1]) {
      const idStr = String(data[i][0] || ("PD-2026-" + String(i).padStart(3, '0'))).trim();
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

  let pdfUrl = formObject.pdfUrl || "";
  const dateStr = Utilities.formatDate(new Date(), "Asia/Jakarta", "dd-MM-yyyy");
  const pdfName = "Wawancara_" + (formObject.namaSiswa || "Siswa").replace(/\s+/g, '_') + "_" + dateStr + ".pdf";

  try {
    const folder = DriveApp.getFolderById(FOLDER_ID);
    const htmlBody = createPDFTemplate(formObject, dateStr);
    const blob = Utilities.newBlob(htmlBody, MimeType.HTML).setName(pdfName);
    const pdfFile = folder.createFile(blob).getAs(MimeType.PDF);
    const savedFile = folder.createFile(pdfFile);
    savedFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    pdfUrl = savedFile.getUrl();
  } catch (e) {
    if (!pdfUrl) {
      pdfUrl = "https://docs.google.com/spreadsheets/d/" + ss.getId() + "/edit";
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
    message: "Sukses! Data tersimpan di Spreadsheet dan PDF telah dibuat.",
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

  // Update otomatis Sheet Kelulusan
  const lulusSheet = ss.getSheetByName(SHEET_KELULUSAN);
  const statusMap = {
    "Diterima": "LULUS",
    "Cadangan": "CADANGAN",
    "Tidak Diterima": "TIDAK_LULUS"
  };
  const newStatus = statusMap[data.rekomendasi] || "PROSES_SELEKSI";
  const pesan = newStatus === "LULUS"
    ? "Selamat! Berdasarkan hasil evaluasi observasi penguji siswa dan wawancara orang tua, ananda dinyatakan LULUS & DITERIMA di SMPIT PONDOK DUTA."
    : (newStatus === "CADANGAN"
      ? "Ananda berada pada posisi CADANGAN dengan nilai rata-rata " + data.rataRata + "."
      : "Mohon maaf, ananda belum memenuhi kuota penerimaan SMPIT Pondok Duta tahun ini.");

  upsertRowByKey(lulusSheet, 0, data.noPendaftaran, [
    data.noPendaftaran || "",
    data.nisn || "",
    data.namaSiswa || "",
    data.asalSekolah || "SD/MI Pendaftar",
    "Jalur Reguler / Gelombang 1",
    newStatus,
    data.rataRata || 0,
    pesan,
    newStatus === "LULUS" ? "Segera hubungi CS SMPIT (0822-2500-2011)" : "-",
    new Date().toISOString()
  ], 2);

  return { success: true, message: "Observasi Siswa & Status Kelulusan berhasil disimpan di Spreadsheet!" };
}
