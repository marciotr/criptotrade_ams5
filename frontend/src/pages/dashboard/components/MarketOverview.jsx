import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp, ArrowDown, ChevronRight, ArrowUpDown } from 'lucide-react';
import CryptoIcon from '../../../components/common/CryptoIcons'
import { FixedSizeList as List } from 'react-window';

export const MarketOverview = React.memo(({ data, isLoading, onShowMore }) => {
  const [sortConfig, setSortConfig] = useState({
    key: 'currentPrice',
    direction: 'desc'
  });

  const sortOptions = useMemo(() => [
    { key: 'currentPrice', label: 'Maior Preço' },
    { key: 'priceChange', label: 'Melhor Desempenho' },
    { key: 'volume', label: 'Maior Volume' },
    { key: 'name', label: 'Nome' }
  ], []);

  const handleSort = useCallback((key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  }, []);

  const sortedData = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) {
      return [];
    }
    
    try {
      return [...data]
        .filter(item => {
          if (!item || !item.symbol) return false;
          return true;
        })
        .sort((a, b) => {
          const getValue = (item) => {
            const key = sortConfig.key;
            
            if (!item || !item[key]) return 0;
            
            if (key === 'name') {
              return item[key];
            }
            
            const value = item[key];
            if (typeof value === 'string') {
              if (key === 'volume') {
                return parseFloat(value.replace(/\./g, '').replace(',', '.'));
              }
              return parseFloat(value);
            }
            return Number(value);
          };

          const aValue = getValue(a);
          const bValue = getValue(b);
          
          if (sortConfig.key === 'name') {
            return sortConfig.direction === 'asc' 
              ? String(aValue).localeCompare(String(bValue))
              : String(bValue).localeCompare(String(aValue));
          }
          
          return sortConfig.direction === 'desc' ? bValue - aValue : aValue - bValue;
        })
        .slice(0, 5); // Always show 5 items
    } catch (error) {
      console.error('Error processing data:', error);
      return [];
    }
  }, [data, sortConfig]);

  const renderCoinItem = useCallback((coin, index) => {
    if (!coin) return null;

    return (
      <motion.div 
        key={coin.symbol}
        initial={{ opacity: 0, y: 10 }}
        animate={{ 
          opacity: 1, 
          y: 0,
          transition: { 
            delay: index * 0.03, 
            duration: 0.2, 
            ease: "easeOut" 
          }
        }}
        exit={{ opacity: 0, transition: { duration: 0.1 } }}
        layout="position"
        className="flex items-center justify-between p-3 hover:bg-background-secondary rounded-lg transition-colors"
      >
        <div className="flex items-center space-x-2">
          <CryptoIcon symbol={coin.symbol} size={24} />
          <div>
            <p className="font-semibold text-text-primary">
              {coin.name}
              <span className="ml-1 text-sm text-text-tertiary">
                {coin.symbol}
              </span>
            </p>
            <p className="text-sm text-text-secondary">
              Vol: R${typeof coin.volume === 'number' ? 
                coin.volume.toLocaleString() : 
                parseFloat(coin.volume || 0).toLocaleString()}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-semibold text-text-primary">
            R${typeof coin.currentPrice === 'number' ? 
              coin.currentPrice.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 8
              }) : 
              parseFloat(coin.currentPrice || 0).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 8
              })}
          </p>
          <p className={`text-sm flex items-center justify-end ${
            Number(coin.priceChange) >= 0 ? 'text-feedback-success' : 'text-feedback-error'
          }`}>
            {Number(coin.priceChange) >= 0 ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
            {Number(coin.priceChange || 0).toFixed(2)}%
          </p>
        </div>
      </motion.div>
    );
  }, []);

  const Row = useCallback(({ index, style }) => {
    const coin = sortedData[index];
    if (!coin) return null;
    
    return (
      <div style={style}>
        {renderCoinItem(coin, index)}
      </div>
    );
  }, [sortedData, renderCoinItem]);

  const ListKey = useMemo(() => 
    `market-list-${sortConfig.key}-${sortConfig.direction}`, 
    [sortConfig.key, sortConfig.direction]
  );

  const MarketContainer = useMemo(() => (
    <motion.div
      layout
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0.8 }}
      transition={{ duration: 0.2 }}
      className="p-4 lg:p-6 rounded-xl bg-background-primary border border-border-primary shadow-lg"
    >
      <div className="flex flex-col space-y-4 mb-6">
        <h2 className="text-xl font-bold text-text-primary">Top 10 por {
          sortOptions.find(opt => opt.key === sortConfig.key)?.label || 'Preço'
        }</h2>
        <div className="flex flex-wrap gap-2">
          {sortOptions.map((option) => (
            <button
              key={option.key}
              onClick={() => handleSort(option.key)}
              className={`flex items-center px-3 py-1 rounded-lg text-sm transition-colors ${
                sortConfig.key === option.key
                  ? 'bg-brand-primary text-white'
                  : 'bg-background-secondary text-text-secondary hover:bg-background-tertiary'
              }`}
            >
              {option.label}
              {sortConfig.key === option.key && (
                <ArrowUpDown size={12} className="ml-1" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center p-4">
            <div className="w-6 h-6 border-2 border-brand-primary rounded-full border-t-transparent animate-spin"></div>
          </div>
        ) : sortedData.length > 0 ? (
          <>
            <List
              key={ListKey}
              height={350} // Fixed height for 5 items
              itemCount={sortedData.length}
              itemSize={70}
              width="100%"
            >
              {Row}
            </List>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onShowMore}
              className="mt-4 w-full py-2 px-4 text-sm font-medium text-brand-primary bg-background-secondary rounded-lg flex items-center justify-center hover:bg-background-tertiary transition-colors"
            >
              Ver Todos os Mercados
              <ChevronRight size={16} className="ml-2" />
            </motion.button>
          </>
        ) : (
          <div className="text-center py-4 text-text-secondary">
            Dados não disponíveis
          </div>
        )}
      </div>
    </motion.div>
  ), [sortOptions, sortConfig, ListKey, isLoading, sortedData, Row, onShowMore]);

  return MarketContainer;
}, (prevProps, nextProps) => {
  if (prevProps.isLoading !== nextProps.isLoading) return false;
  
  if (prevProps.data.length !== nextProps.data.length) return false;
  
  const prevIds = prevProps.data.map(item => item.symbol).join(',');
  const nextIds = nextProps.data.map(item => item.symbol).join(',');
  
  return prevIds === nextIds;
});

MarketOverview.displayName = 'MarketOverview';