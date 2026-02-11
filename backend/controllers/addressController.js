const User = require("../models/User");

/* ===============================
   ADD ADDRESS
=============================== */
exports.addAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    const {
      fullName,
      phone,
      pincode,
      city,
      state,
      addressLine,
      isDefault,
    } = req.body;

    if (!fullName || !phone || !pincode || !city || !state || !addressLine) {
      return res.status(400).json({ message: "All address fields required" });
    }

    // Agar default hai → baaki sab false
    if (isDefault) {
      user.addresses.forEach((addr) => (addr.isDefault = false));
    }

    user.addresses.push({
      fullName,
      phone,
      pincode,
      city,
      state,
      addressLine,
      isDefault: isDefault || false,
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: "Address added",
      addresses: user.addresses,
    });
  } catch (error) {
    res.status(500).json({ message: "Add address failed" });
  }
};

/* ===============================
   GET ADDRESSES
=============================== */
exports.getAddresses = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({
      success: true,
      addresses: user.addresses,
    });
  } catch (error) {
    res.status(500).json({ message: "Fetch address failed" });
  }
};

/* ===============================
   DELETE ADDRESS
=============================== */
exports.deleteAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    user.addresses = user.addresses.filter(
      (addr) => addr._id.toString() !== req.params.id
    );

    await user.save();

    res.status(200).json({
      success: true,
      message: "Address removed",
    });
  } catch (error) {
    res.status(500).json({ message: "Delete address failed" });
  }
};

/* ===============================
   SET DEFAULT ADDRESS
=============================== */
exports.setDefaultAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    user.addresses.forEach((addr) => {
      addr.isDefault = addr._id.toString() === req.params.id;
    });

    await user.save();

    res.status(200).json({
      success: true,
      message: "Default address updated",
    });
  } catch (error) {
    res.status(500).json({ message: "Set default failed" });
  }
};
