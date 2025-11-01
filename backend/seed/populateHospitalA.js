// seed/populateHospitalA.js
/*require("dotenv").config({ path: "../.env" }); // Load env from root (important)
const mongoose = require("mongoose");

const { Patient } = require("../HospitalA/models/Patient");
const { Doctor } = require("../HospitalA/models/Doctor");
const { Encounter } = require("../HospitalA/models/Encounter");
const { Nurse } = require("../HospitalA/models/Nurse");

const uri = process.env.MONGO_URI_HOSPITAL_A;
console.log("Connecting to:", uri); //Step 3 check
*/
require('dotenv').config({ path: '../.env' });
const mongoose = require("mongoose");
const { Patient } = require("../HospitalA/models/Patient");
const { Doctor } = require("../HospitalA/models/Doctor");
const { Encounter } = require("../HospitalA/models/Encounter");
const { Nurse } = require("../HospitalA/models/Nurse");

const uri = process.env.MONGO_URI_HOSPITAL_A;

async function populateHospitalA() {
  try {
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log("Connected to Hospital A database");

    // Clear old data
    await Promise.all([
      Patient.deleteMany({}),
      Doctor.deleteMany({}),
      Nurse.deleteMany({}),
      Encounter.deleteMany({}),
    ]);

    // Seed doctors
   // Seed doctors
const doctors = await Doctor.insertMany([
  { 
    doctor_id: "D001",
    first_name: "Amina",
    last_name: "Omar",
    specialty: "Cardiology",
    phone_number: "0700111222",
    email: "amina.omar@hospitala.com"
  },
  { 
    doctor_id: "D002",
    first_name: "Peter",
    last_name: "Mwangi",
    specialty: "Pediatrics",
    phone_number: "0700333444",
    email: "peter.mwangi@hospitala.com"
  }
]);


    // Seed nurses
// Seed nurses
const nurses = await Nurse.insertMany([
  { nurse_id: "N001", first_name: "Wanjiku", last_name: "Kariuki" },
  { nurse_id: "N002", first_name: "Otieno", last_name: "Odhiambo" }
]); 


    // Seed patients
    const patients = await Patient.insertMany([
      {
        patient_id: "P001",
        national_id: 1001,
        first_name: "John",
        last_name: "Doe",
        date_of_birth: new Date("1990-05-12"),
        gender: "Male",
        phone_number: "0712345678",
        email: "john@example.com",
        address: "Nairobi",
      },
      {
        patient_id: "P002",
        national_id: 1002,
        first_name: "Mary",
        last_name: "Atieno",
        date_of_birth: new Date("1985-09-23"),
        gender: "Female",
        phone_number: "0723456789",
        email: "mary@example.com",
        address: "Mombasa",
      },
    ]);

    // Seed encounters
    await Encounter.insertMany([
      {
        patient: patients[0]._id,
        doctor: doctors[0]._id,
        nurse: nurses[0]._id,
        date: new Date("2025-01-15"),
        reason: "Chest pain",
        diagnosis: "Mild arrhythmia",
        hospital: "Hospital A",
      },
      {
        patient: patients[1]._id,
        doctor: doctors[1]._id,
        nurse: nurses[1]._id,
        date: new Date("2025-02-20"),
        reason: "Fever",
        diagnosis: "Malaria",
        hospital: "Hospital A",
      },
    ]);

    console.log("Hospital A data populated successfully!");
  } catch (err) {
    console.error("Error populating Hospital A:", err);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from Hospital A DB");
  }
}

populateHospitalA();
