/**
 * api/login.js
 * POST /api/login - Siswa login endpoint
 */

const { getSiswaData } = require('../lib/sheets');
const { verifyPassword, generateToken } = require('../lib/auth');

module.exports = async (req, res) => {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  try {
    const { kode_siswa, password } = req.body;

    // Validation
    if (!kode_siswa || !password) {
      return res.status(400).json({
        success: false,
        message: 'Kode siswa dan password wajib diisi'
      });
    }

    // Get siswa data
    const siswaList = await getSiswaData(kode_siswa);
    
    if (siswaList.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Kode siswa atau password salah'
      });
    }

    const siswa = siswaList[0];

    // Verify password
    const isPasswordValid = await verifyPassword(password, siswa.password_hash);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Kode siswa atau password salah'
      });
    }

    // Generate token
    const token = generateToken({
      kode_siswa: siswa.kode_siswa,
      nama: siswa.nama,
      role: 'siswa'
    });

    // Return success
    res.status(200).json({
      success: true,
      message: 'Login berhasil',
      data: {
        token,
        user: {
          kode_siswa: siswa.kode_siswa,
          nama: siswa.nama,
          jenis_kelamin: siswa.jenis_kelamin,
          no_telepon: siswa.no_telepon,
          role: 'siswa'
        }
      }
    });

  } catch (error) {
    console.error('Error login siswa:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal melakukan login'
    });
  }
};
