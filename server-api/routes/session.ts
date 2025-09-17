import { Router } from 'express';
import { logger } from '../utils/logger';
import { validateSession } from '../middleware/session';
import {
  createChatSession,
  updateChatSession,
  getChatSession as getSession
} from '../database/utils';
import { CreateSessionRequest, CreateSessionResponse, ChatHistoryResponse } from '../types';

const router = Router();

// Create new session
router.post('/', async (_req: CreateSessionRequest, res) => {
  try {
    const sessionId = await createChatSession('new-session');

    const response: CreateSessionResponse = {
      sessionId: sessionId.sessionId,
      createdAt: sessionId.createdAt
    };

    logger.info(`Session created: ${sessionId.sessionId}`);
    res.status(201).json(response);
  } catch (error) {
    logger.error('Error creating session:', error);
    res.status(500).json({
      error: 'Session Creation Failed',
      message: 'Failed to create new session',
      code: 'SESSION_CREATION_ERROR',
      timestamp: new Date().toISOString()
    });
  }
});

// Get session history
router.get('/:sessionId', validateSession, async (req, res) => {
  try {
    const sessionId = req.params['sessionId'];
    if (!sessionId) {
      return res.status(400).json({
        error: 'Session ID Required',
        message: 'Session ID is required',
        code: 'SESSION_ID_REQUIRED',
        timestamp: new Date().toISOString()
      });
    }
    const session = await getSession(sessionId);

    if (!session) {
      return res.status(404).json({
        error: 'Session Not Found',
        message: `Session ${sessionId} not found`,
        code: 'SESSION_NOT_FOUND',
        timestamp: new Date().toISOString()
      });
    }

    const response: ChatHistoryResponse = {
      sessionId: session.sessionId,
      messages: session.messages,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt
    };

    logger.info(`Session history retrieved: ${sessionId}`);
    return res.status(200).json(response);
  } catch (error) {
    logger.error('Error getting session history:', error);
    return res.status(500).json({
      error: 'Session Retrieval Failed',
      message: 'Failed to retrieve session history',
      code: 'SESSION_RETRIEVAL_ERROR',
      timestamp: new Date().toISOString()
    });
  }
});

// Update session
router.put('/:sessionId', validateSession, async (req, res) => {
  try {
    const sessionId = req.params['sessionId'];
    if (!sessionId) {
      return res.status(400).json({
        error: 'Session ID Required',
        message: 'Session ID is required',
        code: 'SESSION_ID_REQUIRED',
        timestamp: new Date().toISOString()
      });
    }
    const updates = req.body;

    await updateChatSession(sessionId, updates);

    logger.info(`Session updated: ${sessionId}`);
    return res.status(200).json({
      message: 'Session updated successfully',
      sessionId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error updating session:', error);
    return res.status(500).json({
      error: 'Session Update Failed',
      message: 'Failed to update session',
      code: 'SESSION_UPDATE_ERROR',
      timestamp: new Date().toISOString()
    });
  }
});

// Delete session (soft delete - mark as inactive)
router.delete('/:sessionId', validateSession, async (req, res) => {
  try {
    const sessionId = req.params['sessionId'];
    if (!sessionId) {
      return res.status(400).json({
        error: 'Session ID Required',
        message: 'Session ID is required',
        code: 'SESSION_ID_REQUIRED',
        timestamp: new Date().toISOString()
      });
    }

    // Mark session as inactive
    await updateChatSession(sessionId, {
      lastActive: new Date()
    });

    logger.info(`Session marked as inactive: ${sessionId}`);
    return res.status(200).json({
      message: 'Session terminated successfully',
      sessionId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error terminating session:', error);
    return res.status(500).json({
      error: 'Session Termination Failed',
      message: 'Failed to terminate session',
      code: 'SESSION_TERMINATION_ERROR',
      timestamp: new Date().toISOString()
    });
  }
});

export { router as sessionRouter };
