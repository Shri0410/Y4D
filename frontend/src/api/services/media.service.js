/**
 * Media Service
 * All media-related API calls (blogs, stories, events, documentaries, newsletters)
 */
import apiClient from '../client/axiosClient';
import { API_ROUTES } from '../endpoints/routes';
import { handleResponse, handleApiError } from '../../utils/api/responseHandler';
import logger from '../../utils/logger';

export const mediaService = {
  /**
   * Get published media by type
   * @param {string} type - Media type (blogs, stories, events, documentaries, newsletters)
   * @returns {Promise<Array>} Array of published media items
   */
  getPublishedMedia: async (type) => {
    try {
      logger.log(`🔄 Fetching published ${type}...`);
      const response = await apiClient.get(API_ROUTES.MEDIA.PUBLISHED(type));
      const data = handleResponse(response);
      logger.log(`✅ ${type} loaded: ${data?.length || 0} items`);
      return data || [];
    } catch (error) {
      handleApiError(error, { 
        context: `mediaService.getPublishedMedia(${type})`,
        showToast: false,
      });
      return [];
    }
  },

  /**
   * Get media item by type and ID
   * @param {string} type - Media type
   * @param {number} id - Media ID
   * @returns {Promise<Object>} Media item
   */
  getMediaById: async (type, id) => {
    try {
      const response = await apiClient.get(API_ROUTES.MEDIA.BY_ID(type, id));
      return handleResponse(response);
    } catch (error) {
      handleApiError(error, { 
        context: `mediaService.getMediaById(${type}, ${id})`,
        showToast: true,
      });
      throw error;
    }
  },

  /**
   * Get media by type (admin)
   * @param {string} type - Media type
   * @returns {Promise<Array>} Array of media items
   */
  getMediaByType: async (type) => {
    try {
      const response = await apiClient.get(API_ROUTES.MEDIA.BY_TYPE(type));
      return handleResponse(response) || [];
    } catch (error) {
      handleApiError(error, { 
        context: `mediaService.getMediaByType(${type})`,
        showToast: false,
      });
      return [];
    }
  },

  /**
   * Create media item (admin)
   * @param {string} type - Media type
   * @param {FormData} formData - Media data with files
   * @returns {Promise<Object>} Created media item
   */
  createMedia: async (type, formData) => {
    try {
      logger.log(`📤 Creating ${type} item...`);
      const response = await apiClient.post(API_ROUTES.MEDIA.BY_TYPE(type), formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const data = handleResponse(response);
      logger.log(`✅ ${type} item created`);
      return data;
    } catch (error) {
      handleApiError(error, { 
        context: `mediaService.createMedia(${type})`,
        showToast: true,
      });
      throw error;
    }
  },

  /**
   * Update media item (admin)
   * @param {string} type - Media type
   * @param {number} id - Media ID
   * @param {FormData} formData - Updated media data
   * @returns {Promise<Object>} Updated media item
   */
  updateMedia: async (type, id, formData) => {
    try {
      logger.log(`✏️ Updating ${type} item ${id}...`);
      const response = await apiClient.put(API_ROUTES.MEDIA.BY_ID(type, id), formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const data = handleResponse(response);
      logger.log(`✅ ${type} item updated`);
      return data;
    } catch (error) {
      handleApiError(error, { 
        context: `mediaService.updateMedia(${type}, ${id})`,
        showToast: true,
      });
      throw error;
    }
  },

  /**
   * Delete media item (admin)
   * @param {string} type - Media type
   * @param {number} id - Media ID
   * @returns {Promise<void>}
   */
  deleteMedia: async (type, id) => {
    try {
      logger.log(`🗑️ Deleting ${type} item ${id}...`);
      await apiClient.delete(API_ROUTES.MEDIA.BY_ID(type, id));
      logger.log(`✅ ${type} item deleted`);
    } catch (error) {
      handleApiError(error, { 
        context: `mediaService.deleteMedia(${type}, ${id})`,
        showToast: true,
      });
      throw error;
    }
  },

  /**
   * Toggle publish status (admin)
   * @param {string} type - Media type
   * @param {number} id - Media ID
   * @param {boolean} isPublished - Publish status
   * @returns {Promise<Object>} Updated media item
   */
  togglePublishStatus: async (type, id, isPublished) => {
    try {
      logger.log(`🔄 Toggling ${type} item ${id} publish status to ${isPublished}...`);
      const response = await apiClient.patch(
        `${API_ROUTES.MEDIA.BY_ID(type, id)}/publish`,
        { is_published: isPublished }
      );
      const data = handleResponse(response);
      logger.log(`✅ ${type} item publish status updated`);
      return data;
    } catch (error) {
      handleApiError(error, { 
        context: `mediaService.togglePublishStatus(${type}, ${id})`,
        showToast: true,
      });
      throw error;
    }
  },
};

export default mediaService;

