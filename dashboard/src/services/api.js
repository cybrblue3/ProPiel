import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add token
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
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout')
};

// Patients API
export const patientsAPI = {
  getAll: (params) => api.get('/patients', { params }),
  getById: (id) => api.get(`/patients/${id}`),
  create: (data) => api.post('/patients', data),
  update: (id, data) => api.put(`/patients/${id}`, data),
  delete: (id) => api.delete(`/patients/${id}`)
};

// Appointments API
export const appointmentsAPI = {
  getAll: (params) => api.get('/appointments', { params }),
  getById: (id) => api.get(`/appointments/${id}`),
  create: (data) => api.post('/appointments', data),
  confirm: (id) => api.put(`/appointments/${id}/confirm`),
  cancel: (id, reason) => api.put(`/appointments/${id}/cancel`, { reason }),
  getPending: () => api.get('/appointments/pending'),
  getAvailableSlots: (params) => api.get('/appointments/available-slots', { params })
};

// Services API
export const servicesAPI = {
  getAll: () => api.get('/services'),
  getById: (id) => api.get(`/services/${id}`),
  create: (data) => api.post('/services', data),
  update: (id, data) => api.put(`/services/${id}`, data),
  delete: (id) => api.delete(`/services/${id}`)
};

// Doctors API
export const doctorsAPI = {
  getAll: () => api.get('/doctors'),
  getById: (id) => api.get(`/doctors/${id}`),
  create: (data) => api.post('/doctors', data),
  update: (id, data) => api.put(`/doctors/${id}`, data),
  delete: (id) => api.delete(`/doctors/${id}`)
};

// Dashboard API
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
  getTodayAppointments: () => api.get('/dashboard/appointments-today'),
  getRevenue: (params) => api.get('/dashboard/revenue', { params })
};

// Admin API
export const adminAPI = {
  // Stats
  getStats: () => api.get('/admin/stats'),

  // Appointments Management
  getAllAppointments: (params) => api.get('/admin/appointments', { params }),
  getPendingAppointments: () => api.get('/admin/appointments/pending'),
  getAppointment: (id) => api.get(`/admin/appointments/${id}`),
  confirmAppointment: (id) => api.patch(`/admin/appointments/${id}/confirm`),
  cancelAppointment: (id, cancellationReason) =>
    api.patch(`/admin/appointments/${id}/cancel`, { cancellationReason })
};

export default api;
