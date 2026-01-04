/**
 * Registration Service
 * All registration request-related API calls
 */
import apiClient from '../client/axiosClient';
import { API_ROUTES } from '../endpoints/routes';
import { handleResponse, handleApiError } from '../../utils/api/responseHandler';
import logger from '../../utils/logger';

export const registrationService = {
  /**
   * Create a registration request
   * @param {Object} requestData - { name, email, mobile_number, address, password? }
   * @returns {Promise<Object>} Registration request result
   */
  createRegistrationRequest: async (requestData) => {
    try {
      logger.log('📝 Creating registration request...');
      const response = await apiClient.post(API_ROUTES.REGISTRATION.REQUEST, requestData);
      const data = handleResponse(response);
      logger.log('✅ Registration request created successfully');
      return data;
    } catch (error) {
      handleApiError(error, { 
        context: 'registrationService.createRegistrationRequest',
        showToast: true,
      });
      throw error;
    }
  },

  /**
   * Get all registration requests (Admin only)
   * @returns {Promise<Array>} List of registration requests
   */
  getRegistrationRequests: async () => {
    try {
      logger.log('📋 Fetching registration requests...');
      const response = await apiClient.get(API_ROUTES.REGISTRATION.REQUESTS);
      const data = handleResponse(response);
      logger.log(`✅ Fetched ${data.length} registration requests`);
      return data;
    } catch (error) {
      handleApiError(error, { 
        context: 'registrationService.getRegistrationRequests',
        showToast: true,
      });
      throw error;
    }
  },

  /**
   * Get registration request statistics (Admin only)
   * @returns {Promise<Object>} { total, pending, approved, rejected }
   */
  getRegistrationStats: async () => {
    try {
      logger.log('📊 Fetching registration stats...');
      const response = await apiClient.get(API_ROUTES.REGISTRATION.STATS);
      const data = handleResponse(response);
      logger.log('✅ Registration stats fetched');
      return data;
    } catch (error) {
      handleApiError(error, { 
        context: 'registrationService.getRegistrationStats',
        showToast: true,
      });
      throw error;
    }
  },

  /**
   * Approve a registration request (Admin only)
   * @param {number} id - Registration request ID
   * @param {Object} approvalData - { username, password?, role }
   * @returns {Promise<Object>} Approval result
   */
  approveRegistrationRequest: async (id, approvalData) => {
    try {
      logger.log(`✅ Approving registration request ${id}...`);
      const response = await apiClient.post(
        API_ROUTES.REGISTRATION.APPROVE(id),
        approvalData
      );
      const data = handleResponse(response);
      logger.log('✅ Registration request approved');
      return data;
    } catch (error) {
      handleApiError(error, { 
        context: 'registrationService.approveRegistrationRequest',
        showToast: true,
      });
      throw error;
    }
  },

  /**
   * Reject a registration request (Admin only)
   * @param {number} id - Registration request ID
   * @param {Object} rejectionData - { reason? }
   * @returns {Promise<Object>} Rejection result
   */
  rejectRegistrationRequest: async (id, rejectionData = {}) => {
    try {
      logger.log(`❌ Rejecting registration request ${id}...`);
      const response = await apiClient.post(
        API_ROUTES.REGISTRATION.REJECT(id),
        rejectionData
      );
      const data = handleResponse(response);
      logger.log('✅ Registration request rejected');
      return data;
    } catch (error) {
      handleApiError(error, { 
        context: 'registrationService.rejectRegistrationRequest',
        showToast: true,
      });
      throw error;
    }
  },
};

export default registrationService;

