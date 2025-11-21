require('dotenv').config();
const mongoose = require('mongoose');

// Import model factory functions
const getPatientModelA = require('../hospitals/HospitalA/models/Patient');
const getPatientModelB = require('../hospitals/HospitalB/models/Patient');
const getEncounterModelA = require('../hospitals/HospitalA/models/Encounter');
const getEncounterModelB = require('../hospitals/HospitalB/models/Encounter');

const HOSPITAL_A_URI = process.env.HOSPITAL_A_MONGO_URI;
const HOSPITAL_A_ID = process.env.HOSPITAL_A_ID || 'HOSP_A_001';
const HOSPITAL_A_NAME = process.env.HOSPITAL_A_NAME || 'City General Hospital';

const HOSPITAL_B_URI = process.env.HOSPITAL_B_MONGO_URI;
const HOSPITAL_B_ID = process.env.HOSPITAL_B_ID || 'HOSP_B_001';
const HOSPITAL_B_NAME = process.env.HOSPITAL_B_NAME || 'Metro Medical Center';

// Utility functions
function randomChoice(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

async function populateTransfers() {
  let connectionA, connectionB;

  try {
    console.log('Connecting to Hospital A and B databases...');
    connectionA = await mongoose.createConnection(HOSPITAL_A_URI, { maxPoolSize: 10 });
    connectionB = await mongoose.createConnection(HOSPITAL_B_URI, { maxPoolSize: 10 });
    console.log('Connected to both databases');

    // Get models
    const PatientA = getPatientModelA(connectionA);
    const PatientB = getPatientModelB(connectionB);
    const EncounterA = getEncounterModelA(connectionA);
    const EncounterB = getEncounterModelB(connectionB);

    // Get existing patients from both hospitals
    const patientsA = await PatientA.find({}).limit(50); // Get first 50 patients from A
    const patientsB = await PatientB.find({}).limit(50); // Get first 50 patients from B

    console.log(`Found ${patientsA.length} patients in Hospital A and ${patientsB.length} in Hospital B`);

    // Transfer reasons
    const transferReasons = [
      'Specialized cardiac care needed',
      'Neurological expertise required',
      'Capacity constraints at current hospital',
      'Patient requested transfer',
      'Family preference',
      'Insurance coverage change',
      'Better facilities available',
      'Emergency transfer due to critical condition',
      'Post-operative care specialization',
      'Pediatric specialist required',
      'Oncological treatment needed',
      'Rehabilitation services',
      'Mental health specialized care',
      'Burn treatment center required',
      'Trauma center capabilities'
    ];

    const transferNotes = [
      'Patient requires advanced treatment not available at current facility',
      'Transfer approved by medical director',
      'Urgent transfer due to deteriorating condition',
      'Scheduled transfer for specialized procedure',
      'Patient transportation arranged via ambulance',
      'Medical records transferred electronically',
      'Family consent obtained for transfer'
    ];

    // Generate transfers from A to B (25 transfers)
    console.log('Generating transfers from Hospital A to Hospital B...');
    const transfersAtoB = [];
    for (let i = 0; i < 25; i++) {
      const patient = patientsA[i];
      if (!patient) continue;

      const transferDate = randomDate(new Date('2024-07-01'), new Date());
      const reason = randomChoice(transferReasons);
      const notes = randomChoice(transferNotes);

      // Update patient in Hospital A
      patient.status = 'Transferred';
      patient.transfer_history.push({
        transfer_id: `TRF-A-B-${String(i + 1).padStart(3, '0')}`,
        from_hospital: HOSPITAL_A_ID,
        from_hospital_name: HOSPITAL_A_NAME,
        to_hospital: HOSPITAL_B_ID,
        to_hospital_name: HOSPITAL_B_NAME,
        transfer_date: transferDate,
        reason: reason,
        transferred_by: 'Dr. Admin',
        approved_by: 'Medical Director',
        notes: notes,
        status: 'Completed',
      });
      await patient.save();

      // Create patient record in Hospital B
      const patientDataB = {
        patient_id: `PAT-B-T${String(i + 1).padStart(3, '0')}`, // Use T prefix for transferred patients
        national_id: parseInt(patient.national_id.replace('NID', '')), // Convert string to number
        first_name: patient.first_name,
        last_name: patient.last_name,
        date_of_birth: patient.date_of_birth,
        gender: patient.gender,
        phone_number: patient.phone_number,
        email: patient.email.replace('@email.com', '-transferred@email.com'), // Modify email to avoid conflicts
        address: patient.address,
        blood_type: patient.blood_type,
        allergies: patient.allergies,
        chronic_conditions: patient.chronic_conditions,
        current_medications: patient.current_medications,
        hospital_id: HOSPITAL_B_ID,
        hospital_name: HOSPITAL_B_NAME,
        status: 'Active',
        registration_date: transferDate,
        transfer_history: [{
          transfer_id: `TRF-A-B-${String(i + 1).padStart(3, '0')}`,
          from_hospital: HOSPITAL_A_ID,
          from_hospital_name: HOSPITAL_A_NAME,
          to_hospital: HOSPITAL_B_ID,
          to_hospital_name: HOSPITAL_B_NAME,
          transfer_date: transferDate,
          reason: reason,
          transferred_by: 'Dr. Admin',
          approved_by: 'Medical Director',
          notes: notes,
          status: 'Completed',
        }],
        sync_metadata: {
          original_hospital: HOSPITAL_A_ID,
          last_synced_at: new Date(),
          sync_version: 2,
          is_primary: false, // This is a transferred record
        },
      };

      await PatientB.create(patientDataB);
      transfersAtoB.push(patientDataB);
    }

    // Generate transfers from B to A (20 transfers)
    console.log('Generating transfers from Hospital B to Hospital A...');
    const transfersBtoA = [];
    for (let i = 0; i < 20; i++) {
      const patient = patientsB[i];
      if (!patient) continue;

      const transferDate = randomDate(new Date('2024-08-01'), new Date());
      const reason = randomChoice(transferReasons);
      const notes = randomChoice(transferNotes);

      // Update patient in Hospital B (Hospital B doesn't have transfer_history field)
      patient.status = 'Transferred';
      // Note: Hospital B schema doesn't include transfer_history
      await patient.save();

      // Create patient record in Hospital A
      const patientDataA = {
        patient_id: `PAT-A-T${String(i + 1).padStart(3, '0')}`, // Use T prefix for transferred patients
        national_id: `NID${String(patient.national_id).padStart(6, '0')}`, // Convert number to string format
        first_name: patient.first_name,
        last_name: patient.last_name,
        date_of_birth: patient.date_of_birth,
        gender: patient.gender,
        phone_number: patient.phone_number,
        email: patient.email.replace('@email.com', '-transferred@email.com'), // Modify email to avoid conflicts
        address: patient.address,
        blood_type: patient.blood_type,
        allergies: patient.allergies,
        chronic_conditions: patient.chronic_conditions,
        current_medications: patient.current_medications,
        hospital_id: HOSPITAL_A_ID,
        hospital_name: HOSPITAL_A_NAME,
        status: 'Active',
        registration_date: transferDate,
        transfer_history: [{
          transfer_id: `TRF-B-A-${String(i + 1).padStart(3, '0')}`,
          from_hospital: HOSPITAL_B_ID,
          from_hospital_name: HOSPITAL_B_NAME,
          to_hospital: HOSPITAL_A_ID,
          to_hospital_name: HOSPITAL_A_NAME,
          transfer_date: transferDate,
          reason: reason,
          transferred_by: 'Dr. Admin',
          approved_by: 'Medical Director',
          notes: notes,
          status: 'Completed',
        }],
        sync_metadata: {
          original_hospital: HOSPITAL_B_ID,
          last_synced_at: new Date(),
          sync_version: 2,
          is_primary: false, // This is a transferred record
        },
      };

      await PatientA.create(patientDataA);
      transfersBtoA.push(patientDataA);
    }

    // Skip encounter generation for now to focus on core data population
    console.log('Skipping encounter generation for transferred patients (can be added later)');

    console.log('\nPatient transfers populated successfully!');
    console.log(`Summary:`);
    console.log(`   - Transfers from A to B: ${transfersAtoB.length}`);
    console.log(`   - Transfers from B to A: ${transfersBtoA.length}`);
    console.log(`   - Follow-up encounters: Skipped (can be added later)`);

  } catch (err) {
    console.error('Error populating transfers:', err);
    process.exit(1);
  } finally {
    if (connectionA) {
      await connectionA.close();
      console.log('Disconnected from Hospital A database');
    }
    if (connectionB) {
      await connectionB.close();
      console.log('Disconnected from Hospital B database');
    }
    process.exit(0);
  }
}

// Run the seeding function
populateTransfers();