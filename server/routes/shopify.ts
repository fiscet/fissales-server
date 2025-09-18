import { Router } from 'express';
import { logger } from '../utils/logger';
import {
  importAllProducts,
  importCompanyInfo,
  updateProductFromShopify,
  getShopifyProducts,
  getShopInfo,
  testShopifyIntegration
} from '../services/shopify';
import {
  getAllProducts,
  getCompanyInfo,
  updateSyncMetadata
} from '../database/utils';

const router = Router();

// Import all products from Shopify
router.post('/import-products', async (_req, res) => {
  try {
    logger.info('Product import requested');

    const result = await importAllProducts();

    // Update sync metadata on successful import
    if (result.success > 0) {
      await updateSyncMetadata('shopify');
    }

    res.status(200).json({
      message: 'Product import completed',
      success: result.success,
      errors: result.errors,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Product import failed:', error);
    res.status(500).json({
      error: 'Product Import Failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      code: 'PRODUCT_IMPORT_ERROR',
      timestamp: new Date().toISOString()
    });
  }
});

// Import company information from Shopify
router.post('/import-company', async (_req, res) => {
  try {
    logger.info('Company information import requested');

    const companyInfo = await importCompanyInfo();

    res.status(200).json({
      message: 'Company information imported successfully',
      company: companyInfo,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Company information import failed:', error);
    res.status(500).json({
      error: 'Company Import Failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      code: 'COMPANY_IMPORT_ERROR',
      timestamp: new Date().toISOString()
    });
  }
});

// Update specific product from Shopify
router.put('/update-product/:productId', async (req, res) => {
  try {
    const { productId } = req.params;

    if (!productId) {
      return res.status(400).json({
        error: 'Product ID Required',
        message: 'Product ID is required',
        code: 'PRODUCT_ID_REQUIRED',
        timestamp: new Date().toISOString()
      });
    }

    logger.info(`Product update requested: ${productId}`);

    const product = await updateProductFromShopify(productId);

    if (!product) {
      return res.status(404).json({
        error: 'Product Not Found',
        message: `Product ${productId} not found in Shopify`,
        code: 'PRODUCT_NOT_FOUND',
        timestamp: new Date().toISOString()
      });
    }

    return res.status(200).json({
      message: 'Product updated successfully',
      product,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Product update failed:', error);
    return res.status(500).json({
      error: 'Product Update Failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      code: 'PRODUCT_UPDATE_ERROR',
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
    logger.error('Failed to get products:', error);
    res.status(500).json({
      error: 'Product Retrieval Failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      code: 'PRODUCT_RETRIEVAL_ERROR',
      timestamp: new Date().toISOString()
    });
  }
});

// Get products from Shopify (without importing)
router.get('/shopify-products', async (req, res) => {
  try {
    const limit = parseInt(req.query['limit'] as string) || 50;
    const products = await getShopifyProducts(limit);

    res.status(200).json({
      products,
      count: products.length,
      limit,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Failed to get Shopify products:', error);
    res.status(500).json({
      error: 'Shopify Product Retrieval Failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      code: 'SHOPIFY_PRODUCT_RETRIEVAL_ERROR',
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
        code: 'COMPANY_NOT_FOUND',
        timestamp: new Date().toISOString()
      });
    }

    return res.status(200).json({
      company: companyInfo,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Failed to get company information:', error);
    return res.status(500).json({
      error: 'Company Retrieval Failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      code: 'COMPANY_RETRIEVAL_ERROR',
      timestamp: new Date().toISOString()
    });
  }
});

// Get shop information from Shopify
router.get('/shop', async (_req, res) => {
  try {
    const shopInfo = await getShopInfo();

    res.status(200).json({
      shop: shopInfo,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Failed to get shop information:', error);
    res.status(500).json({
      error: 'Shop Information Retrieval Failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      code: 'SHOP_INFO_RETRIEVAL_ERROR',
      timestamp: new Date().toISOString()
    });
  }
});

// Test Shopify connection
router.get('/test', async (_req, res) => {
  try {
    const isConnected = await testShopifyIntegration();

    res.status(200).json({
      connected: isConnected,
      message: isConnected
        ? 'Shopify connection successful'
        : 'Shopify connection failed',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Shopify connection test failed:', error);
    res.status(500).json({
      connected: false,
      error: 'Connection Test Failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      code: 'SHOPIFY_CONNECTION_ERROR',
      timestamp: new Date().toISOString()
    });
  }
});

export { router as shopifyRouter };
