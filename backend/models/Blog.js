const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    excerpt: {
      type: String,
      default: "",
      trim: true,
    },

    content: {
      type: String,
      default: "",
    },

    image: {
      type: String,
      required: true,
      trim: true,
    },

    gallery: [
      {
        type: String,
        trim: true,
      },
    ],

    category: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    categoryLabel: {
      type: String,
      default: "",
      trim: true,
    },

    tags: [
      {
        type: String,
        trim: true,
      },
    ],

    section: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      // example:
      // hero
      // recent-posts
      // most-popular
      // how-tos
      // lingerie-101
      // buying-guide
      // clovia-buzz
      // clovia-connect
    },

    sectionLabel: {
      type: String,
      required: true,
      trim: true,
    },

    isPublished: {
      type: Boolean,
      default: true,
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },

    isPopular: {
      type: Boolean,
      default: false,
    },

    heroRank: {
      type: Number,
      default: 0,
    },

    sectionOrder: {
      type: Number,
      default: 0,
    },

    cardOrder: {
      type: Number,
      default: 0,
    },

    readTime: {
      type: Number,
      default: 4,
    },

    views: {
      type: Number,
      default: 0,
    },

    authorName: {
      type: String,
      default: "Glovia Glamour",
      trim: true,
    },

    seoTitle: {
      type: String,
      default: "",
      trim: true,
    },

    seoDescription: {
      type: String,
      default: "",
      trim: true,
    },

    publishedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

blogSchema.index({ slug: 1 });
blogSchema.index({ section: 1, cardOrder: 1, publishedAt: -1 });
blogSchema.index({ isPublished: 1, publishedAt: -1 });
blogSchema.index({ isFeatured: 1, heroRank: 1 });
blogSchema.index({ isPopular: 1, publishedAt: -1 });

module.exports = mongoose.model("Blog", blogSchema);