// Load .env FIRST — before any other module reads process.env
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const app = require('./app');
const connectDB = require('./config/db');
const { port, nodeEnv } = require('./config/env');
const { initStorage } = require('./config/storage');

const startServer = async () => {
  try {
    // Initialize file storage directories
    initStorage();

    // Connect to MongoDB
    await connectDB();

    // Start Express server
    const server = app.listen(port, () => {
      console.log(`\n🚀 SocialX Studio API running in ${nodeEnv} mode`);
      console.log(`📡 Server: http://localhost:${port}`);
      console.log(`🏥 Health: http://localhost:${port}/health\n`);
    });

    // Graceful shutdown
    const shutdown = async (signal) => {
      console.log(`\n⚠️  ${signal} received. Shutting down gracefully...`);
      server.close(() => {
        console.log('✅ HTTP server closed.');
        process.exit(0);
      });

      // Force exit after 10 seconds
      setTimeout(() => {
        console.error('❌ Forced shutdown after timeout.');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    process.on('unhandledRejection', (reason) => {
      console.error('❌ Unhandled Promise Rejection:', reason);
    });

    process.on('uncaughtException', (error) => {
      console.error('❌ Uncaught Exception:', error);
      process.exit(1);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
