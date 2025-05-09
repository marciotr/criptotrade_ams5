import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../store/auth/AuthContext';
import { walletApi } from '../../services/api/api';
import { useNotification } from '../../context/NotificationContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertCircle, Plus } from 'lucide-react';
import CryptoIcon from '../../components/common/CryptoIcons';

export function Wallet() {
  const { user } = useContext(AuthContext);
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  const [cryptoWallets, setCryptoWallets] = useState([]);
  const [fiatWallets, setFiatWallets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    const fetchWallets = async () => {
      setLoading(true);
      try {
        const [cw, fw] = await Promise.all([
          walletApi.getUserWallets(user.id),
          walletApi.getUserFiatWallets(user.id)
        ]);
        setCryptoWallets(cw.data);
        setFiatWallets(fw.data);
      } catch (err) {
        showNotification({ message: 'Failed to load wallets', type: 'error' });
      } finally {
        setLoading(false);
      }
    };
    fetchWallets();
  }, [user]);

  const handleAddFiat = () => navigate('/deposit/fiat');

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <h1 className="text-2xl font-bold text-text-primary">My Wallet</h1>

      <div className="p-4 bg-background-secondary rounded-lg border border-border-primary shadow-md">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-text-primary">Crypto Wallets</h2>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {}}
            className="text-sm text-brand-primary hover:text-brand-primary-dark"
          >
            Refresh
          </motion.button>
        </div>
        {loading ? (
          <div className="text-text-secondary">Loading…</div>
        ) : cryptoWallets.length > 0 ? (
          cryptoWallets.map(w => (
            <div key={w.id} className="flex items-center justify-between py-2">
              <div className="flex items-center">
                <CryptoIcon symbol={w.currency} size={20} className="mr-2" />
                <span className="text-text-primary">{w.currency}</span>
              </div>
              <span className="text-text-primary">{w.balance} {w.currency}</span>
            </div>
          ))
        ) : (
          <div className="flex items-center p-3 bg-amber-50 border border-amber-200 rounded">
            <AlertCircle className="text-amber-500 mr-2" />
            <span className="text-amber-700">No crypto wallets found</span>
          </div>
        )}
      </div>

      <div className="p-4 bg-background-secondary rounded-lg border border-border-primary shadow-md">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-text-primary">Fiat Wallets</h2>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAddFiat}
            className="flex items-center text-sm text-brand-primary hover:text-brand-primary-dark"
          >
            <Plus size={16} className="mr-1" /> Add Funds
          </motion.button>
        </div>
        {loading ? (
          <div className="text-text-secondary">Loading…</div>
        ) : fiatWallets.length > 0 ? (
          fiatWallets.map(w => (
            <div key={w.id} className="flex items-center justify-between py-2">
              <span className="text-text-secondary">{w.currency}</span>
              <span className="text-text-primary">
                {w.currency === 'USD' ? '$' : w.currency === 'EUR' ? '€' : ''}
                {w.balance.toFixed(2)}
              </span>
            </div>
          ))
        ) : (
          <div className="flex items-center p-3 bg-amber-50 border border-amber-200 rounded">
            <AlertCircle className="text-amber-500 mr-2" />
            <span className="text-amber-700">No fiat wallets yet</span>
          </div>
        )}
      </div>
    </div>
  );
}   