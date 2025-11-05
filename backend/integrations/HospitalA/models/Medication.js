const { Schema } = require("mongoose");

const MedicationSchema = new Schema(
  {
    // Core Identifiers
    prescription_id: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
      default: function () {
    return `RX-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }
    },

    // References
    encounter: {
      encounter_id: { type: String, required: true, index: true },
      encounter_ref: { type: Schema.Types.ObjectId, ref: "Encounter" },
    },
    patient: {
      patient_id: { type: String, required: true, index: true },
      patient_name: String,
    },
    doctor: {
      doctor_id: { type: String, required: true },
      doctor_name: String,
    },

    // Hospital Info
    hospital_id: {
      type: String,
      required: true,
      index: true,
    },

    // Medication Details
    medication_name: {
      type: String,
      required: true,
      trim: true,
    },
    generic_name: String,
    dosage: {
      type: String,
      required: true,
      trim: true,
    },
    frequency: {
      type: String,
      required: true,
      trim: true,
      // e.g., "Once daily", "Twice daily", "Every 8 hours"
    },
    duration: {
      type: String,
      required: true,
      trim: true,
      // e.g., "7 days", "2 weeks", "1 month"
    },
    route: {
      type: String,
      enum: ["Oral", "IV", "IM", "Topical", "Inhalation", "Other"],
      default: "Oral",
    },

    // Instructions
    instructions: String,
    // e.g., "Take with food", "Before bedtime"

    // Prescription Dates
    prescribed_date: {
      type: Date,
      default: Date.now,
      index: true,
    },
    start_date: Date,
    end_date: Date,

    // Refills & Quantity
    quantity: Number,
    refills_allowed: {
      type: Number,
      default: 0,
    },
    refills_remaining: {
      type: Number,
      default: 0,
    },

    // Status
    status: {
      type: String,
      enum: ["Active", "Completed", "Discontinued", "Cancelled"],
      default: "Active",
      index: true,
    },
    discontinued_reason: String,
    discontinued_date: Date,

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
    collection: "medications",
  }
);

// ===== INDEXES =====
MedicationSchema.index({ "patient.patient_id": 1, status: 1 });
MedicationSchema.index({ prescribed_date: -1 });

// ===== METHODS =====
// Discontinue medication
MedicationSchema.methods.discontinue = function (reason) {
  this.status = "Discontinued";
  this.discontinued_reason = reason;
  this.discontinued_date = new Date();
  return this.save();
};

// Check if active
MedicationSchema.methods.isActive = function () {
  return this.status === "Active" && !this.is_deleted;
};

// Use a refill
MedicationSchema.methods.useRefill = function () {
  if (this.refills_remaining > 0) {
    this.refills_remaining -= 1;
    return this.save();
  }
  throw new Error("No refills remaining");
};

// ===== STATIC METHODS =====
// Find active medications for patient
MedicationSchema.statics.findActiveForPatient = function (patientId) {
  return this.find({
    "patient.patient_id": patientId,
    status: "Active",
    is_deleted: false,
  }).sort({ prescribed_date: -1 });
};

// ===== MIDDLEWARE =====
// Auto-generate prescription_id if not provided
MedicationSchema.pre("save", function (next) {
  if (!this.prescription_id) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    this.prescription_id = `RX-${timestamp}-${random}`;
  }
  next();
});

// Set refills_remaining on first save
MedicationSchema.pre("save", function (next) {
  if (this.isNew && this.refills_allowed > 0) {
    this.refills_remaining = this.refills_allowed;
  }
  next();
});

// ===== QUERY HELPERS =====
MedicationSchema.query.notDeleted = function () {
  return this.where({ is_deleted: false });
};

MedicationSchema.query.active = function () {
  return this.where({ status: "Active" });
};

/**
 * Register Medication model on hospital connection
 * @param {mongoose.Connection} connection
 * @returns {mongoose.Model}
 */
const getMedicationModel = (connection) => {
  if (connection.models.Medication) {
    return connection.models.Medication;
  }
  return connection.model("Medication", MedicationSchema);
};

module.exports = getMedicationModel;