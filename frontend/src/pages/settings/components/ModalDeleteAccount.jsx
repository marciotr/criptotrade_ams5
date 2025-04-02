import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

export function ModalDeleteAccount({ onClose, onDelete }) {
  const handleDelete = () => {
    onDelete();
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
        <h3 className="text-lg font-bold text-text-primary mb-4">Delete Account</h3>
        <p className="text-text-secondary mb-4">
          Are you sure you want to delete your account? This action cannot be undone.
        </p>
        <button 
          onClick={handleDelete} 
          className="w-full px-4 py-2 bg-feedback-error text-background-primary rounded-lg hover:opacity-90 transition-colors"
        >
          Delete Account
        </button>
      </motion.div>
    </div>
  );
}