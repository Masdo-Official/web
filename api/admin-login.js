/**
 * api/admin-login.js
 * POST /api/admin-login - Admin login endpoint
 */

const fs = require('fs');
const path = require('path');
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
    const { username, password } = req.body;

    // Validation
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username dan password wajib diisi'
      });
    }

    // Load config
    const config = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), 'config.json'), 'utf8')
    );

    const adminUsername = config.security.adminCredentials.username;
    const adminPasswordHash = config.security.adminCredentials.passwordHash;

    // Check username
    if (username !== adminUsername) {
      return res.status(401).json({
        success: false,
        message: 'Username atau password salah'
      });
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, adminPasswordHash);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Username atau password salah'
      });
    }

    // Generate token
    const token = generateToken({
      username: adminUsername,
      role: 'admin'
    });

    // Return success
    res.status(200).json({
      success: true,
      message: 'Login admin berhasil',
      data: {
        token,
        user: {
          username: adminUsername,
          role: 'admin'
        }
      }
    });

  } catch (error) {
    console.error('Error login admin:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal melakukan login admin'
    });
  }
};
