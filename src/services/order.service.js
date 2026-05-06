const { getPrisma } = require("../configs/database");
const { getPaginationOptions, formatPagingData } = require("../utils/pagination");
const AppError = require("../utils/AppError");

const checkout = async (userId) => {
    const prisma = getPrisma();
    const cart = await prisma.carts.findFirst({
        where: { user_id: BigInt(userId) },
        include: {
        cart_items: {
            include: {
            products: true,
            },
        },
        },
    });

    if (!cart || cart.cart_items.length === 0) {
        throw new Error('Cart is empty');
    }

    // tính total
    const total = cart.cart_items.reduce((sum, item) => {
        return sum + Number(item.products.price) * item.quantity;
    }, 0);

    // transaction
    return await prisma.$transaction(async (tx) => {
        const order = await tx.orders.create({
        data: {
            user_id: BigInt(userId),
            total,
            status: 'PENDING',
        },
        });

        // tạo order_items
        for (const item of cart.cart_items) {
            await tx.order_items.create({
            data: {
            order_id: order.id,
            product_id: item.product_id,
            quantity: item.quantity,
            price: item.products.price,
            },
            });
        }

        // tạo payment
        await tx.payments.create({
        data: {
            order_id: order.id,
            amount: total,
            method: 'COD',
            status: 'SUCCESS',
        },
        });

        // clear cart
        await tx.cart_items.deleteMany({
        where: { cart_id: cart.id },
        });

        return order;
    });
};

const getOrderDetail = async (orderId) => {
    const prisma = getPrisma();
    return await prisma.orders.findUnique({
        where: { id: BigInt(orderId) },
        include: {
        order_items: {
            include: {
            products: true,
            },
        },
        payments: true,
        },
    });
};

const getAllOrders = async (query) => {
    const prisma = getPrisma();
    const { page, limit, status } = query;
    const { skip, take } = getPaginationOptions(page, limit);

    const whereCondition = status ? { status } : {};

    const [totalItems, ordersData] = await Promise.all([
        prisma.orders.count({ where: whereCondition }),
        prisma.orders.findMany({
            where: whereCondition, skip, take,
            include: { users: { select: { name: true, email: true, phone: true } } },
            orderBy: { created_at: 'desc' }
        })
    ]);

    const formattedData = ordersData.map(order => ({
        id: order.id.toString(),
        user_id: order.user_id?.toString(),
        customer_name: order.users?.name,
        customer_email: order.users?.email,
        total: order.total?.toNumber() || 0,
        status: order.status,
        created_at: order.created_at
    }));

    return formatPagingData(formattedData, page, limit, totalItems);
};

const updateOrderStatus = async (orderId, status, adminId) => {
    const prisma = getPrisma();
    const oId = BigInt(orderId);

    const order = await prisma.orders.findUnique({
        where: { id: oId }, include: { order_items: true }
    });

    if (!order) throw new AppError("Đơn hàng không tồn tại", 404);
    if (order.status === 'CANCELLED') throw new AppError("Đơn hàng đã hủy", 400);

    return await prisma.$transaction(async (tx) => {
        const updatedOrder = await tx.orders.update({
            where: { id: oId }, data: { status }
        });

        if (status === 'CANCELLED') {
            for (const item of order.order_items) {
                const currentInv = await tx.inventory.findUnique({ where: { product_id: item.product_id } });
                if (currentInv) {
                    const newStock = currentInv.stock + item.quantity;
                    await tx.inventory.update({
                        where: { product_id: item.product_id }, data: { stock: newStock, updated_at: new Date() }
                    });
                    await tx.inventory_transactions.create({
                        data: {
                            product_id: item.product_id, type: 'RETURN',
                            quantity: item.quantity, old_stock: currentInv.stock, new_stock: newStock,
                            reason: `Hoàn kho do hủy đơn hàng #${oId.toString()}`, created_by: BigInt(adminId)
                        }
                    });
                }
            }
        }
        return { id: updatedOrder.id.toString(), status: updatedOrder.status };
    });
};

const getMyOrders = async (userId) => {
    const prisma = getPrisma();

    const orders = await prisma.orders.findMany({
        where: { user_id: BigInt(userId) },
        include: {
            order_items: {
                include: {
                    products: {
                        select: { id: true, name: true, price: true }
                    }
                }
            },
            payments: true
        },
        orderBy: { created_at: "desc" }
    });

    return orders.map(order => ({
        id: order.id.toString(),
        total: order.total?.toNumber() || 0,
        status: order.status,
        created_at: order.created_at,
        items: order.order_items.map(item => ({
            product_id: item.product_id.toString(),
            product_name: item.products?.name,
            price: item.price?.toNumber(),
            quantity: item.quantity
        })),
        payment: order.payments[0] || null
    }));
};

module.exports = { checkout, getOrderDetail, getAllOrders, updateOrderStatus, getMyOrders };
