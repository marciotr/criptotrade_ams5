import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

export function ModalDeactivate({ onClose, onDeactivate }) {
  const handleDeactivate = () => {
    onDeactivate();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        className="relative bg-background-primary rounded-lg shadow-lg p-6 w-full max-w-md"
      >
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-text-secondary hover:text-text-primary transition-colors"
        >
          <X size={24} />
        </button>
        <h3 className="text-lg font-bold text-text-primary mb-4">Deactivate Account</h3>
        <p className="text-text-secondary mb-4">
          Are you sure you want to deactivate your account? You can reactivate it later.
        </p>
        <div className="flex space-x-4">
          <button 
            onClick={handleDeactivate} 
            className="flex-1 px-4 py-2 bg-feedback-error text-background-primary rounded-lg hover:opacity-90 transition-colors"
          >
            Deactivate
          </button>
          <button 
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-border-primary text-text-primary rounded-lg hover:bg-background-secondary transition-colors"
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </div>
  );
}