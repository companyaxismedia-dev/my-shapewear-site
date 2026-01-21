const Order = require("../models/Order");
const nodemailer = require('nodemailer');

// --- EMAIL CONFIGURATION ---
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'bootybloom8@gmail.com',
    pass: 'yfwj tfhl ezfk cixz' //
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

// 2. Naya order + Email Alert (Full Working with Product Table & WhatsApp Link)
exports.createOrder = async (req, res) => {
  try {
    const { customerData, items, amount, paymentId, paymentType } = req.body;

    const fullAddress = `${customerData?.houseNo || ''} ${customerData?.area || ''}, ${customerData?.city || ''}, ${customerData?.state || ''} - ${customerData?.pincode || ''}`;

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
      status: "Order Placed",
      trackingId: ""
    };

    const newOrder = new Order(orderToSave);
    const savedOrder = await newOrder.save();

    // WhatsApp Message URL taiyar karna
    const whatsappLink = `https://wa.me/91${orderToSave.userInfo.phone}?text=Hello%20${orderToSave.userInfo.name},%20your%20order%20%23${savedOrder._id.toString().slice(-6).toUpperCase()}%20from%20Booty%20Bloom%20is%20received!`;

    // Email Layout (Mix of simple blue style and product table)
    const mailOptions = {
      from: 'bootybloom8@gmail.com',
      to: 'bootybloom8@gmail.com',
      subject: `🚨 NEW ORDER: ${orderToSave.userInfo.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; border: 2px solid #001f3f; padding: 25px; border-radius: 12px; max-width: 600px; margin: auto;">
          <h2 style="color: #001f3f; text-align: center; font-size: 24px;">New Order Alert!</h2>
          <hr style="border: 0.5px solid #eee; margin: 20px 0;">
          
          <p><strong>Order ID:</strong> #${savedOrder._id.toString().slice(-6).toUpperCase()}</p>
          <p><strong>Customer Name:</strong> ${orderToSave.userInfo.name}</p>
          <p><strong>Phone:</strong> ${orderToSave.userInfo.phone}</p>
          <p><strong>Address:</strong> ${orderToSave.userInfo.address}</p>
          
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <thead>
              <tr style="background-color: #001f3f; color: white;">
                <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Product</th>
                <th style="padding: 10px; text-align: right; border: 1px solid #ddd;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${orderToSave.products.map(item => `
                <tr>
                  <td style="padding: 10px; border: 1px solid #ddd;">${item.name}</td>
                  <td style="padding: 10px; text-align: right; border: 1px solid #ddd;">₹${item.price}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <p style="font-size: 18px; color: #001f3f; margin-top: 20px;"><strong>Total Paid:</strong> ₹${orderToSave.totalAmount}</p>
          <p style="font-size: 14px;"><strong>Payment Mode:</strong> ✅ ${orderToSave.paymentType}</p>
          <p style="font-size: 14px;"><strong>Razorpay ID:</strong> ${orderToSave.paymentId}</p>

          <div style="text-align: center; margin-top: 30px; display: flex; justify-content: center; gap: 10px;">
              <a href="${whatsappLink}" 
                 style="background-color: #25D366; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-right: 10px;">
                 WHATSAPP CUSTOMER
              </a>
              <a href="https://bootybloom.online/track?phone=${orderToSave.userInfo.phone}" 
                 style="background-color: #001f3f; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                 TRACK ORDER
              </a>
          </div>
        </div>`
    };

    transporter.sendMail(mailOptions, (err) => {
      if (err) console.log("Email Error:", err);
      else console.log("Success: Professional Email sent!");
    });

    res.status(201).json({ success: true, order: savedOrder });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Update Tracking ID & Status
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

// 4. Track by Phone (Frontend Fix)
exports.trackOrderByPhone = async (req, res) => {
  try {
    const { phone } = req.query;

    if (!phone) {
      return res.status(400).json({ success: false, message: "Phone number zaruri hai" });
    }

    const order = await Order.findOne({ "userInfo.phone": phone }).sort({ createdAt: -1 });

    if (!order) {
      return res.status(404).json({ success: false, message: "Order nahi mila! Kripya registered number check karein." });
    }

    res.json({ success: true, order: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};