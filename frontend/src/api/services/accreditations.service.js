/**
 * Accreditations Service
 * Accreditation-related API calls
 */
import apiClient from '../client/axiosClient';
import { API_ROUTES } from '../endpoints/routes';
import { handleResponse, handleApiError } from '../../utils/api/responseHandler';
import logger from '../../utils/logger';

export const accreditationsService = {
  /**
   * Get all accreditations
   * @returns {Promise<Array>} Array of accreditations
   */
  getAccreditations: async () => {
    try {
      logger.log('🔄 Fetching accreditations...');
      const response = await apiClient.get(API_ROUTES.ACCREDITATIONS.BASE);
      const data = handleResponse(response);
      logger.log(`✅ Accreditations loaded: ${data?.length || 0} items`);
      return data || [];
    } catch (error) {
      handleApiError(error, { 
        context: 'accreditationsService.getAccreditations',
        showToast: false,
      });
      return [];
    }
  },

  /**
   * Get accreditation by ID
   * @param {number} id - Accreditation ID
   * @returns {Promise<Object>} Accreditation object
   */
  getAccreditationById: async (id) => {
    try {
      const response = await apiClient.get(`${API_ROUTES.ACCREDITATIONS.BASE}/${id}`);
      return handleResponse(response);
    } catch (error) {
      handleApiError(error, { 
        context: `accreditationsService.getAccreditationById(${id})`,
        showToast: true,
      });
      throw error;
    }
  },

  /**
   * Create accreditation
   * @param {FormData} formData - Accreditation data with image
   * @returns {Promise<Object>} Created accreditation
   */
  createAccreditation: async (formData) => {
    try {
      logger.log('📤 Creating accreditation...');
      const response = await apiClient.post(API_ROUTES.ACCREDITATIONS.BASE, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const data = handleResponse(response);
      logger.log('✅ Accreditation created successfully');
      return data;
    } catch (error) {
      handleApiError(error, { 
        context: 'accreditationsService.createAccreditation',
        showToast: true,
      });
      throw error;
    }
  },

  /**
   * Update accreditation
   * @param {number} id - Accreditation ID
   * @param {FormData} formData - Updated accreditation data
   * @returns {Promise<Object>} Updated accreditation
   */
  updateAccreditation: async (id, formData) => {
    try {
      logger.log(`✏️ Updating accreditation ${id}...`);
      const response = await apiClient.put(`${API_ROUTES.ACCREDITATIONS.BASE}/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const data = handleResponse(response);
      logger.log('✅ Accreditation updated successfully');
      return data;
    } catch (error) {
      handleApiError(error, { 
        context: `accreditationsService.updateAccreditation(${id})`,
        showToast: true,
      });
      throw error;
    }
  },

  /**
   * Delete accreditation
   * @param {number} id - Accreditation ID
   * @returns {Promise<void>}
   */
  deleteAccreditation: async (id) => {
    try {
      logger.log(`🗑️ Deleting accreditation ${id}...`);
      await apiClient.delete(`${API_ROUTES.ACCREDITATIONS.BASE}/${id}`);
      logger.log('✅ Accreditation deleted successfully');
    } catch (error) {
      handleApiError(error, { 
        context: `accreditationsService.deleteAccreditation(${id})`,
        showToast: true,
      });
      throw error;
    }
  },

  /**
   * Toggle accreditation status
   * @param {number} id - Accreditation ID
   * @param {boolean} isActive - Active status
   * @returns {Promise<Object>} Updated accreditation
   */
  toggleAccreditationStatus: async (id, isActive) => {
    try {
      logger.log(`🔄 Toggling accreditation ${id} status to ${isActive}...`);
      const response = await apiClient.patch(
        `${API_ROUTES.ACCREDITATIONS.BASE}/${id}/toggle-status`,
        { is_active: isActive }
      );
      const data = handleResponse(response);
      logger.log('✅ Accreditation status updated');
      return data;
    } catch (error) {
      handleApiError(error, { 
        context: `accreditationsService.toggleAccreditationStatus(${id})`,
        showToast: true,
      });
      throw error;
    }
  },
};

export default accreditationsService;

