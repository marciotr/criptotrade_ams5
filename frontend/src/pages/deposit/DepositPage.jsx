import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, DollarSign, Wallet, ChevronDown, TrendingUp, ArrowDown, Search } from 'lucide-react';
import { CryptoCard } from '../../components/common/CryptoCard';
import { PaymentMethodButton } from './components/PaymentMethodButton';
import CryptoIcon from '../../components/common/CryptoIcons';
import { availableCoins} from '../../data/mockData';

const hotCryptos = [
  { id: 'BTC', name: 'Bitcoin', symbol: 'BTC', price: 47234.12, change: 5.23, trending: true },
  { id: 'ETH', name: 'Ethereum', symbol: 'ETH', price: 3456.78, change: -2.14, trending: true },
  { id: 'SOL', name: 'Solana', symbol: 'SOL', price: 98.45, change: 12.3, trending: true },
  { id: 'ADA', name: 'Cardano', symbol: 'ADA', price: 1.23, change: 8.56, trending: true },
  { id: 'BNB', name: 'Binance Coin', symbol: 'BNB', price: 312.78, change: 3.45, trending: true },
];

// Add after the existing hotCryptos array
const buyRecommendations = [
  { id: 'SOL', name: 'Solana', symbol: 'SOL', price: 98.45, change: 12.3, trending: true, reason: 'Strong growth potential' },
  { id: 'ETH', name: 'Ethereum', symbol: 'ETH', price: 3456.78, change: -2.14, trending: true, reason: 'Major network upgrade coming' },
  { id: 'BNB', name: 'Binance Coin', symbol: 'BNB', price: 312.78, change: 3.45, trending: true, reason: 'Growing ecosystem' },
  { id: 'ADA', name: 'Cardano', symbol: 'ADA', price: 1.23, change: 8.56, trending: true, reason: 'New partnerships announced' },
  { id: 'MATIC', name: 'Polygon', symbol: 'MATIC', price: 0.85, change: 15.2, trending: true, reason: 'Rising adoption rate' },
];

const sellRecommendations = [
  { id: 'DOGE', name: 'Dogecoin', symbol: 'DOGE', price: 0.12, change: 25.3, trending: true, reason: 'Price at recent peak' },
  { id: 'XRP', name: 'Ripple', symbol: 'XRP', price: 0.56, change: 18.4, trending: true, reason: 'High volatility expected' },
  { id: 'SHIB', name: 'Shiba Inu', symbol: 'SHIB', price: 0.00002, change: 30.2, trending: true, reason: 'Take profits opportunity' },
  { id: 'LUNA', name: 'Terra Luna', symbol: 'LUNA', price: 2.45, change: 22.1, trending: true, reason: 'Market uncertainty' },
  { id: 'AVAX', name: 'Avalanche', symbol: 'AVAX', price: 34.56, change: 16.8, trending: true, reason: 'Resistance level reached' },
];

const paymentMethods = [
  { id: 'card', name: 'Credit Card', icon: CreditCard },
  { id: 'bank', name: 'Bank Transfer', icon: DollarSign },
  { id: 'crypto', name: 'Crypto Wallet', icon: Wallet },
];

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

// Add these animation variants before the component
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
  const [selectedCoin, setSelectedCoin] = useState(availableCoins[0]);
  const [paymentMethod, setPaymentMethod] = useState(paymentMethods[0]);
  const [cryptoDropdownOpen, setCryptoDropdownOpen] = useState(false);
  const [methodDropdownOpen, setMethodDropdownOpen] = useState(false);
  const [tabHovered, setTabHovered] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCoins, setFilteredCoins] = useState(availableCoins);
  const [currencySearchQuery, setCurrencySearchQuery] = useState('');
  const [filteredCurrencies, setFilteredCurrencies] = useState(['USD', 'EUR', 'GBP', 'JPY', 'BRL']);

  // Calcular aproximadamente quanto crypto o usuário ganhará
  const estimatedCrypto = amount ? (parseFloat(amount) / selectedCoin.data[0].price).toFixed(6) : '0';

  const filterCoins = (query) => {
    const filtered = availableCoins.filter(coin => 
      coin.name.toLowerCase().includes(query.toLowerCase()) ||
      coin.id.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredCoins(filtered);
  };

  const filterCurrencies = (query) => {
    const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'BRL'];
    const filtered = currencies.filter(currency => 
      currency.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredCurrencies(filtered);
  };

  return (
    <div className="p-2 sm:p-6 mt-12 sm:mt-16">
      {/* Add container div with max-width */}
      <div className="max-w-5xl mx-auto">
        <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-text-primary px-2 sm:px-0">
          Deposit / Buy Crypto
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Form Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 bg-background-primary rounded-xl shadow-lg overflow-hidden"
          >
            {/* Tabs */}
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
                  {/* Amount Input */}
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
                      {/* Currency Selector */}
                      <div className="relative w-full sm:w-auto">
                        <button 
                          className="w-full sm:w-auto flex items-center justify-between min-w-[100px] px-3 sm:px-4 py-2.5 sm:py-3 bg-background-secondary border border-border-primary rounded-lg sm:rounded-l-none sm:rounded-r-lg text-text-primary focus:outline-none"
                          onClick={() => setMethodDropdownOpen(!methodDropdownOpen)}
                        >
                          <span>{selectedCurrency}</span>
                          <ChevronDown size={16} className={`ml-2 transition-transform duration-200 ${methodDropdownOpen ? 'transform rotate-180' : ''}`} />
                        </button>
                        
                        {/* Currency Dropdown */}
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

                  {/* Exchange Arrow */}
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

                  {/* Receive Amount */}
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
                            <CryptoIcon symbol={selectedCoin.id} size={16} className="mr-2 flex-shrink-0" />
                            <span>{selectedCoin.id}</span>
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
                                    onChange={(e) => {
                                      setSearchQuery(e.target.value);
                                      filterCoins(e.target.value);
                                    }}
                                    className="w-full pl-8 pr-3 py-1.5 text-sm rounded-md border border-border-primary bg-background-secondary text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-brand-primary"
                                  />
                                </div>
                              </div>
                              <motion.div className="py-1 max-h-60 overflow-y-auto">
                                {filteredCoins.length > 0 ? (
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
                                        setFilteredCoins(availableCoins);
                                      }}
                                    >
                                      <div className="flex items-center">
                                        <CryptoIcon symbol={coin.id} size={16} className="mr-3 flex-shrink-0" />
                                        <span className="whitespace-nowrap overflow-hidden text-ellipsis">
                                          {coin.name} ({coin.id})
                                        </span>
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
                  </motion.div>

                  {/* Payment Methods */}
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

                  {/* Continue Button */}
                  <motion.button
                    variants={inputVariants}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="w-full py-2.5 sm:py-3 bg-brand-primary text-background-primary rounded-lg hover:opacity-90 transition-colors font-medium mt-6"
                  >
                    {activeTab === 'buy' ? 'Continue to Buy' : 'Continue to Sell'}
                  </motion.button>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Hot Cryptos Section */}
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
                      onClick={() => setSelectedCoin(availableCoins.find(c => c.id === crypto.id))}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <CryptoIcon symbol={crypto.symbol} size={20} />
                          <span className="font-medium text-text-primary">{crypto.name}</span>
                        </div>
                        <div className={`text-sm font-medium ${crypto.change > 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {crypto.change > 0 ? '+' : ''}{crypto.change}%
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
          </motion.div>

          {/* Mobile Hot Cryptos */}
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
                    onClick={() => setSelectedCoin(availableCoins.find(c => c.id === crypto.id))}
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      <CryptoIcon symbol={crypto.symbol} size={16} className="flex-shrink-0" />
                      <span className="text-sm font-medium text-text-primary">{crypto.symbol}</span>
                    </div>
                    <div className={`text-xs ${crypto.change > 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {crypto.change > 0 ? '+' : ''}{crypto.change}%
                    </div>
                    <div className="text-xs text-text-secondary mt-1 line-clamp-2">
                      {crypto.reason}
                    </div>
                  </motion.button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}