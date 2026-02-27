const express = require("express");
const router = express.Router();

const { protect, admin } =
 require("../middleware/authMiddleware");

const adminController =
 require("../controllers/adminController");


/* ======================================================
   🧠 DASHBOARD
====================================================== */
router.get(
  "/dashboard",
  protect,
  admin,
  adminController.getDashboard
);

/* 📊 SALES GRAPH (PRO) */
router.get(
  "/sales-graph",
  protect,
  admin,
  adminController.getSalesGraph
);


/* ======================================================
   🛒 PRODUCTS
====================================================== */

/* 🔥 CREATE PRODUCT (ADDED) */
router.post(
  "/products",
  protect,
  admin,
  adminController.createProduct
);

router.get(
  "/products",
  protect,
  admin,
  adminController.getAllProducts
);

router.put(
  "/products/:id",
  protect,
  admin,
  adminController.updateProduct
);

router.delete(
  "/products/:id",
  protect,
  admin,
  adminController.deleteProduct
);

/* 📦 INVENTORY UPDATE */
router.patch(
  "/products/:id/inventory",
  protect,
  admin,
  adminController.updateInventory
);

/* 🔥 AUTO BEST SELLER ENGINE */
router.post(
  "/products/auto-best-seller",
  protect,
  admin,
  adminController.autoBestSeller
);


/* ======================================================
   📦 ORDERS
====================================================== */
router.get(
  "/orders",
  protect,
  admin,
  adminController.getOrders
);

router.put(
  "/orders/status",
  protect,
  admin,
  adminController.updateOrderStatus
);


/* ======================================================
   👤 USERS
====================================================== */
router.get(
  "/users",
  protect,
  admin,
  adminController.getUsers
);

router.patch(
  "/users/:id/status",
  protect,
  admin,
  adminController.toggleUserStatus
);


/* ======================================================
   🎁 OFFERS
====================================================== */
router.post(
  "/offers",
  protect,
  admin,
  adminController.createOffer
);

router.get(
  "/offers",
  protect,
  admin,
  adminController.getOffers
);

router.delete(
  "/offers/:id",
  protect,
  admin,
  adminController.deleteOffer
);

module.exports = router;
