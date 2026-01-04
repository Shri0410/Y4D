/**
 * Request Interceptor
 * Handles request-level logic like token injection
 */
import { getToken } from '../../utils/tokenManager';
import logger from '../../utils/logger';

export const requestInterceptor = {
  onFulfilled: (config) => {
    // Inject authentication token
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log request in development
    if (import.meta.env.DEV) {
      logger.log('📤 API Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        hasToken: !!token,
      });
    }

    return config;
  },

  onRejected: (error) => {
    logger.error('Request interceptor error:', error);
    return Promise.reject(error);
  },
};

export default requestInterceptor;

