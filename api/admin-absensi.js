/**
 * api/admin-absensi.js
 * GET/POST/PUT/DELETE /api/admin-absensi - Admin CRUD absensi (protected)
 */

const { 
  getAbsensiData, 
  saveAbsensiBatch, 
  updateAbsensi, 
  deleteAbsensi 
} = require('../lib/sheets');
const { requireAdmin } = require('../lib/auth');

async function handler(req, res) {
  const { method } = req;

  try {
    // GET - Get all absensi data
    if (method === 'GET') {
      const { tanggalMulai, tanggalSelesai, status } = req.query;

      const filters = {};
      if (tanggalMulai) filters.tanggalMulai = tanggalMulai;
      if (tanggalSelesai) filters.tanggalSelesai = tanggalSelesai;
      if (status) filters.status = status;

      const absensiData = await getAbsensiData(filters);

      // Sort by date descending
      absensiData.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));

      return res.status(200).json({
        success: true,
        data: absensiData
      });
    }

    // POST - Save new absensi batch
    if (method === 'POST') {
      const { tanggal, dataAbsensi } = req.body;

      if (!tanggal || !Array.isArray(dataAbsensi) || dataAbsensi.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Tanggal dan data absensi wajib diisi'
        });
      }

      // Format data
      const formattedData = dataAbsensi.map(item => ({
        tanggal,
        kode_siswa: item.kode_siswa,
        nama: item.nama,
        status: item.status,
        keterangan: item.keterangan || ''
      }));

      await saveAbsensiBatch(formattedData);

      return res.status(201).json({
        success: true,
        message: `Absensi untuk ${dataAbsensi.length} siswa berhasil disimpan`
      });
    }

    // PUT - Update absensi
    if (method === 'PUT') {
      const { tanggal, kode_siswa, status, keterangan } = req.body;

      if (!tanggal || !kode_siswa || !status) {
        return res.status(400).json({
          success: false,
          message: 'Tanggal, kode siswa, dan status wajib diisi'
        });
      }

      await updateAbsensi(tanggal, kode_siswa, status, keterangan);

      return res.status(200).json({
        success: true,
        message: 'Absensi berhasil diupdate'
      });
    }

    // DELETE - Delete absensi
    if (method === 'DELETE') {
      const { tanggal, kode_siswa } = req.body;

      if (!tanggal || !kode_siswa) {
        return res.status(400).json({
          success: false,
          message: 'Tanggal dan kode siswa wajib diisi'
        });
      }

      await deleteAbsensi(tanggal, kode_siswa);

      return res.status(200).json({
        success: true,
        message: 'Absensi berhasil dihapus'
      });
    }

    // Method not allowed
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });

  } catch (error) {
    console.error('Error admin absensi:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Gagal memproses data absensi'
    });
  }
}

module.exports = requireAdmin(handler);
