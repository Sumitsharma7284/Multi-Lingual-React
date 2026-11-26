import axios from 'axios';

const defaultBaseUrl = import.meta.env.PROD
  ? '/api'
  : (import.meta.env.VITE_API_URL || 'http://localhost:5000/api');

const api = axios.create({
  baseURL: defaultBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('rajpatra_admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle Unauthorized (401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If unauthorized on admin endpoint, clear stale token
      if (window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin/login') {
        localStorage.removeItem('rajpatra_admin_token');
        localStorage.removeItem('rajpatra_admin_data');
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

// ==========================================
// PUBLIC API METHODS
// ==========================================

export const getPublicOrders = async (params = {}) => {
  const response = await api.get('/orders', { params });
  return response.data;
};

export const getPublicOrderById = async (id) => {
  const response = await api.get(`/orders/${id}`);
  return response.data;
};

export const getDepartments = async () => {
  const response = await api.get('/orders/meta/departments');
  return response.data;
};

export const getCategories = async () => {
  const response = await api.get('/orders/meta/categories');
  return response.data;
};

export const summarizeOrder = async (payload) => {
  const response = await api.post('/orders/summarize', payload);
  return response.data;
};

// ==========================================
// AUTHENTICATION API METHODS
// ==========================================

export const loginAdmin = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

export const getAdminProfile = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

// ==========================================
// ADMIN API METHODS
// ==========================================

export const getAdminOrders = async (params = {}) => {
  const response = await api.get('/admin/orders', { params });
  return response.data;
};

export const getAdminOrderById = async (id) => {
  const response = await api.get(`/admin/orders/${id}`);
  return response.data;
};

export const getAdminStats = async () => {
  const response = await api.get('/admin/orders/stats/summary');
  return response.data;
};

export const createAdminOrder = async (formData) => {
  const response = await api.post('/admin/orders', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const updateAdminOrder = async (id, formData) => {
  const response = await api.put(`/admin/orders/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const toggleAdminOrderStatus = async (id) => {
  const response = await api.patch(`/admin/orders/${id}/status`);
  return response.data;
};

export const deleteAdminOrder = async (id) => {
  const response = await api.delete(`/admin/orders/${id}`);
  return response.data;
};

export default api;
