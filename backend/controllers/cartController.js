const Cart = require("../models/Cart");
const Product = require("../models/Product");

/* ============================
   GET USER CART
   GET /api/cart
============================ */
exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id })
      .populate("items.product");

    if (!cart) {
      return res.status(200).json({
        success: true,
        items: [],
        total: 0,
      });
    }

    // 🔥 Total calculate runtime pe
    let total = 0;
    cart.items.forEach((item) => {
      total += item.product.price * item.qty;
    });

    res.status(200).json({
      success: true,
      items: cart.items,
      total,
    });
  } catch (error) {
    res.status(500).json({ message: "Cart fetch failed" });
  }
};

/* ============================
   ADD TO CART
   POST /api/cart
============================ */
exports.addItemToCart = async (req, res) => {
  try {
    const { productId, qty = 1, size, color } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = new Cart({
        user: req.user._id,
        items: [],
      });
    }

    const itemIndex = cart.items.findIndex(
      (item) =>
        item.product.toString() === productId &&
        item.size === size &&
        item.color === color
    );

    if (itemIndex > -1) {
      cart.items[itemIndex].qty += qty;
    } else {
      cart.items.push({
        product: productId,
        qty,
        size,
        color,
      });
    }

    await cart.save();

    res.status(200).json({
      success: true,
      message: "Product added to cart",
    });
  } catch (error) {
    res.status(500).json({ message: "Add to cart failed" });
  }
};

/* ============================
   REMOVE ITEM FROM CART
   DELETE /api/cart/:productId
============================ */
exports.deleteItemFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );

    await cart.save();

    res.status(200).json({
      success: true,
      message: "Item removed from cart",
    });
  } catch (error) {
    res.status(500).json({ message: "Remove failed" });
  }
};
