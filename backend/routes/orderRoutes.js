const express = require('express');
const router = express.Router();
const Order = require("../models/Order");
const nodemailer = require('nodemailer');
const { otpStore } = require("../controllers/otpController"); 

// --- Email Transporter Configuration ---
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: "gloviaglamour9@gmail.com", // Naya Email ID
            pass: "uvqz owgw yvep xapy"        // Naya App Password
    }
});

/**
 * 1. Verify OTP and Save Order
 * Path: POST /api/orders/verify-and-save
 */
router.post('/verify-and-save', async (req, res) => {
    const { email, otp, customerData, items, amount, paymentType, paymentId } = req.body;

    // A. Validation logic to prevent crashes
    if (!email || !otp || !items || !amount || !customerData?.phone) {
        return res.status(400).json({ 
            success: false, 
            message: "Missing Required Fields (Email, OTP, Phone or Items)!" 
        });
    }

    try {
        const userEmail = email.toLowerCase();
        
        // B. OTP Verification - Match string types to prevent "Incorrect OTP" alert
        const storedOtp = otpStore[userEmail];
        if (!storedOtp || String(storedOtp) !== String(otp)) {
            return res.status(400).json({ 
                success: false, 
                message: "Galat OTP ya OTP expire ho gaya hai!" 
            });
        }

        // C. Prepare Order Data based on your Schema
        const newOrder = new Order({
            userInfo: {
                name: customerData.name || "Verified Customer",
                phone: customerData.phone,
                address: customerData.address || "N/A",
                city: customerData.city || "N/A",
                email: userEmail
            },
            products: items.map((item, index) => ({
                // Fixing duplicate key issues by ensuring index/id handling
                name: item.name,
                price: Number(item.offerPrice || item.price),
                size: item.size || "Standard",
                quantity: Number(item.qty || item.quantity || 1)
            })),
            totalAmount: Number(amount),
            paymentType: paymentType || "Online", 
            paymentId: paymentId || `ORDER_${Date.now()}`,
            status: "Order Placed"
        });

        // D. Save to Database
        const savedOrder = await newOrder.save();

        // E. Cleanup OTP after success
        delete otpStore[userEmail];

        // F. Admin Notification
        const orderIDShort = savedOrder._id.toString().slice(-6).toUpperCase();
        const whatsappLink = `https://wa.me/91${customerData.phone}?text=Hello, order %23${orderIDShort} received!`;

        const mailOptions = {
            from: '"Glovia Glamour Admin" <gloviaglamour9@gmail.com>',
            to: 'gloviaglamour9@gmail.com',
            subject: `🚨 NEW ORDER: ₹${amount} from ${customerData.phone}`,
            html: `
                <div style="font-family: sans-serif; border: 2px solid #ed4e7e; padding: 20px; border-radius: 12px; max-width: 600px; color: #333;">
                    <h2 style="color: #ed4e7e; text-align: center;">New Order Alert!</h2>
                    <hr style="border: 0; border-top: 1px solid #eee;">
                    <p><strong>Order ID:</strong> #${orderIDShort}</p>
                    <p><strong>Phone:</strong> ${customerData.phone}</p>
                    <p><strong>Total Amount:</strong> ₹${amount}</p>
                    <div style="text-align: center; margin-top: 25px;">
                        <a href="${whatsappLink}" style="background: #25D366; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                            Contact on WhatsApp
                        </a>
                    </div>
                </div>`
        };

        transporter.sendMail(mailOptions).catch(err => console.error("Email Error:", err));

        res.status(201).json({ 
            success: true, 
            message: "Order successfully placed!",
            orderId: savedOrder._id 
        });

    } catch (error) {
        console.error("❌ SERVER ERROR:", error);
        res.status(500).json({ 
            success: false, 
            message: "Server Error: " + error.message 
        });
    }
});

/**
 * 2. Track Order (Backend stable check)
 */
router.get('/track', async (req, res) => {
    const { phone } = req.query;
    if (!phone) return res.status(400).json({ success: false, message: "Phone number zaruri hai" });

    try {
        const orders = await Order.find({ "userInfo.phone": phone }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, orders });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error" });
    }
});

module.exports = router;