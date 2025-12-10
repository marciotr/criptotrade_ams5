// src/pages/currency/Currency.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coins, Plus, RefreshCcw, Search, Loader, Edit2, Trash2 } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { currencyApi, marketApi } from '../../services/api/api';
import CryptoIcon from '../../components/common/CryptoIcons';
import { NotificationToast } from '../../components/common/NotificationToast';
import { CoinSelector } from '../dashboard/components/CoinSelector';
import { AddCurrencyModal } from './components/modals/AddCurrencyModal';
import { EditCurrencyModal } from './components/modals/EditCurrencyModal';
import { DeleteCurrencyModal } from './components/modals/DeleteCurrencyModal';
import { ImportCurrencyModal } from './components/modals/ImportCurrencyModal';

export function Currency() {
  const { theme } = useTheme();
  const [currencies, setCurrencies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshLoading, setRefreshLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [isAddOpen, setAddOpen] = useState(false);
  const [isEditOpen, setEditOpen] = useState(false);
  const [isDeleteOpen, setDeleteOpen] = useState(false);
  const [isImportOpen, setImportOpen] = useState(false);

  const [cryptos, setCryptos] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState(null);
  const [importCoin, setImportCoin] = useState(null);
  const [formData, setFormData] = useState({ symbol: '', name: '', backing: '', status: 'active' });
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchCurrencies();
    loadAvailableCryptos();
  }, []);

  const notify = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const fetchCurrencies = async () => {
    try {
      setLoading(true);
      setRefreshLoading(true);
      const { data } = await currencyApi.getAllCurrencies();
      setCurrencies(data);
      setError(null);
    } catch {
      setError('Failed to fetch currencies');
      notify('error', 'Failed to fetch currencies');
    } finally {
      setLoading(false);
      setRefreshLoading(false);
    }
  };

  const loadAvailableCryptos = async () => {
    try {
      const { data } = await marketApi.getAllTickers();
      setCryptos(
        data
          .filter(t => t.symbol.endsWith('USDT'))
          .map(t => ({
            id: t.symbol.replace('USDT', ''),
            name: t.symbol.replace('USDT', ''),
            symbol: t.symbol.replace('USDT', ''),
            backing: 'USDT'
          }))
      );
    } catch {}
  };

  const filtered = currencies.filter(c =>
    c.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openAdd = () => {
    setFormData({ symbol: '', name: '', backing: '', status: 'active' });
    setAddOpen(true);
  };
  const handleAdd = async e => {
    e.preventDefault();
    setActionLoading(true);
    await currencyApi.createCurrency(formData);
    notify('success', 'Currency created');
    setAddOpen(false);
    fetchCurrencies();
    setActionLoading(false);
  };

  const openEdit = currency => {
    setSelectedCurrency(currency);
    setFormData(currency);
    setEditOpen(true);
  };
  const handleEdit = async e => {
    e.preventDefault();
    setActionLoading(true);
    await currencyApi.updateCurrency(selectedCurrency.id, formData);
    notify('success', 'Currency updated');
    setEditOpen(false);
    fetchCurrencies();
    setActionLoading(false);
  };

  const openDelete = currency => {
    setSelectedCurrency(currency);
    setDeleteOpen(true);
  };
  const handleDelete = async () => {
    setActionLoading(true);
    await currencyApi.deleteCurrency(selectedCurrency.id);
    notify('success', 'Currency deleted');
    setDeleteOpen(false);
    fetchCurrencies();
    setActionLoading(false);
  };

  const handleImport = coin => {
    setImportCoin(coin);
    setImportOpen(true);
  };
  const confirmImport = async () => {
    setActionLoading(true);
    await currencyApi.createCurrency({
      symbol: importCoin.symbol,
      name: importCoin.name,
      backing: importCoin.backing,
      status: 'active'
    });
    notify('success', 'Currency imported');
    setImportOpen(false);
    fetchCurrencies();
    setActionLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background-primary p-6">
      <div className="w-full max-w-4xl space-y-8">
        <AnimatePresence>
          {notification && (
            <NotificationToast
              type={notification.type}
              message={notification.message}
              onClose={() => setNotification(null)}
            />
          )}
        </AnimatePresence>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col md:flex-row items-center justify-between gap-4"
        >
          <h1 className="text-3xl font-extrabold flex items-center gap-2 text-text-primary">
            <Coins className="text-brand-primary h-8 w-8" /> Currency Management
          </h1>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchCurrencies}
              disabled={refreshLoading}
              className="p-2 rounded-full hover:bg-background-secondary transition"
            >
              <RefreshCcw
                className={
                  refreshLoading
                    ? 'h-6 w-6 text-brand-primary animate-spin'
                    : 'h-6 w-6 text-text-secondary'
                }
              />
            </button>
            <button
              onClick={openAdd}
              className="flex items-center gap-2 bg-brand-primary hover:bg-brand-primary-dark text-background-primary px-5 py-2 rounded-2xl shadow-md transition"
            >
              <Plus className="h-5 w-5" /> Add Currency
            </button>
          </div>
        </motion.div>

        {error && (
          <div className="p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>
        )}

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-background-primary border border-border-primary rounded-2xl shadow-lg p-6"
        >
          <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
            <h2 className="text-xl font-semibold flex items-center gap-2 text-text-primary">
              <Coins className="h-5 w-5 text-brand-primary" /> All Currencies
              <span className="text-text-tertiary">({filtered.length})</span>
            </h2>
            <div className="relative w-full md:w-64">
              <Search className="absolute inset-y-0 left-3 text-text-tertiary m-auto" />
              <input
                type="text"
                placeholder="Search currencies..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 p-2 border border-border-primary rounded-full bg-background-secondary text-text-primary focus:ring-2 focus:ring-brand-primary transition"
              />
            </div>
            <CoinSelector
              selectedCoin={null}
              coins={cryptos}
              isOpen={dropdownOpen}
              onToggle={() => setDropdownOpen(!dropdownOpen)}
              onSelect={handleImport}
              align="right"
            />
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <Loader className="h-10 w-10 text-brand-primary animate-spin" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border-primary text-text-primary">
                <thead className="bg-background-secondary">
                  <tr>
                    {['ID','Symbol','Name','Backing','Status','Actions'].map(h => (
                      <th
                        key={h}
                        className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-background-primary divide-y divide-border-primary">
                  {filtered.map(c => (
                    <motion.tr
                      key={c.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="hover:bg-background-secondary"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-text-primary">{c.id}</td>
                      <td className="px-6 py-4 text-sm flex items-center space-x-2">
                        <CryptoIcon symbol={c.symbol} size={20} />
                        <span>{c.symbol}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-text-tertiary">{c.name}</td>
                      <td className="px-6 py-4 text-sm text-text-tertiary">{c.backing}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          c.status === 'active'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 flex space-x-2">
                        <button onClick={() => openEdit(c)} className="p-2 rounded-full hover:bg-background-secondary transition">
                          <Edit2 size={16} className="text-text-tertiary" />
                        </button>
                        <button onClick={() => openDelete(c)} className="p-2 rounded-full hover:bg-red-100 transition">
                          <Trash2 size={16} className="text-red-500" />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-16 text-center text-text-tertiary">
                        No currencies found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        <AddCurrencyModal
          isOpen={isAddOpen}
          onClose={() => setAddOpen(false)}
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleAdd}
          loading={actionLoading}
        />
        <EditCurrencyModal
          isOpen={isEditOpen}
          onClose={() => setEditOpen(false)}
          currency={selectedCurrency}
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleEdit}
          loading={actionLoading}
        />
        <DeleteCurrencyModal
          isOpen={isDeleteOpen}
          onClose={() => setDeleteOpen(false)}
          onConfirm={handleDelete}
          loading={actionLoading}
          currency={selectedCurrency}
        />
        <ImportCurrencyModal
          isOpen={isImportOpen}
          onClose={() => setImportOpen(false)}
          coin={importCoin}
          onConfirm={confirmImport}
          loading={actionLoading}
        />
      </div>
    </div>
  );
}

export default Currency;
