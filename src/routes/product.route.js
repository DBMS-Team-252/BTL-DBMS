const express = require("express");
const router = express.Router();
const productController = require("../controllers/product.controller");
const validate = require("../middlewares/validate.mdw");
const { getProductsSchema } = require("../validations/product.schema");

// API lấy danh sách sản phẩm (Public API cho khách hàng)
// Dùng middleware validate để kiểm tra định dạng các tham số query
router.get("/", validate(getProductsSchema, "query"), productController.getProducts);
router.get("/detail/:id", productController.getProductDetail);
module.exports = router;
