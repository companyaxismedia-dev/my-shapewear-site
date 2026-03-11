const mongoose = require('mongoose');

const ImportItemSchema = new mongoose.Schema({
  data: { type: Object, required: true },
  errors: { type: [String], default: [] },
  valid: { type: Boolean, default: false },
  createdProductId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', default: null },
}, { timestamps: true });

const ImportSchema = new mongoose.Schema({
  filename: { type: String },
  uploader: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['uploaded','processing','processed'], default: 'uploaded' },
  items: [ImportItemSchema],
}, { timestamps: true });

module.exports = mongoose.model('Import', ImportSchema);
