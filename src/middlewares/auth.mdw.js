const jwt = require("jsonwebtoken");
const AppError = require("../utils/AppError");

/**
 * Middleware xác thực JWT access token
 * Gán req.user = { id, role } nếu hợp lệ
 */
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers["authorization"];

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return next(new AppError("Không có token xác thực", 401));
    }

    const token = authHeader.split(" ")[1];

    try {
        const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
        req.user = {
            id: payload.sub,
            role: payload.role,
        };
        next();
    } catch (err) {
        if (err.name === "TokenExpiredError") {
            return next(new AppError("Access token đã hết hạn", 401));
        }
        return next(new AppError("Token không hợp lệ", 401));
    }
};

module.exports = authMiddleware;
