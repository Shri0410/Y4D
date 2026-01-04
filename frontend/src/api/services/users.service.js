/**
 * Users Service
 * All user management API calls
 */
import apiClient from '../client/axiosClient';
import { API_ROUTES } from '../endpoints/routes';
import { handleResponse, handleApiError } from '../../utils/api/responseHandler';
import logger from '../../utils/logger';

export const usersService = {
  /**
   * Get all users (admin only)
   * @returns {Promise<Array>} Array of users
   */
  getAllUsers: async () => {
    try {
      logger.log('🔄 Fetching all users...');
      const response = await apiClient.get(API_ROUTES.USERS.BASE);
      const data = handleResponse(response);
      logger.log(`✅ Users loaded: ${data?.length || 0} items`);
      return data || [];
    } catch (error) {
      handleApiError(error, { 
        context: 'usersService.getAllUsers',
        showToast: false,
      });
      return [];
    }
  },

  /**
   * Get current user profile
   * @returns {Promise<Object>} User profile
   */
  getCurrentUser: async () => {
    try {
      const response = await apiClient.get(`${API_ROUTES.USERS.BASE}/profile`);
      return handleResponse(response);
    } catch (error) {
      handleApiError(error, { 
        context: 'usersService.getCurrentUser',
        showToast: false,
      });
      throw error;
    }
  },

  /**
   * Get user by ID
   * @param {number} id - User ID
   * @returns {Promise<Object>} User object
   */
  getUserById: async (id) => {
    try {
      const response = await apiClient.get(API_ROUTES.USERS.BY_ID(id));
      return handleResponse(response);
    } catch (error) {
      handleApiError(error, { 
        context: 'usersService.getUserById',
        showToast: true,
      });
      throw error;
    }
  },

  /**
   * Create new user (admin only)
   * @param {Object} userData - User data
   * @returns {Promise<Object>} Created user
   */
  createUser: async (userData) => {
    try {
      logger.log('📤 Creating user...');
      const response = await apiClient.post(API_ROUTES.USERS.BASE, userData);
      const data = handleResponse(response);
      logger.log('✅ User created successfully');
      return data;
    } catch (error) {
      handleApiError(error, { 
        context: 'usersService.createUser',
        showToast: true,
      });
      throw error;
    }
  },

  /**
   * Update user
   * @param {number} id - User ID
   * @param {Object} userData - Updated user data
   * @returns {Promise<Object>} Updated user
   */
  updateUser: async (id, userData) => {
    try {
      logger.log(`✏️ Updating user ${id}...`);
      const response = await apiClient.put(API_ROUTES.USERS.BY_ID(id), userData);
      const data = handleResponse(response);
      logger.log('✅ User updated successfully');
      return data;
    } catch (error) {
      handleApiError(error, { 
        context: 'usersService.updateUser',
        showToast: true,
      });
      throw error;
    }
  },

  /**
   * Delete user
   * @param {number} id - User ID
   * @returns {Promise<void>}
   */
  deleteUser: async (id) => {
    try {
      logger.log(`🗑️ Deleting user ${id}...`);
      await apiClient.delete(API_ROUTES.USERS.BY_ID(id));
      logger.log('✅ User deleted successfully');
    } catch (error) {
      handleApiError(error, { 
        context: 'usersService.deleteUser',
        showToast: true,
      });
      throw error;
    }
  },

  /**
   * Update user status
   * @param {number} id - User ID
   * @param {string} status - New status (approved, pending, rejected, suspended)
   * @returns {Promise<Object>} Updated user
   */
  updateUserStatus: async (id, status) => {
    try {
      logger.log(`🔄 Updating user ${id} status to ${status}...`);
      const response = await apiClient.patch(
        API_ROUTES.USERS.UPDATE_STATUS(id),
        { status }
      );
      const data = handleResponse(response);
      logger.log('✅ User status updated');
      return data;
    } catch (error) {
      handleApiError(error, { 
        context: 'usersService.updateUserStatus',
        showToast: true,
      });
      throw error;
    }
  },

  /**
   * Get user permissions
   * @param {number} id - User ID
   * @returns {Promise<Object>} User permissions
   */
  getUserPermissions: async (id) => {
    try {
      const response = await apiClient.get(API_ROUTES.USERS.PERMISSIONS(id));
      return handleResponse(response);
    } catch (error) {
      handleApiError(error, { 
        context: 'usersService.getUserPermissions',
        showToast: false,
      });
      throw error;
    }
  },

  /**
   * Update user permissions
   * @param {number} id - User ID
   * @param {Object} permissions - Permissions object
   * @returns {Promise<Object>} Updated permissions
   */
  updateUserPermissions: async (id, permissions) => {
    try {
      logger.log(`🔐 Updating permissions for user ${id}...`);
      const response = await apiClient.put(
        API_ROUTES.USERS.PERMISSIONS(id),
        permissions
      );
      const data = handleResponse(response);
      logger.log('✅ Permissions updated');
      return data;
    } catch (error) {
      handleApiError(error, { 
        context: 'usersService.updateUserPermissions',
        showToast: true,
      });
      throw error;
    }
  },

  /**
   * Update user role
   * @param {number} id - User ID
   * @param {string} role - New role (super_admin, admin, editor, viewer)
   * @returns {Promise<Object>} Updated user
   */
  updateUserRole: async (id, role) => {
    try {
      logger.log(`🔄 Updating user ${id} role to ${role}...`);
      const response = await apiClient.patch(
        `${API_ROUTES.USERS.BY_ID(id)}/role`,
        { role }
      );
      const data = handleResponse(response);
      logger.log('✅ User role updated');
      return data;
    } catch (error) {
      handleApiError(error, { 
        context: 'usersService.updateUserRole',
        showToast: true,
      });
      throw error;
    }
  },
};

export default usersService;

