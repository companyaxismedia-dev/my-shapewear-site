const express = require("express")
const router = express.Router()

/* ================= CONTROLLERS ================= */

const {
 startChat,
 sendMessage,
 getMessages,
 closeChat
} = require("../controllers/chatController")

/* ================= MIDDLEWARE ================= */

const { protect } = require("../middleware/authMiddleware")

/* ================= RATE LIMIT ================= */

const rateLimit = require("express-rate-limit")

const chatLimiter = rateLimit({
 windowMs: 60 * 1000, // 1 minute
 max: 30,
 message:{
  success:false,
  message:"Too many chat requests. Please slow down."
 }
})

/* =====================================================
   START CHAT (USER)
   POST /api/chat/start/:orderId
===================================================== */

router.post(
 "/start/:orderId",
 protect,
 chatLimiter,
 startChat
)

/* =====================================================
   SEND MESSAGE
   POST /api/chat/message
===================================================== */

router.post(
 "/message",
 protect,
 chatLimiter,
 sendMessage
)

/* =====================================================
   GET CHAT MESSAGES (PAGINATION READY)
   GET /api/chat/messages/:chatId
===================================================== */

router.get(
 "/messages/:chatId",
 protect,
 getMessages
)

/* =====================================================
   CLOSE CHAT
   POST /api/chat/close/:chatId
===================================================== */

router.post(
 "/close/:chatId",
 protect,
 closeChat
)

module.exports = router