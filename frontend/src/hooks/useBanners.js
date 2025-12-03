import { useState, useEffect } from 'react';
import { getBanners } from '../services/api';
import logger from "../utils/logger";

export const useBanners = (page, section = null) => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = await getBanners(page, section);
        setBanners(data);
      } catch (err) {
        setError(err.message);
        if (import.meta.env.DEV) {
          logger.error('Error fetching banners:', err);
        }
      } finally {
        setLoading(false);
      }
    };

    if (page) {
      fetchBanners();
    }
  }, [page, section]);

  return { banners, loading, error };
};

// Alternative: Simple function for specific page/section
export const getPageBanners = async (page, section = null) => {
  try {
    return await getBanners(page, section);
  } catch (error) {
    if (import.meta.env.DEV) {
      logger.error('Error fetching page banners:', error);
    }
    return [];
  }
};
