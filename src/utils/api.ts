import axios, { type InternalAxiosRequestConfig, type AxiosResponse, type AxiosError } from 'axios';

// Backend URL
const BACKEND_URL = 'http://localhost:5000';

// Use proxy in development (Vite proxy) or direct URL in production
// In dev: /api → proxied to backend
// In prod: direct backend URL
const API_BASE_URL = import.meta.env.DEV 
  ? '/api'  // Vite proxy will forward to backend
  : `${BACKEND_URL}/api`;

// Log API configuration in development
if (import.meta.env.DEV) {
  console.log('[API] Development mode - Using proxy');
  console.log('[API] Base URL:', API_BASE_URL);
  console.log('[API] Proxy target:', BACKEND_URL);
  console.log('[API] If proxy fails, backend should be accessible at:', BACKEND_URL);
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log request in development
    if (import.meta.env.DEV) {
      const fullUrl = config.baseURL + config.url;
      console.log('[API] Request:', config.method?.toUpperCase(), fullUrl);
    }
    
    return config;
  },
  (error: AxiosError): Promise<AxiosError> => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear tokens and redirect to login
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

