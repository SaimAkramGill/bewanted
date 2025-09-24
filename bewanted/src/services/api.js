import axios from 'axios';

const API_URL = process.env.NODE_ENV === 'production'?'/api': (process.env.REACT_APP_API_URL || 'http://localhost:5000/api')

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// API methods
export const apiMethods = {
  // Auth endpoints
  auth: {
    login: (email, password) => api.post('/auth/login', { email, password }),
    register: (name, email, password) => api.post('/auth/register', { name, email, password }),
    getProfile: () => api.get('/auth/me'),
    updateProfile: (data) => api.put('/auth/profile', data),
    changePassword: (currentPassword, newPassword) => 
      api.put('/auth/change-password', { currentPassword, newPassword }),
  },
  
  // User endpoints
  users: {
    getAll: (page = 1, limit = 10) => api.get(`/users?page=${page}&limit=${limit}`),
    getById: (id) => api.get(`/users/${id}`),
    update: (id, data) => api.put(`/users/${id}`, data),
    delete: (id) => api.delete(`/users/${id}`),
    getStats: () => api.get('/users/admin/stats'),
  },
  
  // Health check
  health: () => api.get('/health'),
};

export default api;