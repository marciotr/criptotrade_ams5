import React from 'react';
import { Modal } from '../../../../../components/common/Modal';
import { AlertCircle, Loader } from 'lucide-react';

export function DeleteUserModal({ isOpen, onClose, onConfirm, loading, userName }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} width="max-w-md">
      <div className="text-center">
        <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2 text-text-primary">Delete {userName || 'User'}?</h3>
        <p className="mb-4 text-text-secondary">
          This action cannot be undone. The user account will be permanently removed.
        </p>
        <div className="flex justify-center space-x-3 mt-6">
          <button 
            onClick={onClose} 
            className="px-4 py-2 bg-background-secondary text-text-primary border border-border-primary rounded-md hover:bg-opacity-80 transition"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm} 
            disabled={loading} 
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition flex items-center justify-center"
          >
            {loading ? (
              <>
                <Loader size={16} className="animate-spin mr-2" />
                <span>Deleting...</span>
              </>
            ) : (
              'Delete'
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}