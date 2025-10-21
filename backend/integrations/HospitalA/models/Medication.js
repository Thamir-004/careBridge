
const { Schema } =  require("mongoose");

const MedicationSchema = new Schema ({
    prescription_id:{ type: String, required:true, unique: true },
 encounter: { type: Schema.Types.ObjectId, ref: 'Encounter', required: true },
    medication:{ type: String, required: true },
    dosage: { type: String, required: true, },
    duration: { type: String, required: true, }
},{ timestamps: true });

const getMedicationModel = (connection) => {
    return connection.model("Medication", MedicationSchema);
};

module.exports = getMedicationModel ;