// src/services/api.js
import axios from "axios";
import { API_BASE } from "../config/api";
import { getToken, clearAuth } from "../utils/tokenManager";
import logger from "../utils/logger";
import { extractData, extractErrorMessage } from "../utils/apiResponse";

/* AXIOS INSTANCE (Production Base)*/
const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

/*REQUEST INTERCEPTOR (Token Injection) */
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

/* RESPONSE INTERCEPTOR (401 handler + logging)*/
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAuth();

      // Redirect admin panel users
      if (window.location.pathname.startsWith("/admin")) {
        window.location.href = "/admin";
      }
    }

    // Logs from File 1 + File 2 (merged)
    const extractedMsg = extractErrorMessage(error);
    logger.error("API Error:", {
      message: extractedMsg,
      status: error.response?.status,
      data: error.response?.data,
    });

    error.extractedMessage = extractedMsg;
    return Promise.reject(error);
  }
);

/*CAREERS*/
export const getCareers = async () => {
  console.log("🔄 Fetching careers...");
  const response = await api.get("/careers");
  console.log("✅ Careers loaded");
  return extractData(response);
};

// From File 2: multipart/form-data support
export const applyForJob = async (formData) => {
  console.log("📤 Submitting job application...");
  const response = await api.post("/careers/apply", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  console.log("✅ Application submitted");
  return extractData(response);
};

/* IMPACT / MANAGEMENT / MENTORS / REPORTS*/
export const getImpactData = async () => {
  console.log("🔄 Fetching impact data...");
  const response = await api.get("/impact-data");
  return extractData(response);
};

export const getManagement = async () => {
  console.log("🔄 Fetching management...");
  const response = await api.get("/management");
  return extractData(response);
};

export const getMentors = async () => {
  console.log("🔄 Fetching mentors...");
  const response = await api.get("/mentors");
  return extractData(response);
};

export const getReports = async () => {
  console.log("🔄 Fetching reports...");
  const response = await api.get("/reports");
  return extractData(response);
};

/* BANNERS (Merged Improvements)*/
export const getBanners = async (page = "home", section = null) => {
  try {
    console.log(`🔄 Fetching banners for: page=${page}, section=${section}`);

    let url = `/banners/page/${page}`;
    if (section) url += `?section=${section}`;

    const response = await api.get(url);

    console.log("✅ Banners response:", extractData(response));
    return extractData(response);
  } catch (error) {
    console.error("❌ Error fetching banners:", error.response?.data);
    logger.error("Banner API Error:", error);
    return [];
  }
};

export const getAllBanners = async () => {
  try {
    console.log("🔄 Fetching all banners...");
    const response = await api.get("/banners");
    console.log("✅ All banners received");
    return extractData(response);
  } catch (error) {
    logger.error("❌ Error fetching all banners:", error);
    return [];
  }
};

/* ACCREDITATIONS */
export const getAccreditations = async () => {
  try {
    console.log("🔄 Fetching accreditations...");
    const response = await api.get("/accreditations");
    console.log("✅ Accreditations loaded");
    return extractData(response);
  } catch (error) {
    console.error("❌ Accreditations error:", error.response?.data);
    return [];
  }
};

export default api;
