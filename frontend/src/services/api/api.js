import api from './config';

export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/User', userData),
  verifyToken: () => api.get('/auth/verify'),
};

export const userApi = {
  getUsers: () => api.get('/User'),
  getProfile: (id) => api.get(`/User/${id}`),
  updateProfile: (id, data) => api.put(`/User/${id}`, data),
  deleteAccount: (id) => api.delete(`/User/${id}`),
};

export const marketApi = {
  getPrices: () => api.get('/market/prices'),
  getCoinData: (symbol) => api.get(`/market/coin/${symbol}`),
  getHistory: (symbol, timeframe) => api.get(`/market/history/${symbol}`, { 
    params: { timeframe } 
  }),
  getAllCryptos: () => api.get('/Crypto'),
  getCryptoBySymbol: (symbol) => api.get(`/Crypto/${symbol}`),
  getCryptoIcon: (symbol) => `https://bin.bnbstatic.com/image/crypto/${symbol.toLowerCase()}.png`,
  // exemplo: https://bin.bnbstatic.com/image/crypto/btc.png
};

export const transactionApi = {
  getAll: () => api.get('/transactions'),
  create: (data) => api.post('/transactions', data),
  getById: (id) => api.get(`/transactions/${id}`),
  update: (id, data) => api.put(`/transactions/${id}`, data),
};

export const settingsApi = {
  get: () => api.get('/settings'),
  update: (data) => api.put('/settings', data),
};