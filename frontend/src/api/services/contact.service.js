/**
 * Contact Service
 * All contact and corporate partnership-related API calls
 */
import apiClient from '../client/axiosClient';
import { API_ROUTES } from '../endpoints/routes';
import { handleResponse, handleApiError } from '../../utils/api/responseHandler';
import logger from '../../utils/logger';

export const contactService = {
  /**
   * Submit contact form
   * @param {Object} contactData - Contact form data
   * @returns {Promise<Object>} Submission result
   */
  submitContact: async (contactData) => {
    try {
      logger.log('📧 Submitting contact form...');
      const response = await apiClient.post(API_ROUTES.CONTACT.BASE, contactData);
      const data = handleResponse(response);
      logger.log('✅ Contact form submitted successfully');
      return data;
    } catch (error) {
      handleApiError(error, { 
        context: 'contactService.submitContact',
        showToast: true,
      });
      throw error;
    }
  },

  /**
   * Submit corporate partnership request
   * @param {Object} partnershipData - { companyName, email, contact, details }
   * @returns {Promise<Object>} Submission result
   */
  submitCorporatePartnership: async (partnershipData) => {
    try {
      logger.log('🤝 Submitting corporate partnership request...');
      const response = await apiClient.post(API_ROUTES.CORPORATE_PARTNERSHIP.BASE, partnershipData);
      const data = handleResponse(response);
      logger.log('✅ Corporate partnership request submitted successfully');
      return data;
    } catch (error) {
      handleApiError(error, { 
        context: 'contactService.submitCorporatePartnership',
        showToast: true,
      });
      throw error;
    }
  },
};

export default contactService;

