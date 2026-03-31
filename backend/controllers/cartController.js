const Cart = require("../models/Cart");
const Product = require("../models/Product");
const User = require("../models/User");

const PLATFORM_FEE = 30;

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
    brand: product.brand || "Glovia",
    price,
    mrp,
    discount,
    image,
    seller: "Glovia Glamour",
    deliveryDate: "5-7 Business Days",
    returnText: "3 days return available",
    availableSizes,
    lineTotal: price * qty,
  };
}

/* ================= GET CART ================= */
exports.getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id })
      .populate("items.product", "name brand mrp minPrice thumbnail slug variants");

    if (!cart) {
      return res.status(200).json({
        success: true,
        items: [],
        summary: {
          total: 0,
          subTotal: 0,
          discount: 0,
          shipping: 0,
          platformFee: PLATFORM_FEE,
          youPay: PLATFORM_FEE,
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

    const total = formattedItems.reduce((sum, item) => sum + item.mrp * item.quantity, 0);
    const subTotal = formattedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const discount = Math.max(total - subTotal, 0);
    const shipping = 0;
    const platformFee = PLATFORM_FEE;
    const youPay = subTotal + shipping + platformFee;

    res.status(200).json({
      success: true,
      items: formattedItems,
      summary: {
        total,
        subTotal,
        discount,
        shipping,
        platformFee,
        youPay,
      },
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

    res.status(200).json({ success: true });

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

    const item = cart.items.id(itemId);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    item.qty = quantity;

    await cart.save();

    res.status(200).json({ success: true });

  } catch (error) {
    res.status(500).json({ message: "Update failed" });
  }
};

/* ================= UPDATE SIZE ================= */
exports.updateSize = async (req, res) => {
  try {
    console.log("PARAMS:", req.params);
    console.log("BODY:", req.body);
    console.log("USER:", req.user);

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

    res.status(200).json({ success: true });

  } catch (error) {
    res.status(500).json({ message: "Size update failed" });
  }
};

/* ================= REMOVE SINGLE ITEM ================= */
exports.deleteItemFromCart = async (req, res) => {
  try {
    const { itemId } = req.params;

    const cart = await Cart.findOne({ user: req.user._id });

    cart.items = cart.items.filter(
      (item) => item._id.toString() !== itemId
    );

    await cart.save();

    res.status(200).json({ success: true });

  } catch (error) {
    res.status(500).json({ message: "Remove failed" });
  }
};
