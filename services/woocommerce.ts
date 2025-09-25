import {
  makeWooCommerceRequest,
  testWooCommerceConnection,
  getRateLimiterStatus,
  getWooCommerceConfig
} from '../config/woocommerce.js';
import {
  createProduct,
  updateProduct,
  createCompanyInfo
} from '../database/utils.js';
import { Product, CompanyInfo } from '../types/index.js';
import { logger } from '../utils/logger.js';

// WooCommerce product interface
interface WooCommerceProduct {
  id: number;
  name: string;
  description: string;
  short_description: string;
  price: string;
  regular_price: string;
  sale_price: string;
  stock_quantity: number;
  stock_status: string;
  images: Array<{ src: string; alt: string; }>;
  permalink: string;
  categories: Array<{ id: number; name: string; }>;
  attributes: Array<{
    id: number;
    name: string;
    options: string[];
  }>;
  variations: number[];
  status: string;
  featured: boolean;
  date_created: string;
  date_modified: string;
}

// WooCommerce store information interface
interface WooCommerceStoreInfo {
  name: string;
  description: string;
  url: string;
  address: {
    address_1: string;
    address_2: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
  };
  currency: string;
  timezone: string;
  language: string;
  date_format: string;
  time_format: string;
}

// Import all products from WooCommerce
export const importAllProducts = async (): Promise<{
  success: number;
  errors: number;
}> => {
  // Start product import

  let successCount = 0;
  let errorCount = 0;
  let page = 1;
  const perPage = 50; // WooCommerce default pagination

  try {
    logger.info('Starting product import from WooCommerce...');

    while (true) {
      try {
        // Get products from WooCommerce with pagination
        const response = await makeWooCommerceRequest(`/products?page=${page}&per_page=${perPage}`);

        logger.info(`WooCommerce API response for page ${page}: ${Array.isArray(response) ? response.length : 0} products`);

        const products = response || [];

        if (products.length === 0) {
          logger.info(`No products found on page ${page}, stopping import`);
          break; // No more products
        }

        // Process each product
        for (const wooCommerceProduct of products) {
          try {
            const product = mapWooCommerceProductToInternal(wooCommerceProduct);
            await createProduct(product);
            successCount++;
            // Product imported successfully
          } catch (error) {
            errorCount++;
            logger.error(`Failed to import product ${wooCommerceProduct.id}:`, error);
          }
        }

        // Check if we have more pages
        if (products.length < perPage) {
          break; // Last page
        }

        page++;
      } catch (error) {
        errorCount++;
        logger.error(`Failed to fetch products page ${page}:`, error);
        break;
      }
    }

    logger.info(`WooCommerce product import completed: ${successCount} successful, ${errorCount} errors`);
    return { success: successCount, errors: errorCount };
  } catch (error) {
    logger.error('WooCommerce product import failed:', error);
    throw error;
  }
};

// Import company information from WooCommerce
export const importCompanyInfo = async (): Promise<CompanyInfo | null> => {
  try {
    logger.info('Importing company information from WooCommerce...');

    // Since settings endpoints require special permissions,
    // we'll create basic company info from configuration
    const config = getWooCommerceConfig();
    const companyInfo: CompanyInfo = {
      id: 'company',
      name: 'WooCommerce Store',
      description: 'WooCommerce store connected via API',
      policies: [], // WooCommerce doesn't have built-in policies like Shopify
      contactInfo: {
        email: '',
        phone: '',
        website: config.url,
        address: {
          address1: '',
          address2: '',
          city: '',
          province: '',
          country: '',
          zip: ''
        },
        currency: 'USD',
        timezone: 'UTC',
        language: 'en'
      },
      updatedAt: new Date()
    };

    await createCompanyInfo(companyInfo);

    logger.info('WooCommerce company information imported successfully');
    return companyInfo;
  } catch (error) {
    logger.error('WooCommerce company information import failed:', error);
    throw error;
  }
};

// Update specific product from WooCommerce
export const updateProductFromWooCommerce = async (
  productId: string
): Promise<Product | null> => {
  try {
    logger.info(`Updating product from WooCommerce: ${productId}`);

    const response = await makeWooCommerceRequest(`/products/${productId}`);

    if (!response) {
      throw new Error(`Product ${productId} not found in WooCommerce`);
    }

    const product = mapWooCommerceProductToInternal(response);
    await updateProduct(productId, product);

    logger.info(`WooCommerce product updated successfully: ${product.name}`);
    return product;
  } catch (error) {
    logger.error(`Failed to update product ${productId}:`, error);
    throw error;
  }
};

// Get product list from WooCommerce (without importing)
export const getWooCommerceProducts = async (
  limit: number = 50
): Promise<WooCommerceProduct[]> => {
  try {
    logger.info(`Attempting to fetch WooCommerce products with limit: ${limit}`);

    const response = await makeWooCommerceRequest(`/products?per_page=${limit}`);

    logger.info(`WooCommerce products retrieved: ${Array.isArray(response) ? response.length : 0} products`);

    return response || [];
  } catch (error) {
    logger.error('Failed to get WooCommerce products:', error);
    throw error;
  }
};

// Get store information from WooCommerce
export const getStoreInfo = async (): Promise<WooCommerceStoreInfo | null> => {
  try {
    // Since settings endpoints require special permissions, 
    // we'll create a basic store info response
    const config = getWooCommerceConfig();

    return {
      name: 'WooCommerce Store',
      description: 'WooCommerce store connected via API',
      url: config.url,
      address: {
        address_1: '',
        address_2: '',
        city: '',
        state: '',
        postcode: '',
        country: ''
      },
      currency: 'USD',
      timezone: 'UTC',
      language: 'en',
      date_format: 'Y-m-d',
      time_format: 'H:i:s'
    };
  } catch (error) {
    logger.error('Failed to get WooCommerce store information:', error);
    throw error;
  }
};

// Test WooCommerce integration
export const testWooCommerceIntegration = async (): Promise<boolean> => {
  try {
    const isConnected = await testWooCommerceConnection();
    return isConnected;
  } catch (error) {
    logger.error('WooCommerce connection test failed:', error);
    return false;
  }
};

// Get rate limiter status
export const getWooCommerceRateLimitStatus = () => {
  return getRateLimiterStatus();
};

// Helper function to map WooCommerce product to internal Product model
const mapWooCommerceProductToInternal = (wooCommerceProduct: WooCommerceProduct): Product => {
  try {

    // Validate required fields
    if (!wooCommerceProduct.id) {
      throw new Error('Product ID is required');
    }
    if (!wooCommerceProduct.name) {
      throw new Error('Product name is required');
    }

    // Map basic fields
    const product: Product = {
      id: wooCommerceProduct.id.toString(),
      name: wooCommerceProduct.name,
      description: wooCommerceProduct.description || '',
      descriptionExtra: '', // Skip short description import
      price: parseFloat(wooCommerceProduct.price || '0'),
      stock: parseInt(wooCommerceProduct.stock_quantity?.toString() || '0'),
      imageUrl: wooCommerceProduct.images?.[0]?.src || '',
      productUrl: wooCommerceProduct.permalink || ''
    };

    // Validate price
    if (isNaN(product.price) || product.price < 0) {
      logger.warn(`Invalid price for product ${product.id}: ${wooCommerceProduct.price}`);
      product.price = 0;
    }

    // Validate stock
    if (isNaN(product.stock) || product.stock < 0) {
      logger.warn(`Invalid stock for product ${product.id}: ${wooCommerceProduct.stock_quantity}`);
      product.stock = 0;
    }

    // Validate image URL
    if (product.imageUrl && !isValidUrl(product.imageUrl)) {
      logger.warn(`Invalid image URL for product ${product.id}: ${product.imageUrl}`);
      product.imageUrl = '';
    }

    return product;
  } catch (error) {
    logger.error(`Failed to map WooCommerce product ${wooCommerceProduct.id}:`, error);
    throw new Error(`Failed to map product ${wooCommerceProduct.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Helper function to validate URL
const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Export types for external use
export type { WooCommerceProduct, WooCommerceStoreInfo };
