const Order = require("../models/Order");
const nodemailer = require('nodemailer');

// --- EMAIL CONFIGURATION ---
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'bootybloom8@gmail.com',
    pass: 'yfwj tfhl ezfk cixz' 
  }
});

// 1. Sabhi orders fetch karna (Admin Panel ke liye)
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Naya order + Email Alert
exports.createOrder = async (req, res) => {
  try {
    const { customerData, items, amount, paymentId, paymentType } = req.body;

    const fullAddress = `${customerData?.houseNo || ''}, ${customerData?.area || ''}, ${customerData?.city || ''} - ${customerData?.pincode || ''}`;

    const orderToSave = {
      userInfo: {
        name: customerData?.name || "N/A",
        phone: customerData?.phone || "N/A",
        address: fullAddress.trim() === "," ? "N/A" : fullAddress
      },
      products: items || [],
      totalAmount: amount || 0,
      paymentId: paymentId || "N/A",
      paymentType: paymentType || "Online Paid", 
      status: "Order Placed"
    };

    const newOrder = new Order(orderToSave);
    const savedOrder = await newOrder.save();

    // Nodemailer Email Logic
    const mailOptions = {
      from: 'bootybloom8@gmail.com',
      to: 'bootybloom8@gmail.com',
      subject: `🚨 NEW ORDER: ${orderToSave.userInfo.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; border: 2px solid #041f41; padding: 20px; border-radius: 10px; max-width: 600px;">
          <h2 style="color: #041f41; text-align: center;">New Order Alert!</h2>
          <p><strong>Order ID:</strong> #${savedOrder._id.toString().slice(-6).toUpperCase()}</p>
          <p><strong>Customer:</strong> ${orderToSave.userInfo.name} (${orderToSave.userInfo.phone})</p>
          <p><strong>Address:</strong> ${orderToSave.userInfo.address}</p>
          <hr/>
          <p><strong>Total Paid:</strong> ₹${orderToSave.totalAmount}</p>
        </div>`
    };

    transporter.sendMail(mailOptions, (err) => {
      if (err) console.log("Email Error:", err);
      else console.log("Success: Email sent!");
    });

    res.status(201).json({ success: true, order: savedOrder });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Update Tracking ID & Status (Admin Jab update karega)
exports.updateOrderTracking = async (req, res) => {
  try {
    const { id } = req.params;
    const { trackingId, status } = req.body;

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { trackingId, status },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ success: false, message: "Order nahi mila" });
    }

    res.json({ success: true, order: updatedOrder });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. Track by Phone (Frontend Loading Fix yahan se hoga)
exports.trackOrderByPhone = async (req, res) => {
  try {
    const { phone } = req.query; // URL se phone number leta hai

    if (!phone) {
      return res.status(400).json({ success: false, message: "Phone number zaruri hai" });
    }

    // Phone number se latest order dhoondhna
    const order = await Order.findOne({ "userInfo.phone": phone }).sort({ createdAt: -1 });

    if (!order) {
      return res.status(404).json({ success: false, message: "Order nahi mila" });
    }

    // JSON response jo frontend ko loading stop karne bolega
    res.json({
      success: true,
      order: order
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};