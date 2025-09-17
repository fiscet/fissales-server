import { Router } from 'express';
import { processWithSupervisor } from '../ai/graph';
import { updateChatSession, getChatSession, createChatSession, addMessageToSession } from '../database/utils';
import { logger } from '../utils/logger';
import { sessionMiddleware, validateSession } from '../middleware/session';

const router = Router();

// Main chat endpoint
router.post('/', async (req, res) => {
  try {
    const { message, sessionId: bodySessionId } = req.body;

    // Use sessionId from body if provided, otherwise from headers
    const sessionId = bodySessionId || req.sessionId;

    if (!sessionId) {
      return res.status(400).json({
        error: 'Session ID Required',
        message: 'Session ID is required either in request body or headers',
        code: 'SESSION_ID_REQUIRED',
        timestamp: new Date().toISOString(),
      });
    }

    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        error: 'Invalid Message',
        message: 'Message is required and must be a string',
        code: 'INVALID_MESSAGE',
        timestamp: new Date().toISOString(),
      });
    }

    logger.info('Chat request received', {
      sessionId,
      messageLength: message.length,
    });

    // Check if session exists, create if it doesn't
    let chatSession = await getChatSession(sessionId);
    if (!chatSession) {
      logger.info('Creating new chat session', { sessionId });
      chatSession = await createChatSession(sessionId);
    }

    // Process message with supervisor-based multi-agent system
    const { response: aiResponse, products } = await processWithSupervisor(sessionId, message);

    // Update chat session with both user message and AI response
    const userMessage = {
      role: 'user' as const,
      content: message,
      timestamp: new Date(),
    };

    const assistantMessage = {
      role: 'assistant' as const,
      content: aiResponse,
      timestamp: new Date(),
      ...(products.length > 0 && { products }),
    };

    // Add messages to session using the dedicated function
    await addMessageToSession(sessionId, userMessage);
    await addMessageToSession(sessionId, assistantMessage);

    logger.info('Chat response generated', {
      sessionId,
      responseLength: aiResponse.length,
      productsCount: products.length,
    });

    return res.status(200).json({
      response: aiResponse,
      products: products,
      sessionId,
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

// Get chat history for session
router.get('/history', sessionMiddleware, validateSession, async (req, res) => {
  try {
    const sessionId = req.sessionId!;

    logger.info('Chat history requested', { sessionId });

    // Get chat session from database, create if it doesn't exist
    let chatSession = await getChatSession(sessionId);
    if (!chatSession) {
      logger.info('Creating new chat session for history request', { sessionId });
      chatSession = await createChatSession(sessionId);
    }

    return res.status(200).json({
      messages: chatSession.messages || [],
      sessionId,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Chat history error:', error);
    return res.status(500).json({
      error: 'History Retrieval Failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      code: 'HISTORY_RETRIEVAL_ERROR',
      timestamp: new Date().toISOString(),
    });
  }
});

// Clear chat history for session
router.delete('/history', sessionMiddleware, validateSession, async (req, res) => {
  try {
    const sessionId = req.sessionId!;

    logger.info('Chat history clear requested', { sessionId });

    // Check if session exists, create if it doesn't
    let chatSession = await getChatSession(sessionId);
    if (!chatSession) {
      logger.info('Creating new chat session for history clear request', { sessionId });
      chatSession = await createChatSession(sessionId);
    }

    // Clear messages by updating with empty array
    await updateChatSession(sessionId, { messages: [] });

    return res.status(200).json({
      message: 'Chat history cleared successfully',
      sessionId,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Chat history clear error:', error);
    return res.status(500).json({
      error: 'History Clear Failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      code: 'HISTORY_CLEAR_ERROR',
      timestamp: new Date().toISOString(),
    });
  }
});

// Get session info
router.get('/session', sessionMiddleware, validateSession, async (req, res) => {
  try {
    const sessionId = req.sessionId!;

    logger.info('Session info requested', { sessionId });

    let chatSession = await getChatSession(sessionId);
    if (!chatSession) {
      logger.info('Creating new chat session for session info request', { sessionId });
      chatSession = await createChatSession(sessionId);
    }

    return res.status(200).json({
      sessionId: chatSession.sessionId,
      messageCount: chatSession.messages.length,
      createdAt: chatSession.createdAt,
      updatedAt: chatSession.updatedAt,
      lastActive: chatSession.lastActive,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Session info error:', error);
    return res.status(500).json({
      error: 'Session Info Failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      code: 'SESSION_INFO_ERROR',
      timestamp: new Date().toISOString(),
    });
  }
});

// Test AI agents endpoint
router.post('/test', sessionMiddleware, validateSession, async (req, res) => {
  try {
    const { message } = req.body;
    const sessionId = req.sessionId!;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        error: 'Invalid Message',
        message: 'Message is required and must be a string',
        code: 'INVALID_MESSAGE',
        timestamp: new Date().toISOString(),
      });
    }

    logger.info('AI test request received', {
      sessionId,
      messageLength: message.length,
    });

    // Process message with supervisor-based multi-agent system (without saving to history)
    const { response: aiResponse, products } = await processWithSupervisor(sessionId, message);

    logger.info('AI test response generated', {
      sessionId,
      responseLength: aiResponse.length,
      productsCount: products.length,
    });

    return res.status(200).json({
      response: aiResponse,
      products: products,
      sessionId,
      test: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('AI test error:', error);
    return res.status(500).json({
      error: 'AI Test Failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      code: 'AI_TEST_ERROR',
      timestamp: new Date().toISOString(),
    });
  }
});

export { router as chatRouter };
