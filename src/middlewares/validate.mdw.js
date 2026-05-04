const { error: sendError } = require("../utils/response");

/**
 * Tạo middleware validate req.body theo Joi schema
 * @param {import('joi').Schema} schema
 */
const validate = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body, {
            abortEarly: false,   // trả về tất cả lỗi, không dừng ở lỗi đầu tiên
            allowUnknown: false, // không cho phép field lạ
            stripUnknown: true,  // loại bỏ field không khai báo trong schema
        });

        if (error) {
            const messages = error.details.map((d) => d.message.replace(/['"]/g, ""));
            return sendError(res, "Dữ liệu đầu vào không hợp lệ", 400, messages);
        }

        next();
    };
};

module.exports = validate;
