import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

// Generic API call function
export const apiCall = async (method, endpoint, data = null) => {
  try {
    const response = await axios({
      method,
      url: `${API_BASE}${endpoint}`,
      data,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error(`API Error (${method} ${endpoint}):`, error);
    throw error;
  }
};
export const getImpactData = async () => {
  try {
    const response = await axios.get(`${API_BASE}/impact-data`);
    return response.data;
  } catch (error) {
    console.error('Error fetching impact data:', error);
    // Return default values if API fails
    return {
      beneficiaries: 15,
      states: 20,
      projects: 200
    };
  }
};
// Specific API functions
export const getReports = () => apiCall('get', '/reports');
export const getMentors = () => apiCall('get', '/mentors');
export const getManagement = () => apiCall('get', '/management');
export const getCareers = () => apiCall('get', '/careers/active');
export const getNewsletters = () => apiCall('get', '/media/newsletters');
export const getStories = () => apiCall('get', '/media/stories');
export const getEvents = () => apiCall('get', '/media/events');
export const getBlogs = () => apiCall('get', '/media/blogs');
export const getDocumentaries = () => apiCall('get', '/media/documentaries');