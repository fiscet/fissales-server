import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getChatSession, createChatSession } from '../database/utils';
import { logger } from '../utils/logger';

// Extend Request interface to include session
declare global {
  namespace Express {
    interface Request {
      sessionId?: string;
      chatSession?: any;
    }
  }
}

// Session management middleware
export const sessionMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let sessionId = req.headers['x-session-id'] as string;

    // If no session ID provided, create a new one
    if (!sessionId) {
      sessionId = uuidv4();
      logger.info(`New session created: ${sessionId}`);
    }

    // Try to get existing session
    let session = await getChatSession(sessionId);

    // If session doesn't exist, create it
    if (!session) {
      session = await createChatSession(sessionId);
      logger.info(`New chat session created: ${sessionId}`);
    }

    // Attach session info to request
    req.sessionId = sessionId;
    req.chatSession = session;

    // Add session ID to response headers
    res.setHeader('X-Session-ID', sessionId);

    next();
  } catch (error) {
    logger.error('Session middleware error:', error);
    next(error);
  }
};

// Session validation middleware
export const validateSession = (req: Request, res: Response, next: NextFunction) => {
  if (!req.sessionId) {
    return res.status(400).json({
      error: 'Session Required',
      message: 'Session ID is required',
      code: 'SESSION_REQUIRED',
      timestamp: new Date().toISOString()
    });
  }
  return next();
};

// Session cleanup middleware (for session termination)
export const cleanupSession = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const sessionId = req.sessionId;

    if (sessionId) {
      // Update session with final activity
      const session = await getChatSession(sessionId);
      if (session) {
        // Mark session as inactive (you might want to implement actual deletion)
        logger.info(`Session cleanup requested: ${sessionId}`);
      }
    }

    next();
  } catch (error) {
    logger.error('Session cleanup error:', error);
    next(error);
  }
};

// Session activity tracking
export const trackSessionActivity = async (req: Request, res: Response, next: NextFunction) => {
  const originalSend = res.send;

  res.send = function (data) {
    // Track session activity before sending response
    if (req.sessionId) {
      logger.debug(`Session activity: ${req.sessionId} - ${req.method} ${req.path}`);
    }

    return originalSend.call(this, data);
  };

  next();
};
