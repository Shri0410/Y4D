// src/services/api.js
import axios from "axios";

const API_BASE = "http://localhost:5000/api";

// Get all careers
export const getCareers = async () => {
  const response = await axios.get(`${API_BASE}/careers`);
  return response.data;
};

// Apply for a job
export const applyForJob = async (applicationData) => {
  const response = await axios.post(
    `${API_BASE}/careers/apply`,
    applicationData
  );
  return response.data;
};

// Example: fetch impact data
export const getImpactData = async () => {
  const response = await axios.get("http://localhost:5000/api/impact-data");
  return response.data;
};

// Example: fetch management data
export const getManagement = async () => {
  const response = await axios.get("http://localhost:5000/api/management");
  return response.data;
};

// Fetch mentors
export const getMentors = async () => {
  const response = await axios.get("http://localhost:5000/api/mentors");
  return response.data;
};

// Fetch reports
export const getReports = async () => {
  const response = await axios.get("http://localhost:5000/api/reports");
  return response.data;
};
