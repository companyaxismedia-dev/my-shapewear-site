const Blog = require("../models/Blog");

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

exports.getBlogLandingPage = async (req, res) => {
  try {
    const heroPosts = await Blog.find({
      isPublished: true,
      section: "hero",
    })
      .sort({ heroRank: 1, publishedAt: -1 })
      .limit(3);

    const recentPosts = await Blog.find({
      isPublished: true,
      section: "recent-posts",
    })
      .sort({ cardOrder: 1, publishedAt: -1 })
      .limit(8);

    const popularPosts = await Blog.find({
      isPublished: true,
      section: "most-popular",
    })
      .sort({ cardOrder: 1, publishedAt: -1 })
      .limit(8);

    const howTos = await Blog.find({
      isPublished: true,
      section: "how-tos",
    })
      .sort({ cardOrder: 1, publishedAt: -1 })
      .limit(8);

    const lingerie101 = await Blog.find({
      isPublished: true,
      section: "lingerie-101",
    })
      .sort({ cardOrder: 1, publishedAt: -1 })
      .limit(8);

    const buyingGuide = await Blog.find({
      isPublished: true,
      section: "buying-guide",
    })
      .sort({ cardOrder: 1, publishedAt: -1 })
      .limit(8);

    const gloviaBuzz = await Blog.find({
      isPublished: true,
      section: "glovia-buzz",
    })
      .sort({ cardOrder: 1, publishedAt: -1 })
      .limit(8);

    const gloviaConnect = await Blog.find({
      isPublished: true,
      section: "glovia-connect",
    })
      .sort({ cardOrder: 1, publishedAt: -1 })
      .limit(8);

    const tipsTricks = await Blog.find({
      isPublished: true,
      section: "tips-tricks",
    })
      .sort({ cardOrder: 1, publishedAt: -1 })
      .limit(8);

    return res.status(200).json({
      success: true,
      page: {
        heroPosts: heroPosts.map((item) => formatBlog(req, item)),
        recentPosts: recentPosts.map((item) => formatBlog(req, item)),
        popularPosts: popularPosts.map((item) => formatBlog(req, item)),
        sections: [
          {
            key: "how-tos",
            title: "How-Tos",
            viewAllLink: "/blog/section/how-tos",
            posts: howTos.map((item) => formatBlog(req, item)),
          },
          {
            key: "lingerie-101",
            title: "Lingerie 101",
            viewAllLink: "/blog/section/lingerie-101",
            posts: lingerie101.map((item) => formatBlog(req, item)),
          },
          {
            key: "buying-guide",
            title: "Buying Guide",
            viewAllLink: "/blog/section/buying-guide",
            posts: buyingGuide.map((item) => formatBlog(req, item)),
          },
          {
            key: "glovia-buzz",
            title: "glovia Buzz",
            viewAllLink: "/blog/section/glovia-buzz",
            posts: gloviaBuzz.map((item) => formatBlog(req, item)),
          },
          {
            key: "glovia-connect",
            title: "glovia Connect",
            viewAllLink: "/blog/section/glovia-connect",
            posts: gloviaConnect.map((item) => formatBlog(req, item)),
          },
          {
            key: "tips-tricks",
            title: "Tips & Tricks",
            viewAllLink: "/blog/section/tips-tricks",
            posts: tipsTricks.map((item) => formatBlog(req, item)),
          },
        ],
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