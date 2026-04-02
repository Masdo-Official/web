/**
 * lib/sheets.js
 * Google Sheets API Helper Functions for Vercel Serverless
 */

const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

// Load config
const config = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), 'config.json'), 'utf8')
);

const spreadsheetId = config.googleSheets.spreadsheetId;
const SHEET_DATA_SISWA = config.googleSheets.sheets.dataSiswa;
const SHEET_ABSENSI = config.googleSheets.sheets.absensi;

let sheetsInstance = null;

/**
 * Initialize Google Sheets API
 */
async function getSheets() {
  if (sheetsInstance) {
    return sheetsInstance;
  }

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: config.googleSheets.serviceAccount,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });

    sheetsInstance = google.sheets({ version: 'v4', auth });
    return sheetsInstance;
  } catch (error) {
    console.error('Error initializing Google Sheets:', error.message);
    throw new Error('Gagal menginisialisasi Google Sheets API');
  }
}

/**
 * Get siswa data from Sheets
 */
async function getSiswaData(kodeSiswa = null) {
  try {
    const sheets = await getSheets();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${SHEET_DATA_SISWA}!A2:E`
    });

    const rows = response.data.values || [];
    let data = rows.map(row => ({
      kode_siswa: row[0] || '',
      nama: row[1] || '',
      password_hash: row[2] || '',
      jenis_kelamin: row[3] || '',
      no_telepon: row[4] || ''
    }));

    if (kodeSiswa) {
      data = data.filter(s => s.kode_siswa === kodeSiswa);
    }

    return data;
  } catch (error) {
    console.error('Error getSiswaData:', error.message);
    throw new Error('Gagal mengambil data siswa dari Google Sheets');
  }
}

/**
 * Add new siswa
 */
async function addSiswa(siswaData) {
  try {
    const sheets = await getSheets();
    const { kode_siswa, nama, password_hash, jenis_kelamin, no_telepon } = siswaData;

    const values = [[kode_siswa, nama, password_hash, jenis_kelamin, no_telepon]];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${SHEET_DATA_SISWA}!A:E`,
      valueInputOption: 'USER_ENTERED',
      resource: { values }
    });

    return true;
  } catch (error) {
    console.error('Error addSiswa:', error.message);
    throw new Error('Gagal menambahkan siswa');
  }
}

/**
 * Delete siswa
 */
async function deleteSiswa(kodeSiswa) {
  try {
    const siswaList = await getSiswaData();
    const siswaIndex = siswaList.findIndex(s => s.kode_siswa === kodeSiswa);
    
    if (siswaIndex === -1) {
      throw new Error('Siswa tidak ditemukan');
    }

    const sheets = await getSheets();
    const rowIndex = siswaIndex + 2; // +2 karena header di row 1, data mulai row 2

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      resource: {
        requests: [{
          deleteDimension: {
            range: {
              sheetId: 0, // Assuming DATA_SISWA is first sheet
              dimension: 'ROWS',
              startIndex: rowIndex - 1,
              endIndex: rowIndex
            }
          }
        }]
      }
    });

    return true;
  } catch (error) {
    console.error('Error deleteSiswa:', error.message);
    throw error;
  }
}

/**
 * Get absensi data from Sheets
 */
async function getAbsensiData(filters = {}) {
  try {
    const sheets = await getSheets();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${SHEET_ABSENSI}!A2:E`
    });

    const rows = response.data.values || [];
    let data = rows.map(row => ({
      tanggal: row[0] || '',
      kode_siswa: row[1] || '',
      nama: row[2] || '',
      status: row[3] || '',
      keterangan: row[4] || ''
    }));

    // Apply filters
    if (filters.kodeSiswa) {
      data = data.filter(item => item.kode_siswa === filters.kodeSiswa);
    }

    if (filters.tanggalMulai && filters.tanggalSelesai) {
      data = data.filter(item => 
        item.tanggal >= filters.tanggalMulai && 
        item.tanggal <= filters.tanggalSelesai
      );
    }

    if (filters.status) {
      data = data.filter(item => item.status === filters.status);
    }

    return data;
  } catch (error) {
    console.error('Error getAbsensiData:', error.message);
    throw new Error('Gagal mengambil data absensi dari Google Sheets');
  }
}

/**
 * Save absensi batch
 */
async function saveAbsensiBatch(dataAbsensi) {
  try {
    const sheets = await getSheets();
    const values = dataAbsensi.map(item => [
      item.tanggal,
      item.kode_siswa,
      item.nama,
      item.status,
      item.keterangan || ''
    ]);

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${SHEET_ABSENSI}!A:E`,
      valueInputOption: 'USER_ENTERED',
      resource: { values }
    });

    return true;
  } catch (error) {
    console.error('Error saveAbsensiBatch:', error.message);
    throw new Error('Gagal menyimpan absensi');
  }
}

/**
 * Update absensi
 */
async function updateAbsensi(tanggal, kodeSiswa, status, keterangan = '') {
  try {
    const absensiList = await getAbsensiData();
    const absensiIndex = absensiList.findIndex(
      item => item.tanggal === tanggal && item.kode_siswa === kodeSiswa
    );
    
    if (absensiIndex === -1) {
      throw new Error('Data absensi tidak ditemukan');
    }

    const sheets = await getSheets();
    const rowIndex = absensiIndex + 2;

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${SHEET_ABSENSI}!D${rowIndex}:E${rowIndex}`,
      valueInputOption: 'USER_ENTERED',
      resource: { values: [[status, keterangan]] }
    });

    return true;
  } catch (error) {
    console.error('Error updateAbsensi:', error.message);
    throw error;
  }
}

/**
 * Delete absensi
 */
async function deleteAbsensi(tanggal, kodeSiswa) {
  try {
    const absensiList = await getAbsensiData();
    const absensiIndex = absensiList.findIndex(
      item => item.tanggal === tanggal && item.kode_siswa === kodeSiswa
    );
    
    if (absensiIndex === -1) {
      throw new Error('Data absensi tidak ditemukan');
    }

    const sheets = await getSheets();
    const rowIndex = absensiIndex + 2;

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      resource: {
        requests: [{
          deleteDimension: {
            range: {
              sheetId: 1, // Assuming ABSENSI is second sheet
              dimension: 'ROWS',
              startIndex: rowIndex - 1,
              endIndex: rowIndex
            }
          }
        }]
      }
    });

    return true;
  } catch (error) {
    console.error('Error deleteAbsensi:', error.message);
    throw error;
  }
}

/**
 * Get absensi stats
 */
async function getAbsensiStats(filters = {}) {
  try {
    const data = await getAbsensiData(filters);
    
    const stats = {
      total: data.length,
      hadir: data.filter(item => item.status === 'H').length,
      izin: data.filter(item => item.status === 'I').length,
      sakit: data.filter(item => item.status === 'S').length,
      alpha: data.filter(item => item.status === 'A').length
    };

    stats.persentaseKehadiran = stats.total > 0 
      ? ((stats.hadir / stats.total) * 100).toFixed(2)
      : '0.00';

    return stats;
  } catch (error) {
    console.error('Error getAbsensiStats:', error.message);
    throw new Error('Gagal menghitung statistik absensi');
  }
}

module.exports = {
  getSheets,
  getSiswaData,
  addSiswa,
  deleteSiswa,
  getAbsensiData,
  saveAbsensiBatch,
  updateAbsensi,
  deleteAbsensi,
  getAbsensiStats
};
