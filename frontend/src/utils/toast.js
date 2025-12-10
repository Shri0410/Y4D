/**
 * Toast Notification Utility
 * Centralized toast notification system using react-toastify
 */

import { toast as toastify, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Configure toast defaults
export const configureToast = () => {
  // This will be called in App.jsx
};

// Export ToastContainer for use in App.jsx
export { ToastContainer };

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
      theme: 'colored',
      style: {
        backgroundColor: '#4CAF50',
        color: 'white',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '500',
      },
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
      theme: 'colored',
      style: {
        backgroundColor: '#f44336',
        color: 'white',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '500',
      },
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
      theme: 'colored',
      style: {
        backgroundColor: '#ff9800',
        color: 'white',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '500',
      },
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
      theme: 'colored',
      style: {
        backgroundColor: '#2196F3',
        color: 'white',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '500',
      },
      ...options
    });
  },

  /**
   * Show promise toast (for async operations)
   */
  promise: (promise, messages) => {
    return toastify.promise(promise, messages, {
      position: 'top-right',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: 'colored',
    });
  }
};

export default toast;