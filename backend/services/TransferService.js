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
    const { patientId, fromHospital, toHospital, reason, transferredBy, includeFullHistory = true } = transferData;

    logger.info('TransferService.transferPatient called', { patientId, fromHospital, toHospital, includeFullHistory });

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

      const patientFields = { ...patientData };
      delete patientFields.transfer_history;
      const newPatient = await DestPatient.findOneAndUpdate(
        { phone_number: sourcePatient.phone_number },
        {
          $set: patientFields,
          $push: { transfer_history: transferRecord }
        },
        { upsert: true, new: true }
      );

      // Update source patient
      sourcePatient.status = 'Transferred';
      sourcePatient.transfer_history.push(transferRecord);
      await sourcePatient.save();

      // Transfer medical records if requested
      let recordsTransferred = null;
      if (includeFullHistory) {
        logger.info('Transferring medical records for patient:', patientId);
        recordsTransferred = await this.transferRecords({
          patientId,
          fromHospital,
          toHospital,
          transferredBy,
        });
        logger.info('Medical records transferred:', recordsTransferred);
      } else {
        logger.info('Skipping medical records transfer (includeFullHistory=false)');
      }

      logger.info(`Patient transferred: ${transferId}`);

      return {
        success: true,
        transferId,
        patient: newPatient,
        recordsTransferred,
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

  /**
   * Get all transfers across all hospitals
   */
  async getAllTransfers(options = {}) {
    try {
      const { limit = 100, offset = 0, status, fromHospital, toHospital } = options;
      const hospitals = dbManager.getAllHospitals();
      const allTransfers = [];

      for (const hospital of hospitals) {
        const Patient = this.getModel(hospital.id, getPatientModel);

        // Find patients with transfer history
        const patients = await Patient.find({
          'transfer_history.0': { $exists: true },
          is_deleted: false,
        }).select('patient_id first_name last_name transfer_history');

        for (const patient of patients) {
          for (const transfer of patient.transfer_history) {
            // Apply filters
            if (status && transfer.status !== status) continue;
            if (fromHospital && transfer.from_hospital !== fromHospital) continue;
            if (toHospital && transfer.to_hospital !== toHospital) continue;

            allTransfers.push({
              id: transfer.transfer_id,
              patientName: `${patient.first_name} ${patient.last_name}`,
              patientId: patient.patient_id,
              fromHospital: transfer.from_hospital,
              toHospital: transfer.to_hospital,
              date: transfer.transfer_date.toISOString().split('T')[0],
              time: new Date(transfer.transfer_date).toTimeString().split(' ')[0].substring(0, 5),
              reason: transfer.reason,
              status: transfer.status.toLowerCase(),
              transferredBy: transfer.transferred_by,
            });
          }
        }
      }

      // Sort by date descending and apply pagination
      allTransfers.sort((a, b) => new Date(b.date + ' ' + b.time) - new Date(a.date + ' ' + a.time));

      return allTransfers.slice(offset, offset + limit);
    } catch (error) {
      logger.error('Error fetching all transfers:', error);
      throw error;
    }
  }
}

module.exports = new TransferService();