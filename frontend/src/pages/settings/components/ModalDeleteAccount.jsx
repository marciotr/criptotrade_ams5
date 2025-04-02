import React from 'react';
<<<<<<< HEAD
import { Modal } from '../../../components/common/Modal';
import { AlertTriangle } from 'lucide-react';

export function ModalDeleteAccount({ onClose, onDelete, isLoading }) {
  const handleConfirmDelete = async () => {
    await onDelete();
  };

  return (
    <Modal onClose={onClose}>
      <div className="space-y-6">
        <div className="flex flex-col items-center text-center">
          <AlertTriangle 
            size={48} 
            className="text-feedback-error mb-4" 
          />
          <h3 className="text-xl font-semibold text-text-primary">Delete Account</h3>
          <p className="mt-2 text-text-secondary">
            Are you sure you want to delete your account? This action cannot be undone.
          </p>
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-text-primary hover:bg-background-secondary rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirmDelete}
            disabled={isLoading}
            className="px-4 py-2 bg-feedback-error text-white rounded-lg hover:opacity-90 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete Account'
            )}
          </button>
        </div>
      </div>
    </Modal>
=======
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
>>>>>>> 1eca3b2d26f6e3c41c581351e076587792c19d9f
  );
}