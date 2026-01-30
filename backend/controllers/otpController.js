const nodemailer = require("nodemailer");

// OTP Store
let otpStore = {}; 

const sendOTP = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ success: false, message: "Email is required" });

        const userEmail = email.toLowerCase();
        
        // Purana OTP saaf karein taaki confusion na ho
        delete otpStore[userEmail];

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Store naya OTP with 5 min expiry
        otpStore[userEmail] = {
            otp: otp,
            expiresAt: Date.now() + 5 * 60 * 1000 
        };

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: { 
                user: "bootybloom8@gmail.com", 
                pass: "yfwj tfhl ezfk cixz" 
            }
        });

        await transporter.sendMail({
            from: '"Booty Bloom" <bootybloom8@gmail.com>',
            to: email,
            subject: "Your Verification Code",
            html: `<div style="font-family:Arial; text-align:center; padding:20px; border:1px solid #eee;">
                    <h2 style="color:#ed4e7e;">BOOTY BLOOM</h2>
                    <p>Use the code below to verify your account:</p>
                    <h1 style="letter-spacing:10px; font-size:40px;">${otp}</h1>
                   </div>`
        });

        console.log(`✅ Final OTP for ${userEmail}: ${otp}`);
        res.status(200).json({ success: true, message: "OTP Sent" });
    } catch (error) {
        console.error("Mail Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

const verifyOTP = async (req, res) => {
    const { email, otp } = req.body;
    const userEmail = email?.toLowerCase();
    const record = otpStore[userEmail];

    if (!record) return res.status(400).json({ success: false, message: "Request a new OTP" });

    if (Date.now() > record.expiresAt) {
        delete otpStore[userEmail];
        return res.status(400).json({ success: false, message: "OTP Expired" });
    }

    // Strict String Comparison
    if (String(record.otp) === String(otp)) {
        delete otpStore[userEmail]; // Success ke baad delete
        res.status(200).json({ success: true });
    } else {
        res.status(400).json({ success: false, message: "Galat OTP enter kiya hai!" });
    }
};

module.exports = { sendOTP, verifyOTP };