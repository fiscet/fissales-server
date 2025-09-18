import {
  makeShopifyRequest,
  testShopifyConnection
} from '../config/shopify.js';
import {
  createProduct,
  updateProduct,
  createCompanyInfo
} from '../database/utils.js';
import { Product, CompanyInfo } from '../types/index.js';
import { logger } from '../utils/logger.js';

// Import all products from Shopify
export const importAllProducts = async (): Promise<{
  success: number;
  errors: number;
}> => {
  let successCount = 0;
  let errorCount = 0;
  let nextPageInfo: string | null = null;

  try {
    logger.info('Starting product import from Shopify...');

    do {
      // Get products from Shopify
      const endpoint = nextPageInfo
        ? `/products.json?${nextPageInfo}`
        : '/products.json';
      const response = await makeShopifyRequest(endpoint);

      const products = response.products || [];

      // Process each product
      for (const shopifyProduct of products) {
        try {
          const product: Product = {
            id: shopifyProduct.id.toString(),
            name: shopifyProduct.title,
            description: shopifyProduct.body_html || '',
            descriptionExtra: '',
            price: parseFloat(shopifyProduct.variants?.[0]?.price || '0'),
            stock: parseInt(
              shopifyProduct.variants?.[0]?.inventory_quantity || '0'
            ),
            imageUrl: shopifyProduct.image?.src || '',
            productUrl: `https://${process.env['WEBSHOP_URL']?.replace(/^https?:\/\//, '')}/products/${shopifyProduct.handle}`
          };

          await createProduct(product);
          successCount++;

          logger.debug(`Product imported: ${product.name} (${product.id})`);
        } catch (error) {
          errorCount++;
          logger.error(`Failed to import product ${shopifyProduct.id}:`, error);
        }
      }

      // Check for next page
      const linkHeader = response.headers?.get('Link');
      nextPageInfo = extractNextPageInfo(linkHeader);
    } while (nextPageInfo);

    logger.info(
      `Product import completed: ${successCount} successful, ${errorCount} errors`
    );
    return { success: successCount, errors: errorCount };
  } catch (error) {
    logger.error('Product import failed:', error);
    throw error;
  }
};

// Import company information from Shopify
export const importCompanyInfo = async (): Promise<CompanyInfo | null> => {
  try {
    logger.info('Importing company information from Shopify...');

    // Get shop information
    const shopResponse = await makeShopifyRequest('/shop.json');
    const shop = shopResponse.shop;

    if (!shop) {
      throw new Error('No shop information found');
    }

    // Get policies (shipping, returns, etc.)
    const policiesResponse = await makeShopifyRequest('/policies.json');
    const policies = policiesResponse.policies || [];

    const companyInfo: CompanyInfo = {
      id: 'company',
      name: shop.name,
      description: shop.description || '',
      policies: policies.map((policy: any) => policy.body),
      contactInfo: {
        email: shop.email,
        phone: shop.phone,
        address: {
          address1: shop.address1,
          address2: shop.address2,
          city: shop.city,
          province: shop.province,
          country: shop.country,
          zip: shop.zip
        }
      },
      updatedAt: new Date()
    };

    await createCompanyInfo(companyInfo);
    logger.info('Company information imported successfully');

    return companyInfo;
  } catch (error) {
    logger.error('Company information import failed:', error);
    throw error;
  }
};

// Update specific product from Shopify
export const updateProductFromShopify = async (
  productId: string
): Promise<Product | null> => {
  try {
    logger.info(`Updating product from Shopify: ${productId}`);

    const response = await makeShopifyRequest(`/products/${productId}.json`);
    const shopifyProduct = response.product;

    if (!shopifyProduct) {
      throw new Error(`Product ${productId} not found in Shopify`);
    }

    const product: Product = {
      id: shopifyProduct.id.toString(),
      name: shopifyProduct.title,
      description: shopifyProduct.body_html || '',
      descriptionExtra: '',
      price: parseFloat(shopifyProduct.variants?.[0]?.price || '0'),
      stock: parseInt(shopifyProduct.variants?.[0]?.inventory_quantity || '0'),
      imageUrl: shopifyProduct.image?.src || '',
      productUrl: `https://${process.env['WEBSHOP_URL']?.replace(/^https?:\/\//, '')}/products/${shopifyProduct.handle}`
    };

    await updateProduct(productId, product);
    logger.info(`Product updated successfully: ${product.name}`);

    return product;
  } catch (error) {
    logger.error(`Failed to update product ${productId}:`, error);
    throw error;
  }
};

// Get product list from Shopify (without importing)
export const getShopifyProducts = async (
  limit: number = 50
): Promise<any[]> => {
  try {
    const response = await makeShopifyRequest(`/products.json?limit=${limit}`);
    return response.products || [];
  } catch (error) {
    logger.error('Failed to get Shopify products:', error);
    throw error;
  }
};

// Get shop information from Shopify
export const getShopInfo = async (): Promise<any> => {
  try {
    const response = await makeShopifyRequest('/shop.json');
    return response.shop;
  } catch (error) {
    logger.error('Failed to get shop information:', error);
    throw error;
  }
};

// Helper function to extract next page info from Link header
const extractNextPageInfo = (linkHeader: string | null): string | null => {
  if (!linkHeader) return null;

  const nextLink = linkHeader.match(/<[^>]*\?([^>]*)>;\s*rel="next"/);
  return nextLink ? nextLink[1] || null : null;
};

// Test Shopify integration
export const testShopifyIntegration = async (): Promise<boolean> => {
  return await testShopifyConnection();
};
