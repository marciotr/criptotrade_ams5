import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Search, Loader } from 'lucide-react';
import CryptoIcon from '../../../components/common/CryptoIcons';

const POPULAR_COINS = ['BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'ADA', 'DOGE', 'DOT', 'MATIC', 'LINK'];
const INITIAL_LIMIT = 15; 

export function CoinSelector({ 
  selectedCoin, 
  coins, 
  isOpen, 
  onToggle, 
  onSelect,
  price,
  align = "left",
  isMobile = false,
  isLoading = false
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAll, setShowAll] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);

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

  const handleCoinSelect = useCallback((coin) => {
    setLocalLoading(true);
    // Fecha o dropdown imediatamente
    onToggle();
    // Chama o onSelect com um pequeno delay pra permitir a animação de loading
    onSelect(coin);
    // Simula o tempo de carregamento pra não piscar a tela
    setTimeout(() => {
      setLocalLoading(false);
    }, 800);
  }, [onToggle, onSelect]);

  const formattedPrice = useMemo(() => {
    if (!price) return null;
    
    return Number(price).toLocaleString('pt-BR', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  }, [price]);

  // Classes responsivas para o botão
  const buttonStyles = isMobile
    ? "text-xs space-x-1 py-1.5 px-2"
    : "text-sm space-x-2 py-2 px-3";

  // Tamanho do ícone responsivo
  const iconSize = isMobile ? 20 : 24;
  
  // Largura do dropdown responsiva
  const dropdownWidth = isMobile ? "w-[250px]" : "w-[320px]";
  const dropdownMaxHeight = isMobile ? "240px" : "320px";

  // Estado de carregamento 
  const loading = isLoading || localLoading;

  return (
    <div className="relative z-20">
      <button 
        onClick={handleDropdownToggle} 
        disabled={loading}
        className={`flex items-center ${buttonStyles} rounded-lg bg-background-secondary hover:bg-background-tertiary transition-colors focus:outline-none relative overflow-hidden`}
      >
        {/* Overlay de loading */}
        <AnimatePresence>
          {loading && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background-secondary flex items-center justify-center z-10"
            >
              <Loader size={isMobile ? 16 : 20} className="text-brand-primary animate-spin" />
            </motion.div>
          )}
        </AnimatePresence>

        <div className={`flex items-center space-x-1 sm:space-x-2 ${loading ? 'opacity-50' : ''}`}>
          {selectedCoin?.name && (
            <CryptoIcon 
              symbol={selectedCoin.name} 
              size={isMobile ? 16 : 20} 
            />
          )}
          <span className="font-medium text-text-primary truncate max-w-[80px] sm:max-w-[120px] md:max-w-full">
            {selectedCoin?.name || 'Selecionar Moeda'}
          </span>
          {formattedPrice && (
            <span className="hidden sm:inline text-brand-primary font-medium">
              R${formattedPrice}
            </span>
          )}
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <ChevronDown size={isMobile ? 14 : 16} className="text-text-secondary" />
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
            className={`absolute top-full mt-2 ${dropdownWidth} rounded-xl shadow-lg bg-background-primary 
                       border border-border-primary z-30 
                       ${align === 'right' ? 'right-0' : 'left-0'}`}
            style={{ transformOrigin: align === 'right' ? 'top right' : 'top left' }}
          >
            {/* Input Searcg */}
            <div className="p-2 border-b border-border-primary">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-tertiary" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  placeholder="Buscar moedas..."
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-background-secondary rounded-lg border border-border-primary focus:outline-none focus:border-brand-primary text-text-primary placeholder-text-tertiary"
                  autoFocus
                />
              </div>
            </div>

            {/* Lista de Moedas */}
            <div className="overflow-y-auto py-1" style={{ maxHeight: dropdownMaxHeight }}>
              {filteredCoins.length > 0 ? (
                <>
                  {filteredCoins.map((coin, index) => (
                    <motion.button
                      key={coin.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.03 }}
                      className={`flex items-center w-full px-3 py-2 text-xs sm:text-sm text-left hover:bg-background-secondary transition-colors ${
                        selectedCoin?.id === coin.id ? 'bg-background-secondary' : ''
                      }`}
                      onClick={() => handleCoinSelect(coin)}
                    >
                      <div className="flex items-center space-x-2">
                        <CryptoIcon symbol={coin.name} size={isMobile ? 16 : 20} />
                        <span className="text-text-primary">{coin.name}</span>
                        <span className="text-[10px] sm:text-xs text-text-tertiary">
                          {coin.id.replace(/USDT.*$/, '')}
                        </span>
                      </div>
                    </motion.button>
                  ))}
                  
                  {!searchTerm && !showAll && sortedCoins.length > INITIAL_LIMIT && (
                    <button
                      onClick={handleShowMore}
                      className="w-full py-2 px-3 text-xs sm:text-sm text-center text-brand-primary hover:bg-background-secondary transition-colors"
                    >
                      Mostrar todas as moedas ({sortedCoins.length})
                    </button>
                  )}
                </>
              ) : (
                <div className="text-center py-4 text-text-tertiary text-xs sm:text-sm">
                  Nenhuma moeda encontrada
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

CoinSelector.displayName = 'CoinSelector';