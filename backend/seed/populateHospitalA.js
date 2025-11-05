require('dotenv').config();
const mongoose = require('mongoose');

// Import model factory functions
const getPatientModel = require('../integrations/HospitalA/models/Patient');
const getDoctorModel = require('../integrations/HospitalA/models/Doctor');
const getNurseModel = require('../integrations/HospitalA/models/Nurse');
const getEncounterModel = require('../integrations/HospitalA/models/Encounter');
const getMedicationModel = require('../integrations/HospitalA/models/Medication');

const HOSPITAL_A_URI = process.env.HOSPITAL_A_MONGO_URI || 'mongodb://localhost:27017/hospital_a';
const HOSPITAL_A_ID = process.env.HOSPITAL_A_ID || 'HOSP_A_001';
const HOSPITAL_A_NAME = process.env.HOSPITAL_A_NAME || 'City General Hospital';

async function populateHospitalA() {
  let connection;
  
  try {
    console.log(' Connecting to Hospital A database...');
    connection = await mongoose.createConnection(HOSPITAL_A_URI, {
      maxPoolSize: 10,
    });
    console.log(' Connected to Hospital A database');

    // Get models using the connection
    const Patient = getPatientModel(connection);
    const Doctor = getDoctorModel(connection);
    const Nurse = getNurseModel(connection);
    const Encounter = getEncounterModel(connection);
    const Medication = getMedicationModel(connection);

    // Clear existing data
    console.log('  Clearing existing data...');
    await Promise.all([
      Patient.deleteMany({}),
      Doctor.deleteMany({}),
      Nurse.deleteMany({}),
      Encounter.deleteMany({}),
      Medication.deleteMany({}),
    ]);
    console.log(' Existing data cleared');

    // Seed Doctors
    console.log(' Seeding doctors...');
    const doctors = await Doctor.insertMany([
      {
        doctor_id: 'DOC-A-001',
        license_number: 'KE-MED-12345',
        first_name: 'Amina',
        last_name: 'Omar',
        specialty: 'Cardiology',
        phone_number: '0700111222',
        email: 'amina.omar@citygeneralhospital.com',
        hospital_id: HOSPITAL_A_ID,
        hospital_name: HOSPITAL_A_NAME,
        department: 'Cardiology',
        availability_status: 'Available',
        status: 'Active',
      },
      {
        doctor_id: 'DOC-A-002',
        license_number: 'KE-MED-67890',
        first_name: 'Peter',
        last_name: 'Mwangi',
        specialty: 'Pediatrics',
        phone_number: '0700333444',
        email: 'peter.mwangi@citygeneralhospital.com',
        hospital_id: HOSPITAL_A_ID,
        hospital_name: HOSPITAL_A_NAME,
        department: 'Pediatrics',
        availability_status: 'Available',
        status: 'Active',
      },
      {
        doctor_id: 'DOC-A-003',
        license_number: 'KE-MED-11122',
        first_name: 'Grace',
        last_name: 'Wanjiku',
        specialty: 'General Practice',
        phone_number: '0700555666',
        email: 'grace.wanjiku@citygeneralhospital.com',
        hospital_id: HOSPITAL_A_ID,
        hospital_name: HOSPITAL_A_NAME,
        department: 'General Medicine',
        availability_status: 'Available',
        status: 'Active',
      },
    ]);
    console.log(` ${doctors.length} doctors seeded`);

    // Seed Nurses
    console.log(' Seeding nurses...');
    const nurses = await Nurse.insertMany([
      {
        nurse_id: 'NUR-A-001',
        license_number: 'KE-NUR-11111',
        first_name: 'Wanjiku',
        last_name: 'Kariuki',
        phone_number: '0711222333',
        email: 'wanjiku.kariuki@citygeneralhospital.com',
        hospital_id: HOSPITAL_A_ID,
        hospital_name: HOSPITAL_A_NAME,
        department: 'Cardiology',
        shift: 'Morning',
        availability_status: 'Available',
        status: 'Active',
      },
      {
        nurse_id: 'NUR-A-002',
        license_number: 'KE-NUR-22222',
        first_name: 'Otieno',
        last_name: 'Odhiambo',
        phone_number: '0722333444',
        email: 'otieno.odhiambo@citygeneralhospital.com',
        hospital_id: HOSPITAL_A_ID,
        hospital_name: HOSPITAL_A_NAME,
        department: 'Pediatrics',
        shift: 'Evening',
        availability_status: 'Available',
        status: 'Active',
      },
    ]);
    console.log(` ${nurses.length} nurses seeded`);

    // Seed Patients
    console.log(' Seeding patients...');
    const patients = await Patient.insertMany([
      {
        patient_id: 'PAT-A-001',
        national_id: '12345678',
        first_name: 'John',
        last_name: 'Doe',
        date_of_birth: new Date('1990-05-12'),
        gender: 'Male',
        phone_number: '0712345678',
        email: 'john.doe@email.com',
        address: {
          street: '123 Kenyatta Avenue',
          city: 'Nairobi',
          state: 'Nairobi County',
          zip_code: '00100',
          country: 'Kenya',
        },
        blood_type: 'O+',
        hospital_id: HOSPITAL_A_ID,
        hospital_name: HOSPITAL_A_NAME,
        status: 'Active',
      },
      {
        patient_id: 'PAT-A-002',
        national_id: '87654321',
        first_name: 'Mary',
        last_name: 'Atieno',
        date_of_birth: new Date('1985-09-23'),
        gender: 'Female',
        phone_number: '0723456789',
        email: 'mary.atieno@email.com',
        address: {
          street: '456 Moi Avenue',
          city: 'Mombasa',
          state: 'Mombasa County',
          zip_code: '80100',
          country: 'Kenya',
        },
        blood_type: 'A+',
        allergies: [
          { allergen: 'Penicillin', severity: 'Severe' },
        ],
        hospital_id: HOSPITAL_A_ID,
        hospital_name: HOSPITAL_A_NAME,
        status: 'Active',
      },
      {
        patient_id: 'PAT-A-003',
        national_id: '11223344',
        first_name: 'David',
        last_name: 'Kamau',
        date_of_birth: new Date('2010-03-15'),
        gender: 'Male',
        phone_number: '0734567890',
        email: 'david.kamau@email.com',
        address: {
          street: '789 Uhuru Highway',
          city: 'Nairobi',
          state: 'Nairobi County',
          zip_code: '00200',
          country: 'Kenya',
        },
        blood_type: 'B+',
        hospital_id: HOSPITAL_A_ID,
        hospital_name: HOSPITAL_A_NAME,
        status: 'Active',
      },
    ]);
    console.log(` ${patients.length} patients seeded`);

    // Seed Encounters
    console.log(' Seeding encounters...');
    const encounters = await Encounter.insertMany([
      {
        patient: {
          patient_id: patients[0].patient_id,
          patient_ref: patients[0]._id,
          patient_name: patients[0].full_name,
        },
        doctor: {
          doctor_id: doctors[0].doctor_id,
          doctor_ref: doctors[0]._id,
          doctor_name: doctors[0].full_name,
        },
        hospital_id: HOSPITAL_A_ID,
        hospital_name: HOSPITAL_A_NAME,
        encounter_type: 'Outpatient',
        encounter_date: new Date('2025-01-15'),
        reason_for_visit: 'Chest pain and shortness of breath',
        symptoms: ['Chest pain', 'Shortness of breath', 'Dizziness'],
        vital_signs: {
          temperature: 37.2,
          blood_pressure: '140/90',
          heart_rate: 88,
          weight: 75,
          height: 175,
        },
        diagnoses: [
          { description: 'Mild arrhythmia', type: 'Primary' },
        ],
        treatment_plan: 'Prescribed beta-blockers, advised lifestyle changes',
        clinical_notes: 'Patient reports intermittent chest pain for 2 weeks',
        encounter_status: 'Completed',
        status: 'Completed',
      },
      {
        patient: {
          patient_id: patients[1].patient_id,
          patient_ref: patients[1]._id,
          patient_name: patients[1].full_name,
        },
        doctor: {
          doctor_id: doctors[1].doctor_id,
          doctor_ref: doctors[1]._id,
          doctor_name: doctors[1].full_name,
        },
        hospital_id: HOSPITAL_A_ID,
        hospital_name: HOSPITAL_A_NAME,
        encounter_type: 'Emergency',
        encounter_date: new Date('2025-02-20'),
        reason_for_visit: 'High fever and body aches',
        symptoms: ['High fever', 'Body aches', 'Headache', 'Fatigue'],
        vital_signs: {
          temperature: 39.5,
          blood_pressure: '120/80',
          heart_rate: 95,
          weight: 62,
          height: 165,
        },
        diagnoses: [
          { description: 'Malaria', type: 'Primary' },
        ],
        treatment_plan: 'Antimalarial medication, rest and hydration',
        clinical_notes: 'Positive malaria rapid diagnostic test',
        lab_tests_ordered: [
          { test_name: 'Malaria RDT', status: 'Completed', results: 'Positive' },
        ],
        encounter_status: 'Completed',
        status: 'Completed',
      },
      {
        patient: {
          patient_id: patients[2].patient_id,
          patient_ref: patients[2]._id,
          patient_name: patients[2].full_name,
        },
        doctor: {
          doctor_id: doctors[1].doctor_id,
          doctor_ref: doctors[1]._id,
          doctor_name: doctors[1].full_name,
        },
        hospital_id: HOSPITAL_A_ID,
        hospital_name: HOSPITAL_A_NAME,
        encounter_type: 'Follow-up',
        encounter_date: new Date('2025-03-01'),
        reason_for_visit: 'Routine vaccination',
        symptoms: [],
        vital_signs: {
          temperature: 36.8,
          weight: 35,
          height: 140,
        },
        diagnoses: [
          { description: 'Routine immunization', type: 'Primary' },
        ],
        treatment_plan: 'MMR vaccine administered',
        clinical_notes: 'No adverse reactions observed',
        encounter_status: 'Completed',
        status: 'Completed',
      },
    ]);
    console.log(` ${encounters.length} encounters seeded`);

    // Seed Medications
    console.log(' Seeding medications...');
    const medications = await Medication.insertMany([
      {
        encounter: {
          encounter_id: encounters[0].encounter_id,
          encounter_ref: encounters[0]._id,
        },
        patient: {
          patient_id: patients[0].patient_id,
          patient_name: patients[0].full_name,
        },
        doctor: {
          doctor_id: doctors[0].doctor_id,
          doctor_name: doctors[0].full_name,
        },
        hospital_id: HOSPITAL_A_ID,
        medication_name: 'Metoprolol',
        generic_name: 'Metoprolol Tartrate',
        dosage: '50mg',
        frequency: 'Once daily',
        duration: '30 days',
        route: 'Oral',
        instructions: 'Take with food in the morning',
        quantity: 30,
        refills_allowed: 2,
        status: 'Active',
      },
      {
        encounter: {
          encounter_id: encounters[1].encounter_id,
          encounter_ref: encounters[1]._id,
        },
        patient: {
          patient_id: patients[1].patient_id,
          patient_name: patients[1].full_name,
        },
        doctor: {
          doctor_id: doctors[1].doctor_id,
          doctor_name: doctors[1].full_name,
        },
        hospital_id: HOSPITAL_A_ID,
        medication_name: 'Artemether-Lumefantrine',
        generic_name: 'Coartem',
        dosage: '80mg/480mg',
        frequency: 'Twice daily',
        duration: '3 days',
        route: 'Oral',
        instructions: 'Take with food',
        quantity: 6,
        refills_allowed: 0,
        status: 'Completed',
      },
    ]);
    console.log(` ${medications.length} medications seeded`);

    console.log('\n Hospital A data populated successfully!');
    console.log(`Summary:`);
    console.log(`   - Doctors: ${doctors.length}`);
    console.log(`   - Nurses: ${nurses.length}`);
    console.log(`   - Patients: ${patients.length}`);
    console.log(`   - Encounters: ${encounters.length}`);
    console.log(`   - Medications: ${medications.length}`);

  } catch (err) {
    console.error(' Error populating Hospital A:', err);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.close();
      console.log(' Disconnected from Hospital A database');
    }
    process.exit(0);
  }
}

// Run the seeding function
populateHospitalA();