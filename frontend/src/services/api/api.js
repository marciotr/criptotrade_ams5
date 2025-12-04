import { api } from './config';

export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/user', userData),
  verifyToken: () => api.get('/auth/verify'),
};

export const userApi = {
  getUsers: () => api.get('/user'),
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
  getWallet: () => api.get('/wallet'),
  createWallet: (data) => api.post('/wallet', data),
  getWallets: () => api.get('/wallets'),
  getWalletBalances: (walletId) => api.get(`/positions/${walletId}`),
  createWallets: (data) => api.post('/wallets', data),
  getBalances: () => api.get('/balance'),
  getBalance: () => api.get('/balance'),
  getSummary: () => api.get('/balance/summary'),
  getAssetLots: (assetSymbol, method = 'fifo') => api.get(`/balance/asset/${assetSymbol}/lots`, { params: { method } }),
  getCurrencies: () => api.get('/currencies'),
  adjustBalance: (assetSymbol, deltaAmount, options = {}) => {
    const payload = {
      DeltaAmount: deltaAmount,
      ReferenceId: options.referenceId ?? null,
      Description: options.description ?? null,
      Method: options.method ?? null,
      UnitPriceUsd: options.unitPriceUsd ?? null,
    };

    return api.patch(`/balance/${assetSymbol}`, payload);
  },
  sell: (data) => api.post('/transactions/sell', data),
  depositFiat: (data) => api.post('/transactions/deposit/fiat', data),
};

walletApi.getTransactions = () => api.get('/transactions');
walletApi.getWallet = walletApi.getWallet; 

export const transactionApi = {
  getAll: () => api.get('/transactions'),
  create: (data) => api.post('/transactions', data),
  getById: (id) => api.get(`/transactions/${id}`),
  update: (id, data) => api.put(`/transactions/${id}`, data),
  buy: (data) => api.post('/transactions/buy', data),
  sell: (data) => api.post('/transactions/sell', data),
  swap: (data) => api.post('/transactions/swap', data),
  depositFiat: (data) => api.post('/transactions/deposit/fiat', data),
  withdrawFiat: (data) => api.post('/transactions/withdraw/fiat', data),
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