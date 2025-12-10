import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

export function Modal({ 
  children, 
  onClose, 
  width = 'max-w-md',
  height = 'auto',
  maxHeight = 'max-h-[80vh]',
  overflow = 'overflow-auto',
  isOpen = true 
}) {

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        className={`relative bg-background-primary rounded-lg shadow-lg p-6 w-full ${width} ${
          height !== 'auto' ? height : ''
        } ${maxHeight} ${overflow}`}
      >
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-text-secondary hover:text-text-primary transition-colors"
        >
          <X size={24} />
        </button>
        {children}
      </motion.div>
    </div>
  );
}