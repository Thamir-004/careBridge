require('dotenv').config();
const mongoose = require('mongoose');

// Import model factory functions
const getPatientModelA = require('../hospitals/HospitalA/models/Patient');
const getPatientModelB = require('../hospitals/HospitalB/models/Patient');
const getEncounterModelA = require('../hospitals/HospitalA/models/Encounter');
const getEncounterModelB = require('../hospitals/HospitalB/models/Encounter');

const HOSPITAL_A_URI = process.env.HOSPITAL_A_MONGO_URI || 'mongodb://localhost:27017/hospital_a';
const HOSPITAL_A_ID = process.env.HOSPITAL_A_ID || 'HOSP_A_001';
const HOSPITAL_A_NAME = process.env.HOSPITAL_A_NAME || 'City General Hospital';

const HOSPITAL_B_URI = process.env.HOSPITAL_B_MONGO_URI || 'mongodb://localhost:27017/hospital_b';
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
        patient_id: patient.patient_id.replace('PAT-A-', 'PAT-B-'), // Change ID prefix
        national_id: patient.national_id,
        first_name: patient.first_name,
        last_name: patient.last_name,
        date_of_birth: patient.date_of_birth,
        gender: patient.gender,
        phone_number: patient.phone_number,
        email: patient.email,
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

      // Update patient in Hospital B
      patient.status = 'Transferred';
      patient.transfer_history.push({
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
      });
      await patient.save();

      // Create patient record in Hospital A
      const patientDataA = {
        patient_id: patient.patient_id.replace('PAT-B-', 'PAT-A-'), // Change ID prefix
        national_id: patient.national_id,
        first_name: patient.first_name,
        last_name: patient.last_name,
        date_of_birth: patient.date_of_birth,
        gender: patient.gender,
        phone_number: patient.phone_number,
        email: patient.email,
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

    // Generate some encounters for transferred patients at destination hospitals
    console.log('Generating encounters for transferred patients...');

    // Encounters for patients transferred to Hospital A
    for (let i = 0; i < Math.min(10, transfersBtoA.length); i++) {
      const patient = transfersBtoA[i];
      const doctorsA = await connectionA.model('Doctor', require('../hospitals/HospitalA/models/Doctor')).find({}).limit(5);
      const doctor = randomChoice(doctorsA);

      const encounterDate = new Date(patient.registration_date.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000); // Within 30 days after transfer

      const encounter = {
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
        encounter_type: 'Follow-up',
        encounter_date: encounterDate,
        reason_for_visit: 'Post-transfer follow-up and assessment',
        symptoms: ['Monitoring post-transfer'],
        vital_signs: {
          temperature: 36.5 + Math.random() * 1,
          blood_pressure: `${110 + Math.floor(Math.random() * 20)}/${70 + Math.floor(Math.random() * 20)}`,
          heart_rate: 65 + Math.floor(Math.random() * 20),
          weight: patient.date_of_birth && (new Date().getFullYear() - patient.date_of_birth.getFullYear()) > 18 ? 60 + Math.random() * 30 : 20 + Math.random() * 40,
          height: patient.date_of_birth && (new Date().getFullYear() - patient.date_of_birth.getFullYear()) > 18 ? 160 + Math.random() * 30 : 80 + Math.random() * 100,
        },
        diagnoses: [{
          description: 'Transferred patient - monitoring',
          type: 'Primary'
        }],
        treatment_plan: 'Continue monitoring and adjust treatment as needed',
        clinical_notes: 'Patient transferred from another facility. Assessing adaptation to new care environment.',
        encounter_status: 'Completed',
        status: 'Completed',
        transfer_info: {
          is_transferred: true,
          from_hospital: HOSPITAL_B_ID,
          to_hospital: HOSPITAL_A_ID,
          transfer_date: patient.registration_date,
          transfer_reason: patient.transfer_history[0].reason,
        },
      };

      await EncounterA.create(encounter);
    }

    // Encounters for patients transferred to Hospital B
    for (let i = 0; i < Math.min(12, transfersAtoB.length); i++) {
      const patient = transfersAtoB[i];
      const doctorsB = await connectionB.model('Doctor', require('../hospitals/HospitalB/models/Doctor')).find({}).limit(5);
      const doctor = randomChoice(doctorsB);

      const encounterDate = new Date(patient.registration_date.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000); // Within 30 days after transfer

      const encounter = {
        date: encounterDate,
        reason: 'Post-transfer assessment and care planning',
        notes: 'Patient recently transferred. Conducting thorough assessment and care coordination.',
        patient: patient._id,
        doctor: doctor._id,
        hospital: HOSPITAL_B_NAME,
      };

      await EncounterB.create(encounter);
    }

    console.log('\nPatient transfers populated successfully!');
    console.log(`Summary:`);
    console.log(`   - Transfers from A to B: ${transfersAtoB.length}`);
    console.log(`   - Transfers from B to A: ${transfersBtoA.length}`);
    console.log(`   - Follow-up encounters created: ${10 + 12}`);

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