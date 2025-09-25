import { Router } from 'express';
import { logger } from '../utils/logger.js';
import {
  importAllProducts,
  importCompanyInfo,
  updateProductFromWooCommerce,
  getWooCommerceProducts,
  getStoreInfo,
  testWooCommerceIntegration,
  getWooCommerceRateLimitStatus
} from '../services/woocommerce.js';
import {
  getAllProducts,
  getCompanyInfo,
  updateSyncMetadata
} from '../database/utils.js';
import { WooCommerceErrorType } from '../utils/woocommerce-errors.js';

const router = Router();

// Import all products from WooCommerce
router.post('/import-products', async (_req, res) => {
  try {
    logger.info('WooCommerce product import requested');

    const result = await importAllProducts();

    // Update sync metadata on successful import
    if (result.success > 0) {
      await updateSyncMetadata('woocommerce');
    }

    res.status(200).json({
      message: 'WooCommerce product import completed',
      success: result.success,
      errors: result.errors,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('WooCommerce product import failed:', error);
    res.status(500).json({
      error: 'WooCommerce Product Import Failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      code: 'WOOCOMMERCE_PRODUCT_IMPORT_ERROR',
      timestamp: new Date().toISOString()
    });
  }
});

// Import company information from WooCommerce
router.post('/import-company', async (_req, res) => {
  try {
    logger.info('WooCommerce company information import requested');

    const companyInfo = await importCompanyInfo();

    res.status(200).json({
      message: 'WooCommerce company information imported successfully',
      company: companyInfo,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('WooCommerce company information import failed:', error);
    res.status(500).json({
      error: 'WooCommerce Company Import Failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      code: 'WOOCOMMERCE_COMPANY_IMPORT_ERROR',
      timestamp: new Date().toISOString()
    });
  }
});

// Update specific product from WooCommerce
router.put('/update-product/:productId', async (req, res) => {
  try {
    const { productId } = req.params;

    if (!productId) {
      return res.status(400).json({
        error: 'Product ID Required',
        message: 'Product ID is required',
        code: 'WOOCOMMERCE_PRODUCT_ID_REQUIRED',
        timestamp: new Date().toISOString()
      });
    }

    logger.info(`WooCommerce product update requested: ${productId}`);

    const product = await updateProductFromWooCommerce(productId);

    if (!product) {
      return res.status(404).json({
        error: 'Product Not Found',
        message: `Product ${productId} not found in WooCommerce`,
        code: 'WOOCOMMERCE_PRODUCT_NOT_FOUND',
        timestamp: new Date().toISOString()
      });
    }

    return res.status(200).json({
      message: 'WooCommerce product updated successfully',
      product,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('WooCommerce product update failed:', error);
    return res.status(500).json({
      error: 'WooCommerce Product Update Failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      code: 'WOOCOMMERCE_PRODUCT_UPDATE_ERROR',
      timestamp: new Date().toISOString()
    });
  }
});

// Get all products from database
router.get('/products', async (_req, res) => {
  try {
    const products = await getAllProducts();

    res.status(200).json({
      products,
      count: products.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Failed to get WooCommerce products:', error);
    res.status(500).json({
      error: 'WooCommerce Product Retrieval Failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      code: 'WOOCOMMERCE_PRODUCT_RETRIEVAL_ERROR',
      timestamp: new Date().toISOString()
    });
  }
});

// Get products from WooCommerce (without importing)
router.get('/woocommerce-products', async (req, res) => {
  try {
    const limit = parseInt(req.query['limit'] as string) || 50;
    const products = await getWooCommerceProducts(limit);

    logger.info(`WooCommerce products retrieved: ${products.length} products`);

    res.status(200).json({
      products,
      count: products.length,
      limit,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Failed to get WooCommerce products:', error);
    res.status(500).json({
      error: 'WooCommerce Product Retrieval Failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      code: 'WOOCOMMERCE_PRODUCT_RETRIEVAL_ERROR',
      timestamp: new Date().toISOString()
    });
  }
});

// Get company information from database
router.get('/company', async (_req, res) => {
  try {
    const companyInfo = await getCompanyInfo('company');

    if (!companyInfo) {
      return res.status(404).json({
        error: 'Company Information Not Found',
        message: 'Company information not found in database',
        code: 'WOOCOMMERCE_COMPANY_NOT_FOUND',
        timestamp: new Date().toISOString()
      });
    }

    return res.status(200).json({
      company: companyInfo,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Failed to get WooCommerce company information:', error);
    return res.status(500).json({
      error: 'WooCommerce Company Retrieval Failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      code: 'WOOCOMMERCE_COMPANY_RETRIEVAL_ERROR',
      timestamp: new Date().toISOString()
    });
  }
});

// Get store information from WooCommerce
router.get('/store', async (_req, res) => {
  try {
    const storeInfo = await getStoreInfo();

    res.status(200).json({
      store: storeInfo,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Failed to get WooCommerce store information:', error);
    res.status(500).json({
      error: 'WooCommerce Store Information Retrieval Failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      code: 'WOOCOMMERCE_STORE_INFO_RETRIEVAL_ERROR',
      timestamp: new Date().toISOString()
    });
  }
});

// Test WooCommerce connection
router.get('/test', async (_req, res) => {
  try {
    const isConnected = await testWooCommerceIntegration();

    res.status(200).json({
      connected: isConnected,
      message: isConnected
        ? 'WooCommerce connection successful'
        : 'WooCommerce connection failed',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('WooCommerce connection test failed:', error);
    res.status(500).json({
      connected: false,
      error: 'WooCommerce Connection Test Failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      code: 'WOOCOMMERCE_CONNECTION_ERROR',
      timestamp: new Date().toISOString()
    });
  }
});

// Get rate limiter status
router.get('/rate-limit-status', async (_req, res) => {
  try {
    const status = getWooCommerceRateLimitStatus();

    res.status(200).json({
      rateLimitStatus: status,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Failed to get WooCommerce rate limit status:', error);
    res.status(500).json({
      error: 'WooCommerce Rate Limit Status Failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      code: 'WOOCOMMERCE_RATE_LIMIT_STATUS_ERROR',
      timestamp: new Date().toISOString()
    });
  }
});

// Get sync status
router.get('/sync-status', async (_req, res) => {
  try {
    // This would typically check the last sync time and status
    // For now, we'll return a basic status
    res.status(200).json({
      lastSync: null, // Would be populated from sync metadata
      status: 'idle',
      message: 'WooCommerce sync status retrieved',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Failed to get WooCommerce sync status:', error);
    res.status(500).json({
      error: 'WooCommerce Sync Status Failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      code: 'WOOCOMMERCE_SYNC_STATUS_ERROR',
      timestamp: new Date().toISOString()
    });
  }
});

// Health check endpoint
router.get('/health', async (_req, res) => {
  try {
    const isConnected = await testWooCommerceIntegration();
    const rateLimitStatus = getWooCommerceRateLimitStatus();

    res.status(200).json({
      status: isConnected ? 'healthy' : 'unhealthy',
      connected: isConnected,
      rateLimitStatus,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('WooCommerce health check failed:', error);
    res.status(500).json({
      status: 'unhealthy',
      error: 'WooCommerce Health Check Failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      code: 'WOOCOMMERCE_HEALTH_CHECK_ERROR',
      timestamp: new Date().toISOString()
    });
  }
});

// Debug endpoint to test raw API response
router.get('/debug-raw', async (_req, res) => {
  try {
    const { makeWooCommerceRequest } = await import('../config/woocommerce.js');

    logger.info('Testing raw WooCommerce API call...');
    const response = await makeWooCommerceRequest('/products?per_page=1');

    res.status(200).json({
      success: true,
      rawResponse: response,
      responseType: typeof response,
      isArray: Array.isArray(response),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Raw API test failed:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

export { router as woocommerceRouter };
