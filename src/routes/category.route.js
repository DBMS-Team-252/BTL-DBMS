const { Router } = require("express");
const categoryController = require("../controllers/category.controller");
const authMiddleware = require("../middlewares/auth.mdw");
const roleMiddleware = require("../middlewares/role.mdw");

const router = Router();

// Public: Xem danh mục
router.get("/", categoryController.getCategories);

// Admin: CRUD danh mục
router.use(authMiddleware, roleMiddleware("ADMIN"));
router.post("/", categoryController.createCategory);
router.put("/:id", categoryController.updateCategory);
router.delete("/:id", categoryController.deleteCategory);

module.exports = router;