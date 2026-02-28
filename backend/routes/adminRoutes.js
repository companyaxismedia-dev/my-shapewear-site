const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const { protect, admin } = require("../middleware/authMiddleware");

const adminController = require("../controllers/adminController");

router.get("/dashboard", protect, admin, adminController.getDashboard);
router.get("/sales-graph", protect, admin, adminController.getSalesGraph);
router.post("/products", protect, admin, adminController.createProduct);
router.post("/upload",protect,admin,upload.single("file"),adminController.uploadFile);

router.get("/products", protect, admin, adminController.getAllProducts);
router.put("/products/:id", protect, admin, adminController.updateProduct);
router.delete("/products/:id", protect, admin, adminController.deleteProduct);
router.post("/products/delete-many",protect,admin,adminController.deleteManyProducts);

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
