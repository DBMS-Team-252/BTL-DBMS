/**
 * Wrap async route handler để tự động catch lỗi và chuyển vào next(err)
 * @param {Function} fn - async controller function
 */
const catchAsync = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

module.exports = catchAsync;
