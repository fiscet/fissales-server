import { logger } from '../utils/logger.js';

// Shopify configuration - lazy loading
const getShopifyConfig = () => ({
  shopUrl: process.env['WEBSHOP_URL'],
  accessToken: process.env['API_TOKEN'],
  apiVersion: process.env['SHOPIFY_API_VERSION'] || '2024-01',
});

// Validate Shopify configuration
const validateShopifyConfig = () => {
  const shopifyConfig = getShopifyConfig();
  const errors: string[] = [];

  // Debug: Log environment variables
  logger.info('Shopify config debug:', {
    WEBSHOP_URL: process.env['WEBSHOP_URL'],
    API_TOKEN: process.env['API_TOKEN'] ? '***SET***' : 'NOT SET',
    SHOPIFY_API_VERSION: process.env['SHOPIFY_API_VERSION'],
    shopUrl: shopifyConfig.shopUrl,
    accessToken: shopifyConfig.accessToken ? '***SET***' : 'NOT SET',
    apiVersion: shopifyConfig.apiVersion
  });

  if (!shopifyConfig.shopUrl) {
    errors.push('WEBSHOP_URL is required');
  }

  if (!shopifyConfig.accessToken) {
    errors.push('API_TOKEN is required');
  }

  if (errors.length > 0) {
    throw new Error(`Shopify configuration errors: ${errors.join(', ')}`);
  }

  // Validate shop URL format
  if (!shopifyConfig.shopUrl?.includes('.myshopify.com')) {
    throw new Error('WEBSHOP_URL must be a valid Shopify store URL (e.g., https://your-store.myshopify.com)');
  }

  logger.info('Shopify configuration validated successfully');
  return shopifyConfig;
};

// Get Shopify API base URL
const getShopifyApiUrl = () => {
  const config = validateShopifyConfig();
  return `https://${config.shopUrl!.replace(/^https?:\/\//, '')}/admin/api/${config.apiVersion}`;
};

// Get Shopify API headers
const getShopifyHeaders = () => {
  const config = validateShopifyConfig();
  return {
    'Content-Type': 'application/json',
    'X-Shopify-Access-Token': config.accessToken!,
  };
};

// Test Shopify API connection
const testShopifyConnection = async (): Promise<boolean> => {
  try {
    const apiUrl = getShopifyApiUrl();
    const headers = getShopifyHeaders();

    const response = await fetch(`${apiUrl}/shop.json`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`Shopify API error: ${response.status} ${response.statusText}`);
    }

    const shopData = await response.json() as any;
    logger.info('Shopify connection test successful', {
      shopName: shopData.shop?.name,
      shopDomain: shopData.shop?.domain,
    });

    return true;
  } catch (error) {
    logger.error('Shopify connection test failed:', error);
    return false;
  }
};

// Rate limiting helper
class ShopifyRateLimiter {
  private requestCount = 0;
  private windowStart = Date.now();
  private readonly maxRequests = 40; // Shopify allows 40 requests per second
  private readonly windowMs = 1000; // 1 second window

  async checkRateLimit(): Promise<void> {
    const now = Date.now();

    // Reset window if expired
    if (now - this.windowStart >= this.windowMs) {
      this.requestCount = 0;
      this.windowStart = now;
    }

    // Check if we're at the limit
    if (this.requestCount >= this.maxRequests) {
      const waitTime = this.windowMs - (now - this.windowStart);
      logger.warn(`Rate limit reached, waiting ${waitTime}ms`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      this.requestCount = 0;
      this.windowStart = Date.now();
    }

    this.requestCount++;
  }
}

// Create rate limiter instance
const rateLimiter = new ShopifyRateLimiter();

// Make authenticated Shopify API request
const makeShopifyRequest = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<any> => {
  try {
    await rateLimiter.checkRateLimit();

    const apiUrl = getShopifyApiUrl();
    const headers = getShopifyHeaders();

    const response = await fetch(`${apiUrl}${endpoint}`, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Shopify API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json() as any;
    logger.debug(`Shopify API request successful: ${endpoint}`);
    return data;
  } catch (error) {
    logger.error(`Shopify API request failed: ${endpoint}`, error);
    throw error;
  }
};

export {
  validateShopifyConfig,
  getShopifyApiUrl,
  getShopifyHeaders,
  testShopifyConnection,
  makeShopifyRequest,
  getShopifyConfig,
};
