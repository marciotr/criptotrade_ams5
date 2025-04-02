import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, X } from 'lucide-react';

export function NotificationToast({ message, type, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      className={`
        min-w-[300px] p-4 rounded-lg shadow-lg 
        flex items-center justify-between gap-3
        ${type === 'success' ? 'bg-green-500' : 'bg-red-500'} 
        text-white
      `}
    >
      <div className="flex items-center gap-3">
        {type === 'success' ? (
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
        ) : (
          <XCircle className="w-5 h-5 flex-shrink-0" />
        )}
        <p className="text-sm">{message}</p>
      </div>
      <button 
        onClick={onClose}
        className="p-1 hover:bg-white/20 rounded-full transition-colors"
      >
        <X size={14} />
      </button>
    </motion.div>
  );
}