import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  register: (userData) => api.post('/api/auth/register', userData),
  login: (credentials) => api.post('/api/auth/login', credentials),
};

// Items API calls
export const itemsAPI = {
  getLostItems: () => api.get('/api/items/lost'),
  reportItem: (itemData) => {
    // Create FormData for multipart/form-data
    const formData = new FormData();
    Object.keys(itemData).forEach(key => {
      if (itemData[key] !== null && itemData[key] !== undefined) {
        formData.append(key, itemData[key]);
      }
    });
    
    return api.post('/api/items/report', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  claimItem: (itemId) => api.post(`/api/items/claim/${itemId}`),
  getMyReports: () => api.get('/api/items/my-reports'),
  getMyClaims: () => api.get('/api/items/my-claims'),
  getMyPendingRequests: () => api.get('/api/items/my-pending-requests'),
  getAllItems: () => api.get('/api/items/all'),
};

// User API calls
export const userAPI = {
  getProfile: () => api.get('/api/users/me'),
};

// Admin API calls
export const adminAPI = {
  deleteItem: (itemId) => api.delete(`/api/items/${itemId}`),
};

export default api;
