import React from 'react';
import { motion } from 'framer-motion';
import { Bell, Bitcoin, DollarSign, TrendingUp } from 'lucide-react';

export function PriceNotificationsSettings() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
      className="p-4 lg:p-6 rounded-xl bg-background-primary shadow-lg"
    >
      <h2 className="text-xl font-bold text-text-primary">Price Notifications</h2>
      <p className="text-text-secondary mb-4">Configure your price notifications settings.</p>
      
      <div className="space-y-6">
        <div>
          <label className="block text-text-primary flex items-center mb-2">
            <Bitcoin className="mr-2 text-brand-primary" /> Bitcoin Price Alert
          </label>
          <input 
            type="text" 
            placeholder="Enter price" 
            className="block w-full px-3 py-2 bg-background-primary border border-border-primary rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-primary text-text-primary placeholder-text-tertiary" 
          />
        </div>
        <div>
          <label className="block text-text-primary flex items-center mb-2">
            <DollarSign className="mr-2 text-brand-primary" /> Ethereum Price Alert
          </label>
          <input 
            type="text" 
            placeholder="Enter price" 
            className="block w-full px-3 py-2 bg-background-primary border border-border-primary rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-primary text-text-primary placeholder-text-tertiary" 
          />
        </div>
        <div>
          <label className="block text-text-primary flex items-center mb-2">
            <TrendingUp className="mr-2 text-brand-primary" /> Cardano Price Alert
          </label>
          <input 
            type="text" 
            placeholder="Enter price" 
            className="block w-full px-3 py-2 bg-background-primary border border-border-primary rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-primary text-text-primary placeholder-text-tertiary" 
          />
        </div>
        <button className="mt-4 px-4 py-2 bg-brand-primary text-background-primary rounded-lg flex items-center hover:opacity-90 transition-colors">
          <Bell className="mr-2" /> Save
        </button>
      </div>
    </motion.div>
  );
}