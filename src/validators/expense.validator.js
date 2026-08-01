const Joi = require('joi');

const createExpenseSchema = Joi.object({
  title: Joi.string().trim().min(1).max(200).required().messages({
    'string.empty': 'title is required',
    'any.required': 'title is required',
  }),
  amount: Joi.number().positive().precision(2).required().messages({
    'number.base': 'amount must be a number',
    'number.positive': 'amount must be greater than 0',
    'any.required': 'amount is required',
  }),
  category: Joi.string().trim().min(1).max(100).required().messages({
    'string.empty': 'category is required',
    'any.required': 'category is required',
  }),
  date: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .required()
    .messages({
      'string.pattern.base': 'date must be in YYYY-MM-DD format',
      'any.required': 'date is required',
    }),
});

const categoryQuerySchema = Joi.object({
  category: Joi.string().trim().min(1).max(100).optional(),
});

const idParamSchema = Joi.object({
  id: Joi.string().uuid().required().messages({
    'string.guid': 'id must be a valid UUID',
    'any.required': 'id is required',
  }),
});

module.exports = {
  createExpenseSchema,
  categoryQuerySchema,
  idParamSchema,
};
