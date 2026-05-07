const { Router } = require("express");
const reviewController = require("../controllers/review.controller");
const authMiddleware = require("../middlewares/auth.mdw");
const roleMiddleware = require("../middlewares/role.mdw");

const router = Router();

// API User: Đánh giá sản phẩm và lấy danh sách đánh giá sản phẩm
router.post("/", authMiddleware, reviewController.createReview);
router.get("/product/:productId", reviewController.getReviewsByProduct);

// API Admin: Quản lý và duyệt (xóa) đánh giá
router.use(authMiddleware, roleMiddleware("ADMIN"));

router.get("/admin", reviewController.getAllReviews);
router.delete("/admin/:id", reviewController.deleteReview);

module.exports = router;   