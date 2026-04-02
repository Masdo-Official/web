/**
 * api/config.js
 * GET /api/config - Public configuration endpoint
 */

const fs = require('fs');
const path = require('path');

module.exports = async (req, res) => {
  // Only allow GET
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  try {
    // Load config
    const config = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), 'config.json'), 'utf8')
    );

    // Return public config only (exclude sensitive data)
    const publicConfig = {
      app: config.app,
      profil: config.profil,
      sosmed: config.sosmed,
      projects: config.projects,
      ui: config.ui
    };

    res.status(200).json({
      success: true,
      data: publicConfig
    });

  } catch (error) {
    console.error('Error loading config:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal memuat konfigurasi'
    });
  }
};
