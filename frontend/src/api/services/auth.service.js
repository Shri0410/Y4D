/**
 * Authentication Service
 * All authentication-related API calls
 */
import apiClient from '../client/axiosClient';
import { API_ROUTES } from '../endpoints/routes';
import { handleResponse, handleApiError } from '../../utils/api/responseHandler';
import { setToken, clearAuth } from '../../utils/tokenManager';
import logger from '../../utils/logger';

export const authService = {
  /**
   * Login user
   * @param {Object} credentials - { username, password }
   * @returns {Promise<Object>} { token, user }
   */
  login: async (credentials) => {
    try {
      logger.log('🔐 Attempting login...');
      const response = await apiClient.post(API_ROUTES.AUTH.LOGIN, credentials);
      const data = handleResponse(response);
      
      if (data.token) {
        setToken(data.token);
        logger.log('✅ Login successful');
      }
      
      return data;
    } catch (error) {
      handleApiError(error, { 
        context: 'authService.login',
        showToast: true,
      });
      throw error;
    }
  },

  /**
   * Register new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} Registration result
   */
  register: async (userData) => {
    try {
      logger.log('📝 Attempting registration...');
      const response = await apiClient.post(API_ROUTES.AUTH.REGISTER, userData);
      const data = handleResponse(response);
      logger.log('✅ Registration successful');
      return data;
    } catch (error) {
      handleApiError(error, { 
        context: 'authService.register',
        showToast: true,
      });
      throw error;
    }
  },

  /**
   * Logout user
   * @returns {Promise<void>}
   */
  logout: async () => {
    try {
      await apiClient.post(API_ROUTES.AUTH.LOGOUT);
      clearAuth();
      logger.log('✅ Logout successful');
    } catch (error) {
      // Even if API call fails, clear local auth
      clearAuth();
      handleApiError(error, { 
        context: 'authService.logout',
        showToast: false,
      });
    }
  },

  /**
   * Verify token
   * @returns {Promise<Object>} User data if token is valid
   */
  verifyToken: async () => {
    try {
      const response = await apiClient.get(API_ROUTES.AUTH.VERIFY_TOKEN);
      return handleResponse(response);
    } catch (error) {
      clearAuth();
      handleApiError(error, { 
        context: 'authService.verifyToken',
        showToast: false,
      });
      throw error;
    }
  },

  /**
   * Request password reset (send OTP)
   * @param {Object} requestData - { email }
   * @returns {Promise<Object>} Request result
   */
  requestPasswordReset: async (requestData) => {
    try {
      logger.log('🔑 Requesting password reset...');
      const response = await apiClient.post(API_ROUTES.AUTH.REQUEST_PASSWORD_RESET, requestData);
      const data = handleResponse(response);
      logger.log('✅ Password reset request sent');
      return data;
    } catch (error) {
      handleApiError(error, { 
        context: 'authService.requestPasswordReset',
        showToast: true,
      });
      throw error;
    }
  },

  /**
   * Reset password with OTP
   * @param {Object} resetData - { email, otp, newPassword }
   * @returns {Promise<Object>} Reset result
   */
  resetPassword: async (resetData) => {
    try {
      logger.log('🔑 Resetting password...');
      const response = await apiClient.post(API_ROUTES.AUTH.RESET_PASSWORD, resetData);
      const data = handleResponse(response);
      logger.log('✅ Password reset successful');
      return data;
    } catch (error) {
      handleApiError(error, { 
        context: 'authService.resetPassword',
        showToast: true,
      });
      throw error;
    }
  },
};

export default authService;

