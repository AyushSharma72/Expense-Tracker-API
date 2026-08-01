const expenseService = require('../services/expense.service');

async function createExpense(req, res, next) {
  try {
    const expense = await expenseService.createExpense(req.body);
    res.status(201).json({
      success: true,
      data: expense,
    });
  } catch (error) {
    next(error);
  }
}

async function getExpenses(req, res, next) {
  try {
    const expenses = await expenseService.getExpenses(req.query.category);
    res.status(200).json({
      success: true,
      count: expenses.length,
      data: expenses,
    });
  } catch (error) {
    next(error);
  }
}

async function getTotals(req, res, next) {
  try {
    const totals = await expenseService.getTotals(req.query.category);
    res.status(200).json({
      success: true,
      data: totals,
    });
  } catch (error) {
    next(error);
  }
}

async function getTotalsByCategory(req, res, next) {
  try {
    const totals = await expenseService.getTotalsByCategory();
    res.status(200).json({
      success: true,
      data: totals,
    });
  } catch (error) {
    next(error);
  }
}

async function deleteExpense(req, res, next) {
  try {
    await expenseService.deleteExpense(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Expense deleted successfully',
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createExpense,
  getExpenses,
  getTotals,
  getTotalsByCategory,
  deleteExpense,
};
