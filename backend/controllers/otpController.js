const nodemailer = require("nodemailer");

// OTP ko temporary store karne ke liye object (Memory mein save rahega)
// Ise export karna zaroori hai taaki Register/Login/Order sab isse verify kar sakein
let otpStore = {}; 

// --- 1. OTP BHEJNE KA LOGIC (For Register, Login, and Order) ---
const sendOTP = async (req, res) => {
    try {
        const { email, phone } = req.body;

        if (!email && !phone) {
            return res.status(400).json({ success: false, message: "Email ya Phone zaroori hai!" });
        }

        const identifier = (email || phone).toLowerCase();
        
        // Purana OTP saaf karein
        delete otpStore[identifier];

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Store naya OTP
        otpStore[identifier] = {
            otp: otp,
            expiresAt: Date.now() + 5 * 60 * 1000 
        };

        // EMAIL BHEJNE KA LOGIC
        if (email) {
            const transporter = nodemailer.createTransport({
                service: "gmail",
                auth: { 
                    user: "gloviaglamour9@gmail.com", // Naya Email ID
                      pass: "uvqz owgw yvep xapy"        // Naya App Password
                }
            });

            await transporter.sendMail({
                from: '"Glovia Glamour" <gloviaglamour9@gmail.com>',
                to: email,
                subject: "Glovia Glamour - Verification Code",
                html: `
                    <div style="font-family:Arial; text-align:center; padding:20px; border:1px solid #f0f0f0;">
                        <h2 style="color:#ed4e7e;">Glovia Glamour / GLOVIA</h2>
                        <p>Aapka verification code niche diya gaya hai:</p>
                        <h1 style="letter-spacing:10px; font-size:40px; color:#333;">${otp}</h1>
                        <p>Ye code Login, Signup ya Order verification ke liye valid hai.</p>
                        <p>Samay seema: 5 minute.</p>
                    </div>`
            });
            console.log(`📧 Email OTP sent to ${email}`);
        }

        // PHONE LOGIC (Terminal mein dikhega)
        console.log(`\n==========================================`);
        console.log(`🔑 OTP FOR: ${identifier}`);
        console.log(`🔢 CODE: ${otp}`);
        console.log(`==========================================\n`);

        res.status(200).json({ 
            success: true, 
            message: email ? "OTP Email par bhej diya gaya hai" : "OTP Terminal mein check karein" 
        });

    } catch (error) {
        console.error("OTP Send Error:", error);
        res.status(500).json({ success: false, message: "Server mein kuch galti hai" });
    }
};

// --- 2. OTP VERIFY KARNE KA LOGIC ---
const verifyOTP = async (req, res) => {
    const { email, phone, otp } = req.body;
    const identifier = (email || phone)?.toLowerCase();
    const record = otpStore[identifier];

    if (!record) {
        return res.status(400).json({ success: false, message: "Kripya naya OTP mangwayein" });
    }

    if (Date.now() > record.expiresAt) {
        delete otpStore[identifier];
        return res.status(400).json({ success: false, message: "OTP Expired!" });
    }

    if (String(record.otp) === String(otp)) {
        // Verification success hone par hum data delete nahi kar rahe 
        // kyunki registerUser ko bhi ise verify karna pad sakta hai
        res.status(200).json({ success: true, message: "Verification Safal!" });
    } else {
        res.status(400).json({ success: false, message: "Galat OTP enter kiya hai!" });
    }
};

// module.exports mein otpStore add kiya hai taaki authController ise use kar sake
module.exports = { sendOTP, verifyOTP, otpStore };