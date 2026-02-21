const Offer = require("../models/Offer");

exports.validateOffer = async (req, res) => {
  try {
    const { code, cartTotal } = req.body;

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

    res.json({
      success: true,
      discount,
      finalTotal: cartTotal - discount,
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
