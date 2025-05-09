import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, DollarSign, Wallet, AlertCircle } from 'lucide-react';
import { walletApi } from '../../services/api/api';
import { AuthContext } from '../../store/auth/AuthContext';
import { useNotification } from '../../context/NotificationContext'; 

const paymentMethods = [
  { id: 'card', name: 'Credit Card', icon: CreditCard },
  { id: 'bank', name: 'Bank Transfer', icon: DollarSign },
  { id: 'crypto', name: 'Crypto Wallet', icon: Wallet },
];

const availableCurrencies = [
  { id: 'USD', name: 'US Dollar', symbol: '$' },
  { id: 'EUR', name: 'Euro', symbol: '€' },
  { id: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
  { id: 'GBP', name: 'British Pound', symbol: '£' },
];

export function FiatDepositPage() {
  const [amount, setAmount] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState(availableCurrencies[0]);
  const [paymentMethod, setPaymentMethod] = useState(paymentMethods[0]);
  const [isLoading, setIsLoading] = useState(false);
  
  const { user } = useContext(AuthContext);
  const { showNotification } = useNotification();

  const handleDeposit = async () => {
    if (!user) {
      showNotification({
        message: "Please login to continue",
        type: "error"
      });
      return;
    }

    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      showNotification({
        message: "Please enter a valid amount",
        type: "error"
      });
      return;
    }

    setIsLoading(true);

    try {
      await walletApi.depositFiat({
        userId: user.id,
        currency: selectedCurrency.id,
        amount: parseFloat(amount),
        method: paymentMethod.name
      });

      showNotification({
        message: `Successfully deposited ${amount} ${selectedCurrency.id}`,
        type: "success"
      });
      
      setAmount('');
    } catch (error) {
      console.error("Deposit error:", error);
      showNotification({
        message: error.response?.data?.message || "Deposit failed",
        type: "error"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 mt-12 sm:mt-16">
      <div className="max-w-xl mx-auto">
        <h1 className="text-xl sm:text-2xl font-bold mb-6 text-text-primary">
          Deposit Funds
        </h1>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-background-primary rounded-xl shadow-lg overflow-hidden p-6"
        >
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                I want to deposit
              </label>
              <div className="flex">
                <div className="relative rounded-l-md bg-background-secondary border border-r-0 border-border-primary px-3 flex items-center text-text-primary font-medium">
                  <span>{selectedCurrency.symbol}</span>
                </div>
                <input
                  type="text"
                  className="flex-grow px-4 py-3 rounded-r-lg border border-border-primary bg-background-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Currency
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {availableCurrencies.map((currency) => (
                  <button
                    key={currency.id}
                    className={`p-3 rounded-lg border ${
                      selectedCurrency.id === currency.id
                        ? 'border-brand-primary bg-brand-primary bg-opacity-10'
                        : 'border-border-primary hover:bg-background-secondary'
                    } transition-colors`}
                    onClick={() => setSelectedCurrency(currency)}
                  >
                    <div className="flex flex-col items-center">
                      <span className="text-xl font-bold">{currency.symbol}</span>
                      <span className="text-xs text-text-secondary">{currency.id}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Payment Method
              </label>
              <div className="grid grid-cols-3 gap-2">
                {paymentMethods.map((method) => (
                  <button
                    key={method.id}
                    className={`p-3 rounded-lg border ${
                      paymentMethod.id === method.id
                        ? 'border-brand-primary bg-brand-primary bg-opacity-10'
                        : 'border-border-primary hover:bg-background-secondary'
                    } transition-colors`}
                    onClick={() => setPaymentMethod(method)}
                  >
                    <div className="flex flex-col items-center">
                      <method.icon size={24} className="mb-1" />
                      <span className="text-xs text-text-secondary">{method.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="pt-4">
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className={`w-full py-3 bg-brand-primary text-background-primary rounded-lg hover:opacity-90 transition-colors font-medium ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                onClick={handleDeposit}
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : 'Deposit Funds'}
              </motion.button>
            </div>
            
            <div className="p-3 bg-background-secondary rounded-lg flex items-start">
              <AlertCircle size={16} className="text-brand-primary mt-0.5 mr-2 flex-shrink-0" />
              <p className="text-sm text-text-secondary">
                This is a simulated deposit. No actual money will be transferred.
                Your balance will be updated instantly for demonstration purposes.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}