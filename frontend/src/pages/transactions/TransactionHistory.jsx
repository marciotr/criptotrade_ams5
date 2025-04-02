import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUp, ArrowDown, Search, Filter, Download, ChevronLeft, ChevronRight } from 'lucide-react';

const transactions = [
  { 
    id: 1, 
    type: 'Deposit', 
    amount: 5000, 
    currency: 'USD', 
    date: '2025-03-15', 
    status: 'Completed',
    method: 'Credit Card',
    txId: '0x1234...5678'
  },
  { 
    id: 2, 
    type: 'Withdrawal', 
    amount: 2000, 
    currency: 'USD', 
    date: '2025-03-14', 
    status: 'Pending',
    method: 'Bank Transfer',
    txId: '0x2345...6789'
  },
  { 
    id: 3, 
    type: 'Deposit', 
    amount: 3000, 
    currency: 'USD', 
    date: '2025-03-13', 
    status: 'Completed',
    method: 'PayPal',
    txId: '0x3456...7890'
  },
  { 
    id: 4, 
    type: 'Withdrawal', 
    amount: 1500, 
    currency: 'USD', 
    date: '2025-03-12', 
    status: 'Failed',
    method: 'Credit Card',
    txId: '0x4567...8901'
  },
];

const itemsPerPage = 10;

export function TransactionHistory() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Filtro
  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = 
      tx.txId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || tx.status.toLowerCase() === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const currentTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="p-2 sm:p-6 space-y-4 sm:space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-background-primary p-4 sm:p-6 rounded-xl shadow-lg"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
          <h3 className="text-lg sm:text-xl font-bold text-text-primary">
            Transaction History
          </h3>
          
          <div className="flex flex-col sm:flex-row w-full sm:w-auto space-y-2 sm:space-y-0 sm:space-x-4">
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-64 pl-10 pr-4 py-2 text-sm border rounded-lg bg-background-primary border-border-primary text-text-primary focus:ring-2 focus:ring-brand-primary"
              />
              <Search size={16} className="absolute left-3 top-2.5 text-text-tertiary" />
            </div>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full sm:w-auto px-4 py-2 text-sm border rounded-lg bg-background-primary text-text-primary border-border-primary focus:ring-2 focus:ring-brand-primary"
            >
              <option value="all" className="bg-background-primary text-text-primary">
                All Status
              </option>
              <option value="completed" className="bg-background-primary text-text-primary">
                Completed
              </option>
              <option value="pending" className="bg-background-primary text-text-primary">
                Pending
              </option>
              <option value="failed" className="bg-background-primary text-text-primary">
                Failed
              </option>
            </select>

            {/* Export Button */}
            <button className="flex items-center justify-center px-4 py-2 text-sm font-medium text-background-primary bg-brand-primary rounded-lg hover:opacity-90 transition-colors">
              <Download size={16} className="mr-2" />
              Export
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b dark:border-gray-800">
                <th className="px-4 pb-4 text-xs sm:text-sm text-text-primary">Type</th>
                <th className="px-4 pb-4 text-xs sm:text-sm text-text-primary">Amount</th>
                <th className="px-4 pb-4 text-xs sm:text-sm text-text-primary">Currency</th>
                <th className="hidden sm:table-cell px-4 pb-4 text-xs sm:text-sm text-text-primary">Method</th>
                <th className="hidden sm:table-cell px-4 pb-4 text-xs sm:text-sm text-text-primary">Date</th>
                <th className="px-4 pb-4 text-xs sm:text-sm text-text-primary">Status</th>
                <th className="hidden sm:table-cell px-4 pb-4 text-xs sm:text-sm text-text-primary">Transaction ID</th>
              </tr>
            </thead>
            <tbody>
              {currentTransactions.map((transaction) => (
                <motion.tr
                  key={transaction.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * (transaction.id % itemsPerPage) }}
                  className="border-t dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <td className="px-4 py-4 text-xs sm:text-sm text-text-primary">
                    <div className="flex items-center space-x-2">
                      {transaction.type === 'Deposit' ? (
                        <ArrowUp className="text-feedback-success" size={16} />
                      ) : (
                        <ArrowDown className="text-feedback-error" size={16} />
                      )}
                      <span>{transaction.type}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-xs sm:text-sm font-medium text-text-primary">
                    ${transaction.amount.toLocaleString()}
                  </td>
                  <td className="px-4 py-4 text-xs sm:text-sm text-text-primary">
                    {transaction.currency}
                  </td>
                  <td className="hidden sm:table-cell px-4 py-4 text-xs sm:text-sm text-text-primary">
                    {transaction.method}
                  </td>
                  <td className="hidden sm:table-cell px-4 py-4 text-xs sm:text-sm text-text-primary">
                    {transaction.date}
                  </td>
                  <td className={`px-4 py-4 text-xs sm:text-sm ${
                    transaction.status === 'Completed' 
                      ? 'text-feedback-success' 
                      : transaction.status === 'Pending' 
                        ? 'text-feedback-warning' 
                        : 'text-feedback-error'
                  }`}>
                    {transaction.status}
                  </td>
                  <td className="hidden sm:table-cell px-4 py-4 text-xs sm:text-sm text-text-primary">
                    {transaction.txId}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-text-primary">
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredTransactions.length)} of {filteredTransactions.length} entries
          </p>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={20} />
            </button>
            
            <div className="flex items-center space-x-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 rounded-lg text-sm ${
                    currentPage === page
                      ? 'bg-brand-primary text-background-primary'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}