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
      altPhone,
      pincode,
      city,
      state,
      addressLine,
      landmark,
      addressType,
      isDefault,
    } = req.body;

    const missingFields = [];
    if (!fullName) missingFields.push('fullName');
    if (!phone) missingFields.push('phone');
    if (!pincode) missingFields.push('pincode');
    if (!city) missingFields.push('city');
    if (!state) missingFields.push('state');
    if (!addressLine) missingFields.push('addressLine');
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`,
      });
    }

    // first address auto default
    let defaultAddress = isDefault;

if (user.addresses.length === 0) {
  defaultAddress = true;
}

    // if new default → old false
    if (isDefault) {
      user.addresses.forEach((a) => (a.isDefault = false));
    }

    user.addresses.push({
      fullName,
      phone,
      altPhone: altPhone || "",
      pincode,
      city,
      state,
      addressLine,
      landmark: landmark || "",
      addressType: addressType || "HOME",
      isDefault: defaultAddress || false,
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: "Address added",
      addresses: user.addresses,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Add address failed",
    });
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
  } catch {
    res.status(500).json({ success: false });
  }
};

/* ===============================
   UPDATE ADDRESS (AMAZON STYLE)
=============================== */
exports.updateAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    const address = user.addresses.id(req.params.id);

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    Object.assign(address, req.body);

    await user.save();

    res.status(200).json({
      success: true,
      message: "Address updated",
      addresses: user.addresses,
    });
  } catch {
    res.status(500).json({
      success: false,
      message: "Update failed",
    });
  }
};

/* ===============================
   DELETE ADDRESS
=============================== */
exports.deleteAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    user.addresses = user.addresses.filter(
      (a) => a._id.toString() !== req.params.id
    );

    // auto set first as default
    if (user.addresses.length > 0 &&
        !user.addresses.some((a) => a.isDefault)) {
      user.addresses[0].isDefault = true;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "Address deleted",
    });
  } catch {
    res.status(500).json({
      success: false,
      message: "Delete failed",
    });
  }
};

/* ===============================
   SET DEFAULT ADDRESS
=============================== */
exports.setDefaultAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    user.addresses.forEach((a) => {
      a.isDefault = a._id.toString() === req.params.id;
    });

    await user.save();

    res.status(200).json({
      success: true,
      message: "Default updated",
    });
  } catch {
    res.status(500).json({
      success: false,
      message: "Default update failed",
    });
  }
};
