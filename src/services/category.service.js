const { getPrisma } = require("../configs/database");
const AppError = require("../utils/AppError");

const createCategory = async (data) => {
    const prisma = getPrisma();

    if (data.parent_id) {
        const parent = await prisma.categories.findUnique({ where: { id: BigInt(data.parent_id) } });
        if (!parent) throw new AppError("Danh mục không tồn tại", 404);
    }

    const category = await prisma.categories.create({
        data: {
            name: data.name,
            parent_id: data.parent_id ? BigInt(data.parent_id) : null,
        },
    });

    return {
        ...category,
        id: category.id.toString(),
        parent_id: category.parent_id ? category.parent_id.toString() : null,
    };
};

const getCategories = async () => {
    const prisma = getPrisma();
    const categories = await prisma.categories.findMany();

    return categories.map((cat) => ({
        id: cat.id.toString(),
        name: cat.name,
        parent_id: cat.parent_id ? cat.parent_id.toString() : null,
    }));
};

const updateCategory = async (id, data) => {
    const prisma = getPrisma();
    const catId = BigInt(id);

    if (data.parent_id && BigInt(data.parent_id) === catId) {
        throw new AppError("Danh mục không hợp lệ", 400);
    }

    const category = await prisma.categories.update({
        where: { id: catId },
        data: {
            name: data.name,
            parent_id: data.parent_id ? BigInt(data.parent_id) : null,
        },
    });

    return {
        ...category,
        id: category.id.toString(),
        parent_id: category.parent_id ? category.parent_id.toString() : null,
    };
};

const deleteCategory = async (id) => {
    const prisma = getPrisma();
    const catId = BigInt(id);

    const childCats = await prisma.categories.findFirst({ where: { parent_id: catId } });
    if (childCats) throw new AppError("Không thể xóa danh mục", 400);

    const linkedProducts = await prisma.products.findFirst({ where: { category_id: catId } });
    if (linkedProducts) throw new AppError("Không thể xóa danh mục đang chứa sản phẩm", 400);

    await prisma.categories.delete({ where: { id: catId } });
    return null;
};

module.exports = { createCategory, getCategories, updateCategory, deleteCategory };