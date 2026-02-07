const Order = require("../models/Order");
const nodemailer = require('nodemailer');
// otpStore ko import karna zaroori hai sync ke liye
const { otpStore } = require("./otpController"); 

// Email Transporter Setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    // Render Dashboard ki keys use karein
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * 1. CREATE & VERIFY ORDER
 */
exports.createOrder = async (req, res) => {
    try {
        const { email, otp, customerData, items, amount, paymentId, paymentType } = req.body;
        
        if (!email || !otp) {
            return res.status(400).json({ success: false, message: "Email aur OTP zaroori hain!" });
        }

        const userEmail = email.toLowerCase().trim();

        // --- 1. OTP Verification Logic (Strict Email Sync) ---
        if (otp !== "DIRECT") {
            const record = otpStore[userEmail];

            if (!record) {
                return res.status(400).json({ success: false, message: "OTP Record nahi mila. Phir se OTP mangwayein." });
            }

            // String match check
            if (String(record.otp) !== String(otp)) {
                return res.status(400).json({ success: false, message: "Galat OTP! Kripya sahi code dalein." });
            }

            // Expiry Check
            if (Date.now() > record.expiresAt) {
                delete otpStore[userEmail];
                return res.status(400).json({ success: false, message: "OTP expire ho gaya hai." });
            }
        }

        // --- 2. Data Formatting (As per Order Model) ---
        const orderToSave = {
            userInfo: {
                name: customerData?.name || "Customer",
                phone: customerData?.phone || "",
                email: userEmail,
                address: customerData?.address || "N/A",
                city: customerData?.city || "N/A",
                pincode: customerData?.pincode || ""
            },
            products: items.map(item => ({
                name: item.name,
                price: item.offerPrice || item.price,
                quantity: item.qty || 1, 
                size: item.size || "Standard"
            })),
            totalAmount: amount,
            paymentId: paymentId || "N/A",
            paymentType: paymentType || "COD",
            status: "Order Placed"
        };

        // --- 3. Save to MongoDB ---
        const savedOrder = await new Order(orderToSave).save();
        
        // Memory cleanup: OTP delete karein
        delete otpStore[userEmail];

        // --- 4. Admin Email Alert ---
        const adminMailOptions = {
            from: '"Glovia Glamour System" <gloviaglamour9@gmail.com>',
            to: 'gloviaglamour9@gmail.com',
            subject: `🚨 NEW ORDER: ₹${amount} - ${orderToSave.userInfo.name}`,
            html: `
                <div style="font-family:sans-serif; border:2px solid #ed4e7e; padding:20px; border-radius:15px;">
                    <h2 style="color:#ed4e7e;">New Order Received!</h2>
                    <p><strong>Customer:</strong> ${orderToSave.userInfo.name}</p>
                    <p><strong>Phone:</strong> ${orderToSave.userInfo.phone}</p>
                    <p><strong>Amount:</strong> ₹${amount}</p>
                    <p><strong>Payment Mode:</strong> ${orderToSave.paymentType}</p>
                    <hr />
                    <p><strong>Order ID:</strong> ${savedOrder._id}</p>
                    <br />
                    <a href="https://wa.me/91${orderToSave.userInfo.phone}" 
                       style="background:#25D366; color:white; padding:10px 20px; text-decoration:none; border-radius:5px; font-weight:bold;">
                       Contact Customer via WhatsApp
                    </a>
                </div>`
        };

        transporter.sendMail(adminMailOptions).catch(err => console.log("Admin Mail Error:", err));

        res.status(201).json({ 
            success: true, 
            message: "Order placed successfully", 
            orderId: savedOrder._id 
        });

    } catch (error) {
        console.error("Order Creation Error:", error);
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
};

/**
 * 2. GET ALL ORDERS
 */
exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, orders });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * 3. TRACK ORDER
 */
exports.trackOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ success: false, message: "Order not found" });
        res.status(200).json({ success: true, order });
    } catch (error) {
        res.status(500).json({ success: false, message: "Invalid Order ID" });
    }
};