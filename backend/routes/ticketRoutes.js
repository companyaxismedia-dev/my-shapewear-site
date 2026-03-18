const express = require("express")
const router = express.Router()

/* ================= CONTROLLER ================= */

const { createTicket } = require("../controllers/ticketController")

/* ================= MIDDLEWARE ================= */

const { protect } = require("../middleware/authMiddleware")

/* ================= RATE LIMIT ================= */

const rateLimit = require("express-rate-limit")

const ticketLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10,
    message: {
        success: false,
        message: "Too many support requests. Please try again later."
    }
})

/* =====================================================
   CREATE SUPPORT TICKET
   POST /api/support/ticket
===================================================== */

const multer = require("multer")

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/")
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname)
    }
})

const upload = multer({ storage })

router.post(
    "/ticket",
    protect,
    ticketLimiter,
    upload.single("image"),
    createTicket
)

module.exports = router