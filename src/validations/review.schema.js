const Joi = require("joi");

const createReviewSchema = Joi.object({
    product_id: Joi.number().required().messages({
        "number.base": "Product ID phải là một số",
        "any.required": "Product ID là bắt buộc"
    }),
    rating: Joi.number().min(1).max(5).required().messages({
        "number.min": "Rating thấp nhất là 1",
        "number.max": "Rating cao nhất là 5",
        "any.required": "Rating là bắt buộc"
    }),
    comment: Joi.string().allow("").optional()
});
 
module.exports = { createReviewSchema }; 