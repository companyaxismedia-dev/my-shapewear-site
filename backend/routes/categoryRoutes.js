const express = require("express");
const router = express.Router();
const {
  createCategory,
  getCategories,
  getCategory,
  updateCategory,
  deleteCategory,
  addGroupToCategory,
} = require("../controllers/categoryController");


// Assuming you have middleware for protect/admin, import them here
const { protect, admin } = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

router
  .route("/")
  .get(getCategories)
  // Add protect/admin middleware if required: .post(protect, admin, createCategory)
  .post(protect, admin, upload.single("file") ,createCategory);

router.route("/:idOrSlug").get(getCategory);

router
  .route("/:id")
  // Add protect/admin middleware if required: .put(protect, admin, updateCategory).delete(protect, admin, deleteCategory)
  .put( upload.single("file") ,updateCategory)
  .delete(protect, admin, deleteCategory);

// Specific routes for inner arrays (groups)
router
  .route("/:id/groups")
  // Add protect/admin middleware if required
  .post(addGroupToCategory);

module.exports = router;
