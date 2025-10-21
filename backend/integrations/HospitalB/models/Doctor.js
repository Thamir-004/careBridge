const { Schema } = require("mongoose");

const DoctorSchema = new Schema ({
    doctor_id:{ type: String, required:true, unique: true },
    first_name:{ type: String, required: true },
    last_name:{ type: String, required: true },
    specialty: { type: String, required: true },
    phone_number: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true }
},{timestamps: true});

const getDoctorModel = (connection) => {
  return connection.model("Doctor", DoctorSchema);
};
module.exports = getDoctorModel;   