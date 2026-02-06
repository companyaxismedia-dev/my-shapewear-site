const Order = require("../models/Order");
const nodemailer = require('nodemailer');
const { otpStore } = require("./otpController"); 

// Email Transporter Setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { 
        user: "gloviaglamour9@gmail.com", // Naya Email ID
            pass: "uvqz owgw yvep xapy"        // Naya App Password
    }
});

/**
 * 1. CREATE & VERIFY ORDER
 * Yeh function OTP verify karta hai aur order ko DB mein save karta hai.
 */
exports.createOrder = async (req, res) => {
    try {
        const { email, otp, customerData, items, amount, paymentId, paymentType } = req.body;
        const userEmail = email.toLowerCase();

        // --- 1. OTP Verification Logic ---
        // 'DIRECT' bypass un orders ke liye jo bina OTP ke check out ho rahe hain (optional)
        if (otp !== "DIRECT") {
            if (!otpStore[userEmail] || otpStore[userEmail] != otp) {
                return res.status(400).json({ success: false, message: "Invalid or Expired OTP!" });
            }
        }

        // --- 2. Data Formatting (As per Order Model) ---
        const orderToSave = {
            userInfo: {
                name: customerData?.name || "Customer",
                phone: customerData?.phone,
                email: userEmail,
                address: customerData?.address || "N/A",
                city: customerData?.city || "N/A",
                pincode: customerData?.pincode || ""
            },
            products: items.map(item => ({
                name: item.name,
                price: item.offerPrice || item.price,
                quantity: item.qty, // Model mein 'quantity' field hai
                size: item.size || "Standard"
            })),
            totalAmount: amount,
            paymentId: paymentId || "N/A",
            paymentType: paymentType || "COD",
            status: "Order Placed"
        };

        // --- 3. Save to MongoDB ---
        const savedOrder = await new Order(orderToSave).save();
        
        // Memory cleanup: OTP kaam khatam hone ke baad delete karein
        if (otpStore[userEmail]) delete otpStore[userEmail];

        // --- 4. Admin Email Alert (Non-blocking) ---
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
                    <p><strong>Address:</strong> ${orderToSave.userInfo.address}, ${orderToSave.userInfo.city}</p>
                    <br />
                    <a href="https://wa.me/91${orderToSave.userInfo.phone}" 
                       style="background:#25D366; color:white; padding:10px 20px; text-decoration:none; border-radius:5px; font-weight:bold;">
                       Contact Customer via WhatsApp
                    </a>
                </div>`
        };

        // Email bhejna (Failure order ko nahi rokega)
        transporter.sendMail(adminMailOptions).catch(err => console.log("Admin Mail Error:", err));

        // --- 5. Final Response ---
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
 * 2. GET ALL ORDERS (For Admin Panel)
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