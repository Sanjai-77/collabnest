import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
                     (window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://collabnest-backend-nkw2.onrender.com');

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  withCredentials: true,
});

// Add a request interceptor to include the token in headers
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

export default api;
export { API_BASE_URL };
