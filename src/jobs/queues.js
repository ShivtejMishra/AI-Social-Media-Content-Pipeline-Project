/**
 * BullMQ Queue Configuration
 * Stub for future async job queue implementation
 * Requires Redis to be running
 *
 * To enable:
 * 1. Install: npm install bullmq ioredis
 * 2. Set REDIS_URL in .env
 * 3. Uncomment the queue and worker initialization below
 */

// const { Queue, Worker } = require('bullmq');
// const { redis } = require('../config/env');

// const connection = {
//   host: new URL(redis.url).hostname,
//   port: parseInt(new URL(redis.url).port) || 6379,
// };

// export const imageQueue = new Queue('image-generation', { connection });
// export const exportQueue = new Queue('content-export', { connection });

// Stub exports for forward compatibility
const imageQueue = null;
const exportQueue = null;

const addImageJob = async (data) => {
  if (!imageQueue) {
    console.warn('⚠️  Image queue not configured. Running synchronously.');
    return null;
  }
  return imageQueue.add('generate-image', data, { attempts: 3, backoff: { type: 'exponential', delay: 2000 } });
};

const addExportJob = async (data) => {
  if (!exportQueue) {
    console.warn('⚠️  Export queue not configured. Running synchronously.');
    return null;
  }
  return exportQueue.add('export-content', data, { attempts: 2 });
};

module.exports = { imageQueue, exportQueue, addImageJob, addExportJob };
