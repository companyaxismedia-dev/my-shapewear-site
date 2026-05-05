const Offer = require("../models/Offer");
const { cached } = require("../utils/cache");

function normalizeCriterion(value) {
  return String(value || "").trim().toLowerCase();
}

function getIdString(value) {
  if (!value) return "";
  if (typeof value === "string") return value;
  return String(value._id || value.id || value);
}

function offerMatchesCartCriteria(offer, cartItems = []) {
  const productTargets = Array.isArray(offer.applicableProducts)
    ? offer.applicableProducts.map(getIdString).filter(Boolean)
    : [];
  const categoryTargets = Array.isArray(offer.applicableCategories)
    ? offer.applicableCategories.map(normalizeCriterion).filter(Boolean)
    : [];

  const productMatched =
    productTargets.length === 0 ||
    cartItems.some((item) => productTargets.includes(getIdString(item.productId)));

  const categoryMatched =
    categoryTargets.length === 0 ||
    cartItems.some((item) =>
      [item.category, item.subCategory, item.childCategory]
        .map(normalizeCriterion)
        .some((value) => value && categoryTargets.includes(value))
    );

  return productMatched && categoryMatched;
}

/* ======================================================
   🎯 VALIDATE COUPON
====================================================== */
exports.validateOffer = async (req, res) => {
  try {
    const { code, cartTotal = 0, cartItems = [] } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Coupon code required",
      });
    }

    const offer = await Offer.findOne({
      code: code.toUpperCase(),
    });

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: "Invalid coupon",
      });
    }

    if (!offer.isValidOffer()) {
      return res.status(400).json({
        success: false,
        message: "Offer expired",
      });
    }

    if (cartTotal < offer.minOrderValue) {
      return res.status(400).json({
        success: false,
        message: `Minimum order ₹${offer.minOrderValue}`,
      });
    }

    if (!offerMatchesCartCriteria(offer, cartItems)) {
      return res.status(400).json({
        success: false,
        message: "You are not eligible for this coupon",
      });
    }

    let discount = 0;

    if (offer.discountType === "flat") {
      discount = offer.discountValue;
    } else {
      discount = (cartTotal * offer.discountValue) / 100;
      if (offer.maxDiscount) {
        discount = Math.min(discount, offer.maxDiscount);
      }
    }

    return res.json({
      success: true,
      discount,
      finalTotal: cartTotal - discount,
      offer,
    });

  } catch (err) {
    console.error("Validate Offer Error:", err);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/* ======================================================
   🎁 GET ALL ACTIVE OFFERS (FRONTEND)
====================================================== */
exports.getOffers = async (req, res) => {
  try {
    const offers = await cached("offers:active", 60000, async () => {
      const now = new Date();

      return Offer.find({
        isActive: true,
        startDate: { $lte: now },
        endDate: { $gte: now },
      }).sort({ createdAt: -1 }).lean();
    });

    res.set("Cache-Control", "public, max-age=60, stale-while-revalidate=300");
    return res.json({
      success: true,
      offers,
    });

  } catch (err) {
    console.error("Get Offers Error:", err);
    res.status(500).json({
      success: false,
      offers: [],
    });
  }
};

/* ======================================================
   GET FEATURED ACTIVE OFFER (FRONTEND)
====================================================== */
exports.getActiveOffer = async (req, res) => {
  try {
    const offer = await cached("offers:featured", 60000, async () => {
      const now = new Date();

      return Offer.findOne({
        isActive: true,
        startDate: { $lte: now },
        endDate: { $gte: now },
      }).sort({ createdAt: -1 }).lean();
    });

    res.set("Cache-Control", "public, max-age=60, stale-while-revalidate=300");
    return res.json({
      success: true,
      offer,
    });

  } catch (err) {
    console.error("Get Active Offer Error:", err);
    res.status(500).json({
      success: false,
      offer: null,
    });
  }
};

/* ======================================================
   ➕ CREATE OFFER (POSTMAN / ADMIN)
====================================================== */
exports.createOffer = async (req, res) => {
  try {
    const offer = await Offer.create(req.body);

    res.status(201).json({
      success: true,
      offer,
    });

  } catch (err) {
    console.error("Create Offer Error:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
