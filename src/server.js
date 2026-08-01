require('dotenv').config();

const app = require('./app');
const config = require('./config');
const connectDB = require('./config/db');
const logger = require('./utils/logger');

async function start() {
  try {
    await connectDB();
    app.listen(config.port, () => {
      logger.info(`Smart Expense Tracker API listening on port ${config.port}`);
    });
  } catch (error) {
    logger.error('Failed to start server', {
      message: error.message,
      stack: error.stack,
    });
    process.exit(1);
  }
}

start();
