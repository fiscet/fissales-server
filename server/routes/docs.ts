import { Router } from 'express';
import { logger } from '../utils/logger';

const router = Router();

// API documentation endpoint
router.get('/', (req, res) => {
  try {
    const apiDocs = {
      title: 'FisAiSalesServer API Documentation',
      version: '1.0.0',
      description: 'AI-powered sales server with multi-agent system',
      baseUrl: `${req.protocol}://${req.get('host')}`,
      endpoints: {
        health: {
          'GET /api/health': 'Health check endpoint',
          'GET /api/health/detailed': 'Detailed health check with system info'
        },
        chat: {
          'POST /api/chat': 'Send message to AI agents',
          'GET /api/chat/history': 'Get chat history for session',
          'DELETE /api/chat/history': 'Clear chat history',
          'GET /api/chat/session': 'Get session info',
          'POST /api/chat/test': 'Test AI agents (no history save)'
        },
        shopify: {
          'POST /api/shopify/import-products':
            'Import all products from Shopify',
          'POST /api/shopify/import-company':
            'Import company info from Shopify',
          'PUT /api/shopify/update-product/:productId':
            'Update specific product',
          'GET /api/shopify/products': 'Get all products from database',
          'GET /api/shopify/shopify-products': 'Get products from Shopify',
          'GET /api/shopify/company': 'Get company info from database',
          'GET /api/shopify/shop': 'Get shop info from Shopify',
          'GET /api/shopify/test': 'Test Shopify connection'
        },
        products: {
          'PUT /api/products/:productId/description-extra':
            'Update product descriptionExtra field',
          'POST /api/products/sync-to-qdrant':
            'Sync all products from Firestore to Qdrant',
          'POST /api/products/:productId/sync-to-qdrant':
            'Sync single product to Qdrant',
          'POST /api/products/search':
            'Search products in Qdrant using vector similarity'
        }
      },
      features: {
        'Multi-Agent System': 'AI agents for different conversation types',
        'Product Search': 'Keyword-based product search and recommendations',
        'Session Management': 'Anonymous session tracking',
        'Shopify Integration': 'Product and company data synchronization',
        'Chat History': 'Persistent conversation history',
        'Health Monitoring': 'System health and service status'
      },
      agents: {
        FrontendAgent: 'Intent detection and message analysis',
        HistoryAgent: 'Chat history management',
        CompanyAgent: 'Company information handling',
        PreSalesAgent: 'Initial sales interaction',
        SalesAgent: 'Sales conversation handling',
        RagAgent: 'Product search and recommendations'
      },
      environment: {
        required: [
          'FIREBASE_PROJECT_ID',
          'FIREBASE_PRIVATE_KEY',
          'FIREBASE_CLIENT_EMAIL',
          'WEBSHOP_URL',
          'API_TOKEN'
        ],
        optional: ['SHOPIFY_API_VERSION', 'PORT', 'NODE_ENV']
      },
      examples: {
        'Chat with AI': {
          method: 'POST',
          url: '/api/chat',
          body: {
            message: "I'm looking for products"
          },
          response: {
            response:
              "I'd be happy to help you find the perfect products! What specific type of product are you looking for?",
            sessionId: 'session-123',
            timestamp: '2024-01-01T00:00:00.000Z'
          }
        },
        'Import Products': {
          method: 'POST',
          url: '/api/shopify/import-products',
          response: {
            message: 'Product import completed',
            success: 50,
            errors: 0,
            timestamp: '2024-01-01T00:00:00.000Z'
          }
        },
        'Update Product Description': {
          method: 'PUT',
          url: '/api/products/123/description-extra',
          body: {
            descriptionExtra: 'Additional product details and features'
          },
          response: {
            message: 'Product description extra updated successfully',
            productId: '123',
            descriptionExtra: 'Additional product details and features',
            timestamp: '2024-01-01T00:00:00.000Z'
          }
        },
        'Search Products': {
          method: 'POST',
          url: '/api/products/search',
          body: {
            query: 'smartphone with good camera',
            limit: 5,
            filter: { price: { $lt: 1000 } }
          },
          response: {
            query: 'smartphone with good camera',
            results: [
              {
                id: 'result1',
                score: 0.95,
                product: {
                  id: '123',
                  name: 'Premium Smartphone',
                  description: 'High-end smartphone',
                  descriptionExtra: 'Excellent camera quality',
                  price: 899,
                  stock: 10
                }
              }
            ],
            count: 1,
            timestamp: '2024-01-01T00:00:00.000Z'
          }
        }
      }
    };

    logger.info('API documentation requested', {
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.status(200).json(apiDocs);
  } catch (error) {
    logger.error('API documentation error:', error);
    res.status(500).json({
      error: 'Documentation Generation Failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      code: 'DOCS_GENERATION_ERROR',
      timestamp: new Date().toISOString()
    });
  }
});

export { router as docsRouter };
