/**
 * Our Work Service
 * All Our Work related API calls (quality-education, healthcare, livelihood, etc.)
 */
import apiClient from '../client/axiosClient';
import { API_ROUTES } from '../endpoints/routes';
import { handleResponse, handleApiError } from '../../utils/api/responseHandler';
import logger from '../../utils/logger';

export const ourworkService = {
  /**
   * Get items by category
   * @param {string} category - Category name (quality-education, healthcare, livelihood, etc.)
   * @param {Object} filters - Optional filters (page, limit, active_only)
   * @returns {Promise<Array>} Array of items
   */
  getItemsByCategory: async (category, filters = {}) => {
    try {
      // Use published endpoint for public views, admin endpoint for dashboard
      let url = filters.active_only
        ? API_ROUTES.OUR_WORK.PUBLISHED_CATEGORY(category)
        : API_ROUTES.OUR_WORK.ADMIN_BASE(category);

      const params = new URLSearchParams();

      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      logger.log(`🔄 Fetching ${category} items...`);
      const response = await apiClient.get(url);
      const data = handleResponse(response);
      logger.log(`✅ ${category} items loaded: ${data?.length || 0} items`);
      return data || [];
    } catch (error) {
      handleApiError(error, {
        context: `ourworkService.getItemsByCategory(${category})`,
        showToast: false,
      });
      return [];
    }
  },

  /**
   * Get item by ID
   * @param {string} category - Category name
   * @param {number} id - Item ID
   * @returns {Promise<Object>} Item object
   */
  getItemById: async (category, id) => {
    try {
      const response = await apiClient.get(API_ROUTES.OUR_WORK.PUBLISHED_BY_ID(category, id));
      return handleResponse(response);
    } catch (error) {
      handleApiError(error, {
        context: `ourworkService.getItemById(${category}, ${id})`,
        showToast: true,
      });
      throw error;
    }
  },

  /**
   * Create new item (admin)
   * @param {string} category - Category name
   * @param {FormData} formData - Item data with files
   * @returns {Promise<Object>} Created item
   */
  createItem: async (category, formData) => {
    try {
      logger.log(`📤 Creating ${category} item...`);
      const response = await apiClient.post(
        API_ROUTES.OUR_WORK.ADMIN_BASE(category),
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );
      const data = handleResponse(response);
      logger.log(`✅ ${category} item created`);
      return data;
    } catch (error) {
      handleApiError(error, {
        context: `ourworkService.createItem(${category})`,
        showToast: true,
      });
      throw error;
    }
  },

  /**
   * Update item (admin)
   * @param {string} category - Category name
   * @param {number} id - Item ID
   * @param {FormData} formData - Updated item data
   * @returns {Promise<Object>} Updated item
   */
  updateItem: async (category, id, formData) => {
    try {
      logger.log(`✏️ Updating ${category} item ${id}...`);
      const response = await apiClient.put(
        `${API_ROUTES.OUR_WORK.ADMIN_BASE(category)}/${id}`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );
      const data = handleResponse(response);
      logger.log(`✅ ${category} item updated`);
      return data;
    } catch (error) {
      handleApiError(error, {
        context: `ourworkService.updateItem(${category}, ${id})`,
        showToast: true,
      });
      throw error;
    }
  },

  /**
   * Delete item (admin)
   * @param {string} category - Category name
   * @param {number} id - Item ID
   * @returns {Promise<void>}
   */
  deleteItem: async (category, id) => {
    try {
      logger.log(`🗑️ Deleting ${category} item ${id}...`);
      await apiClient.delete(`${API_ROUTES.OUR_WORK.ADMIN_BASE(category)}/${id}`);
      logger.log(`✅ ${category} item deleted`);
    } catch (error) {
      handleApiError(error, {
        context: `ourworkService.deleteItem(${category}, ${id})`,
        showToast: true,
      });
      throw error;
    }
  },

  /**
   * Toggle item status (admin)
   * @param {string} category - Category name
   * @param {number} id - Item ID
   * @param {boolean} isActive - New active status
   * @returns {Promise<Object>} Updated item
   */
  toggleItemStatus: async (category, id, isActive) => {
    try {
      logger.log(`🔄 Toggling ${category} item ${id} status to ${isActive}...`);
      const response = await apiClient.patch(
        `${API_ROUTES.OUR_WORK.ADMIN_BASE(category)}/${id}/status`,
        { is_active: isActive }
      );
      const data = handleResponse(response);
      logger.log(`✅ ${category} item status updated`);
      return data;
    } catch (error) {
      handleApiError(error, {
        context: `ourworkService.toggleItemStatus(${category}, ${id})`,
        showToast: true,
      });
      throw error;
    }
  },
};

export default ourworkService;

