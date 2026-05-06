const { getPrisma } = require("../configs/database");


const getOrCreateCart = async (userId) => {
    const prisma = getPrisma();
    let cart = await prisma.carts.findFirst({
        where: { user_id: BigInt(userId) },
    });

    if (!cart) {
        cart = await prisma.carts.create({
        data: {
            user_id: BigInt(userId),
        },
        });
    }

    return cart;
};

const addToCart = async (userId, productId, quantity = 1) => {
    const prisma = getPrisma();
    const cart = await getOrCreateCart(userId);

    const existingItem = await prisma.cart_items.findUnique({
        where: {
        cart_id_product_id: {
            cart_id: cart.id,
            product_id: BigInt(productId),
        },
        },
    });

    if (existingItem) {
        return await prisma.cart_items.update({
        where: { id: existingItem.id },
        data: {
            quantity: existingItem.quantity + quantity,
        },
        });
    }

    return await prisma.cart_items.create({
        data: {
        cart_id: cart.id,
        product_id: BigInt(productId),
        quantity,
        },
    });
};

const getCartDetail = async (userId) => {
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

    return cart;
};

module.exports = {
    addToCart,
    getCartDetail,
};