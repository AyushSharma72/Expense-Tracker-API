const express = require('express');
const expenseController = require('../controllers/expense.controller');
const validate = require('../middlewares/validate.middleware');
const {
  createExpenseSchema,
  categoryQuerySchema,
  idParamSchema,
} = require('../validators/expense.validator');

const router = express.Router();

router.post(
  '/',
  validate(createExpenseSchema, 'body'),
  expenseController.createExpense
);

router.get(
  '/',
  validate(categoryQuerySchema, 'query'),
  expenseController.getExpenses
);

router.get(
  '/totals/by-category',
  expenseController.getTotalsByCategory
);

router.get(
  '/totals',
  validate(categoryQuerySchema, 'query'),
  expenseController.getTotals
);

router.delete(
  '/:id',
  validate(idParamSchema, 'params'),
  expenseController.deleteExpense
);

module.exports = router;
