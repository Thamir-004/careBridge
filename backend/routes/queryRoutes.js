const express = require('express');
const router = express.Router();
const dbManager = require('../config/db');
const logger = require('../utils/logger');

/**
 * GET /api/analytics/overview
 * Get comprehensive analytics data for charts and reports
 * Query parameters:
 * - hospital: (optional) Filter data for specific hospital ID
 * - days: (optional) Number of days for trends (default: 30)
 */
router.get('/queries/analytics/overview', async (req, res) => {
  try {
    const { hospital, days = 30 } = req.query;
    const hospitals = dbManager.getAllHospitals();

    // Filter hospitals if hospital parameter is provided
    const targetHospitals = hospital
      ? hospitals.filter(h => h.id === hospital)
      : hospitals;

    // If hospital specified but not found, return 404
    if (hospital && targetHospitals.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Hospital with ID ${hospital} not found`,
      });
    }

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

    // Collect all transfers from target hospitals
    const transferCountsByDate = {};
    for (const hosp of targetHospitals) {
      const connection = dbManager.getConnection(hosp.id);
      const patients = await connection.db.collection('patients').find({
        'transfer_history.0': { $exists: true },
        is_deleted: false,
      }).toArray();

      for (const patient of patients) {
        for (const transfer of patient.transfer_history) {
          const transferDate = new Date(transfer.transfer_date);
          if (transferDate >= startDate) {
            const dateKey = transferDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            const hospitalName = hosp.name;

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
    for (const hosp of targetHospitals) {
      const connection = dbManager.getConnection(hosp.id);
      const patientCount = await connection.db.collection('patients').countDocuments({
        status: 'Active',
        is_deleted: false,
      });
      totalPatients += patientCount;
      analyticsData.patientDistribution.push({
        name: hosp.name,
        value: patientCount,
        color: hosp.id === 'HOSP_A_001' ? 'hsl(var(--stat-blue))' :
               hosp.id === 'HOSP_B_001' ? 'hsl(var(--stat-green))' : 'hsl(var(--stat-purple))',
      });
    }

    // Transfer reasons (aggregated from real data)
    const reasonCounts = {};
    for (const hosp of targetHospitals) {
      const connection = dbManager.getConnection(hosp.id);
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

    // Hospital network - only include target hospitals
    analyticsData.hospitalNetwork.nodes = targetHospitals.map(h => ({ name: h.name }));

    // For links, if single hospital, no links; if multiple, use existing logic but filtered
    if (targetHospitals.length > 1) {
      analyticsData.hospitalNetwork.links = [
        { source: 0, target: 1, value: 45 },
        { source: 0, target: 2, value: 32 },
        { source: 1, target: 0, value: 38 },
        { source: 1, target: 2, value: 28 },
        { source: 2, target: 0, value: 25 },
        { source: 2, target: 1, value: 22 },
      ].filter(link => link.source < targetHospitals.length && link.target < targetHospitals.length);
    }

    // Top transferred patients
    const patientTransferCounts = {};
    for (const hosp of targetHospitals) {
      const connection = dbManager.getConnection(hosp.id);
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
    for (const hosp of targetHospitals) {
      const connection = dbManager.getConnection(hosp.id);
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
    for (const hosp of targetHospitals) {
      const connection = dbManager.getConnection(hosp.id);
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
        name: hosp.name,
        patients,
        transfers_in: Math.floor(patients * 0.1),
        transfers_out: Math.floor(patients * 0.08),
        avg_stay: `${Math.floor(Math.random() * 3) + 3}.${Math.floor(Math.random() * 9) + 1} days`,
        occupancy,
        satisfaction,
        trend: Math.random() > 0.5 ? 'up' : 'down',
      });
    }

    logger.info('Retrieved analytics overview data', {
      hospital: hospital || 'all',
      hospitalCount: targetHospitals.length
    });

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