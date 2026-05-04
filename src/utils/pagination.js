/**
 * Lấy các tùy chọn cho Prisma (skip, take) từ page và limit
 * @param {string|number} page - Trang hiện tại (1-indexed)
 * @param {string|number} limit - Số item trên mỗi trang
 * @returns {{skip: number, take: number}}
 */
const getPaginationOptions = (page, limit) => {
    // Mặc định lấy từ .env hoặc 12 nếu không có
    const defaultPageSize = process.env.DEFAULT_PAGE_SIZE ? parseInt(process.env.DEFAULT_PAGE_SIZE, 10) : 12;

    const pageNumber = parseInt(page, 10) > 0 ? parseInt(page, 10) : 1;
    const pageSize = parseInt(limit, 10) > 0 ? parseInt(limit, 10) : defaultPageSize;

    const skip = (pageNumber - 1) * pageSize;
    const take = pageSize;

    return { skip, take };
};

/**
 * Định dạng lại kết quả trả về của một list API
 * @param {Array} data - Dữ liệu trả về (danh sách bản ghi)
 * @param {string|number} page - Trang hiện tại
 * @param {string|number} limit - Số item trên mỗi trang
 * @param {number} totalItems - Tổng số item thỏa mãn điều kiện
 * @returns {{data: Array, pagination: {totalItems: number, totalPages: number, currentPage: number, pageSize: number}}}
 */
const formatPagingData = (data, page, limit, totalItems) => {
    const defaultPageSize = process.env.DEFAULT_PAGE_SIZE ? parseInt(process.env.DEFAULT_PAGE_SIZE, 10) : 12;
    const pageNumber = parseInt(page, 10) > 0 ? parseInt(page, 10) : 1;
    const pageSize = parseInt(limit, 10) > 0 ? parseInt(limit, 10) : defaultPageSize;

    const totalPages = Math.ceil(totalItems / pageSize);

    return {
        data,
        pagination: {
            totalItems,
            totalPages,
            currentPage: pageNumber,
            pageSize
        }
    };
};

module.exports = {
    getPaginationOptions,
    formatPagingData
};
