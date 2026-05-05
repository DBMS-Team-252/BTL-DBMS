const orderService = require('../services/order.service');

const checkout = async (req, res) => {
    try {
        const userId = req.user.id;

        const order = await orderService.checkout(userId);

        res.json({
        message: 'Checkout success',
        order,
        });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

module.exports = {
    checkout,
};