import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Wallet,
  LineChart,
  History,
  Settings,
  Users,
  BookOpen,
  Shield,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { useAuth } from '../../store/auth/useAuth';
import { adminRoutes } from '../../routes/adminRoutes';
import { sidebarRoutes } from '../../routes/sidebarRoutes';

export function Sidebar() {
  const { user, isAuthenticated } = useAuth();
  const isAdmin = user?.role === 'admin';
  const location = useLocation();
  const [isHovered, setIsHovered] = useState(false);

  const collapsedWidth = 68;
  const expandedWidth = 280;

  if (!isAuthenticated) {
    return null;
  }

  return (
    <motion.aside
      className="fixed top-20 left-4 bottom-4 bg-background-primary rounded-2xl shadow-lg z-30 flex flex-col overflow-hidden"
      initial={{ width: collapsedWidth }}
      animate={{ width: isHovered ? expandedWidth : collapsedWidth }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)" }}
    >
      {/* Menu */}
      <nav className="flex-1 overflow-y-auto mt-4 py-2 px-2">
        {[...sidebarRoutes].map(({ label, path, icon: Icon }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={`flex items-center relative ${isActive ? 'text-brand-primary' : 'text-text-secondary'} group h-14`}
            >
              <div className={`flex items-center justify-center min-w-[52px] h-12 rounded-xl my-1 group-hover:bg-background-secondary transition-all duration-200 
                ${isActive ? 'bg-brand-primary/10' : ''}`}>
                <Icon size={22} className={isActive ? 'text-brand-primary' : 'text-text-secondary group-hover:text-brand-primary'} />
              </div>
              <motion.div
                className="flex items-center overflow-hidden whitespace-nowrap"
                initial={{ opacity: 0, width: 0 }}
                animate={{ 
                  opacity: isHovered ? 1 : 0,
                  width: isHovered ? 'auto' : 0 
                }}
                transition={{ duration: 0.2 }}
              >
                <span className={`ml-3 font-medium ${isActive ? 'text-brand-primary' : 'text-text-secondary'}`}>
                  {label}
                </span>
              </motion.div>
              {isActive && (
                <motion.div 
                  className="absolute left-0 inset-y-0 w-1 bg-brand-primary rounded-r-full"
                  layoutId="activeIndicator"
                />
              )}
            </Link>
          );
        })}

        {isAdmin && (
          <>
            <div className="my-2 border-t border-border-primary mx-2"></div>
            
            {adminRoutes.map(({ label, path, icon: Icon }) => {
              const isActive = location.pathname === path;
              return (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center relative ${isActive ? 'text-purple-500' : 'text-text-secondary'} group h-14`}
                >
                  <div className={`flex items-center justify-center min-w-[52px] h-12 rounded-xl my-1 group-hover:bg-background-secondary transition-all duration-200 
                    ${isActive ? 'bg-purple-500/10' : ''}`}>
                    <Icon size={22} className={isActive ? 'text-purple-500' : 'text-text-secondary group-hover:text-purple-500'} />
                  </div>
                  <motion.div
                    className="flex items-center overflow-hidden whitespace-nowrap"
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ 
                      opacity: isHovered ? 1 : 0,
                      width: isHovered ? 'auto' : 0 
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    <span className={`ml-3 font-medium ${isActive ? 'text-purple-500' : 'text-text-secondary'}`}>
                      {label}
                    </span>
                  </motion.div>
                  {isActive && (
                    <motion.div 
                      className="absolute left-0 inset-y-0 w-1 bg-purple-500 rounded-r-full"
                      layoutId="activeIndicatorAdmin"
                    />
                  )}
                </Link>
              );
            })}
          </>
        )}
      </nav>
    </motion.aside>
  );
}
