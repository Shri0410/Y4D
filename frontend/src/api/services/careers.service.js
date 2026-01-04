/**
 * Careers Service
 * All career-related API calls
 */
import apiClient from '../client/axiosClient';
import { API_ROUTES } from '../endpoints/routes';
import { handleResponse, handleApiError } from '../../utils/api/responseHandler';
import logger from '../../utils/logger';

export const careersService = {
  /**
   * Get active careers
   * @returns {Promise<Array>} Array of active careers
   */
  getActiveCareers: async () => {
    try {
      logger.log('🔄 Fetching active careers...');
      const response = await apiClient.get(API_ROUTES.CAREERS.ACTIVE);
      const data = handleResponse(response);
      logger.log(`✅ Careers loaded: ${data?.length || 0} items`);
      return data || [];
    } catch (error) {
      handleApiError(error, { 
        context: 'careersService.getActiveCareers',
        showToast: false,
      });
      return [];
    }
  },

  /**
   * Get career by ID
   * @param {number} id - Career ID
   * @returns {Promise<Object>} Career object
   */
  getCareerById: async (id) => {
    try {
      const response = await apiClient.get(API_ROUTES.CAREERS.BY_ID(id));
      return handleResponse(response);
    } catch (error) {
      handleApiError(error, { 
        context: 'careersService.getCareerById',
        showToast: true,
      });
      throw error;
    }
  },

  /**
   * Get all careers (admin)
   * @returns {Promise<Array>} Array of all careers
   */
  getCareers: async () => {
    try {
      logger.log('🔄 Fetching all careers...');
      const response = await apiClient.get(API_ROUTES.CAREERS.BASE);
      const data = handleResponse(response);
      logger.log(`✅ All careers loaded: ${data?.length || 0} items`);
      return data || [];
    } catch (error) {
      handleApiError(error, { 
        context: 'careersService.getCareers',
        showToast: false,
      });
      return [];
    }
  },

  /**
   * Create career (admin)
   * @param {Object} careerData - Career data
   * @returns {Promise<Object>} Created career
   */
  createCareer: async (careerData) => {
    try {
      logger.log('📤 Creating career...');
      const response = await apiClient.post(API_ROUTES.CAREERS.BASE, careerData);
      const data = handleResponse(response);
      logger.log('✅ Career created successfully');
      return data;
    } catch (error) {
      handleApiError(error, { 
        context: 'careersService.createCareer',
        showToast: true,
      });
      throw error;
    }
  },

  /**
   * Update career (admin)
   * @param {number} id - Career ID
   * @param {Object} careerData - Updated career data
   * @returns {Promise<Object>} Updated career
   */
  updateCareer: async (id, careerData) => {
    try {
      logger.log(`✏️ Updating career ${id}...`);
      const response = await apiClient.put(API_ROUTES.CAREERS.BY_ID(id), careerData);
      const data = handleResponse(response);
      logger.log('✅ Career updated successfully');
      return data;
    } catch (error) {
      handleApiError(error, { 
        context: 'careersService.updateCareer',
        showToast: true,
      });
      throw error;
    }
  },

  /**
   * Delete career (admin)
   * @param {number} id - Career ID
   * @returns {Promise<void>}
   */
  deleteCareer: async (id) => {
    try {
      logger.log(`🗑️ Deleting career ${id}...`);
      await apiClient.delete(API_ROUTES.CAREERS.BY_ID(id));
      logger.log('✅ Career deleted successfully');
    } catch (error) {
      handleApiError(error, { 
        context: 'careersService.deleteCareer',
        showToast: true,
      });
      throw error;
    }
  },

  /**
   * Apply for a job
   * @param {FormData} formData - Job application data with resume
   * @returns {Promise<Object>} Application result
   */
  applyForJob: async (formData) => {
    try {
      logger.log('📤 Submitting job application...');
      const response = await apiClient.post(API_ROUTES.CAREERS.APPLY, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const data = handleResponse(response);
      logger.log('✅ Application submitted successfully');
      return data;
    } catch (error) {
      handleApiError(error, { 
        context: 'careersService.applyForJob',
        showToast: true,
      });
      throw error;
    }
  },
};

export default careersService;

