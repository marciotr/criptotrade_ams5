import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Search } from 'lucide-react';
import CryptoIcon from '../../../components/common/CryptoIcons';

const POPULAR_COINS = ['BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'ADA', 'DOGE', 'DOT', 'MATIC', 'LINK'];
const INITIAL_LIMIT = 15; 

export const CoinSelector = React.memo(({ 
  selectedCoin, 
  coins, 
  isOpen, 
  onToggle, 
  onSelect,
  price,
  align = 'right'          
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAll, setShowAll] = useState(false);

  const sortedCoins = useMemo(() => {
    if (!coins?.length) return [];

    return [...coins].sort((a, b) => {
      const aName = a.name || '';
      const bName = b.name || '';
      
      const aIsPopular = POPULAR_COINS.includes(aName);
      const bIsPopular = POPULAR_COINS.includes(bName);
      
      if (aIsPopular && !bIsPopular) return -1;
      if (!aIsPopular && bIsPopular) return 1;

      if (aIsPopular && bIsPopular) {
        return POPULAR_COINS.indexOf(aName) - POPULAR_COINS.indexOf(bName);
      }

      return aName.localeCompare(bName);
    });
  }, [coins]);

  const filteredCoins = useMemo(() => {
    if (!sortedCoins?.length) return [];
    
    if (searchTerm) {
      return sortedCoins.filter(coin => 
        (coin.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (coin.id || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return showAll ? sortedCoins : sortedCoins.slice(0, INITIAL_LIMIT);
  }, [sortedCoins, searchTerm, showAll]);

  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
    // Quando começar a pesquisar, resetar o estado de "mostrar todos"
    if (e.target.value) {
      setShowAll(false);
    }
  }, []);

  const handleShowMore = useCallback(() => {
    setShowAll(true);
  }, []);

  const handleDropdownToggle = useCallback(() => {
    // Reset para o estado padrão quando fechar o dropdown
    if (isOpen) {
      setSearchTerm('');
      setShowAll(false);
    }
    onToggle();
  }, [isOpen, onToggle]);

  const formattedPrice = useMemo(() => {
    if (!price) return null;
    
    return Number(price).toLocaleString(undefined, { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 6 
    });
  }, [price]);

  return (
    <div className="relative">
      <button 
        onClick={handleDropdownToggle} 
        className="flex items-center space-x-2 focus:outline-none"
      >
        <div className="flex items-center space-x-2">
          {selectedCoin?.id && <CryptoIcon symbol={selectedCoin.id} size={28} />}
          <div className="flex items-center">
            <h2 className="text-xl font-bold text-text-primary">{selectedCoin?.name || 'Selecionar Moeda'}</h2>
            {formattedPrice && (
              <span className="ml-2 text-lg font-medium text-text-secondary">R${formattedPrice}</span>
            )}
          </div>
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
            className={
              `absolute top-full mt-2 w-64 rounded-md shadow-lg bg-background-primary 
               border border-border-primary z-10 
               ${align === 'right' ? 'right-0' : 'left-0'}`
            }
            style={{ transformOrigin: align === 'right' ? 'top right' : 'top left' }}
          >
            {/* Search Input */}
            <div className="p-2 border-b border-border-primary">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-tertiary" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  placeholder="Buscar moedas..."
                  className="w-full pl-10 pr-4 py-2 text-sm bg-background-secondary rounded-lg border border-border-primary focus:outline-none focus:border-brand-primary text-text-primary placeholder-text-tertiary"
                  autoFocus
                />
              </div>
            </div>

            {/* Coins List */}
            <div className="max-h-[300px] overflow-y-auto py-1">
              {filteredCoins.length > 0 ? (
                <>
                  {filteredCoins.map((coin, index) => (
                    <motion.button
                      key={coin.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.03 }}
                      className={`flex items-center w-full px-4 py-2 text-sm text-left hover:bg-background-secondary ${
                        selectedCoin?.id === coin.id ? 'bg-background-secondary' : ''
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
                  ))}
                  
                  {!searchTerm && !showAll && sortedCoins.length > INITIAL_LIMIT && (
                    <button
                      onClick={handleShowMore}
                      className="w-full py-2 px-4 text-sm text-center text-brand-primary hover:bg-background-secondary transition-colors"
                    >
                      Mostrar todas as moedas ({sortedCoins.length})
                    </button>
                  )}
                </>
              ) : (
                <div className="text-center py-4 text-text-tertiary">
                  Nenhuma moeda encontrada
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