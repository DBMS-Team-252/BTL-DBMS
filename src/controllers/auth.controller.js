const catchAsync = require("../utils/catchAsync");
const { success } = require("../utils/response");
const authService = require("../services/auth.service");
const AppError = require("../utils/AppError");

/**
 * POST /api/auth/register
 */
const register = catchAsync(async (req, res) => {
    const user = await authService.register(req.body);
    return success(res, user, "Đăng ký thành công", 201);
});

/**
 * POST /api/auth/login
 */
const login = catchAsync(async (req, res) => {
    const { email, password } = req.body;
    const data = await authService.login(email, password);
    return success(res, data, "Đăng nhập thành công");
});

/**
 * POST /api/auth/logout   (yêu cầu access token hợp lệ)
 */
const logout = catchAsync(async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        throw new AppError("refreshToken là bắt buộc", 400);
    }
    authService.logout(refreshToken);
    return success(res, null, "Đăng xuất thành công");
});

/**
 * POST /api/auth/refresh   (public — không cần access token)
 */
const refresh = catchAsync(async (req, res) => {
    const { refreshToken } = req.body;
    const data = await authService.refresh(refreshToken);
    return success(res, data, "Làm mới token thành công");
});

module.exports = { register, login, logout, refresh };
