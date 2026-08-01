const crypto = require('crypto');
const expenseRepository = require('../repositories/expense.repository');
const AppError = require('../utils/AppError');

async function createExpense(payload) {
  const expense = {
    id: crypto.randomUUID(),
    title: payload.title.trim(),
    amount: payload.amount,
    category: payload.category.trim(),
    date: payload.date,
  };

  return expenseRepository.create(expense);
}

async function getExpenses(category) {
  return expenseRepository.findAll(category);
}

async function getTotals(category) {
  return expenseRepository.getTotals(category);
}

async function getTotalsByCategory() {
  return expenseRepository.getTotalsByCategory();
}

async function deleteExpense(id) {
  const deleted = await expenseRepository.deleteById(id);

  if (!deleted) {
    throw new AppError(`Expense with id '${id}' not found`, 404);
  }

  return true;
}

module.exports = {
  createExpense,
  getExpenses,
  getTotals,
  getTotalsByCategory,
  deleteExpense,
};
