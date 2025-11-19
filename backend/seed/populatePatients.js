require('dotenv').config();
const mongoose = require('mongoose');

// Import model factory functions
const getPatientModel = require('../hospitals/HospitalA/models/Patient');

const HOSPITAL_A_URI = process.env.HOSPITAL_A_MONGO_URI || 'mongodb://localhost:27017/hospital_a';
const HOSPITAL_A_ID = process.env.HOSPITAL_A_ID || 'HOSP_A_001';
const HOSPITAL_A_NAME = process.env.HOSPITAL_A_NAME || 'City General Hospital';

// Static patient data from frontend
const initialPatients = [
  {
    id: "PAT-A-001",
    name: "John Doe",
    age: 34,
    gender: "Male",
    bloodType: "O+",
    phone: "+254712345678",
    status: "active",
    hospital: "City General",
  },
  {
    id: "PAT-A-002",
    name: "Mary Atieno",
    age: 28,
    gender: "Female",
    bloodType: "A+",
    phone: "+254723456789",
    status: "active",
    hospital: "City General",
  },
  {
    id: "PAT-A-003",
    name: "David Kamau",
    age: 45,
    gender: "Male",
    bloodType: "B+",
    phone: "+254734567890",
    status: "transferred",
    hospital: "County Medical",
  },
  {
    id: "PAT-A-004",
    name: "Sarah Wanjiku",
    age: 52,
    gender: "Female",
    bloodType: "AB+",
    phone: "+254745678901",
    status: "active",
    hospital: "City General",
  },
  {
    id: "PAT-A-005",
    name: "James Omondi",
    age: 39,
    gender: "Male",
    bloodType: "O-",
    phone: "+254756789012",
    status: "active",
    hospital: "City General",
  },
];

async function populatePatients() {
  let connection;

  try {
    console.log('Connecting to Hospital A database...');
    connection = await mongoose.createConnection(HOSPITAL_A_URI, {
      maxPoolSize: 10,
    });
    console.log('Connected to Hospital A database');

    // Get models using the connection
    const Patient = getPatientModel(connection);

    // Clear existing patients (optional, but to avoid duplicates)
    console.log('Clearing existing patients...');
    await Patient.deleteMany({});
    console.log('Existing patients cleared');

    // Map frontend data to schema
    const patientsData = initialPatients.map((patient, index) => {
      const nameParts = patient.name.split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ') || 'Unknown';
      const birthYear = new Date().getFullYear() - patient.age - 1; // Approximate DOB

      return {
        patient_id: patient.id,
        national_id: `NID${String(index + 1).padStart(3, '0')}`,
        first_name: firstName,
        last_name: lastName,
        date_of_birth: new Date(birthYear, 0, 1), // Jan 1 of birth year
        gender: patient.gender,
        phone_number: patient.phone,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com`,
        address: {
          street: '123 Main Street',
          city: 'Nairobi',
          state: 'Nairobi County',
          zip_code: '00100',
          country: 'Kenya',
        },
        blood_type: patient.bloodType,
        hospital_id: HOSPITAL_A_ID,
        hospital_name: HOSPITAL_A_NAME,
        status: patient.status === 'active' ? 'Active' : 'Transferred',
        sync_metadata: {
          original_hospital: HOSPITAL_A_ID,
        },
      };
    });

    // Insert patients
    console.log('Seeding patients...');
    const patients = await Patient.insertMany(patientsData);
    console.log(`${patients.length} patients seeded`);

    console.log('\nPatients data populated successfully!');

  } catch (err) {
    console.error('Error populating patients:', err);
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
populatePatients();