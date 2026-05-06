const catchAsync = require("../utils/catchAsync");
const { success } = require("../utils/response");
const inventoryService = require("../services/inventory.service");
const AppError = require("../utils/AppError");

const getInventories = catchAsync(async (req, res) => {
    const data = await inventoryService.getInventories(req.query);
    return success(res, data, "Lấy danh sách tồn kho thành công");
});

const getLowStockAlert = catchAsync(async (req, res) => {
    const threshold = req.query.threshold ? parseInt(req.query.threshold, 10) : 10;
    const data = await inventoryService.getLowStockAlert(threshold);
    return success(res, data, "Lấy danh sách cảnh báo tồn kho thành công");
});

const getTransactionHistory = catchAsync(async (req, res) => {
    const data = await inventoryService.getTransactionHistory(req.query);
    return success(res, data, "Lấy lịch sử biến động tồn kho thành công");
});

const createTransaction = catchAsync(async (req, res) => {
    const { productId, type, quantity, reason } = req.body;
    
    if (!productId || !type || quantity === undefined) {
        throw new AppError("Thiếu thông tin bắt buộc (productId, type, quantity)", 400);
    }
    
    if (!['IMPORT', 'EXPORT', 'ADJUST', 'RETURN'].includes(type)) {
        throw new AppError("Loại giao dịch không hợp lệ", 400);
    }

    const userId = req.user.id;
    const data = await inventoryService.addTransaction(productId, type, parseInt(quantity, 10), reason, userId);
    return success(res, data, "Tạo giao dịch tồn kho thành công", 201);
});

const updateInventory = catchAsync(async (req, res) => {
    const { productId } = req.params;
    const { stock } = req.body;

    if (stock === undefined) {
        throw new AppError("Thiếu thông tin số lượng tồn kho (stock)", 400);
    }

    const data = await inventoryService.updateInventory(productId, parseInt(stock, 10));
    return success(res, data, "Cập nhật tồn kho thành công");
});

const bulkUpdate = catchAsync(async (req, res) => {
    const { updates } = req.body; // updates: [{ productId, stock }]

    if (!Array.isArray(updates) || updates.length === 0) {
        throw new AppError("Dữ liệu cập nhật không hợp lệ", 400);
    }

    const data = await inventoryService.bulkUpdateInventory(updates);
    return success(res, data, "Cập nhật tồn kho hàng loạt thành công");
});

module.exports = {
    getInventories,
    getLowStockAlert,
    getTransactionHistory,
    createTransaction,
    updateInventory,
    bulkUpdate
};
