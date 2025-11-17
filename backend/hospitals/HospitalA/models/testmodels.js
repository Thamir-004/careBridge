require('dotenv').config();
const mongoose = require('mongoose');

// Use the same DB connection URI
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/test';

async function testModels() {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      autoIndex: false, // optional: avoid automatic index creation crashing
    });

    console.log('✅ DB connected');

    // Import each model one by one
    const Patient = require('.\hospitals\HospitalA\models\Patient.js');       // adjust path
    // const Transfer = require('./Transfer');     // adjust path
  //  const Medication = require('./Medication'); // etc.

    console.log('✅ Models loaded successfully');

    // Optional: create dummy document to test schema
    const dummyPatient = new Patient({
      name: 'Test Patient',
      encounter_status: 'pending',
      // fill required fields...
    });

    await dummyPatient.validate(); // just validates schema without saving
    console.log('✅ Patient model validation passed');

    await mongoose.disconnect();
    console.log('✅ DB disconnected');
  } catch (err) {
    console.error('❌ Model test failed:', err);
    process.exit(1);
  }
}

testModels();
