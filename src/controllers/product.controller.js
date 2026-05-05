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

const getProductDetail = async (req, res) => {// Lấy thông tin chi tiết của một sản phẩm
  try {
    const { id } = req.params;

    const product = await productService.getProductDetail(id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
}
};

const createProduct = catchAsync(async (req, res) => {
    const adminId = req.user.id;
    const data = await productService.createProduct(req.body, adminId);
    return success(res, data, "Tạo sản phẩm thành công", 201);
});

const updateProduct = catchAsync(async (req, res) => {
    const { id } = req.params;
    const data = await productService.updateProduct(id, req.body);
    return success(res, data, "Cập nhật sản phẩm thành công");
});

const deleteProduct = catchAsync(async (req, res) => {
    const { id } = req.params;
    await productService.deleteProduct(id);
    return success(res, null, "Xóa sản phẩm thành công");
});

module.exports = { getProducts, getProductDetail, createProduct, updateProduct, deleteProduct };