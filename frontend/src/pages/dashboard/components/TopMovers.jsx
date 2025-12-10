import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowUp, ArrowDown } from 'lucide-react';
import CryptoIcon from '../../../components/common/CryptoIcons';

export const TopMovers = React.memo(({ data, type, isMobile }) => {
  const title = type === 'gainers' ? 'Maiores Altas' : 'Maiores Baixas';

  // Processamento de dados aprimorado com melhor tratamento de números
  const processedData = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) return [];

    const numericData = data.map(coin => {
      // Tratar formato de string de volume (ex: "44.071,369" -> 44071.369)
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

    // Ordenar com base na mudança de preço
    const sortedData = [...numericData].sort((a, b) => {
      if (type === 'gainers') {
        return b.numericChange - a.numericChange;
      } else {
        return a.numericChange - b.numericChange;
      }
    });

    // Pegar os 5 primeiros
    return sortedData.slice(0, 5);
  }, [data, type]);

  // Formatar volume com tratamento adequado de números
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

  // Classes responsivas
  const containerPadding = isMobile ? "p-3 sm:p-4" : "p-4 lg:p-6";
  const itemPadding = isMobile ? "p-2" : "p-3";
  const titleSize = isMobile ? "text-base" : "text-xl"; 
  const textSize = isMobile ? "text-xs" : "text-sm";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${containerPadding} rounded-xl bg-background-primary border border-border-primary shadow-lg`}
    >
      <h2 className={`${titleSize} font-bold mb-4 sm:mb-6 text-text-primary`}>{title}</h2>
      <div className="space-y-2 sm:space-y-4">
        {processedData.map((coin, index) => (
          <motion.div 
            key={coin.symbol || index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`flex items-center justify-between ${itemPadding} hover:bg-background-secondary rounded-lg transition-colors`}
          >
            <div className="flex items-center space-x-2">
              <CryptoIcon symbol={coin.symbol} size={isMobile ? 18 : 24} />
              <div>
                <p className={`font-semibold text-text-primary ${textSize}`}>{coin.coin}</p>
                <p className={`${isMobile ? "text-[10px]" : textSize} text-text-secondary`}>
                  Vol: ${formatVolume(coin.normalizedVolume)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className={`font-semibold text-text-primary ${textSize}`}>
                ${typeof coin.price === 'number' 
                  ? coin.price.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: isMobile ? 2 : 8
                    })
                  : parseFloat(coin.price || 0).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: isMobile ? 2 : 8
                    })
                }
              </p>
              <p className={`${isMobile ? "text-[10px]" : textSize} flex items-center justify-end ${
                coin.numericChange >= 0 ? 'text-feedback-success' : 'text-feedback-error'
              }`}>
                {coin.numericChange >= 0 ? <ArrowUp size={isMobile ? 10 : 12} /> : <ArrowDown size={isMobile ? 10 : 12} />}
                {coin.numericChange >= 0 ? '+' : ''}{coin.numericChange.toFixed(2)}%
              </p>
            </div>
          </motion.div>
        ))}
        
        {processedData.length === 0 && (
          <div className="text-center py-4 text-text-tertiary">
            Dados não disponíveis
          </div>
        )}
      </div>
    </motion.div>
  );
});

TopMovers.displayName = 'TopMovers';