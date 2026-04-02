/**
 * api/admin-siswa.js
 * GET/POST/DELETE /api/admin-siswa - Admin CRUD siswa (protected)
 */

const { getSiswaData, addSiswa, deleteSiswa } = require('../lib/sheets');
const { requireAdmin, hashPassword } = require('../lib/auth');

async function handler(req, res) {
  const { method } = req;

  try {
    // GET - List all siswa
    if (method === 'GET') {
      const siswaList = await getSiswaData();
      
      // Remove password_hash from response
      const sanitizedList = siswaList.map(s => ({
        kode_siswa: s.kode_siswa,
        nama: s.nama,
        jenis_kelamin: s.jenis_kelamin,
        no_telepon: s.no_telepon
      }));

      return res.status(200).json({
        success: true,
        data: sanitizedList
      });
    }

    // POST - Add new siswa
    if (method === 'POST') {
      const { kode_siswa, nama, password, jenis_kelamin, no_telepon } = req.body;

      // Validation
      if (!kode_siswa || !nama || !password) {
        return res.status(400).json({
          success: false,
          message: 'Kode siswa, nama, dan password wajib diisi'
        });
      }

      // Check if siswa already exists
      const existing = await getSiswaData(kode_siswa);
      if (existing.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Kode siswa sudah terdaftar'
        });
      }

      // Hash password
      const password_hash = await hashPassword(password);

      // Add siswa
      await addSiswa({
        kode_siswa,
        nama,
        password_hash,
        jenis_kelamin: jenis_kelamin || '',
        no_telepon: no_telepon || ''
      });

      return res.status(201).json({
        success: true,
        message: 'Siswa berhasil ditambahkan'
      });
    }

    // DELETE - Delete siswa
    if (method === 'DELETE') {
      const { kode_siswa } = req.body;

      if (!kode_siswa) {
        return res.status(400).json({
          success: false,
          message: 'Kode siswa wajib diisi'
        });
      }

      await deleteSiswa(kode_siswa);

      return res.status(200).json({
        success: true,
        message: 'Siswa berhasil dihapus'
      });
    }

    // Method not allowed
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });

  } catch (error) {
    console.error('Error admin siswa:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Gagal memproses data siswa'
    });
  }
}

module.exports = requireAdmin(handler);
