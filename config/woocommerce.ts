import { logger } from '../utils/logger.js';
import crypto from 'crypto';

// WooCommerce configuration interface
interface WooCommerceConfig {
  url: string;
  consumerKey: string;
  consumerSecret: string;
  apiVersion: string;
  verifySSL: boolean;
  timeout: number;
}

// WooCommerce configuration - lazy loading
const getWooCommerceConfig = (): WooCommerceConfig => ({
  url: process.env['WOOCOMMERCE_URL'] || '',
  consumerKey: process.env['WOOCOMMERCE_CONSUMER_KEY'] || '',
  consumerSecret: process.env['WOOCOMMERCE_CONSUMER_SECRET'] || '',
  apiVersion: process.env['WOOCOMMERCE_API_VERSION'] || 'wc/v3',
  verifySSL: process.env['WOOCOMMERCE_VERIFY_SSL'] !== 'false',
  timeout: parseInt(process.env['WOOCOMMERCE_TIMEOUT'] || '30000')
});

// Validate WooCommerce configuration
const validateWooCommerceConfig = (): WooCommerceConfig => {
  const config = getWooCommerceConfig();
  const errors: string[] = [];

  // Debug: Log environment variables
  logger.info('WooCommerce config debug:', {
    WOOCOMMERCE_URL: process.env['WOOCOMMERCE_URL'],
    WOOCOMMERCE_CONSUMER_KEY: process.env['WOOCOMMERCE_CONSUMER_KEY'] ? '***SET***' : 'NOT SET',
    WOOCOMMERCE_CONSUMER_SECRET: process.env['WOOCOMMERCE_CONSUMER_SECRET'] ? '***SET***' : 'NOT SET',
    WOOCOMMERCE_API_VERSION: process.env['WOOCOMMERCE_API_VERSION'],
    WOOCOMMERCE_VERIFY_SSL: process.env['WOOCOMMERCE_VERIFY_SSL'],
    WOOCOMMERCE_TIMEOUT: process.env['WOOCOMMERCE_TIMEOUT'],
    url: config.url,
    consumerKey: config.consumerKey ? '***SET***' : 'NOT SET',
    consumerSecret: config.consumerSecret ? '***SET***' : 'NOT SET',
    apiVersion: config.apiVersion,
    verifySSL: config.verifySSL,
    timeout: config.timeout
  });

  if (!config.url) {
    errors.push('WOOCOMMERCE_URL is required');
  }

  if (!config.consumerKey) {
    errors.push('WOOCOMMERCE_CONSUMER_KEY is required');
  }

  if (!config.consumerSecret) {
    errors.push('WOOCOMMERCE_CONSUMER_SECRET is required');
  }

  if (errors.length > 0) {
    throw new Error(`WooCommerce configuration errors: ${errors.join(', ')}`);
  }

  // Validate URL format
  try {
    const url = new URL(config.url);
    if (!['http:', 'https:'].includes(url.protocol)) {
      throw new Error('Invalid protocol');
    }
  } catch (error) {
    throw new Error('WOOCOMMERCE_URL must be a valid URL (e.g., https://your-store.com)');
  }

  // Validate consumer key format
  if (!config.consumerKey.startsWith('ck_')) {
    throw new Error('WOOCOMMERCE_CONSUMER_KEY must start with "ck_"');
  }

  // Validate consumer secret format
  if (!config.consumerSecret.startsWith('cs_')) {
    throw new Error('WOOCOMMERCE_CONSUMER_SECRET must start with "cs_"');
  }

  logger.info('WooCommerce configuration validated successfully');
  return config;
};

// Get WooCommerce API base URL
const getWooCommerceApiUrl = (): string => {
  const config = validateWooCommerceConfig();
  const baseUrl = config.url.replace(/\/$/, ''); // Remove trailing slash
  return `${baseUrl}/wp-json/${config.apiVersion}`;
};

// OAuth 1.0a signature generation
const generateOAuthSignature = (
  method: string,
  url: string,
  params: Record<string, string>,
  consumerSecret: string
): string => {
  // Sort parameters
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&');

  // Create signature base string
  const signatureBaseString = [
    method.toUpperCase(),
    encodeURIComponent(url),
    encodeURIComponent(sortedParams)
  ].join('&');

  // Generate signature
  const signature = crypto
    .createHmac('sha1', `${consumerSecret}&`)
    .update(signatureBaseString)
    .digest('base64');

  return signature;
};

// Generate OAuth 1.0a parameters
const generateOAuthParams = (consumerKey: string): Record<string, string> => {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const nonce = crypto.randomBytes(16).toString('hex');

  return {
    oauth_consumer_key: consumerKey,
    oauth_nonce: nonce,
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: timestamp,
    oauth_version: '1.0'
  };
};

// Get WooCommerce API URL with OAuth 1.0a query parameters
const getWooCommerceUrlWithOAuth = (method: string = 'GET', endpoint: string = ''): string => {
  const config = validateWooCommerceConfig();
  const apiUrl = getWooCommerceApiUrl();
  const fullUrl = `${apiUrl}${endpoint}`;

  // Parse query parameters from endpoint
  const urlParts = endpoint.split('?');
  const baseEndpoint = urlParts[0];
  const queryString = urlParts[1] || '';

  // Generate OAuth parameters
  const oauthParams = generateOAuthParams(config.consumerKey);

  // Add existing query parameters to OAuth params
  if (queryString) {
    const queryParams = new URLSearchParams(queryString);
    for (const [key, value] of queryParams.entries()) {
      oauthParams[key] = value;
    }
  }

  // Use base URL without query parameters for signature
  const baseUrl = `${apiUrl}${baseEndpoint}`;
  const signature = generateOAuthSignature(
    method,
    baseUrl,
    oauthParams,
    config.consumerSecret
  );

  // Add OAuth signature to parameters
  oauthParams.oauth_signature = signature;

  // Build URL with OAuth parameters as query parameters
  const oauthQueryString = new URLSearchParams(oauthParams).toString();
  return `${baseUrl}?${oauthQueryString}`;
};

// Get WooCommerce API headers (no OAuth in headers, OAuth is in URL)
const getWooCommerceHeaders = (method: string = 'GET', endpoint: string = ''): Headers => {
  return new Headers({
    'Content-Type': 'application/json',
    'User-Agent': 'Fissales-WooCommerce-Integration/1.0'
  });
};

// Test WooCommerce API connection
const testWooCommerceConnection = async (): Promise<boolean> => {
  try {
    const apiUrl = getWooCommerceApiUrl();

    // Try multiple endpoints to test connection
    const endpoints = ['/products?per_page=1', '/settings', '/system_status'];

    for (const endpoint of endpoints) {
      try {
        const headers = getWooCommerceHeaders('GET', endpoint);
        const response = await fetch(`${apiUrl}${endpoint}`, {
          method: 'GET',
          headers
        });

        if (response.ok) {
          const data = (await response.json()) as any;
          logger.info('WooCommerce connection test successful', {
            endpoint,
            storeName: data.settings?.store_name || 'Connected',
            storeUrl: data.settings?.store_url || 'Unknown'
          });
          return true;
        }
      } catch (endpointError) {
        logger.debug(`Endpoint ${endpoint} failed, trying next...`);
        continue;
      }
    }

    throw new Error('All connection test endpoints failed');
  } catch (error) {
    logger.error('WooCommerce connection test failed:', error);
    return false;
  }
};

// Rate limiting helper for WooCommerce
class WooCommerceRateLimiter {
  private requestCount = 0;
  private windowStart = Date.now();
  private readonly maxRequests = 100; // WooCommerce allows 100 requests per 15 minutes
  private readonly windowMs = 15 * 60 * 1000; // 15 minutes window

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
      logger.warn(`WooCommerce rate limit reached, waiting ${waitTime}ms`);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
      this.requestCount = 0;
      this.windowStart = Date.now();
    }

    this.requestCount++;
  }

  getRemainingRequests(): number {
    const now = Date.now();
    if (now - this.windowStart >= this.windowMs) {
      return this.maxRequests;
    }
    return this.maxRequests - this.requestCount;
  }

  getResetTime(): Date {
    return new Date(this.windowStart + this.windowMs);
  }
}

// Create rate limiter instance
const rateLimiter = new WooCommerceRateLimiter();

// Make authenticated WooCommerce API request
const makeWooCommerceRequest = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<any> => {
  try {
    await rateLimiter.checkRateLimit();

    const method = options.method || 'GET';
    const url = getWooCommerceUrlWithOAuth(method, endpoint);
    const headers = getWooCommerceHeaders(method, endpoint);

    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `WooCommerce API error: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    const data = (await response.json()) as any;
    return data;
  } catch (error) {
    logger.error(`WooCommerce API request failed: ${endpoint}`, error);
    throw error;
  }
};

// Get rate limiter status
const getRateLimiterStatus = () => ({
  remainingRequests: rateLimiter.getRemainingRequests(),
  resetTime: rateLimiter.getResetTime()
});

export {
  validateWooCommerceConfig,
  getWooCommerceApiUrl,
  getWooCommerceHeaders,
  testWooCommerceConnection,
  makeWooCommerceRequest,
  getWooCommerceConfig,
  getRateLimiterStatus
};

export type { WooCommerceConfig };
