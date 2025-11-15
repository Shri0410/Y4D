import { useState, useEffect } from 'react';
import { getBanners } from '../services/api';

export const useBanners = (page, section = null) => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        setLoading(true);
        setError(null);
        
        let url = `/banners/page/${page}`;
        if (section) {
          url += `?section=${section}`;
        }
        
        const response = await axios.get(`https://y4dorg-backend.onrender.com/api${url}`);
        setBanners(response.data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching banners:', err);
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
    let url = `/banners/page/${page}`;
    if (section) {
      url += `?section=${section}`;
    }
    
    const response = await axios.get(`http://localhost:5000/api${url}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching page banners:', error);
    return [];
  }
};
