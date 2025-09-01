import axios from 'axios';

// Instância única para o gateway
export const api = axios.create({
  baseURL: 'http://localhost:5102',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Interceptadores para autenticação e tratamento de erros
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;