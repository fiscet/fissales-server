import { Product, ApiResponse, SyncResponse } from '../types';

// Base URL for the server API
const getServerUrl = () => {
  return process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080';
};

// Import all products from Shopify via server API
export const importAllProductsFromShopify = async (): Promise<{
  success: boolean;
  data?: { success: number; errors: number; };
  error?: string;
}> => {
  try {
    const serverUrl = getServerUrl();
    const response = await fetch(`${serverUrl}/api/shopify/import-products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || errorData.error || `HTTP error! status: ${response.status}`);
    }

    const result: SyncResponse = await response.json();

    return {
      success: true,
      data: {
        success: result.success || 0,
        errors: result.errors || 0,
      },
    };
  } catch (error) {
    console.error('Error importing products from Shopify:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
};

// Get all products from database via server API
export const getAllProducts = async (): Promise<{
  success: boolean;
  data?: Product[];
  error?: string;
}> => {
  try {
    const serverUrl = getServerUrl();
    const response = await fetch(`${serverUrl}/api/shopify/products`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || errorData.error || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    return {
      success: true,
      data: result.products || [],
    };
  } catch (error) {
    console.error('Error getting products:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
};

// Sync single product to Qdrant via server API
export const syncProductToQdrant = async (productId: string): Promise<{
  success: boolean;
  error?: string;
}> => {
  try {
    const serverUrl = getServerUrl();
    const response = await fetch(`${serverUrl}/api/products/${productId}/sync-to-qdrant`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || errorData.error || `HTTP error! status: ${response.status}`);
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error syncing product to Qdrant:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
};

// Sync all products to Qdrant via server API
export const syncAllProductsToQdrant = async (): Promise<{
  success: boolean;
  data?: { synced: number; };
  error?: string;
}> => {
  try {
    const serverUrl = getServerUrl();
    const response = await fetch(`${serverUrl}/api/products/sync-to-qdrant`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || errorData.error || `HTTP error! status: ${response.status}`);
    }

    const result: SyncResponse = await response.json();

    return {
      success: true,
      data: {
        synced: result.synced || 0,
      },
    };
  } catch (error) {
    console.error('Error syncing products to Qdrant:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
};

// Update product description extra field via server API
export const updateProductDescriptionExtra = async (
  productId: string,
  descriptionExtra: string
): Promise<{
  success: boolean;
  error?: string;
}> => {
  try {
    const serverUrl = getServerUrl();
    const response = await fetch(`${serverUrl}/api/products/${productId}/description-extra`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ descriptionExtra }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || errorData.error || `HTTP error! status: ${response.status}`);
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error updating product description:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
};

// Get Qdrant stats via server API
export const getQdrantStats = async (): Promise<{
  success: boolean;
  data?: { count: number; lastSync?: Date; };
  error?: string;
}> => {
  try {
    const serverUrl = getServerUrl();
    const response = await fetch(`${serverUrl}/api/products/qdrant/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || errorData.error || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    return {
      success: true,
      data: {
        count: result.count || 0,
        lastSync: result.lastSync ? new Date(result.lastSync) : undefined,
      },
    };
  } catch (error) {
    console.error('Error getting Qdrant stats:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
};

// Search products via server API
export const searchProducts = async (query: string): Promise<{
  success: boolean;
  data?: { query: string; results: any[]; count: number; };
  error?: string;
}> => {
  try {
    const serverUrl = getServerUrl();
    const response = await fetch(`${serverUrl}/api/products/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || errorData.error || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    return {
      success: true,
      data: {
        query: result.query || query,
        results: result.results || [],
        count: result.count || 0,
      },
    };
  } catch (error) {
    console.error('Error searching products:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
};

// Format product for display
export const formatProduct = (product: Product) => {
  return {
    id: product.id,
    name: product.name,
    description: product.description.length > 100
      ? product.description.substring(0, 100) + '...'
      : product.description,
    descriptionExtra: product.descriptionExtra || 'No extra description',
    price: new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(product.price),
    stock: product.stock,
    imageUrl: product.imageUrl,
    productUrl: product.productUrl,
  };
};

// Get sync metadata from server
export const getSyncStats = async (): Promise<{
  success: boolean;
  data?: {
    lastSyncFirebase?: Date;
    lastSyncQdrant?: Date;
  };
  error?: string;
}> => {
  try {
    const serverUrl = getServerUrl();
    const response = await fetch(`${serverUrl}/api/products/sync/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || errorData.error || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    return {
      success: true,
      data: {
        lastSyncFirebase: result.lastShopifySync ? new Date(result.lastShopifySync) : undefined,
        lastSyncQdrant: result.lastQdrantSync ? new Date(result.lastQdrantSync) : undefined,
      },
    };
  } catch (error) {
    console.error('Error getting sync stats:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
};

// Get product statistics
export const getProductStats = async (): Promise<{
  success: boolean;
  data?: {
    firebaseProducts: number;
    qdrantProducts: number;
    lastSyncFirebase?: Date;
    lastSyncQdrant?: Date;
  };
  error?: string;
}> => {
  try {
    // Get Firebase products count
    const productsResult = await getAllProducts();
    if (!productsResult.success) {
      throw new Error(productsResult.error || 'Failed to get products');
    }

    // Get Qdrant stats
    const qdrantResult = await getQdrantStats();
    if (!qdrantResult.success) {
      throw new Error(qdrantResult.error || 'Failed to get Qdrant stats');
    }

    // Get sync timestamps from server
    const syncResult = await getSyncStats();
    const syncData = syncResult.success ? syncResult.data : {};

    return {
      success: true,
      data: {
        firebaseProducts: productsResult.data?.length || 0,
        qdrantProducts: qdrantResult.data?.count || 0,
        lastSyncFirebase: syncData?.lastSyncFirebase,
        lastSyncQdrant: syncData?.lastSyncQdrant,
      },
    };
  } catch (error) {
    console.error('Error getting product stats:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
};

