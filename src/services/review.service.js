const { getPrisma } = require("../configs/database");
const { getPaginationOptions, formatPagingData } = require("../utils/pagination");
const AppError = require("../utils/AppError");

/**
 * [ADMIN] Lấy danh sách tất cả đánh giá
 */
const getAllReviews = async (query) => {
    const prisma = getPrisma();
    const { page, limit, productId } = query;
    const { skip, take } = getPaginationOptions(page, limit);

    const whereCondition = {};
    if (productId) {
        whereCondition.product_id = BigInt(productId);
    }

    const [totalItems, reviewsData] = await Promise.all([
        prisma.reviews.count({ where: whereCondition }),
        prisma.reviews.findMany({
            where: whereCondition,
            skip,
            take,
            include: {
                users: {
                    select: { name: true, email: true },
                },
                products: {
                    select: { name: true },
                },
            },
            orderBy: { created_at: "desc" },
        }),
    ]);

    const formattedData = reviewsData.map((review) => ({
        id: review.id.toString(),
        user_id: review.user_id ? review.user_id.toString() : null,
        customer_name: review.users?.name,
        customer_email: review.users?.email,
        product_id: review.product_id ? review.product_id.toString() : null,
        product_name: review.products?.name,
        rating: review.rating,
        comment: review.comment,
        created_at: review.created_at,
    }));

    return formatPagingData(formattedData, page, limit, totalItems);
};

/**
 * [ADMIN] Xóa đánh giá (Từ chối / Gỡ bỏ đánh giá vi phạm)
 */
const deleteReview = async (id) => {
    const prisma = getPrisma();
    const reviewId = BigInt(id);

    const existingReview = await prisma.reviews.findUnique({ where: { id: reviewId } });
    if (!existingReview) {
        throw new AppError("Đánh giá không tồn tại", 404);
    }

    await prisma.reviews.delete({ where: { id: reviewId } });
    return null;
};

module.exports = { getAllReviews, deleteReview };
