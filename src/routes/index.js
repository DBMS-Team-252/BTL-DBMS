const { Router } = require("express");
const authRoute = require("./auth.route");

const router = Router();

// Mount các route module
router.use("/auth", authRoute);

module.exports = router;
