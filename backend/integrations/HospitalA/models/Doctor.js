const { Schema } = require("mongoose");

const DoctorSchema = new Schema(
  {
    // Core Identifiers
    doctor_id: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    license_number: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    // Personal Information
    first_name: {
      type: String,
      required: true,
      trim: true,
    },
    last_name: {
      type: String,
      required: true,
      trim: true,
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
    },

    // Professional Information
    specialty: {
      type: String,
      required: true,
      trim: true,
    },
    qualifications: String, // e.g., "MBBS, MD"

    // Hospital Information
    hospital_id: {
      type: String,
      required: true,
      index: true,
    },
    hospital_name: String,
    department: String,

    // Availability
    availability_status: {
      type: String,
      enum: ["Available", "On Leave", "Busy", "Off Duty"],
      default: "Available",
      index: true,
    },

    // Transfer History (CareBridge specific)
    transfer_history: [
      {
        from_hospital: String,
        to_hospital: String,
        transfer_date: Date,
        reason: String,
      },
    ],

    // Status
    status: {
      type: String,
      enum: ["Active", "Inactive", "On Leave"],
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
    collection: "doctors",
  }
);

// ===== INDEXES =====
DoctorSchema.index({ last_name: 1, first_name: 1 });
DoctorSchema.index({ hospital_id: 1, specialty: 1 });
DoctorSchema.index({ hospital_id: 1, status: 1 });

// ===== VIRTUALS =====
DoctorSchema.virtual("full_name").get(function () {
  return `Dr. ${this.first_name} ${this.last_name}`;
});

DoctorSchema.virtual("is_available").get(function () {
  return this.availability_status === "Available" && this.status === "Active";
});

// ===== METHODS =====
// Update availability
DoctorSchema.methods.updateAvailability = function (status) {
  this.availability_status = status;
  return this.save();
};

// Add transfer
DoctorSchema.methods.addTransfer = function (transferData) {
  this.transfer_history.push({
    from_hospital: transferData.from_hospital,
    to_hospital: transferData.to_hospital,
    transfer_date: transferData.transfer_date || new Date(),
    reason: transferData.reason,
  });
  this.hospital_id = transferData.to_hospital;
  this.hospital_name = transferData.to_hospital_name;
  return this.save();
};

// Soft delete
DoctorSchema.methods.softDelete = function (deletedBy) {
  this.is_deleted = true;
  this.status = "Inactive";
  return this.save();
};

// ===== STATIC METHODS =====
// Find available doctors
DoctorSchema.statics.findAvailable = function (hospitalId) {
  return this.find({
    hospital_id: hospitalId,
    availability_status: "Available",
    status: "Active",
    is_deleted: false,
  });
};

// Find by specialty
DoctorSchema.statics.findBySpecialty = function (specialty, hospitalId) {
  const query = {
    specialty,
    status: "Active",
    is_deleted: false,
  };
  if (hospitalId) query.hospital_id = hospitalId;
  return this.find(query);
};

// ===== QUERY HELPERS =====
DoctorSchema.query.notDeleted = function () {
  return this.where({ is_deleted: false });
};

DoctorSchema.query.active = function () {
  return this.where({ status: "Active" });
};

// Enable virtuals in JSON
DoctorSchema.set("toJSON", { virtuals: true });
DoctorSchema.set("toObject", { virtuals: true });

/**
 * Register Doctor model on hospital connection
 * @param {mongoose.Connection} connection
 * @returns {mongoose.Model}
 */
const getDoctorModel = (connection) => {
  if (connection.models.Doctor) {
    return connection.models.Doctor;
  }
  return connection.model("Doctor", DoctorSchema);
};

module.exports = getDoctorModel;