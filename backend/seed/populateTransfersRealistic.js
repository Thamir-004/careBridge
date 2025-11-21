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

function randomWeightedChoice(items, weights) {
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  let random = Math.random() * totalWeight;

  for (let i = 0; i < items.length; i++) {
    random -= weights[i];
    if (random <= 0) {
      return items[i];
    }
  }
  return items[items.length - 1];
}

function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function getSeasonalMultiplier(month) {
  // Higher transfers in winter (Dec-Feb) for flu season, lower in summer (Jun-Aug)
  const seasonalFactors = [1.2, 1.3, 1.1, 0.9, 0.8, 0.7, 0.8, 0.9, 1.0, 1.1, 1.2, 1.4];
  return seasonalFactors[month];
}

function getWeeklyMultiplier(dayOfWeek) {
  // Monday = 0, Sunday = 6
  // More transfers on weekdays, fewer on weekends
  const weeklyFactors = [1.0, 1.1, 1.2, 1.1, 1.0, 0.8, 0.7];
  return weeklyFactors[dayOfWeek];
}

function getHourlyMultiplier(hour) {
  // Peak hours: 8-18 (business hours), lower at night
  if (hour >= 8 && hour <= 18) {
    return 1.2 + Math.random() * 0.3; // 1.2-1.5
  } else if (hour >= 6 && hour <= 22) {
    return 0.8 + Math.random() * 0.4; // 0.8-1.2
  } else {
    return 0.3 + Math.random() * 0.3; // 0.3-0.6 (night hours)
  }
}

async function populateTransfersRealistic() {
  let connectionA, connectionB;

  try {
    console.log('Connecting to Hospital A and B databases...');
    connectionA = await mongoose.createConnection(HOSPITAL_A_URI, { maxPoolSize: 10 });
    connectionB = await mongoose.createConnection(HOSPITAL_B_URI, { maxPoolSize: 10 });
    console.log('Connected to both databases');

    // Get models
    const PatientA = getPatientModelA(connectionA);
    const PatientB = getPatientModelB(connectionB);

    // Get existing patients from both hospitals
    const patientsA = await PatientA.find({}).limit(200); // More patients for realistic data
    const patientsB = await PatientB.find({}).limit(200);

    console.log(`Found ${patientsA.length} patients in Hospital A and ${patientsB.length} in Hospital B`);

    // Transfer reasons with weighted probabilities
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

    const reasonWeights = [
      8,  // Specialized cardiac care
      6,  // Neurological expertise
      10, // Capacity constraints
      4,  // Patient requested
      3,  // Family preference
      2,  // Insurance
      5,  // Better facilities
      12, // Emergency transfer
      7,  // Post-operative
      4,  // Pediatric
      9,  // Oncological
      5,  // Rehabilitation
      6,  // Mental health
      3,  // Burn treatment
      8   // Trauma center
    ];

    const transferNotes = [
      'Patient requires advanced treatment not available at current facility',
      'Transfer approved by medical director',
      'Urgent transfer due to deteriorating condition',
      'Scheduled transfer for specialized procedure',
      'Patient transportation arranged via ambulance',
      'Medical records transferred electronically',
      'Family consent obtained for transfer',
      'Critical condition requires immediate specialized care',
      'Insurance approved specialized treatment transfer',
      'Patient stability allows for safe transfer'
    ];

    // Generate transfers over 8 months with realistic patterns
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 8); // 8 months ago
    const endDate = new Date();

    console.log(`Generating transfers from ${startDate.toISOString()} to ${endDate.toISOString()}`);

    const transfersAtoB = [];
    const transfersBtoA = [];

    // Calculate total transfers needed (roughly 300-400 total)
    const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    const baseTransfersPerDay = 1.5; // Average transfers per day total

    let transferIdCounter = Date.now(); // Use timestamp to avoid conflicts

    for (let dayOffset = 0; dayOffset < totalDays; dayOffset++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(currentDate.getDate() + dayOffset);

      const month = currentDate.getMonth();
      const dayOfWeek = currentDate.getDay();

      // Calculate daily transfer volume with seasonal and weekly patterns
      const seasonalMultiplier = getSeasonalMultiplier(month);
      const weeklyMultiplier = getWeeklyMultiplier(dayOfWeek);
      const dailyBase = baseTransfersPerDay * seasonalMultiplier * weeklyMultiplier;

      // Add some randomness (±30%)
      const dailyTransfers = Math.max(0, Math.round(dailyBase * (0.7 + Math.random() * 0.6)));

      // Generate transfers for this day
      for (let transferNum = 0; transferNum < dailyTransfers; transferNum++) {
        // Random hour with hourly patterns
        let hour;
        do {
          hour = Math.floor(Math.random() * 24);
        } while (Math.random() > getHourlyMultiplier(hour));

        const transferDate = new Date(currentDate);
        transferDate.setHours(hour, Math.floor(Math.random() * 60), Math.floor(Math.random() * 60));

        const reason = randomWeightedChoice(transferReasons, reasonWeights);
        const notes = randomChoice(transferNotes);

        // Decide direction (A to B or B to A) - roughly equal but with some bias
        const direction = Math.random() < 0.52 ? 'AtoB' : 'BtoA';

        if (direction === 'AtoB' && patientsA.length > 0) {
          const patient = randomChoice(patientsA);

          // Update patient in Hospital A
          patient.status = 'Transferred';
          patient.transfer_history.push({
            transfer_id: `TRF-A-B-${String(transferIdCounter).padStart(5, '0')}`,
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
            patient_id: `PAT-B-T${String(transferIdCounter).padStart(5, '0')}`,
            national_id: 900000 + transferIdCounter, // Use a different range for transferred patients
            first_name: patient.first_name,
            last_name: patient.last_name,
            date_of_birth: patient.date_of_birth,
            gender: patient.gender,
            phone_number: `07${String(transferIdCounter).slice(-8)}`, // Generate unique phone number
            email: `${patient.first_name.toLowerCase()}.${patient.last_name.toLowerCase()}.transferred${transferIdCounter}@email.com`,
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
              transfer_id: `TRF-A-B-${String(transferIdCounter).padStart(5, '0')}`,
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
              is_primary: false,
            },
          };

          await PatientB.create(patientDataB);
          transfersAtoB.push(patientDataB);
          transferIdCounter++;

        } else if (direction === 'BtoA' && patientsB.length > 0) {
          const patient = randomChoice(patientsB);

          // Update patient in Hospital B (Hospital B doesn't have transfer_history field)
          patient.status = 'Transferred';
          await patient.save();

          // Create patient record in Hospital A
          const patientDataA = {
            patient_id: `PAT-A-T${String(transferIdCounter).padStart(5, '0')}`,
            national_id: 800000 + transferIdCounter, // Use a different range for transferred patients
            first_name: patient.first_name,
            last_name: patient.last_name,
            date_of_birth: patient.date_of_birth,
            gender: patient.gender,
            phone_number: `07${String(transferIdCounter).slice(-8)}`, // Generate unique phone number
            email: `${patient.first_name.toLowerCase()}.${patient.last_name.toLowerCase()}.transferred${transferIdCounter}@email.com`,
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
              transfer_id: `TRF-B-A-${String(transferIdCounter).padStart(5, '0')}`,
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
              is_primary: false,
            },
          };

          await PatientA.create(patientDataA);
          transfersBtoA.push(patientDataA);
          transferIdCounter++;
        }
      }

      // Progress indicator
      if (dayOffset % 30 === 0) {
        console.log(`Processed ${dayOffset}/${totalDays} days...`);
      }
    }

    console.log('\nRealistic patient transfers populated successfully!');
    console.log(`Summary:`);
    console.log(`   - Transfers from A to B: ${transfersAtoB.length}`);
    console.log(`   - Transfers from B to A: ${transfersBtoA.length}`);
    console.log(`   - Total transfers: ${transfersAtoB.length + transfersBtoA.length}`);
    console.log(`   - Date range: ${startDate.toISOString()} to ${endDate.toISOString()}`);

  } catch (err) {
    console.error('Error populating realistic transfers:', err);
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
populateTransfersRealistic();