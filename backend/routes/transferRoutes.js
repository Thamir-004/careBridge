const express = require('express');
const router = express.Router();
const transferService = require('../services/TransferService');
const logger = require('../utils/logger');

/**
 * POST /api/transfer/patient
 * Transfer a patient from one hospital to another
 */
router.post('/patient', async (req, res) => {
  try {
    const {
      patientId,
      fromHospital,
      toHospital,
      reason,
      transferredBy,
      includeFullHistory = true,
    } = req.body;

    // Validation
    if (!patientId || !fromHospital || !toHospital) {
      return res.status(400).json({
        success: false,
        message: 'patientId, fromHospital, and toHospital are required',
      });
    }

    if (fromHospital === toHospital) {
      return res.status(400).json({
        success: false,
        message: 'Source and destination hospitals must be different',
      });
    }

    logger.info('Initiating patient transfer', {
      patientId,
      fromHospital,
      toHospital,
    });

    const result = await transferService.transferPatient({
      patientId,
      fromHospital,
      toHospital,
      reason,
      transferredBy,
      includeFullHistory,
    });

    logger.info('Patient transfer completed successfully', {
      patientId,
      transferId: result.transferId,
    });

    res.status(200).json({
      success: true,
      message: 'Patient transferred successfully',
      data: result,
    });
  } catch (error) {
    logger.error('Patient transfer failed:', error);
    res.status(500).json({
      success: false,
      message: 'Patient transfer failed',
      error: error.message,
    });
  }
});

/**
 * POST /api/transfer/records
 * Transfer specific medical records only (not the entire patient)
 */
router.post('/records', async (req, res) => {
  try {
    const {
      patientId,
      fromHospital,
      toHospital,
      recordTypes, // ['encounters', 'labs', 'prescriptions']
      transferredBy,
    } = req.body;

    if (!patientId || !fromHospital || !toHospital || !recordTypes) {
      return res.status(400).json({
        success: false,
        message: 'patientId, fromHospital, toHospital, and recordTypes are required',
      });
    }

    logger.info('Initiating record transfer', {
      patientId,
      fromHospital,
      toHospital,
      recordTypes,
    });

    const result = await transferService.transferRecords({
      patientId,
      fromHospital,
      toHospital,
      recordTypes,
      transferredBy,
    });

    res.status(200).json({
      success: true,
      message: 'Records transferred successfully',
      data: result,
    });
  } catch (error) {
    logger.error('Record transfer failed:', error);
    res.status(500).json({
      success: false,
      message: 'Record transfer failed',
      error: error.message,
    });
  }
});

/**
 * GET /api/transfer/history/:patientId
 * Get complete transfer history for a patient across all hospitals
 */
router.get('/history/:patientId', async (req, res) => {
  try {
    const { patientId } = req.params;

    const history = await transferService.getTransferHistory(patientId);

    logger.info(`Retrieved transfer history for patient ${patientId}`, {
      count: history.length,
    });

    res.json({
      success: true,
      patientId,
      count: history.length,
      data: history,
    });
  } catch (error) {
    logger.error('Error fetching transfer history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve transfer history',
      error: error.message,
    });
  }
});

/**
 * GET /api/transfer/pending/:hospitalId
 * Get all pending transfer requests for a hospital
 */
router.get('/pending/:hospitalId', async (req, res) => {
  try {
    const { hospitalId } = req.params;

    const pendingTransfers = await transferService.getPendingTransfers(hospitalId);

    logger.info(`Retrieved pending transfers for ${hospitalId}`, {
      count: pendingTransfers.length,
    });

    res.json({
      success: true,
      hospitalId,
      count: pendingTransfers.length,
      data: pendingTransfers,
    });
  } catch (error) {
    logger.error('Error fetching pending transfers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve pending transfers',
      error: error.message,
    });
  }
});

/**
 * POST /api/transfer/approve
 * Approve a pending transfer request
 */
router.post('/approve', async (req, res) => {
  try {
    const { transferId, approvedBy, notes } = req.body;

    if (!transferId || !approvedBy) {
      return res.status(400).json({
        success: false,
        message: 'transferId and approvedBy are required',
      });
    }

    const result = await transferService.approveTransfer({
      transferId,
      approvedBy,
      notes,
    });

    logger.info(`Transfer approved: ${transferId}`, { approvedBy });

    res.json({
      success: true,
      message: 'Transfer approved successfully',
      data: result,
    });
  } catch (error) {
    logger.error('Error approving transfer:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve transfer',
      error: error.message,
    });
  }
});

/**
 * POST /api/transfer/reject
 * Reject a pending transfer request
 */
router.post('/reject', async (req, res) => {
  try {
    const { transferId, rejectedBy, reason } = req.body;

    if (!transferId || !rejectedBy || !reason) {
      return res.status(400).json({
        success: false,
        message: 'transferId, rejectedBy, and reason are required',
      });
    }

    const result = await transferService.rejectTransfer({
      transferId,
      rejectedBy,
      reason,
    });

    logger.info(`Transfer rejected: ${transferId}`, { rejectedBy });

    res.json({
      success: true,
      message: 'Transfer rejected',
      data: result,
    });
  } catch (error) {
    logger.error('Error rejecting transfer:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject transfer',
      error: error.message,
    });
  }
});

/**
 * GET /api/transfer/stats/:hospitalId
 * Get transfer statistics for a hospital
 */
router.get('/stats/:hospitalId', async (req, res) => {
  try {
    const { hospitalId } = req.params;
    const { startDate, endDate } = req.query;

    const stats = await transferService.getTransferStats(hospitalId, {
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
    });

    logger.info(`Retrieved transfer stats for ${hospitalId}`);

    res.json({
      success: true,
      hospitalId,
      data: stats,
    });
  } catch (error) {
    logger.error('Error fetching transfer stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve transfer statistics',
      error: error.message,
    });
  }
});

/**
 * POST /api/transfer/bulk
 * Bulk transfer multiple patients at once
 */
router.post('/bulk', async (req, res) => {
  try {
    const { patientIds, fromHospital, toHospital, reason, transferredBy } = req.body;

    if (!patientIds || !Array.isArray(patientIds) || patientIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'patientIds array is required and must not be empty',
      });
    }

    if (!fromHospital || !toHospital) {
      return res.status(400).json({
        success: false,
        message: 'fromHospital and toHospital are required',
      });
    }

    logger.info('Initiating bulk transfer', {
      count: patientIds.length,
      fromHospital,
      toHospital,
    });

    const results = await transferService.bulkTransfer({
      patientIds,
      fromHospital,
      toHospital,
      reason,
      transferredBy,
    });

    logger.info('Bulk transfer completed', {
      total: results.total,
      successful: results.successful,
      failed: results.failed,
    });

    res.json({
      success: true,
      message: 'Bulk transfer completed',
      data: results,
    });
  } catch (error) {
    logger.error('Bulk transfer failed:', error);
    res.status(500).json({
      success: false,
      message: 'Bulk transfer failed',
      error: error.message,
    });
  }
});

/**
 * GET /api/transfer/:transferId
 * Get details of a specific transfer
 */
router.get('/:transferId', async (req, res) => {
  try {
    const { transferId } = req.params;

    const transfer = await transferService.getTransferById(transferId);

    if (!transfer) {
      return res.status(404).json({
        success: false,
        message: `Transfer with ID ${transferId} not found`,
      });
    }

    logger.info(`Retrieved transfer details: ${transferId}`);

    res.json({
      success: true,
      data: transfer,
    });
  } catch (error) {
    logger.error('Error fetching transfer details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve transfer details',
      error: error.message,
    });
  }
});

module.exports = router;