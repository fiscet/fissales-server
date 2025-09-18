import { Router } from 'express';
import { logger } from '../utils/logger.js';
import { getMastra } from '../ai/mastra.js';
import { RuntimeContext } from '@mastra/core/runtime-context';
import { getCompanyInfoCached } from '../utils/company-cache.js';
import { MastraContext } from '@/types/index.js';

const router = Router();

// Main chat endpoint - AI agent conversations
router.post('/', async (req, res) => {
  try {
    const { message, sessionId, userId } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        error: 'Invalid Message',
        message: 'Message is required and must be a string',
        code: 'INVALID_MESSAGE',
        timestamp: new Date().toISOString()
      });
    }

    if (!sessionId) {
      return res.status(400).json({
        error: 'Session ID Required',
        message: 'Session ID is required',
        code: 'SESSION_ID_REQUIRED',
        timestamp: new Date().toISOString()
      });
    }

    logger.info('Chat request received', {
      sessionId,
      userId: userId || 'anonymous',
      messageLength: message.length
    });

    // Get Mastra instance and company data (with cache)
    const mastra = await getMastra();
    const companyInfo = await getCompanyInfoCached();

    // Create runtime context with company data and session info
    const runtimeContext = new RuntimeContext<MastraContext>();
    runtimeContext.set('sessionId', sessionId);
    runtimeContext.set('userId', userId || 'anonymous');
    runtimeContext.set('companyName', companyInfo?.name || '');
    runtimeContext.set('companyDescription', companyInfo?.description || '');

    // Use the frontend agent with runtime context and memory
    const response = await mastra.getAgent('frontendAgent').generate(message, {
      runtimeContext,
      memory: {
        thread: sessionId, // Use sessionId as thread ID
        resource: userId || 'anonymous' // Use userId as resource ID
      }
    });

    logger.info('Chat response generated', {
      sessionId,
      userId: userId || 'anonymous',
      responseLength: response.text.length
    });

    return res.status(200).json({
      response: response.text || response,
      sessionId,
      userId: userId || null,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Chat endpoint error:', error);
    return res.status(500).json({
      error: 'Chat Processing Failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      code: 'CHAT_PROCESSING_ERROR',
      timestamp: new Date().toISOString()
    });
  }
});

export { router as chatRouter };
