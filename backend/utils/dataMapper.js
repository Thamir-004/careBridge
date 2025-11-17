const logger = require('./logger');

/**
 * Map patient data between different hospital schemas
 */
const mapPatientData = (sourceData, targetSchema = 'standard') => {
  try {
    // Standard mapping
    const mapped = {
      patient_id: sourceData.patient_id || sourceData.patientId,
      national_id: sourceData.national_id || sourceData.nationalId,
      first_name: sourceData.first_name || sourceData.firstName,
      last_name: sourceData.last_name || sourceData.lastName,
      middle_name: sourceData.middle_name || sourceData.middleName,
      date_of_birth: sourceData.date_of_birth || sourceData.dateOfBirth,
      gender: sourceData.gender,
      phone_number: sourceData.phone_number || sourceData.phoneNumber,
      email: sourceData.email,
      blood_type: sourceData.blood_type || sourceData.bloodType,
      address: sourceData.address,
      status: sourceData.status || 'Active',
    };

    // Remove undefined values
    Object.keys(mapped).forEach(key => {
      if (mapped[key] === undefined) delete mapped[key];
    });

    return mapped;
  } catch (error) {
    logger.error('Patient data mapping failed:', error);
    throw error;
  }
};

/**
 * Map doctor data between schemas
 */
const mapDoctorData = (sourceData, targetSchema = 'standard') => {
  try {
    const mapped = {
      doctor_id: sourceData.doctor_id || sourceData.doctorId,
      license_number: sourceData.license_number || sourceData.licenseNumber,
      first_name: sourceData.first_name || sourceData.firstName,
      last_name: sourceData.last_name || sourceData.lastName,
      specialty: sourceData.specialty,
      phone_number: sourceData.phone_number || sourceData.phoneNumber,
      email: sourceData.email,
      department: sourceData.department,
      status: sourceData.status || 'Active',
    };

    Object.keys(mapped).forEach(key => {
      if (mapped[key] === undefined) delete mapped[key];
    });

    return mapped;
  } catch (error) {
    logger.error('Doctor data mapping failed:', error);
    throw error;
  }
};

/**
 * Map encounter data between schemas
 */
const mapEncounterData = (sourceData, targetSchema = 'standard') => {
  try {
    const mapped = {
      encounter_id: sourceData.encounter_id || sourceData.encounterId,
      patient: sourceData.patient,
      doctor: sourceData.doctor,
      encounter_type: sourceData.encounter_type || sourceData.encounterType,
      encounter_date: sourceData.encounter_date || sourceData.encounterDate || sourceData.date,
      reason_for_visit: sourceData.reason_for_visit || sourceData.reasonForVisit || sourceData.reason,
      diagnoses: sourceData.diagnoses || sourceData.diagnosis,
      status: sourceData.status || 'Active',
    };

    Object.keys(mapped).forEach(key => {
      if (mapped[key] === undefined) delete mapped[key];
    });

    return mapped;
  } catch (error) {
    logger.error('Encounter data mapping failed:', error);
    throw error;
  }
};

/**
 * Generic field mapper
 */
const mapFields = (sourceData, fieldMap) => {
  try {
    const mapped = {};

    for (const [targetField, sourceField] of Object.entries(fieldMap)) {
      if (sourceData[sourceField] !== undefined) {
        mapped[targetField] = sourceData[sourceField];
      }
    }

    return mapped;
  } catch (error) {
    logger.error('Field mapping failed:', error);
    throw error;
  }
};

/**
 * Convert camelCase to snake_case
 */
const toSnakeCase = (obj) => {
  const result = {};
  
  for (const [key, value] of Object.entries(obj)) {
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    result[snakeKey] = value;
  }
  
  return result;
};

/**
 * Convert snake_case to camelCase
 */
const toCamelCase = (obj) => {
  const result = {};
  
  for (const [key, value] of Object.entries(obj)) {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    result[camelKey] = value;
  }
  
  return result;
};

module.exports = {
  mapPatientData,
  mapDoctorData,
  mapEncounterData,
  mapFields,
  toSnakeCase,
  toCamelCase,
};