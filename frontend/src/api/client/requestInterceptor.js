/**
 * Request Interceptor
 * Handles request-level logic like token injection
 */
import { getToken } from "../../utils/tokenManager";
import logger from "../../utils/logger";
import { getActiveRegion } from "../../hooks/useRegion";

export const requestInterceptor = {
  onFulfilled: (config) => {
    // Inject authentication token
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Inject region parameter for admin requests if a region is selected
    const adminRegion = localStorage.getItem("adminRegion");

    // Determine if the request is an admin request
    // The most bulletproof way is to check the current browser route
    const isAdminRoute = typeof window !== 'undefined' && window.location.pathname.startsWith("/admin");

    if (
      adminRegion &&
      isAdminRoute
    ) {
      // Append region to query parameters for admin
      config.params = {
        ...config.params,
        region: adminRegion,
      };
    } else if (
      config.url &&
      !config.url.includes("/auth/login") &&
      !config.url.includes("/auth/register")
    ) {
      // If it's a public request, append the auto-detected region
      config.params = {
        ...config.params,
        region: getActiveRegion(),
      };
    }

    // Log request in development
    if (import.meta.env.DEV) {
      logger.log('📤 API Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        params: config.params,
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

