const { Router } = require("express");
const userController = require("../controllers/user.controller");
const authMiddleware = require("../middlewares/auth.mdw");
const router = Router();

const roleMiddleware = require("../middlewares/role.mdw");
// GET /api/users/  — admin only
router.get("/", authMiddleware, roleMiddleware("ADMIN"), userController.getUsers);

// PUT /api/users/:id — admin only (update name, phone)
router.put("/:id", authMiddleware, roleMiddleware("ADMIN"), userController.updateUser);

// PATCH /api/users/:id/role — admin only (change role)
router.patch("/:id/role", authMiddleware, roleMiddleware("ADMIN"), userController.changeRole);

// PATCH /api/users/:id/disable — admin only (disable user)
router.patch("/:id/disable", authMiddleware, roleMiddleware("ADMIN"), userController.disableUser);

module.exports = router;