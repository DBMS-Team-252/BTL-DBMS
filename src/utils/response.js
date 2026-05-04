/**
 * Gửi response thành công chuẩn hoá
 * @param {import('express').Response} res
 * @param {*} data
 * @param {string} message
 * @param {number} statusCode
 */
const success = (res, data = null, message = "Thành công", statusCode = 200) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data,
    });
};

/**
 * Gửi response lỗi chuẩn hoá
 * @param {import('express').Response} res
 * @param {string} message
 * @param {number} statusCode
 * @param {*} errors
 */
const error = (res, message = "Đã xảy ra lỗi", statusCode = 500, errors = null) => {
    const body = {
        success: false,
        message,
    };
    if (errors) body.errors = errors;
    return res.status(statusCode).json(body);
};

module.exports = { success, error };
