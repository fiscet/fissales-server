import { Router } from 'express';
import { logger } from '../utils/logger.js';

const router = Router();

// Main chat endpoint - simple placeholder for now
router.post('/', async (req, res) => {
  try {
    const { message, sessionId, userId } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        error: 'Invalid Message',
        message: 'Message is required and must be a string',
        code: 'INVALID_MESSAGE',
        timestamp: new Date().toISOString(),
      });
    }

    if (!sessionId) {
      return res.status(400).json({
        error: 'Session ID Required',
        message: 'Session ID is required',
        code: 'SESSION_ID_REQUIRED',
        timestamp: new Date().toISOString(),
      });
    }

    logger.info('Chat request received', {
      sessionId,
      userId: userId || 'anonymous',
      messageLength: message.length,
    });

    // Simple response for now - you can integrate Mastra here later
    const response = userId
      ? `Hello user ${userId}! Echo: ${message}`
      : `Echo: ${message}`;

    logger.info('Chat response generated', {
      sessionId,
      userId: userId || 'anonymous',
      responseLength: response.length,
    });

    return res.status(200).json({
      response,
      sessionId,
      userId: userId || null,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Chat endpoint error:', error);
    return res.status(500).json({
      error: 'Chat Processing Failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      code: 'CHAT_PROCESSING_ERROR',
      timestamp: new Date().toISOString(),
    });
  }
});

export { router as chatRouter };
