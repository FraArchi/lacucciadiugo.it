import axios from 'axios';

// API Client configuration
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
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

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ============================================
// AUTH API
// ============================================
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  refreshToken: () => api.post('/auth/refresh'),
};

// ============================================
// DOGS API
// ============================================
export const dogsAPI = {
  getAll: () => api.get('/dogs'),
  getOne: (id) => api.get(`/dogs/${id}`),
  create: (data) => api.post('/dogs', data),
  update: (id, data) => api.put(`/dogs/${id}`, data),
  delete: (id) => api.delete(`/dogs/${id}`),
  
  // Health Records
  getHealthRecords: (dogId) => api.get(`/dogs/${dogId}/health`),
  addHealthRecord: (dogId, data) => api.post(`/dogs/${dogId}/health`, data),
  deleteHealthRecord: (dogId, recordId) => api.delete(`/dogs/${dogId}/health/${recordId}`),
};

// ============================================
// MARKETPLACE API
// ============================================
export const marketplaceAPI = {
  getListings: (params) => api.get('/marketplace', { params }),
  getListing: (id) => api.get(`/marketplace/${id}`),
  createListing: (data) => api.post('/marketplace', data),
  updateListing: (id, data) => api.put(`/marketplace/${id}`, data),
  deleteListing: (id) => api.delete(`/marketplace/${id}`),
  sendInquiry: (id, data) => api.post(`/marketplace/${id}/inquiry`, data),
  getMyListings: () => api.get('/marketplace/my/listings'),
  getMyInquiries: () => api.get('/marketplace/my/inquiries'),
};

// ============================================
// GROUPS API
// ============================================
export const groupsAPI = {
  getAll: (params) => api.get('/groups', { params }),
  getPopular: (region) => api.get('/groups/popular', { params: { region } }),
  getOne: (slug) => api.get(`/groups/${slug}`),
  create: (data) => api.post('/groups', data),
  join: (slug) => api.post(`/groups/${slug}/join`),
  leave: (slug) => api.post(`/groups/${slug}/leave`),
  getPosts: (slug, params) => api.get(`/groups/${slug}/posts`, { params }),
  getMyMemberships: () => api.get('/groups/my/memberships'),
};

// ============================================
// VIDEO ANALYSIS API
// ============================================
export const videoAPI = {
  upload: (formData) => api.post('/videos/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000, // 60s for video upload
  }),
  getAnalysis: (id) => api.get(`/videos/${id}`),
  getAll: (params) => api.get('/videos', { params }),
  getTutorials: () => api.get('/videos/tutorials/recommended'),
  delete: (id) => api.delete(`/videos/${id}`),
};

// ============================================
// USER API
// ============================================
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  uploadAvatar: (formData) => api.post('/users/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};

export default api;
