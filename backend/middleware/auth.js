const jwt = require('jsonwebtoken');
const { verifyToken } = require('@clerk/clerk-sdk-node');
const logger = require('../utils/logger');

/**
 * Verify JWT token (supports both Clerk and legacy JWT)
 */
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required',
      });
    }

    // Try Clerk token first
    try {
      const payload = await verifyToken(token, {
        secretKey: process.env.CLERK_SECRET_KEY,
      });
      req.user = {
        id: payload.sub,
        email: payload.email,
        roles: payload.roles || ['user'],
      };
      return next();
    } catch (clerkError) {
      // If Clerk fails, try legacy JWT
      jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
        if (err) {
          return res.status(403).json({
            success: false,
            message: 'Invalid or expired token',
          });
        }

        req.user = user;
        next();
      });
    }
  } catch (error) {
    logger.error('Authentication error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication failed',
    });
  }
};

/**
 * Optional authentication (allow both authenticated and unauthenticated)
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      try {
        // Try Clerk token first
        const payload = await verifyToken(token, {
          secretKey: process.env.CLERK_SECRET_KEY,
        });
        req.user = {
          id: payload.sub,
          email: payload.email,
          roles: payload.roles || ['user'],
        };
      } catch (clerkError) {
        // Try legacy JWT
        jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
          if (!err) {
            req.user = user;
          }
        });
      }
    }

    next();
  } catch (error) {
    next();
  }
};

/**
 * Check if user has specific role
 */
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const userRoles = Array.isArray(req.user.roles) ? req.user.roles : [req.user.role];
    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    const hasRole = userRoles.some(role => allowedRoles.includes(role));

    if (!hasRole) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
      });
    }

    next();
  };
};

/**
 * Generate JWT token
 */
const generateToken = (payload, expiresIn = '7d') => {
  return jwt.sign(payload, process.env.JWT_SECRET || 'your-secret-key', { expiresIn });
};

module.exports = {
  authenticateToken,
  optionalAuth,
  requireRole,
  generateToken,
};