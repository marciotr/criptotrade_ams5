import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, Route, Routes, useNavigate, useLocation } from 'react-router-dom';
import { ProfileSettings } from './ProfileSettings';
import { UsabilitySettings } from './UsabilitySettings';
import { PriceNotificationsSettings } from './PriceNotificationSettings';
import { SecuritySettings } from './SecuritySettings';
import { CurrencyPreferencesSettings } from './CurrencyPreferencesSetings';
import { User, Settings as SettingsIcon, Bell, Shield, DollarSign, ArrowLeft, ChevronRight } from 'lucide-react';

const pageVariants = {
  initial: {
    opacity: 0,
    x: '-100vw',
  },
  in: {
    opacity: 1,
    x: 0,
  },
  out: {
    opacity: 0,
    x: '100vw',
  },
};

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.5,
};

export function Settings() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);

  const menuItems = [
    { path: '/settings/profile', icon: User, label: 'Profile' },
    { path: '/settings/usability', icon: SettingsIcon, label: 'Usability' },
    { path: '/settings/price-notifications', icon: Bell, label: 'Price Notifications' },
    { path: '/settings/security', icon: Shield, label: 'Security' },
    { path: '/settings/currency-preferences', icon: DollarSign, label: 'Currency Preferences' },
  ];

  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      className="flex flex-col lg:flex-row h-screen"
    >
      <motion.div 
        className={`relative w-full lg:w-auto bg-background-secondary p-2 flex lg:flex-col gap-1 
          ${isExpanded ? 'lg:w-64' : 'lg:w-14'}`}
      >
        {/* Back button */}
        <button
          onClick={() => navigate('/dashboard')}
          className={`flex items-center justify-center lg:justify-start text-text-secondary p-2.5 rounded-lg hover:bg-background-tertiary transition-colors
            ${isExpanded ? 'w-full' : 'w-10 h-10'}`}
        >
          <ArrowLeft size={18} />
          {isExpanded && <span className="ml-3 text-sm">Back</span>}
        </button>

        {/* Toggle expand button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="hidden lg:flex absolute -right-2.5 top-1/2 -translate-y-1/2 items-center justify-center w-5 h-5 rounded-full bg-background-secondary border border-border-primary hover:bg-background-tertiary transition-colors z-10"
        >
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronRight 
              size={10} 
              className="text-text-secondary" 
            />
          </motion.div>
        </button>

        {/* Navigation Menu */}
        <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible scrollbar-none">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center justify-center lg:justify-start p-2.5 rounded-lg transition-colors group
                ${location.pathname === item.path 
                  ? 'bg-brand-primary text-background-primary' 
                  : 'text-text-secondary hover:bg-background-tertiary'}
                ${isExpanded ? 'w-full' : 'w-10 h-10'}`}
            >
              <item.icon size={18} />
              {isExpanded && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="ml-3 text-sm whitespace-nowrap overflow-hidden"
                >
                  {item.label}
                </motion.span>
              )}
              {!isExpanded && (
                <div className="fixed left-14 ml-2 scale-0 group-hover:scale-100 origin-left transition-all bg-background-primary text-text-primary px-2 py-1 rounded text-sm whitespace-nowrap">
                  {item.label}
                </div>
              )}
            </Link>
          ))}
        </nav>
      </motion.div>

      {/* Content Area */}
      <div className="flex-1 p-6 bg-background-primary overflow-y-auto">
        <Routes>
          <Route path="profile" element={<ProfileSettings />} />
          <Route path="usability" element={<UsabilitySettings />} />
          <Route path="price-notifications" element={<PriceNotificationsSettings />} />
          <Route path="security" element={<SecuritySettings />} />
          <Route path="currency-preferences" element={<CurrencyPreferencesSettings />} />
        </Routes>
      </div>
    </motion.div>
  );
}