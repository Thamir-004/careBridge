const logger = require('./logger');

/**
 * Validate patient data
 */
const validatePatient = (data) => {
  const errors = [];

  if (!data.patient_id) errors.push('patient_id is required');
  if (!data.national_id) errors.push('national_id is required');
  if (!data.first_name) errors.push('first_name is required');
  if (!data.last_name) errors.push('last_name is required');
  if (!data.date_of_birth) errors.push('date_of_birth is required');
  if (!data.gender) errors.push('gender is required');
  if (!data.phone_number) errors.push('phone_number is required');
  if (!data.email) errors.push('email is required');

  // Validate email format
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Invalid email format');
  }

  // Validate phone number format (Kenyan)
  if (data.phone_number && !/^(\+254|0)[17]\d{8}$/.test(data.phone_number.replace(/\s+/g, ''))) {
    errors.push('Invalid phone number format');
  }

  // Validate gender
  if (data.gender && !['Male', 'Female', 'Other', 'Prefer not to say'].includes(data.gender)) {
    errors.push('Invalid gender value');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Validate doctor data
 */
const validateDoctor = (data) => {
  const errors = [];

  if (!data.doctor_id) errors.push('doctor_id is required');
  if (!data.license_number) errors.push('license_number is required');
  if (!data.first_name) errors.push('first_name is required');
  if (!data.last_name) errors.push('last_name is required');
  if (!data.specialty) errors.push('specialty is required');
  if (!data.phone_number) errors.push('phone_number is required');
  if (!data.email) errors.push('email is required');

  // Validate email format
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Invalid email format');
  }

  // Validate phone number format (Kenyan)
  const cleanedPhone = data.phone_number.replace(/\s+/g, '');
  console.log('Validating phone:', data.phone_number, 'Cleaned:', cleanedPhone, 'Regex test:', /^(\+?254|0)[17]\d{8}$/.test(cleanedPhone));
  if (data.phone_number && !/^(\+?254|0)[17]\d{8}$/.test(cleanedPhone)) {
    errors.push('Invalid phone number format');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Validate encounter data
 */
const validateEncounter = (data) => {
  const errors = [];

  if (!data.patient || !data.patient.patient_id) errors.push('patient information is required');
  if (!data.doctor || !data.doctor.doctor_id) errors.push('doctor information is required');
  if (!data.encounter_type) errors.push('encounter_type is required');
  if (!data.reason_for_visit) errors.push('reason_for_visit is required');

  // Validate encounter type
  const validTypes = ['Outpatient', 'Inpatient', 'Emergency', 'Follow-up', 'Consultation'];
  if (data.encounter_type && !validTypes.includes(data.encounter_type)) {
    errors.push('Invalid encounter_type');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Validate transfer data
 */
const validateTransfer = (data) => {
  const errors = [];

  if (!data.patientId) errors.push('patientId is required');
  if (!data.fromHospital) errors.push('fromHospital is required');
  if (!data.toHospital) errors.push('toHospital is required');

  if (data.fromHospital && data.toHospital && data.fromHospital === data.toHospital) {
    errors.push('fromHospital and toHospital must be different');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Validate required fields
 */
const validateRequired = (data, requiredFields) => {
  const errors = [];

  for (const field of requiredFields) {
    if (!data[field]) {
      errors.push(`${field} is required`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Validate email
 */
const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

/**
 * Validate phone number (Kenyan format)
 */
const isValidPhone = (phone) => {
  const cleaned = phone.replace(/\s+/g, '');
  return /^(\+254|0)[17]\d{8}$/.test(cleaned);
};

/**
 * Validate date
 */
const isValidDate = (date) => {
  const parsedDate = new Date(date);
  return !isNaN(parsedDate.getTime());
};

/**
 * Validate MongoDB ObjectId
 */
const isValidObjectId = (id) => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

/**
 * Sanitize string (remove special characters)
 */
const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;
  return str.trim().replace(/[<>]/g, '');
};

/**
 * Validate and sanitize input
 */
const validateAndSanitize = (data, validationRules) => {
  const sanitized = {};
  const errors = [];

  for (const [field, rules] of Object.entries(validationRules)) {
    const value = data[field];

    // Check required
    if (rules.required && !value) {
      errors.push(`${field} is required`);
      continue;
    }

    // Skip if not required and empty
    if (!value && !rules.required) continue;

    // Type validation
    if (rules.type === 'email' && !isValidEmail(value)) {
      errors.push(`${field} must be a valid email`);
    }

    if (rules.type === 'phone' && !isValidPhone(value)) {
      errors.push(`${field} must be a valid phone number`);
    }

    if (rules.type === 'date' && !isValidDate(value)) {
      errors.push(`${field} must be a valid date`);
    }

    // Length validation
    if (rules.minLength && value.length < rules.minLength) {
      errors.push(`${field} must be at least ${rules.minLength} characters`);
    }

    if (rules.maxLength && value.length > rules.maxLength) {
      errors.push(`${field} must be at most ${rules.maxLength} characters`);
    }

    // Enum validation
    if (rules.enum && !rules.enum.includes(value)) {
      errors.push(`${field} must be one of: ${rules.enum.join(', ')}`);
    }

    // Sanitize
    sanitized[field] = typeof value === 'string' ? sanitizeString(value) : value;
  }

  return {
    valid: errors.length === 0,
    errors,
    data: sanitized,
  };
};

module.exports = {
  validatePatient,
  validateDoctor,
  validateEncounter,
  validateTransfer,
  validateRequired,
  isValidEmail,
  isValidPhone,
  isValidDate,
  isValidObjectId,
  sanitizeString,
  validateAndSanitize,
};
