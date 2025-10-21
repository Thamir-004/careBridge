const { Schema } = require("mongoose");

const PatientSchema = new Schema(
  {
    patient_id: { type: String, required: true, unique: true },
    national_id: { type: Number, required: true, unique: true },
    first_name: { type: String, required: true, trim: true },
    last_name: { type: String, required: true, trim: true },
    date_of_birth: { type: Date, required: true },
    gender: { type: String, required: true, enum: ["Male", "Female"], trim: true },
    address: { type: String, required: true, trim: true },
    phone_number: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    hospital_name: { type: String, trim: true },
  },
  { timestamps: true }
);

/**
 * This function registers the Patient model on a specific hospital's connection
 * @param {mongoose.Connection} connection
 * @returns {mongoose.Model}
 */
const getPatientModel = (connection) => {
  return connection.model("Patient", PatientSchema);
};

module.exports = getPatientModel;
