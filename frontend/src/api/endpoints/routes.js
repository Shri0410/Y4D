/**
 * API Endpoint Constants
 * Centralized route definitions for consistency and maintainability
 * 
 * Usage:
 *   import { API_ROUTES } from '../api/endpoints/routes';
 *   const url = API_ROUTES.BANNERS.BY_PAGE('home');
 */
export const API_ROUTES = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    RESET_PASSWORD: '/auth/reset-password',
    REQUEST_PASSWORD_RESET: '/auth/request-password-reset',
    VERIFY_TOKEN: '/auth/verify-token',
  },

  // Banners
  BANNERS: {
    BASE: '/banners',
    BY_PAGE: (page) => `/banners/page/${page}`,
    BY_ID: (id) => `/banners/${id}`,
    ACTIVE: '/banners/active',
    PAGES_LIST: '/banners/pages/list',
  },

  // Media
  MEDIA: {
    BASE: '/media',
    BY_TYPE: (type) => `/media/${type}`,
    BY_ID: (type, id) => `/media/${type}/${id}`,
    PUBLISHED: (type) => `/media/published/${type}`,
    ADMIN_BY_TYPE: (type) => `/media/admin/${type}`,
  },

  // Careers
  CAREERS: {
    BASE: '/careers',
    ACTIVE: '/careers/active',
    APPLY: '/careers/apply',
    BY_ID: (id) => `/careers/${id}`,
  },

  // Users
  USERS: {
    BASE: '/users',
    BY_ID: (id) => `/users/${id}`,
    PERMISSIONS: (id) => `/users/${id}/permissions`,
    UPDATE_STATUS: (id) => `/users/${id}/status`,
  },

  // Payment
  PAYMENT: {
    CREATE_ORDER: '/payment/create-order',
    VERIFY_PAYMENT: '/payment/verify-payment',
    KEY: '/payment/key',
  },

  // Impact Data
  IMPACT: {
    BASE: '/impact-data',
  },

  // Management
  MANAGEMENT: {
    BASE: '/management',
  },

  // Mentors
  MENTORS: {
    BASE: '/mentors',
  },

  // Reports
  REPORTS: {
    BASE: '/reports',
  },

  // Accreditations
  ACCREDITATIONS: {
    BASE: '/accreditations',
  },

  // Our Work
  OUR_WORK: {
    BASE: (category) => `/ourwork/${category}`,
    ADMIN_BASE: (category) => `/ourwork/admin/${category}`,
    BY_ID: (category, id) => `/ourwork/${category}/${id}`,
    BY_CATEGORY: (category) => `/ourwork/${category}`,
  },

  // Board Trustees
  BOARD_TRUSTEES: {
    BASE: '/board-trustees',
    BY_ID: (id) => `/board-trustees/${id}`,
  },

  // Corporate Partnership
  CORPORATE_PARTNERSHIP: {
    BASE: '/corporate-partnership/corporate-partnership',
  },

  // Contact
  CONTACT: {
    BASE: '/contact',
  },

  // Registration
  REGISTRATION: {
    REQUEST: '/registration/request',
    REQUESTS: '/registration/requests',
    STATS: '/registration/stats',
    APPROVE: (id) => `/registration/requests/${id}/approve`,
    REJECT: (id) => `/registration/requests/${id}/reject`,
  },
};

export default API_ROUTES;

