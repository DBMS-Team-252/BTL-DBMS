const { Router } = require("express");
const statController = require("../controllers/stat.controller");
const authMiddleware = require("../middlewares/auth.mdw");
const roleMiddleware = require("../middlewares/role.mdw");

const router = Router();

// Endpoint thống kê dành cho Admin
router.use(authMiddleware, roleMiddleware("ADMIN"));

router.get("/overview", statController.getOverview);
router.get("/analytics", statController.getAnalytics);

module.exports = router;
