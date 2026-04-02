/**
 * api/admin-login.js
 * POST /api/admin-login - Admin login endpoint
 */

const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

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
    const configPath = path.join(process.cwd(), 'config.json');
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

    const adminUsername = config.security.adminCredentials.username;
    const adminPasswordHash = config.security.adminCredentials.passwordHash;
    const jwtSecret = config.security.jwtSecret;
    const jwtExpiry = config.security.jwtExpiry;

    console.log('[Admin Login] Username attempt:', username);
    console.log('[Admin Login] Expected username:', adminUsername);

    // Check username
    if (username !== adminUsername) {
      console.log('[Admin Login] Username mismatch');
      return res.status(401).json({
        success: false,
        message: 'Username atau password salah'
      });
    }

    // Verify password with bcrypt directly
    console.log('[Admin Login] Verifying password...');
    const isPasswordValid = await bcrypt.compare(password, adminPasswordHash);
    
    console.log('[Admin Login] Password valid:', isPasswordValid);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Username atau password salah'
      });
    }

    // Generate token
    const token = jwt.sign(
      {
        username: adminUsername,
        role: 'admin'
      },
      jwtSecret,
      { expiresIn: jwtExpiry }
    );

    console.log('[Admin Login] Login successful');

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
    console.error('[Admin Login] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal melakukan login admin: ' + error.message
    });
  }
};
