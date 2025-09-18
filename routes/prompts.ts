import { Router } from 'express';
import { logger } from '../utils/logger.js';
import { PromptLoader } from '../ai/utils/prompt-loader.js';

const router = Router();

// GET /api/prompts - List all prompts
router.get('/', async (req, res) => {
  try {
    const prompts = await PromptLoader.listFirestorePrompts();

    res.status(200).json({
      success: true,
      data: prompts,
      count: prompts.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Failed to list prompts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to list prompts',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/prompts/:name - Get specific prompt
router.get('/:name', async (req, res) => {
  try {
    const { name } = req.params;

    if (!name || typeof name !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Invalid prompt name',
        message: 'Prompt name is required and must be a string',
        timestamp: new Date().toISOString()
      });
    }

    const prompt = await PromptLoader.loadPrompt(name);

    res.status(200).json({
      success: true,
      data: {
        name,
        content: prompt,
        loadedFrom: 'cache' // Could be enhanced to show source
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error(`Failed to load prompt: ${req.params.name}`, error);
    res.status(404).json({
      success: false,
      error: 'Prompt not found',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/prompts/:name - Create or update prompt
router.post('/:name', async (req, res) => {
  try {
    const { name } = req.params;
    const { content } = req.body;

    if (!name || typeof name !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Invalid prompt name',
        message: 'Prompt name is required and must be a string',
        timestamp: new Date().toISOString()
      });
    }

    if (!content || typeof content !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Invalid content',
        message: 'Content is required and must be a string',
        timestamp: new Date().toISOString()
      });
    }

    if (content.length > 50000) {
      return res.status(400).json({
        success: false,
        error: 'Content too large',
        message: 'Prompt content must be less than 50,000 characters',
        timestamp: new Date().toISOString()
      });
    }

    await PromptLoader.savePromptToFirestore(name, content);

    logger.info(`Prompt updated via API: ${name}`);

    res.status(200).json({
      success: true,
      data: {
        name,
        message: 'Prompt saved successfully',
        version: Date.now()
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error(`Failed to save prompt: ${req.params.name}`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to save prompt',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

// PUT /api/prompts/:name - Update prompt (same logic as POST)
router.put('/:name', async (req, res) => {
  try {
    const { name } = req.params;
    const { content } = req.body;

    if (!name || typeof name !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Invalid prompt name',
        message: 'Prompt name is required and must be a string',
        timestamp: new Date().toISOString()
      });
    }

    if (!content || typeof content !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Invalid content',
        message: 'Content is required and must be a string',
        timestamp: new Date().toISOString()
      });
    }

    if (content.length > 50000) {
      return res.status(400).json({
        success: false,
        error: 'Content too large',
        message: 'Prompt content must be less than 50,000 characters',
        timestamp: new Date().toISOString()
      });
    }

    await PromptLoader.savePromptToFirestore(name, content);

    logger.info(`Prompt updated via API (PUT): ${name}`);

    res.status(200).json({
      success: true,
      data: {
        name,
        message: 'Prompt saved successfully',
        version: Date.now()
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error(`Failed to save prompt (PUT): ${req.params.name}`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to save prompt',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

// DELETE /api/prompts/:name - Delete prompt from Firestore
router.delete('/:name', async (req, res) => {
  try {
    const { name } = req.params;

    if (!name || typeof name !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Invalid prompt name',
        message: 'Prompt name is required and must be a string',
        timestamp: new Date().toISOString()
      });
    }

    // We'll add a delete method to PromptLoader
    await PromptLoader.deletePromptFromFirestore(name);

    logger.info(`Prompt deleted via API: ${name}`);

    res.status(200).json({
      success: true,
      data: {
        name,
        message: 'Prompt deleted successfully'
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error(`Failed to delete prompt: ${req.params.name}`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete prompt',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/prompts/:name/sync - Sync file to Firestore
router.post('/:name/sync', async (req, res) => {
  try {
    const { name } = req.params;

    if (!name || typeof name !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Invalid prompt name',
        message: 'Prompt name is required and must be a string',
        timestamp: new Date().toISOString()
      });
    }

    await PromptLoader.syncFileToFirestore(name);

    logger.info(`Prompt synced via API: ${name}`);

    res.status(200).json({
      success: true,
      data: {
        name,
        message: 'Prompt synced from file to Firestore successfully'
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error(`Failed to sync prompt: ${req.params.name}`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to sync prompt',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/prompts/cache/clear - Clear prompt cache
router.post('/cache/clear', async (req, res) => {
  try {
    const stats = PromptLoader.getCacheStats();
    PromptLoader.clearCache();

    logger.info('Prompt cache cleared via API');

    res.status(200).json({
      success: true,
      data: {
        message: 'Cache cleared successfully',
        previousCacheSize: stats.size,
        clearedPrompts: stats.keys
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Failed to clear cache:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear cache',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/prompts/cache/stats - Get cache statistics
router.get('/cache/stats', async (req, res) => {
  try {
    const stats = PromptLoader.getCacheStats();

    res.status(200).json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Failed to get cache stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get cache stats',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

export { router as promptsRouter };
