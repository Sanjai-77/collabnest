import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
                     (window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://collabnest-backend-nkw2.onrender.com');

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  withCredentials: true,
  timeout: 15000, // 15s timeout — prevents hanging requests on slow networks
});

// Attach JWT token to every outgoing request
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

// Global response handling — catches expired tokens and server errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Token expired or invalid — force re-login
    if (error.response?.status === 401) {
      const isAuthRoute = error.config?.url?.includes('/auth/login') || 
                          error.config?.url?.includes('/auth/register') ||
                          error.config?.url?.includes('/auth/google');
      
      // Only redirect if it's NOT a login attempt failing (that's just wrong credentials)
      if (!isAuthRoute) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;
export { API_BASE_URL };
