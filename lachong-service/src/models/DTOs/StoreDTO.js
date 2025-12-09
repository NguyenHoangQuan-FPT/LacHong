const joi = require('joi');

const storeSchema = joi.object({
    storeName: joi.string()
        .min(3)
        .max(100)
        .messages({
            'string.empty': 'Store name cannot be empty',
            'string.min': 'Store name must be at least 3 characters long',
            'string.max': 'Store name must be at most 100 characters long',
            'any.required': 'Store name is required'
        }),
    emailStore: joi.string()
        .email()
        .messages({
            'string.empty': 'Store email cannot be empty',
            'string.email': 'Store email is not valid',
            'any.required': 'Store email is required'
        }),
    phone: joi.string()
        .pattern(/^[0-9]{10,15}$/)
        .messages({
            'string.pattern.base': 'Phone number is not valid'
        }),
    address: joi.string()
        .max(200)
        .messages({
            'string.max': 'Address must be at most 200 characters long'
        }),
    avatar: joi.string()
        .uri()
        .messages({
            'string.uri': 'Avatar must be a valid URL'
        }),
    policy: joi.string()
        .max(1000)
        .messages({
            'string.max': 'Policy must be at most 1000 characters long'
        }),
    facebook: joi.string()
        .uri()
        .messages({
            'string.uri': 'Facebook URL must be a valid URL'
        }),
    instagram: joi.string()
        .uri()
        .messages({
            'string.uri': 'Instagram URL must be a valid URL'
        }),
    twitter: joi.string()
        .uri()
        .messages({
            'string.uri': 'Twitter URL must be a valid URL'
        }),
    policy: joi.string()
        .max(1000)
        .messages({
            'string.max': 'Policy must be at most 1000 characters long'
        }),
    typeStoreId: joi.string()
        .hex()
        .length(24)
        .messages({
            'string.length': 'TypeStore ID must be 24 characters long',
            'string.hex': 'TypeStore ID must be a valid hexadecimal string'
        })
});

module.exports = storeSchema;