const mongoose = require("mongoose");
const Category = require("../models/category");
const Product = require("../models/Product");

const toSlug = (value = "") =>
  String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const normalizeKeywords = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item || "").trim()).filter(Boolean);
  }

  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

const buildCategoryPayload = async (body, existingCategory = null) => {
  const payload = {
    name: String(body.name || existingCategory?.name || "").trim(),
    slug: toSlug(body.slug || body.name || existingCategory?.slug || ""),
    description:
      body.description !== undefined
        ? String(body.description || "").trim()
        : existingCategory?.description || "",
    metaTitle:
      body.metaTitle !== undefined
        ? String(body.metaTitle || "").trim()
        : existingCategory?.metaTitle || "",
    metaDescription:
      body.metaDescription !== undefined
        ? String(body.metaDescription || "").trim()
        : existingCategory?.metaDescription || "",
    metaKeywords:
      body.metaKeywords !== undefined
        ? normalizeKeywords(body.metaKeywords)
        : existingCategory?.metaKeywords || [],
    isActive: body.isActive !== undefined ? Boolean(body.isActive) : existingCategory?.isActive ?? true,
    sortOrder:
      body.sortOrder !== undefined && body.sortOrder !== ""
        ? Number(body.sortOrder)
        : existingCategory?.sortOrder ?? 0,
  };

  const requestedParent = body.parent === "" ? null : body.parent;
  if (requestedParent !== undefined) {
    payload.parent = requestedParent || null;
  }

  if (!payload.name) {
    const error = new Error("Category name is required");
    error.status = 400;
    throw error;
  }

  if (!payload.slug) {
    const error = new Error("Category slug is required");
    error.status = 400;
    throw error;
  }

  return payload;
};

const updateParentReference = async (parentId, categoryId, operation) => {
  if (!parentId) return;

  await Category.findByIdAndUpdate(parentId, {
    [operation === "add" ? "$addToSet" : "$pull"]: { subCategories: categoryId },
  });
};

const syncDescendantHierarchy = async (categoryId) => {
  const parentCategory = await Category.findById(categoryId).select("_id ancestors");
  if (!parentCategory) return;

  const children = await Category.find({ parent: categoryId }).select("_id");

  for (const child of children) {
    const ancestors = [...parentCategory.ancestors, parentCategory._id];
    await Category.findByIdAndUpdate(child._id, {
      $set: {
        ancestors,
        level: ancestors.length,
      },
    });
    await syncDescendantHierarchy(child._id);
  }
};

const buildTree = (categories) => {
  const nodeMap = new Map();
  const roots = [];

  const sortedCategories = [...categories].sort((a, b) => {
    if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
    return a.name.localeCompare(b.name);
  });

  sortedCategories.forEach((category) => {
    nodeMap.set(String(category._id), {
      ...category,
      subCategories: [],
    });
  });

  sortedCategories.forEach((category) => {
    const node = nodeMap.get(String(category._id));
    const parentId =
      category.parent && typeof category.parent === "object"
        ? String(category.parent._id)
        : category.parent
          ? String(category.parent)
          : null;

    if (parentId) {
      const parentNode = nodeMap.get(parentId);
      if (parentNode) {
        parentNode.subCategories.push(node);
        return;
      }
    }

    roots.push(node);
  });

  return roots;
};

const getProductCountsBySlug = async (slugs) => {
  if (!slugs.length) return new Map();

  const counts = await Product.aggregate([
    {
      $match: {
        $or: [{ category: { $in: slugs } }, { subCategory: { $in: slugs } }],
      },
    },
    {
      $project: {
        categoryKeys: ["$category", "$subCategory"],
      },
    },
    { $unwind: "$categoryKeys" },
    { $match: { categoryKeys: { $in: slugs } } },
    {
      $group: {
        _id: "$categoryKeys",
        count: { $sum: 1 },
      },
    },
  ]);

  return new Map(counts.map((item) => [item._id, item.count]));
};

exports.getAdminCategories = async (req, res) => {
  try {
    const search = String(req.query.search || "").trim();
    const filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { slug: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const categories = await Category.find(filter)
      .sort({ level: 1, sortOrder: 1, name: 1 })
      .populate("parent", "_id name slug")
      .lean();

    const countsBySlug = await getProductCountsBySlug(categories.map((category) => category.slug));
    const categoriesWithCounts = categories.map((category) => ({
      ...category,
      productCount: countsBySlug.get(category.slug) || 0,
      subCategoryCount: Array.isArray(category.subCategories) ? category.subCategories.length : 0,
    }));

    res.status(200).json({
      success: true,
      categories: categoriesWithCounts,
      tree: buildTree(categoriesWithCounts),
    });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || "Failed to fetch categories",
    });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const payload = await buildCategoryPayload(req.body);
    let parentCategory = null;

    if (payload.parent) {
      if (!mongoose.Types.ObjectId.isValid(payload.parent)) {
        return res.status(400).json({
          success: false,
          message: "Invalid parent category",
        });
      }

      parentCategory = await Category.findById(payload.parent).select("_id ancestors");
      if (!parentCategory) {
        return res.status(404).json({
          success: false,
          message: "Parent category not found",
        });
      }
    }

    const category = await Category.create({
      ...payload,
      parent: parentCategory?._id || null,
      ancestors: parentCategory ? [...parentCategory.ancestors, parentCategory._id] : [],
      level: parentCategory ? parentCategory.ancestors.length + 1 : 0,
    });

    await updateParentReference(parentCategory?._id, category._id, "add");

    const createdCategory = await Category.findById(category._id)
      .populate("parent", "_id name slug")
      .populate("subCategories", "_id name slug");

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      category: createdCategory,
    });
  } catch (error) {
    const isDuplicate = error?.code === 11000;

    res.status(isDuplicate ? 409 : error.status || 500).json({
      success: false,
      message: isDuplicate
        ? "Category name or slug already exists at this level"
        : error.message || "Failed to create category",
    });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const payload = await buildCategoryPayload(req.body, category);
    const previousParentId = category.parent ? String(category.parent) : null;
    let parentCategory = null;

    if (payload.parent) {
      if (!mongoose.Types.ObjectId.isValid(payload.parent)) {
        return res.status(400).json({
          success: false,
          message: "Invalid parent category",
        });
      }

      if (String(payload.parent) === String(category._id)) {
        return res.status(400).json({
          success: false,
          message: "A category cannot be its own parent",
        });
      }

      const invalidParent = await Category.exists({
        _id: payload.parent,
        ancestors: category._id,
      });

      if (invalidParent) {
        return res.status(400).json({
          success: false,
          message: "A category cannot be moved under its own descendant",
        });
      }

      parentCategory = await Category.findById(payload.parent).select("_id ancestors");
      if (!parentCategory) {
        return res.status(404).json({
          success: false,
          message: "Parent category not found",
        });
      }
    }

    category.name = payload.name;
    category.slug = payload.slug;
    category.description = payload.description;
    category.metaTitle = payload.metaTitle;
    category.metaDescription = payload.metaDescription;
    category.metaKeywords = payload.metaKeywords;
    category.isActive = payload.isActive;
    category.sortOrder = payload.sortOrder;
    category.parent = parentCategory?._id || null;
    category.ancestors = parentCategory ? [...parentCategory.ancestors, parentCategory._id] : [];
    category.level = category.ancestors.length;

    await category.save();

    const nextParentId = category.parent ? String(category.parent) : null;
    if (previousParentId !== nextParentId) {
      await updateParentReference(previousParentId, category._id, "remove");
      await updateParentReference(nextParentId, category._id, "add");
    }

    await syncDescendantHierarchy(category._id);

    const updatedCategory = await Category.findById(category._id)
      .populate("parent", "_id name slug")
      .populate("subCategories", "_id name slug");

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      category: updatedCategory,
    });
  } catch (error) {
    const isDuplicate = error?.code === 11000;

    res.status(isDuplicate ? 409 : error.status || 500).json({
      success: false,
      message: isDuplicate
        ? "Category name or slug already exists at this level"
        : error.message || "Failed to update category",
    });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id).select("_id parent");
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const categoriesToDelete = await Category.find({
      $or: [{ _id: category._id }, { ancestors: category._id }],
    })
      .select("_id slug")
      .lean();

    const slugsToDelete = categoriesToDelete.map((item) => item.slug);
    const linkedProducts = await Product.countDocuments({
      $or: [{ category: { $in: slugsToDelete } }, { subCategory: { $in: slugsToDelete } }],
    });

    if (linkedProducts > 0) {
      return res.status(400).json({
        success: false,
        message: "This category tree is linked to products and cannot be deleted yet",
      });
    }

    await updateParentReference(category.parent, category._id, "remove");
    await Category.deleteMany({
      _id: { $in: categoriesToDelete.map((item) => item._id) },
    });

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || "Failed to delete category",
    });
  }
};
