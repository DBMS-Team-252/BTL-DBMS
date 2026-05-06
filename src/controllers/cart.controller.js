const cartService = require('../services/cart.service');

const addToCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId, quantity } = req.body;

        const result = await cartService.addToCart(userId, productId, quantity);

        res.json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getCart = async (req, res) => {
    try {
        const userId = req.user.id;

        const cart = await cartService.getCartDetail(userId);

        res.json(cart);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    addToCart,
    getCart,
};