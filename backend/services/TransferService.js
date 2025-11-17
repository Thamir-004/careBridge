const dbManager = require('../config/db');
const getPatientModel = require('../hospitals/HospitalA/models/Patient');
const getEncounterModel = require('../hospitals/HospitalA/models/Encounter');
const getMedicationModel = require('../hospitals/HospitalA/models/Medication');
const logger = require('../utils/logger');

class TransferService {
  /**
   * Get model for a specific hospital
   */
  getModel(hospitalId, modelGetter) {
    const connection = dbManager.getConnection(hospitalId);
    return modelGetter(connection);
  }

  /**
   * Transfer patient from one hospital to another
   */
  async transferPatient(transferData) {
    const { patientId, fromHospital, toHospital, reason, transferredBy } = transferData;

    try {
      const SourcePatient = this.getModel(fromHospital, getPatientModel);
      const DestPatient = this.getModel(toHospital, getPatientModel);

      // Get patient from source
      const sourcePatient = await SourcePatient.findOne({
        patient_id: patientId,
        is_deleted: false,
      });

      if (!sourcePatient) {
        throw new Error(`Patient ${patientId} not found in source hospital`);
      }

      // Check if already exists in destination
      const existing = await DestPatient.findOne({ patient_id: patientId });
      if (existing) {
        throw new Error(`Patient ${patientId} already exists in destination`);
      }

      const transferId = `TRF-${Date.now().toString(36).toUpperCase()}`;
      const transferRecord = {
        transfer_id: transferId,
        from_hospital: fromHospital,
        to_hospital: toHospital,
        transfer_date: new Date(),
        reason,
        transferred_by: transferredBy,
        status: 'Completed',
      };

      // Copy patient to destination
      const patientData = sourcePatient.toObject();
      delete patientData._id;
      delete patientData.__v;
      
      patientData.hospital_id = toHospital;
      patientData.hospital_name = dbManager.getAllHospitals().find(h => h.id === toHospital)?.name;
      patientData.transfer_history = patientData.transfer_history || [];
      patientData.transfer_history.push(transferRecord);

      const newPatient = new DestPatient(patientData);
      await newPatient.save();

      // Update source patient
      sourcePatient.status = 'Transferred';
      sourcePatient.transfer_history.push(transferRecord);
      await sourcePatient.save();

      logger.info(`Patient transferred: ${transferId}`);

      return {
        success: true,
        transferId,
        patient: newPatient,
      };
    } catch (error) {
      logger.error('Patient transfer failed:', error);
      throw error;
    }
  }

  /**
   * Transfer medical records (encounters, medications)
   */
  async transferRecords(transferData) {
    const { patientId, fromHospital, toHospital } = transferData;

    try {
      const SourceEncounter = this.getModel(fromHospital, getEncounterModel);
      const DestEncounter = this.getModel(toHospital, getEncounterModel);
      const SourceMedication = this.getModel(fromHospital, getMedicationModel);
      const DestMedication = this.getModel(toHospital, getMedicationModel);

      // Transfer encounters
      const encounters = await SourceEncounter.find({
        'patient.patient_id': patientId,
        is_deleted: false,
      });

      let encountersCount = 0;
      for (const enc of encounters) {
        const data = enc.toObject();
        delete data._id;
        delete data.__v;
        data.hospital_id = toHospital;
        data.transfer_info = { is_transferred: true, from_hospital: fromHospital };
        
        await new DestEncounter(data).save();
        encountersCount++;
      }

      // Transfer medications
      const medications = await SourceMedication.find({
        'patient.patient_id': patientId,
        is_deleted: false,
      });

      let medicationsCount = 0;
      for (const med of medications) {
        const data = med.toObject();
        delete data._id;
        delete data.__v;
        data.hospital_id = toHospital;
        
        await new DestMedication(data).save();
        medicationsCount++;
      }

      return { encounters: encountersCount, medications: medicationsCount };
    } catch (error) {
      logger.error('Records transfer failed:', error);
      throw error;
    }
  }

  /**
   * Get transfer history for patient
   */
  async getTransferHistory(patientId) {
    try {
      const hospitals = dbManager.getAllHospitals();
      const history = [];

      for (const hospital of hospitals) {
        const Patient = this.getModel(hospital.id, getPatientModel);
        const patient = await Patient.findOne({
          patient_id: patientId,
        }).select('transfer_history');

        if (patient?.transfer_history) {
          history.push(...patient.transfer_history);
        }
      }

      return history.sort((a, b) => new Date(b.transfer_date) - new Date(a.transfer_date));
    } catch (error) {
      logger.error('Error fetching transfer history:', error);
      throw error;
    }
  }

  /**
   * Get transfer statistics
   */
  async getTransferStats(hospitalId) {
    try {
      const Patient = this.getModel(hospitalId, getPatientModel);

      const transferredIn = await Patient.countDocuments({
        'transfer_history.to_hospital': hospitalId,
        is_deleted: false,
      });

      const transferredOut = await Patient.countDocuments({
        hospital_id: hospitalId,
        status: 'Transferred',
        is_deleted: false,
      });

      const active = await Patient.countDocuments({
        hospital_id: hospitalId,
        status: 'Active',
        is_deleted: false,
      });

      return { transferredIn, transferredOut, active };
    } catch (error) {
      logger.error('Error fetching stats:', error);
      throw error;
    }
  }
}

module.exports = new TransferService();