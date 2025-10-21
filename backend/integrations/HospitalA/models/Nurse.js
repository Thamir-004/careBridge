
const { Schema } = require("mongoose");

const NurseSchema = new Schema({
  nurse_id: { type: String, required: true, unique: true },
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  department: { type: String },
 phone_number: { type: String, unique: true, sparse: true },
  email: { type: String },
}, { timestamps: true });

const getNurseModel = (connection) => {
  return connection.model("Nurse", NurseSchema);
};
module.exports = getNurseModel;
