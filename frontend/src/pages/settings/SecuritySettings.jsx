import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Shield, Key } from 'lucide-react';
import { Modal } from '../../components/common/Modal'; 
import InputMask from 'react-input-mask';

export function SecuritySettings() {
  const [selectedAuthMethod, setSelectedAuthMethod] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [phoneMask, setPhoneMask] = useState('(99) 99999-9999');

  const handleAuthMethodChange = (event) => {
    setSelectedAuthMethod(event.target.value);
    setIsModalOpen(event.target.value !== 'None');
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedAuthMethod('');
  };

  const handlePhoneMaskChange = (event) => {
    const selectedCountry = event.target.value;
    if (selectedCountry === 'BR') {
      setPhoneMask('(99) 99999-9999');
    } else {
      setPhoneMask('+999 999 999 999');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-4 lg:p-6 rounded-xl bg-background-primary shadow-lg"
    >
      <h2 className="text-xl font-bold text-text-primary">Security</h2>
      <p className="text-text-secondary mb-4">Configure your security settings.</p>
      
      <div className="space-y-6">
        {/* Password Section */}
        <div>
          <label className="block text-text-primary flex items-center mb-2">
            <Lock className="mr-2 text-brand-primary" /> Change Password
          </label>
          <input 
            type="password" 
            placeholder="Enter new password" 
            className="block w-full px-3 py-2 bg-background-primary border border-border-primary rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-primary text-text-primary placeholder-text-tertiary" 
          />
        </div>

        {/* 2FA Section */}
        <div>
          <label className="block text-text-primary flex items-center mb-2">
            <Shield className="mr-2 text-brand-primary" /> Two-Factor Authentication
          </label>
          <select 
            className="block w-full px-3 py-2 bg-background-primary border border-border-primary rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-primary text-text-primary"
            onChange={handleAuthMethodChange}
          >
            <option>None</option>
            <option>SMS</option>
            <option>Authenticator App</option>
            <option>Email</option>
          </select>
        </div>

        {/* Security Questions */}
        <div>
          <label className="block text-text-primary flex items-center mb-2">
            <Key className="mr-2 text-brand-primary" /> Security Questions
          </label>
          <input 
            type="text" 
            placeholder="Enter security question" 
            className="block w-full px-3 py-2 bg-background-primary border border-border-primary rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-primary text-text-primary placeholder-text-tertiary" 
          />
        </div>

        <button className="px-4 py-2 bg-brand-primary text-background-primary rounded-lg hover:opacity-90 transition-colors flex items-center">
          <Shield className="mr-2" /> Save Changes
        </button>
      </div>

      {/* Modal with updated colors */}
      {isModalOpen && (
        <Modal onClose={closeModal}>
          <div className="p-6 bg-background-primary rounded-lg">
            {selectedAuthMethod === 'SMS' && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-text-primary">Enter your phone number</h3>
                <select className="block w-full px-3 py-2 mb-4 bg-background-primary border border-border-primary rounded-md shadow-sm focus:ring-2 focus:ring-brand-primary text-text-primary" onChange={handlePhoneMaskChange}>
                  <option value="BR">Brazil</option>
                  <option value="INT">International</option>
                </select>
                <InputMask 
                  mask={phoneMask} 
                  placeholder="Enter phone number" 
                  className="block w-full px-3 py-2 bg-background-primary border border-border-primary rounded-md shadow-sm focus:ring-2 focus:ring-brand-primary text-text-primary placeholder-text-tertiary" 
                />
                <button className="w-full px-4 py-2 bg-brand-primary text-background-primary rounded-lg hover:opacity-90 transition-colors">
                  Submit
                </button>
              </div>
            )}
            {selectedAuthMethod === 'Authenticator App' && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-text-primary">Scan the QR code with your authenticator app</h3>
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Link_pra_pagina_principal_da_Wikipedia-PT_em_codigo_QR_b.svg/1200px-Link_pra_pagina_principal_da_Wikipedia-PT_em_codigo_QR_b.svg.png" alt="QR Code" className="mx-auto" />
                <InputMask mask="999 999" placeholder="Enter code" className="block w-full px-3 py-2 bg-background-primary border border-border-primary rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-primary text-text-primary placeholder-text-tertiary" />
                <button className="w-full px-4 py-2 bg-brand-primary text-background-primary rounded-lg hover:opacity-90 transition-colors">Done</button>
              </div>
            )}
            {selectedAuthMethod === 'Email' && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-text-primary">Enter your email address</h3>
                <input type="email" placeholder="Enter email address" className="block w-full px-3 py-2 bg-background-primary border border-border-primary rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-primary text-text-primary placeholder-text-tertiary" />
                <button className="w-full px-4 py-2 bg-brand-primary text-background-primary rounded-lg hover:opacity-90 transition-colors">Submit</button>
              </div>
            )}
          </div>
        </Modal>
      )}
    </motion.div>
  );
}