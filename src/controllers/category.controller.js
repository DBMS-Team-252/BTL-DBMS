const catchAsync = require("../utils/catchAsync");
const { success } = require("../utils/response");
const categoryService = require("../services/category.service");

const createCategory = catchAsync(async (req, res) => {
    const data = await categoryService.createCategory(req.body);
    return success(res, data, "Tạo danh mục thành công", 201);
});

const getCategories = catchAsync(async (req, res) => {
    const { page, limit } = req.query;
    const data = await categoryService.getCategories(page, limit);
    return success(res, data, "Lấy danh sách danh mục thành công");
});

const updateCategory = catchAsync(async (req, res) => {
    const { id } = req.params;
    const data = await categoryService.updateCategory(id, req.body);
    return success(res, data, "Cập nhật danh mục thành công");
});

const deleteCategory = catchAsync(async (req, res) => {
    const { id } = req.params;
    await categoryService.deleteCategory(id);
    return success(res, null, "Xóa danh mục thành công");
});

module.exports = { createCategory, getCategories, updateCategory, deleteCategory };