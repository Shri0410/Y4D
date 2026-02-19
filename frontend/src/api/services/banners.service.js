/**
 * Banner Service
 * All banner-related API calls
 */
import apiClient from '../client/axiosClient';
import { API_ROUTES } from '../endpoints/routes';
import { handleResponse, handleApiError } from '../../utils/api/responseHandler';
import logger from '../../utils/logger';

export const bannerService = {
  /**
   * Get banners by page and section
   * @param {string} page - Page name (e.g., 'home', 'donate')
   * @param {string} section - Section name (e.g., 'hero', 'campaigns')
   * @returns {Promise<Array>} Array of banners
   */
  getBanners: async (page = 'home', section = null) => {
    try {
      let url = API_ROUTES.BANNERS.BY_PAGE(page);
      if (section) url += `?section=${section}`;
      
      logger.log(`🔄 Fetching banners: page=${page}, section=${section}`);
      const response = await apiClient.get(url);
      const data = handleResponse(response);
      logger.log(`✅ Banners loaded: ${data?.length || 0} items`);
      return data || [];
    } catch (error) {
      handleApiError(error, { 
        context: 'bannerService.getBanners',
        showToast: false,
      });
      return [];
    }
  },

  /**
   * Get all banners (admin)
   * @param {Object} filters - Optional filters (page, section, category, active_only)
   * @returns {Promise<Array>} Array of all banners
   */
  getAllBanners: async (filters = {}) => {
    try {
      let url = API_ROUTES.BANNERS.BASE;
      const params = new URLSearchParams();
      
      if (filters.page) params.append('page', filters.page);
      if (filters.section) params.append('section', filters.section);
      if (filters.category) params.append('category', filters.category);
      if (filters.active_only) params.append('active_only', filters.active_only);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      logger.log('🔄 Fetching all banners...');
      const response = await apiClient.get(url);
      const data = handleResponse(response);
      logger.log(`✅ All banners loaded: ${data?.length || 0} items`);
      return data || [];
    } catch (error) {
      handleApiError(error, { 
        context: 'bannerService.getAllBanners',
        showToast: false,
      });
      return [];
    }
  },

  /**
   * Get banner by ID
   * @param {number} id - Banner ID
   * @returns {Promise<Object>} Banner object
   */
  getBannerById: async (id) => {
    try {
      const response = await apiClient.get(API_ROUTES.BANNERS.BY_ID(id));
      return handleResponse(response);
    } catch (error) {
      handleApiError(error, { 
        context: 'bannerService.getBannerById',
        showToast: true,
      });
      throw error;
    }
  },

  /**
   * Get list of unique pages
   * @returns {Promise<Array>} Array of page names
   */
  getPagesList: async () => {
    try {
      const response = await apiClient.get(API_ROUTES.BANNERS.PAGES_LIST);
      return handleResponse(response) || [];
    } catch (error) {
      handleApiError(error, { 
        context: 'bannerService.getPagesList',
        showToast: false,
      });
      return [];
    }
  },

  /**
   * Create new banner
   * @param {FormData} formData - Banner data with file
   * @returns {Promise<Object>} Created banner
   */
  createBanner: async (formData) => {
    try {
      logger.log('📤 Creating banner...');
      const response = await apiClient.post(API_ROUTES.BANNERS.BASE, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const data = handleResponse(response);
      logger.log('✅ Banner created successfully');
      return data;
    } catch (error) {
      handleApiError(error, { 
        context: 'bannerService.createBanner',
        showToast: true,
      });
      throw error;
    }
  },

  /**
   * Update banner
   * @param {number} id - Banner ID
   * @param {FormData} formData - Updated banner data
   * @returns {Promise<Object>} Updated banner
   */
  updateBanner: async (id, formData) => {
    try {
      logger.log(`✏️ Updating banner ${id}...`);
      const response = await apiClient.put(API_ROUTES.BANNERS.BY_ID(id), formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const data = handleResponse(response);
      logger.log('✅ Banner updated successfully');
      return data;
    } catch (error) {
      handleApiError(error, { 
        context: 'bannerService.updateBanner',
        showToast: true,
      });
      throw error;
    }
  },

  /**
   * Delete banner
   * @param {number} id - Banner ID
   * @returns {Promise<void>}
   */
  deleteBanner: async (id) => {
    try {
      logger.log(`🗑️ Deleting banner ${id}...`);
      await apiClient.delete(API_ROUTES.BANNERS.BY_ID(id));
      logger.log('✅ Banner deleted successfully');
    } catch (error) {
      handleApiError(error, { 
        context: 'bannerService.deleteBanner',
        showToast: true,
      });
      throw error;
    }
  },
};

export default bannerService;

