const { Router } = require("express");
const authRoute = require("./auth.route");
const productRoute = require("./product.route");
const userRoute = require("./user.route");
const inventoryRoute = require("./inventory.route");
const statRoute = require("./stat.route");
const categoryRoute = require("./category.route");
const orderRoute = require("./order.route");
const reviewRoute = require("./review.route");

const router = Router();

// Mount các route module
router.use("/auth", authRoute);
router.use("/products", productRoute);
router.use("/categories", categoryRoute);
router.use("/users", userRoute);
router.use("/inventory", inventoryRoute);
router.use("/stats", statRoute);
router.use("/orders", orderRoute);
router.use("/reviews", reviewRoute);

module.exports = router;