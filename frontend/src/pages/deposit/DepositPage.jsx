import React, { useState, useEffect, useContext, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, DollarSign, Wallet, ChevronDown, TrendingUp, ArrowDown, Search, AlertCircle, Plus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { CryptoCard } from '../../components/common/CryptoCard';
import { PaymentMethodButton } from './components/PaymentMethodButton';
import CryptoIcon from '../../components/common/CryptoIcons';
import { walletApi, marketApi } from '../../services/api/api';
import { AuthContext } from '../../store/auth/AuthContext';
import { useNotification } from '../../context/NotificationContext';

// Manter apenas os métodos de pagamento
const paymentMethods = [
  { id: 'card', name: 'Credit Card', icon: CreditCard },
  { id: 'bank', name: 'Bank Transfer', icon: DollarSign },
  { id: 'crypto', name: 'Crypto Wallet', icon: Wallet },
];

// Animações
const dropdownVariants = {
  hidden: { 
    opacity: 0,
    y: -10,
    transition: {
      duration: 0.2
    }
  },
  visible: { 
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.2
    }
  },
  exit: { 
    opacity: 0,
    y: -10,
    transition: {
      duration: 0.2
    }
  }
};

const formVariants = {
  initial: {
    opacity: 0,
    x: -20,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
      staggerChildren: 0.1
    }
  },
  exit: {
    opacity: 0,
    x: 20,
    transition: {
      duration: 0.2
    }
  }
};

const inputVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 }
};

const tabVariants = {
  selected: {
    backgroundColor: 'var(--brand-primary-light)',
    color: 'var(--brand-primary)',
    scale: 1.05,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20
    }
  },
  notSelected: {
    backgroundColor: 'transparent',
    color: 'var(--text-secondary)',
    scale: 1
  }
};

export function DepositPage() {
  const [activeTab, setActiveTab] = useState('buy');
  const [amount, setAmount] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState(paymentMethods[0]);
  const [cryptoDropdownOpen, setCryptoDropdownOpen] = useState(false);
  const [methodDropdownOpen, setMethodDropdownOpen] = useState(false);
  const [tabHovered, setTabHovered] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCoins, setFilteredCoins] = useState([]);
  const [currencySearchQuery, setCurrencySearchQuery] = useState('');
  const [filteredCurrencies, setFilteredCurrencies] = useState(['USD', 'EUR', 'GBP', 'JPY', 'BRL']);
  const [isLoading, setIsLoading] = useState(false);
  const [userWallets, setUserWallets] = useState([]);
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [fiatWallets, setFiatWallets] = useState([]);
  
  // Estados para lidar com dados de API
  const [tickers, setTickers] = useState([]);
  const [apiCryptos, setApiCryptos] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hotCryptos, setHotCryptos] = useState([]);
  const [buyRecommendations, setBuyRecommendations] = useState([]);
  const [sellRecommendations, setSellRecommendations] = useState([]);
  
  const { user } = useContext(AuthContext);
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  // Calcular o valor estimado de criptomoeda com base no preço atual
  const estimatedCrypto = useMemo(() => {
    if (!amount || !selectedCoin || !selectedCoin.lastPrice) return '0';
    return (parseFloat(amount) / parseFloat(selectedCoin.lastPrice)).toFixed(8);
  }, [amount, selectedCoin]);

  // Buscar todos os tickers ao carregar a página
  useEffect(() => {
    const fetchTickers = async () => {
      try {
        const response = await marketApi.getAllTickers();
        if (response.data && Array.isArray(response.data)) {
          setTickers(response.data);
        }
      } catch (error) {
        console.warn("Couldn't load tickers from API:", error);
      }
    };
    
    fetchTickers();
    // Atualizar a cada 60 segundos
    const interval = setInterval(fetchTickers, 60000);
    return () => clearInterval(interval);
  }, []);

  // Transformar os tickers em um formato melhor para a interface
  const processedCryptos = useMemo(() => {
    if (!tickers.length) return [];
    
    return tickers
      .filter(ticker => ticker.symbol.endsWith('USDT'))
      .map(ticker => ({
        id: ticker.symbol,
        name: ticker.symbol.replace('USDT', ''),
        symbol: ticker.symbol.replace('USDT', ''),
        lastPrice: parseFloat(ticker.lastPrice),
        priceChange: parseFloat(ticker.priceChangePercent),
        volume: parseFloat(ticker.volume),
        data: [{ price: parseFloat(ticker.lastPrice) }]
      }));
  }, [tickers]);

  // Quando os tickers forem processados, atualiza apiCryptos e seleciona a primeira moeda
  useEffect(() => {
    if (processedCryptos.length > 0) {
      setApiCryptos(processedCryptos);
      setFilteredCoins(processedCryptos.slice(0, 20));
      
      // Se ainda não há moeda selecionada, seleciona a primeira
      if (!selectedCoin) {
        setSelectedCoin(processedCryptos[0]);
      }
      
      // Criar recomendações de compra/venda com base nos dados reais
      // Para as recomendações, classifica com base em diferentes critérios

      const sortedByVolume = [...processedCryptos]
        .sort((a, b) => b.volume - a.volume)
        .slice(0, 5);
      
      setHotCryptos(sortedByVolume.map(crypto => ({
        ...crypto,
        trending: true,
        change: crypto.priceChange
      })));
    
      const buyRecs = [...processedCryptos]
        .filter(c => c.priceChange < 0) 
        .sort((a, b) => a.priceChange - b.priceChange) 
        .slice(0, 5)
        .map(crypto => ({
          ...crypto,
          trending: true,
          change: crypto.priceChange,
          reason: crypto.priceChange < -10 
            ? 'Significant price drop opportunity' 
            : crypto.priceChange < -5
              ? 'Good entry point after dip'
              : 'Potential reversal point'
        }));
      
      setBuyRecommendations(buyRecs);
      
      // Sell recommendations - Maiores altas recentes (potencial de venda no topo)
      const sellRecs = [...processedCryptos]
        .filter(c => c.priceChange > 0) // Moedas em alta
        .sort((a, b) => b.priceChange - a.priceChange) // Maiores altas primeiro
        .slice(0, 5)
        .map(crypto => ({
          ...crypto,
          trending: true,
          change: crypto.priceChange,
          reason: crypto.priceChange > 15 
            ? 'Price reaching peak levels' 
            : crypto.priceChange > 10
              ? 'Consider taking profits'
              : 'Strong recent performance'
        }));
      
      setSellRecommendations(sellRecs);
    }
  }, [processedCryptos, selectedCoin]);

  useEffect(() => {
    if (user?.id) {
      fetchUserWallets();
    }
  }, [user]);

  useEffect(() => {
    if (user?.id) {
      const loadFiatWallets = async () => {
        try {
          const response = await walletApi.getUserFiatWallets(user.id);
          setFiatWallets(response.data);
        } catch (error) {
          console.error("Error loading fiat wallets:", error);
        }
      };
      
      loadFiatWallets();
    }
  }, [user]);

  const fetchUserWallets = async () => {
    try {
      const response = await walletApi.getUserWallets(user.id);
      setUserWallets(response.data);
      
      if (selectedCoin) {
        const existingWallet = response.data.find(wallet => 
          wallet.currency === selectedCoin.symbol
        );
        
        if (existingWallet) {
          setSelectedWallet(existingWallet);
        } else {
          setSelectedWallet(null);
        }
      }
    } catch (error) {
      console.error("Error fetching user wallets:", error);
      showNotification({
        message: "Failed to load wallets",
        type: "error"
      });
    }
  };

  // Função de filtro de criptomoedas com APIs e fallback
  const filterCoins = useCallback(async (query) => {
    setIsSearching(true);

    try {
      if (!query.trim()) {
        setFilteredCoins(apiCryptos.slice(0, 20));
        setIsSearching(false);
        return;
      }

      // Primeiro tenta buscar via API
      const response = await marketApi.searchCryptos(query.trim(), 20);
      
      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        setFilteredCoins(response.data);
      } else {
        // Fallback para busca local
        const localResults = apiCryptos
          .filter(coin => 
            (coin.name && coin.name.toLowerCase().includes(query.toLowerCase())) ||
            (coin.symbol && coin.symbol.toLowerCase().includes(query.toLowerCase())) ||
            (coin.id && coin.id.toLowerCase().includes(query.toLowerCase()))
          )
          .slice(0, 20);
        
        setFilteredCoins(localResults);
      }
    } catch (error) {
      console.log("API search failed, falling back to local filtering:", error);
      
      // Fallback se a API falhar
      const localResults = apiCryptos
        .filter(coin => 
          (coin.name && coin.name.toLowerCase().includes(query.toLowerCase())) ||
          (coin.symbol && coin.symbol.toLowerCase().includes(query.toLowerCase())) ||
          (coin.id && coin.id.toLowerCase().includes(query.toLowerCase()))
        )
        .slice(0, 20);
      
      setFilteredCoins(localResults);
    } finally {
      setIsSearching(false);
    }
  }, [apiCryptos]);

  // Debounce para pesquisa
  useEffect(() => {
    const handler = setTimeout(() => {
      filterCoins(searchQuery);
    }, 300);
    
    return () => clearTimeout(handler);
  }, [searchQuery, filterCoins]);

  // Atualizar a carteira selecionada quando a moeda mudar
  useEffect(() => {
    if (userWallets.length > 0 && selectedCoin) {
      const existingWallet = userWallets.find(wallet => 
        wallet.currency === selectedCoin.symbol
      );
      setSelectedWallet(existingWallet || null);
    }
  }, [selectedCoin, userWallets]);

  const filterCurrencies = (query) => {
    const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'BRL'];
    const filtered = currencies.filter(currency => 
      currency.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredCurrencies(filtered);
  };

  const handleContinue = async () => {
    if (!user) {
      showNotification({
        message: "Please login to continue",
        type: "error"
      });
      return;
    }

    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      showNotification({
        message: "Please enter a valid amount",
        type: "error"
      });
      return;
    }

    if (!selectedCoin) {
      showNotification({
        message: "Please select a cryptocurrency",
        type: "error"
      });
      return;
    }

    setIsLoading(true);

    try {
      const fiatWalletsResponse = await walletApi.getUserFiatWallets(user.id);
      const fiatWallet = fiatWalletsResponse.data.find(w => w.currency === selectedCurrency);
      
      if (!fiatWallet || fiatWallet.balance < parseFloat(amount)) {
        showNotification({
          message: `Insufficient ${selectedCurrency} balance. Please deposit funds first.`,
          type: "error"
        });
        setIsLoading(false);
        return;
      }

      if (activeTab === 'buy') {
        let cryptoWallet = null;
        
        if (selectedWallet) {
          cryptoWallet = selectedWallet;
        } else {
          const newWalletResponse = await walletApi.createWallet({
            userId: user.id,
            currency: selectedCoin.symbol,
            balance: 0,
            type: 1
          });
          cryptoWallet = newWalletResponse.data;
        }

        await walletApi.transferBetweenWallets({
          sourceWalletId: fiatWallet.id,
          destinationWalletId: cryptoWallet.id,
          amount: parseFloat(amount),
          conversionRate: 1 / selectedCoin.lastPrice
        });

        showNotification({
          message: `Successfully bought ${estimatedCrypto} ${selectedCoin.symbol}`,
          type: "success"
        });
      } else {
        if (!selectedWallet || selectedWallet.balance < parseFloat(estimatedCrypto)) {
          showNotification({
            message: `Insufficient ${selectedCoin.symbol} balance.`,
            type: "error"
          });
          setIsLoading(false);
          return;
        }
        
        await walletApi.transferBetweenWallets({
          sourceWalletId: selectedWallet.id,
          destinationWalletId: fiatWallet.id,
          amount: parseFloat(estimatedCrypto),
          conversionRate: selectedCoin.lastPrice
        });
        
        showNotification({
          message: `Successfully sold ${estimatedCrypto} ${selectedCoin.symbol} for ${amount} ${selectedCurrency}`,
          type: "success"
        });
      }

      setAmount('');
      fetchUserWallets();
      
    } catch (error) {
      console.error("Transaction error:", error);
      showNotification({
        message: error.response?.data?.message || "Transaction failed",
        type: "error"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDepositFiat = () => {
    navigate('/deposit/fiat');
  };

  const handleSelectRecommendedCoin = (coin) => {
    const matchedCoin = apiCryptos.find(c => c.id === coin.id || c.symbol === coin.symbol);
    if (matchedCoin) {
      setSelectedCoin(matchedCoin);
    }
  };

  return (
    <div className="p-2 sm:p-6 mt-12 sm:mt-16">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-text-primary px-2 sm:px-0">
          Deposit / Buy Crypto
        </h1>
        
        {selectedWallet && (
          <div className="mb-4 p-4 bg-background-secondary rounded-lg border border-border-primary">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="mr-3">
                  <CryptoIcon symbol={selectedWallet.currency} size={24} />
                </div>
                <div>
                  <h3 className="font-medium text-text-primary">{selectedWallet.currency} Wallet</h3>
                  <p className="text-sm text-text-secondary">Current Balance: {selectedWallet.balance} {selectedWallet.currency}</p>
                </div>
              </div>
              <button 
                onClick={fetchUserWallets}
                className="text-brand-primary hover:text-brand-primary-dark text-sm"
              >
                Refresh
              </button>
            </div>
          </div>
        )}

        <div className="mt-4 mb-6 p-4 bg-background-secondary rounded-lg border border-border-primary">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-text-primary">Your Fiat Wallets</h3>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDepositFiat}
              className="flex items-center text-sm font-medium text-brand-primary hover:text-brand-primary-dark"
            >
              <Plus size={16} className="mr-1" />
              Add Funds
            </motion.button>
          </div>
          
          {fiatWallets.length === 0 ? (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start">
              <AlertCircle size={16} className="text-amber-500 mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <p className="text-sm text-amber-700">
                  You don't have any fiat wallets yet. You need to deposit funds before buying crypto.
                </p>
                <button 
                  onClick={handleDepositFiat}
                  className="mt-2 inline-block text-sm font-medium text-brand-primary hover:underline"
                >
                  Deposit funds now →
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {fiatWallets.map(wallet => (
                <div key={wallet.id} className="flex justify-between items-center">
                  <span className="text-sm text-text-secondary">
                    {wallet.currency}
                  </span>
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-text-primary mr-3">
                      {wallet.currency === 'USD' ? '$' : wallet.currency === 'EUR' ? '€' : wallet.currency === 'BRL' ? 'R$' : ''}
                      {wallet.balance.toFixed(2)}
                    </span>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleDepositFiat}
                      className="text-xs py-1 px-2 bg-brand-primary-light text-brand-primary rounded hover:bg-brand-primary hover:text-white transition-colors"
                    >
                      Deposit
                    </motion.button>
                  </div>
                </div>
              ))}
              
              <div className="mt-2 pt-2 border-t border-border-primary flex items-center justify-between">
                <p className="text-xs text-text-tertiary">Want to buy more crypto?</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDepositFiat}
                  className="text-xs py-1 px-2 border border-brand-primary text-brand-primary rounded hover:bg-brand-primary hover:text-white transition-colors"
                >
                  Add More Funds
                </motion.button>
              </div>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 bg-background-primary rounded-xl shadow-lg overflow-hidden"
          >
            <div className="relative flex h-14 sm:h-16 mb-4 bg-background-secondary rounded-t-xl">
              <motion.div 
                className="absolute bottom-0 h-1 bg-brand-primary"
                animate={{ 
                  left: activeTab === 'buy' ? '0%' : '50%',
                  right: activeTab === 'buy' ? '50%' : '0%'
                }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30
                }}
              />
              <motion.button 
                className="flex-1 relative flex items-center justify-center"
                variants={tabVariants}
                animate={activeTab === 'buy' ? 'selected' : 'notSelected'}
                whileHover={{ scale: activeTab !== 'buy' ? 1.02 : 1.05 }}
                onHoverStart={() => setTabHovered('buy')}
                onHoverEnd={() => setTabHovered(null)}
                onClick={() => setActiveTab('buy')}
              >
                <span className="font-medium text-base sm:text-lg">Buy</span>
                {tabHovered === 'buy' && activeTab !== 'buy' && (
                  <motion.div
                    className="absolute inset-0 bg-brand-primary"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.05 }}
                    exit={{ opacity: 0 }}
                  />
                )}
              </motion.button>

              <motion.button 
                className="flex-1 relative flex items-center justify-center"
                variants={tabVariants}
                animate={activeTab === 'sell' ? 'selected' : 'notSelected'}
                whileHover={{ scale: activeTab !== 'sell' ? 1.02 : 1.05 }}
                onHoverStart={() => setTabHovered('sell')}
                onHoverEnd={() => setTabHovered(null)}
                onClick={() => setActiveTab('sell')}
              >
                <span className="font-medium text-base sm:text-lg">Sell</span>
                {tabHovered === 'sell' && activeTab !== 'sell' && (
                  <motion.div
                    className="absolute inset-0 bg-brand-primary"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.05 }}
                    exit={{ opacity: 0 }}
                  />
                )}
              </motion.button>
            </div>

            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={formVariants}
                >
                  <motion.div variants={inputVariants} className="mb-4">
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      {activeTab === 'buy' ? 'I want to spend' : 'I want to sell'}
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-0">
                      <input
                        type="text"
                        className="w-full sm:flex-grow px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-l-lg sm:rounded-r-none border border-border-primary bg-background-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary"
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                      />
                      <div className="relative w-full sm:w-auto">
                        <button 
                          className="w-full sm:w-auto flex items-center justify-between min-w-[100px] px-3 sm:px-4 py-2.5 sm:py-3 bg-background-secondary border border-border-primary rounded-lg sm:rounded-l-none sm:rounded-r-lg text-text-primary focus:outline-none"
                          onClick={() => setMethodDropdownOpen(!methodDropdownOpen)}
                        >
                          <span>{selectedCurrency}</span>
                          <ChevronDown size={16} className={`ml-2 transition-transform duration-200 ${methodDropdownOpen ? 'transform rotate-180' : ''}`} />
                        </button>
                        <AnimatePresence>
                          {methodDropdownOpen && (
                            <motion.div
                              initial="hidden"
                              animate="visible"
                              exit="exit"
                              variants={dropdownVariants}
                              className="absolute right-0 mt-2 w-full sm:w-56 bg-background-primary rounded-lg shadow-lg z-10 overflow-hidden"
                            >
                              <div className="p-2 border-b border-border-primary">
                                <div className="relative">
                                  <Search size={16} className="absolute left-2 top-1/2 -translate-y-1/2 text-text-tertiary" />
                                  <input
                                    type="text"
                                    placeholder="Search currency..."
                                    value={currencySearchQuery}
                                    onChange={(e) => {
                                      setCurrencySearchQuery(e.target.value);
                                      filterCurrencies(e.target.value);
                                    }}
                                    className="w-full pl-8 pr-3 py-1.5 text-sm rounded-md border border-border-primary bg-background-secondary text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-brand-primary"
                                  />
                                </div>
                              </div>
                              <motion.div className="py-1 max-h-60 overflow-y-auto">
                                {filteredCurrencies.length > 0 ? (
                                  filteredCurrencies.map((currency, index) => (
                                    <motion.button
                                      key={currency}
                                      initial={{ opacity: 0, y: -8 }}
                                      animate={{ 
                                        opacity: 1, 
                                        y: 0,
                                        transition: { delay: index * 0.05 }
                                      }}
                                      className="block w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-background-secondary"
                                      onClick={() => {
                                        setSelectedCurrency(currency);
                                        setMethodDropdownOpen(false);
                                        setCurrencySearchQuery('');
                                        setFilteredCurrencies(['USD', 'EUR', 'GBP', 'JPY', 'BRL']);
                                      }}
                                    >
                                      {currency}
                                    </motion.button>
                                  ))
                                ) : (
                                  <div className="px-4 py-2 text-sm text-text-tertiary">
                                    No currencies found
                                  </div>
                                )}
                              </motion.div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div 
                    variants={inputVariants}
                    className="flex justify-center my-4"
                    animate={{ 
                      rotateX: activeTab === 'buy' ? 0 : 180,
                      scale: [1, 1.1, 1],
                    }}
                    transition={{ duration: 0.5 }}
                  >
                    <ArrowDown size={20} className="text-text-tertiary" />
                  </motion.div>

                  <motion.div variants={inputVariants} className="mb-4">
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      {activeTab === 'buy' ? 'I will receive approximately' : 'I will receive'}
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-0">
                      <input
                        type="text"
                        className="w-full sm:flex-grow px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-l-lg sm:rounded-r-none border border-border-primary bg-background-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary"
                        placeholder="0.00"
                        value={estimatedCrypto}
                        readOnly
                      />
                      <div className="relative w-full sm:w-auto">
                        <button 
                          className="w-full sm:w-auto flex items-center justify-between min-w-[100px] px-3 sm:px-4 py-2.5 sm:py-3 bg-background-secondary border border-border-primary rounded-lg sm:rounded-l-none sm:rounded-r-lg text-text-primary focus:outline-none"
                          onClick={() => setCryptoDropdownOpen(!cryptoDropdownOpen)}
                        >
                          <div className="flex items-center">
                            {selectedCoin && (
                              <>
                                <CryptoIcon symbol={selectedCoin.symbol} size={16} className="mr-2 flex-shrink-0" />
                                <span>{selectedCoin.symbol}</span>
                              </>
                            )}
                            {!selectedCoin && <span>Select Coin</span>}
                          </div>
                          <ChevronDown size={16} className={`ml-2 transition-transform duration-200 ${cryptoDropdownOpen ? 'transform rotate-180' : ''}`} />
                        </button>
                        <AnimatePresence>
                          {cryptoDropdownOpen && (
                            <motion.div
                              initial="hidden"
                              animate="visible"
                              exit="exit"
                              variants={dropdownVariants}
                              className="absolute right-0 mt-2 w-full sm:w-56 bg-background-primary rounded-lg shadow-lg z-10 overflow-hidden"
                            >
                              <div className="p-2 border-b border-border-primary">
                                <div className="relative">
                                  <Search size={16} className="absolute left-2 top-1/2 -translate-y-1/2 text-text-tertiary" />
                                  <input
                                    type="text"
                                    placeholder="Search coins..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-8 pr-3 py-1.5 text-sm rounded-md border border-border-primary bg-background-secondary text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-brand-primary"
                                  />
                                </div>
                              </div>
                              <motion.div className="py-1 max-h-60 overflow-y-auto">
                                {isSearching ? (
                                  <div className="flex justify-center items-center py-4">
                                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-brand-primary mr-2"></div>
                                    <span className="text-sm text-text-secondary">Searching...</span>
                                  </div>
                                ) : filteredCoins.length > 0 ? (
                                  filteredCoins.map((coin, index) => (
                                    <motion.button
                                      key={coin.id}
                                      initial={{ opacity: 0, y: -8 }}
                                      animate={{ 
                                        opacity: 1, 
                                        y: 0,
                                        transition: { delay: index * 0.05 }
                                      }}
                                      className="block w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-background-secondary"
                                      onClick={() => {
                                        setSelectedCoin(coin);
                                        setCryptoDropdownOpen(false);
                                        setSearchQuery('');
                                      }}
                                    >
                                      <div className="flex items-center">
                                        <CryptoIcon symbol={coin.symbol} size={16} className="mr-3 flex-shrink-0" />
                                        <span className="whitespace-nowrap overflow-hidden text-ellipsis">
                                          {coin.name} ({coin.symbol})
                                        </span>
                                        <div className="ml-auto text-xs text-text-tertiary">
                                          ${coin.lastPrice?.toFixed(2)}
                                        </div>
                                      </div>
                                    </motion.button>
                                  ))
                                ) : (
                                  <div className="px-4 py-2 text-sm text-text-tertiary">
                                    No coins found
                                  </div>
                                )}
                              </motion.div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                    
                    {selectedCoin && (
                      <div className="mt-2 flex justify-between items-center text-xs text-text-tertiary">
                        <span>Current price: ${selectedCoin.lastPrice?.toFixed(2)}</span>
                        <span className={selectedCoin.priceChange >= 0 ? "text-green-500" : "text-red-500"}>
                          24h: {selectedCoin.priceChange >= 0 ? "+" : ""}{selectedCoin.priceChange?.toFixed(2)}%
                        </span>
                      </div>
                    )}
                  </motion.div>

                  <motion.div variants={inputVariants}>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      {activeTab === 'buy' ? 'Payment Method' : 'Payout Method'}
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4">
                      {paymentMethods.map((method) => (
                        <PaymentMethodButton
                          key={method.id}
                          method={method}
                          isSelected={paymentMethod.id === method.id}
                          onClick={() => setPaymentMethod(method)}
                        />
                      ))}
                    </div>
                  </motion.div>

                  <motion.button
                    variants={inputVariants}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className={`w-full py-2.5 sm:py-3 bg-brand-primary text-background-primary rounded-lg hover:opacity-90 transition-colors font-medium mt-6 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    onClick={handleContinue}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Processing...' : (activeTab === 'buy' ? 'Continue to Buy' : 'Continue to Sell')}
                  </motion.button>

                  {selectedCoin && !selectedWallet && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-4 p-3 bg-background-secondary rounded-lg flex items-start"
                    >
                      <AlertCircle size={16} className="text-brand-primary mt-0.5 mr-2 flex-shrink-0" />
                      <p className="text-sm text-text-secondary">
                        You don't have a {selectedCoin.symbol} wallet yet. A new wallet will be created automatically when you make your first purchase.
                      </p>
                    </motion.div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="hidden lg:block bg-background-primary p-4 sm:p-6 rounded-xl shadow-lg"
          >
            <div className="flex items-center mb-4">
              <TrendingUp size={20} className="text-brand-primary mr-2" />
              <h2 className="text-lg font-bold text-text-primary">
                {activeTab === 'buy' ? 'Best Time to Buy' : 'Recommended to Sell'}
              </h2>
            </div>
            
            <div className="space-y-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  {(activeTab === 'buy' ? buyRecommendations : sellRecommendations).map((crypto) => (
                    <motion.div
                      key={crypto.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-background-secondary rounded-lg cursor-pointer hover:bg-background-secondary/80 transition-colors"
                      onClick={() => handleSelectRecommendedCoin(crypto)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <CryptoIcon symbol={crypto.symbol} size={20} />
                          <span className="font-medium text-text-primary">{crypto.name}</span>
                        </div>
                        <div className={`text-sm font-medium ${crypto.change > 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {crypto.change > 0 ? '+' : ''}{crypto.change.toFixed(2)}%
                        </div>
                      </div>
                      <div className="text-sm text-text-secondary mt-1">
                        {crypto.reason}
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>
            
            {selectedCoin && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0, transition: { delay: 0.3 }}}
                className="mt-6 p-4 bg-background-secondary rounded-lg"
              >
                <h3 className="font-medium text-brand-primary mb-2">
                  {activeTab === 'buy' ? `Why buy ${selectedCoin.name}?` : `Why sell ${selectedCoin.name}?`}
                </h3>
                <ul className="text-sm space-y-2 text-text-secondary">
                  {activeTab === 'buy' ? (
                    <>
                      <motion.li 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-start"
                      >
                        <span className="mr-2 flex-shrink-0">•</span>
                        <span>Market momentum is favorable</span>
                      </motion.li>
                      <motion.li 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-start"
                      >
                        <span className="mr-2 flex-shrink-0">•</span>
                        <span>Technical indicators are positive</span>
                      </motion.li>
                    </>
                  ) : (
                    <>
                      <motion.li 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-start"
                      >
                        <span className="mr-2 flex-shrink-0">•</span>
                        <span>Price reached resistance level</span>
                      </motion.li>
                      <motion.li 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-start"
                      >
                        <span className="mr-2 flex-shrink-0">•</span>
                        <span>Good opportunity to take profits</span>
                      </motion.li>
                    </>
                  )}
                </ul>
              </motion.div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:hidden bg-background-primary p-4 rounded-xl shadow-lg"
          >
            <div className="flex items-center mb-3">
              <TrendingUp size={18} className="text-brand-primary mr-2" />
              <h2 className="text-base font-bold text-text-primary">
                {activeTab === 'buy' ? 'Best Time to Buy' : 'Recommended to Sell'}
              </h2>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {(activeTab === 'buy' ? buyRecommendations : sellRecommendations)
                .slice(0, 4)
                .map((crypto, index) => (
                  <motion.button
                    key={crypto.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ 
                      opacity: 1, 
                      y: 0,
                      transition: { delay: 0.1 + (index * 0.05) }
                    }}
                    className="p-3 rounded-lg border border-border-primary hover:bg-background-secondary transition-colors text-left"
                    onClick={() => handleSelectRecommendedCoin(crypto)}
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      <CryptoIcon symbol={crypto.symbol} size={16} className="flex-shrink-0" />
                      <span className="text-sm font-medium text-text-primary">{crypto.symbol}</span>
                    </div>
                    <div className={`text-xs ${crypto.change > 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {crypto.change > 0 ? '+' : ''}{crypto.change.toFixed(2)}%
                    </div>
                    <div className="text-xs text-text-secondary mt-1 line-clamp-2">
                      {crypto.reason}
                    </div>
                  </motion.button>
              ))}
            </div>
          </motion.div>
        </div>
        
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleDepositFiat}
          className="fixed bottom-6 right-6 lg:hidden p-4 rounded-full bg-brand-primary text-white shadow-lg flex items-center justify-center"
        >
          <Plus size={24} />
        </motion.button>
      </div>
    </div>
  );
}