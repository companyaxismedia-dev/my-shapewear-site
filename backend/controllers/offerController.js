const Offer = require("../models/Offer");

/* ======================================================
   🎯 VALIDATE COUPON
====================================================== */
exports.validateOffer = async (req, res) => {
  try {
    const { code, cartTotal = 0 } = req.body;

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
    const now = new Date();

    const offers = await Offer.find({
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
    }).sort({ createdAt: -1 });

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