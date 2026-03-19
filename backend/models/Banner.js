const mongoose = require('mongoose');

// SectionBlock: holds data for any section item (hero slides, collection cards, etc.)
const sectionBlockSchema = new mongoose.Schema({
  section: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Section',
    required: true,
  },
  order: {
    type: Number,
    default: 0,
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
}, { timestamps: true });

// Section: each block on a page (hero slider, collections, featured products, etc.)
const sectionSchema = new mongoose.Schema({
  page: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Page',
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  title: {
    type: String,
  },
  layoutType: {
    type: String,
    enum: ['grid', 'columns', 'banner', 'three_per_row', 'two_per_row', 'short_banner'],
    default: 'grid',
  },
  rows: {
    type: Number,
    default: 1,
  },
  columns: {
    type: Number,
    default: 4,
  },
  order: {
    type: Number,
    default: 0,
  },
  active: {
    type: Boolean,
    default: true,
  },
  device: {
    type: String,
    enum: ['all', 'mobile', 'desktop'],
    default: 'all',
  },
  startDate: Date,
  endDate: Date,
  settings: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  blocks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SectionBlock',
  }],
}, { timestamps: true });

// Page: a container for sections (homepage, landing pages, campaigns)
const pageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  sections: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Section',
  }],
}, { timestamps: true });

const Page = mongoose.model('Page', pageSchema);
const Section = mongoose.model('Section', sectionSchema);
const SectionBlock = mongoose.model('SectionBlock', sectionBlockSchema);

// Keep compatibility for any existing imports that expect a Banner model.
module.exports = Page;
module.exports.Page = Page;
module.exports.Section = Section;
module.exports.SectionBlock = SectionBlock;
