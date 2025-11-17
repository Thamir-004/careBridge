const { Schema } = require("mongoose");

const PatientSchema = new Schema(
  {
    // Core Identifiers
    patient_id: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    national_id: {
      type: String, // Changed from Number to String (IDs can have leading zeros)
      required: true,
      unique: true,
      trim: true,
      index: true,
    },

    // Personal Information
    first_name: {
      type: String,
      required: true,
      trim: true,
      index: true, // For search performance
    },
    last_name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    middle_name: {
      type: String,
      trim: true,
    },
    date_of_birth: {
      type: Date,
      required: true,
      index: true,
    },
    gender: {
      type: String,
      required: true,
      enum: ["Male", "Female", "Other", "Prefer not to say"],
      trim: true,
    },

    // Contact Information
    address: {
      street: String,
      city: String,
      state: String,
      zip_code: String,
      country: { type: String, default: "Kenya" },
    },
    phone_number: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
    },

    // Emergency Contact
    emergency_contact: {
      name: String,
      relationship: String,
      phone_number: String,
    },

    // Medical Information
    blood_type: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Unknown"],
      default: "Unknown",
    },
    allergies: [
      {
        allergen: String,
        severity: {
          type: String,
          enum: ["Mild", "Moderate", "Severe", "Life-threatening"],
        },
        notes: String,
      },
    ],
    chronic_conditions: [
      {
        condition: String,
        diagnosed_date: Date,
        notes: String,
      },
    ],
    current_medications: [
      {
        medication_name: String,
        dosage: String,
        frequency: String,
        prescribing_doctor: String,
        start_date: Date,
      },
    ],

    // Insurance Information
    insurance: {
      provider: String,
      policy_number: String,
      group_number: String,
      expiry_date: Date,
    },

    // Hospital-Specific Data
    hospital_id: {
      type: String,
      required: true,
      index: true,
    },
    hospital_name: {
      type: String,
      trim: true,
    },
    registration_date: {
      type: Date,
      default: Date.now,
    },
    last_visit: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["Active", "Transferred", "Deceased", "Inactive"],
      default: "Active",
      index: true,
    },

    // Transfer History (Critical for CareBridge)
    transfer_history: [
      {
        transfer_id: String,
        from_hospital: String,
        from_hospital_name: String,
        to_hospital: String,
        to_hospital_name: String,
        transfer_date: { type: Date, default: Date.now },
        reason: String,
        transferred_by: String,
        approved_by: String,
        notes: String,
        status: {
          type: String,
          enum: ["Pending", "Approved", "Completed", "Rejected"],
          default: "Completed",
        },
      },
    ],

    // Data Sync Metadata (Important for distributed system)
    sync_metadata: {
      original_hospital: String, // First hospital where patient was registered
      last_synced_at: Date,
      sync_version: { type: Number, default: 1 },
      is_primary: { type: Boolean, default: true }, // Is this the primary record?
    },

    // Audit Trail
    created_by: {
      user_id: String,
      user_name: String,
      hospital_id: String,
    },
    updated_by: {
      user_id: String,
      user_name: String,
      hospital_id: String,
    },

    // Soft Delete Support
    is_deleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deleted_at: Date,
    deleted_by: String,
  },
  {
    timestamps: true,
    collection: "patients",
  }
);

// ===== INDEXES =====
// Compound indexes for common queries
PatientSchema.index({ last_name: 1, first_name: 1 });
PatientSchema.index({ hospital_id: 1, status: 1 });
PatientSchema.index({ date_of_birth: 1, last_name: 1 });
PatientSchema.index({ is_deleted: 1, status: 1 });

// Text index for search
PatientSchema.index({
  first_name: "text",
  last_name: "text",
  email: "text",
});

// ===== VIRTUALS =====
// Full name virtual
PatientSchema.virtual("full_name").get(function () {
  const parts = [this.first_name];
  if (this.middle_name) parts.push(this.middle_name);
  parts.push(this.last_name);
  return parts.join(" ");
});

// Age virtual
PatientSchema.virtual("age").get(function () {
  if (!this.date_of_birth) return null;
  const today = new Date();
  const birthDate = new Date(this.date_of_birth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  return age;
});

// ===== METHODS =====
// Get sanitized patient data (for transfers - remove sensitive info)
PatientSchema.methods.getSanitizedData = function (level = "basic") {
  const baseData = {
    patient_id: this.patient_id,
    national_id: this.national_id,
    first_name: this.first_name,
    last_name: this.last_name,
    middle_name: this.middle_name,
    date_of_birth: this.date_of_birth,
    gender: this.gender,
    blood_type: this.blood_type,
    hospital_id: this.hospital_id,
    hospital_name: this.hospital_name,
  };

  if (level === "full") {
    return {
      ...baseData,
      address: this.address,
      phone_number: this.phone_number,
      email: this.email,
      emergency_contact: this.emergency_contact,
      allergies: this.allergies,
      chronic_conditions: this.chronic_conditions,
      current_medications: this.current_medications,
      insurance: this.insurance,
      transfer_history: this.transfer_history,
    };
  }

  return baseData;
};

// Add transfer to history
PatientSchema.methods.addTransfer = function (transferData) {
  this.transfer_history.push({
    transfer_id: transferData.transfer_id,
    from_hospital: transferData.from_hospital,
    from_hospital_name: transferData.from_hospital_name,
    to_hospital: transferData.to_hospital,
    to_hospital_name: transferData.to_hospital_name,
    transfer_date: transferData.transfer_date || new Date(),
    reason: transferData.reason,
    transferred_by: transferData.transferred_by,
    approved_by: transferData.approved_by,
    notes: transferData.notes,
    status: transferData.status || "Completed",
  });
  return this.save();
};

// Check if patient has active allergies
PatientSchema.methods.hasAllergies = function () {
  return this.allergies && this.allergies.length > 0;
};

// Check if patient has critical allergies
PatientSchema.methods.hasCriticalAllergies = function () {
  return this.allergies.some(
    (a) => a.severity === "Severe" || a.severity === "Life-threatening"
  );
};

// ===== STATIC METHODS =====
// Find active patients
PatientSchema.statics.findActive = function () {
  return this.find({ status: "Active", is_deleted: false });
};

// Search patients
PatientSchema.statics.searchPatients = function (searchTerm) {
  return this.find({
    $text: { $search: searchTerm },
    is_deleted: false,
  });
};

// Find by national ID
PatientSchema.statics.findByNationalId = function (nationalId) {
  return this.findOne({ national_id: nationalId, is_deleted: false });
};

// ===== MIDDLEWARE =====
// Pre-save: Update sync metadata
PatientSchema.pre("save", function (next) {
  if (this.isModified()) {
    this.sync_metadata.last_synced_at = new Date();
    this.sync_metadata.sync_version += 1;
  }
  next();
});

// Pre-save: Validate phone number format
PatientSchema.pre("save", function (next) {
  // Kenya phone format: +254XXXXXXXXX or 07XXXXXXXX
  if (this.phone_number) {
    const cleaned = this.phone_number.replace(/\s+/g, "");
    if (!/^(\+254|0)[17]\d{8}$/.test(cleaned)) {
      next(new Error("Invalid Kenyan phone number format"));
    }
  }
  next();
});

// Soft delete instead of hard delete
PatientSchema.methods.softDelete = function (deletedBy) {
  this.is_deleted = true;
  this.deleted_at = new Date();
  this.deleted_by = deletedBy;
  this.status = "Inactive";
  return this.save();
};

// ===== QUERY HELPERS =====
PatientSchema.query.notDeleted = function () {
  return this.where({ is_deleted: false });
};

PatientSchema.query.byHospital = function (hospitalId) {
  return this.where({ hospital_id: hospitalId });
};

PatientSchema.query.byStatus = function (status) {
  return this.where({ status });
};

// Enable virtuals in JSON
PatientSchema.set("toJSON", { virtuals: true });
PatientSchema.set("toObject", { virtuals: true });

/**
 * This function registers the Patient model on a specific hospital's connection
 * @param {mongoose.Connection} connection - The hospital's database connection
 * @returns {mongoose.Model} - The Patient model for that hospital
 */
const getPatientModel = (connection) => {
  // Check if model already exists to avoid OverwriteModelError
  if (connection.models.Patient) {
    return connection.models.Patient;
  }
  return connection.model("Patient", PatientSchema);
};

module.exports = getPatientModel;