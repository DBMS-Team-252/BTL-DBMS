const catchAsync = require("../utils/catchAsync");
const { success } = require("../utils/response");
const userService = require("../services/user.service");
const AppError = require("../utils/AppError");

/**
 * GET /api/users/
 * Admin lấy danh sách user có phân trang
 */
const getUsers = catchAsync(async (req, res) => {
    const users = await userService.getUsers(req.query);
    return success(res, users, "Lấy danh sách người dùng thành công", 200);
});

/**
 * PUT /api/users/:id
 * Cập nhật thông tin user (tên, số điện thoại)
 */
const updateUser = catchAsync(async (req, res) => {
    const { id } = req.params;
    const user = await userService.updateUser(id, req.body);
    return success(res, user, "Cập nhật thông tin người dùng thành công", 200);
});

/**
 * PATCH /api/users/:id/role
 * Thay đổi quyền của user
 */
const changeRole = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;

    if (!['USER', 'ADMIN'].includes(role)) {
        throw new AppError("Role không hợp lệ", 400);
    }

    const user = await userService.changeRole(id, role);
    return success(res, user, "Thay đổi quyền người dùng thành công", 200);
});

/**
 * PATCH /api/users/:id/disable
 * Vô hiệu hóa user
 */
const disableUser = catchAsync(async (req, res) => {
    const { id } = req.params;
    const user = await userService.disableUser(id);
    return success(res, user, "Vô hiệu hóa người dùng thành công", 200);
});

module.exports = {
    getUsers,
    updateUser,
    changeRole,
    disableUser
};