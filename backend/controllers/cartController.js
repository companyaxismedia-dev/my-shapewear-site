const Cart = require("../models/Cart");
const Product = require("../models/Product");

/* ================= GET CART ================= */
exports.getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id })
      .populate("items.product");

    if (!cart) {
      return res.status(200).json({ success: true, items: [] });
    }

    res.status(200).json({
      success: true,
      items: cart.items,
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
