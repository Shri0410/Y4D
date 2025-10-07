// src/services/api.js
import axios from "axios";

const API_BASE = "http://localhost:5000/api";

// Create axios instance for consistent configuration
const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Get all careers
export const getCareers = async () => {
  const response = await api.get('/careers');
  return response.data;
};

// Apply for a job
export const applyForJob = async (applicationData) => {
  const response = await api.post('/careers/apply', applicationData);
  return response.data;
};

// Fetch impact data
export const getImpactData = async () => {
  const response = await api.get('/impact-data');
  return response.data;
};

// Fetch management data
export const getManagement = async () => {
  const response = await api.get('/management');
  return response.data;
};

// Fetch mentors
export const getMentors = async () => {
  const response = await api.get('/mentors');
  return response.data;
};

// Fetch reports
export const getReports = async () => {
  const response = await api.get('/reports');
  return response.data;
};

// Fetch accreditations
export const getAccreditations = async () => {
  try {
    console.log('🔄 Fetching accreditations from API...');
    const response = await api.get('/accreditations');
    console.log('✅ Accreditations API Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching accreditations:', error);
    console.error('❌ Error details:', error.response?.data);
    return [];
  }
};

export default api;