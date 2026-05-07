const catchAsync = require("../utils/catchAsync");
const { success } = require("../utils/response");
const AppError = require("../utils/AppError");
const orderService = require("../services/order.service");

const checkout = async (req, res) => { 
    try {
    const userId = req.user.id;

    const order = await orderService.checkout(userId);

        res.json({
        message: 'Checkout success',
        order,
        });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const getOrderDetail = catchAsync(async (req, res) => {
    const order = await orderService.getOrderDetail(req.params.id);
    return success(res, order, "Lấy chi tiết đơn hàng thành công");
});

const getAllOrders = catchAsync(async (req, res) => {
    const data = await orderService.getAllOrders(req.query);
    return success(res, data, "Lấy danh sách đơn hàng thành công");
});

const updateOrderStatus = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const adminId = req.user.id;

    if (!["PENDING", "PAID", "SHIPPED", "CANCELLED"].includes(status)) {
        throw new AppError("Trạng thái đơn hàng không hợp lệ", 400);
    }

    const data = await orderService.updateOrderStatus(id, status, adminId);
    return success(res, data, "Cập nhật trạng thái đơn hàng thành công");
});

const getMyOrders = catchAsync(async (req, res) => {
    const userId = req.user.id;
    const data = await orderService.getMyOrders(userId);
    return success(res, data, "Lấy lịch sử đơn hàng thành công");
});

module.exports = { checkout, getOrderDetail, getAllOrders, updateOrderStatus, getMyOrders };