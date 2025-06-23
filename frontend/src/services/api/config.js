import axios from 'axios';

// API para serviços de usuários
export const userApiConfig = axios.create({
  baseURL: 'http://localhost:5294/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// API para serviços de criptomoedas
export const cryptoApiConfig = axios.create({
  baseURL: 'http://localhost:5101/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// API para serviços de carteira
export const walletApiConfig = axios.create({
  baseURL: 'http://localhost:5275/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

export const currencyApiConfig = axios.create({
  baseURL: 'http://localhost:5169/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Configuração comum para ambas as APIs
const setupInterceptors = (apiInstance) => {
  apiInstance.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  apiInstance.interceptors.response.use(
    response => response,
    error => {
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );

  return apiInstance;
};

// Aplicar interceptadores a todas as APIs
setupInterceptors(userApiConfig);
setupInterceptors(cryptoApiConfig);
setupInterceptors(walletApiConfig);
setupInterceptors(currencyApiConfig);

// Para compatibilidade com código existente
export default userApiConfig;