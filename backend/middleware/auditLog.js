const logger = require('../utils/logger');

/**
 * Log all API requests
 */
const logRequest = (req, res, next) => {
  const startTime = Date.now();

  // Log response after it's sent
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    
    logger.logAudit('API_REQUEST', req.user?.userId || 'anonymous', req.hospitalId, {
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });
  });

  next();
};

/**
 * Log data access
 */
const logDataAccess = (action) => {
  return (req, res, next) => {
    const originalJson = res.json;

    res.json = function(data) {
      // Only log successful requests
      if (data.success !== false) {
        logger.logAudit(
          `DATA_${action.toUpperCase()}`,
          req.user?.userId || 'system',
          req.hospitalId || 'N/A',
          {
            action,
            resourceId: req.params.patientId || req.params.doctorId || req.params.id,
            method: req.method,
            path: req.originalUrl,
          }
        );
      }

      return originalJson.call(this, data);
    };

    next();
  };
};

/**
 * Log transfer operations
 */
const logTransfer = (req, res, next) => {
  const originalJson = res.json;

  res.json = function(data) {
    if (data.success) {
      logger.logAudit(
        'TRANSFER_OPERATION',
        req.user?.userId || req.body.transferredBy || 'system',
        req.body.fromHospital,
        {
          transferId: data.transferId,
          fromHospital: req.body.fromHospital,
          toHospital: req.body.toHospital,
          resourceType: req.body.patientId ? 'patient' : 'records',
          resourceId: req.body.patientId,
          reason: req.body.reason,
        }
      );
    }

    return originalJson.call(this, data);
  };

  next();
};

/**
 * Log authentication attempts
 */
const logAuth = (success) => {
  return (req, res, next) => {
    logger.logAudit(
      'AUTH_ATTEMPT',
      req.body.email || req.body.userId || 'unknown',
      'N/A',
      {
        success,
        method: req.method,
        path: req.originalUrl,
        ip: req.ip,
      }
    );

    next();
  };
};

/**
 * Log sensitive operations (delete, update)
 */
const logSensitiveOperation = (operationType) => {
  return (req, res, next) => {
    const originalJson = res.json;

    res.json = function(data) {
      if (data.success !== false) {
        logger.logAudit(
          `SENSITIVE_${operationType.toUpperCase()}`,
          req.user?.userId || 'system',
          req.hospitalId || 'N/A',
          {
            operation: operationType,
            resourceType: req.baseUrl.split('/').pop(),
            resourceId: req.params.id || req.params.patientId || req.params.doctorId,
            permanent: req.query.permanent === 'true',
          }
        );
      }

      return originalJson.call(this, data);
    };

    next();
  };
};

module.exports = {
  logRequest,
  logDataAccess,
  logTransfer,
  logAuth,
  logSensitiveOperation,
};