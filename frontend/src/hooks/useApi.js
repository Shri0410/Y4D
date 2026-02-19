/**
 * Generic API Hook
 * Reusable hook for data fetching with loading and error states
 * 
 * @example
 * const { data, loading, error, refetch } = useApi(
 *   () => bannerService.getBanners('home', 'hero'),
 *   []
 * );
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { handleApiError } from '../utils/api/responseHandler';

/**
 * Generic API hook for data fetching
 * @param {Function} apiCall - API function to call
 * @param {Array} dependencies - useEffect dependencies
 * @param {Object} options - Options
 * @param {boolean} options.immediate - Execute immediately on mount (default: true)
 * @param {Function} options.onSuccess - Success callback
 * @param {Function} options.onError - Error callback
 * @param {*} options.defaultData - Default data value
 * @param {boolean} options.showErrorToast - Show error toast (default: false)
 * @returns {Object} - { data, loading, error, refetch }
 */
export const useApi = (apiCall, dependencies = [], options = {}) => {
  const { 
    immediate = true, 
    onSuccess, 
    onError,
    defaultData = null,
    showErrorToast = false,
  } = options;

  const [data, setData] = useState(defaultData);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);
  const isMountedRef = useRef(true);

  const execute = useCallback(async () => {
    if (!isMountedRef.current) return;

    try {
      setLoading(true);
      setError(null);
      const result = await apiCall();
      
      if (!isMountedRef.current) return;
      
      setData(result);
      if (onSuccess) onSuccess(result);
      return result;
    } catch (err) {
      if (!isMountedRef.current) return;
      
      const errorMessage = handleApiError(err, { 
        showToast: showErrorToast,
        context: 'useApi',
      });
      setError(errorMessage);
      if (onError) onError(err);
      throw err;
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [apiCall, onSuccess, onError, showErrorToast]);

  useEffect(() => {
    isMountedRef.current = true;
    
    if (immediate) {
      execute();
    }

    return () => {
      isMountedRef.current = false;
    };
  }, [immediate, ...dependencies]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return { 
    data, 
    loading, 
    error, 
    refetch: execute,
    reset: () => {
      setData(defaultData);
      setError(null);
      setLoading(false);
    },
  };
};

export default useApi;

