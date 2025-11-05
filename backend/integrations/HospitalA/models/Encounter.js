const { Schema } = require("mongoose");

const EncounterSchema = new Schema(
  {
    // Core Identifiers
    encounter_id: {
      type: String,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
      default: function () {
    return `ENC-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }
    },

    // References
    patient: {
      patient_id: { type: String, required: true, index: true },
      patient_ref: { type: Schema.Types.ObjectId, ref: "Patient" },
      patient_name: String,
    },
    doctor: {
      doctor_id: { type: String, required: true, index: true },
      doctor_ref: { type: Schema.Types.ObjectId, ref: "Doctor" },
      doctor_name: String,
    },

    // Hospital Information
    hospital_id: {
      type: String,
      required: true,
      index: true,
    },
    hospital_name: String,

    // Encounter Details
    encounter_type: {
      type: String,
      required: true,
      enum: ["Outpatient", "Inpatient", "Emergency", "Follow-up", "Consultation"],
      index: true,
    },
    encounter_date: {
      type: Date,
      default: Date.now,
      index: true,
    },
    encounter_status: {
      type: String,
      enum: ["Scheduled", "In Progress", "Completed", "Cancelled"],
      default: "Scheduled",
      index: true,
    },

    // Chief Complaint
    reason_for_visit: {
      type: String,
      required: true,
      trim: true,
    },
    symptoms: [String],

    // Vital Signs (Simple)
    vital_signs: {
      temperature: Number, // Celsius
      blood_pressure: String, // e.g., "120/80"
      heart_rate: Number, // bpm
      weight: Number, // kg
      height: Number, // cm
    },

    // Diagnosis
    diagnoses: [
      {
        description: {
          type: String,
          required: true,
        },
        type: {
          type: String,
          enum: ["Primary", "Secondary"],
          default: "Primary",
        },
      },
    ],

    // Treatment
    treatment_plan: String,
    clinical_notes: String,

    // Prescriptions (Reference to Medication model)
    prescriptions: [
      {
        medication_name: String,
        dosage: String,
        frequency: String,
        duration: String,
      },
    ],

    // Lab Tests
    lab_tests_ordered: [
      {
        test_name: String,
        status: {
          type: String,
          enum: ["Ordered", "Completed"],
          default: "Ordered",
        },
        results: String,
      },
    ],

    // Follow-up
    follow_up_required: {
      type: Boolean,
      default: false,
    },
    follow_up_date: Date,
    follow_up_instructions: String,

    // Transfer Information (CareBridge specific)
    transfer_info: {
      is_transferred: { type: Boolean, default: false },
      from_hospital: String,
      to_hospital: String,
      transfer_date: Date,
      transfer_reason: String,
    },

    // Status
    status: {
      type: String,
      enum: ["Active", "Completed", "Cancelled"],
      default: "Active",
      index: true,
    },

    // Audit
    created_by: String,
    updated_by: String,

    // Soft Delete
    is_deleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: "encounters",
  }
);

// ===== INDEXES =====
EncounterSchema.index({ "patient.patient_id": 1, encounter_date: -1 });
EncounterSchema.index({ "doctor.doctor_id": 1, encounter_date: -1 });
EncounterSchema.index({ hospital_id: 1, encounter_type: 1 });
EncounterSchema.index({ encounter_status: 1 });

// ===== METHODS =====
// Add diagnosis
EncounterSchema.methods.addDiagnosis = function (diagnosisData) {
  this.diagnoses.push(diagnosisData);
  return this.save();
};

// Add prescription
EncounterSchema.methods.addPrescription = function (prescriptionData) {
  this.prescriptions.push(prescriptionData);
  return this.save();
};

// Update status
EncounterSchema.methods.updateStatus = function (status) {
  this.encounter_status = status;
  if (status === "Completed") {
    this.status = "Completed";
  }
  return this.save();
};

// Mark as transferred
EncounterSchema.methods.markAsTransferred = function (transferData) {
  this.transfer_info = {
    is_transferred: true,
    from_hospital: transferData.from_hospital,
    to_hospital: transferData.to_hospital,
    transfer_date: transferData.transfer_date || new Date(),
    transfer_reason: transferData.reason,
  };
  return this.save();
};

// Soft delete
EncounterSchema.methods.softDelete = function (deletedBy) {
  this.is_deleted = true;
  return this.save();
};

// ===== STATIC METHODS =====
// Find by patient
EncounterSchema.statics.findByPatient = function (patientId) {
  return this.find({
    "patient.patient_id": patientId,
    is_deleted: false,
  }).sort({ encounter_date: -1 });
};

// Find by doctor
EncounterSchema.statics.findByDoctor = function (doctorId, date) {
  const query = {
    "doctor.doctor_id": doctorId,
    is_deleted: false,
  };
  if (date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    query.encounter_date = { $gte: startOfDay, $lte: endOfDay };
  }
  return this.find(query).sort({ encounter_date: 1 });
};

// Find emergencies
EncounterSchema.statics.findEmergencies = function (hospitalId) {
  return this.find({
    hospital_id: hospitalId,
    encounter_type: "Emergency",
    encounter_status: { $in: ["Scheduled", "In Progress"] },
    is_deleted: false,
  }).sort({ encounter_date: -1 });
};

// ===== MIDDLEWARE =====
// Auto-generate encounter_id
EncounterSchema.pre("save", function (next) {
  if (!this.encounter_id) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    this.encounter_id = `ENC-${timestamp}-${random}`;
  }
  next();
});

// ===== QUERY HELPERS =====
EncounterSchema.query.notDeleted = function () {
  return this.where({ is_deleted: false });
};

EncounterSchema.query.byHospital = function (hospitalId) {
  return this.where({ hospital_id: hospitalId });
};

EncounterSchema.query.byStatus = function (status) {
  return this.where({ encounter_status: status });
};

/**
 * Register Encounter model on hospital connection
 * @param {mongoose.Connection} connection
 * @returns {mongoose.Model}
 */
const getEncounterModel = (connection) => {
  if (connection.models.Encounter) {
    return connection.models.Encounter;
  }
  return connection.model("Encounter", EncounterSchema);
};

module.exports = getEncounterModel;