import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

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
  create: (paymentMethod = 'custom', metadata = {}) => api.post('/orders/create', { payment_method: paymentMethod, ...metadata }),
  getById: (id) => api.get(`/orders/${id}`),
  getAll: () => api.get('/orders'),
};

// Reports API
export const reportsAPI = {
  getMonthly: (month, year) => api.get('/reports/monthly', { params: { month, year } }),
};

export default api;
