const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: String,
      required: true,
    },
  },
  {
    collection: 'expenses',
    versionKey: false,
  }
);

function toExpense(doc) {
  if (!doc) {
    return null;
  }

  return {
    id: doc.id,
    title: doc.title,
    amount: doc.amount,
    category: doc.category,
    date: doc.date,
  };
}

const Expense = mongoose.model('Expense', expenseSchema);

module.exports = {
  Expense,
  toExpense,
};
