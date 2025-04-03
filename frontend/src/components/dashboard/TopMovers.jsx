import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowUp, ArrowDown } from 'lucide-react';
import CryptoIcon from '../common/CryptoIcons';

export const TopMovers = React.memo(({ data, type }) => {
  const title = type === 'gainers' ? 'Top Gainers' : 'Top Losers';

  // Improved data processing with better number handling
  const processedData = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) return [];

    const numericData = data.map(coin => {
      // Handle volume string format (e.g., "44.071,369" -> 44071.369)
      const normalizedVolume = typeof coin.volume === 'string' 
        ? parseFloat(coin.volume.replace('.', '').replace(',', '.'))
        : Number(coin.volume);

      return {
        ...coin,
        numericChange: parseFloat(
          typeof coin.change === 'string' 
            ? coin.change.replace(/[+%]/g, '')
            : coin.change
        ),
        normalizedVolume
      };
    });

    // Sort based on price change
    const sortedData = [...numericData].sort((a, b) => {
      if (type === 'gainers') {
        return b.numericChange - a.numericChange;
      } else {
        return a.numericChange - b.numericChange;
      }
    });

    // Take top 5
    return sortedData.slice(0, 5);
  }, [data, type]);

  // Format volume with proper number handling
  const formatVolume = (volume) => {
    if (typeof volume === 'undefined' || volume === null) return '0';
    
    const num = typeof volume === 'string' 
      ? parseFloat(volume.replace('.', '').replace(',', '.'))
      : Number(volume);

    if (isNaN(num)) return '0';

    if (num >= 1e9) {
      return `${(num / 1e9).toFixed(2)}B`;
    } else if (num >= 1e6) {
      return `${(num / 1e6).toFixed(2)}M`;
    } else if (num >= 1e3) {
      return `${(num / 1e3).toFixed(2)}K`;
    }
    
    return num.toLocaleString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 lg:p-6 rounded-xl bg-background-primary border border-border-primary shadow-lg"
    >
      <h2 className="text-xl font-bold mb-6 text-text-primary">{title}</h2>
      <div className="space-y-4">
        {processedData.map((coin, index) => (
          <motion.div 
            key={coin.symbol || index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between p-3 hover:bg-background-secondary rounded-lg transition-colors"
          >
            <div className="flex items-center space-x-2">
              <CryptoIcon symbol={coin.symbol} size={24} />
              <div>
                <p className="font-semibold text-text-primary">{coin.coin}</p>
                <p className="text-sm text-text-secondary">
                  Vol: ${formatVolume(coin.normalizedVolume)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold text-text-primary">
                ${typeof coin.price === 'number' 
                  ? coin.price.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 8
                    })
                  : parseFloat(coin.price || 0).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 8
                    })
                }
              </p>
              <p className={`text-sm flex items-center justify-end ${
                coin.numericChange >= 0 ? 'text-feedback-success' : 'text-feedback-error'
              }`}>
                {coin.numericChange >= 0 ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                {coin.numericChange >= 0 ? '+' : ''}{coin.numericChange.toFixed(2)}%
              </p>
            </div>
          </motion.div>
        ))}
        
        {processedData.length === 0 && (
          <div className="text-center py-4 text-text-tertiary">
            No data available
          </div>
        )}
      </div>
    </motion.div>
  );
});

TopMovers.displayName = 'TopMovers';