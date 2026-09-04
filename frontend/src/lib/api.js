import axios from 'axios';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api/v1';
const api = axios.create({ baseURL: API_BASE_URL, headers: { 'Content-Type': 'application/json' } });
api.interceptors.request.use((config) => { const token = localStorage.getItem('sentriroad_token'); if (token) config.headers.Authorization = `Bearer ${token}`; return config; });
api.interceptors.response.use((r) => r, (error) => { if (error.response?.status === 401) { localStorage.removeItem('sentriroad_token'); localStorage.removeItem('sentriroad_user'); window.location.href = '/login'; } return Promise.reject(error); });
export { API_BASE_URL };
export default api;
