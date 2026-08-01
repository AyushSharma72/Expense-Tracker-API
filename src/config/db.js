const mongoose = require('mongoose');
const config = require('./index');
const logger = require('../utils/logger');

async function connectDB() {
  if (!config.mongodbUri) {
    throw new Error('MONGODB_URI is not defined in environment variables');
  }

  await mongoose.connect(config.mongodbUri, {
    dbName: config.mongodbDbName,
  });

  logger.info('Connected to MongoDB', { dbName: config.mongodbDbName });
}

module.exports = connectDB;
