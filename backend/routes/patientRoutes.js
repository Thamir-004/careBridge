const express = require('express');
const router = express.Router();
const patientService = require('../services/PatientService');
const logger = require('../utils/logger');
const { validatePatient } = require('../middleware/validation');

/**
 * GET /api/patients/:hospitalId
 * Get all patients from a specific hospital
 */
router.get('/:hospitalId', async (req, res) => {
  try {
    const { hospitalId } = req.params;
    const { page = 1, limit = 20, status, search } = req.query;
    
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      status,
      search,
    };
    
    const result = await patientService.getAllPatients(hospitalId, options);
    
    logger.info(`Retrieved patients from ${hospitalId}`, {
      count: result.data.length,
      page: options.page,
    });
    
    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    logger.error('Error fetching patients:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve patients',
      error: error.message,
    });
  }
});

/**
 * GET /api/patients/:hospitalId/:patientId
 * Get specific patient by ID from a hospital
 */
router.get('/:hospitalId/:patientId', async (req, res) => {
  try {
    const { hospitalId, patientId } = req.params;
    
    const patient = await patientService.getPatientById(hospitalId, patientId);
    
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: `Patient ${patientId} not found in ${hospitalId}`,
      });
    }
    
    logger.info(`Retrieved patient ${patientId} from ${hospitalId}`);
    
    res.json({
      success: true,
      data: patient,
    });
  } catch (error) {
    logger.error('Error fetching patient:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve patient',
      error: error.message,
    });
  }
});

/**
 * POST /api/patients/:hospitalId
 * Create a new patient in a specific hospital
 */
router.post('/:hospitalId', validatePatient, async (req, res) => {
  try {
    const { hospitalId } = req.params;
    const patientData = req.body;
    
    const newPatient = await patientService.createPatient(hospitalId, patientData);
    
    logger.info(`Created patient in ${hospitalId}`, {
      patientId: newPatient.patientId,
    });
    
    res.status(201).json({
      success: true,
      message: 'Patient created successfully',
      data: newPatient,
    });
  } catch (error) {
    logger.error('Error creating patient:', error);
    
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Patient with this ID already exists',
        error: error.message,
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to create patient',
      error: error.message,
    });
  }
});

/**
 * PUT /api/patients/:hospitalId/:patientId
 * Update patient information
 */
router.put('/:hospitalId/:patientId', async (req, res) => {
  try {
    const { hospitalId, patientId } = req.params;
    const updateData = req.body;
    
    const updatedPatient = await patientService.updatePatient(
      hospitalId,
      patientId,
      updateData
    );
    
    if (!updatedPatient) {
      return res.status(404).json({
        success: false,
        message: `Patient ${patientId} not found in ${hospitalId}`,
      });
    }
    
    logger.info(`Updated patient ${patientId} in ${hospitalId}`);
    
    res.json({
      success: true,
      message: 'Patient updated successfully',
      data: updatedPatient,
    });
  } catch (error) {
    logger.error('Error updating patient:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update patient',
      error: error.message,
    });
  }
});

/**
 * DELETE /api/patients/:hospitalId/:patientId
 * Soft delete a patient (mark as inactive)
 */
router.delete('/:hospitalId/:patientId', async (req, res) => {
  try {
    const { hospitalId, patientId } = req.params;
    const { permanent = false } = req.query;
    
    const result = await patientService.deletePatient(
      hospitalId,
      patientId,
      permanent === 'true'
    );
    
    if (!result) {
      return res.status(404).json({
        success: false,
        message: `Patient ${patientId} not found in ${hospitalId}`,
      });
    }
    
    logger.info(`Deleted patient ${patientId} from ${hospitalId}`, {
      permanent,
    });
    
    res.json({
      success: true,
      message: permanent ? 'Patient permanently deleted' : 'Patient marked as inactive',
    });
  } catch (error) {
    logger.error('Error deleting patient:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete patient',
      error: error.message,
    });
  }
});

/**
 * GET /api/patients/search/all
 * Search for patients across all hospitals
 */
router.get('/search/all', async (req, res) => {
  try {
    const { query, field = 'lastName' } = req.query;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required',
      });
    }
    
    const results = await patientService.searchPatientsAcrossHospitals(query, field);
    
    logger.info('Cross-hospital patient search', {
      query,
      field,
      totalResults: results.length,
    });
    
    res.json({
      success: true,
      query,
      field,
      count: results.length,
      data: results,
    });
  } catch (error) {
    logger.error('Error searching patients:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search patients',
      error: error.message,
    });
  }
});

/**
 * GET /api/patients/:hospitalId/:patientId/history
 * Get patient's transfer history
 */
router.get('/:hospitalId/:patientId/history', async (req, res) => {
  try {
    const { hospitalId, patientId } = req.params;
    
    const history = await patientService.getPatientTransferHistory(hospitalId, patientId);
    
    if (!history) {
      return res.status(404).json({
        success: false,
        message: `Patient ${patientId} not found in ${hospitalId}`,
      });
    }
    
    logger.info(`Retrieved transfer history for patient ${patientId}`);
    
    res.json({
      success: true,
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
 * PATCH /api/patients/:hospitalId/:patientId/status
 * Update patient status
 */
router.patch('/:hospitalId/:patientId/status', async (req, res) => {
  try {
    const { hospitalId, patientId } = req.params;
    const { status } = req.body;
    
    const validStatuses = ['active', 'transferred', 'deceased', 'inactive'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }
    
    const updatedPatient = await patientService.updatePatientStatus(
      hospitalId,
      patientId,
      status
    );
    
    if (!updatedPatient) {
      return res.status(404).json({
        success: false,
        message: `Patient ${patientId} not found in ${hospitalId}`,
      });
    }
    
    logger.info(`Updated status for patient ${patientId}`, { status });
    
    res.json({
      success: true,
      message: 'Patient status updated successfully',
      data: updatedPatient,
    });
  } catch (error) {
    logger.error('Error updating patient status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update patient status',
      error: error.message,
    });
  }
});

module.exports = router;