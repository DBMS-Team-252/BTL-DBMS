const { getPrisma } = require("../configs/database");
const { getPaginationOptions, formatPagingData } = require("../utils/pagination");
const AppError = require("../utils/AppError");

/**
 * Lấy danh sách sản phẩm với phân trang, tìm kiếm và lọc
 */
const getProducts = async (query) => {
    const prisma = getPrisma();
    const { page, limit, search, category, minPrice, maxPrice, rating } = query;

    const { skip, take } = getPaginationOptions(page, limit);

    // Xây dựng điều kiện lọc (where)
    const whereCondition = {};

    // 1. Tìm kiếm theo name hoặc description
    if (search) {
        whereCondition.OR = [{ name: { contains: search } }, { description: { contains: search } }];
    }

    // 2. Lọc theo danh mục
    if (category) {
        whereCondition.category_id = BigInt(category);
    }

    // 3. Lọc theo khoảng giá
    if (minPrice !== undefined || maxPrice !== undefined) {
        whereCondition.price = {};
        if (minPrice !== undefined) whereCondition.price.gte = minPrice;
        if (maxPrice !== undefined) whereCondition.price.lte = maxPrice;
    }

    // 4. Lọc theo đánh giá trung bình (rating)
    if (rating) {
        // Gom nhóm bảng reviews theo product_id để tìm các sản phẩm có avg(rating) >= rating
        const ratingGroups = await prisma.reviews.groupBy({
            by: ["product_id"],
            _avg: {
                rating: true,
            },
            having: {
                rating: {
                    _avg: {
                        gte: parseFloat(rating),
                    },
                },
            },
        });

        const validProductIds = ratingGroups.map((group) => group.product_id);

        // Thêm điều kiện product_id phải nằm trong danh sách vừa tìm được
        whereCondition.id = { in: validProductIds };
    }

    // Thực hiện đếm tổng số bản ghi và lấy dữ liệu
    const [totalItems, productsData] = await Promise.all([
        prisma.products.count({ where: whereCondition }),
        prisma.products.findMany({
            where: whereCondition,
            skip,
            take,
            include: {
                categories: {
                    select: { id: true, name: true },
                },
            },
            orderBy: {
                created_at: "desc", // Sản phẩm mới nhất lên trước
            },
        }),
    ]);

    // Format lại dữ liệu (chuyển đổi BigInt sang String, Decimal sang Number để dùng được trong JSON)
    const formattedData = productsData.map((product) => ({
        id: product.id.toString(),
        name: product.name,
        description: product.description,
        price: product.price ? product.price.toNumber() : 0,
        category_id: product.category_id ? product.category_id.toString() : null,
        created_by: product.created_by ? product.created_by.toString() : null,
        created_at: product.created_at,
        category: product.categories
            ? {
                  id: product.categories.id.toString(),
                  name: product.categories.name,
              }
            : null,
    }));

    // Trả về dữ liệu đã được chuẩn hóa theo chuẩn phân trang
    return formatPagingData(formattedData, page, limit, totalItems);
};

const getProductDetail = async (productId) => {
    // Lấy chi tiết sản phẩm theo ID, bao gồm thông tin danh mục, tồn kho và đánh giá
    const prisma = getPrisma();
    return await prisma.products.findUnique({
        where: { id: BigInt(productId) },
        include: { categories: true, inventory: true, reviews: true },
    });
};

const createProduct = async (data, adminId) => {
    const prisma = getPrisma();
    const product = await prisma.products.create({
        data: {
            name: data.name,
            description: data.description,
            price: data.price,
            category_id: data.category_id ? BigInt(data.category_id) : null,
            created_by: BigInt(adminId),
            inventory: {
                create: { stock: data.stock ? parseInt(data.stock, 10) : 0 },
            },
        },
        include: { inventory: true, categories: true },
    });

    return {
        ...product,
        id: product.id.toString(),
        category_id: product.category_id?.toString(),
        created_by: product.created_by.toString(),
        price: product.price.toNumber(),
    };
};

const updateProduct = async (id, data) => {
    const prisma = getPrisma();
    const productId = BigInt(id);

    const existingProduct = await prisma.products.findUnique({ where: { id: productId } });
    if (!existingProduct) throw new AppError("Sản phẩm không tồn tại", 404);

    const product = await prisma.products.update({
        where: { id: productId },
        data: {
            name: data.name,
            description: data.description,
            price: data.price,
            category_id: data.category_id ? BigInt(data.category_id) : null,
        },
    });

    return {
        ...product,
        id: product.id.toString(),
        category_id: product.category_id?.toString(),
        price: product.price.toNumber(),
    };
};

const deleteProduct = async (id) => {
    const prisma = getPrisma();
    const productId = BigInt(id);

    const existingProduct = await prisma.products.findUnique({ where: { id: productId } });
    if (!existingProduct) throw new AppError("Sản phẩm không tồn tại", 404);

    await prisma.products.delete({ where: { id: productId } });
    return null;
};

module.exports = { getProducts, getProductDetail, createProduct, updateProduct, deleteProduct };
