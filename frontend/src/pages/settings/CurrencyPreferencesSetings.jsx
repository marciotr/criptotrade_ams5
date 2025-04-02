import React from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Eye } from 'lucide-react';

export function CurrencyPreferencesSettings() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
      className="p-4 lg:p-6 rounded-xl bg-background-primary shadow-lg"
    >
      <h2 className="text-xl font-bold text-text-primary">Currency Preferences</h2>
      <p className="text-text-secondary mb-4">Configure your currency preferences.</p>
      
      <div className="space-y-6">
        <div>
          <label className="block text-text-primary flex items-center mb-2">
            <DollarSign className="mr-2" /> Preferred Currency
          </label>
          <select className="block w-full px-3 py-2 bg-background-primary border border-border-primary rounded-md shadow-sm focus:outline-none focus:ring-brand-primary text-text-primary">
            <option>USD</option>
            <option>EUR</option>
            <option>GBP</option>
            <option>JPY</option>
          </select>
        </div>
        <div>
          <label className="block text-text-primary flex items-center mb-2">
            <Eye className="mr-2" /> Display Currency
          </label>
          <select className="block w-full px-3 py-2 bg-background-primary border border-border-primary rounded-md shadow-sm focus:outline-none focus:ring-brand-primary text-text-primary">
            <option>BTC</option>
            <option>ETH</option>
            <option>ADA</option>
            <option>DOT</option>
          </select>
        </div>
        <button className="mt-4 px-4 py-2 bg-brand-primary text-background-primary rounded-lg flex items-center hover:opacity-90 transition-colors">
          <DollarSign className="mr-2" /> Save
        </button>
      </div>
    </motion.div>
  );
}