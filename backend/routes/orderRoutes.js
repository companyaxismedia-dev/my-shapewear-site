const express = require('express');
const router = express.Router();
// 'next' wala import yahan se hata diya gaya hai

router.post('/orders', async (req, res) => {
  try {
    const { userInfo, products, totalAmount, paymentId, paymentType } = req.body;
    // Aapka MongoDB/Database logic yahan aayega
    console.log(`New ${paymentType} Order:`, userInfo.name);
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;