
const { Schema } = require("mongoose");
const EncounterSchema = new Schema({
  date: { type: Date, default: Date.now },
  reason: { type: String, required: true },
  notes: { type: String },

  // Reference to Patient's MongoDB _id
  patient: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },

  //reference doctor by ObjectId if you have a Doctor model
  doctor: { type: Schema.Types.ObjectId, ref: 'Doctor' },

  hospital: { type: String, required: true }
}, { timestamps: true });

const getEncounterModel = (connection) => {
  return connection.model("Encounter", EncounterSchema);
};

module.exports = getEncounterModel;
