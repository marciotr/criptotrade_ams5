import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Copy, Code, RefreshCcw, ExternalLink, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/auth/useAuth';
import { NotificationToast } from '../../components/common/NotificationToast'; // Ajuste o caminho

export function ApiDocsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [apiStatus, setApiStatus] = useState({
    userApi: 'checking',
    cryptoApi: 'checking'
  });
  const [copied, setCopied] = useState('');
  const [expanded, setExpanded] = useState({});
  const [refreshLoading, setRefreshLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  const apiEndpoints = {
    userApi: {
      base: 'http://localhost:5294',
      health: 'http://localhost:5294/health', 
      swagger: 'http://localhost:5294/index.html',
      spec: 'http://localhost:5294/swagger/v1/swagger.json',
      endpoints: [
        { name: 'Login', method: 'POST', path: '/api/auth/login' },
        { name: 'Register', method: 'POST', path: '/api/auth/register' },
        { name: 'Get User Profile', method: 'GET', path: '/api/user/{id}' },
        { name: 'Update User', method: 'PUT', path: '/api/user/{id}' }
      ]
    },
    cryptoApi: {
      base: 'http://localhost:5101',
      health: 'http://localhost:5101/health', 
      swagger: 'http://localhost:5101/index.html',
      spec: 'http://localhost:5101/swagger/v1/swagger.json',
      endpoints: [
        { name: 'Get All Prices', method: 'GET', path: '/api/crypto/prices' },
        { name: 'Get Price', method: 'GET', path: '/api/crypto/price/{symbol}' },
        { name: '24h Market Data', method: 'GET', path: '/api/crypto/ticker/{symbol}' },
        { name: 'Historical Data', method: 'GET', path: '/api/crypto/history/{symbol}' }
      ]
    }
  };

  useEffect(() => {
    checkApiStatus();
    const interval = setInterval(checkApiStatus, 30000); 
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const checkApiStatus = async () => {
    // Verificando User API
    try {
      const userResponse = await fetch(apiEndpoints.userApi.base, { 
        method: 'HEAD',
        mode: 'no-cors' 
      });
      setApiStatus(prev => ({ ...prev, userApi: 'online' }));
    } catch (error) {
      setApiStatus(prev => ({ ...prev, userApi: 'offline' }));
    }

    // Verificando Crypto API
    try {
      const cryptoResponse = await fetch(apiEndpoints.cryptoApi.base, { 
        method: 'HEAD',
        mode: 'no-cors' 
      });
      setApiStatus(prev => ({ ...prev, cryptoApi: 'online' }));
    } catch (error) {
      setApiStatus(prev => ({ ...prev, cryptoApi: 'offline' }));
    }
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(''), 2000);
  };

  const toggleExpanded = (section) => {
    setExpanded(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const refreshApiData = async () => {
    try {
      setRefreshLoading(true);
      await checkApiStatus(); // Use a função existente em vez de fetchApiEndpoints
    } catch (error) {
      console.error('Error refreshing API data:', error);
      showNotification('error', 'Failed to refresh API documentation');
    } finally {
      setTimeout(() => {
        setRefreshLoading(false);
      }, 500); // Adicione um pequeno atraso para garantir que a animação seja visível
    }
  };

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 pt-20">
      <AnimatePresence>
        {notification && (
          <div className="fixed top-4 right-4 z-50">
            <NotificationToast
              type={notification.type}
              message={notification.message}
              onClose={() => setNotification(null)}
            />
          </div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-text-primary mb-4">API Functionality</h1>
          <button 
            onClick={refreshApiData}
            disabled={refreshLoading}
            className="p-2 rounded-full hover:bg-background-secondary transition-colors"
            title="Refresh API Documentation"
          >
            <RefreshCcw 
              className={`h-5 w-5 text-text-secondary transition-transform ${
                refreshLoading ? 'animate-spin' : ''
              }`} 
            />
          </button>
        </div>
        <p className="text-text-secondary">
          Explore the APIs that power CriptoTrade. These interfaces allow you to interact 
          with user data and cryptocurrency information programmatically.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-background-primary p-6 rounded-xl shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-text-primary">User API</h2>
            {apiStatus.userApi === 'online' ? (
              <CheckCircle className="w-6 h-6 text-green-500" />
            ) : apiStatus.userApi === 'offline' ? (
              <XCircle className="w-6 h-6 text-red-500" />
            ) : (
              <RefreshCcw className="w-6 h-6 text-yellow-500 animate-spin" />
            )}
          </div>
          <p className="text-text-secondary mb-4">
            Manage users, authentication, profiles, and account settings through this API.
            Complete CRUD operations for user data.
          </p>
          <div className="flex space-x-4 mb-4">
            <a 
              href={apiEndpoints.userApi.swagger} 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-4 py-2 bg-brand-primary text-background-primary rounded-lg hover:opacity-90 transition-colors"
            >
              Swagger UI
            </a>
            <a 
              href={apiEndpoints.userApi.spec} 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-4 py-2 border border-border-primary text-text-primary rounded-lg hover:bg-background-secondary transition-colors"
            >
              OpenAPI Spec
            </a>
          </div>
          <div>
            {apiEndpoints.userApi.endpoints.map((endpoint, index) => (
              <div key={index} className="mb-2">
                <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleExpanded(`userApi-${index}`)}>
                  <div className="flex items-center space-x-2">
                    <Code className="w-5 h-5 text-text-primary" />
                    <span className="text-text-primary">{endpoint.name}</span>
                  </div>
                  <ChevronRight className={`w-5 h-5 text-text-primary transform ${expanded[`userApi-${index}`] ? 'rotate-90' : ''}`} />
                </div>
                {expanded[`userApi-${index}`] && (
                  <div className="ml-7 mt-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-text-secondary">{endpoint.method}</span>
                      <span className="text-text-secondary">{endpoint.path}</span>
                      <button onClick={() => copyToClipboard(endpoint.path, `userApi-${index}`)} className="text-brand-primary hover:opacity-80 transition-opacity">
                        <Copy className="w-4 h-4" />
                      </button>
                      {copied === `userApi-${index}` && <CheckCircle className="w-4 h-4 text-green-500" />}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-background-primary p-6 rounded-xl shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-text-primary">Crypto API</h2>
            {apiStatus.cryptoApi === 'online' ? (
              <CheckCircle className="w-6 h-6 text-green-500" />
            ) : apiStatus.cryptoApi === 'offline' ? (
              <XCircle className="w-6 h-6 text-red-500" />
            ) : (
              <RefreshCcw className="w-6 h-6 text-yellow-500 animate-spin" />
            )}
          </div>
          <p className="text-text-secondary mb-4">
            Access real-time cryptocurrency data, historical prices, market information,
            and trading pairs through this API.
          </p>
          <div className="flex space-x-4 mb-4">
            <a 
              href={apiEndpoints.cryptoApi.swagger} 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-4 py-2 bg-brand-primary text-background-primary rounded-lg hover:opacity-90 transition-colors"
            >
              Swagger UI
            </a>
            <a 
              href={apiEndpoints.cryptoApi.spec} 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-4 py-2 border border-border-primary text-text-primary rounded-lg hover:bg-background-secondary transition-colors"
            >
              OpenAPI Spec
            </a>
          </div>
          <div>
            {apiEndpoints.cryptoApi.endpoints.map((endpoint, index) => (
              <div key={index} className="mb-2">
                <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleExpanded(`cryptoApi-${index}`)}>
                  <div className="flex items-center space-x-2">
                    <Code className="w-5 h-5 text-text-primary" />
                    <span className="text-text-primary">{endpoint.name}</span>
                  </div>
                  <ChevronRight className={`w-5 h-5 text-text-primary transform ${expanded[`cryptoApi-${index}`] ? 'rotate-90' : ''}`} />
                </div>
                {expanded[`cryptoApi-${index}`] && (
                  <div className="ml-7 mt-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-text-secondary">{endpoint.method}</span>
                      <span className="text-text-secondary">{endpoint.path}</span>
                      <button onClick={() => copyToClipboard(endpoint.path, `cryptoApi-${index}`)} className="text-brand-primary hover:opacity-80 transition-opacity">
                        <Copy className="w-4 h-4" />
                      </button>
                      {copied === `cryptoApi-${index}` && <CheckCircle className="w-4 h-4 text-green-500" />}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}