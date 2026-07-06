const Category = require("../models/category");
const NodeCache = require("node-cache");
const cache = new NodeCache({ stdTTL: 600 }); // 10 min
const fs = require("fs");
const path = require("path");

// @desc    Create a new category
// @route   POST /api/categories
// @access  Private/Admin
const createCategory = async (req, res) => {
  try {
    const {
      name,
      slug,
      description,
      metaTitle,
      metaDescription,
      mataKeywords,
      isActive,
    } = req.body;

    // file uploaded via multer
    const image = req.file ? req.file.path : null;

    // groups may come as JSON string from form-data
    let groups = req.body.groups;
    if (groups && typeof groups === "string") {
      groups = JSON.parse(groups);
    }

    // check if slug exists
    const categoryExists = await Category.findOne({ slug }).lean();

    if (categoryExists) {
      return res.status(400).json({
        success: false,
        message: "Category with this slug already exists",
      });
    }

    const category = await Category.create({
      name,
      slug,
      image,
      description,
      groups,
      metaTitle,
      metaDescription,
      mataKeywords,
      isActive,
    });

    // clear cache if using node-cache
    if (global.cache) {
      global.cache.del("categories");
    }

    return res.status(201).json({
      success: true,
      message: "Category created successfully",
      category,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
const getCategories = async (req, res) => {
  try {

    const cached = cache.get("categories");

    if (cached) {
      return res.json({
        success: true,
        message: "From cache",
        categories: cached
      });
    }

    const categories = await Category.find({})
      .lean();

    cache.set("categories", categories);

    res.json({
      success: true,
      categories
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single category by slug or id
// @route   GET /api/categories/:idOrSlug
// @access  Public
const getCategory = async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    let category;

    // Try to find by slug first, if not found then by ID (requires valid ObjectId)
    category = await Category.findOne({ slug: idOrSlug });

    if (!category && idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
      category = await Category.findById(idOrSlug);
    }

    if (category) {
      res.json(category);
    } else {
      res.status(404).json({ message: "Category not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Private/Admin
// const updateCategory = async (req, res) => {
//   try {
//     const { name, slug, image, description, groups, metaTitle, metaDescription, mataKeywords, isActive, } = req.body; 

//     const category = await Category.findById(req.params.id);

//     if (category) {
//       category.name = name || category.name;
//       category.slug = slug || category.slug;
//       category.image = image !== undefined ? image : category.image;
//       category.description =
//         description !== undefined ? description : category.description;
//       // Provide empty array default if intentional clearing, otherwise fallback
//       category.groups = groups || category.groups;
//       category.metaTitle =
//         metaTitle !== undefined ? metaTitle : category.metaTitle;
//       category.metaDescription =
//         metaDescription !== undefined
//           ? metaDescription
//           : category.metaDescription;
//       category.mataKeywords =
//         mataKeywords !== undefined ? mataKeywords : category.mataKeywords;
//       category.isActive = isActive !== undefined ? isActive : category.isActive;

//       const updatedCategory = await category.save();
//       cache.del("categories");
//       res.json({
//         success: true,
//         message:"Category updated successfully",
//         updatedCategory
//       });
//     } else {
//       res.status(404).json({ message: "Category not found" });
//     }
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };
const updateCategory = async (req, res) => {
  try {
    const {
      name,
      slug,
      description,
      groups,
      metaTitle,
      metaDescription,
      mataKeywords,
      isActive,
    } = req.body;

    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // parse groups if sent as string
    let parsedGroups = groups;
    if (groups && typeof groups === "string") {
      parsedGroups = JSON.parse(groups);
    }

    // if new image uploaded
    if (req.file) {
      // delete previous image
      if (category.image) {
        const oldImagePath = path.join(process.cwd(), category.image);

        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

      // assign new image
      category.image = req.file.path;
    }

    // update fields
    category.name = name || category.name;
    category.slug = slug || category.slug;
    category.description =
      description !== undefined ? description : category.description;
    category.groups = parsedGroups || category.groups;
    category.metaTitle =
      metaTitle !== undefined ? metaTitle : category.metaTitle;
    category.metaDescription =
      metaDescription !== undefined
        ? metaDescription
        : category.metaDescription;
    category.mataKeywords =
      mataKeywords !== undefined ? mataKeywords : category.mataKeywords;
    category.isActive = isActive !== undefined ? isActive : category.isActive;

    const updatedCategory = await category.save();

    // clear cache
    if (global.cache) {
      global.cache.del("categories");
    }

    return res.json({
      success: true,
      message: "Category updated successfully",
      category: updatedCategory,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (category) {
      await category.deleteOne();
      res.json({ message: "Category removed" });
    } else {
      res.status(404).json({ message: "Category not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// --- Group and Subcategory specific endpoints (Optional but helpful) ---

// @desc    Add a group to a category
// @route   POST /api/categories/:id/groups
// @access  Private/Admin
const addGroupToCategory = async (req, res) => {
  try {
    const { title, leftPanelName, items } = req.body;
    const category = await Category.findById(req.params.id);

    if (category) {
      category.groups.push({
        title,
        leftPanelName,
        items: items || [],
      });
      await category.save();
      res.status(201).json(category);
    } else {
      res.status(404).json({ message: "Category not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  createCategory,
  getCategories,
  getCategory,
  updateCategory,
  deleteCategory,
  addGroupToCategory,
};
