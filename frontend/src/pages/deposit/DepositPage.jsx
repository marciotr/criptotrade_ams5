import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, DollarSign, Wallet, ArrowDownLeft, ArrowUpRight, X } from 'lucide-react';
import Logo from '../../assets/img/logoBinanceRemoved.png';
import InputMask from 'react-input-mask';

export function DepositPage() {
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [amount, setAmount] = useState('');

  const handleMethodClick = (method) => {
    setSelectedMethod(method === selectedMethod ? null : method);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl pt-20">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl font-bold text-text-primary mb-6">Deposit / Buy Crypto</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left panel */}
          <motion.div 
            className="bg-background-primary p-6 rounded-xl shadow-lg"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-xl font-bold mb-4 text-text-primary">Deposit Options</h2>
            <p className="text-text-secondary mb-6">Choose a method to add funds to your account</p>
            
            <div className="space-y-4">
              <div 
                className={`p-4 bg-background-secondary rounded-lg flex items-center cursor-pointer ${
                  selectedMethod === 'card' ? 'ring-2 ring-brand-primary' : 'hover:bg-background-tertiary'
                } transition-colors`}
                onClick={() => handleMethodClick('card')}
              >
                <div className="w-10 h-10 bg-brand-primary bg-opacity-10 rounded-full flex items-center justify-center mr-4">
                  <CreditCard className="text-brand-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-text-primary">Credit / Debit Card</h3>
                  <p className="text-sm text-text-secondary">Instant deposit, 1.5% fee</p>
                </div>
              </div>
              
              {selectedMethod === 'card' && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="ml-14 mt-2 p-4 bg-background-secondary rounded-lg"
                >
                  <h4 className="text-sm font-bold text-text-primary mb-3">Card Details</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-text-secondary mb-1">Card Number</label>
                      <InputMask 
                        mask="9999 9999 9999 9999"
                        placeholder="1234 5678 9012 3456" 
                        className="w-full p-2 border border-border-primary rounded-md bg-background-primary"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm text-text-secondary mb-1">Expiry Date</label>
                        <InputMask 
                          mask="99/99"
                          placeholder="MM/YY" 
                          className="w-full p-2 border border-border-primary rounded-md bg-background-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-text-secondary mb-1">CVC</label>
                        <InputMask 
                          mask="999"
                          placeholder="123" 
                          className="w-full p-2 border border-border-primary rounded-md bg-background-primary"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-text-secondary mb-1">Amount (USD)</label>
                      <InputMask 
                        mask="$ 999999999.99"
                        maskChar={null}
                        placeholder="$ 0.00" 
                        className="w-full p-2 border border-border-primary rounded-md bg-background-primary"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                      />
                    </div>
                    <button className="w-full py-2 bg-brand-primary text-white rounded-md hover:bg-opacity-90 transition-colors">
                      Complete Deposit
                    </button>
                  </div>
                </motion.div>
              )}
              
              <div 
                className={`p-4 bg-background-secondary rounded-lg flex items-center cursor-pointer ${
                  selectedMethod === 'bank' ? 'ring-2 ring-brand-primary' : 'hover:bg-background-tertiary'
                } transition-colors`}
                onClick={() => handleMethodClick('bank')}
              >
                <div className="w-10 h-10 bg-brand-primary bg-opacity-10 rounded-full flex items-center justify-center mr-4">
                  <DollarSign className="text-brand-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-text-primary">Bank Transfer</h3>
                  <p className="text-sm text-text-secondary">1-3 business days, no fee</p>
                </div>
              </div>
              
              {selectedMethod === 'bank' && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="ml-14 mt-2 p-4 bg-background-secondary rounded-lg"
                >
                  <h4 className="text-sm font-bold text-text-primary mb-3">Bank Transfer Details</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-text-secondary mb-1">Account Holder Name</label>
                      <input 
                        type="text" 
                        placeholder="Your full name" 
                        className="w-full p-2 border border-border-primary rounded-md bg-background-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-text-secondary mb-1">Amount (USD)</label>
                      <InputMask 
                        mask="$ 999999999.99"
                        maskChar={null}
                        placeholder="$ 0.00" 
                        className="w-full p-2 border border-border-primary rounded-md bg-background-primary"
                      />
                    </div>
                    <div className="bg-background-primary p-3 rounded-md border border-border-primary">
                      <h5 className="text-sm font-medium text-text-primary mb-1">Our Bank Details</h5>
                      <p className="text-xs text-text-secondary">Account: 123456789</p>
                      <p className="text-xs text-text-secondary">Routing: 012345678</p>
                      <p className="text-xs text-text-secondary">Bank: CriptoTrade Financial</p>
                      <p className="text-xs text-text-secondary mb-2">Reference: Include your user ID</p>
                    </div>
                    <button className="w-full py-2 bg-brand-primary text-white rounded-md hover:bg-opacity-90 transition-colors">
                      I've Sent the Transfer
                    </button>
                  </div>
                </motion.div>
              )}
              
              <div 
                className={`p-4 bg-background-secondary rounded-lg flex items-center cursor-pointer ${
                  selectedMethod === 'crypto' ? 'ring-2 ring-brand-primary' : 'hover:bg-background-tertiary'
                } transition-colors`}
                onClick={() => handleMethodClick('crypto')}
              >
                <div className="w-10 h-10 bg-brand-primary bg-opacity-10 rounded-full flex items-center justify-center mr-4">
                  <Wallet className="text-brand-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-text-primary">Crypto Transfer</h3>
                  <p className="text-sm text-text-secondary">Deposit crypto from external wallet</p>
                </div>
              </div>
              
              {selectedMethod === 'crypto' && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="ml-14 mt-2 p-4 bg-background-secondary rounded-lg"
                >
                  <h4 className="text-sm font-bold text-text-primary mb-3">Deposit Cryptocurrency</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-text-secondary mb-1">Select Cryptocurrency</label>
                      <select className="w-full p-2 border border-border-primary rounded-md bg-background-primary">
                        <option>Bitcoin (BTC)</option>
                        <option>Ethereum (ETH)</option>
                        <option>Tether (USDT)</option>
                        <option>USD Coin (USDC)</option>
                      </select>
                    </div>
                    <div className="bg-background-primary p-3 rounded-md border border-border-primary">
                      <h5 className="text-sm font-medium text-text-primary mb-2">Your Deposit Address</h5>
                      <div className="flex items-center justify-between mb-2">
                        <code className="text-xs bg-background-secondary p-2 rounded w-full overflow-hidden">
                          bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh
                        </code>
                        <button className="ml-2 p-1 bg-background-secondary rounded hover:bg-background-tertiary">
                          <CreditCard size={16} className="text-text-secondary" />
                        </button>
                      </div>
                      <div className="flex justify-center py-2">
                        <div className="bg-white p-2 rounded w-32 h-32">
                          {/* QR Code placeholder */}
                          <div className="w-full h-full border-2 border-dashed border-gray-300 flex items-center justify-center">
                            <span className="text-xs text-gray-500">QR Code</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-amber-500 mt-2">Important: Only send BTC to this address. Sending any other coin may result in permanent loss.</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
            
            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-700">
                Tela ainda mockada. Os formulários não submetem dados reais.
              </p>
            </div>
          </motion.div>
          
          {/* Right panel */}
          <motion.div 
            className="bg-background-primary p-6 rounded-xl shadow-lg"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-xl font-bold mb-4 text-text-primary">Recent Activity</h2>
            
            <div className="space-y-3">
              <div className="p-3 border border-border-primary rounded-lg flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <ArrowDownLeft className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="text-text-primary">Deposit</h4>
                    <p className="text-xs text-text-tertiary">Jun 12, 2023</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-text-primary font-medium">+$1,000.00</p>
                  <p className="text-xs text-text-tertiary">Bank Transfer</p>
                </div>
              </div>
              
              <div className="p-3 border border-border-primary rounded-lg flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                    <ArrowUpRight className="h-4 w-4 text-red-600" />
                  </div>
                  <div>
                    <h4 className="text-text-primary">Withdrawal</h4>
                    <p className="text-xs text-text-tertiary">Jun 10, 2023</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-text-primary font-medium">-$250.00</p>
                  <p className="text-xs text-text-tertiary">To Bank Account</p>
                </div>
              </div>
              
              <div className="p-3 border border-border-primary rounded-lg flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <ArrowDownLeft className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="text-text-primary">Deposit</h4>
                    <p className="text-xs text-text-tertiary">Jun 5, 2023</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-text-primary font-medium">+$500.00</p>
                  <p className="text-xs text-text-tertiary">Credit Card</p>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-3 text-text-primary">Your Balances</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-background-secondary rounded-lg">
                  <p className="text-sm text-text-tertiary mb-1">USD Balance</p>
                  <p className="text-lg font-medium text-text-primary">$1,250.00</p>
                </div>
                <div className="p-3 bg-background-secondary rounded-lg">
                  <p className="text-sm text-text-tertiary mb-1">EUR Balance</p>
                  <p className="text-lg font-medium text-text-primary">€0.00</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="mt-8 flex justify-center">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center text-text-secondary text-sm"
          >
            <img src={Logo} alt="CriptoTrade" className="w-12 h-12 mx-auto mb-2" />
            <p>Esta é uma interface mockada. Os dados não são reais.</p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}