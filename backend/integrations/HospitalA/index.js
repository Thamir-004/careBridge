const mongoose = require("mongoose");
const getPatientModel = require("./models/Patient");
const getEncounterModel = require("./models/Encounter");
const getDoctorModel = require("./models/Doctor");
const getMedicationModel= require("./models/Medication");
const getNurseModel = require("./models/Nurse");

require("dotenv").config();

const connectHospitalA = async () => {
  try {
    const connection = await mongoose.createConnection(process.env.MONGO_URI_HOSPITAL_A, {
      // These options are safe to remove in Mongoose v6+, but kept for compatibility
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("🏥 Connected to Hospital A database");

    // Initialize models bound to this hospital’s connection
    const Patient = getPatientModel(connection);
    const Encounter = getEncounterModel(connection);
    const Doctor = getDoctorModel(connection);
    const Medication = getMedicationModel(connection);
    const Nurse = getNurseModel(connection);

    // Export all of them so CareBridge can use them
    return { connection, Patient, Encounter, Doctor, Medication, Nurse };

  } catch (err) {
    console.error("❌ Error connecting to Hospital A database:", err);
    throw err;
  }
};

module.exports = connectHospitalA;
