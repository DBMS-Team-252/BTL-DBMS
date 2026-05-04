const { Router } = require("express");
const authRoute = require("./auth.route");
const productRoute = require("./product.route");

const router = Router();

// Mount các route module
router.use("/auth", authRoute);
router.use("/products", productRoute);

module.exports = router;

