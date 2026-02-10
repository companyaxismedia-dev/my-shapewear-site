const Cart = require("../models/Cart");
const Product = require("../models/Product");

// GET CART
exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user._id });

    if (!cart) {
      return res.status(200).json({ items: [], bill: 0 });
    }

    res.status(200).json(cart);
  } catch (err) {
    res.status(500).json({ message: "Cart fetch error" });
  }
};

// ADD TO CART
exports.addItemToCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId, qty = 1, size, color } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [], bill: 0 });
    }

    const itemIndex = cart.items.findIndex(
      (item) =>
        item.productId.toString() === productId &&
        item.size === size &&
        item.color === color
    );

    if (itemIndex > -1) {
      cart.items[itemIndex].qty += qty;
    } else {
      cart.items.push({
        productId,
        name: product.name,
        image: product.image,
        price: product.price,
        qty,
        size,
        color,
      });
    }

    // 🔥 SAFE BILL CALCULATION
    cart.bill = cart.items.reduce(
      (total, item) => total + item.price * item.qty,
      0
    );

    await cart.save();
    res.status(200).json(cart);
  } catch (err) {
    res.status(500).json({ message: "Add to cart failed" });
  }
};

// REMOVE ITEM
exports.deleteItemFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = cart.items.filter(
      (item) => item.productId.toString() !== productId
    );

    cart.bill = cart.items.reduce(
      (total, item) => total + item.price * item.qty,
      0
    );

    await cart.save();
    res.status(200).json(cart);
  } catch (err) {
    res.status(500).json({ message: "Remove failed" });
  }
};
