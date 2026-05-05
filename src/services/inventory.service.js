const { getPrisma } = require("../configs/database");
const { getPaginationOptions, formatPagingData } = require("../utils/pagination");
const AppError = require("../utils/AppError");

// Lấy danh sách tồn kho
const getInventories = async (query) => {
    const prisma = getPrisma();
    const { page, limit, search, status, sortBy, sortOrder } = query;
    const { skip, take } = getPaginationOptions(page, limit);

    const whereCondition = {};

    if (search) {
        whereCondition.products = { name: { contains: search } };
    }

    if (status === 'out_of_stock') {
        whereCondition.stock = 0;
    } else if (status === 'low_stock') {
        whereCondition.stock = { lt: 5, gt: 0 };
    }

    const order = sortOrder === 'desc' ? 'desc' : 'asc';
    let orderByCondition = { updated_at: 'desc' };

    if (sortBy === 'stock') {
        orderByCondition = { stock: order };
    } else if (sortBy === 'name') {
        orderByCondition = { products: { name: order } };
    } else if (sortBy === 'updated_at') {
        orderByCondition = { updated_at: order };
    }

    const [totalItems, inventoriesData] = await Promise.all([
        prisma.inventory.count({ where: whereCondition }),
        prisma.inventory.findMany({
            where: whereCondition,
            skip,
            take,
            include: {
                products: {
                    select: { name: true, price: true }
                }
            },
            orderBy: orderByCondition
        })
    ]);

    const formattedData = inventoriesData.map(inv => ({
        product_id: inv.product_id.toString(),
        stock: inv.stock,
        updated_at: inv.updated_at,
        product_name: inv.products?.name,
        price: inv.products?.price ? inv.products.price.toNumber() : 0
    }));

    return formatPagingData(formattedData, page, limit, totalItems);
};

// Cập nhật tồn kho trực tiếp
const updateInventory = async (productId, stock) => {
    const prisma = getPrisma();
    const pid = BigInt(productId);

    const inventory = await prisma.inventory.upsert({
        where: { product_id: pid },
        update: { stock, updated_at: new Date() },
        create: { product_id: pid, stock, updated_at: new Date() }
    });

    return { product_id: inventory.product_id.toString(), stock: inventory.stock };
};

// Cập nhật tồn kho hàng loạt
const bulkUpdateInventory = async (updates) => {
    const prisma = getPrisma();

    const results = await prisma.$transaction(
        updates.map(update => prisma.inventory.upsert({
            where: { product_id: BigInt(update.productId) },
            update: { stock: update.stock, updated_at: new Date() },
            create: { product_id: BigInt(update.productId), stock: update.stock, updated_at: new Date() }
        }))
    );

    return results.map(r => ({ product_id: r.product_id.toString(), stock: r.stock }));
};

// Thực hiện giao dịch nhập/xuất/điều chỉnh
const addTransaction = async (productId, type, quantity, reason, userId) => {
    const prisma = getPrisma();
    const pid = BigInt(productId);
    const uid = BigInt(userId);

    const currentInv = await prisma.inventory.findUnique({ where: { product_id: pid } });
    const oldStock = currentInv ? currentInv.stock : 0;
    
    let newStock = oldStock;
    if (type === 'IMPORT' || type === 'RETURN') {
        newStock += quantity;
    } else if (type === 'EXPORT') {
        newStock -= quantity;
        if (newStock < 0) throw new AppError("Số lượng tồn kho không đủ để xuất", 400);
    } else if (type === 'ADJUST') {
        newStock = quantity; // Khi adjust, quantity truyền vào là số lượng thực tế mới
    } else {
        throw new AppError("Loại giao dịch không hợp lệ", 400);
    }

    const txQuantity = type === 'ADJUST' ? Math.abs(newStock - oldStock) : quantity;

    return await prisma.$transaction(async (tx) => {
        await tx.inventory.upsert({
            where: { product_id: pid },
            update: { stock: newStock, updated_at: new Date() },
            create: { product_id: pid, stock: newStock, updated_at: new Date() }
        });

        const transaction = await tx.inventory_transactions.create({
            data: {
                product_id: pid,
                type,
                quantity: txQuantity,
                old_stock: oldStock,
                new_stock: newStock,
                reason,
                created_by: uid
            }
        });

        return {
            transaction_id: transaction.id.toString(),
            product_id: pid.toString(),
            type,
            old_stock: oldStock,
            new_stock: newStock
        };
    });
};

// Lấy danh sách sản phẩm sắp hết hàng
const getLowStockAlert = async (threshold = 10) => {
    const prisma = getPrisma();
    const items = await prisma.inventory.findMany({
        where: { stock: { lt: threshold } },
        include: {
            products: { select: { name: true } }
        },
        orderBy: { stock: 'asc' }
    });

    return items.map(inv => ({
        product_id: inv.product_id.toString(),
        stock: inv.stock,
        product_name: inv.products?.name
    }));
};

// Lịch sử biến động tồn kho
const getTransactionHistory = async (query) => {
    const prisma = getPrisma();
    const { page, limit, productId, type } = query;
    const { skip, take } = getPaginationOptions(page, limit);

    const whereCondition = {};
    if (productId) whereCondition.product_id = BigInt(productId);
    if (type) whereCondition.type = type;

    const [totalItems, transactions] = await Promise.all([
        prisma.inventory_transactions.count({ where: whereCondition }),
        prisma.inventory_transactions.findMany({
            where: whereCondition,
            skip,
            take,
            include: {
                products: { select: { name: true } },
                users: { select: { name: true } }
            },
            orderBy: { created_at: 'desc' }
        })
    ]);

    const formattedData = transactions.map(tx => ({
        id: tx.id.toString(),
        product_id: tx.product_id.toString(),
        product_name: tx.products?.name,
        type: tx.type,
        quantity: tx.quantity,
        old_stock: tx.old_stock,
        new_stock: tx.new_stock,
        reason: tx.reason,
        created_by: tx.users?.name,
        created_at: tx.created_at
    }));

    return formatPagingData(formattedData, page, limit, totalItems);
};

module.exports = {
    getInventories,
    updateInventory,
    bulkUpdateInventory,
    addTransaction,
    getLowStockAlert,
    getTransactionHistory
};
