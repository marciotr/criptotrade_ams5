import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { Moon, Sun, Bell, BellOff } from 'lucide-react';

export function UsabilitySettings() {
  const { theme, toggleTheme } = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleNotificationsToggle = () => {
    setNotificationsEnabled(!notificationsEnabled);
  };

  return (
    <motion.section
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="bg-background-primary p-6 rounded-xl shadow-lg"
    >
      <h2 className="text-xl font-semibold text-text-primary mb-4">Usability</h2>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-text-secondary flex items-center">
            {theme === 'light' ? <Sun className="mr-2" /> : <Moon className="mr-2" />} Dark Mode
          </span>
          <button
            onClick={toggleTheme}
            className="px-4 py-2 rounded-lg bg-background-secondary text-text-secondary hover:bg-background-tertiary"
          >
            {theme === 'light' ? 'Enable Dark Mode' : 'Disable Dark Mode'}
          </button>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-600 dark:text-gray-400 flex items-center">
            {notificationsEnabled ? <Bell className="mr-2" /> : <BellOff className="mr-2" />} Enable Notifications
          </span>
          <button
            onClick={handleNotificationsToggle}
            className={`px-4 py-2 rounded-lg ${
              notificationsEnabled
                ? 'bg-blue-600 dark:bg-yellow-500 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
            }`}
          >
            {notificationsEnabled ? 'Disable' : 'Enable'}
          </button>
        </div>
      </div>
    </motion.section>
  );
}