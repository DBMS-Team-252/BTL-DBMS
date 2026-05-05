const { getPrisma } = require("../configs/database");
const { getPaginationOptions, formatPagingData } = require("../utils/pagination");

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
module.exports = {
    checkout,
    getOrderDetail,
};