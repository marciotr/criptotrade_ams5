import React from 'react';
import { motion } from 'framer-motion';
import { Loader } from 'lucide-react';

export const LoadingScreen = ({ message = "Carregando...", size = "medium" }) => {
  const sizeClasses = {
    small: "w-8 h-8",
    medium: "w-12 h-12",
    large: "w-16 h-16"
  };

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-background bg-opacity-80 z-50">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
      >
        <Loader className={`${sizeClasses[size]} text-brand-primary`} />
      </motion.div>
      <p className="mt-4 text-text-secondary font-medium">{message}</p>
    </div>
  );
};

export const InlineLoading = ({ message = "Carregando...", size = "small" }) => {
  const sizeClasses = {
    tiny: "w-4 h-4",
    small: "w-5 h-5",
    medium: "w-6 h-6"
  };

  return (
    <div className="flex items-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      >
        <Loader className={`${sizeClasses[size]} text-brand-primary`} />
      </motion.div>
      <p className="ml-2 text-text-secondary">{message}</p>
    </div>
  );
};