import { api } from './config';

export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/user', userData),
  verifyToken: () => api.get('/auth/verify'),
};

export const userApi = {
  getusers: () => api.get('/user'),
  getProfile: (id) => api.get(`/user/${id}`),
  updateProfile: (id, data) => api.put(`/user/${id}`, data),
  deleteAccount: (id) => api.delete(`/user/${id}`),
  updatePhoto: (id, file) => {
    const formData = new FormData();
    formData.append('photo', file);
    
    return api.post(`/user/${id}/photo`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
};

// Use cryptoApiConfig para todas as chamadas de criptomoeda
export const marketApi = {
  // Métodos existentes
  getPrices: () => api.get('/crypto/prices'),
  getAllTickers: () => api.get('/crypto/tickers'),
  getTickerBySymbol: (symbol) => api.get(`/crypto/ticker/${symbol}`),
  
  // Novos métodos para gainers, losers e trending
  getGainers: (limit = 5) => api.get('/crypto/gainers', { 
    params: { limit } 
  }),
  getLosers: (limit = 5) => api.get('/crypto/losers', { 
    params: { limit } 
  }),
  getTrending: (limit = 5) => api.get('/crypto/trending', { 
    params: { limit } 
  }),
  
  getOrderBook: (symbol, limit = 100) => api.get(`/crypto/orderbook/${symbol}`, {
    params: { limit }
  }),
  getRecentTrades: (symbol, limit = 500) => api.get(`/crypto/trades/${symbol}`, {
    params: { limit }
  }),
  getCoinData: (symbol) => api.get(`/market/coin/${symbol}`),
  getHistory: (symbol, timeframe) => api.get(`/market/history/${symbol}`, { 
    params: { timeframe } 
  }),
  getAllCryptos: () => api.get('/Crypto'),
  getCryptoBySymbol: (symbol) => userApiConfig.get(`/Crypto/${symbol}`),
  getCryptoIcon: (symbol) => `https://bin.bnbstatic.com/image/crypto/${symbol.toLowerCase()}.png`,
  getKlines: (symbol, interval = '15m', limit = 100) => 
    api.get(`/crypto/klines/${symbol}`, {
      params: { interval, limit }
    }),
};

// Novo serviço para chamadas à API de Carteira
export const walletApi = {
  // Métodos existentes
  getAllWallets: () => api.get('/Wallet'),
  getWalletById: (id) => api.get(`/Wallet/${id}`),
  getuserWallets: (userId) => api.get(`/Wallet/user/${userId}`),
  createWallet: (walletData) => api.post('/Wallet', walletData),
  updateWallet: (walletData) => api.put(`/Wallet/${walletData.id}`, walletData),
  getWalletTransactions: (walletId) => api.get(`/Wallet/${walletId}/transactions`),
  addTransaction: (walletId, transactionData) => api.post(`/Wallet/${walletId}/transactions`, transactionData),
  
  // Novos métodos para carteiras separadas
  getuserFiatWallets: (userId) => api.get(`/Wallet/user/${userId}/fiat`),
  getuserCryptoWallets: (userId) => api.get(`/Wallet/user/${userId}/crypto`),
  depositFiat: (data) => api.post('/Wallet/deposit/fiat', data),
  transferBetweenWallets: (data) => api.post('/Wallet/transfer', data),
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

export const currencyApi = {
  getAllCurrencies: () => api.get('/Currency'),
  getCurrencyById: (id) => api.get(`/Currency/${id}`),
  createCurrency: (currencyData) => api.post('/Currency', currencyData),
  updateCurrency: (id, currencyData) => api.put(`/Currency/${id}`, currencyData),
  deleteCurrency: (id) => api.delete(`/Currency/${id}`),
};