/**
 * Response Interceptor
 * Handles response-level logic like error handling and 401 redirects
 */
import { clearAuth } from '../../utils/tokenManager';
import { extractErrorMessage } from '../../utils/apiResponse';
import logger from '../../utils/logger';

export const responseInterceptor = {
  onFulfilled: (response) => {
    // Log successful response in development
    if (import.meta.env.DEV) {
      logger.log('✅ API Response:', {
        status: response.status,
        url: response.config?.url,
      });
    }
    return response;
  },

  onRejected: (error) => {
    // Handle 401 Unauthorized - clear auth and redirect
    if (error.response?.status === 401) {
      clearAuth();

      // Redirect admin panel users
      if (window.location.pathname.startsWith('/admin')) {
        window.location.href = '/admin';
      }
    }

    // Extract and log error message
    const extractedMsg = extractErrorMessage(error);
    logger.error('API Error:', {
      message: extractedMsg,
      status: error.response?.status,
      url: error.config?.url,
      data: error.response?.data,
    });

    // Attach extracted message to error for easier handling
    error.extractedMessage = extractedMsg;
    return Promise.reject(error);
  },
};

export default responseInterceptor;

