require('express-async-errors');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const path = require('path');

const { clientUrl, nodeEnv } = require('./config/env');
const errorHandler = require('./shared/middlewares/errorHandler');
const { sendError } = require('./shared/utils/apiResponse');

// Route imports
const authRoutes = require('./modules/auth/auth.routes');
const userRoutes = require('./modules/users/user.routes');
const workspaceRoutes = require('./modules/workspaces/workspace.routes');
const aiRoutes = require('./modules/ai/ai.routes');
const contentRoutes = require('./modules/content/content.routes');
const scheduleRoutes = require('./modules/schedule/schedule.routes');
const exportRoutes = require('./modules/exports/export.routes');
const analyticsRoutes = require('./modules/analytics/analytics.routes');

const app = express();

// ─── Security Middleware ─────────────────────────────────────────────────────
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allow serving images
  })
);

app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        clientUrl,
        'http://localhost:5173',
        'http://localhost:3000',
        process.env.CORS_ORIGIN,           // custom production domain
      ].filter(Boolean);

      // Allow all *.vercel.app preview URLs
      const isVercel = origin && origin.endsWith('.vercel.app');

      if (!origin || isVercel || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: Origin ${origin} not allowed`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ─── Rate Limiting ───────────────────────────────────────────────────────────
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: { success: false, message: 'Too many requests, please try again later.', errorCode: 'RATE_LIMITED' },
  standardHeaders: true,
  legacyHeaders: false,
});

const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20,
  message: { success: false, message: 'AI rate limit reached. Wait 1 minute.', errorCode: 'AI_RATE_LIMITED' },
});

app.use(generalLimiter);

// ─── Request Parsing ─────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ─── Logging ─────────────────────────────────────────────────────────────────
if (nodeEnv === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// ─── Static Files (uploaded images, exports) ──────────────────────────────
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// ─── Health Check ────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'SocialX Studio API is running', timestamp: new Date().toISOString() });
});

// ─── API Routes ──────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/workspaces', workspaceRoutes);
app.use('/api/ai', aiLimiter, aiRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/exports', exportRoutes);
app.use('/api/analytics', analyticsRoutes);

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use('*', (req, res) => {
  sendError(res, {
    message: `Route ${req.originalUrl} not found`,
    errorCode: 'ROUTE_NOT_FOUND',
    statusCode: 404,
  });
});

// ─── Global Error Handler ────────────────────────────────────────────────────
app.use(errorHandler);

module.exports = app;
