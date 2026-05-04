const express = require("express");
const router = express.Router();
const Blog = require("../models/Blog");

const {
  getBlogLandingPage,
  getBlogBySlug,
  getBlogsBySection,
  getBlogsByCategory,
} = require("../controllers/blogController");

// ✅ CREATE BLOG
router.post("/", async (req, res) => {
  try {
    const blog = await Blog.create(req.body);

    res.status(201).json({
      success: true,
      blog,
    });
  } catch (error) {
    console.error("CREATE BLOG ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Blog create failed",
      error: error.message,
    });
  }
});


// ✅ BULK CREATE BLOG  👈 (YEH YAHAN ADD KARNA HAI)
router.post("/bulk", async (req, res) => {
  try {
    const blogs = Array.isArray(req.body) ? req.body : req.body.blogs;

    if (!Array.isArray(blogs) || !blogs.length) {
      return res.status(400).json({
        success: false,
        message: "Please provide an array of blogs",
      });
    }

    const createdBlogs = await Blog.insertMany(blogs);

    res.status(201).json({
      success: true,
      count: createdBlogs.length,
      blogs: createdBlogs,
    });
  } catch (error) {
    console.error("BULK CREATE BLOG ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Bulk blog create failed",
      error: error.message,
    });
  }
});

router.get("/", getBlogLandingPage);
router.get("/section/:section", getBlogsBySection);
router.get("/category/:category", getBlogsByCategory);
router.get("/:slug", getBlogBySlug);

module.exports = router;