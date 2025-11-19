const express = require('express');
const router = express.Router();
const doctorService = require('../services/DoctorService');
const logger = require('../utils/logger');

/**
 * GET /api/doctors/:hospitalId
 * Get all doctors from a specific hospital
 */
router.get('/:hospitalId', async (req, res) => {
  try {
    const { hospitalId } = req.params;
    const { page = 1, limit = 20, specialty, status, availability } = req.query;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      specialty,
      status,
      availability,
    };

    const result = await doctorService.getAllDoctors(hospitalId, options);

    logger.info(`Retrieved doctors from ${hospitalId}`, {
      count: result.data.length,
      page: options.page,
    });

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    logger.error('Error fetching doctors:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve doctors',
      error: error.message,
    });
  }
});

/**
 * GET /api/doctors/:hospitalId/:doctorId
 * Get specific doctor by ID from a hospital
 */
router.get('/:hospitalId/:doctorId', async (req, res) => {
  try {
    const { hospitalId, doctorId } = req.params;

    const doctor = await doctorService.getDoctorById(hospitalId, doctorId);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: `Doctor ${doctorId} not found in ${hospitalId}`,
      });
    }

    logger.info(`Retrieved doctor ${doctorId} from ${hospitalId}`);

    res.json({
      success: true,
      data: doctor,
    });
  } catch (error) {
    logger.error('Error fetching doctor:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve doctor',
      error: error.message,
    });
  }
});

/**
 * POST /api/doctors/:hospitalId
 * Create a new doctor in a specific hospital
 */
router.post('/:hospitalId', async (req, res) => {
  try {
    const { hospitalId } = req.params;
    const doctorData = req.body;

    const newDoctor = await doctorService.createDoctor(hospitalId, doctorData);

    logger.info(`Created doctor in ${hospitalId}`, {
      doctorId: newDoctor.doctor_id,
    });

    res.status(201).json({
      success: true,
      message: 'Doctor created successfully',
      data: newDoctor,
    });
  } catch (error) {
    logger.error('Error creating doctor:', error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Doctor with this ID already exists',
        error: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create doctor',
      error: error.message,
    });
  }
});

/**
 * PUT /api/doctors/:hospitalId/:doctorId
 * Update doctor information
 */
router.put('/:hospitalId/:doctorId', async (req, res) => {
  try {
    const { hospitalId, doctorId } = req.params;
    const updateData = req.body;

    const updatedDoctor = await doctorService.updateDoctor(
      hospitalId,
      doctorId,
      updateData
    );

    if (!updatedDoctor) {
      return res.status(404).json({
        success: false,
        message: `Doctor ${doctorId} not found in ${hospitalId}`,
      });
    }

    logger.info(`Updated doctor ${doctorId} in ${hospitalId}`);

    res.json({
      success: true,
      message: 'Doctor updated successfully',
      data: updatedDoctor,
    });
  } catch (error) {
    logger.error('Error updating doctor:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update doctor',
      error: error.message,
    });
  }
});

/**
 * DELETE /api/doctors/:hospitalId/:doctorId
 * Delete doctor (soft delete)
 */
router.delete('/:hospitalId/:doctorId', async (req, res) => {
  try {
    const { hospitalId, doctorId } = req.params;
    const { permanent = false } = req.query;

    const result = await doctorService.deleteDoctor(
      hospitalId,
      doctorId,
      permanent === 'true'
    );

    if (!result) {
      return res.status(404).json({
        success: false,
        message: `Doctor ${doctorId} not found in ${hospitalId}`,
      });
    }

    logger.info(`Deleted doctor ${doctorId} from ${hospitalId}`, {
      permanent,
    });

    res.json({
      success: true,
      message: permanent ? 'Doctor permanently deleted' : 'Doctor marked as inactive',
    });
  } catch (error) {
    logger.error('Error deleting doctor:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete doctor',
      error: error.message,
    });
  }
});

/**
 * GET /api/doctors/search/all
 * Search for doctors across all hospitals
 */
router.get('/search/all', async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required',
      });
    }

    const results = await doctorService.searchDoctorsAcrossHospitals(query);

    logger.info('Cross-hospital doctor search', {
      query,
      totalResults: results.length,
    });

    res.json({
      success: true,
      query,
      count: results.length,
      data: results,
    });
  } catch (error) {
    logger.error('Error searching doctors:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search doctors',
      error: error.message,
    });
  }
});

/**
 * GET /api/doctors/:hospitalId/available
 * Get available doctors from a hospital
 */
router.get('/:hospitalId/available', async (req, res) => {
  try {
    const { hospitalId } = req.params;
    const { specialty } = req.query;

    const doctors = await doctorService.findAvailableDoctors(hospitalId, specialty);

    logger.info(`Retrieved available doctors from ${hospitalId}`, {
      count: doctors.length,
      specialty: specialty || 'all',
    });

    res.json({
      success: true,
      count: doctors.length,
      data: doctors,
    });
  } catch (error) {
    logger.error('Error fetching available doctors:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve available doctors',
      error: error.message,
    });
  }
});

module.exports = router;