const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const authMiddleware = require("../middlewares/auth.mdw");
const roleMiddleware = require("../middlewares/role.mdw");

// Checkout (tạo order từ cart)
router.post('/checkout', orderController.checkout);

// User xem lịch sử đơn hàng của mình
router.get("/my-orders", authMiddleware, orderController.getMyOrders);

// (Optional) lấy chi tiết order
router.get('/detail/:id', orderController.getOrderDetail);

router.get("/admin", authMiddleware, roleMiddleware("ADMIN"), orderController.getAllOrders);
router.patch("/admin/:id/status", authMiddleware, roleMiddleware("ADMIN"), orderController.updateOrderStatus);

module.exports = router;    