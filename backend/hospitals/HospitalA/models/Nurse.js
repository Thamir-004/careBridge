
const { Schema } = require("mongoose");

const NurseSchema = new Schema(
  {
    // Core Identifiers
    nurse_id: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    license_number: {
      type: String,
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
      unique: true,
      sparse: true,
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },

    // Hospital Information
    hospital_id: {
      type: String,
      required: true,
      index: true,
    },
    hospital_name: String,
    department: String,
    shift: {
      type: String,
      enum: ["Morning", "Evening", "Night", "Rotating"],
    },

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
    collection: "nurses",
  }
);

// ===== INDEXES =====
NurseSchema.index({ last_name: 1, first_name: 1 });
NurseSchema.index({ hospital_id: 1, department: 1 });
NurseSchema.index({ hospital_id: 1, status: 1 });

// ===== VIRTUALS =====
NurseSchema.virtual("full_name").get(function () {
  return `${this.first_name} ${this.last_name}`;
});

NurseSchema.virtual("is_available").get(function () {
  return this.availability_status === "Available" && this.status === "Active";
});

// ===== METHODS =====
// Update availability
NurseSchema.methods.updateAvailability = function (status) {
  this.availability_status = status;
  return this.save();
};

// Add transfer
NurseSchema.methods.addTransfer = function (transferData) {
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
NurseSchema.methods.softDelete = function () {
  this.is_deleted = true;
  this.status = "Inactive";
  return this.save();
};

// ===== STATIC METHODS =====
// Find available nurses
NurseSchema.statics.findAvailable = function (hospitalId) {
  return this.find({
    hospital_id: hospitalId,
    availability_status: "Available",
    status: "Active",
    is_deleted: false,
  });
};

// Find by department
NurseSchema.statics.findByDepartment = function (department, hospitalId) {
  return this.find({
    hospital_id: hospitalId,
    department,
    status: "Active",
    is_deleted: false,
  });
};

// ===== QUERY HELPERS =====
NurseSchema.query.notDeleted = function () {
  return this.where({ is_deleted: false });
};

NurseSchema.query.active = function () {
  return this.where({ status: "Active" });
};

// Enable virtuals in JSON
NurseSchema.set("toJSON", { virtuals: true });
NurseSchema.set("toObject", { virtuals: true });

/**
 * Register Nurse model on hospital connection
 * @param {mongoose.Connection} connection
 * @returns {mongoose.Model}
 */
const getNurseModel = (connection) => {
  if (connection.models.Nurse) {
    return connection.models.Nurse;
  }
  return connection.model("Nurse", NurseSchema);
};

module.exports = getNurseModel;