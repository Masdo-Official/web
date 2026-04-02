/**
 * api/absensi.js
 * GET /api/absensi - Siswa absensi data (protected)
 */

const { getAbsensiData, getAbsensiStats } = require('../lib/sheets');
const { requireAuth } = require('../lib/auth');

async function handler(req, res) {
  // Only allow GET
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  try {
    // Only siswa can access their own data
    if (req.user.role !== 'siswa') {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak'
      });
    }

    const kodeSiswa = req.user.kode_siswa;
    const { tanggalMulai, tanggalSelesai, status } = req.query;

    // Build filters
    const filters = { kodeSiswa };
    if (tanggalMulai) filters.tanggalMulai = tanggalMulai;
    if (tanggalSelesai) filters.tanggalSelesai = tanggalSelesai;
    if (status) filters.status = status;

    // Get absensi data
    const absensiData = await getAbsensiData(filters);

    // Sort by date descending
    absensiData.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));

    // Get stats
    const stats = await getAbsensiStats({ kodeSiswa });

    res.status(200).json({
      success: true,
      data: {
        absensi: absensiData,
        stats: stats,
        siswa: {
          kode_siswa: req.user.kode_siswa,
          nama: req.user.nama
        }
      }
    });

  } catch (error) {
    console.error('Error get siswa absensi:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Gagal mengambil data absensi'
    });
  }
}

module.exports = requireAuth(handler);
