const express = require("express");
const router = express.Router();
const productController = require("../controllers/product.controller");
const validate = require("../middlewares/validate.mdw");
const authMiddleware = require("../middlewares/auth.mdw");
const roleMiddleware = require("../middlewares/role.mdw");
const { getProductsSchema } = require("../validations/product.schema");

// API lấy danh sách sản phẩm (Public API cho khách hàng)
// Dùng middleware validate để kiểm tra định dạng các tham số query
router.get("/", validate(getProductsSchema, "query"), productController.getProducts);
router.get("/detail/:id", productController.getProductDetail);

// Admin API
router.use(authMiddleware, roleMiddleware("ADMIN"));
router.post("/", productController.createProduct);
router.put("/:id", productController.updateProduct);
router.delete("/:id", productController.deleteProduct);

module.exports = router;
