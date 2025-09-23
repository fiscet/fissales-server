import { Router } from 'express';
import { logger } from '../utils/logger.js';
import { getMastra } from '../ai/mastra.js';
import { RuntimeContext } from '@mastra/core/runtime-context';
import { getCompanyInfoCached, invalidateCompanyInfoCache } from '../utils/company-cache.js';
import { MastraContext } from '../types/index.js';
import { PromptLoader } from '../ai/utils/prompt-loader.js';

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

    // Initialize response variables
    let responseText = '';
    let recommendedProducts = [];
    let reasoning = '';

    // Use the main network with runtime context and memory
    const network = mastra.vnext_getNetwork('mainNetwork');

    if (!network) {
      logger.error('Network not found', { networkId: 'mainNetwork' });
      return res.status(500).json({
        error: 'Network Not Found',
        message: 'Main network is not available',
        code: 'NETWORK_NOT_FOUND',
        timestamp: new Date().toISOString()
      });
    }

    logger.info('Network found, generating response', {
      networkId: 'mainNetwork',
      networkName: network.name
    });

    try {
      const response = await network.generate(message, {
        runtimeContext,
      });

      // Handle different response types
      if (response?.result) {
        // Try to parse as workflow result first
        try {
          const workflowResult = JSON.parse(response.result);
          if (workflowResult.runResult) {
            // Workflow response with runResult
            responseText = workflowResult.runResult.salesResponse || 'Thank you for your interest!';
            recommendedProducts = workflowResult.runResult.recommendedProducts || [];
            reasoning = workflowResult.runResult.reasoning || '';
          } else if (workflowResult.salesResponse || workflowResult.recommendedProducts) {
            // Direct workflow response
            responseText = workflowResult.salesResponse || 'Thank you for your interest!';
            recommendedProducts = workflowResult.recommendedProducts || [];
            reasoning = workflowResult.reasoning || '';
          } else {
            // Plain text response
            responseText = response.result;
          }
        } catch (error) {
          // If parsing fails, treat as plain text
          responseText = response.result;
        }
      } else if (response?.result) {
        // Agent response
        responseText = response.result;
      } else {
        responseText = 'Thank you for your interest!';
      }
    } catch (networkError) {
      logger.error('Network execution failed, falling back to workflow', {
        error: networkError instanceof Error ? networkError.message : 'Unknown error'
      });

      // Fallback to direct workflow execution
      const workflow = mastra.getWorkflow('salesFunnelWorkflow');

      if (workflow) {
        logger.info('Executing workflow directly as fallback');

        const run = await workflow.createRunAsync();
        const result = await run.start({
          inputData: {
            customerMessage: message,
            sessionId: sessionId,
            userId: userId || 'anonymous'
          },
        });

        if (result && result.status === 'success' && result.result) {
          const workflowResult = result.result;
          responseText = workflowResult.salesResponse || 'Thank you for your interest!';
          recommendedProducts = workflowResult.recommendedProducts || [];
          reasoning = workflowResult.reasoning || '';
        } else {
          responseText = 'Thank you for your interest!';
        }
      } else {
        responseText = 'Thank you for your interest!';
      }
    }

    logger.info('Chat response generated', {
      sessionId,
      userId: userId || 'anonymous',
      responseLength: responseText.length
    });

    return res.status(200).json({
      response: responseText,
      recommendedProducts,
      reasoning,
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

// Cache clearing endpoint for development
router.post('/clear-cache', async (req, res) => {
  try {
    // Clear prompt cache
    PromptLoader.clearCache();

    // Clear company cache
    invalidateCompanyInfoCache();

    logger.info('Caches cleared successfully');

    return res.status(200).json({
      message: 'Caches cleared successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Failed to clear caches:', error);
    return res.status(500).json({
      error: 'Failed to clear caches',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

export { router as chatRouter };
