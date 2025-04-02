import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUp, ArrowDown } from 'lucide-react';
import CryptoIcon from './CryptoIcons';

export function CryptoCard({ crypto, onClick }) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-background-secondary transition-colors"
    >
      <div className="flex items-center">
        <div className="w-10 h-10 flex items-center justify-center mr-3">
          <CryptoIcon symbol={crypto.symbol} size={24} />
        </div>
        <div>
          <p className="text-sm font-medium text-text-primary">{crypto.name}</p>
          <p className="text-xs text-text-secondary">{crypto.symbol}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-medium text-text-primary">
          ${crypto.price.toLocaleString()}
        </p>
        <div className={`text-xs flex items-center justify-end ${
          crypto.change > 0 ? 'text-feedback-success' : 'text-feedback-error'
        }`}>
          {crypto.change > 0 ? (
            <ArrowUp size={12} className="mr-1" />
          ) : (
            <ArrowDown size={12} className="mr-1" />
          )}
          <span>{Math.abs(crypto.change)}%</span>
        </div>
      </div>
    </motion.button>
  );
}