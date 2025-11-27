// src/services/api.js
import axios from "axios";
import { API_BASE } from "../config/api";
import { getToken, clearAuth } from "../utils/tokenManager";
import logger from "../utils/logger";
import { extractData, extractErrorMessage } from "../utils/apiResponse";

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
    const token = getToken();
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
  (response) => {
    // Response is successful, return as is
    // Components can use extractData() to get the data
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized - token expired or invalid
    if (error.response?.status === 401) {
      // Clear auth data
      clearAuth();
      
      // Redirect to login if not already there
      if (window.location.pathname.startsWith("/admin")) {
        window.location.href = "/admin";
      }
    }
    
    // Extract error message from standardized response
    const errorMessage = extractErrorMessage(error);
    
    // Log error using logger utility
    logger.error("API Error:", {
      message: errorMessage,
      status: error.response?.status,
      data: error.response?.data
    });
    
    // Enhance error object with extracted message
    error.extractedMessage = errorMessage;
    
    return Promise.reject(error);
  }
);

// Get all careers
export const getCareers = async () => {
  const response = await api.get("/careers");
  return extractData(response);
};

// Apply for a job
export const applyForJob = async (applicationData) => {
  const response = await api.post("/careers/apply", applicationData);
  return extractData(response);
};

// Fetch impact data
export const getImpactData = async () => {
  const response = await api.get("/impact-data");
  return extractData(response);
};

// Fetch management data
export const getManagement = async () => {
  const response = await api.get("/management");
  return extractData(response);
};

// Fetch mentors
export const getMentors = async () => {
  const response = await api.get("/mentors");
  return extractData(response);
};

// Fetch reports
export const getReports = async () => {
  const response = await api.get("/reports");
  return extractData(response);
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
    return extractData(response);
  } catch (error) {
    logger.error("Error fetching banners:", error);
    return [];
  }
};

// Fetch all active banners (for multiple sections)
export const getAllBanners = async () => {
  try {
    const response = await api.get("/banners");
    return response.data;
  } catch (error) {
    logger.error("Error fetching all banners:", error);
    return [];
  }
};
// Fetch accreditations
export const getAccreditations = async () => {
  try {
    const response = await api.get("/accreditations");
    return response.data;
  } catch (error) {
    logger.error("Error fetching accreditations:", error);
    return [];
  }
};

export default api;
