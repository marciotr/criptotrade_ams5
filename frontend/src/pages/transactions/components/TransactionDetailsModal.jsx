import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUp, ArrowDown, ClipboardCopy } from 'lucide-react';
import CryptoIcon from '../../../components/common/CryptoIcons';
import { useNotification } from '../../../context/NotificationContext';

const TransactionStatus = ({ status }) => {
  let statusConfig = {
    completed: { icon: '✓', color: 'text-green-500', bgColor: 'bg-green-100 dark:bg-green-900/30', label: 'Concluída' },
    pending: { icon: '⌛', color: 'text-yellow-500', bgColor: 'bg-yellow-100 dark:bg-yellow-900/30', label: 'Pendente' },
    failed: { icon: '⚠', color: 'text-red-500', bgColor: 'bg-red-100 dark:bg-red-900/30', label: 'Falhou' }
  };
  const config = statusConfig[(status || '').toLowerCase()] || statusConfig.pending;
  return (
    <div className="flex items-center">
      <div className={`flex items-center px-1.5 py-0.5 rounded-full ${config.bgColor}`}>
        <span className={`mr-0.5 ${config.color}`}>{config.icon}</span>
        <span className={`text-[8px] sm:text-xs font-medium ${config.color}`}>{config.label}</span>
      </div>
    </div>
  );
};

export default function TransactionDetailsModal({ isOpen, onClose, transaction, isMobile, modalScale }) {
  const { showNotification } = useNotification();

  if (!transaction) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: isMobile ? 0.98 : modalScale * 0.9, opacity: 0, y: 20 }}
            animate={{ scale: isMobile ? 1 : modalScale, opacity: 1, y: 0 }}
            exit={{ scale: isMobile ? 0.98 : modalScale * 0.9, opacity: 0, y: 20 }}
            style={{ transformOrigin: 'center center', willChange: 'transform' }}
            className={isMobile ? 'bg-background-primary rounded-none w-full h-full overflow-auto border-none' : 'bg-background-primary rounded-xl shadow-xl w-full max-w-md overflow-hidden border border-border-primary'}
            onClick={e => e.stopPropagation()}
          >
            <div className={`p-4 sm:p-6 ${transaction.type === 'Depósito' ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gradient-to-r from-red-500 to-rose-600'} text-white`}>
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center">
                    {transaction.type === 'Depósito' ? (
                      <ArrowUp className="mr-2" size={isMobile ? 16 : 20} />
                    ) : (
                      <ArrowDown className="mr-2" size={isMobile ? 16 : 20} />
                    )}
                    <h3 className="text-lg sm:text-xl font-bold">{transaction.type}</h3>
                  </div>
                  <p className="opacity-90 text-xs sm:text-sm mt-0.5 sm:mt-1">Transação #{transaction.id}</p>
                </div>
              </div>

              <div className="mt-3 sm:mt-4">
                <p className="text-xs sm:text-sm opacity-80">Valor</p>
                <div className="flex items-baseline">
                  <span className="text-2xl sm:text-3xl font-bold">R${transaction.amount.toLocaleString()}</span>
                  <span className="ml-2 text-sm sm:text-base">{transaction.currency}</span>
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-6 space-y-3 sm:space-y-5">
              <div className="flex justify-between items-center pb-3 sm:pb-4 border-b border-border-primary">
                <span className="text-xs sm:text-sm text-text-tertiary">Status</span>
                <TransactionStatus status={transaction.status} />
              </div>

              <div className="bg-background-secondary p-3 sm:p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-text-tertiary">Data</span>
                  <span className="text-xs sm:text-sm text-text-primary">{new Date(transaction.date).toLocaleDateString('pt-BR', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                </div>
              </div>

              <div className="bg-background-secondary p-3 sm:p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-text-tertiary">Horário</span>
                  <span className="text-xs sm:text-sm text-text-primary">{new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>

              <div className="bg-background-secondary p-3 sm:p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-text-tertiary">Método</span>
                  <div className="flex items-center text-xs sm:text-sm text-text-primary">
                    <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-background-secondary text-text-tertiary">
                      <div className="mr-2 w-5 h-5 rounded-full overflow-hidden flex items-center justify-center">
                        <CryptoIcon symbol={transaction.currency} size={14} />
                      </div>
                      <span>{transaction.method}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-background-secondary p-3 sm:p-4 rounded-lg">
                <div>
                  <span className="text-text-tertiary block mb-2">ID da Transação</span>
                  <div className="flex items-center justify-between">
                    <span className="text-text-primary text-xs font-mono">{transaction.txId}</span>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      className="p-1.5 text-text-tertiary hover:text-brand-primary rounded-full hover:bg-background-tertiary"
                      onClick={() => {
                        try {
                          const text = transaction.txId || '';
                          if (navigator.clipboard && navigator.clipboard.writeText) {
                            navigator.clipboard.writeText(text).then(() => {
                              showNotification('Copiado para área de transferência!', 'success');
                            }).catch(() => {
                              showNotification('Falha ao copiar para a área de transferência', 'error');
                            });
                          } else {
                            const ta = document.createElement('textarea');
                            ta.value = text;
                            document.body.appendChild(ta);
                            ta.select();
                            try {
                              document.execCommand('copy');
                              showNotification('Copiado para área de transferência!', 'success');
                            } catch (err) {
                              showNotification('Falha ao copiar para a área de transferência', 'error');
                            }
                            document.body.removeChild(ta);
                          }
                        } catch (e) {
                          showNotification('Falha ao copiar para a área de transferência', 'error');
                        }
                      }}
                    >
                      <ClipboardCopy size={14} />
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-4 sm:px-6 pb-6 flex justify-between">
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="px-3 sm:px-4 py-1.5 sm:py-2 border border-border-primary text-text-primary rounded-lg hover:bg-background-secondary transition-colors" onClick={onClose}>Fechar</motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
