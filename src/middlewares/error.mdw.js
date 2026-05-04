const { error: sendError } = require("../utils/response");

/**
 * Global error handler middleware (phải có 4 tham số để Express nhận ra là error handler)
 */
// eslint-disable-next-line no-unused-vars
const errorMiddleware = (err, req, res, next) => {
    // Lỗi do chính mình throw (AppError)
    if (err.isOperational) {
        return sendError(res, err.message, err.statusCode);
    }

    // Lỗi Prisma: unique constraint (email đã tồn tại)
    if (err.code === "P2002") {
        const field = err.meta?.target?.[0] || "field";
        return sendError(res, `Giá trị ${field} đã tồn tại`, 409);
    }

    // Lỗi Prisma: record not found
    if (err.code === "P2025") {
        return sendError(res, "Không tìm thấy bản ghi", 404);
    }

    // JWT errors
    if (err.name === "JsonWebTokenError") {
        return sendError(res, "Token không hợp lệ", 401);
    }
    if (err.name === "TokenExpiredError") {
        return sendError(res, "Token đã hết hạn", 401);
    }

    // Lỗi không xác định → 500
    console.error("❌ Unexpected Error:", err);
    return sendError(res, "Đã xảy ra lỗi nội bộ", 500);
};

module.exports = errorMiddleware;
