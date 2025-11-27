/**
 * Confirmation Dialog Utility
 * Provides a better UX alternative to window.confirm()
 */

/**
 * Show confirmation dialog
 * @param {string} message - Confirmation message
 * @param {string} title - Dialog title (optional)
 * @returns {Promise<boolean>} - Resolves to true if confirmed, false if cancelled
 */
export const confirmDialog = (message, title = 'Confirm') => {
  return new Promise((resolve) => {
    // For now, use window.confirm but this can be replaced with a custom modal
    // In the future, implement a custom modal component
    const confirmed = window.confirm(`${title}\n\n${message}`);
    resolve(confirmed);
  });
};

/**
 * Show confirmation dialog with custom options
 * @param {object} options - Dialog options
 * @param {string} options.message - Confirmation message
 * @param {string} options.title - Dialog title
 * @param {string} options.confirmText - Confirm button text
 * @param {string} options.cancelText - Cancel button text
 * @returns {Promise<boolean>} - Resolves to true if confirmed, false if cancelled
 */
export const confirmDialogAdvanced = (options) => {
  const {
    message,
    title = 'Confirm',
    confirmText = 'Yes',
    cancelText = 'No'
  } = options;

  return new Promise((resolve) => {
    // For now, use window.confirm but this can be replaced with a custom modal
    const confirmed = window.confirm(`${title}\n\n${message}`);
    resolve(confirmed);
  });
};

export default confirmDialog;

