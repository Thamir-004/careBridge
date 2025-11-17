const express = require('express');
const router = express.Router();
const dbManager = require('../config/db');
const logger = require('../utils/logger');

/**
 * GET /api/hospitals
 * Get all connected hospitals
 */
router.get('/', async (req, res) => {
  try {
    const hospitals = dbManager.getAllHospitals();
    
    logger.info('Retrieved all hospitals', { count: hospitals.length });
    
    res.json({
      success: true,
      count: hospitals.length,
      data: hospitals,
    });
  } catch (error) {
    logger.error('Error fetching hospitals:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve hospitals',
      error: error.message,
    });
  }
});

/**
 * GET /api/hospitals/:hospitalId
 * Get specific hospital details
 */
router.get('/:hospitalId', async (req, res) => {
  try {
    const { hospitalId } = req.params;
    
    // Check if hospital exists
    if (!dbManager.hospitalExists(hospitalId)) {
      return res.status(404).json({
        success: false,
        message: `Hospital with ID ${hospitalId} not found`,
      });
    }
    
    const hospitals = dbManager.getAllHospitals();
    const hospital = hospitals.find(h => h.id === hospitalId);
    
    logger.info(`Retrieved hospital details: ${hospitalId}`);
    
    res.json({
      success: true,
      data: hospital,
    });
  } catch (error) {
    logger.error('Error fetching hospital details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve hospital details',
      error: error.message,
    });
  }
});

/**
 * GET /api/hospitals/:hospitalId/health
 * Check health status of a specific hospital's database connection
 */
router.get('/:hospitalId/health', async (req, res) => {
  try {
    const { hospitalId } = req.params;
    
    if (!dbManager.hospitalExists(hospitalId)) {
      return res.status(404).json({
        success: false,
        message: `Hospital with ID ${hospitalId} not found`,
      });
    }
    
    const connection = dbManager.getConnection(hospitalId);
    const isConnected = connection.readyState === 1;
    
    const healthStatus = {
      hospitalId,
      status: isConnected ? 'healthy' : 'unhealthy',
      connected: isConnected,
      readyState: connection.readyState,
      readyStateText: dbManager.getConnectionState(connection.readyState),
      timestamp: new Date().toISOString(),
    };
    
    logger.info(`Health check for ${hospitalId}:`, healthStatus);
    
    res.json({
      success: true,
      data: healthStatus,
    });
  } catch (error) {
    logger.error('Error checking hospital health:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check hospital health',
      error: error.message,
    });
  }
});

/**
 * GET /api/hospitals/health/all
 * Check health status of all hospital connections
 */
router.get('/health/all', async (req, res) => {
  try {
    const healthStatuses = await dbManager.healthCheck();
    
    const allHealthy = Object.values(healthStatuses).every(h => h.connected);
    
    logger.info('System-wide health check completed', {
      totalHospitals: Object.keys(healthStatuses).length,
      allHealthy,
    });
    
    res.json({
      success: true,
      systemStatus: allHealthy ? 'healthy' : 'degraded',
      data: healthStatuses,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Error in system health check:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to perform system health check',
      error: error.message,
    });
  }
});

/**
 * GET /api/hospitals/:hospitalId/stats
 * Get statistics for a specific hospital
 */
router.get('/:hospitalId/stats', async (req, res) => {
  try {
    const { hospitalId } = req.params;
    
    if (!dbManager.hospitalExists(hospitalId)) {
      return res.status(404).json({
        success: false,
        message: `Hospital with ID ${hospitalId} not found`,
      });
    }
    
    const connection = dbManager.getConnection(hospitalId);
    
    // Get collection stats
    const collections = await connection.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    // Count documents in each collection
    const stats = {
      hospitalId,
      collections: {},
      totalCollections: collectionNames.length,
    };
    
    for (const collName of collectionNames) {
      const count = await connection.db.collection(collName).countDocuments();
      stats.collections[collName] = count;
    }
    
    logger.info(`Retrieved stats for ${hospitalId}`, stats);
    
    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error('Error fetching hospital stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve hospital statistics',
      error: error.message,
    });
  }
});

/**
 * POST /api/hospitals/:hospitalId/validate
 * Validate connection to a specific hospital
 */
router.post('/:hospitalId/validate', async (req, res) => {
  try {
    const { hospitalId } = req.params;
    
    if (!dbManager.hospitalExists(hospitalId)) {
      return res.status(404).json({
        success: false,
        message: `Hospital with ID ${hospitalId} not found`,
      });
    }
    
    const connection = dbManager.getConnection(hospitalId);
    
    // Attempt to ping the database
    await connection.db.admin().ping();
    
    logger.info(`Connection validated for ${hospitalId}`);
    
    res.json({
      success: true,
      message: `Connection to ${hospitalId} is valid and responsive`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error(`Connection validation failed for ${req.params.hospitalId}:`, error);
    res.status(500).json({
      success: false,
      message: 'Connection validation failed',
      error: error.message,
    });
  }
});

/**
 * GET /api/hospitals/:hospitalId/collections
 * List all collections in a hospital's database
 */
router.get('/:hospitalId/collections', async (req, res) => {
  try {
    const { hospitalId } = req.params;
    
    if (!dbManager.hospitalExists(hospitalId)) {
      return res.status(404).json({
        success: false,
        message: `Hospital with ID ${hospitalId} not found`,
      });
    }
    
    const connection = dbManager.getConnection(hospitalId);
    const collections = await connection.db.listCollections().toArray();
    
    const collectionList = collections.map(c => ({
      name: c.name,
      type: c.type,
    }));
    
    logger.info(`Retrieved collections for ${hospitalId}`, {
      count: collectionList.length,
    });
    
    res.json({
      success: true,
      hospitalId,
      count: collectionList.length,
      data: collectionList,
    });
  } catch (error) {
    logger.error('Error fetching collections:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve collections',
      error: error.message,
    });
  }
});

module.exports = router;