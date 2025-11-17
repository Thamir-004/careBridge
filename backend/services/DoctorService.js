const dbManager = require('../config/db');
const getDoctorModel = require('../hospitals/HospitalA/models/Doctor');
const logger = require('../utils/logger');

class DoctorService {
  /**
   * Get Doctor model for a specific hospital
   */
  getModel(hospitalId) {
    const connection = dbManager.getConnection(hospitalId);
    return getDoctorModel(connection);
  }

  /**
   * Get all doctors from a hospital with pagination
   */
  async getAllDoctors(hospitalId, options = {}) {
    try {
      const Doctor = this.getModel(hospitalId);
      const { page = 1, limit = 20, specialty, status, availability } = options;
      
      const query = { is_deleted: false };
      
      if (specialty) query.specialty = specialty;
      if (status) query.status = status;
      if (availability) query.availability_status = availability;

      const skip = (page - 1) * limit;
      const total = await Doctor.countDocuments(query);
      const doctors = await Doctor.find(query)
        .limit(limit)
        .skip(skip)
        .sort({ last_name: 1 });

      return {
        data: doctors,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Error fetching doctors:', error);
      throw error;
    }
  }

  /**
   * Get doctor by ID
   */
  async getDoctorById(hospitalId, doctorId) {
    try {
      const Doctor = this.getModel(hospitalId);
      const doctor = await Doctor.findOne({
        doctor_id: doctorId,
        is_deleted: false,
      });
      return doctor;
    } catch (error) {
      logger.error('Error fetching doctor:', error);
      throw error;
    }
  }

  /**
   * Create new doctor
   */
  async createDoctor(hospitalId, doctorData) {
    try {
      const Doctor = this.getModel(hospitalId);
      
      // Add hospital info
      doctorData.hospital_id = hospitalId;
      doctorData.hospital_name = dbManager.getAllHospitals()
        .find(h => h.id === hospitalId)?.name;

      const doctor = new Doctor(doctorData);
      await doctor.save();
      
      logger.info(`Doctor created: ${doctor.doctor_id}`);
      return doctor;
    } catch (error) {
      logger.error('Error creating doctor:', error);
      throw error;
    }
  }

  /**
   * Update doctor
   */
  async updateDoctor(hospitalId, doctorId, updateData) {
    try {
      const Doctor = this.getModel(hospitalId);
      
      const doctor = await Doctor.findOneAndUpdate(
        { doctor_id: doctorId, is_deleted: false },
        { $set: updateData },
        { new: true, runValidators: true }
      );

      if (doctor) {
        logger.info(`Doctor updated: ${doctorId}`);
      }
      
      return doctor;
    } catch (error) {
      logger.error('Error updating doctor:', error);
      throw error;
    }
  }

  /**
   * Delete doctor (soft or hard)
   */
  async deleteDoctor(hospitalId, doctorId, permanent = false) {
    try {
      const Doctor = this.getModel(hospitalId);
      
      if (permanent) {
        const result = await Doctor.deleteOne({ doctor_id: doctorId });
        logger.info(`Doctor permanently deleted: ${doctorId}`);
        return result.deletedCount > 0;
      } else {
        const doctor = await Doctor.findOne({ doctor_id: doctorId });
        if (doctor) {
          await doctor.softDelete();
          logger.info(`Doctor soft deleted: ${doctorId}`);
          return true;
        }
        return false;
      }
    } catch (error) {
      logger.error('Error deleting doctor:', error);
      throw error;
    }
  }

  /**
   * Update doctor availability
   */
  async updateAvailability(hospitalId, doctorId, availabilityStatus) {
    try {
      const Doctor = this.getModel(hospitalId);
      
      const doctor = await Doctor.findOne({
        doctor_id: doctorId,
        is_deleted: false,
      });

      if (doctor) {
        await doctor.updateAvailability(availabilityStatus);
        logger.info(`Doctor availability updated: ${doctorId} -> ${availabilityStatus}`);
        return doctor;
      }
      
      return null;
    } catch (error) {
      logger.error('Error updating availability:', error);
      throw error;
    }
  }

  /**
   * Find available doctors
   */
  async findAvailableDoctors(hospitalId, specialty = null) {
    try {
      const Doctor = this.getModel(hospitalId);
      
      const query = {
        hospital_id: hospitalId,
        availability_status: 'Available',
        status: 'Active',
        is_deleted: false,
      };

      if (specialty) query.specialty = specialty;

      const doctors = await Doctor.find(query).sort({ last_name: 1 });
      
      return doctors;
    } catch (error) {
      logger.error('Error finding available doctors:', error);
      throw error;
    }
  }

  /**
   * Find doctors by specialty
   */
  async findBySpecialty(specialty, hospitalId = null) {
    try {
      if (hospitalId) {
        // Search in specific hospital
        const Doctor = this.getModel(hospitalId);
        return await Doctor.findBySpecialty(specialty);
      } else {
        // Search across all hospitals
        const hospitals = dbManager.getAllHospitals();
        const results = [];

        for (const hospital of hospitals) {
          const Doctor = this.getModel(hospital.id);
          const doctors = await Doctor.findBySpecialty(specialty);
          
          doctors.forEach(doctor => {
            results.push({
              hospital: hospital.name,
              hospitalId: hospital.id,
              doctor: doctor,
            });
          });
        }

        return results;
      }
    } catch (error) {
      logger.error('Error finding doctors by specialty:', error);
      throw error;
    }
  }

  /**
   * Get doctor transfer history
   */
  async getTransferHistory(hospitalId, doctorId) {
    try {
      const Doctor = this.getModel(hospitalId);
      
      const doctor = await Doctor.findOne({
        doctor_id: doctorId,
        is_deleted: false,
      }).select('transfer_history doctor_id first_name last_name');

      return doctor ? doctor.transfer_history : null;
    } catch (error) {
      logger.error('Error fetching transfer history:', error);
      throw error;
    }
  }

  /**
   * Search doctors across all hospitals
   */
  async searchDoctorsAcrossHospitals(query) {
    try {
      const hospitals = dbManager.getAllHospitals();
      const results = [];

      for (const hospital of hospitals) {
        const Doctor = this.getModel(hospital.id);
        const searchQuery = {
          $or: [
            { first_name: new RegExp(query, 'i') },
            { last_name: new RegExp(query, 'i') },
            { specialty: new RegExp(query, 'i') },
            { doctor_id: new RegExp(query, 'i') },
          ],
          is_deleted: false,
        };

        const doctors = await Doctor.find(searchQuery).limit(10);
        
        doctors.forEach(doctor => {
          results.push({
            hospital: hospital.name,
            hospitalId: hospital.id,
            doctor: doctor,
          });
        });
      }

      return results;
    } catch (error) {
      logger.error('Error searching doctors across hospitals:', error);
      throw error;
    }
  }
}

module.exports = new DoctorService();