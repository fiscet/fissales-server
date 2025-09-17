import { Router } from 'express';
import { logger } from '../utils/logger.js';
import { testDatabaseConnection } from '../database/utils.js';
import { testShopifyIntegration } from '../services/shopify.js';

const router = Router();

// Health check endpoint
router.get('/', async (req, res) => {
  try {
    const healthCheck = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env['NODE_ENV'] || 'development',
      version: process.env['npm_package_version'] || '1.0.0',
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      },
      services: {
        firebase: await testDatabaseConnection() ? 'connected' : 'disconnected',
        shopify: await testShopifyIntegration() ? 'connected' : 'disconnected',
        ai: 'ready',         // AI agents are integrated
      },
    };

    logger.info('Health check requested', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    });

    res.status(200).json(healthCheck);
  } catch (error) {
    logger.error('Health check error:', error);
    res.status(500).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      services: {
        firebase: 'error',
        shopify: 'error',
        ai: 'ready',
      },
    });
  }
});

// Detailed health check endpoint
router.get('/detailed', (req, res) => {
  const detailedHealthCheck = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env['NODE_ENV'] || 'development',
    version: process.env['npm_package_version'] || '1.0.0',
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      external: Math.round(process.memoryUsage().external / 1024 / 1024),
      rss: Math.round(process.memoryUsage().rss / 1024 / 1024),
    },
    cpu: {
      usage: process.cpuUsage(),
    },
    process: {
      pid: process.pid,
      platform: process.platform,
      nodeVersion: process.version,
      arch: process.arch,
    },
    services: {
      firebase: 'pending',
      shopify: 'pending',
      ai: 'ready',
    },
  };

  logger.info('Detailed health check requested', {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  res.status(200).json(detailedHealthCheck);
});

export { router as healthRouter };
