/**
 * Loading State Hook
 * Manages loading and error states for async operations
 * 
 * @example
 * const { loading, error, execute } = useLoadingState();
 * 
 * const handleSubmit = async () => {
 *   await execute(async () => {
 *     await apiService.createItem(data);
 *   });
 * };
 */
import { useState, useCallback } from 'react';

/**
 * Hook for managing loading state
 * @param {boolean} initialState - Initial loading state
 * @returns {Object} - { loading, error, execute, reset }
 */
export const useLoadingState = (initialState = false) => {
  const [loading, setLoading] = useState(initialState);
  const [error, setError] = useState(null);

  const execute = useCallback(async (asyncFn) => {
    try {
      setLoading(true);
      setError(null);
      const result = await asyncFn();
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
  }, []);

  return { loading, error, execute, reset };
};

export default useLoadingState;

