import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp, ArrowDown, ChevronRight, ArrowUpDown } from 'lucide-react';
import CryptoIcon from '../common/CryptoIcons';
import { FixedSizeList as List } from 'react-window';

export const MarketOverview = React.memo(({ data, isLoading, onShowMore }) => {
  const [sortConfig, setSortConfig] = useState({
    key: 'currentPrice',
    direction: 'desc'
  });

  const sortOptions = useMemo(() => [
    { key: 'currentPrice', label: 'Highest Price' },
    { key: 'priceChange', label: 'Best Performers' },
    { key: 'volume', label: 'Highest Volume' },
    { key: 'name', label: 'Name' }
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
        key={coin.symbol || index}
        initial={{ opacity: 0, y: 20 }}
        animate={{ 
          opacity: 1, 
          y: 0,
          transition: { delay: index * 0.05 }
        }}
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
              Vol: ${typeof coin.volume === 'number' ? 
                coin.volume.toLocaleString() : 
                parseFloat(coin.volume || 0).toLocaleString()}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-semibold text-text-primary">
            ${typeof coin.currentPrice === 'number' ? 
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
    return (
      <div style={style}>
        {renderCoinItem(coin, index)}
      </div>
    );
  }, [sortedData, renderCoinItem]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 lg:p-6 rounded-xl bg-background-primary border border-border-primary shadow-lg"
    >
      <div className="flex flex-col space-y-4 mb-6">
        <h2 className="text-xl font-bold text-text-primary">Top 10 by {
          sortOptions.find(opt => opt.key === sortConfig.key)?.label || 'Price'
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
        <AnimatePresence mode="wait">
          {isLoading ? (
            <div className="flex items-center justify-center p-4">
              <div className="w-6 h-6 border-2 border-brand-primary rounded-full border-t-transparent animate-spin"></div>
            </div>
          ) : sortedData.length > 0 ? (
            <>
              <List
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
                View All Markets
                <ChevronRight size={16} className="ml-2" />
              </motion.button>
            </>
          ) : (
            <div className="text-center py-4 text-text-secondary">
              No data available
            </div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
});

MarketOverview.displayName = 'MarketOverview';