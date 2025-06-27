import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUp, ArrowDown, Clock, Check, AlertCircle, ChevronRight } from 'lucide-react';

export const RecentTransactions = React.memo(({ transactions }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 lg:p-6 rounded-xl bg-background-primary border border-border-primary shadow-lg"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-text-primary">Transações Recentes</h2>
        <button className="text-sm text-brand-primary flex items-center hover:underline">
          Ver todas <ChevronRight size={16} />
        </button>
      </div>

      <div className="space-y-3">
        {transactions.map((transaction) => (
          <motion.div
            key={transaction.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: transaction.id * 0.05 }}
            className="p-3 rounded-lg border border-border-primary hover:border-brand-primary/30 transition-all bg-background-secondary/30 flex items-center justify-between"
          >
            {/* Ícone e tipo de transação */}
            <div className="flex items-center">
              <div className={`p-2 rounded-full mr-3 ${
                transaction.type === 'Deposit' || transaction.type === 'Depósito' 
                  ? 'bg-green-500/10' 
                  : 'bg-red-500/10'
              }`}>
                {transaction.type === 'Deposit' || transaction.type === 'Depósito' ? (
                  <ArrowUp className="text-feedback-success" size={16} />
                ) : (
                  <ArrowDown className="text-feedback-error" size={16} />
                )}
              </div>
              <div>
                <p className="font-medium text-text-primary">
                  {transaction.type === 'Deposit' ? 'Depósito' : 
                  transaction.type === 'Withdrawal' ? 'Saque' : transaction.type}
                </p>
                <p className="text-xs text-text-tertiary">{transaction.date}</p>
              </div>
            </div>

            {/* Valor e status */}
            <div className="text-right">
              <p className="font-semibold text-text-primary">
                R${transaction.amount.toLocaleString()}
                <span className="text-text-tertiary ml-1 text-sm">{transaction.currency}</span>
              </p>
              <div className={`text-xs flex items-center justify-end ${
                transaction.status === 'Completed' || transaction.status === 'Concluído' 
                  ? 'text-feedback-success' 
                  : transaction.status === 'Pending' || transaction.status === 'Pendente' 
                    ? 'text-feedback-warning' 
                    : 'text-feedback-error'
              }`}>
                {transaction.status === 'Completed' || transaction.status === 'Concluído' ? (
                  <><Check size={12} className="mr-1" /> Concluído</>
                ) : transaction.status === 'Pending' || transaction.status === 'Pendente' ? (
                  <><Clock size={12} className="mr-1" /> Pendente</>
                ) : (
                  <><AlertCircle size={12} className="mr-1" /> Falhou</>
                )}
              </div>
            </div>
          </motion.div>
        ))}

        {transactions.length === 0 && (
          <div className="text-center py-8 text-text-tertiary">
            <p>Nenhuma transação recente encontrada</p>
          </div>
        )}
      </div>
      
      {transactions.length > 0 && (
        <div className="flex justify-center mt-4">
          <button className="text-sm text-brand-primary py-2 px-4 rounded-lg border border-border-primary hover:bg-background-secondary transition-colors">
            Carregar mais
          </button>
        </div>
      )}
    </motion.div>
  );
});

RecentTransactions.displayName = 'RecentTransactions';