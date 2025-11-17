const { validatePatient: validatePatientData } = require('../utils/validator');
const logger = require('../utils/logger');

/**
 * Middleware to validate patient data in request body
 */
const validatePatient = (req, res, next) => {
  try {
    const validation = validatePatientData(req.body);

    if (!validation.valid) {
      logger.warn('Patient validation failed:', validation.errors);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors,
      });
    }

    next();
  } catch (error) {
    logger.error('Patient validation middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Validation error',
      error: error.message,
    });
  }
};

module.exports = {
  validatePatient,
};