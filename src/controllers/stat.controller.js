const catchAsync = require("../utils/catchAsync");
const { success } = require("../utils/response");
const statService = require("../services/stat.service");

const getOverview = catchAsync(async (req, res) => {
    const data = await statService.getOverview();
    return success(res, data, "Lấy dữ liệu tổng quan thành công");
});

const getAnalytics = catchAsync(async (req, res) => {
    const { startDate, endDate } = req.query;
    const data = await statService.getAnalytics(startDate, endDate);
    return success(res, data, "Lấy dữ liệu phân tích thành công");
});

module.exports = {
    getOverview,
    getAnalytics
};
