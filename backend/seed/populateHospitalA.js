require('dotenv').config();
const mongoose = require('mongoose');

// Import model factory functions
const getPatientModel = require('../hospitals/HospitalA/models/Patient');
const getDoctorModel = require('../hospitals/HospitalA/models/Doctor');
const getNurseModel = require('../hospitals/HospitalA/models/Nurse');
const getEncounterModel = require('../hospitals/HospitalA/models/Encounter');
const getMedicationModel = require('../hospitals/HospitalA/models/Medication');

const HOSPITAL_A_URI = process.env.HOSPITAL_A_MONGO_URI || 'mongodb://localhost:27017/hospital_a';
const HOSPITAL_A_ID = process.env.HOSPITAL_A_ID || 'HOSP_A_001';
const HOSPITAL_A_NAME = process.env.HOSPITAL_A_NAME || 'City General Hospital';

// Utility functions for generating realistic data
function randomChoice(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function generatePhoneNumber() {
  const prefixes = ['0700', '0701', '0702', '0703', '0704', '0705', '0706', '0707', '0708', '0709', '0710', '0711', '0712', '0713', '0714', '0715', '0716', '0717', '0718', '0719', '0720', '0721', '0722', '0723', '0724', '0725', '0726', '0727', '0728', '0729', '0730', '0731', '0732', '0733', '0734', '0735', '0736', '0737', '0738', '0739'];
  const prefix = randomChoice(prefixes);
  const number = Math.floor(Math.random() * 10000000).toString().padStart(7, '0');
  return `${prefix}${number}`;
}

function generateKenyanName(gender) {
  const maleFirstNames = ['John', 'James', 'Peter', 'Paul', 'Michael', 'David', 'Joseph', 'Daniel', 'Samuel', 'Simon', 'Thomas', 'Andrew', 'Robert', 'William', 'Richard', 'Charles', 'Anthony', 'Edward', 'Francis', 'George', 'Henry', 'Isaac', 'Jacob', 'Kenneth', 'Lawrence', 'Martin', 'Nicholas', 'Oliver', 'Patrick', 'Quincy', 'Raymond', 'Stephen', 'Timothy', 'Victor', 'Walter'];
  const femaleFirstNames = ['Mary', 'Sarah', 'Elizabeth', 'Margaret', 'Susan', 'Jennifer', 'Dorothy', 'Barbara', 'Patricia', 'Linda', 'Karen', 'Lisa', 'Nancy', 'Betty', 'Helen', 'Sandra', 'Donna', 'Carol', 'Ruth', 'Sharon', 'Michelle', 'Laura', 'Kimberly', 'Deborah', 'Pamela', 'Cynthia', 'Sandra', 'Deborah', 'Donna', 'Carol'];
  const lastNames = ['Oduya', 'Wanjiku', 'Kiprop', 'Cheruiyot', 'Koech', 'Rono', 'Langat', 'Kiprotich', 'Chepkirui', 'Jeptoo', 'Mutai', 'Kemboi', 'Biwott', 'Koskei', 'Tanui', 'Kipruto', 'Kirui', 'Sang', 'Yego', 'Kipkemoi', 'Ngetich', 'Rutto', 'Kipkoech', 'Cherop', 'Kipngeno', 'Sigei', 'Kiprop', 'Kipkorir', 'Kipchumba', 'Kipngetich'];

  const firstNames = gender === 'Male' ? maleFirstNames : femaleFirstNames;
  return {
    firstName: randomChoice(firstNames),
    lastName: randomChoice(lastNames)
  };
}

async function populateHospitalA() {
  let connection;

  try {
    console.log('Connecting to Hospital A database...');
    connection = await mongoose.createConnection(HOSPITAL_A_URI, {
      maxPoolSize: 10,
    });
    console.log('Connected to Hospital A database');

    // Get models using the connection
    const Patient = getPatientModel(connection);
    const Doctor = getDoctorModel(connection);
    const Nurse = getNurseModel(connection);
    const Encounter = getEncounterModel(connection);
    const Medication = getMedicationModel(connection);

    // Clear existing data
    console.log('Clearing existing data...');
    await Promise.all([
      Patient.deleteMany({}),
      Doctor.deleteMany({}),
      Nurse.deleteMany({}),
      Encounter.deleteMany({}),
      Medication.deleteMany({}),
    ]);
    console.log('Existing data cleared');

    // Generate Doctors (15 doctors with various specialties)
    console.log('Generating doctors...');
    const specialties = ['Cardiology', 'Pediatrics', 'General Practice', 'Orthopedics', 'Dermatology', 'Neurology', 'Psychiatry', 'Ophthalmology', 'ENT', 'Gynecology', 'Urology', 'Radiology', 'Emergency Medicine', 'Internal Medicine', 'Surgery'];
    const departments = ['Cardiology', 'Pediatrics', 'General Medicine', 'Orthopedics', 'Dermatology', 'Neurology', 'Psychiatry', 'Ophthalmology', 'ENT', 'Gynecology', 'Urology', 'Radiology', 'Emergency', 'Internal Medicine', 'Surgery'];

    const doctors = [];
    const usedDoctorEmails = new Set();

    for (let i = 1; i <= 15; i++) {
      const gender = randomChoice(['Male', 'Female']);
      const names = generateKenyanName(gender);
      const specialty = specialties[(i - 1) % specialties.length];
      const department = departments[(i - 1) % departments.length];

      // Ensure unique email
      let email = `${names.firstName.toLowerCase()}.${names.lastName.toLowerCase()}@citygeneralhospital.com`;
      let counter = 1;
      while (usedDoctorEmails.has(email)) {
        email = `${names.firstName.toLowerCase()}.${names.lastName.toLowerCase()}${counter}@citygeneralhospital.com`;
        counter++;
      }
      usedDoctorEmails.add(email);

      doctors.push({
        doctor_id: `DOC-A-${String(i).padStart(3, '0')}`,
        license_number: `KE-MED-${String(10000 + i).padStart(5, '0')}`,
        first_name: names.firstName,
        last_name: names.lastName,
        specialty: specialty,
        phone_number: generatePhoneNumber(),
        email: email,
        hospital_id: HOSPITAL_A_ID,
        hospital_name: HOSPITAL_A_NAME,
        department: department,
        availability_status: randomChoice(['Available', 'Available', 'Available', 'On Leave']), // Mostly available
        status: 'Active',
      });
    }

    const insertedDoctors = await Doctor.insertMany(doctors);
    console.log(`${insertedDoctors.length} doctors seeded`);

    // Generate Nurses (10 nurses)
    console.log('Generating nurses...');
    const nurses = [];
    for (let i = 1; i <= 10; i++) {
      const gender = randomChoice(['Male', 'Female']);
      const names = generateKenyanName(gender);
      const department = randomChoice(departments);

      nurses.push({
        nurse_id: `NUR-A-${String(i).padStart(3, '0')}`,
        license_number: `KE-NUR-${String(20000 + i).padStart(5, '0')}`,
        first_name: names.firstName,
        last_name: names.lastName,
        phone_number: generatePhoneNumber(),
        email: `${names.firstName.toLowerCase()}.${names.lastName.toLowerCase()}@citygeneralhospital.com`,
        hospital_id: HOSPITAL_A_ID,
        hospital_name: HOSPITAL_A_NAME,
        department: department,
        shift: randomChoice(['Morning', 'Evening', 'Night']),
        availability_status: randomChoice(['Available', 'Available', 'Available', 'Busy']),
        status: 'Active',
      });
    }

    const insertedNurses = await Nurse.insertMany(nurses);
    console.log(`${insertedNurses.length} nurses seeded`);

    // Generate Patients (200 patients with diverse demographics)
    console.log('Generating patients...');
    const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    const cities = ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika', 'Kitale', 'Malindi', 'Garissa', 'Kakamega'];
    const streets = ['Koinange Street', 'Luthuli Avenue', 'Tom Mboya Street', 'Moi Avenue', 'River Road', 'Westlands Road', 'Ngong Road', 'Mombasa Road', 'Jogoo Road', 'Outering Road'];

    const patients = [];
    const usedEmails = new Set();

    for (let i = 1; i <= 200; i++) {
      const gender = randomChoice(['Male', 'Female']);
      const names = generateKenyanName(gender);
      const age = Math.floor(Math.random() * 80) + 1; // 1-80 years old
      const birthYear = new Date().getFullYear() - age;
      const bloodType = randomChoice(bloodTypes);
      const city = randomChoice(cities);
      const street = randomChoice(streets);

      // Ensure unique email
      let email = `${names.firstName.toLowerCase()}.${names.lastName.toLowerCase()}@email.com`;
      let counter = 1;
      while (usedEmails.has(email)) {
        email = `${names.firstName.toLowerCase()}.${names.lastName.toLowerCase()}${counter}@email.com`;
        counter++;
      }
      usedEmails.add(email);

      patients.push({
        patient_id: `PAT-A-${String(i).padStart(3, '0')}`,
        national_id: `NID${String(i).padStart(6, '0')}`,
        first_name: names.firstName,
        last_name: names.lastName,
        date_of_birth: new Date(birthYear, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        gender: gender,
        phone_number: generatePhoneNumber(),
        email: email,
        address: {
          street: `${Math.floor(Math.random() * 999) + 1} ${street}`,
          city: city,
          state: `${city} County`,
          zip_code: String(Math.floor(Math.random() * 90000) + 10000),
          country: 'Kenya',
        },
        blood_type: bloodType,
        hospital_id: HOSPITAL_A_ID,
        hospital_name: HOSPITAL_A_NAME,
        status: 'Active',
        sync_metadata: {
          original_hospital: HOSPITAL_A_ID,
        },
      });
    }

    const insertedPatients = await Patient.insertMany(patients);
    console.log(`${insertedPatients.length} patients seeded`);

    // Generate Encounters (600 encounters spanning 6 months)
    console.log('Generating encounters...');
    const encounterTypes = ['Outpatient', 'Inpatient', 'Emergency', 'Follow-up', 'Consultation'];
    const symptoms = [
      'Fever', 'Headache', 'Cough', 'Chest pain', 'Abdominal pain', 'Back pain', 'Joint pain',
      'Shortness of breath', 'Nausea', 'Vomiting', 'Diarrhea', 'Fatigue', 'Dizziness',
      'Sore throat', 'Runny nose', 'Skin rash', 'High blood pressure', 'Diabetes symptoms'
    ];
    const diagnoses = [
      'Common cold', 'Hypertension', 'Diabetes mellitus', 'Pneumonia', 'Gastritis', 'Arthritis',
      'Bronchitis', 'Migraine', 'Anemia', 'Thyroid disorder', 'Allergic reaction', 'Injury',
      'Infection', 'Heart condition', 'Respiratory infection', 'Digestive disorder', 'Mental health issue'
    ];
    const reasons = [
      'Routine checkup', 'Fever and body aches', 'Chest pain', 'Abdominal pain', 'Headache',
      'Cough and cold', 'High blood pressure', 'Diabetes management', 'Injury treatment',
      'Follow-up visit', 'Vaccination', 'Pregnancy check', 'Mental health consultation'
    ];

    const encounters = [];
    const startDate = new Date('2024-06-01'); // 6 months ago
    const endDate = new Date(); // Today
    let encounterCounter = 1;

    for (let i = 1; i <= 600; i++) {
      const patient = insertedPatients[Math.floor(Math.random() * insertedPatients.length)];
      const doctor = insertedDoctors[Math.floor(Math.random() * insertedDoctors.length)];
      const encounterType = randomChoice(encounterTypes);
      const encounterDate = randomDate(startDate, endDate);
      const reason = randomChoice(reasons);
      const selectedSymptoms = symptoms.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 4) + 1);
      const diagnosis = randomChoice(diagnoses);

      // Generate vital signs based on age and condition
      const temperature = 36.1 + Math.random() * 3; // 36.1-39.1°C
      const systolic = 90 + Math.floor(Math.random() * 60); // 90-150
      const diastolic = 60 + Math.floor(Math.random() * 40); // 60-100
      const heartRate = 60 + Math.floor(Math.random() * 60); // 60-120
      const weight = patient.date_of_birth && (new Date().getFullYear() - patient.date_of_birth.getFullYear()) > 18
        ? 50 + Math.random() * 50 // Adults: 50-100kg
        : 5 + Math.random() * 35; // Children: 5-40kg
      const height = patient.date_of_birth && (new Date().getFullYear() - patient.date_of_birth.getFullYear()) > 18
        ? 150 + Math.random() * 40 // Adults: 150-190cm
        : 50 + Math.random() * 100; // Children: 50-150cm

      // Generate unique encounter_id using counter
      const encounterId = `ENC-A-${String(encounterCounter).padStart(6, '0')}`;
      encounterCounter++;

      encounters.push({
        encounter_id: encounterId,
        patient: {
          patient_id: patient.patient_id,
          patient_ref: patient._id,
          patient_name: `${patient.first_name} ${patient.last_name}`,
        },
        doctor: {
          doctor_id: doctor.doctor_id,
          doctor_ref: doctor._id,
          doctor_name: `Dr. ${doctor.first_name} ${doctor.last_name}`,
        },
        hospital_id: HOSPITAL_A_ID,
        hospital_name: HOSPITAL_A_NAME,
        encounter_type: encounterType,
        encounter_date: encounterDate,
        reason_for_visit: reason,
        symptoms: selectedSymptoms,
        vital_signs: {
          temperature: Math.round(temperature * 10) / 10,
          blood_pressure: `${systolic}/${diastolic}`,
          heart_rate: heartRate,
          weight: Math.round(weight * 10) / 10,
          height: Math.round(height),
        },
        diagnoses: [{
          description: diagnosis,
          type: 'Primary'
        }],
        treatment_plan: `Treatment for ${diagnosis.toLowerCase()}`,
        clinical_notes: `Patient presented with ${selectedSymptoms.join(', ').toLowerCase()}. Diagnosis: ${diagnosis}.`,
        encounter_status: 'Completed',
        status: 'Completed',
      });
    }

    const insertedEncounters = await Encounter.insertMany(encounters);
    console.log(`${insertedEncounters.length} encounters seeded`);

    // Generate Medications (400 medications linked to encounters)
    console.log('Generating medications...');
    const medicationNames = [
      'Paracetamol', 'Ibuprofen', 'Amoxicillin', 'Metformin', 'Amlodipine', 'Omeprazole',
      'Simvastatin', 'Losartan', 'Aspirin', 'Warfarin', 'Insulin', 'Prednisone', 'Furosemide',
      'Metoprolol', 'Atorvastatin', 'Levothyroxine', 'Albuterol', 'Cetirizine', 'Loratadine'
    ];
    const dosages = ['500mg', '250mg', '100mg', '50mg', '25mg', '10mg', '5mg', '2.5mg'];
    const frequencies = ['Once daily', 'Twice daily', 'Three times daily', 'Four times daily', 'As needed', 'Every 6 hours', 'Every 8 hours', 'Every 12 hours'];
    const durations = ['3 days', '5 days', '7 days', '10 days', '14 days', '30 days', '60 days', '90 days'];
    const routes = ['Oral', 'IV', 'IM', 'Topical', 'Inhalation', 'Other'];

    const medications = [];
    let prescriptionCounter = 1;

    for (let i = 1; i <= 400; i++) {
      const encounter = insertedEncounters[Math.floor(Math.random() * insertedEncounters.length)];
      const patient = insertedPatients.find(p => p.patient_id === encounter.patient.patient_id);
      const doctor = insertedDoctors.find(d => d.doctor_id === encounter.doctor.doctor_id);
      const medicationName = randomChoice(medicationNames);
      const dosage = randomChoice(dosages);
      const frequency = randomChoice(frequencies);
      const duration = randomChoice(durations);
      const route = randomChoice(routes);

      // Generate unique prescription_id
      const prescriptionId = `RX-A-${String(prescriptionCounter).padStart(6, '0')}`;
      prescriptionCounter++;

      medications.push({
        prescription_id: prescriptionId,
        encounter: {
          encounter_id: encounter.encounter_id,
          encounter_ref: encounter._id,
        },
        patient: {
          patient_id: patient.patient_id,
          patient_name: `${patient.first_name} ${patient.last_name}`,
        },
        doctor: {
          doctor_id: doctor.doctor_id,
          doctor_name: `Dr. ${doctor.first_name} ${doctor.last_name}`,
        },
        hospital_id: HOSPITAL_A_ID,
        medication_name: medicationName,
        generic_name: medicationName, // Simplified
        dosage: dosage,
        frequency: frequency,
        duration: duration,
        route: route,
        instructions: `Take ${dosage} ${frequency.toLowerCase()} for ${duration}`,
        quantity: Math.floor(Math.random() * 30) + 1,
        refills_allowed: Math.floor(Math.random() * 3),
        status: randomChoice(['Active', 'Completed', 'Active', 'Active']), // Mostly active
      });
    }

    const insertedMedications = await Medication.insertMany(medications);
    console.log(`${insertedMedications.length} medications seeded`);

    console.log('\nHospital A enhanced data populated successfully!');
    console.log(`Summary:`);
    console.log(`   - Doctors: ${insertedDoctors.length}`);
    console.log(`   - Nurses: ${insertedNurses.length}`);
    console.log(`   - Patients: ${insertedPatients.length}`);
    console.log(`   - Encounters: ${insertedEncounters.length}`);
    console.log(`   - Medications: ${insertedMedications.length}`);

  } catch (err) {
    console.error('Error populating Hospital A:', err);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.close();
      console.log('Disconnected from Hospital A database');
    }
    process.exit(0);
  }
}

// Run the seeding function
populateHospitalA();