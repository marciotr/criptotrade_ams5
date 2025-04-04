import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sun, Moon, Menu, User, LogOut, Plus, CreditCard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../store/auth/useAuth';
import logoBranca from '../../assets/img/logoBinanceRemoved.png';
import logoPreta from '../../assets/img/logoBinanceRemoved.png';

export function Header({ onSidebarOpen }) {
  const { theme, toggleTheme } = useTheme();
  const { showNotification } = useNotification();
  const { logout, user } = useAuth(); 
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleDropdownToggle = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLogout = () => {
    logout(); 
    showNotification('You have been successfully logged out', 'success');
    setIsDropdownOpen(false); 
  };

  return (
    <nav className="bg-background-primary shadow-lg fixed top-0 left-0 right-0 z-20">
      <div className="px-2 sm:px-6">
        <div className="flex justify-between h-14 sm:h-16">
          <div className="flex items-center">
            {user && (
              <button
                onClick={onSidebarOpen}
                className="p-1.5 sm:p-2 rounded-lg hover:bg-background-secondary"
              >
                <Menu size={20} className="text-text-secondary sm:w-6 sm:h-6" />
              </button>
            )}
            <Link to={user ? "/dashboard" : "/signin"} className="flex items-center ml-2 sm:ml-4">
              <img
                src={theme === 'light' ? logoBranca : logoPreta}
                alt="Logo"
                className="h-10 sm:h-14" // Changed from h-8 sm:h-12 to h-10 sm:h-14
              />
            </Link>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-4">
            {user && (
              <Link 
                to="/deposit"
                className="flex items-center justify-center min-w-[32px] h-8 sm:h-10 px-2 sm:px-4 bg-brand-primary text-background-primary rounded-lg hover:opacity-90 transition-colors"
              >
                <Plus size={16} className="sm:w-[18px] sm:h-[18px]" />
                <span className="hidden sm:inline ml-1">Deposit</span>
              </Link>
            )}
            

            <button
              onClick={toggleTheme}
              className="flex p-2 rounded-lg hover:bg-background-secondary"
            >
              {theme === 'light' ? 
                <Moon size={24} className="text-text-secondary" /> : 
                <Sun size={24} className="text-text-secondary" />
              }
            </button>

            {user && (
              <div className="relative">
                <button
                  onClick={handleDropdownToggle}
                  className="flex items-center space-x-2 p-1 sm:p-2 rounded-lg hover:bg-background-secondary"
                >
                  <img
                    src={user.photo}
                    alt="User Avatar"
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover"
                  />
                  <span className="hidden sm:inline text-text-secondary">
                    {user?.name || user?.email || 'User'} 
                  </span>
                </button>

                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-48 bg-background-primary rounded-lg shadow-lg py-2"
                    >

                      <div className="px-4 py-2 border-b border-border-primary">
                        <p className="text-text-primary font-medium truncate">
                          {user?.name || 'User'}
                        </p>
                        <p className="text-text-tertiary text-sm truncate">
                          {user?.email}
                        </p>
                      </div>

                      <button
                        onClick={toggleTheme}
                        className="sm:hidden flex w-full items-center px-4 py-2 text-text-secondary hover:bg-background-secondary"
                      >
                        {theme === 'light' ? 
                          <Moon size={16} className="mr-2" /> : 
                          <Sun size={16} className="mr-2" />
                        }
                        {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
                      </button>
                      
                      <Link to="/settings/profile" className="flex items-center px-4 py-2 text-text-secondary hover:bg-background-secondary">
                        <User size={16} className="mr-2" />
                        Profile
                      </Link>
                      
                      <button
                        className="flex items-center w-full px-4 py-2 text-text-secondary hover:bg-background-secondary"
                        onClick={handleLogout}
                      >
                        <LogOut size={16} className="mr-2" />
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}