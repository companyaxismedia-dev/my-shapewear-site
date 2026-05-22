const Cart = require("../models/Cart");
const Product = require("../models/Product");
const User = require("../models/User");
const Offer = require("../models/Offer");

const PLATFORM_FEE = 0;
const SHIPPING_FEE = 0;

function getCartItemPricing(product, selectedSize, qty, fallbackSize, fallbackColor) {
  const selectedVariant =
    product.variants?.find((variant) => variant.color === fallbackColor) ||
    product.variants?.find((variant) =>
      variant?.sizes?.some((size) => size.size === fallbackSize)
    ) ||
    product.variants?.[0];

  const selectedSizeObj =
    selectedVariant?.sizes?.find((size) => size.size === selectedSize) ||
    selectedVariant?.sizes?.find((size) => size.size === fallbackSize) ||
    selectedVariant?.sizes?.[0];

  const price = selectedSizeObj?.price || product.minPrice || 0;
  const mrp = selectedSizeObj?.mrp || product.mrp || price;
  const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
  const image = product.thumbnail || selectedVariant?.images?.[0]?.url || "/fallback.jpg";
  const availableSizes = [
    ...new Set(
      (product.variants || []).flatMap((variant) =>
        (variant?.sizes || []).filter((size) => size?.size).map((size) => size.size)
      )
    ),
  ];

  return {
    productId: product._id,
    slug: product.slug,
    name: product.name,
    brand: product.brand || "Imkaa",
    category: product.category || "",
    subCategory: product.subCategory || "",
    price,
    mrp,
    discount,
    image,
    seller: "Imkaa",
    deliveryDate: "5-7 Business Days",
    returnText: "3 days return available",
    availableSizes,
    lineTotal: price * qty,
  };
}

function calculateCouponDiscount(subTotal, coupon) {
  if (!coupon?.code) {
    return 0;
  }

  if (subTotal < (coupon.minOrderValue || 0)) {
    return 0;
  }

  if (coupon.discountType === "flat") {
    return Math.min(coupon.discountValue || 0, subTotal);
  }

  let discount = (subTotal * (coupon.discountValue || 0)) / 100;

  if (coupon.maxDiscount) {
    discount = Math.min(discount, coupon.maxDiscount);
  }

  return Math.min(discount, subTotal);
}

function buildCartSummary(formattedItems, coupon = null) {
  const total = formattedItems.reduce((sum, item) => sum + item.mrp * item.quantity, 0);
  const subTotal = formattedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const productDiscount = Math.max(total - subTotal, 0);
  const couponDiscount = calculateCouponDiscount(subTotal, coupon);
  const shipping = SHIPPING_FEE;
  const platformFee = PLATFORM_FEE;
  const youPay = Math.max(subTotal + shipping + platformFee - couponDiscount, 0);

  return {
    total,
    subTotal,
    discount: productDiscount,
    productDiscount,
    couponDiscount,
    shipping,
    platformFee,
    youPay,
    appliedCoupon: coupon?.code
      ? {
          code: coupon.code,
          title: coupon.title || "",
          discountType: coupon.discountType || "",
          discountValue: coupon.discountValue || 0,
          maxDiscount: coupon.maxDiscount ?? null,
          minOrderValue: coupon.minOrderValue || 0,
        }
      : null,
  };
}

function formatCartItems(cart) {
  return (cart?.items || [])
    .filter((item) => item.product)
    .map((item) => {
      const pricing = getCartItemPricing(
        item.product,
        item.size,
        item.qty,
        item.size,
        item.color
      );

      return {
        id: item._id,
        productId: pricing.productId,
        slug: pricing.slug,
        name: pricing.name,
        brand: pricing.brand,
        category: pricing.category,
        subCategory: pricing.subCategory,
        price: pricing.price,
        mrp: pricing.mrp,
        discount: pricing.discount,
        image: pricing.image,
        quantity: item.qty,
        size: item.size,
        color: item.color,
        seller: pricing.seller,
        deliveryDate: pricing.deliveryDate,
        returnText: pricing.returnText,
        availableSizes: pricing.availableSizes,
        lineTotal: pricing.lineTotal,
      };
    });
}

async function buildCartPayload(cart) {
  if (!cart) {
    return {
      success: true,
      items: [],
      summary: {
        total: 0,
        subTotal: 0,
        discount: 0,
        productDiscount: 0,
        couponDiscount: 0,
        shipping: 0,
        platformFee: PLATFORM_FEE,
        youPay: PLATFORM_FEE,
        appliedCoupon: null,
      },
    };
  }

  await cart.populate("items.product", "name brand category subCategory mrp minPrice thumbnail slug variants");
  const formattedItems = formatCartItems(cart);
  let appliedCoupon = null;

  if (cart.coupon?.code) {
    const offer = await Offer.findOne({ code: cart.coupon.code });

    if (!offer || !offer.isValidOffer() || !offerMatchesCartCriteria(offer, formattedItems)) {
      clearCartCoupon(cart);
      await cart.save();
    } else {
      cart.coupon = {
        code: offer.code,
        title: offer.title,
        discountType: offer.discountType,
        discountValue: offer.discountValue,
        maxDiscount: offer.maxDiscount,
        minOrderValue: offer.minOrderValue,
      };
      appliedCoupon = cart.coupon;
      await cart.save();
    }
  }

  return {
    success: true,
    items: formattedItems,
    summary: buildCartSummary(formattedItems, appliedCoupon),
  };
}

function clearCartCoupon(cart) {
  cart.coupon = {
    code: "",
    title: "",
    discountType: "",
    discountValue: 0,
    maxDiscount: null,
    minOrderValue: 0,
  };
}

function normalizeCriterion(value) {
  return String(value || "").trim().toLowerCase();
}

function getIdString(value) {
  if (!value) return "";
  if (typeof value === "string") return value;
  return String(value._id || value.id || value);
}

function offerMatchesCartCriteria(offer, items) {
  const productTargets = Array.isArray(offer.applicableProducts)
    ? offer.applicableProducts.map(getIdString).filter(Boolean)
    : [];
  const categoryTargets = Array.isArray(offer.applicableCategories)
    ? offer.applicableCategories.map(normalizeCriterion).filter(Boolean)
    : [];

  const productMatched =
    productTargets.length === 0 ||
    items.some((item) => productTargets.includes(getIdString(item.productId)));

  const categoryMatched =
    categoryTargets.length === 0 ||
    items.some((item) =>
      [item.category, item.subCategory, item.childCategory]
        .map(normalizeCriterion)
        .some((value) => value && categoryTargets.includes(value))
    );

  return productMatched && categoryMatched;
}

/* ================= GET CART ================= */
exports.getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id })
      .populate("items.product", "name brand category subCategory mrp minPrice thumbnail slug variants");

    if (!cart) {
      return res.status(200).json({
        success: true,
        items: [],
        summary: {
          total: 0,
          subTotal: 0,
          discount: 0,
          productDiscount: 0,
          couponDiscount: 0,
          shipping: 0,
          platformFee: PLATFORM_FEE,
          youPay: PLATFORM_FEE,
          appliedCoupon: null,
        },
      });
    }

    const formattedItems = cart.items
      .filter((item) => item.product)
      .map((item) => {
        const pricing = getCartItemPricing(
          item.product,
          item.size,
          item.qty,
          item.size,
          item.color
        );

        return {
          id: item._id,
          productId: pricing.productId,
          slug: pricing.slug,
          name: pricing.name,
          brand: pricing.brand,
          category: pricing.category,
          subCategory: pricing.subCategory,
          price: pricing.price,
          mrp: pricing.mrp,
          discount: pricing.discount,
          image: pricing.image,
          quantity: item.qty,
          size: item.size,
          color: item.color,
          seller: pricing.seller,
          deliveryDate: pricing.deliveryDate,
          returnText: pricing.returnText,
          availableSizes: pricing.availableSizes,
          lineTotal: pricing.lineTotal,
        };
      });

    let appliedCoupon = null;

    if (cart.coupon?.code) {
      const offer = await Offer.findOne({ code: cart.coupon.code });

      if (!offer || !offer.isValidOffer() || !offerMatchesCartCriteria(offer, formattedItems)) {
        clearCartCoupon(cart);
        await cart.save();
      } else {
        cart.coupon = {
          code: offer.code,
          title: offer.title,
          discountType: offer.discountType,
          discountValue: offer.discountValue,
          maxDiscount: offer.maxDiscount,
          minOrderValue: offer.minOrderValue,
        };
        appliedCoupon = cart.coupon;
        await cart.save();
      }
    }

    res.status(200).json({
      success: true,
      items: formattedItems,
      summary: buildCartSummary(formattedItems, appliedCoupon),
    });
  } catch (error) {
    res.status(500).json({ message: "Cart fetch failed" });
  }
};

/* ================= ADD ITEM ================= */
exports.addItemToCart = async (req, res) => {
  try {
    const { productId, qty = 1, size, color = "default" } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    const existingItem = cart.items.find(
      (item) =>
        item.product.toString() === productId &&
        item.size === size &&
        item.color === color
    );

    if (existingItem) {
      existingItem.qty += qty;
    } else {
      cart.items.push({
        product: productId,
        qty,
        size,
        color,
      });
    }

    await cart.save();

    // Update user's last activity
    try {
      const user = await User.findById(req.user._id);
      if (user) {
        user.lastActivity = new Date();
        await user.save();
      }
    } catch (e) {
      console.error("Failed to update lastActivity:", e.message);
    }

    res.status(200).json(await buildCartPayload(cart));

  } catch (error) {
    res.status(500).json({ message: "Add failed" });
  }
};

/* ================= UPDATE QTY ================= */
exports.updateQty = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const item = cart.items.id(itemId);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    item.qty = quantity;

    await cart.save();

    res.status(200).json(await buildCartPayload(cart));

  } catch (error) {
    res.status(500).json({ message: "Update failed" });
  }
};

/* ================= UPDATE SIZE ================= */
exports.updateSize = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { size } = req.body;

    const cart = await Cart.findOne({ user: req.user._id })
      .populate("items.product");

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const item = cart.items.id(itemId);

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    const product = item.product;


    let sizeFound = null;

    for (const variant of product.variants) {
      const found = variant.sizes.find(s => s.size === size);
      if (found) {
        sizeFound = found;
        break;
      }
    }

    if (!sizeFound) {
      return res.status(400).json({ message: "Size not available" });
    }

    if (sizeFound.stock < 1) {
      return res.status(400).json({ message: "Size out of stock" });
    }

    // ✅ Prevent duplicate (same product + size already exists)
    const duplicate = cart.items.find(
      (i) =>
        i.product._id.toString() === product._id.toString() &&
        i.size === size &&
        i._id.toString() !== itemId
    );

    if (duplicate) {
      return res.status(400).json({
        message: "Item with this size already exists in cart"
      });
    }

    // ✅ Update size
    item.size = size;

    await cart.save();

    res.status(200).json(await buildCartPayload(cart));

  } catch (error) {
    res.status(500).json({ message: "Size update failed" });
  }
};

/* ================= REMOVE SINGLE ITEM ================= */
exports.deleteItemFromCart = async (req, res) => {
  try {
    const { itemId } = req.params;

    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = cart.items.filter(
      (item) => item._id.toString() !== itemId
    );

    await cart.save();

    res.status(200).json(await buildCartPayload(cart));

  } catch (error) {
    res.status(500).json({ message: "Remove failed" });
  }
};

/* ================= MERGE ITEMS ================= */
exports.mergeItemsToCart = async (req, res) => {
  try {
    const items = Array.isArray(req.body?.items) ? req.body.items : [];

    if (!items.length) {
      const existingCart = await Cart.findOne({ user: req.user._id });
      return res.status(200).json(await buildCartPayload(existingCart));
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    const productIds = [...new Set(items.map((item) => item.productId).filter(Boolean).map(String))];
    const validProducts = await Product.find({
      _id: { $in: productIds },
      isActive: true,
      status: "published",
    }).select("_id").lean();
    const validIds = new Set(validProducts.map((product) => String(product._id)));

    items.forEach((item) => {
      if (!validIds.has(String(item.productId))) return;

      const qty = Math.max(Number(item.quantity || item.qty || 1), 1);
      const size = item.size || "";
      const color = item.color || "default";
      const existingItem = cart.items.find(
        (cartItem) =>
          cartItem.product.toString() === String(item.productId) &&
          cartItem.size === size &&
          cartItem.color === color
      );

      if (existingItem) {
        existingItem.qty += qty;
      } else {
        cart.items.push({
          product: item.productId,
          qty,
          size,
          color,
        });
      }
    });

    await cart.save();
    await User.updateOne({ _id: req.user._id }, { $set: { lastActivity: new Date() } });

    res.status(200).json(await buildCartPayload(cart));
  } catch (error) {
    res.status(500).json({ message: "Cart merge failed" });
  }
};

/* ================= APPLY COUPON ================= */
exports.applyCoupon = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Coupon code required",
      });
    }

    const cart = await Cart.findOne({ user: req.user._id })
      .populate("items.product", "name brand category subCategory mrp minPrice thumbnail slug variants");

    if (!cart || !cart.items.length) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty",
      });
    }

    const offer = await Offer.findOne({ code: code.toUpperCase().trim() });

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: "Invalid coupon",
      });
    }

    if (!offer.isValidOffer()) {
      return res.status(400).json({
        success: false,
        message: "Offer expired or inactive",
      });
    }

    const formattedItems = cart.items
      .filter((item) => item.product)
      .map((item) => {
        const pricing = getCartItemPricing(item.product, item.size, item.qty, item.size, item.color);

        return {
          id: item._id,
          productId: pricing.productId,
          slug: pricing.slug,
          name: pricing.name,
          brand: pricing.brand,
          category: pricing.category,
          subCategory: pricing.subCategory,
          price: pricing.price,
          mrp: pricing.mrp,
          discount: pricing.discount,
          image: pricing.image,
          quantity: item.qty,
          size: item.size,
          color: item.color,
          seller: pricing.seller,
          deliveryDate: pricing.deliveryDate,
          returnText: pricing.returnText,
          availableSizes: pricing.availableSizes,
          lineTotal: pricing.lineTotal,
        };
      });

    const summary = buildCartSummary(formattedItems, {
      code: offer.code,
      title: offer.title,
      discountType: offer.discountType,
      discountValue: offer.discountValue,
      maxDiscount: offer.maxDiscount,
      minOrderValue: offer.minOrderValue,
    });

    if (summary.subTotal < offer.minOrderValue) {
      return res.status(400).json({
        success: false,
        message: `Minimum order Rs. ${offer.minOrderValue} required`,
      });
    }

    if (!offerMatchesCartCriteria(offer, formattedItems)) {
      return res.status(400).json({
        success: false,
        message: "You are not eligible for this coupon",
      });
    }

    cart.coupon = {
      code: offer.code,
      title: offer.title,
      discountType: offer.discountType,
      discountValue: offer.discountValue,
      maxDiscount: offer.maxDiscount,
      minOrderValue: offer.minOrderValue,
    };

    await cart.save();

    const payload = await buildCartPayload(cart);
    return res.status(200).json({
      ...payload,
      message: "Coupon applied successfully",
      appliedCoupon: payload.summary.appliedCoupon,
    });
  } catch (error) {
    console.error("APPLY COUPON ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Coupon apply failed",
    });
  }
};

/* ================= REMOVE COUPON ================= */
exports.removeCoupon = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id })
      .populate("items.product", "name brand category subCategory mrp minPrice thumbnail slug variants");

    if (!cart) {
      return res.status(200).json({
        success: true,
        message: "Coupon removed",
        summary: {
          total: 0,
          subTotal: 0,
          discount: 0,
          productDiscount: 0,
          couponDiscount: 0,
          shipping: 0,
          platformFee: PLATFORM_FEE,
          youPay: PLATFORM_FEE,
          appliedCoupon: null,
        },
      });
    }

    clearCartCoupon(cart);
    await cart.save();

    const formattedItems = cart.items
      .filter((item) => item.product)
      .map((item) => {
        const pricing = getCartItemPricing(item.product, item.size, item.qty, item.size, item.color);

        return {
          id: item._id,
          productId: pricing.productId,
          slug: pricing.slug,
          name: pricing.name,
          brand: pricing.brand,
          category: pricing.category,
          subCategory: pricing.subCategory,
          price: pricing.price,
          mrp: pricing.mrp,
          discount: pricing.discount,
          image: pricing.image,
          quantity: item.qty,
          size: item.size,
          color: item.color,
          seller: pricing.seller,
          deliveryDate: pricing.deliveryDate,
          returnText: pricing.returnText,
          availableSizes: pricing.availableSizes,
          lineTotal: pricing.lineTotal,
        };
      });

    return res.status(200).json({
      success: true,
      message: "Coupon removed",
      items: formattedItems,
      summary: buildCartSummary(formattedItems, null),
    });
  } catch (error) {
    console.error("REMOVE COUPON ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Coupon remove failed",
    });
  }
};
