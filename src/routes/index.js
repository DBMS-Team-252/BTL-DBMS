const { Router } = require("express");
const authRoute = require("./auth.route");
const productRoute = require("./product.route");
const userRoute = require("./user.route");
const inventoryRoute = require("./inventory.route");
const statRoute = require("./stat.route");

const router = Router();

// Mount các route module
router.use("/auth", authRoute);
router.use("/products", productRoute);
router.use("/users", userRoute);
router.use("/inventory", inventoryRoute);
router.use("/stats", statRoute);

module.exports = router;

