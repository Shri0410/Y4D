/**
 * Axios Client Configuration
 * Centralized axios instance with interceptors
 */
import axios from 'axios';
import { API_BASE } from '../../config/api';
import { requestInterceptor } from './requestInterceptor';
import { responseInterceptor } from './responseInterceptor';

/**
 * Create axios instance with default configuration
 */
export const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor
apiClient.interceptors.request.use(
  requestInterceptor.onFulfilled,
  requestInterceptor.onRejected
);

// Add response interceptor
apiClient.interceptors.response.use(
  responseInterceptor.onFulfilled,
  responseInterceptor.onRejected
);

export default apiClient;

