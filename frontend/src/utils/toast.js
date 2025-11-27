/**
 * Toast Notification Utility
 * Centralized toast notification system using react-toastify
 */

import { toast as toastify } from 'react-toastify';

// Configure toast defaults
export const configureToast = () => {
  // This will be called in App.jsx
};

/**
 * Show success toast
 */
export const toast = {
  success: (message, options = {}) => {
    toastify.success(message, {
      position: 'top-right',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      ...options
    });
  },

  /**
   * Show error toast
   */
  error: (message, options = {}) => {
    toastify.error(message, {
      position: 'top-right',
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      ...options
    });
  },

  /**
   * Show warning toast
   */
  warning: (message, options = {}) => {
    toastify.warning(message, {
      position: 'top-right',
      autoClose: 4000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      ...options
    });
  },

  /**
   * Show info toast
   */
  info: (message, options = {}) => {
    toastify.info(message, {
      position: 'top-right',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      ...options
    });
  },

  /**
   * Show promise toast (for async operations)
   */
  promise: (promise, messages) => {
    return toastify.promise(promise, messages);
  }
};

export default toast;

