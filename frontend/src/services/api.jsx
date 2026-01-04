/**
 * Legacy API Service
 * 
 * This file maintains backward compatibility while transitioning to the new API structure.
 * New code should use the services from api/services/ instead.
 * 
 * @deprecated Use api/services/*.service.js instead
 */

// Re-export the new API client for backward compatibility
export { default as api } from '../api/client/axiosClient';
export { default as apiClient } from '../api/client/axiosClient';

// Re-export services with old function names for backward compatibility
import { bannerService } from '../api/services/banners.service';
import { careersService } from '../api/services/careers.service';
import { impactService } from '../api/services/impact.service';
import { accreditationsService } from '../api/services/accreditations.service';
import { extractData } from '../utils/apiResponse';
import logger from '../utils/logger';

/**
 * Legacy function exports for backward compatibility
 * These wrap the new service methods
 */

// Careers
export const getCareers = async () => {
  return careersService.getActiveCareers();
};

export const applyForJob = async (formData) => {
  return careersService.applyForJob(formData);
};

// Impact / Management / Mentors / Reports
export const getImpactData = async () => {
  return impactService.getImpactData();
};

export const getManagement = async () => {
  return impactService.getManagement();
};

export const getMentors = async () => {
  return impactService.getMentors();
};

export const getReports = async () => {
  return impactService.getReports();
};

// Banners
export const getBanners = async (page = "home", section = null) => {
  return bannerService.getBanners(page, section);
};

export const getAllBanners = async () => {
  return bannerService.getAllBanners();
};

// Accreditations
export const getAccreditations = async () => {
  return accreditationsService.getAccreditations();
};

// Default export (axios client for backward compatibility)
import apiClient from '../api/client/axiosClient';
export default apiClient;
