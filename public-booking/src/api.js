import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://propiel-production.up.railway.app/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Public booking endpoints
export const getServices = () => api.get('/public/services');
export const getBlockedDates = () => api.get('/public/blocked-dates');
export const getAvailableSlots = (serviceId, date) =>
  api.get(`/public/available-slots?serviceId=${serviceId}&date=${date}`);
export const getPaymentConfig = () => api.get('/public/payment-config');
export const submitStep1 = (data) => api.post('/public/booking/step1', data);
export const submitStep3 = (formData) =>
  api.post('/public/booking/step3', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
export const submitStep4 = (data) => api.post('/public/booking/step4', data);
export const releaseHold = (holdToken) => api.delete(`/public/booking/release-hold/${holdToken}`);

export default api;
