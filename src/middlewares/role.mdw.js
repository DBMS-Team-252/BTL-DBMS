const AppError = require("../utils/AppError");

/**
 * Middleware phân quyền (Role-Based Access Control)
 * Bắt buộc phải chạy sau authMiddleware (để có req.user)
 * @param  {...string} allowedRoles Danh sách các role được phép truy cập (VD: "ADMIN", "USER")
 */
const roleMiddleware = (...allowedRoles) => {
    return (req, res, next) => {
        // Kiểm tra xem user có tồn tại trong request không (đã qua authMiddleware)
        if (!req.user) {
            return next(new AppError("Không xác định được danh tính người dùng", 401));
        }

        // Kiểm tra role của user có nằm trong danh sách cho phép không
        if (!allowedRoles.includes(req.user.role)) {
            return next(new AppError("Bạn không có quyền thực hiện hành động này", 403));
        }

        next();
    };
};

module.exports = roleMiddleware;
