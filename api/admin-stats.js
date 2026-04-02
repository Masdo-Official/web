/**
 * api/admin-stats.js
 * GET /api/admin-stats - Admin dashboard statistics (protected)
 */

const { getSiswaData, getAbsensiStats } = require('../lib/sheets');
const { requireAdmin } = require('../lib/auth');

async function handler(req, res) {
  // Only allow GET
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  try {
    const siswaList = await getSiswaData();
    const today = new Date().toISOString().split('T')[0];
    
    const statsToday = await getAbsensiStats({ 
      tanggalMulai: today, 
      tanggalSelesai: today 
    });

    const statsAll = await getAbsensiStats({});

    res.status(200).json({
      success: true,
      data: {
        totalSiswa: siswaList.length,
        absensiHariIni: statsToday,
        absensiKeseluruhan: statsAll
      }
    });

  } catch (error) {
    console.error('Error get admin stats:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Gagal mengambil statistik'
    });
  }
}

module.exports = requireAdmin(handler);
