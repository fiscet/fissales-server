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
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
      },
      services: {
        firebase: (await testDatabaseConnection())
          ? 'connected'
          : 'disconnected',
        shopify: (await testShopifyIntegration())
          ? 'connected'
          : 'disconnected',
        ai: 'ready' // AI agents are integrated
      }
    };

    logger.info('Health check requested', {
      ip: req.ip,
      userAgent: req.get('User-Agent')
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
        ai: 'ready'
      }
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
      rss: Math.round(process.memoryUsage().rss / 1024 / 1024)
    },
    cpu: {
      usage: process.cpuUsage()
    },
    process: {
      pid: process.pid,
      platform: process.platform,
      nodeVersion: process.version,
      arch: process.arch
    },
    services: {
      firebase: 'pending',
      shopify: 'pending',
      ai: 'ready'
    }
  };

  logger.info('Detailed health check requested', {
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  res.status(200).json(detailedHealthCheck);
});

// Environment variables endpoint (for debugging)
router.get('/env', (req, res) => {
  try {
    // Filter sensitive information - only show if variables are SET or NOT SET
    const envStatus = {
      NODE_ENV: process.env.NODE_ENV || 'NOT SET',
      FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID ? 'SET' : 'NOT SET',
      FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY
        ? 'SET (length: ' + process.env.FIREBASE_PRIVATE_KEY.length + ')'
        : 'NOT SET',
      FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL
        ? 'SET'
        : 'NOT SET',
      QDRANT_URL: process.env.QDRANT_URL ? 'SET' : 'NOT SET',
      QDRANT_API_KEY: process.env.QDRANT_API_KEY
        ? 'SET (length: ' + process.env.QDRANT_API_KEY.length + ')'
        : 'NOT SET',
      OPENAI_API_KEY: process.env.OPENAI_API_KEY
        ? 'SET (length: ' + process.env.OPENAI_API_KEY.length + ')'
        : 'NOT SET',
      GOOGLE_API_KEY: process.env.GOOGLE_API_KEY
        ? 'SET (length: ' + process.env.GOOGLE_API_KEY.length + ')'
        : 'NOT SET',
      OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY
        ? 'SET (length: ' + process.env.OPENROUTER_API_KEY.length + ')'
        : 'NOT SET',
      WEBSHOP_URL: process.env.WEBSHOP_URL || 'NOT SET',
      API_TOKEN: process.env.API_TOKEN
        ? 'SET (length: ' + process.env.API_TOKEN.length + ')'
        : 'NOT SET',
      SHOPIFY_API_VERSION: process.env.SHOPIFY_API_VERSION || 'NOT SET',
      LOG_LEVEL: process.env.LOG_LEVEL || 'NOT SET',
      LOG_FILE: process.env.LOG_FILE || 'NOT SET',
      PORT: process.env.PORT || 'NOT SET'
    };

    // Count total environment variables
    const totalEnvVars = Object.keys(process.env).length;

    logger.info('Environment variables check requested', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      totalEnvVars
    });

    res.status(200).json({
      message: 'Environment variables status',
      timestamp: new Date().toISOString(),
      totalEnvironmentVariables: totalEnvVars,
      checkedVariables: envStatus,
      // Show first few characters of some non-sensitive variables for debugging
      samples: {
        FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID || 'NOT SET',
        WEBSHOP_URL: process.env.WEBSHOP_URL || 'NOT SET',
        SHOPIFY_API_VERSION: process.env.SHOPIFY_API_VERSION || 'NOT SET',
        NODE_ENV: process.env.NODE_ENV || 'NOT SET'
      }
    });
  } catch (error) {
    logger.error('Environment variables check error:', error);
    res.status(500).json({
      error: 'Environment Check Failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

export { router as healthRouter };
