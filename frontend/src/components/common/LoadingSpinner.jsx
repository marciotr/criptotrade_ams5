import React from 'react';
import { motion } from 'framer-motion';

export function LoadingSpinner() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center z-50">
      <div className="flex items-center space-x-3 mb-2">
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            className="w-3 h-3 bg-brand-primary rounded-full"
            initial={{ opacity: 0.3 }}
            animate={{
              y: ["0%", "-150%", "0%"],
              opacity: [0.3, 1, 0.3],
              scale: [1, 1.2, 1]
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: index * 0.15,
              ease: "easeInOut",
              times: [0, 0.5, 1]
            }}
          />
        ))}
      </div>
      <motion.span 
        className="text-text-primary text-base font-medium"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        transition={{ duration: 0.3 }}
      >
        Loading
        <motion.span
          animate={{ opacity: [0, 1, 0] }}
          transition={{ 
            duration: 1.2, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          ...
        </motion.span>
      </motion.span>
    </div>
  );
}