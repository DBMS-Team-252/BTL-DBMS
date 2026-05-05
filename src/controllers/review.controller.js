const catchAsync = require("../utils/catchAsync");
const { success } = require("../utils/response");
const reviewService = require("../services/review.service");

const getAllReviews = catchAsync(async (req, res) => {
    const data = await reviewService.getAllReviews(req.query);
    return success(res, data, "Lấy danh sách đánh giá thành công");
});

const deleteReview = catchAsync(async (req, res) => {
    const { id } = req.params;
    await reviewService.deleteReview(id);
    return success(res, null, "Đã xóa đánh giá vi phạm thành công");
});

module.exports = { getAllReviews, deleteReview };
