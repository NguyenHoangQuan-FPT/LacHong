const e = require('express');
const Joi = require('joi');

const registerUserSchema = Joi.object({
    email: Joi.string()
        .email()
        .required()
        .messages({
            'string.empty': 'Email can not be empty',
            'string.email': 'Email is not valid',
            'any.required': 'Email is required'
        }),
    password: Joi.string()
        .min(6)
        .required()
        .messages({
            'string.empty': 'Password can not be empty',
            'string.min': 'Password must be at least 6 characters long',
            'any.required': 'Password is required'
        })
});

module.exports = registerUserSchema;