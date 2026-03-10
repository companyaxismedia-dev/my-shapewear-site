const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

/* =====================================================
   📦 ADDRESS SUB SCHEMA (AMAZON STYLE)
===================================================== */
const addressSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    pincode: {
      type: String,
      required: true,
      trim: true,
    },

    city: {
      type: String,
      required: true,
      trim: true,
    },

    state: {
      type: String,
      required: true,
      trim: true,
    },

    addressLine: {
      type: String,
      required: true,
      trim: true,
    },

    landmark: {
      type: String,
      default: "",
      trim: true,
    },

    addressType: {
      type: String,
      enum: ["HOME", "WORK", "OFFICE"],
      default: "HOME",
    },

    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { _id: true }
);

/* =====================================================
   👤 USER SCHEMA
===================================================== */
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    /* OPTIONAL PHONE (GOOGLE LOGIN SAFE) */
    phone: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],

    addresses: [addressSchema],
    /* ================= ACCOUNT STATUS & SOFT DELETE ================= */
    status: {
      type: String,
      enum: ["active", "inactive", "deleted", "suspended"],
      default: "active",
      index: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },

    /* ================= LAST ACTIVITY (updated by app events) ================= */
    lastActivity: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

/* =====================================================
   🔐 HASH PASSWORD (SAFE VERSION)
===================================================== */
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

/* =====================================================
   🔑 MATCH PASSWORD
===================================================== */
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

/* =====================================================
   🔒 REMOVE PASSWORD FROM RESPONSE
===================================================== */
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

// db.users.dropIndexes()
/* =====================================================
   🚀 INDEXES (FAST SEARCH)
===================================================== */

// userSchema.index({ email: 1 }, { unique: true });
// userSchema.index({ phone: 1 }, { unique: true, sparse: true });

/* =====================================================
   EXPORT SAFE (IMPORTANT)
===================================================== */
module.exports =
  mongoose.models.User || mongoose.model("User", userSchema);
