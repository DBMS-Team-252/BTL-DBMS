const { Router } = require("express");
const inventoryController = require("../controllers/inventory.controller");
const authMiddleware = require("../middlewares/auth.mdw");
const roleMiddleware = require("../middlewares/role.mdw");

const router = Router();

// Tất cả các route inventory đều dành cho admin
router.use(authMiddleware, roleMiddleware("ADMIN"));

// GET /api/inventory/alerts — Cảnh báo tồn kho thấp
router.get("/alerts", inventoryController.getLowStockAlert);

// GET /api/inventory/transactions — Lịch sử biến động
router.get("/transactions", inventoryController.getTransactionHistory);

// GET /api/inventory/ — Danh sách tồn kho
router.get("/", inventoryController.getInventories);

// POST /api/inventory/transaction — Nhập/xuất/điểm kiểm kho
router.post("/transaction", inventoryController.createTransaction);

// PUT /api/inventory/bulk — Cập nhật tồn kho hàng loạt
router.put("/bulk", inventoryController.bulkUpdate);

// PUT /api/inventory/:productId — Chỉnh sửa tồn kho trực tiếp
router.put("/:productId", inventoryController.updateInventory);

module.exports = router;
