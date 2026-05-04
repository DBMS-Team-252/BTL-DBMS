const { Router } = require("express");
const authController = require("../controllers/auth.controller");
const authMiddleware = require("../middlewares/auth.mdw");
const validate = require("../middlewares/validate.mdw");
const { registerSchema, loginSchema, refreshSchema } = require("../validations/auth.schema");

const router = Router();

// POST /api/auth/register  — public
router.post("/register", validate(registerSchema), authController.register);

// POST /api/auth/login     — public
router.post("/login", validate(loginSchema), authController.login);

// POST /api/auth/logout    — protected (cần access token hợp lệ)
router.post("/logout", authMiddleware, authController.logout);

// POST /api/auth/refresh   — public (dùng refresh token)
router.post("/refresh", validate(refreshSchema), authController.refresh);

module.exports = router;
