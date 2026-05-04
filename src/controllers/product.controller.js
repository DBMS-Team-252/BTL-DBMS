const catchAsync = require("../utils/catchAsync");
const { success } = require("../utils/response");
const productService = require("../services/product.service");

/**
 * Lấy danh sách sản phẩm
 * Khách hàng không cần đăng nhập cũng có thể xem
 */
const getProducts = catchAsync(async (req, res) => {
    // Trích xuất các query parameters hợp lệ sau khi qua validate.mdw
    const query = {
        page: req.query.page,
        limit: req.query.limit,
        search: req.query.search,
        category: req.query.category,
        minPrice: req.query.minPrice !== undefined ? parseFloat(req.query.minPrice) : undefined,
        maxPrice: req.query.maxPrice !== undefined ? parseFloat(req.query.maxPrice) : undefined,
        rating: req.query.rating !== undefined ? parseFloat(req.query.rating) : undefined
    };

    const result = await productService.getProducts(query);

    return success(res, result, "Lấy danh sách sản phẩm thành công");
});


module.exports = {
    getProducts
};
