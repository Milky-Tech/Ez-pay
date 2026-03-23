// /lib/api.ts
// Simple API client for EZ-Pay system

import axios, { AxiosInstance, AxiosResponse, AxiosError } from "axios";

// Define API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    // Add token to requests if it exists
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    // Handle unauthorized errors
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
    }

    // Handle other errors
    if (error.response?.status === 403) {
      console.error("Access forbidden");
    }

    return Promise.reject(error);
  }
);

// Simple API client export
export default api;
