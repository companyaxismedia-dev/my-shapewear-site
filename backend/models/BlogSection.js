const mongoose = require("mongoose");

const blogSectionSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    label: {
      type: String,
      required: true,
      trim: true,
    },
    sectionOrder: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

blogSectionSchema.index({ sectionOrder: 1, label: 1 });

module.exports = mongoose.model("BlogSection", blogSectionSchema);
