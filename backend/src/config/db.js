const mongoose = require('mongoose');
const { mongoUri } = require('./env');

let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    isConnected = true;
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);

    mongoose.connection.on('disconnected', () => {
      isConnected = false;
      console.warn('⚠️  MongoDB disconnected. Attempting reconnect...');
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err.message);
      isConnected = false;
    });
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
