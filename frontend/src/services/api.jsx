// src/services/api.js
import axios from "axios";
import { API_BASE } from "../config/api";

// Create axios instance for consistent configuration
const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to automatically inject auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling and automatic logout on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized - token expired or invalid
    if (error.response?.status === 401) {
      // Clear auth data
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      
      // Redirect to login if not already there
      if (window.location.pathname.startsWith("/admin")) {
        window.location.href = "/admin";
      }
    }
    
    // Log error in development only
    if (import.meta.env.DEV) {
      console.error("API Error:", error.response?.data || error.message);
    }
    
    return Promise.reject(error);
  }
);

// Get all careers
export const getCareers = async () => {
  const response = await api.get("/careers");
  return response.data;
};

// Apply for a job
export const applyForJob = async (applicationData) => {
  const response = await api.post("/careers/apply", applicationData);
  return response.data;
};

// Fetch impact data
export const getImpactData = async () => {
  const response = await api.get("/impact-data");
  return response.data;
};

// Fetch management data
export const getManagement = async () => {
  const response = await api.get("/management");
  return response.data;
};

// Fetch mentors
export const getMentors = async () => {
  const response = await api.get("/mentors");
  return response.data;
};

// Fetch reports
export const getReports = async () => {
  const response = await api.get("/reports");
  return response.data;
};
// Add these functions to your services/api.jsx

// Fetch banners for specific page and section
export const getBanners = async (page = "home", section = null) => {
  try {
    let url = `/banners/page/${page}`;
    if (section) {
      url += `?section=${section}`;
    }

    const response = await api.get(url);
    return response.data;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error("❌ Error fetching banners:", error);
      console.error("❌ Error response:", error.response?.data);
    }
    return [];
  }
};

// Fetch all active banners (for multiple sections)
export const getAllBanners = async () => {
  try {
    const response = await api.get("/banners");
    return response.data;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error("❌ Error fetching all banners:", error);
    }
    return [];
  }
};
// Fetch accreditations
export const getAccreditations = async () => {
  try {
    const response = await api.get("/accreditations");
    return response.data;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error("❌ Error fetching accreditations:", error);
      console.error("❌ Error details:", error.response?.data);
    }
    return [];
  }
};

export default api;
