import { Router } from 'express';
import { PromptLoader } from '../ai/utils/prompt-loader.js';
import { logger } from '../utils/logger.js';

const router = Router();

// Tool usage tracking
let toolUsageStats = {
  productSearchTool: {
    calls: 0,
    lastCalled: null as string | null,
    errors: 0
  },
  companyInfoTool: {
    calls: 0,
    lastCalled: null as string | null,
    errors: 0
  }
};

// Function to track tool usage
export function trackToolUsage(toolName: string, success: boolean = true) {
  if (toolName in toolUsageStats) {
    toolUsageStats[toolName as keyof typeof toolUsageStats].calls++;
    toolUsageStats[toolName as keyof typeof toolUsageStats].lastCalled = new Date().toISOString();
    if (!success) {
      toolUsageStats[toolName as keyof typeof toolUsageStats].errors++;
    }
  }
}

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
      },
      toolUsage: toolUsageStats
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

// Tool usage monitoring endpoint
router.get('/tools/usage', (_req, res) => {
  try {
    logger.info('Tool usage stats requested', { toolUsage: toolUsageStats });

    res.status(200).json({
      success: true,
      data: {
        toolUsage: toolUsageStats,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Failed to get tool usage stats:', error);
    res.status(500).json({
      error: 'Failed to get tool usage stats',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

// Test productSearchTool directly
router.post('/tools/test-product-search', async (req, res) => {
  try {
    const { query, topK = 5 } = req.body;

    if (!query) {
      return res.status(400).json({
        error: 'Query required',
        message: 'Please provide a search query'
      });
    }

    logger.info('Testing productSearchTool directly', { query, topK });

    // Import and test the tool directly
    const { productSearchTool } = await import('../ai/tools/vector-query-tool.js');

    const result = await productSearchTool.execute({ queryText: query, topK }, { runtimeContext: { get: () => 'test' } });

    res.status(200).json({
      success: true,
      data: {
        query,
        results: result,
        count: result.length,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Failed to test productSearchTool:', error);
    res.status(500).json({
      error: 'Failed to test productSearchTool',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

export { router as performanceRouter };
