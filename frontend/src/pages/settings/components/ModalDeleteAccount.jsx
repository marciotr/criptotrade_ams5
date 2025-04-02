import React from 'react';
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
  );
}