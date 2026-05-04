const Joi = require("joi");

/**
 * Validation schema cho API lấy danh sách sản phẩm
 * Tất cả các field đều optional vì đây là API tìm kiếm/lọc
 */
const getProductsSchema = Joi.object({
    page: Joi.number().integer().min(1).messages({
        "number.base": "Page phải là một số",
        "number.min": "Page phải lớn hơn hoặc bằng 1"
    }),
    limit: Joi.number().integer().min(1).messages({
        "number.base": "Limit phải là một số",
        "number.min": "Limit phải lớn hơn hoặc bằng 1"
    }),
    search: Joi.string().trim().max(255).messages({
        "string.max": "Từ khóa tìm kiếm không được vượt quá 255 ký tự"
    }),
    category: Joi.number().integer().min(1).messages({
        "number.base": "Category ID phải là một số",
        "number.min": "Category ID không hợp lệ"
    }),
    minPrice: Joi.number().min(0).messages({
        "number.base": "Giá tối thiểu phải là một số",
        "number.min": "Giá tối thiểu không được âm"
    }),
    maxPrice: Joi.number().min(0).messages({
        "number.base": "Giá tối đa phải là một số",
        "number.min": "Giá tối đa không được âm"
    }),
    rating: Joi.number().min(1).max(5).messages({
        "number.base": "Rating phải là một số",
        "number.min": "Rating thấp nhất là 1",
        "number.max": "Rating cao nhất là 5"
    })
}).custom((value, helpers) => {
    // Đảm bảo minPrice <= maxPrice nếu cả 2 được truyền vào
    if (value.minPrice !== undefined && value.maxPrice !== undefined) {
        if (value.minPrice > value.maxPrice) {
            return helpers.message("Giá tối thiểu (minPrice) không được lớn hơn giá tối đa (maxPrice)");
        }
    }
    return value;
});

module.exports = {
    getProductsSchema
};
