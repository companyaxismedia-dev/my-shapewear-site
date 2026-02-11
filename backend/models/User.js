const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

/* ===============================
   📦 ADDRESS SUB-SCHEMA (AMAZON STYLE)
================================ */
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

    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { _id: true }
);

/* ===============================
   👤 USER SCHEMA
================================ */
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
    },

    // 📱 Phone number field (OTP based auth)
    phone: {
      type: String,
      required: true,
      unique: true,
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

    /* ===============================
       ❤️ AMAZON-STYLE WISHLIST
    =============================== */
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],

    /* ===============================
       🏠 AMAZON-STYLE ADDRESSES
    =============================== */
    addresses: [addressSchema],
  },
  { timestamps: true }
);

/* =================================================
   🔐 PASSWORD HASH (MONGOOSE 7 SAFE)
================================================= */
userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

/* =================================================
   🔐 MATCH PASSWORD
================================================= */
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
