/**
 * Impact Data Service
 * Impact data, management, mentors, and reports API calls
 */
import apiClient from '../client/axiosClient';
import { API_ROUTES } from '../endpoints/routes';
import { handleResponse, handleApiError } from '../../utils/api/responseHandler';
import logger from '../../utils/logger';

export const impactService = {
  /**
   * Get impact data
   * @returns {Promise<Object>} Impact data object
   */
  getImpactData: async () => {
    try {
      logger.log('🔄 Fetching impact data...');
      const response = await apiClient.get(API_ROUTES.IMPACT.BASE);
      const data = handleResponse(response);
      logger.log('✅ Impact data loaded');
      return data || { beneficiaries: 0, states: 0, projects: 0 };
    } catch (error) {
      handleApiError(error, { 
        context: 'impactService.getImpactData',
        showToast: false,
      });
      return { beneficiaries: 0, states: 0, projects: 0 };
    }
  },

  /**
   * Update impact data
   * @param {Object} impactData - Impact data object with beneficiaries, states, projects
   * @returns {Promise<Object>} Updated impact data
   */
  updateImpactData: async (impactData) => {
    try {
      logger.log('✏️ Updating impact data...');
      const response = await apiClient.put(API_ROUTES.IMPACT.BASE, impactData);
      const data = handleResponse(response);
      logger.log('✅ Impact data updated successfully');
      return data;
    } catch (error) {
      handleApiError(error, { 
        context: 'impactService.updateImpactData',
        showToast: true,
      });
      throw error;
    }
  },

  /**
   * Get management team
   * @returns {Promise<Array>} Array of management team members
   */
  getManagement: async () => {
    try {
      logger.log('🔄 Fetching management...');
      const response = await apiClient.get(API_ROUTES.MANAGEMENT.BASE);
      const data = handleResponse(response);
      logger.log(`✅ Management loaded: ${data?.length || 0} items`);
      return data || [];
    } catch (error) {
      handleApiError(error, { 
        context: 'impactService.getManagement',
        showToast: false,
      });
      return [];
    }
  },

  /**
   * Get mentors
   * @returns {Promise<Array>} Array of mentors
   */
  getMentors: async () => {
    try {
      logger.log('🔄 Fetching mentors...');
      const response = await apiClient.get(API_ROUTES.MENTORS.BASE);
      const data = handleResponse(response);
      logger.log(`✅ Mentors loaded: ${data?.length || 0} items`);
      return data || [];
    } catch (error) {
      handleApiError(error, { 
        context: 'impactService.getMentors',
        showToast: false,
      });
      return [];
    }
  },

  /**
   * Get reports
   * @returns {Promise<Array>} Array of reports
   */
  getReports: async () => {
    try {
      logger.log('🔄 Fetching reports...');
      const response = await apiClient.get(API_ROUTES.REPORTS.BASE);
      const data = handleResponse(response);
      logger.log(`✅ Reports loaded: ${data?.length || 0} items`);
      return data || [];
    } catch (error) {
      handleApiError(error, { 
        context: 'impactService.getReports',
        showToast: false,
      });
      return [];
    }
  },

  /**
   * Get all reports (admin - including unpublished)
   * @returns {Promise<Array>} Array of all reports
   */
  getAllReports: async () => {
    try {
      logger.log('🔄 Fetching all reports (admin)...');
      const response = await apiClient.get(`${API_ROUTES.REPORTS.BASE}/admin/all`);
      const data = handleResponse(response);
      logger.log(`✅ All reports loaded: ${data?.length || 0} items`);
      return data || [];
    } catch (error) {
      handleApiError(error, { 
        context: 'impactService.getAllReports',
        showToast: false,
      });
      return [];
    }
  },

  /**
   * Get board trustees
   * @returns {Promise<Array>} Array of board trustees
   */
  getBoardTrustees: async () => {
    try {
      logger.log('🔄 Fetching board trustees...');
      const response = await apiClient.get(API_ROUTES.BOARD_TRUSTEES.BASE);
      const data = handleResponse(response);
      logger.log(`✅ Board trustees loaded: ${data?.length || 0} items`);
      return data || [];
    } catch (error) {
      handleApiError(error, { 
        context: 'impactService.getBoardTrustees',
        showToast: false,
      });
      return [];
    }
  },

  // ========== REPORTS CRUD ==========
  /**
   * Create report
   * @param {FormData} formData - Report data with files (image, pdf)
   * @returns {Promise<Object>} Created report
   */
  createReport: async (formData) => {
    try {
      logger.log('📤 Creating report...');
      const response = await apiClient.post(API_ROUTES.REPORTS.BASE, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const data = handleResponse(response);
      logger.log('✅ Report created successfully');
      return data;
    } catch (error) {
      handleApiError(error, { 
        context: 'impactService.createReport',
        showToast: true,
      });
      throw error;
    }
  },

  /**
   * Update report
   * @param {number} id - Report ID
   * @param {FormData} formData - Updated report data
   * @returns {Promise<Object>} Updated report
   */
  updateReport: async (id, formData) => {
    try {
      logger.log(`✏️ Updating report ${id}...`);
      const response = await apiClient.put(`${API_ROUTES.REPORTS.BASE}/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const data = handleResponse(response);
      logger.log('✅ Report updated successfully');
      return data;
    } catch (error) {
      handleApiError(error, { 
        context: 'impactService.updateReport',
        showToast: true,
      });
      throw error;
    }
  },

  /**
   * Delete report
   * @param {number} id - Report ID
   * @returns {Promise<void>}
   */
  deleteReport: async (id) => {
    try {
      logger.log(`🗑️ Deleting report ${id}...`);
      await apiClient.delete(`${API_ROUTES.REPORTS.BASE}/${id}`);
      logger.log('✅ Report deleted successfully');
    } catch (error) {
      handleApiError(error, { 
        context: 'impactService.deleteReport',
        showToast: true,
      });
      throw error;
    }
  },

  /**
   * Toggle report publish status
   * @param {number} id - Report ID
   * @param {boolean} isPublished - Publish status
   * @returns {Promise<Object>} Updated report
   */
  toggleReportStatus: async (id, isPublished) => {
    try {
      logger.log(`🔄 Toggling report ${id} publish status to ${isPublished}...`);
      const response = await apiClient.patch(
        `${API_ROUTES.REPORTS.BASE}/${id}/publish`,
        { is_published: isPublished }
      );
      const data = handleResponse(response);
      logger.log('✅ Report publish status updated');
      return data;
    } catch (error) {
      handleApiError(error, { 
        context: 'impactService.toggleReportStatus',
        showToast: true,
      });
      throw error;
    }
  },

  // ========== MENTORS CRUD ==========
  /**
   * Create mentor
   * @param {FormData} formData - Mentor data with image
   * @returns {Promise<Object>} Created mentor
   */
  createMentor: async (formData) => {
    try {
      logger.log('📤 Creating mentor...');
      const response = await apiClient.post(API_ROUTES.MENTORS.BASE, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const data = handleResponse(response);
      logger.log('✅ Mentor created successfully');
      return data;
    } catch (error) {
      handleApiError(error, { 
        context: 'impactService.createMentor',
        showToast: true,
      });
      throw error;
    }
  },

  /**
   * Update mentor
   * @param {number} id - Mentor ID
   * @param {FormData} formData - Updated mentor data
   * @returns {Promise<Object>} Updated mentor
   */
  updateMentor: async (id, formData) => {
    try {
      logger.log(`✏️ Updating mentor ${id}...`);
      const response = await apiClient.put(`${API_ROUTES.MENTORS.BASE}/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const data = handleResponse(response);
      logger.log('✅ Mentor updated successfully');
      return data;
    } catch (error) {
      handleApiError(error, { 
        context: 'impactService.updateMentor',
        showToast: true,
      });
      throw error;
    }
  },

  /**
   * Delete mentor
   * @param {number} id - Mentor ID
   * @returns {Promise<void>}
   */
  deleteMentor: async (id) => {
    try {
      logger.log(`🗑️ Deleting mentor ${id}...`);
      await apiClient.delete(`${API_ROUTES.MENTORS.BASE}/${id}`);
      logger.log('✅ Mentor deleted successfully');
    } catch (error) {
      handleApiError(error, { 
        context: 'impactService.deleteMentor',
        showToast: true,
      });
      throw error;
    }
  },

  // ========== MANAGEMENT CRUD ==========
  /**
   * Create management member
   * @param {FormData} formData - Management data with image
   * @returns {Promise<Object>} Created management member
   */
  createManagement: async (formData) => {
    try {
      logger.log('📤 Creating management member...');
      const response = await apiClient.post(API_ROUTES.MANAGEMENT.BASE, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const data = handleResponse(response);
      logger.log('✅ Management member created successfully');
      return data;
    } catch (error) {
      handleApiError(error, { 
        context: 'impactService.createManagement',
        showToast: true,
      });
      throw error;
    }
  },

  /**
   * Update management member
   * @param {number} id - Management ID
   * @param {FormData} formData - Updated management data
   * @returns {Promise<Object>} Updated management member
   */
  updateManagement: async (id, formData) => {
    try {
      logger.log(`✏️ Updating management member ${id}...`);
      const response = await apiClient.put(`${API_ROUTES.MANAGEMENT.BASE}/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const data = handleResponse(response);
      logger.log('✅ Management member updated successfully');
      return data;
    } catch (error) {
      handleApiError(error, { 
        context: 'impactService.updateManagement',
        showToast: true,
      });
      throw error;
    }
  },

  /**
   * Delete management member
   * @param {number} id - Management ID
   * @returns {Promise<void>}
   */
  deleteManagement: async (id) => {
    try {
      logger.log(`🗑️ Deleting management member ${id}...`);
      await apiClient.delete(`${API_ROUTES.MANAGEMENT.BASE}/${id}`);
      logger.log('✅ Management member deleted successfully');
    } catch (error) {
      handleApiError(error, { 
        context: 'impactService.deleteManagement',
        showToast: true,
      });
      throw error;
    }
  },

  // ========== BOARD TRUSTEES CRUD ==========
  /**
   * Create board trustee
   * @param {FormData} formData - Trustee data with image
   * @returns {Promise<Object>} Created trustee
   */
  createBoardTrustee: async (formData) => {
    try {
      logger.log('📤 Creating board trustee...');
      const response = await apiClient.post(API_ROUTES.BOARD_TRUSTEES.BASE, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const data = handleResponse(response);
      logger.log('✅ Board trustee created successfully');
      return data;
    } catch (error) {
      handleApiError(error, { 
        context: 'impactService.createBoardTrustee',
        showToast: true,
      });
      throw error;
    }
  },

  /**
   * Update board trustee
   * @param {number} id - Trustee ID
   * @param {FormData} formData - Updated trustee data
   * @returns {Promise<Object>} Updated trustee
   */
  updateBoardTrustee: async (id, formData) => {
    try {
      logger.log(`✏️ Updating board trustee ${id}...`);
      const response = await apiClient.put(API_ROUTES.BOARD_TRUSTEES.BY_ID(id), formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const data = handleResponse(response);
      logger.log('✅ Board trustee updated successfully');
      return data;
    } catch (error) {
      handleApiError(error, { 
        context: 'impactService.updateBoardTrustee',
        showToast: true,
      });
      throw error;
    }
  },

  /**
   * Delete board trustee
   * @param {number} id - Trustee ID
   * @returns {Promise<void>}
   */
  deleteBoardTrustee: async (id) => {
    try {
      logger.log(`🗑️ Deleting board trustee ${id}...`);
      await apiClient.delete(API_ROUTES.BOARD_TRUSTEES.BY_ID(id));
      logger.log('✅ Board trustee deleted successfully');
    } catch (error) {
      handleApiError(error, { 
        context: 'impactService.deleteBoardTrustee',
        showToast: true,
      });
      throw error;
    }
  },
};

export default impactService;

