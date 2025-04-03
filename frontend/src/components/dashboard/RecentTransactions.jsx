import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUp, ArrowDown } from 'lucide-react';

export const RecentTransactions = React.memo(({ transactions }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 lg:p-6 rounded-xl bg-background-primary border border-border-primary shadow-lg"
    >
      <h2 className="text-xl font-bold mb-6 text-text-primary">Recent Transactions</h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left">
              <th className="pb-4 text-text-tertiary">Type</th>
              <th className="pb-4 text-text-tertiary">Amount</th>
              <th className="pb-4 text-text-tertiary">Currency</th>
              <th className="pb-4 text-text-tertiary">Date</th>
              <th className="pb-4 text-text-tertiary">Status</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <motion.tr
                key={transaction.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * transaction.id }}
                className="border-t border-border-primary hover:bg-background-secondary transition-colors"
              >
                <td className="py-4 text-text-secondary">
                  <div className="flex items-center space-x-2">
                    {transaction.type === 'Deposit' ? (
                      <ArrowUp className="text-feedback-success" size={16} />
                    ) : (
                      <ArrowDown className="text-feedback-error" size={16} />
                    )}
                    <span>{transaction.type}</span>
                  </div>
                </td>
                <td className="py-4 text-text-secondary">
                  ${transaction.amount.toLocaleString()}
                </td>
                <td className="py-4 text-text-secondary">{transaction.currency}</td>
                <td className="py-4 text-text-secondary">{transaction.date}</td>
                <td className={`py-4 ${
                  transaction.status === 'Completed' ? 'text-feedback-success' : 
                  transaction.status === 'Pending' ? 'text-feedback-warning' : 
                  'text-feedback-error'
                }`}>
                  {transaction.status}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
});

RecentTransactions.displayName = 'RecentTransactions';