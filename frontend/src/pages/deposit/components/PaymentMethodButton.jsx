import React from 'react';
import { motion } from 'framer-motion';

export function PaymentMethodButton({ method, isSelected, onClick }) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`p-3 sm:p-4 rounded-lg border flex flex-col items-center justify-center transition-colors ${
        isSelected
          ? 'border-brand-primary bg-background-secondary'
          : 'border-border-primary hover:bg-background-secondary'
      }`}
      onClick={onClick}
    >
      <method.icon size={20} className={
        isSelected ? 'text-brand-primary' : 'text-text-secondary'
      } />
      <span className={isSelected ? 'text-brand-primary' : 'text-text-primary'}>
        {method.name}
      </span>
    </motion.button>
  );
}