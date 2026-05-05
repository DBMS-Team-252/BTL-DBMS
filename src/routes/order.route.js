const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');

// Checkout (tạo order từ cart)
router.post('/checkout', orderController.checkout);

// (Optional) lấy chi tiết order
router.get('/detail/:id', orderController.getOrderDetail);

module.exports = router;