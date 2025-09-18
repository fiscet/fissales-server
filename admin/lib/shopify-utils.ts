// Base URL for the server API
const getServerUrl = () => {
  return process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080';
};

// Test Shopify connection via server API
export const testShopifyConnection = async (): Promise<{
  success: boolean;
  error?: string;
}> => {
  try {
    const serverUrl = getServerUrl();
    const response = await fetch(`${serverUrl}/api/shopify/test`, {
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
      success: result.connected === true,
      error: result.connected === false ? result.message : undefined,
    };
  } catch (error) {
    console.error('Error testing Shopify connection:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
};

// Get shop information from Shopify via server API
export const getShopInfo = async (): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> => {
  try {
    const serverUrl = getServerUrl();
    const response = await fetch(`${serverUrl}/api/shopify/shop`, {
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
      data: result.shop,
    };
  } catch (error) {
    console.error('Error getting shop info:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
};
