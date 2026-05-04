const Joi = require("joi");

const registerSchema = Joi.object({
    name: Joi.string().min(2).max(255).required().messages({
        "string.empty": "Tên không được để trống",
        "string.min": "Tên phải có ít nhất 2 ký tự",
        "string.max": "Tên không được vượt quá 255 ký tự",
        "any.required": "Tên là bắt buộc",
    }),

    email: Joi.string().email().max(255).required().messages({
        "string.email": "Email không hợp lệ",
        "string.empty": "Email không được để trống",
        "any.required": "Email là bắt buộc",
    }),

    phone: Joi.string()
        .pattern(/^[0-9]{9,15}$/)
        .required()
        .messages({
            "string.pattern.base": "Số điện thoại không hợp lệ (9–15 chữ số)",
            "string.empty": "Số điện thoại không được để trống",
            "any.required": "Số điện thoại là bắt buộc",
        }),

    password: Joi.string().min(6).max(100).required().messages({
        "string.min": "Mật khẩu phải có ít nhất 6 ký tự",
        "string.empty": "Mật khẩu không được để trống",
        "any.required": "Mật khẩu là bắt buộc",
    }),
});

const loginSchema = Joi.object({
    email: Joi.string().email().required().messages({
        "string.email": "Email không hợp lệ",
        "string.empty": "Email không được để trống",
        "any.required": "Email là bắt buộc",
    }),

    password: Joi.string().required().messages({
        "string.empty": "Mật khẩu không được để trống",
        "any.required": "Mật khẩu là bắt buộc",
    }),
});

const refreshSchema = Joi.object({
    refreshToken: Joi.string().required().messages({
        "string.empty": "refreshToken không được để trống",
        "any.required": "refreshToken là bắt buộc",
    }),
});

module.exports = { registerSchema, loginSchema, refreshSchema };
