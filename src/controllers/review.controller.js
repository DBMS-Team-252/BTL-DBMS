const catchAsync = require("../utils/catchAsync");
const { success } = require("../utils/response");
const reviewService = require("../services/review.service");
const { createReviewSchema } = require("../validations/review.schema");

const getAllReviews = catchAsync(async (req, res) => {
    const data = await reviewService.getAllReviews(req.query);
    return success(res, data, "Lấy danh sách đánh giá thành công");
});

const deleteReview = catchAsync(async (req, res) => {
    const { id } = req.params;
    await reviewService.deleteReview(id);
    return success(res, null, "Đã xóa đánh giá vi phạm thành công");
});

const createReview = catchAsync(async (req, res) => {
    const { error } = createReviewSchema.validate(req.body);
    if (error) throw new Error(error.details[0].message);

    const userId = req.user.id;
    const data = await reviewService.createReview(userId, req.body);
    return success(res, data, "Đánh giá sản phẩm thành công");
});

const getReviewsByProduct = catchAsync(async (req, res) => {
    const data = await reviewService.getReviewsByProduct(req.params.productId);
    return success(res, data, "Lấy danh sách đánh giá sản phẩm thành công");
});

module.exports = { getAllReviews, deleteReview, createReview, getReviewsByProduct };

