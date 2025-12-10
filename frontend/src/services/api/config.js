import axios from 'axios';

// Instância única para o gateway
export const api = axios.create({
  baseURL: 'http://localhost:5102',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// permitir envio de cookies (refresh token em cookie HttpOnly)
api.defaults.withCredentials = true;

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
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      // evita tentar dar refresh se a requisição já era a rota de refresh
      if (originalRequest.url && originalRequest.url.includes('/auth/refresh')) {
        localStorage.removeItem('token');
        window.location.href = '/login';
        return Promise.reject(error);
      }

      return api.post('/auth/refresh', {}, { withCredentials: true })
        .then(res => {
          const newToken = res.data?.token;
          if (newToken) {
            localStorage.setItem('token', newToken);
            originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
            return api(originalRequest);
          }
          localStorage.removeItem('token');
          window.location.href = '/signin';
          return Promise.reject(error);
        })
        .catch(err => {
          localStorage.removeItem('token');
          window.location.href = '/signin';
          return Promise.reject(err);
        });
    }
    return Promise.reject(error);
  }
);

export default api;