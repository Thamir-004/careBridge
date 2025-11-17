const dbManager = require('../config/database');
const logger = require('../utils/logger');

/**
 * Validate if hospital exists
 */
const validateHospitalExists = (req, res, next) => {
  try {
    const hospitalId = req.params.hospitalId || req.body.hospitalId;

    if (!hospitalId) {
      return res.status(400).json({
        success: false,
        message: 'Hospital ID is required',
      });
    }

    if (!dbManager.hospitalExists(hospitalId)) {
      return res.status(404).json({
        success: false,
        message: `Hospital ${hospitalId} not found`,
      });
    }

    req.hospitalId = hospitalId;
    next();
  } catch (error) {
    logger.error('Hospital validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Hospital validation failed',
    });
  }
};

/**
 * Validate multiple hospital IDs (for transfers)
 */
const validateMultipleHospitals = (req, res, next) => {
  try {
    const { fromHospital, toHospital } = req.body;

    if (!fromHospital || !toHospital) {
      return res.status(400).json({
        success: false,
        message: 'Both fromHospital and toHospital are required',
      });
    }

    if (fromHospital === toHospital) {
      return res.status(400).json({
        success: false,
        message: 'Source and destination hospitals must be different',
      });
    }

    if (!dbManager.hospitalExists(fromHospital)) {
      return res.status(404).json({
        success: false,
        message: `Source hospital ${fromHospital} not found`,
      });
    }

    if (!dbManager.hospitalExists(toHospital)) {
      return res.status(404).json({
        success: false,
        message: `Destination hospital ${toHospital} not found`,
      });
    }

    next();
  } catch (error) {
    logger.error('Multi-hospital validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Hospital validation failed',
    });
  }
};

/**
 * Check hospital connection health
 */
const checkHospitalConnection = async (req, res, next) => {
  try {
    const hospitalId = req.params.hospitalId || req.body.hospitalId;

    if (!hospitalId) {
      return next();
    }

    const connection = dbManager.getConnection(hospitalId);
    
    if (connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: `Hospital ${hospitalId} database is not connected`,
      });
    }

    next();
  } catch (error) {
    logger.error('Hospital connection check error:', error);
    res.status(503).json({
      success: false,
      message: 'Hospital connection check failed',
    });
  }
};

module.exports = {
  validateHospitalExists,
  validateMultipleHospitals,
  checkHospitalConnection,
};