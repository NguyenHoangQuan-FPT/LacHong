const joi = require('joi');

const ProductDTO = joi.object({
    productName: joi.string()
        .min(3)
        .max(100)
        .required()
        .messages({
            'string.empty': 'Product name cannot be empty',
            'string.min': 'Product name must be at least 3 characters long',
            'string.max': 'Product name must be at most 100 characters long',
            'any.required': 'Product name is required'
        }),
    description: joi.string()
        .max(1000)
        .messages({
            'string.max': 'Description must be at most 1000 characters long'
        }),
    policy: joi.string()
        .max(1000)
        .messages({
            'string.max': 'Policy must be at most 1000 characters long'
        }),
    price: joi.number()
        .positive()
        .required()
        .messages({
            'number.base': 'Price must be a number',
            'number.positive': 'Price must be a positive number',
            'any.required': 'Price is required'
        }),
    stock: joi.number()
        .integer()
        .min(0)
        .required()
        .messages({
            'number.base': 'Stock must be a number',
            'number.integer': 'Stock must be an integer',
            'number.min': 'Stock cannot be negative',
            'any.required': 'Stock is required'
        }),
    discountPercent: joi.number()
        .min(0)
        .max(100)
        .messages({
            'number.base': 'Discount percent must be a number',
            'number.min': 'Discount percent cannot be negative',
            'number.max': 'Discount percent cannot exceed 100'
        }),
    category: joi.string()
        .required()
        .messages({
            'string.empty': 'Category ID cannot be empty',
            'any.required': 'Category ID is required'
        }),
    material: joi.string()
        .required()
        .messages({
            'string.empty': 'Material ID cannot be empty',
            'any.required': 'Material ID is required'
        })
});

module.exports = ProductDTO;