import { paymentAPI } from '../services/api.js';

// Cache for payment config to avoid repeated API calls
let configCache = null;
let configPromise = null;

/**
 * Get payment configuration from backend
 * @returns {Promise<Object>} Payment configuration object
 */
export const getPaymentConfig = async () => {
  // Return cached config if available
  if (configCache) {
    return configCache;
  }

  // Return existing promise if already fetching
  if (configPromise) {
    return configPromise;
  }

  try {
    configPromise = paymentAPI.getConfig();
    const response = await configPromise;
    configCache = response.data.config;
    configPromise = null;
    return configCache;
  } catch (error) {
    configPromise = null;
    console.error('Failed to fetch payment config:', error);
    
    // Fallback to default config
    const fallbackConfig = {
      currency: 'INR',
      urls: {
        successUrl: `${window.location.origin}/payment/success`,
        cancelUrl: `${window.location.origin}/payment/cancel`,
        failureUrl: `${window.location.origin}/payment/failure`,
      }
    };
    
    return fallbackConfig;
  }
};

/**
 * Get payment URLs dynamically
 * @returns {Promise<Object>} Payment URLs object
 */
export const getPaymentUrls = async () => {
  const config = await getPaymentConfig();
  return config.urls;
};

/**
 * Create payment URL with query parameters
 * @param {string} type - URL type ('success', 'cancel', 'failure')
 * @param {Object} params - Query parameters to add
 * @returns {Promise<string>} Complete URL with parameters
 */
export const createPaymentUrl = async (type, params = {}) => {
  const urls = await getPaymentUrls();
  
  let baseUrl;
  switch (type) {
    case 'success':
      baseUrl = urls.successUrl;
      break;
    case 'cancel':
      baseUrl = urls.cancelUrl;
      break;
    case 'failure':
      baseUrl = urls.failureUrl;
      break;
    default:
      throw new Error(`Invalid payment URL type: ${type}`);
  }

  const url = new URL(baseUrl);
  
  // Add query parameters
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      url.searchParams.set(key, value.toString());
    }
  });

  return url.toString();
};

/**
 * Clear the config cache (useful for testing or when config changes)
 */
export const clearConfigCache = () => {
  configCache = null;
  configPromise = null;
};