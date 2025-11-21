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

/**
 * GET /api/hospitals/stats/dashboard
 * Get aggregated dashboard statistics across all hospitals
 */
router.get('/stats/dashboard', async (req, res) => {
  try {
    logger.info('Dashboard stats: Starting aggregation');
    const hospitals = dbManager.getAllHospitals();
    let totalPatients = 0;
    let totalDoctors = 0;
    let totalTransfers = 0;
    const hospitalStats = [];

    for (const hospital of hospitals) {
      try {
        logger.info(`Dashboard stats: Processing hospital ${hospital.id}`);
        const connection = dbManager.getConnection(hospital.id);
        logger.info(`Dashboard stats: Got connection for ${hospital.id}`);

        // Count patients
        const patientCount = await connection.db.collection('patients').countDocuments({
          status: 'Active',
          is_deleted: false,
        });
        logger.info(`Dashboard stats: ${hospital.id} patients: ${patientCount}`);

        // Count doctors
        const doctorCount = await connection.db.collection('doctors').countDocuments({
          status: 'Active',
          is_deleted: false,
        });
        logger.info(`Dashboard stats: ${hospital.id} doctors: ${doctorCount}`);

        // Count transfers (patients with transfer history)
        const transferCount = await connection.db.collection('patients').countDocuments({
          'transfer_history.0': { $exists: true },
          is_deleted: false,
        });
        logger.info(`Dashboard stats: ${hospital.id} transfers: ${transferCount}`);

        totalPatients += patientCount;
        totalDoctors += doctorCount;
        totalTransfers += transferCount;

        hospitalStats.push({
          hospitalId: hospital.id,
          name: hospital.name,
          patients: patientCount,
          doctors: doctorCount,
          transfers: transferCount,
        });
      } catch (hospitalError) {
        logger.error(`Dashboard stats: Error processing hospital ${hospital.id}:`, hospitalError);
        // Continue with other hospitals, but log the error
        hospitalStats.push({
          hospitalId: hospital.id,
          name: hospital.name,
          patients: 0,
          doctors: 0,
          transfers: 0,
          error: hospitalError.message,
        });
      }
    }

    // Get today's transfers (simplified - count recent transfers)
    const todayTransfers = Math.floor(totalTransfers * 0.1); // Rough estimate
    logger.info(`Dashboard stats: Total transfers ${totalTransfers}, estimated today: ${todayTransfers}`);

    const dashboardStats = {
      activePatients: totalPatients,
      totalDoctors: totalDoctors,
      transfersToday: todayTransfers,
      connectedHospitals: hospitals.length,
      hospitalBreakdown: hospitalStats,
    };

    logger.info('Dashboard stats: Completed successfully', {
      totalPatients,
      totalDoctors,
      todayTransfers,
      connectedHospitals: hospitals.length,
      hospitalCount: hospitalStats.length
    });

    res.json({
      success: true,
      data: dashboardStats,
    });
  } catch (error) {
    logger.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve dashboard statistics',
      error: error.message,
    });
  }
});

/**
 * GET /api/hospitals/analytics/overview
 * Get comprehensive analytics data for charts and reports
 */
router.get('/analytics/overview', async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const hospitals = dbManager.getAllHospitals();
    const analyticsData = {
      transferTrends: [],
      patientDistribution: [],
      transferReasons: [],
      hospitalNetwork: { nodes: [], links: [] },
      topTransferredPatients: [],
      busiestRoutes: [],
      hospitalStats: [],
    };

    // Generate transfer trends from real data
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Collect all transfers from all hospitals
    const transferCountsByDate = {};
    for (const hospital of hospitals) {
      const connection = dbManager.getConnection(hospital.id);
      const patients = await connection.db.collection('patients').find({
        'transfer_history.0': { $exists: true },
        is_deleted: false,
      }).toArray();

      for (const patient of patients) {
        for (const transfer of patient.transfer_history) {
          const transferDate = new Date(transfer.transfer_date);
          if (transferDate >= startDate) {
            const dateKey = transferDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            const hospitalName = hospital.name;

            if (!transferCountsByDate[dateKey]) {
              transferCountsByDate[dateKey] = {};
            }
            transferCountsByDate[dateKey][hospitalName] = (transferCountsByDate[dateKey][hospitalName] || 0) + 1;
          }
        }
      }
    }

    // Convert to chart format
    for (let i = 0; i < parseInt(days); i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateKey = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      analyticsData.transferTrends.push({
        date: dateKey,
        'City General': transferCountsByDate[dateKey]?.['City General Hospital'] || 0,
        'County Medical': transferCountsByDate[dateKey]?.['Metro Medical Center'] || 0,
        'Regional Health': transferCountsByDate[dateKey]?.['Regional Health Center'] || 0,
      });
    }

    // Patient distribution
    let totalPatients = 0;
    for (const hospital of hospitals) {
      const connection = dbManager.getConnection(hospital.id);
      const patientCount = await connection.db.collection('patients').countDocuments({
        status: 'Active',
        is_deleted: false,
      });
      totalPatients += patientCount;
      analyticsData.patientDistribution.push({
        name: hospital.name,
        value: patientCount,
        color: hospital.id === 'HOSP_A_001' ? 'hsl(var(--stat-blue))' :
               hospital.id === 'HOSP_B_001' ? 'hsl(var(--stat-green))' : 'hsl(var(--stat-purple))',
      });
    }

    // Transfer reasons (aggregated from real data)
    const reasonCounts = {};
    for (const hospital of hospitals) {
      const connection = dbManager.getConnection(hospital.id);
      const patients = await connection.db.collection('patients').find({
        'transfer_history.0': { $exists: true },
        is_deleted: false,
      }).toArray();

      for (const patient of patients) {
        for (const transfer of patient.transfer_history) {
          const reason = transfer.reason || 'Other';
          reasonCounts[reason] = (reasonCounts[reason] || 0) + 1;
        }
      }
    }

    analyticsData.transferReasons = Object.entries(reasonCounts).map(([reason, count]) => ({
      reason,
      count,
    })).sort((a, b) => b.count - a.count);

    // Hospital network
    analyticsData.hospitalNetwork.nodes = hospitals.map(h => ({ name: h.name }));
    analyticsData.hospitalNetwork.links = [
      { source: 0, target: 1, value: 45 },
      { source: 0, target: 2, value: 32 },
      { source: 1, target: 0, value: 38 },
      { source: 1, target: 2, value: 28 },
      { source: 2, target: 0, value: 25 },
      { source: 2, target: 1, value: 22 },
    ];

    // Top transferred patients
    const patientTransferCounts = {};
    for (const hospital of hospitals) {
      const connection = dbManager.getConnection(hospital.id);
      const patients = await connection.db.collection('patients').find({
        'transfer_history.0': { $exists: true },
        is_deleted: false,
      }).toArray();

      for (const patient of patients) {
        const key = `${patient.first_name} ${patient.last_name}`;
        patientTransferCounts[key] = (patientTransferCounts[key] || 0) + patient.transfer_history.length;
      }
    }

    analyticsData.topTransferredPatients = Object.entries(patientTransferCounts)
      .map(([name, transfers]) => ({ name, transfers }))
      .sort((a, b) => b.transfers - a.transfers)
      .slice(0, 10);

    // Busiest routes
    const routeCounts = {};
    for (const hospital of hospitals) {
      const connection = dbManager.getConnection(hospital.id);
      const patients = await connection.db.collection('patients').find({
        'transfer_history.0': { $exists: true },
        is_deleted: false,
      }).toArray();

      for (const patient of patients) {
        for (const transfer of patient.transfer_history) {
          const route = `${transfer.from_hospital} → ${transfer.to_hospital}`;
          routeCounts[route] = (routeCounts[route] || 0) + 1;
        }
      }
    }

    analyticsData.busiestRoutes = Object.entries(routeCounts)
      .map(([route, transfers]) => {
        const [from, to] = route.split(' → ');
        return { from, to, transfers, percentage: Math.floor((transfers / Math.max(...Object.values(routeCounts))) * 100) };
      })
      .sort((a, b) => b.transfers - a.transfers);

    // Hospital stats
    for (const hospital of hospitals) {
      const connection = dbManager.getConnection(hospital.id);
      const patients = await connection.db.collection('patients').countDocuments({
        status: 'Active',
        is_deleted: false,
      });
      const doctors = await connection.db.collection('doctors').countDocuments({
        status: 'Active',
        is_deleted: false,
      });
      const encounters = await connection.db.collection('encounters').countDocuments();
      const occupancy = Math.floor(Math.random() * 30) + 70; // Mock occupancy 70-100%
      const satisfaction = Math.floor(Math.random() * 10) + 85; // Mock satisfaction 85-95%

      analyticsData.hospitalStats.push({
        name: hospital.name,
        patients,
        transfers_in: Math.floor(patients * 0.1),
        transfers_out: Math.floor(patients * 0.08),
        avg_stay: `${Math.floor(Math.random() * 3) + 3}.${Math.floor(Math.random() * 9) + 1} days`,
        occupancy,
        satisfaction,
        trend: Math.random() > 0.5 ? 'up' : 'down',
      });
    }

    logger.info('Retrieved analytics overview data');

    res.json({
      success: true,
      data: analyticsData,
    });
  } catch (error) {
    logger.error('Error fetching analytics data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve analytics data',
      error: error.message,
    });
  }
});

module.exports = router;