import React, { useState, useEffect } from 'react';
import { marketApi } from '../../services/api/api';
import { AnimatePresence, motion } from 'framer-motion';
import CryptoIcon from '../../components/common/CryptoIcons';
import { Search, Plus, Edit2, Trash2, AlertCircle } from 'lucide-react'; // <-- importe AlertCircle
import { CoinSelector } from '../../components/dashboard/CoinSelector';
import { ImportCryptoModal } from '../../components/common/ImportCryptoModal';
import { Modal } from '../../components/common/Modal';

export function Currency() {
  const initialCurrencies = [
    { id: 1, name: 'BTC', description: 'Bitcoin', backing: 'Network', status: 'active' },
    { id: 2, name: 'ETH', description: 'Ethereum', backing: 'Network', status: 'inactive' },
  ];

  const [currencies, setCurrencies] = useState(initialCurrencies);
  const [searchTerm, setSearchTerm] = useState('');
  const [cryptos, setCryptos] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedCrypto, setSelectedCrypto] = useState({ id: '', name: '', color: '#F7931A', data: [] });
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importCoin, setImportCoin] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [currencyToEdit, setCurrencyToEdit] = useState(null);
  const [currencyToDelete, setCurrencyToDelete] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', backing: '', status: '' });

  // fetch cryptos
  useEffect(() => {
    const loadCryptos = async () => {
      try {
        const resp = await marketApi.getAllTickers();
        const list = resp.data
          .filter(t => t.symbol.endsWith('USDT'))
          .map(t => ({
            id: t.symbol,
            name: t.symbol.replace('USDT', ''),
            color: '#F7931A',
            data: []
          }));
        setCryptos(list);
      } catch (err) {
        console.error(err);
      }
    };
    loadCryptos();
  }, []);

  const filteredCurrencies = currencies.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = () => {
    setFormData({ name: '', description: '', backing: '', status: 'active' });
    setIsAddModalOpen(true);
  };

  const handleEdit = id => {
    const cur = currencies.find(c => c.id === id);
    setCurrencyToEdit(cur);
    setFormData(cur);
    setIsEditModalOpen(true);
  };
  const handleDelete = id => {
    const cur = currencies.find(c => c.id === id);
    setCurrencyToDelete(cur);
    setIsDeleteModalOpen(true);
  };
  const handleImportSelect = coin => {
    setImportCoin(coin);
    setImportModalOpen(true);
  };

  const handleConfirmImport = coin => {
    setCurrencies(prev => [
      ...prev,
      {
        id: prev.length + 1,
        name: coin.name,
        description: coin.name,
        backing: 'Network',
        status: 'active'
      }
    ]);
  };

  const saveEdit = () => {
    setCurrencies(prev =>
      prev.map(c => c.id === currencyToEdit.id ? { ...c, ...formData } : c)
    );
    setIsEditModalOpen(false);
  };
  const confirmDelete = () => {
    setCurrencies(prev => prev.filter(c => c.id !== currencyToDelete.id));
    setIsDeleteModalOpen(false);
  };

  const handleCreateCurrency = (e) => {
    e.preventDefault();
    setCurrencies(prev => [
      ...prev,
      {
        id: prev.length + 1,
        name: formData.name,
        description: formData.description,
        backing: formData.backing,
        status: formData.status
      }
    ]);
    setIsAddModalOpen(false);
  };

  return (
    <div className="relative p-4 lg:p-6 space-y-6">
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6"
      >
        <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
          <CryptoIcon symbol="USD" size={24} className="text-brand-primary" />
          Currency Management
        </h1>
        <button
          onClick={handleAdd}
          className="flex items-center space-x-2 px-4 py-2 bg-brand-primary hover:bg-brand-secondary text-white rounded-md transition-colors duration-200 shadow-sm"
        >
          <Plus className="h-4 w-4" />
          <span>Add Currency</span>
        </button>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="p-4 lg:p-6 rounded-xl bg-background-primary border border-border-primary shadow-lg"
      >
        <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
          <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
          <CryptoIcon symbol="USD" size={24} className="text-brand-primary" />All Currencies
            <span className="ml-2 text-sm font-normal text-text-tertiary">
              ({filteredCurrencies.length})
            </span>
          </h2>
          <div className="flex flex-wrap items-center gap-4">
            {/* Barra de pesquisa do currency */}
            <div className="relative w-full md:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-text-secondary" />
              </div>
              <input
                type="text"
                placeholder="Search currencies..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border-primary rounded-md bg-background-secondary text-text-primary focus:ring-2 focus:ring-brand-primary"
              />
            </div>

            {/* Dropdown de selecionar moedas */}
            <CoinSelector
              selectedCoin={selectedCrypto}
              coins={cryptos}
              isOpen={dropdownOpen}
              onToggle={() => setDropdownOpen(o => !o)}
              onSelect={handleImportSelect}
              price={null}
              align="right"   
            />
          </div>
        </div>

        {/* table */}
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-border-primary scrollbar-track-background-secondary rounded-md">
          <table className="min-w-full bg-background-primary border border-border-primary rounded-md text-text-primary">
            <thead className="bg-background-secondary">
              <tr className="text-left">
                <th className="px-4 py-2 border-b border-border-primary text-text-secondary">ID</th>
                <th className="px-4 py-2 border-b border-border-primary text-text-secondary">Name</th>
                <th className="px-4 py-2 border-b border-border-primary text-text-secondary">Description</th>
                <th className="px-4 py-2 border-b border-border-primary text-text-secondary">Backing</th>
                <th className="px-4 py-2 border-b border-border-primary text-text-secondary">Status</th>
                <th className="px-4 py-2 border-b border-border-primary text-text-secondary">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-primary">
              {filteredCurrencies.map(c => (
                <tr key={c.id} className="hover:bg-background-secondary">
                  <td className="px-4 py-2 text-text-primary">{c.id}</td>
                  <td className="px-4 py-2 text-text-primary">{c.name}</td>
                  <td className="px-4 py-2 text-text-primary">{c.description}</td>
                  <td className="px-4 py-2 text-text-primary">{c.backing}</td>
                  <td className="px-4 py-2 capitalize text-text-primary">{c.status}</td>
                  <td className="px-4 py-2 space-x-2">
                    <button onClick={() => handleEdit(c.id)} className="text-text-secondary hover:text-brand-primary">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(c.id)} className="text-text-secondary hover:text-red-500">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredCurrencies.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-4 py-6 text-center text-text-secondary">
                    No currencies found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      <AnimatePresence>
        {importModalOpen && (
          <ImportCryptoModal
            coin={importCoin}
            onClose={() => setImportModalOpen(false)}
            onConfirm={handleConfirmImport}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isEditModalOpen && currencyToEdit && (
          <Modal onClose={() => setIsEditModalOpen(false)} width="max-w-md">
            <h2 className="text-lg font-semibold mb-4 text-text-primary">
              Edit Status for {currencyToEdit.name}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-text-secondary mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={e =>
                    setFormData(f => ({ ...f, status: e.target.value }))
                  }
                  className="w-full p-2 border border-border-primary rounded-md bg-background-secondary text-text-primary focus:ring-2 focus:ring-brand-primary"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 border border-border-primary text-text-primary hover:bg-background-secondary rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={saveEdit}
                  className="px-4 py-2 bg-brand-primary hover:bg-brand-secondary text-white rounded-md"
                >
                  Save
                </button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isDeleteModalOpen && currencyToDelete && (
          <Modal onClose={() => setIsDeleteModalOpen(false)} width="max-w-sm">
            <div className="text-center">
              <div className="bg-red-100 p-3 rounded-full inline-flex items-center justify-center mb-4">
                <AlertCircle className="h-10 w-10 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">Delete Currency</h3>
              <p className="text-sm text-text-secondary">
                Are you sure you want to delete <strong>{currencyToDelete.name}</strong>?
              </p>
              <div className="flex justify-center space-x-2 mt-4">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-4 py-2 border border-border-primary text-text-primary hover:bg-background-secondary rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isAddModalOpen && (
          <Modal onClose={() => setIsAddModalOpen(false)} width="max-w-md">
            <h2 className="text-lg font-semibold mb-4 text-text-primary">Add Currency</h2>
            <form onSubmit={handleCreateCurrency} className="space-y-4">
              <div>
                <label className="block text-sm text-text-secondary mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
                  className="w-full p-2 border border-border-primary rounded-md bg-background-secondary text-text-primary focus:ring-2 focus:ring-brand-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-1">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={e => setFormData(f => ({ ...f, description: e.target.value }))}
                  className="w-full p-2 border border-border-primary rounded-md bg-background-secondary text-text-primary focus:ring-2 focus:ring-brand-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-1">Backing</label>
                <input
                  type="text"
                  value={formData.backing}
                  onChange={e => setFormData(f => ({ ...f, backing: e.target.value }))}
                  className="w-full p-2 border border-border-primary rounded-md bg-background-secondary text-text-primary focus:ring-2 focus:ring-brand-primary"
                />
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={e => setFormData(f => ({ ...f, status: e.target.value }))}
                  className="w-full p-2 border border-border-primary rounded-md bg-background-secondary text-text-primary focus:ring-2 focus:ring-brand-primary"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="flex justify-end space-x-2 mt-4">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-border-primary text-text-primary hover:bg-background-secondary rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-primary hover:bg-brand-secondary text-white rounded-md"
                >
                  Create
                </button>
              </div>
            </form>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Currency;