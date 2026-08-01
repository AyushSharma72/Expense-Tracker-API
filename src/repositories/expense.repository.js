const mongoose = require('mongoose');
const { Expense, toExpense } = require('../models/expense.model');

async function findAll(category) {
  const filter = {};

  if (category) {
    filter.category = new RegExp(`^${escapeRegex(category)}$`, 'i');
  }

  const docs = await Expense.find(filter).lean();
  return docs.map(toExpense);
}

async function findById(id) {
  const doc = await Expense.findOne({ id }).lean();
  return toExpense(doc);
}

async function create(expense) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const [created] = await Expense.create([expense], { session });
    await session.commitTransaction();
    return toExpense(created.toObject());
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

async function deleteById(id) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const deleted = await Expense.findOneAndDelete({ id }).session(session);
    await session.commitTransaction();
    return Boolean(deleted);
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

async function getTotals(category) {
  const match = {};

  if (category) {
    match.category = new RegExp(`^${escapeRegex(category)}$`, 'i');
  }

  const [result] = await Expense.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
  ]);

  return {
    total: result ? Number(result.total.toFixed(2)) : 0,
    count: result ? result.count : 0,
    category: category || null,
  };
}

async function getTotalsByCategory() {
  const byCategoryRows = await Expense.aggregate([
    {
      $group: {
        _id: '$category',
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
  ]);

  const byCategory = {};
  let overallTotal = 0;
  let overallCount = 0;

  for (const row of byCategoryRows) {
    const total = Number(row.total.toFixed(2));
    byCategory[row._id] = {
      total,
      count: row.count,
    };
    overallTotal += row.total;
    overallCount += row.count;
  }

  return {
    overallTotal: Number(overallTotal.toFixed(2)),
    overallCount,
    byCategory,
  };
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

module.exports = {
  findAll,
  findById,
  create,
  deleteById,
  getTotals,
  getTotalsByCategory,
};
