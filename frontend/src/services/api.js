import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_REACT_APP_API_URL || 'https://restaurant-pos-backend-etv5.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
};

// Menu API
export const menuAPI = {
  getAll: () => api.get('/menu'),
  getById: (id) => api.get(`/menu/${id}`),
  create: (formData) => api.post('/menu', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  update: (id, formData) => api.put(`/menu/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  delete: (id) => api.delete(`/menu/${id}`),
};

// Cart API
export const cartAPI = {
  add: (menuId, quantity = 1) => api.post('/cart/add', { menu_id: menuId, quantity }),
  get: () => api.get('/cart'),
  update: (menuId, quantity) => api.put('/cart/update', { menu_id: menuId, quantity }),
  remove: (menuId) => api.delete(`/cart/remove/${menuId}`),
  clear: () => api.delete('/cart/clear'),
};

// Orders API
export const ordersAPI = {
  create: (orderData) => api.post('/orders/create', orderData),
  getById: (id) => api.get(`/orders/${id}`),
  getByNumber: (orderNumber) => api.get(`/orders/number/${orderNumber}`),
  getAll: () => api.get('/orders/all'),
};

// Reports API
export const reportsAPI = {
  getMonthly: (month, year) => api.get('/reports/monthly', { params: { month, year } }),
};

// Settings API
export const settingsAPI = {
  get: () => api.get('/settings'),
  update: (settingsData) => api.put('/settings', settingsData),
};

export default api;
