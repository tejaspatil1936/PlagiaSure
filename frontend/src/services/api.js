// API service for Plagiarism + AI Content Checker
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  signup: (data) => api.post('/api/auth/signup', data),
  login: (data) => api.post('/api/auth/login', data),
  logout: () => api.post('/api/auth/logout'),
  getUser: () => api.get('/api/auth/user'),
};

// Assignments API
export const assignmentsAPI = {
  upload: (formData) => api.post('/api/assignments/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getAll: (params) => api.get('/api/assignments', { params }),
  getById: (id) => api.get(`/api/assignments/${id}`),
  delete: (id) => api.delete(`/api/assignments/${id}`),
  reextractText: (id) => api.post(`/api/assignments/${id}/reextract`),
};

// Reports API
export const reportsAPI = {
  generate: (assignmentId, recheck = false) => api.post('/api/reports/generate', { assignmentId, recheck }),
  getAll: (params) => api.get('/api/reports', { params }),
  getById: (id) => api.get(`/api/reports/${id}`),
};

// Billing API
export const billingAPI = {
  getPlans: () => api.get('/api/billing/plans'),
  requestSubscription: (data) => api.post('/api/billing/request-subscription', data),
  getStatus: () => api.get('/api/billing/status'),
  cancelRequest: () => api.post('/api/billing/cancel-request'),
  
  // Admin routes
  admin: {
    getRequests: (params) => api.get('/api/billing/admin/requests', { params }),
    approve: (id, data) => api.post(`/api/billing/admin/approve/${id}`, data),
    reject: (id, data) => api.post(`/api/billing/admin/reject/${id}`, data),
  }
};

// Utility functions
export const setAuthToken = (token) => {
  localStorage.setItem('auth_token', token);
};

export const removeAuthToken = () => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user_data');
};

export const getAuthToken = () => {
  return localStorage.getItem('auth_token');
};

export default api;