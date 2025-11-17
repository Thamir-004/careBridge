const dbManager = require('../config/db');
const getPatientModel = require('../hospitals/HospitalA/models/Patient');
const logger = require('../utils/logger');

class PatientService {
  /**
   * Get Patient model for a specific hospital
   */
  getModel(hospitalId) {
    const connection = dbManager.getConnection(hospitalId);
    return getPatientModel(connection);
  }

  /**
   * Get all patients from a hospital with pagination
   */
  async getAllPatients(hospitalId, options = {}) {
    try {
      const Patient = this.getModel(hospitalId);
      const { page = 1, limit = 20, status, search } = options;
      
      const query = { is_deleted: false };
      
      if (status) query.status = status;
      if (search) {
        query.$or = [
          { first_name: new RegExp(search, 'i') },
          { last_name: new RegExp(search, 'i') },
          { patient_id: new RegExp(search, 'i') },
          { email: new RegExp(search, 'i') },
        ];
      }

      const skip = (page - 1) * limit;
      const total = await Patient.countDocuments(query);
      const patients = await Patient.find(query)
        .limit(limit)
        .skip(skip)
        .sort({ createdAt: -1 });

      return {
        data: patients,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Error fetching patients:', error);
      throw error;
    }
  }

  /**
   * Get patient by ID
   */
  async getPatientById(hospitalId, patientId) {
    try {
      const Patient = this.getModel(hospitalId);
      const patient = await Patient.findOne({
        patient_id: patientId,
        is_deleted: false,
      });
      return patient;
    } catch (error) {
      logger.error('Error fetching patient:', error);
      throw error;
    }
  }

  /**
   * Create new patient
   */
  async createPatient(hospitalId, patientData) {
    try {
      const Patient = this.getModel(hospitalId);
      
      // Add hospital info
      patientData.hospital_id = hospitalId;
      patientData.hospital_name = dbManager.getAllHospitals()
        .find(h => h.id === hospitalId)?.name;

      const patient = new Patient(patientData);
      await patient.save();
      
      logger.info(`Patient created: ${patient.patient_id}`);
      return patient;
    } catch (error) {
      logger.error('Error creating patient:', error);
      throw error;
    }
  }

  /**
   * Update patient
   */
  async updatePatient(hospitalId, patientId, updateData) {
    try {
      const Patient = this.getModel(hospitalId);
      
      const patient = await Patient.findOneAndUpdate(
        { patient_id: patientId, is_deleted: false },
        { $set: updateData },
        { new: true, runValidators: true }
      );

      if (patient) {
        logger.info(`Patient updated: ${patientId}`);
      }
      
      return patient;
    } catch (error) {
      logger.error('Error updating patient:', error);
      throw error;
    }
  }

  /**
   * Delete patient (soft or hard)
   */
  async deletePatient(hospitalId, patientId, permanent = false) {
    try {
      const Patient = this.getModel(hospitalId);
      
      if (permanent) {
        const result = await Patient.deleteOne({ patient_id: patientId });
        logger.info(`Patient permanently deleted: ${patientId}`);
        return result.deletedCount > 0;
      } else {
        const patient = await Patient.findOne({ patient_id: patientId });
        if (patient) {
          await patient.softDelete();
          logger.info(`Patient soft deleted: ${patientId}`);
          return true;
        }
        return false;
      }
    } catch (error) {
      logger.error('Error deleting patient:', error);
      throw error;
    }
  }

  /**
   * Update patient status
   */
  async updatePatientStatus(hospitalId, patientId, status) {
    try {
      const Patient = this.getModel(hospitalId);
      
      const patient = await Patient.findOneAndUpdate(
        { patient_id: patientId, is_deleted: false },
        { $set: { status } },
        { new: true }
      );

      if (patient) {
        logger.info(`Patient status updated: ${patientId} -> ${status}`);
      }
      
      return patient;
    } catch (error) {
      logger.error('Error updating patient status:', error);
      throw error;
    }
  }

  /**
   * Get patient transfer history
   */
  async getPatientTransferHistory(hospitalId, patientId) {
    try {
      const Patient = this.getModel(hospitalId);
      
      const patient = await Patient.findOne({
        patient_id: patientId,
        is_deleted: false,
      }).select('transfer_history patient_id first_name last_name');

      return patient ? patient.transfer_history : null;
    } catch (error) {
      logger.error('Error fetching transfer history:', error);
      throw error;
    }
  }

  /**
   * Search patients across all hospitals
   */
  async searchPatientsAcrossHospitals(query, field = 'last_name') {
    try {
      const hospitals = dbManager.getAllHospitals();
      const results = [];

      for (const hospital of hospitals) {
        const Patient = this.getModel(hospital.id);
        const searchQuery = {
          [field]: new RegExp(query, 'i'),
          is_deleted: false,
        };

        const patients = await Patient.find(searchQuery).limit(10);
        
        patients.forEach(patient => {
          results.push({
            hospital: hospital.name,
            hospitalId: hospital.id,
            patient: patient,
          });
        });
      }

      return results;
    } catch (error) {
      logger.error('Error searching across hospitals:', error);
      throw error;
    }
  }
}

module.exports = new PatientService();