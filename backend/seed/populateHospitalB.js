require('dotenv').config();
const mongoose = require('mongoose');

// Import model factory functions
const getPatientModel = require('../hospitals/HospitalB/models/Patient');
const getDoctorModel = require('../hospitals/HospitalB/models/Doctor');
const getNurseModel = require('../hospitals/HospitalB/models/Nurse');
const getEncounterModel = require('../hospitals/HospitalB/models/Encounter');
const getMedicationModel = require('../hospitals/HospitalB/models/Medication');

const HOSPITAL_B_URI = process.env.HOSPITAL_B_MONGO_URI;
const HOSPITAL_B_ID = process.env.HOSPITAL_B_ID || 'HOSP_B_001';
const HOSPITAL_B_NAME = process.env.HOSPITAL_B_NAME || 'Metro Medical Center';

// Utility functions for generating realistic data
function randomChoice(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function generatePhoneNumber() {
  // Valid Kenyan prefixes: 071, 072, 073, 074, 075, 076, 077, 078, 079
  const prefixes = ['071', '072', '073', '074', '075', '076', '077', '078', '079'];
  const prefix = randomChoice(prefixes);
  const number = Math.floor(Math.random() * 10000000).toString().padStart(7, '0'); // Exactly 7 digits
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

async function populateHospitalB() {
  let connection;

  try {
    console.log('Connecting to Hospital B database...');
    connection = await mongoose.createConnection(HOSPITAL_B_URI, {
      maxPoolSize: 10,
    });
    console.log('Connected to Hospital B database');

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

    // Generate Doctors (12 doctors with various specialties)
    console.log('Generating doctors...');
    const specialties = ['Cardiology', 'Pediatrics', 'General Practice', 'Orthopedics', 'Dermatology', 'Neurology', 'Psychiatry', 'Ophthalmology', 'ENT', 'Gynecology', 'Urology', 'Emergency Medicine'];
    const departments = ['Cardiology', 'Pediatrics', 'General Medicine', 'Orthopedics', 'Dermatology', 'Neurology', 'Psychiatry', 'Ophthalmology', 'ENT', 'Gynecology', 'Urology', 'Emergency'];

    const doctors = [];
    const usedDoctorEmails = new Set();

    for (let i = 1; i <= 12; i++) {
      const gender = randomChoice(['Male', 'Female']);
      const names = generateKenyanName(gender);
      const specialty = specialties[(i - 1) % specialties.length];
      const department = departments[(i - 1) % departments.length];

      // Ensure unique email
      let email = `${names.firstName.toLowerCase()}.${names.lastName.toLowerCase()}@metromedicalcenter.com`;
      let counter = 1;
      while (usedDoctorEmails.has(email)) {
        email = `${names.firstName.toLowerCase()}.${names.lastName.toLowerCase()}${counter}@metromedicalcenter.com`;
        counter++;
      }
      usedDoctorEmails.add(email);

      doctors.push({
        doctor_id: `DOC-B-${String(i).padStart(3, '0')}`,
        license_number: `KE-MED-${String(30000 + i).padStart(5, '0')}`,
        first_name: names.firstName,
        last_name: names.lastName,
        specialty: specialty,
        phone_number: generatePhoneNumber(),
        email: email,
        hospital_id: HOSPITAL_B_ID,
        hospital_name: HOSPITAL_B_NAME,
        department: department,
        availability_status: randomChoice(['Available', 'Available', 'Available', 'On Leave']),
        status: 'Active',
      });
    }

    const insertedDoctors = await Doctor.insertMany(doctors);
    console.log(`${insertedDoctors.length} doctors seeded`);

    // Generate Nurses (8 nurses)
    console.log('Generating nurses...');
    const nurses = [];
    for (let i = 1; i <= 8; i++) {
      const gender = randomChoice(['Male', 'Female']);
      const names = generateKenyanName(gender);
      const department = randomChoice(departments);

      nurses.push({
        nurse_id: `NUR-B-${String(i).padStart(3, '0')}`,
        license_number: `KE-NUR-${String(40000 + i).padStart(5, '0')}`,
        first_name: names.firstName,
        last_name: names.lastName,
        phone_number: generatePhoneNumber(),
        email: `${names.firstName.toLowerCase()}.${names.lastName.toLowerCase()}@metromedicalcenter.com`,
        hospital_id: HOSPITAL_B_ID,
        hospital_name: HOSPITAL_B_NAME,
        department: department,
        shift: randomChoice(['Morning', 'Evening', 'Night']),
        availability_status: randomChoice(['Available', 'Available', 'Available', 'Busy']),
        status: 'Active',
      });
    }

    const insertedNurses = await Nurse.insertMany(nurses);
    console.log(`${insertedNurses.length} nurses seeded`);

    // Generate Patients (180 patients with diverse demographics)
    console.log('Generating patients...');
    const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    const cities = ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika', 'Kitale', 'Malindi', 'Garissa', 'Kakamega'];
    const streets = ['Koinange Street', 'Luthuli Avenue', 'Tom Mboya Street', 'Moi Avenue', 'River Road', 'Westlands Road', 'Ngong Road', 'Mombasa Road', 'Jogoo Road', 'Outering Road'];

    const patients = [];
    const usedEmails = new Set();

    for (let i = 1; i <= 180; i++) {
      const gender = randomChoice(['Male', 'Female']);
      const names = generateKenyanName(gender);
      const age = Math.floor(Math.random() * 80) + 1; // 1-80 years old
      const birthYear = new Date().getFullYear() - age;
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
        patient_id: `PAT-B-${String(i).padStart(3, '0')}`,
        national_id: 100000 + i, // Number type for Hospital B
        first_name: names.firstName,
        last_name: names.lastName,
        date_of_birth: new Date(birthYear, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        gender: gender,
        phone_number: generatePhoneNumber(),
        email: email,
        address: `${Math.floor(Math.random() * 999) + 1} ${street}, ${city}, ${city} County, Kenya`, // String type for Hospital B
        hospital_name: HOSPITAL_B_NAME,
      });
    }

    const insertedPatients = await Patient.insertMany(patients);
    console.log(`${insertedPatients.length} patients seeded`);

    // Generate Encounters (500 encounters spanning 6 months)
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

    for (let i = 1; i <= 500; i++) {
      const patient = insertedPatients[Math.floor(Math.random() * insertedPatients.length)];
      const doctor = insertedDoctors[Math.floor(Math.random() * insertedDoctors.length)];
      const encounterDate = randomDate(startDate, endDate);
      const reason = randomChoice(reasons);

      encounters.push({
        date: encounterDate,
        reason: reason,
        notes: `Patient visit for ${reason.toLowerCase()}`,
        patient: patient._id, // Hospital B expects ObjectId reference
        doctor: doctor._id, // Hospital B expects ObjectId reference
        hospital: HOSPITAL_B_NAME,
      });
    }

    const insertedEncounters = await Encounter.insertMany(encounters);
    console.log(`${insertedEncounters.length} encounters seeded`);

    // Generate Medications (350 medications linked to encounters)
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

    for (let i = 1; i <= 350; i++) {
      const encounter = insertedEncounters[Math.floor(Math.random() * insertedEncounters.length)];
      const medicationName = randomChoice(medicationNames);
      const dosage = randomChoice(dosages);
      const duration = randomChoice(durations);

      // Generate unique prescription_id
      const prescriptionId = `RX-B-${String(prescriptionCounter).padStart(6, '0')}`;
      prescriptionCounter++;

      medications.push({
        prescription_id: prescriptionId,
        encounter: encounter._id, // Hospital B expects ObjectId reference
        medication: medicationName,
        dosage: dosage,
        duration: duration,
      });
    }

    const insertedMedications = await Medication.insertMany(medications);
    console.log(`${insertedMedications.length} medications seeded`);

    console.log('\nHospital B enhanced data populated successfully!');
    console.log(`Summary:`);
    console.log(`   - Doctors: ${insertedDoctors.length}`);
    console.log(`   - Nurses: ${insertedNurses.length}`);
    console.log(`   - Patients: ${insertedPatients.length}`);
    console.log(`   - Encounters: ${insertedEncounters.length}`);
    console.log(`   - Medications: ${insertedMedications.length}`);

  } catch (err) {
    console.error('Error populating Hospital B:', err);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.close();
      console.log('Disconnected from Hospital B database');
    }
    process.exit(0);
  }
}

// Run the seeding function
populateHospitalB();