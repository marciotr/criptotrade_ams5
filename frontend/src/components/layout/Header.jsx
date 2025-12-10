import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Sun, Moon, User, LogOut, Plus, Bell, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../store/auth/useAuth';
import logoBranca from '../../assets/img/logoBinanceRemoved.png';
import logoPreta from '../../assets/img/logoBinanceRemoved.png';

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const { showNotification } = useNotification();
  const { logout, user } = useAuth(); 
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Detectar scroll pra mudar a aparência do header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleDropdownToggle = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLogout = () => {
    logout(); 
    showNotification('You have been successfully logged out', 'success');
    setIsDropdownOpen(false); 
  };

  const handleDeposit = () => {
    navigate('/deposit');
  };

  const isHome = location.pathname === '/dashboard' || location.pathname === '/';

  // Gerar os breadcrumbs
  const generateBreadcrumbs = () => {
    const pathSegments = location.pathname.split('/').filter(segment => segment);
    
    return pathSegments.map((segment, index) => {
      // Construir o caminho pro breadcrumb
      const path = `/${pathSegments.slice(0, index + 1).join('/')}`;
      const isLast = index === pathSegments.length - 1;
      
      return (
        <React.Fragment key={path}>
          {index > 0 && <span className="mx-1 text-text-tertiary">/</span>}
          <Link 
            to={path} 
            className={`capitalize transition-colors hover:text-brand-primary ${
              isLast ? 'text-brand-primary font-medium' : 'text-text-secondary'
            }`}
          >
            {segment}
          </Link>
        </React.Fragment>
      );
    });
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled 
          ? 'bg-background-primary/95 backdrop-blur-md shadow-md' 
          : 'bg-background-primary'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-18">
          {/* Logo Section - Nova */}
          <div className="flex items-center">
            <Link 
              to={user ? "/dashboard" : "/signin"} 
              className="flex items-center group"
            >
              <div className="relative overflow-hidden rounded-xl p-2 mr-2">
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-r from-brand-primary/20 to-purple-500/20 rounded-xl"
                  animate={{ 
                    rotate: [0, 360],
                  }}
                  transition={{ 
                    duration: 8,
                    repeat: Infinity,
                    ease: "linear" 
                  }}
                />
                <img
                  src={theme === 'light' ? logoBranca : logoPreta}
                  alt="Logo"
                  className="h-8 sm:h-10 relative z-10 transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-text-primary">
                  Crypto
                  <span className="text-brand-primary">Trade</span>
                </h1>
                <p className="text-xs text-text-tertiary -mt-1">
                  Advanced Trading Platform
                </p>
              </div>
            </Link>
          </div>
          
          {/* Middle Section - Mostrar o path*/}
          {!isHome && user && (
            <div className="hidden md:flex">
              <div className="text-sm font-medium text-text-secondary px-4 py-1 rounded-full bg-background-secondary">
                {generateBreadcrumbs()}
              </div>
            </div>
          )}
          
          {/* Right Side Actions - Com o novo design */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {user && (
              <Link
                to="/deposit"
                className="flex items-center justify-center h-9 px-3 sm:px-4
                           bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 
                           transition-all shadow-sm hover:shadow-md"
              >
                <Plus size={16} className="sm:mr-1" />
                <span className="hidden sm:inline">Deposit</span>
              </Link>
            )}
            
            <button
              onClick={toggleTheme}
              className="flex justify-center items-center h-9 w-9 rounded-full 
                       border border-border-primary bg-background-secondary hover:bg-background-secondary/80
                       text-text-secondary transition-all"
              aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            >
              {theme === 'light' ? 
                <Moon size={18} /> : 
                <Sun size={18} />
              }
            </button>
            
            {user && (
              <>
                <button
                  className="flex justify-center items-center h-9 w-9 rounded-full 
                           border border-border-primary bg-background-secondary hover:bg-background-secondary/80
                           text-text-secondary transition-all relative"
                  aria-label="Notifications"
                >
                  <Bell size={18} />
                  <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
                </button>
                
                <div className="relative">
                  <button
                    onClick={handleDropdownToggle}
                    className="flex items-center space-x-1 p-1 rounded-lg hover:bg-background-secondary/50 transition-colors"
                  >
                    <div className="relative">
                      <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-brand-primary/30 shadow-sm">
                        <img
                          src={user.photo || 'https://via.placeholder.com/40'}
                          alt="User Avatar"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/40';
                          }}
                        />
                      </div>
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background-primary"></div>
                    </div>
                    <div className="hidden md:block">
                      <span className="text-sm font-medium text-text-primary block leading-tight">
                        {user?.name?.split(' ')[0] || 'User'}
                      </span>
                      <span className="text-xs text-text-tertiary block leading-tight">
                        {user?.role === 'admin' ? 'Administrator' : 'User'}
                      </span>
                    </div>
                    <ChevronDown size={16} className="hidden sm:block text-text-tertiary ml-1" />
                  </button>

                  <AnimatePresence>
                    {isDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-64 bg-background-primary rounded-xl shadow-lg py-3 border border-border-primary overflow-hidden"
                      >
                        {/* Conteúdo do dropdown */}
                        <div className="px-4 py-3 border-b border-border-primary">
                          <div className="flex items-center space-x-3">
                            <img
                              src={user.photo || 'https://via.placeholder.com/40'}
                              alt="User Avatar"
                              className="w-12 h-12 rounded-lg object-cover shadow-sm"
                            />
                            <div>
                              <p className="text-text-primary font-medium">
                                {user?.name || 'User'}
                              </p>
                              <p className="text-text-tertiary text-sm truncate">
                                {user?.email}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="px-2 py-2">
                          <Link to="/settings/profile" 
                                className="flex items-center px-3 py-2 rounded-lg text-text-secondary hover:bg-background-secondary transition-colors">
                            <User size={18} className="mr-3 text-brand-primary opacity-80" />
                            My Profile
                          </Link>
                          
                          <button
                            onClick={toggleTheme}
                            className="w-full flex items-center px-3 py-2 rounded-lg text-text-secondary hover:bg-background-secondary transition-colors"
                          >
                            {theme === 'light' ? 
                              <Moon size={18} className="mr-3 text-blue-400 opacity-80" /> : 
                              <Sun size={18} className="mr-3 text-yellow-400 opacity-80" />
                            }
                            {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
                          </button>
                          
                          <button
                            className="w-full flex items-center px-3 py-2 rounded-lg text-text-secondary hover:bg-background-secondary transition-colors mt-2"
                            onClick={handleLogout}
                          >
                            <LogOut size={18} className="mr-3 text-red-400 opacity-80" />
                            Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}