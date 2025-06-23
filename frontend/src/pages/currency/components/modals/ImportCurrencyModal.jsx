import React from 'react';
import { Plus, Loader } from 'lucide-react';
import { Modal } from '../../../../components/common/Modal';
import CryptoIcon from '../../../../components/common/CryptoIcons';

export function ImportCurrencyModal({ isOpen, onClose, coin, onConfirm, loading }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} width="max-w-md" overflow="overflow-y-auto">
      <div className="text-center">
        <div className="mb-4 p-3 bg-background-secondary inline-block rounded-full">
          {coin && <CryptoIcon symbol={coin.symbol} size={32} />}
        </div>
        <h2 className="text-xl font-semibold mb-4 text-text-primary">
          Import {coin?.symbol || 'Currency'}
        </h2>
        <p className="text-text-secondary mb-6">
          You are about to import <strong className="text-text-primary">{coin?.symbol}</strong> ({coin?.name}) 
          backed by <strong className="text-text-primary">{coin?.backing}</strong>.
        </p>
        
        {coin && (
          <div className="bg-background-secondary p-4 rounded-lg mb-6 border border-border-primary">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="text-left">
                <p className="text-text-tertiary">Symbol</p>
                <p className="font-medium text-text-primary">{coin.symbol}</p>
              </div>
              <div className="text-left">
                <p className="text-text-tertiary">Name</p>
                <p className="font-medium text-text-primary">{coin.name}</p>
              </div>
              <div className="text-left">
                <p className="text-text-tertiary">Backing</p>
                <p className="font-medium text-text-primary">{coin.backing}</p>
              </div>
              <div className="text-left">
                <p className="text-text-tertiary">Status</p>
                <p className="font-medium text-green-500">Active</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex justify-center space-x-3 mt-6 pt-4 border-t border-border-primary">
          <button 
            onClick={onClose} 
            className="px-4 py-2 bg-background-secondary text-text-primary border border-border-primary rounded-md hover:bg-opacity-80 transition"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm} 
            disabled={loading} 
            className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-primary-dark transition flex items-center justify-center"
          >
            {loading ? (
              <><Loader size={16} className="animate-spin mr-2" /> Importing...</>
            ) : (
              <><Plus size={16} className="mr-2" /> Import Currency</>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}