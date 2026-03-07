const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const { protect, admin } = require("../middleware/authMiddleware");

const adminController = require("../controllers/adminController");

router.get("/dashboard", protect, admin, adminController.getDashboard);
router.get("/sales-graph", protect, admin, adminController.getSalesGraph);
router.post(
  "/products",
  protect,
  admin,
  upload.any(),
  adminController.createProduct,
);
router.post(
  "/upload",
  protect,
  admin,
  upload.single("file"),
  adminController.uploadFile,
);

// DRAFT ROUTES - MUST BE BEFORE GENERIC :id ROUTES
router.get("/products/drafts", protect, admin, adminController.getDraftProducts);
router.get("/products/drafts/:id", protect, admin, adminController.getDraft);
router.post("/products/drafts/delete-many", protect, admin, adminController.deleteManyDrafts);
router.delete("/products/drafts/:id", protect, admin, adminController.deleteDraft);

// GENERAL PRODUCTS ROUTES
router.get("/products", protect, admin, adminController.getAllProducts);
router.post("/products/delete-many", protect, admin, adminController.deleteManyProducts);

// GENERIC :id ROUTES - MUST BE LAST
router.put("/products/:id/publish", protect, admin, adminController.publishDraft);
router.put("/products/:id", protect, admin, upload.any(), adminController.updateProduct);
router.delete("/products/:id", protect, admin, adminController.deleteProduct);

router.patch("/products/:id/inventory", protect, admin, adminController.updateInventory);
router.post("/products/auto-best-seller", protect, admin, adminController.autoBestSeller);
router.get("/orders", protect, admin, adminController.getOrders);
router.put("/orders/status", protect, admin, adminController.updateOrderStatus);
router.get("/users", protect, admin, adminController.getUsers);
router.patch("/users/:id/status", protect, admin, adminController.toggleUserStatus);
router.post("/offers", protect, admin, adminController.createOffer);
router.get("/offers", protect, admin, adminController.getOffers);
router.delete("/offers/:id", protect, admin, adminController.deleteOffer);

module.exports = router;
