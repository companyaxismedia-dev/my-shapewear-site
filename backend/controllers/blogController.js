const Blog = require("../models/Blog");
const BlogSection = require("../models/BlogSection");

const DEFAULT_SECTION_CONFIG = [
  {
    key: "hero",
    label: "Hero",
    sectionOrder: 0,
    limit: 3,
    sort: { heroRank: 1, publishedAt: -1 },
  },
  {
    key: "recent-posts",
    label: "Recent Posts",
    sectionOrder: 1,
    limit: 8,
    sort: { cardOrder: 1, publishedAt: -1 },
  },
  {
    key: "most-popular",
    label: "Most Popular Posts",
    sectionOrder: 2,
    limit: 8,
    sort: { cardOrder: 1, publishedAt: -1 },
  },
  {
    key: "how-tos",
    label: "How-Tos",
    sectionOrder: 3,
    limit: 8,
    sort: { cardOrder: 1, publishedAt: -1 },
  },
  {
    key: "ethnic-wear-101",
    label: "Ethnic Wear 101",
    sectionOrder: 4,
    limit: 8,
    sort: { cardOrder: 1, publishedAt: -1 },
  },
  {
    key: "buying-guide",
    label: "Buying Guide",
    sectionOrder: 5,
    limit: 8,
    sort: { cardOrder: 1, publishedAt: -1 },
  },
  {
    key: "imkaa-buzz",
    label: "Imkaa Buzz",
    sectionOrder: 6,
    limit: 8,
    sort: { cardOrder: 1, publishedAt: -1 },
  },
  {
    key: "imkaa-connect",
    label: "Imkaa Connect",
    sectionOrder: 7,
    limit: 8,
    sort: { cardOrder: 1, publishedAt: -1 },
  },
  {
    key: "tips-tricks",
    label: "Tips & Tricks",
    sectionOrder: 8,
    limit: 8,
    sort: { cardOrder: 1, publishedAt: -1 },
  },
];

const RESERVED_SECTION_KEYS = ["hero", "recent-posts", "most-popular"];

const makeImageUrl = (req, image) => {
  if (!image) return "";
  if (image.startsWith("http")) return image;
  return `${req.protocol}://${req.get("host")}${image}`;
};

const formatBlog = (req, blog) => ({
  ...blog.toObject?.() || blog,
  image: makeImageUrl(req, blog.image),
  gallery: Array.isArray(blog.gallery)
    ? blog.gallery.map((img) => makeImageUrl(req, img))
    : [],
});

const formatTitleFromSlug = (value = "") =>
  String(value)
    .split("-")
    .filter(Boolean)
    .map((item) => item.charAt(0).toUpperCase() + item.slice(1))
    .join(" ");

const slugify = (value = "") =>
  String(value)
    .toLowerCase()
    .trim()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const parseBoolean = (value, fallback = false) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    if (value.toLowerCase() === "true") return true;
    if (value.toLowerCase() === "false") return false;
  }
  return fallback;
};

const parseNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const parseStringArray = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(/\r?\n|,/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const normalizeAssetPath = (value = "") => {
  const trimmed = String(value || "").trim();
  if (!trimmed) return "";

  if (!trimmed.startsWith("http")) {
    return trimmed;
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.pathname.startsWith("/uploads/")) {
      return parsed.pathname;
    }
    return trimmed;
  } catch (error) {
    return trimmed;
  }
};

const buildBlogPayload = (input = {}) => {
  const title = String(input.title || "").trim();
  const slug = slugify(input.slug || title);
  const category = slugify(input.category || input.categoryLabel);
  const section = slugify(input.section || input.sectionLabel);
  const excerpt = String(input.excerpt || "").trim();
  const content = String(input.content || "");
  const image = normalizeAssetPath(input.image);
  const gallery = parseStringArray(input.gallery).map(normalizeAssetPath);
  const categoryLabel = String(input.categoryLabel || formatTitleFromSlug(category)).trim();
  const sectionLabel = String(input.sectionLabel || formatTitleFromSlug(section)).trim();
  const authorName = String(input.authorName || "Imkaa").trim();
  const seoTitle = String(input.seoTitle || "").trim();
  const seoDescription = String(input.seoDescription || "").trim();
  const publishedAt = input.publishedAt ? new Date(input.publishedAt) : new Date();

  return {
    title,
    slug,
    excerpt,
    content,
    image,
    gallery,
    category,
    categoryLabel,
    tags: parseStringArray(input.tags),
    section,
    sectionLabel,
    isPublished: parseBoolean(input.isPublished, true),
    isFeatured: parseBoolean(input.isFeatured, false),
    isPopular: parseBoolean(input.isPopular, false),
    heroRank: parseNumber(input.heroRank, 0),
    sectionOrder: parseNumber(input.sectionOrder, 0),
    cardOrder: parseNumber(input.cardOrder, 0),
    readTime: parseNumber(input.readTime, 4),
    authorName,
    seoTitle,
    seoDescription,
    publishedAt: Number.isNaN(publishedAt.getTime()) ? new Date() : publishedAt,
  };
};

const validateBlogPayload = (payload) => {
  const requiredFields = [
    ["title", payload.title],
    ["slug", payload.slug],
    ["image", payload.image],
    ["category", payload.category],
    ["section", payload.section],
  ];

  const missingField = requiredFields.find(([, value]) => !String(value || "").trim());
  if (missingField) {
    return `${missingField[0]} is required`;
  }

  return null;
};

const getSectionViewAllLink = (sectionKey) => `/blog/section/${sectionKey}`;

const syncBlogSections = async () => {
  await Promise.all(
    DEFAULT_SECTION_CONFIG.map((section) =>
      BlogSection.updateOne(
        { key: section.key },
        {
          $setOnInsert: {
            key: section.key,
            label: section.label,
            sectionOrder: section.sectionOrder ?? 0,
          },
        },
        { upsert: true }
      )
    )
  );

  const existingBlogSections = await Blog.aggregate([
    {
      $group: {
        _id: "$section",
        label: { $first: "$sectionLabel" },
        sectionOrder: { $min: "$sectionOrder" },
      },
    },
  ]);

  await Promise.all(
    existingBlogSections
      .filter((section) => section._id)
      .map((section) =>
        BlogSection.updateOne(
          { key: section._id },
          {
            $setOnInsert: {
              key: section._id,
              label: section.label || formatTitleFromSlug(section._id),
              sectionOrder: section.sectionOrder ?? 99,
            },
          },
          { upsert: true }
        )
      )
  );
};

const applySectionMetadata = async (payload = {}) => {
  await syncBlogSections();

  const sectionKey = slugify(payload.section || payload.sectionLabel);
  const sectionDoc = await BlogSection.findOne({ key: sectionKey });

  if (!sectionDoc) {
    throw new Error("Please select a valid blog section");
  }

  return {
    ...payload,
    section: sectionDoc.key,
    sectionLabel: sectionDoc.label,
    sectionOrder: sectionDoc.sectionOrder ?? 0,
  };
};

exports.getBlogLandingPage = async (req, res) => {
  try {
    await syncBlogSections();

    const heroConfig = DEFAULT_SECTION_CONFIG.find((item) => item.key === "hero");
    const recentConfig = DEFAULT_SECTION_CONFIG.find((item) => item.key === "recent-posts");
    const popularConfig = DEFAULT_SECTION_CONFIG.find((item) => item.key === "most-popular");
    const dynamicSectionDocs = await BlogSection.find({
      key: { $nin: RESERVED_SECTION_KEYS },
    }).sort({ sectionOrder: 1, label: 1 });

    const [heroPosts, recentPosts, popularPosts] = await Promise.all([
      Blog.find({ isPublished: true, section: "hero" })
        .sort(heroConfig.sort)
        .limit(heroConfig.limit),
      Blog.find({ isPublished: true, section: "recent-posts" })
        .sort(recentConfig.sort)
        .limit(recentConfig.limit),
      Blog.find({ isPublished: true, section: "most-popular" })
        .sort(popularConfig.sort)
        .limit(popularConfig.limit),
    ]);

    const configMap = new Map(DEFAULT_SECTION_CONFIG.map((item) => [item.key, item]));

    const dynamicSections = await Promise.all(
      dynamicSectionDocs.map(async (sectionDoc) => {
        const sectionKey = sectionDoc.key;
        const sectionConfig = configMap.get(sectionKey) || {
          key: sectionKey,
          label: sectionDoc.label || formatTitleFromSlug(sectionKey),
          limit: 8,
          sort: { cardOrder: 1, publishedAt: -1 },
        };

        const posts = await Blog.find({
          isPublished: true,
          section: sectionKey,
        })
          .sort(sectionConfig.sort)
          .limit(sectionConfig.limit);

        return {
          key: sectionKey,
          title: sectionDoc.label || sectionConfig.label,
          viewAllLink: getSectionViewAllLink(sectionKey),
          posts: posts.map((item) => formatBlog(req, item)),
        };
      })
    );

    return res.status(200).json({
      success: true,
      page: {
        heroPosts: heroPosts.map((item) => formatBlog(req, item)),
        recentPosts: recentPosts.map((item) => formatBlog(req, item)),
        popularPosts: popularPosts.map((item) => formatBlog(req, item)),
        sections: dynamicSections.filter((section) => section.posts.length > 0),
      },
    });
  } catch (error) {
    console.error("GET BLOG LANDING PAGE ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch blog landing page",
      error: error.message,
    });
  }
};

exports.getAdminBlogs = async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Number(req.query.limit) || 20);
    const search = String(req.query.search || "").trim();
    const status = String(req.query.status || "all").trim().toLowerCase();

    const filter = {};

    if (status === "published") {
      filter.isPublished = true;
    } else if (status === "draft") {
      filter.isPublished = false;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { slug: { $regex: search, $options: "i" } },
        { categoryLabel: { $regex: search, $options: "i" } },
        { sectionLabel: { $regex: search, $options: "i" } },
        { excerpt: { $regex: search, $options: "i" } },
      ];
    }

    const [total, blogs, publishedCount, draftCount] = await Promise.all([
      Blog.countDocuments(filter),
      Blog.find(filter)
        .sort({ updatedAt: -1, publishedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Blog.countDocuments({ isPublished: true }),
      Blog.countDocuments({ isPublished: false }),
    ]);

    return res.status(200).json({
      success: true,
      blogs: blogs.map((item) => formatBlog(req, item)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
      stats: {
        totalBlogs: publishedCount + draftCount,
        publishedCount,
        draftCount,
      },
    });
  } catch (error) {
    console.error("GET ADMIN BLOGS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch admin blogs",
      error: error.message,
    });
  }
};

exports.getAdminBlogMeta = async (req, res) => {
  try {
    await syncBlogSections();

    const [sections, categoryMeta] = await Promise.all([
      BlogSection.find().sort({ sectionOrder: 1, label: 1 }),
      Blog.aggregate([
        {
          $group: {
            _id: "$category",
            label: { $first: "$categoryLabel" },
          },
        },
        { $sort: { label: 1, _id: 1 } },
      ]),
    ]);

    return res.status(200).json({
      success: true,
      sections: sections.map((section) => ({
        value: section.key,
        label: section.label,
        sectionOrder: section.sectionOrder ?? 0,
      })),
      categories: categoryMeta
        .filter((item) => item._id)
        .map((item) => ({
          value: item._id,
          label: item.label || formatTitleFromSlug(item._id),
        })),
    });
  } catch (error) {
    console.error("GET ADMIN BLOG META ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch blog metadata",
      error: error.message,
    });
  }
};

exports.createAdminBlog = async (req, res) => {
  try {
    let payload = buildBlogPayload(req.body);
    payload = await applySectionMetadata(payload);
    const validationError = validateBlogPayload(payload);

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const existingBlog = await Blog.findOne({ slug: payload.slug });
    if (existingBlog) {
      return res.status(400).json({
        success: false,
        message: "A blog with this slug already exists",
      });
    }

    const blog = await Blog.create(payload);

    return res.status(201).json({
      success: true,
      blog: formatBlog(req, blog),
    });
  } catch (error) {
    console.error("CREATE ADMIN BLOG ERROR:", error);
    if (error.message === "Please select a valid blog section") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    return res.status(500).json({
      success: false,
      message: "Failed to create blog",
      error: error.message,
    });
  }
};

exports.updateAdminBlog = async (req, res) => {
  try {
    let payload = buildBlogPayload(req.body);
    payload = await applySectionMetadata(payload);
    const validationError = validateBlogPayload(payload);

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const existingBlog = await Blog.findOne({
      slug: payload.slug,
      _id: { $ne: req.params.id },
    });

    if (existingBlog) {
      return res.status(400).json({
        success: false,
        message: "Another blog with this slug already exists",
      });
    }

    const updatedBlog = await Blog.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    });

    if (!updatedBlog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    return res.status(200).json({
      success: true,
      blog: formatBlog(req, updatedBlog),
    });
  } catch (error) {
    console.error("UPDATE ADMIN BLOG ERROR:", error);
    if (error.message === "Please select a valid blog section") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    return res.status(500).json({
      success: false,
      message: "Failed to update blog",
      error: error.message,
    });
  }
};

exports.deleteAdminBlog = async (req, res) => {
  try {
    const deletedBlog = await Blog.findByIdAndDelete(req.params.id);

    if (!deletedBlog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Blog deleted successfully",
    });
  } catch (error) {
    console.error("DELETE ADMIN BLOG ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete blog",
      error: error.message,
    });
  }
};

exports.deleteManyAdminBlogs = async (req, res) => {
  try {
    const ids = Array.isArray(req.body?.ids) ? req.body.ids : [];

    if (!ids.length) {
      return res.status(400).json({
        success: false,
        message: "Please provide blog ids to delete",
      });
    }

    await Blog.deleteMany({ _id: { $in: ids } });

    return res.status(200).json({
      success: true,
      message: "Selected blogs deleted successfully",
    });
  } catch (error) {
    console.error("DELETE MANY ADMIN BLOGS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete selected blogs",
      error: error.message,
    });
  }
};

exports.getAdminBlogSections = async (req, res) => {
  try {
    await syncBlogSections();
    const sections = await BlogSection.find().sort({ sectionOrder: 1, label: 1 });

    return res.status(200).json({
      success: true,
      sections,
    });
  } catch (error) {
    console.error("GET ADMIN BLOG SECTIONS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch blog sections",
      error: error.message,
    });
  }
};

exports.createAdminBlogSection = async (req, res) => {
  try {
    const label = String(req.body?.label || "").trim();
    const key = slugify(req.body?.key || label);
    const sectionOrder = parseNumber(req.body?.sectionOrder, 0);

    if (!label || !key) {
      return res.status(400).json({
        success: false,
        message: "Section label and key are required",
      });
    }

    const existingSection = await BlogSection.findOne({ key });
    if (existingSection) {
      return res.status(400).json({
        success: false,
        message: "A section with this key already exists",
      });
    }

    const section = await BlogSection.create({
      label,
      key,
      sectionOrder,
    });

    return res.status(201).json({
      success: true,
      section,
    });
  } catch (error) {
    console.error("CREATE ADMIN BLOG SECTION ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create blog section",
      error: error.message,
    });
  }
};

exports.updateAdminBlogSection = async (req, res) => {
  try {
    const existingSection = await BlogSection.findById(req.params.id);

    if (!existingSection) {
      return res.status(404).json({
        success: false,
        message: "Blog section not found",
      });
    }

    const previousKey = existingSection.key;
    const nextLabel = String(req.body?.label || existingSection.label || "").trim();
    const nextKey = slugify(req.body?.key || existingSection.key || nextLabel);
    const nextOrder = parseNumber(req.body?.sectionOrder, existingSection.sectionOrder ?? 0);

    if (!nextLabel || !nextKey) {
      return res.status(400).json({
        success: false,
        message: "Section label and key are required",
      });
    }

    const keyConflict = await BlogSection.findOne({
      key: nextKey,
      _id: { $ne: existingSection._id },
    });

    if (keyConflict) {
      return res.status(400).json({
        success: false,
        message: "Another section with this key already exists",
      });
    }

    existingSection.label = nextLabel;
    existingSection.key = nextKey;
    existingSection.sectionOrder = nextOrder;
    await existingSection.save();

    await Blog.updateMany(
      { section: previousKey },
      {
        $set: {
          section: nextKey,
          sectionLabel: nextLabel,
          sectionOrder: nextOrder,
        },
      }
    );

    return res.status(200).json({
      success: true,
      section: existingSection,
    });
  } catch (error) {
    console.error("UPDATE ADMIN BLOG SECTION ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update blog section",
      error: error.message,
    });
  }
};

exports.getBlogsBySection = async (req, res) => {
  try {
    const section = String(req.params.section || "").trim().toLowerCase();

    const blogs = await Blog.find({
      isPublished: true,
      section: section,
    }).sort({ cardOrder: 1, publishedAt: -1 });

    return res.status(200).json({
      success: true,
      blogs: blogs.map((item) => formatBlog(req, item)),
    });
  } catch (error) {
    console.error("GET BLOGS BY SECTION ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch section blogs",
      error: error.message,
    });
  }
};

exports.getBlogsByCategory = async (req, res) => {
  try {
    const category = String(req.params.category || "").trim().toLowerCase();

    const blogs = await Blog.find({
      isPublished: true,
      category: category,
    }).sort({ publishedAt: -1, cardOrder: 1 });

    return res.status(200).json({
      success: true,
      blogs: blogs.map((item) => formatBlog(req, item)),
    });
  } catch (error) {
    console.error("GET BLOGS BY CATEGORY ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch category blogs",
      error: error.message,
    });
  }
};

exports.getBlogBySlug = async (req, res) => {
  try {
    const slug = String(req.params.slug || "").trim().toLowerCase();

    const blog = await Blog.findOne({
      slug,
      isPublished: true,
    });

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    await Blog.updateOne({ _id: blog._id }, { $inc: { views: 1 } });

    const relatedBlogs = await Blog.find({
      _id: { $ne: blog._id },
      isPublished: true,
      $or: [{ category: blog.category }, { section: blog.section }],
    })
      .sort({ publishedAt: -1 })
      .limit(8);

    return res.status(200).json({
      success: true,
      blog: formatBlog(req, blog),
      relatedBlogs: relatedBlogs.map((item) => formatBlog(req, item)),
    });
  } catch (error) {
    console.error("GET BLOG BY SLUG ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch blog details",
      error: error.message,
    });
  }
};
