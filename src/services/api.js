import axios from 'axios';

// Menggunakan environment variable atau fallback ke URL default
// Pastikan VITE_API_BASE_URL diatur di file .env Anda, misal: VITE_API_BASE_URL=https://api.thrqrhmn.my.id/api
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.thrqrhmn.my.id/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor untuk menyisipkan token di setiap request
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

// Interceptor untuk menangani response error (misal token expired)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Hapus data sesi jika unauthorized
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('name');
      localStorage.removeItem('nim');
      localStorage.removeItem('nip');
      
      // Redirect ke login jika bukan sedang di halaman login/register
      // Menggunakan window.location agar refresh state auth terjadi sepenuhnya
      if (!window.location.pathname.match(/\/auth\/(login|register)/)) {
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;