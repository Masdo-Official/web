/**
 * api/admin-export.js
 * GET /api/admin-export - Export absensi data to CSV (protected)
 */

const { getAbsensiData } = require('../lib/sheets');
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
    const { format = 'json', tanggalMulai, tanggalSelesai } = req.query;

    const filters = {};
    if (tanggalMulai) filters.tanggalMulai = tanggalMulai;
    if (tanggalSelesai) filters.tanggalSelesai = tanggalSelesai;

    const absensiData = await getAbsensiData(filters);

    if (format === 'csv') {
      // Generate CSV
      const headers = 'Tanggal,Kode Siswa,Nama,Status,Keterangan\n';
      const rows = absensiData.map(item => 
        `${item.tanggal},${item.kode_siswa},${item.nama},${item.status},${item.keterangan}`
      ).join('\n');

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename=absensi_export.csv');
      return res.send(headers + rows);
    } else {
      // Return JSON
      return res.status(200).json({
        success: true,
        data: absensiData,
        metadata: {
          totalRecords: absensiData.length,
          exportedAt: new Date().toISOString(),
          filters
        }
      });
    }

  } catch (error) {
    console.error('Error export data:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal export data'
    });
  }
}

module.exports = requireAdmin(handler);
