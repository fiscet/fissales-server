import { Router } from 'express';
import { PromptLoader } from '../ai/utils/prompt-loader.js';
import { logger } from '../utils/logger.js';

const router = Router();

// Performance monitoring endpoint
router.get('/metrics', async (_req, res) => {
  try {
    const startTime = Date.now();

    // Get cache statistics
    const promptCacheStats = PromptLoader.getCacheStats();

    // Get system performance metrics
    const memoryUsage = process.memoryUsage();
    const uptime = process.uptime();

    const metrics = {
      timestamp: new Date().toISOString(),
      responseTime: Date.now() - startTime,
      system: {
        uptime: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${Math.floor(uptime % 60)}s`,
        memory: {
          rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
          heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
          heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
          external: `${Math.round(memoryUsage.external / 1024 / 1024)}MB`
        }
      },
      caches: {
        prompts: {
          size: promptCacheStats.size,
          keys: promptCacheStats.keys
        }
      }
    };

    logger.info('Performance metrics requested', {
      responseTime: metrics.responseTime,
      memoryUsage: metrics.system.memory.heapUsed
    });

    res.status(200).json(metrics);
  } catch (error) {
    logger.error('Performance metrics error:', error);
    res.status(500).json({
      error: 'Failed to get performance metrics',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Cache management endpoints
router.post('/cache/refresh', async (_req, res) => {
  try {
    logger.info('Manual cache refresh requested');

    // Clear prompt cache
    PromptLoader.clearCache();

    res.status(200).json({
      message: 'Cache refreshed successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Cache refresh error:', error);
    res.status(500).json({
      error: 'Failed to refresh cache',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.get('/cache/status', (_req, res) => {
  try {
    const status = {
      prompts: PromptLoader.getCacheStats(),
      timestamp: new Date().toISOString()
    };

    res.status(200).json(status);
  } catch (error) {
    logger.error('Cache status error:', error);
    res.status(500).json({
      error: 'Failed to get cache status',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export { router as performanceRouter };
