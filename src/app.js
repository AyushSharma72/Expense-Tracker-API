const express = require('express');
const requestLogger = require('./middlewares/requestLogger.middleware');
const notFound = require('./middlewares/notFound.middleware');
const errorHandler = require('./middlewares/error.middleware');
const expenseRoutes = require('./routes/expense.routes');

const app = express();

app.use(express.json());
app.use(requestLogger);

app.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'OK' });
});

app.use('/api/expenses', expenseRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
