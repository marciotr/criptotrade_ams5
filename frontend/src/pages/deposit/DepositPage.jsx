import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, DollarSign, Wallet, ArrowDownLeft } from 'lucide-react';
import SimpleHeader from '../../components/SimpleHeader';
import { NotificationToast } from '../../components/common/NotificationToast';
import * as signalR from '@microsoft/signalr';
import { api as axiosApi } from '../../services/api/config';
import Logo from '../../assets/img/logoBinanceRemoved.png';
import InputMask from 'react-input-mask';
import { walletApi } from '../../services/api/api';

export function DepositPage() {
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [amount, setAmount] = useState('');
  const [depositLoading, setDepositLoading] = useState(false);
  const [depositMessage, setDepositMessage] = useState(null);
  const [notification, setNotification] = useState(null);
  const [cryptoSymbol, setCryptoSymbol] = useState('BTC');
  const [cryptoAmount, setCryptoAmount] = useState('');
  const [bankAmount, setBankAmount] = useState('');
  const [walletAddress, setWalletAddress] = useState(null);
  const [balances, setBalances] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [usdTotal, setUsdTotal] = useState(null); // authoritative USD total from /balance/summary

  const handleMethodClick = (method) => {
    setSelectedMethod(method === selectedMethod ? null : method);
  };

  const genReferenceId = () => {
    if (window.crypto && window.crypto.randomUUID) return window.crypto.randomUUID();
    return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  };

  const loadBalances = async () => {
    try {
      const res = await walletApi.getBalance();
      console.debug('[DepositPage] raw /balance response', res?.data);
      const raw = Array.isArray(res.data) ? res.data : [];
      const normalized = raw.map((b) => ({
        currencyId: b.currencyId ?? b.CurrencyId ?? b.IdCurrency ?? b.idCurrency,
        symbol: (b.symbol ?? b.Symbol ?? b.CurrencySymbol ?? b.currencySymbol ?? '').toUpperCase(),
        name: b.name ?? b.Name ?? '',
        amount: Number(b.amount ?? b.Amount ?? b.availableAmount ?? b.AvailableAmount ?? 0),
        currentPrice: Number(b.currentPrice ?? b.CurrentPrice ?? 1),
        value: Number(b.value ?? b.Value ?? ((Number(b.amount ?? b.Amount ?? 0) * Number(b.currentPrice ?? b.CurrentPrice ?? 1))))
      }));
      console.debug('[DepositPage] normalized balances', normalized);
      setBalances(normalized);
      // fetch summary total (authoritative USD total)
      try {
        const sumRes = await walletApi.getSummary();
        console.debug('[DepositPage] /balance/summary response', sumRes?.data);
        const total = sumRes?.data?.totalValue;
        setUsdTotal(total != null ? Number(total) : null);
      } catch (e) {
        console.warn('Failed to load balance summary', e);
        setUsdTotal(null);
      }
    } catch (err) {
      console.warn('Erro ao carregar balances', err);
      setBalances([]);
      setUsdTotal(null);
    }
  };

  const loadTransactions = async () => {
    try {
      const res = await walletApi.getTransactions();
      setTransactions(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.warn('Erro ao carregar transações', err);
      setTransactions([]);
    }
  };

  const loadOrCreateWallet = async () => {
    try {
      const res = await walletApi.getWallets();
      const wallets = Array.isArray(res.data) ? res.data : [];
      if (wallets.length > 0) {
        setWalletAddress(wallets[0].idWallet || wallets[0].address || null);
        return;
      }

      const created = await walletApi.createWallet({ name: 'Default' });
      const w = created.data;
      setWalletAddress(w?.idWallet || w?.address || null);
    } catch (err) {
      console.warn('Erro ao carregar/criar wallet', err);
      setWalletAddress(null);
    }
  };

  // Helpers to safely read transaction properties with different casings
  const getTxField = (tx, ...keys) => {
    for (const k of keys) {
      if (tx == null) break;
      if (Object.prototype.hasOwnProperty.call(tx, k) && tx[k] !== undefined && tx[k] !== null) return tx[k];
    }
    return null;
  };

  const getTxTypeString = (tx) => {
    const v = getTxField(tx, 'type', 'Type');
    if (v == null) return '';
    return typeof v === 'string' ? v : String(v);
  };

  const getTxAsset = (tx) => {
    return getTxField(tx, 'asset', 'assetSymbol', 'AssetSymbol') || '';
  };

  const getTxDisplayType = (tx) => {
    const raw = getTxField(tx, 'type', 'Type') || '';
    const s = typeof raw === 'string' ? raw : String(raw);
    const low = s.toLowerCase();
    if (low.includes('deposit') && low.includes('fiat')) return 'Deposit';
    if (low.includes('deposit')) return 'Deposit';
    if (low.includes('withdraw')) return 'Withdraw';
    if (low.includes('buy')) return 'Buy';
    if (low.includes('sell')) return 'Sell';
    if (low.includes('swap')) return 'Swap';
    return s || '';
  };

  const getTxAmountLabel = (tx) => {
    const amt = tx?.totalAmount ?? tx?.TotalAmount ?? tx?.total ?? tx?.amount ?? tx?.Amount ?? tx?.value ?? tx?.Value ?? '';
    return amt !== null && amt !== undefined ? String(amt) : '';
  };

  useEffect(() => {
    loadOrCreateWallet();
    loadBalances();
    loadTransactions();
    // Setup SignalR connection for real-time balance updates
    let connection;
    try {
      const token = localStorage.getItem('token');
      const base = (axiosApi && axiosApi.defaults && axiosApi.defaults.baseURL) ? axiosApi.defaults.baseURL : window.location.origin;
      connection = new signalR.HubConnectionBuilder()
        .withUrl(`${base.replace(/\/$/, '')}/hubs/balance`, { accessTokenFactory: () => token })
        .withAutomaticReconnect()
        .build();

      connection.on('BalancesUpdated', (payload) => {
        // normalize payload if server sends array of balances
        console.debug('[DepositPage] SignalR BalancesUpdated payload', payload);
        const raw = Array.isArray(payload) ? payload : [];
        const normalized = raw.map((b) => ({
          currencyId: b.currencyId ?? b.CurrencyId ?? b.IdCurrency ?? b.idCurrency,
          symbol: (b.symbol ?? b.Symbol ?? b.CurrencySymbol ?? b.currencySymbol ?? '').toUpperCase(),
          name: b.name ?? b.Name ?? '',
          amount: Number(b.amount ?? b.Amount ?? b.availableAmount ?? b.AvailableAmount ?? 0),
          currentPrice: Number(b.currentPrice ?? b.CurrentPrice ?? 1),
          value: Number(b.value ?? b.Value ?? ((Number(b.amount ?? b.Amount ?? 0) * Number(b.currentPrice ?? b.CurrentPrice ?? 1))))
        }));
        console.debug('[DepositPage] SignalR normalized balances', normalized);
        setBalances(normalized);
        // If server sent an aggregated summary inside the SignalR payload use it
        if (payload && payload.totalValue != null) {
          setUsdTotal(Number(payload.totalValue));
        }
      });

      connection.start().catch(err => console.warn('SignalR start error', err));
    } catch (e) {
      console.warn('SignalR not initialized', e);
    }

    return () => {
      if (connection) connection.stop().catch(() => {});
    };
  }, []);

  // compute USD balance (include USDT as equivalent)
  const usdSymbols = new Set(['USD', 'USDT', 'USDC']);
  const usdBalance = balances.reduce((sum, b) => {
    const sym = (b.symbol || '').toUpperCase();
    if (usdSymbols.has(sym)) {
      const val = Number(b.value ?? (Number(b.amount || 0) * Number(b.currentPrice || 1))) || 0;
      return sum + val;
    }
    return sum;
  }, 0);

  let effectiveUsdBalance = usdTotal != null ? usdTotal : usdBalance;
  if (effectiveUsdBalance === 0 && balances.length > 0) {
    const fallback = balances.reduce((s, b) => {
      const sym = (b.symbol || '').toUpperCase();
      const name = (b.name || '').toLowerCase();
      if (sym.includes('USD') || name.includes('dollar') || name.includes('dólar') || name.includes('tether')) {
        return s + (Number(b.value ?? (Number(b.amount || 0) * Number(b.currentPrice || 1))) || 0);
      }
      return s;
    }, 0);
    if (fallback > 0) {
      console.debug('[DepositPage] usdBalance fallback applied, value=', fallback, 'balances=', balances);
      effectiveUsdBalance = fallback;
    }
  }

  return (
     <>
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
     <SimpleHeader
          crumbs={[
            { label: 'Dashboard', to: '/dashboard' },
            { label: 'Deposit' }
          ]}
          
        />
    <div className="container mx-auto py-8 pt-20">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        

        <h1 className="text-2xl font-bold text-text-primary mb-6">Deposit / Buy Crypto</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left panel */}
          <motion.div 
            className="bg-background-primary p-6 rounded-xl shadow-lg"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-xl font-bold mb-4 text-text-primary">Deposit Options</h2>
            <p className="text-text-secondary mb-6">Choose a method to add funds to your account</p>
            {depositMessage && (
              <div className="mb-4 p-3 rounded bg-emerald-50 text-emerald-800">{depositMessage}</div>
            )}
            
            <div className="space-y-4">
              <div 
                className={`p-4 bg-background-secondary rounded-lg flex items-center cursor-pointer ${
                  selectedMethod === 'card' ? 'ring-2 ring-brand-primary' : 'hover:bg-background-tertiary'
                } transition-colors`}
                onClick={() => handleMethodClick('card')}
              >
                <div className="w-10 h-10 bg-brand-primary bg-opacity-10 rounded-full flex items-center justify-center mr-4">
                  <CreditCard className="text-brand-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-text-primary">Credit / Debit Card</h3>
                  <p className="text-sm text-text-secondary">Instant deposit, 1.5% fee</p>
                </div>
              </div>
              
              <AnimatePresence initial={false}>
                {selectedMethod === 'card' && (
                  <motion.div
                    key="card"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="ml-14 mt-2 p-4 bg-background-secondary rounded-lg"
                  >
                    <h4 className="text-sm font-bold text-text-primary mb-3">Card Details</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-text-secondary mb-1">Card Number</label>
                        <InputMask
                          mask="9999 9999 9999 9999"
                          placeholder="1234 5678 9012 3456" 
                          className="w-full p-2 border border-border-secondary rounded-md bg-background-secondary text-text-primary"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm text-text-secondary mb-1">Expiry Date</label>
                          <InputMask 
                            mask="99/99"
                            placeholder="MM/YY" 
                            className="w-full p-2 border border-border-secondary rounded-md bg-background-secondary text-text-primary"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-text-secondary mb-1">CVC</label>
                          <InputMask 
                            mask="999"
                            placeholder="123" 
                            className="w-full p-2 border border-border-secondary rounded-md bg-background-secondary text-text-primary"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm text-text-secondary mb-1">Amount (USD)</label>
                        <InputMask 
                          mask="$ 999999999.99"
                          maskChar={null}
                          placeholder="$ 0.00" 
                          className="w-full p-2 border border-border-secondary rounded-md bg-background-secondary text-text-primary"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                        />
                      </div>
                      <button
                        className="w-full py-2 bg-brand-primary text-white rounded-md hover:bg-opacity-90 transition-colors"
                        onClick={async () => {
                          const value = parseFloat(amount.replace(/[^0-9.-]+/g, '')) || 0;
                          if (!value || value <= 0) {
                            setDepositMessage('Informe um valor válido');
                            return;
                          }
                          setDepositLoading(true);
                          setDepositMessage(null);
                          try {
                            const ref = genReferenceId();
                            await walletApi.depositFiat({ currency: 'USD', amount: value, method: 'CARD', referenceId: ref });
                            setDepositMessage('Depósito concluído com sucesso');
                            setNotification({ type: 'success', message: 'Depósito concluído com sucesso' });
                            setAmount('');
                            await loadBalances();
                          } catch (err) {
                            const msg = err.response?.data?.message || err.message || 'Erro no depósito';
                            setDepositMessage(msg);
                            setNotification({ type: 'error', message: msg });
                          } finally {
                            setDepositLoading(false);
                          }
                        }}
                        disabled={depositLoading}
                      >
                        {depositLoading ? 'Processando...' : 'Complete Deposit'}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <div 
                className={`p-4 bg-background-secondary rounded-lg flex items-center cursor-pointer ${
                  selectedMethod === 'bank' ? 'ring-2 ring-brand-primary' : 'hover:bg-background-tertiary'
                } transition-colors`}
                onClick={() => handleMethodClick('bank')}
              >
                <div className="w-10 h-10 bg-brand-primary bg-opacity-10 rounded-full flex items-center justify-center mr-4">
                  <DollarSign className="text-brand-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-text-primary">Bank Transfer</h3>
                  <p className="text-sm text-text-secondary">1-3 business days, no fee</p>
                </div>
              </div>
              
              <AnimatePresence initial={false}>
                {selectedMethod === 'bank' && (
                  <motion.div
                    key="bank"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="ml-14 mt-2 p-4 bg-background-secondary rounded-lg"
                  >
                    <h4 className="text-sm font-bold text-text-primary mb-3">Bank Transfer Details</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-text-secondary mb-1">Account Holder Name</label>
                        <input
                          type="text"
                          placeholder="Your full name"
                          className="w-full p-2 border border-border-secondary rounded-md bg-background-secondary text-text-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-text-secondary mb-1">Amount (USD)</label>
                        <InputMask 
                          mask="$ 999999999.99"
                          maskChar={null}
                          placeholder="$ 0.00" 
                          className="w-full p-2 border border-border-secondary rounded-md bg-background-secondary text-text-primary"
                          value={bankAmount}
                          onChange={(e) => setBankAmount(e.target.value)}
                        />
                      </div>
                      <div className="bg-background-primary p-3 rounded-md border border-border-primary">
                        <h5 className="text-sm font-medium text-text-primary mb-1">Our Bank Details</h5>
                        <p className="text-xs text-text-secondary">Account: 123456789</p>
                        <p className="text-xs text-text-secondary">Routing: 012345678</p>
                        <p className="text-xs text-text-secondary">Bank: CriptoTrade Financial</p>
                        <p className="text-xs text-text-secondary mb-2">Reference: Include your user ID</p>
                      </div>
                      <button
                        className="w-full py-2 bg-brand-primary text-white rounded-md hover:bg-opacity-90 transition-colors"
                        onClick={async () => {
                          const value = parseFloat(bankAmount.replace(/[^0-9.-]+/g, '')) || 0;
                          if (!value || value <= 0) {
                            setDepositMessage('Informe um valor válido para transferência bancária');
                            return;
                          }
                          setDepositLoading(true);
                          setDepositMessage(null);
                          try {
                            const ref = genReferenceId();
                            await walletApi.depositFiat({ currency: 'USD', amount: value, method: 'BANK_TRANSFER', referenceId: ref });
                            const successMsg = 'Depósito por transferência registrado com sucesso';
                            setDepositMessage(successMsg);
                            setNotification({ type: 'success', message: successMsg });
                            setBankAmount('');
                            await loadBalances();
                          } catch (err) {
                            const msg = err.response?.data?.message || err.message || 'Erro no depósito por transferência';
                            setDepositMessage(msg);
                            setNotification({ type: 'error', message: msg });
                          } finally {
                            setDepositLoading(false);
                          }
                        }}
                        disabled={depositLoading}
                      >
                        {depositLoading ? 'Processando...' : "I've Sent the Transfer"}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <div 
                className={`p-4 bg-background-secondary rounded-lg flex items-center cursor-pointer ${
                  selectedMethod === 'crypto' ? 'ring-2 ring-brand-primary' : 'hover:bg-background-tertiary'
                } transition-colors`}
                onClick={() => handleMethodClick('crypto')}
              >
                <div className="w-10 h-10 bg-brand-primary bg-opacity-10 rounded-full flex items-center justify-center mr-4">
                  <Wallet className="text-brand-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-text-primary">Crypto Transfer</h3>
                  <p className="text-sm text-text-secondary">Deposit crypto from external wallet</p>
                </div>
              </div>
              
              <AnimatePresence initial={false}>
                {selectedMethod === 'crypto' && (
                  <motion.div
                    key="crypto"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="ml-14 mt-2 p-4 bg-background-secondary rounded-lg"
                  >
                    <h4 className="text-sm font-bold text-text-primary mb-3">Deposit Cryptocurrency</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-text-secondary mb-1">Select Cryptocurrency</label>
                        <select
                          className="w-full p-2 border border-border-secondary rounded-md bg-background-secondary text-text-primary"
                          value={cryptoSymbol}
                          onChange={(e) => setCryptoSymbol(e.target.value)}
                        >
                          <option value="BTC">Bitcoin (BTC)</option>
                          <option value="ETH">Ethereum (ETH)</option>
                          <option value="USDT">Tether (USDT)</option>
                          <option value="USDC">USD Coin (USDC)</option>
                        </select>
                        <div className="mt-3">
                          <label className="block text-sm text-text-secondary mb-1">Amount</label>
                          <input
                            type="number"
                            step="any"
                            placeholder="0.0000"
                            className="w-full p-2 border border-border-secondary rounded-md bg-background-secondary text-text-primary"
                            value={cryptoAmount}
                            onChange={(e) => setCryptoAmount(e.target.value)}
                          />
                          <button
                            className="mt-3 w-full py-2 bg-brand-primary text-white rounded-md hover:bg-opacity-90 transition-colors"
                            onClick={async () => {
                              const value = parseFloat(cryptoAmount) || 0;
                              if (!value || value <= 0) {
                                setDepositMessage('Informe um valor válido para o depósito em cripto');
                                return;
                              }
                              setDepositLoading(true);
                              setDepositMessage(null);
                                try {
                                const ref = genReferenceId();
                                await walletApi.adjustBalance(cryptoSymbol, value, {
                                  unitPriceUsd: 1,
                                  method: 'CRYPTO_TRANSFER',
                                  referenceId: ref,
                                });
                                const successMsg = 'Depósito em cripto registrado com sucesso';
                                setDepositMessage(successMsg);
                                setNotification({ type: 'success', message: successMsg });
                                setCryptoAmount('');
                                await loadBalances();
                              } catch (err) {
                                const msg = err.response?.data?.message || err.message || 'Erro no depósito em cripto';
                                setDepositMessage(msg);
                                setNotification({ type: 'error', message: msg });
                              } finally {
                                setDepositLoading(false);
                              }
                            }}
                            disabled={depositLoading}
                          >
                            {depositLoading ? 'Processando...' : 'Confirm Deposit'}
                          </button>
                        </div>
                      </div>
                      <div className="bg-background-primary p-3 rounded-md border border-border-primary">
                        <h5 className="text-sm font-medium text-text-primary mb-2">Your Deposit Address</h5>
                        <div className="flex items-center justify-between mb-2">
                          <code className="text-xs bg-background-secondary p-2 rounded w-full overflow-hidden">
                            {walletAddress ?? 'Loading or not available'}
                          </code>
                          <button
                            className="ml-2 p-1 bg-background-secondary rounded hover:bg-background-tertiary"
                            onClick={() => {
                              try {
                                navigator.clipboard.writeText(walletAddress || '');
                                setDepositMessage('Endereço copiado para área de transferência');
                              } catch { /* ignore */ }
                            }}
                          >
                            <CreditCard size={16} className="text-text-secondary" />
                          </button>
                        </div>
                        <div className="flex justify-center py-2">
                          <div className="bg-white p-2 rounded w-32 h-32">
                            {/* QR Code placeholder */}
                            <div className="w-full h-full border-2 border-dashed border-gray-300 flex items-center justify-center">
                              <span className="text-xs text-gray-500">QR Code</span>
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-amber-500 mt-2">Important: Only send BTC to this address. Sending any other coin may result in permanent loss.</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-700">
                Tela ainda mockada. Os formulários não submetem dados reais.
              </p>
            </div>
          </motion.div>
          
          {/* Right panel */}
          <motion.div 
            className="bg-background-primary p-6 rounded-xl shadow-lg"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-xl font-bold mb-4 text-text-primary">Recent Activity</h2>
            
              <div className="space-y-3">
                  {balances && balances.length > 0 ? (
                    balances.map((b) => {
                      const symbol = b.symbol || 'UNKNOWN';
                      const amount = b.amount ?? 0;
                      return (
                        <div key={`bal-${b.currencyId ?? symbol}`} className="p-3 border border-border-primary rounded-lg flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                              <ArrowDownLeft className="h-4 w-4 text-green-600" />
                            </div>
                            <div>
                              <h4 className="text-text-primary">{symbol}</h4>
                              <p className="text-xs text-text-secondary">Available</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-text-primary font-medium">{amount}</p>
                            <p className="text-xs text-text-tertiary">Balance</p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-3 border border-border-primary rounded-lg text-text-tertiary">No balances yet</div>
                  )}

                  {/* Integrate recent transactions into the same "Recent Activity" list */}
                  {transactions && transactions.length > 0 && (
                    transactions.slice(0, 6).map((tx) => {
                      const displayType = getTxDisplayType(tx) || 'Txn';
                      const typeStr = (displayType || '').toLowerCase();
                      const assetLabel = getTxAsset(tx);
                      const amountLabel = getTxAmountLabel(tx);
                      const messageLabel = tx.message ?? tx.description ?? tx.Message ?? '';

                      return (
                        <div key={`tx-${tx.id ?? tx.Id ?? tx.idTransaction ?? tx.IdTransaction ?? Math.random()}`} className="p-3 border border-border-primary rounded-lg flex items-center justify-between">
                          <div className="flex items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${typeStr === 'deposit' ? 'bg-emerald-100' : 'bg-blue-100'}`}>
                              <span className="text-sm font-medium">{(displayType.charAt(0) || 'T').toUpperCase()}</span>
                            </div>
                            <div>
                              <h4 className="text-text-primary">{displayType.charAt(0).toUpperCase() + displayType.slice(1)}</h4>
                              <p className="text-xs text-text-secondary">{assetLabel}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-text-primary font-medium">{amountLabel}</p>
                            <p className="text-xs text-text-secondary">{messageLabel}</p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
            
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-3 text-text-primary">Your Balances</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-background-secondary rounded-lg">
                  <p className="text-sm text-text-tertiary mb-1">USD Balance</p>
                  <p className="text-lg font-medium text-text-primary">
                    ${Number(effectiveUsdBalance || 0).toFixed(2)}
                  </p>
                </div>
                <div className="p-3 bg-background-secondary rounded-lg">
                  <p className="text-sm text-text-tertiary mb-1">EUR Balance</p>
                  <p className="text-lg font-medium text-text-primary">€0.00</p>
                </div>
              </div>
            </div>

            {/* Recent transactions / deposits */}
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-3 text-text-primary">Recent Transactions</h3>
              <div className="space-y-3">
                {transactions && transactions.length > 0 ? (
                  transactions.slice(0, 6).map((tx) => {
                    const typeStr = getTxTypeString(tx).toLowerCase();
                    const displayType = (getTxTypeString(tx) || 'Txn');
                    const assetLabel = getTxAsset(tx);
                    const amountLabel = (tx.amount ?? tx.Amount ?? tx.value ?? tx.amount ?? '').toString();
                    const messageLabel = tx.message ?? tx.description ?? tx.Message ?? '';

                    return (
                      <div key={tx.id ?? tx.Id} className="p-3 border border-border-primary rounded-lg flex items-center justify-between">
                        <div className="flex items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${typeStr === 'deposit' ? 'bg-emerald-100' : 'bg-blue-100'}`}>
                            <span className="text-sm font-medium">{(displayType.charAt(0) || 'T').toUpperCase()}</span>
                          </div>
                          <div>
                            <h4 className="text-text-primary">{displayType.charAt(0).toUpperCase() + displayType.slice(1)}</h4>
                              <p className="text-xs text-text-secondary">{assetLabel}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-text-primary font-medium">{amountLabel}</p>
                            <p className="text-xs text-text-secondary">{messageLabel}</p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-3 border border-border-primary rounded-lg text-text-tertiary">No recent transactions</div>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        <div className="mt-8 flex justify-center">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center text-text-secondary text-sm"
          >
            <img src={Logo} alt="CriptoTrade" className="w-12 h-12 mx-auto mb-2" />
            <p>Esta é uma interface mockada. Os dados não são reais.</p>
          </motion.div>
        </div>
      </motion.div>
    </div>

    </>
   
  );
}