const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart.controller');

// Lấy chi tiết giỏ hàng của user
router.get('/detail', cartController.getCart);

// Thêm sản phẩm vào giỏ
router.post('/add-item', cartController.addToCart);

module.exports = router;