/**
 * lib/auth.js
 * JWT & Bcrypt Authentication Utilities for Vercel Serverless
 */

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// Load config
const fs = require('fs');
const path = require('path');
const config = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), 'config.json'), 'utf8')
);

const JWT_SECRET = config.security.jwtSecret;
const JWT_EXPIRY = config.security.jwtExpiry;
const BCRYPT_ROUNDS = config.security.bcryptRounds;

/**
 * Generate JWT token
 */
function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

/**
 * Verify JWT token
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

/**
 * Hash password with bcrypt
 */
async function hashPassword(password) {
  return await bcrypt.hash(password, BCRYPT_ROUNDS);
}

/**
 * Verify password with bcrypt
 */
async function verifyPassword(password, hash) {
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    return false;
  }
}

/**
 * Extract token from Authorization header
 */
function extractToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}

/**
 * Middleware: Verify JWT from request
 */
function requireAuth(handler) {
  return async (req, res) => {
    const token = extractToken(req);
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token tidak ditemukan'
      });
    }

    const decoded = verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Token tidak valid atau sudah kadaluarsa'
      });
    }

    // Attach user to request
    req.user = decoded;
    
    return handler(req, res);
  };
}

/**
 * Middleware: Require admin role
 */
function requireAdmin(handler) {
  return requireAuth(async (req, res) => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak. Admin only.'
      });
    }
    
    return handler(req, res);
  });
}

module.exports = {
  generateToken,
  verifyToken,
  hashPassword,
  verifyPassword,
  extractToken,
  requireAuth,
  requireAdmin
};
