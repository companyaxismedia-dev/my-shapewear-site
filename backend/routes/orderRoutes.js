const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// 1. Sabse pehle functions check karein ki wo controller mein hain ya nahi
// Agar controller mein function ka naam alag hai to error aayega

// Create Order (URL: POST /api/orders)
router.post('/', orderController.createOrder); 

// Get All Orders (URL: GET /api/orders)
router.get('/', orderController.getOrders);

// Track Order by Phone (URL: GET /api/orders/track?phone=...)
// Note: Isse ID wale route se upar rakhein
router.get('/track', orderController.trackOrderByPhone);

// Update Tracking ID (URL: PUT /api/orders/:id)
router.put('/:id', orderController.updateOrderTracking);

module.exports = router;