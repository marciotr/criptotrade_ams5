import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Search } from 'lucide-react';
import CryptoIcon from '../common/CryptoIcons';

export const CoinSelector = React.memo(({ 
  selectedCoin, 
  coins, 
  isOpen, 
  onToggle, 
  onSelect 
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCoins = useMemo(() => {
    return coins.filter(coin => 
      coin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coin.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [coins, searchTerm]);

  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  return (
    <div className="relative">
      <button 
        onClick={onToggle} 
        className="flex items-center space-x-2 focus:outline-none"
      >
        <div className="flex items-center space-x-2">
          <CryptoIcon symbol={selectedCoin.id} size={28} />
          <h2 className="text-xl font-bold text-text-primary">{selectedCoin.name} Price</h2>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <ChevronDown size={16} className="text-text-primary" />
          </motion.div>
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 mt-2 w-64 rounded-md shadow-lg bg-background-primary border border-border-primary z-10"
            style={{ transformOrigin: 'top left' }}
          >
            {/* Search Input */}
            <div className="p-2 border-b border-border-primary">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-tertiary" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  placeholder="Search coins..."
                  className="w-full pl-10 pr-4 py-2 text-sm bg-background-secondary rounded-lg border border-border-primary focus:outline-none focus:border-brand-primary text-text-primary placeholder-text-tertiary"
                  autoFocus
                />
              </div>
            </div>

            {/* Coins List */}
            <div className="max-h-[300px] overflow-y-auto py-1">
              {filteredCoins.length > 0 ? (
                filteredCoins.map((coin, index) => (
                  <motion.button
                    key={coin.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.03 }}
                    className={`flex items-center w-full px-4 py-2 text-sm text-left hover:bg-background-secondary ${
                      selectedCoin.id === coin.id ? 'bg-background-secondary' : ''
                    }`}
                    onClick={() => onSelect(coin)}
                  >
                    <div className="flex items-center space-x-2">
                      <CryptoIcon symbol={coin.id} size={20} />
                      <span className="text-text-primary">{coin.name}</span>
                      <span className="text-xs text-text-tertiary">
                        {coin.id.replace('USDT', '')}
                      </span>
                    </div>
                  </motion.button>
                ))
              ) : (
                <div className="text-center py-4 text-text-tertiary">
                  No coins found
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

CoinSelector.displayName = 'CoinSelector';