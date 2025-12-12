import React, { createContext, useContext, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { NotificationToast } from '../components/common/NotificationToast';

const NotificationContext = createContext({});

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  const showNotification = (arg1, arg2 = 'success') => {
    let message;
    let type;

    if (typeof arg1 === 'object' && arg1 !== null) {
      message = arg1.message ?? '';
      type = arg1.type ?? arg2 ?? 'success';
    } else if (typeof arg1 === 'string' && typeof arg2 === 'string') {
      const possibleType = arg1.toLowerCase();
      const knownTypes = ['success', 'error', 'info', 'warning'];
      if (knownTypes.includes(possibleType) && arg2 && !knownTypes.includes(arg2.toLowerCase())) {
        type = possibleType;
        message = arg2;
      } else {
        message = arg1;
        type = arg2 || 'success';
      }
    } else {
      message = String(arg1 ?? '');
      type = arg2 || 'success';
    }

    const id = Math.random().toString(36).substring(7);
    setNotifications((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setNotifications((prev) => prev.filter((notification) => notification.id !== id));
    }, 3000);
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        <AnimatePresence>
          {notifications.map((notification) => (
            <NotificationToast
              key={notification.id}
              message={notification.message}
              type={notification.type}
              onClose={() => setNotifications((prev) => 
                prev.filter((n) => n.id !== notification.id)
              )}
            />
          ))}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
}

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};