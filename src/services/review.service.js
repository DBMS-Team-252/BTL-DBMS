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

/**
 * [USER] Kiểm tra xem người dùng đã mua và thanh toán sản phẩm hay chưa
 */
const checkPurchasedProduct = async (userId, productId) => {
    const prisma = getPrisma();

    const item = await prisma.order_items.findFirst({
        where: {
            product_id: BigInt(productId),
            orders: {
                user_id: BigInt(userId),
                status: { in: ["PAID", "SHIPPED"] }
            }
        }
    });

    return !!item;
};

/**
 * [USER] Tạo đánh giá mới cho một sản phẩm
 */
const createReview = async (userId, body) => {
    const prisma = getPrisma();
    const { product_id, rating, comment } = body;

    const purchased = await checkPurchasedProduct(userId, product_id);
    if (!purchased)
        throw new AppError("Bạn phải mua sản phẩm trước khi đánh giá", 400);

    const existed = await prisma.reviews.findFirst({
        where: {
            user_id: BigInt(userId),
            product_id: BigInt(product_id)
        }
    });

    if (existed)
        throw new AppError("Bạn đã đánh giá sản phẩm này rồi", 400);

    const review = await prisma.reviews.create({
        data: {
            user_id: BigInt(userId),
            product_id: BigInt(product_id),
            rating,
            comment
        }
    });

    return {
        id: review.id.toString(),
        rating: review.rating,
        comment: review.comment
    };
};

/**
 * [USER] Lấy danh sách tất cả đánh giá của một sản phẩm
 */
const getReviewsByProduct = async (productId) => {
    const prisma = getPrisma();

    const reviews = await prisma.reviews.findMany({
        where: { product_id: BigInt(productId) },
        include: {
            users: { select: { name: true } }
        },
        orderBy: { created_at: "desc" }
    });

    return reviews.map(r => ({
        id: r.id.toString(),
        user_name: r.users?.name,
        rating: r.rating,
        comment: r.comment,
        created_at: r.created_at
    }));
}; 
 
module.exports = { getAllReviews, deleteReview, createReview, getReviewsByProduct };