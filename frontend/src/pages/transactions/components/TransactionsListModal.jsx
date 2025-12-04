import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import CryptoIcon from '../../../components/common/CryptoIcons';

export default function TransactionsListModal({ isOpen, onClose, title = '', data = [], transactions }) {
  // Accept either `data` or `transactions` prop for compatibility
  const items = transactions ?? data ?? [];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4" onClick={onClose}>
          <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="bg-background-primary rounded-xl shadow-xl w-full max-w-2xl p-4 sm:p-6 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-bold text-text-primary">{title}</h3>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-background-secondary text-text-tertiary">✕</button>
            </div>

            <div className="divide-y divide-border-primary">
              {items.length === 0 && (
                <div className="py-8 text-center text-text-tertiary">Nenhuma transação encontrada</div>
              )}
              {items.map(tx => (
                <div key={tx.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-background-secondary">
                      <CryptoIcon symbol={tx.currency} size={18} />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-text-primary">{tx.type} • {tx.method}</div>
                      <div className="text-[11px] text-text-tertiary">{new Date(tx.date).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-text-primary">R${tx.amount.toLocaleString()}</div>
                    <div className="text-[11px] text-text-tertiary">{tx.currency}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex justify-end">
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="px-3 py-1.5 bg-background-secondary text-text-primary rounded-lg" onClick={onClose}>Fechar</motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
