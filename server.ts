import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { logger } from './utils/logger.js';
import { errorHandler } from './middleware/error-handler.js';
import { healthRouter } from './routes/health.js';
import { shopifyRouter } from './routes/shopify.js';
import { chatRouter } from './routes/chat.js';
import { docsRouter } from './routes/docs.js';
import { performanceRouter } from './routes/performance.js';
import { productsRouter } from './routes/products.js';
import { companyRouter } from './routes/company.js';
import { promptsRouter } from './routes/prompts.js';

// Load environment variables (only in development)
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const app = express();
const PORT = process.env['PORT'] || 8080;

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: [
      'https://fissales-admin.vercel.app',
      'http://localhost:3000',
      'http://localhost:3001'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

// Body parsing middleware
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use((req, _res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });
  next();
});

// Routes
app.use('/api/health', healthRouter);
app.use('/api/shopify', shopifyRouter);
app.use('/api/chat', chatRouter); // Main chat endpoint
app.use('/api/company', companyRouter); // Company information management
app.use('/api/prompts', promptsRouter); // Prompt management API
app.use('/api/docs', docsRouter);
app.use('/api/performance', performanceRouter);
app.use('/api/products', productsRouter);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`,
    code: 'NOT_FOUND',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use(errorHandler);

// Start server (Firebase App Hosting needs this, Vercel ignores it)
app.listen(PORT, () => {
  logger.info(`🚀 FisAiSalesServer running on port ${PORT}`);
  logger.info(`Environment: ${process.env['NODE_ENV'] || 'development'}`);
  logger.info(`Health check: http://localhost:${PORT}/api/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

export default app;
