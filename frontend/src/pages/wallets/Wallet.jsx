import React, { useState } from 'react';
import { 
  Wallet as WalletIcon, 
  ArrowUpRight, 
  ArrowDownLeft, 
  RefreshCw, 
  DollarSign,
  MoreHorizontal,
  Eye,
  EyeOff
} from 'lucide-react';

export function Wallet() {
  const [hideBalances, setHideBalances] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Mock data
  const walletData = {
    totalBalance: 14562.38,
    fiatBalance: 1200.50,
    spotBalance: 13361.88,
    assets: [
      { name: 'Bitcoin', symbol: 'BTC', amount: 0.23, value: 9243.12, change: 2.4, icon: '₿' },
      { name: 'Ethereum', symbol: 'ETH', amount: 3.12, value: 3561.76, change: -1.2, icon: 'Ξ' },
      { name: 'USD Coin', symbol: 'USDC', amount: 550, value: 550, change: 0.01, icon: '$' },
      { name: 'Tether', symbol: 'USDT', amount: 7.00, value: 7.00, change: 0, icon: '₮' }
    ]
  };
  
  // Format currency with $ sign
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-text-primary">Wallet</h1>
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setHideBalances(!hideBalances)} 
            className="p-2 rounded-full hover:bg-background-secondary"
          >
            {hideBalances ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
          <button className="p-2 rounded-full hover:bg-background-secondary">
            <RefreshCw size={18} />
          </button>
        </div>
      </div>
      
      {/* Tab navigation */}
      <div className="flex border-b border-border-primary mb-6">
        <button 
          className={`px-4 py-2 font-medium ${activeTab === 'overview' ? 'text-brand-primary border-b-2 border-brand-primary' : 'text-text-secondary'}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`px-4 py-2 font-medium ${activeTab === 'fiat' ? 'text-brand-primary border-b-2 border-brand-primary' : 'text-text-secondary'}`}
          onClick={() => setActiveTab('fiat')}
        >
          Fiat and Spot
        </button>
        <button 
          className={`px-4 py-2 font-medium ${activeTab === 'earn' ? 'text-brand-primary border-b-2 border-brand-primary' : 'text-text-secondary'}`}
          onClick={() => setActiveTab('earn')}
        >
          Earn
        </button>
      </div>
      
      {/* Balance card */}
      <div className="bg-background-primary rounded-xl shadow-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-text-primary">Estimated Balance</h2>
          <span className="text-xs text-text-secondary">≈ BTC Value: 0.54321</span>
        </div>
        
        <div className="mb-4">
          <h3 className={`text-3xl font-bold text-text-primary mb-1 ${hideBalances ? 'blur-sm' : ''}`}>
            {hideBalances ? '••••••' : formatCurrency(walletData.totalBalance)}
          </h3>
          <p className="text-green-500 text-sm">+2.14% (24h)</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="flex flex-col p-4 bg-background-secondary rounded-lg">
            <span className="text-sm text-text-secondary mb-1">Fiat and Spot</span>
            <span className={`text-lg font-semibold text-text-primary ${hideBalances ? 'blur-sm' : ''}`}>
              {hideBalances ? '••••••' : formatCurrency(walletData.spotBalance)}
            </span>
          </div>
          <div className="flex flex-col p-4 bg-background-secondary rounded-lg">
            <span className="text-sm text-text-secondary mb-1">Fiat Balance</span>
            <span className={`text-lg font-semibold text-text-primary ${hideBalances ? 'blur-sm' : ''}`}>
              {hideBalances ? '••••••' : formatCurrency(walletData.fiatBalance)}
            </span>
          </div>
        </div>
      </div>
      
      {/* Action buttons */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <button className="flex flex-col items-center justify-center p-4 bg-background-secondary hover:bg-background-tertiary transition-colors rounded-lg">
          <div className="w-10 h-10 flex items-center justify-center bg-brand-primary bg-opacity-10 rounded-full mb-2">
            <ArrowDownLeft className="text-brand-primary" size={18} />
          </div>
          <span className="text-sm font-medium text-text-primary">Deposit</span>
        </button>
        
        <button className="flex flex-col items-center justify-center p-4 bg-background-secondary hover:bg-background-tertiary transition-colors rounded-lg">
          <div className="w-10 h-10 flex items-center justify-center bg-brand-primary bg-opacity-10 rounded-full mb-2">
            <ArrowUpRight className="text-brand-primary" size={18} />
          </div>
          <span className="text-sm font-medium text-text-primary">Withdraw</span>
        </button>
        
        <button className="flex flex-col items-center justify-center p-4 bg-background-secondary hover:bg-background-tertiary transition-colors rounded-lg">
          <div className="w-10 h-10 flex items-center justify-center bg-brand-primary bg-opacity-10 rounded-full mb-2">
            <RefreshCw className="text-brand-primary" size={18} />
          </div>
          <span className="text-sm font-medium text-text-primary">Convert</span>
        </button>
        
        <button className="flex flex-col items-center justify-center p-4 bg-background-secondary hover:bg-background-tertiary transition-colors rounded-lg">
          <div className="w-10 h-10 flex items-center justify-center bg-brand-primary bg-opacity-10 rounded-full mb-2">
            <MoreHorizontal className="text-brand-primary" size={18} />
          </div>
          <span className="text-sm font-medium text-text-primary">More</span>
        </button>
      </div>
      
      {/* Assets list */}
      <div className="bg-background-primary rounded-xl shadow-lg">
        <div className="px-6 py-4 border-b border-border-primary">
          <h3 className="text-lg font-medium text-text-primary">Your Assets</h3>
        </div>
        
        <div className="divide-y divide-border-primary">
          {walletData.assets.map((asset, index) => (
            <div key={index} className="flex items-center justify-between p-4 hover:bg-background-secondary transition-colors">
              <div className="flex items-center">
                <div className="w-10 h-10 flex items-center justify-center bg-background-tertiary rounded-full mr-3 text-lg font-bold">
                  {asset.icon}
                </div>
                <div>
                  <h4 className="text-text-primary font-medium">{asset.name}</h4>
                  <p className="text-text-secondary text-sm">{asset.symbol}</p>
                </div>
              </div>
              
              <div className="text-right">
                <p className={`text-text-primary font-medium ${hideBalances ? 'blur-sm' : ''}`}>
                  {hideBalances ? '••••••' : asset.amount} {asset.symbol}
                </p>
                <div className="flex items-center justify-end">
                  <p className={`text-text-secondary text-sm mr-2 ${hideBalances ? 'blur-sm' : ''}`}>
                    {hideBalances ? '••••••' : formatCurrency(asset.value)}
                  </p>
                  <span className={`text-xs ${asset.change > 0 ? 'text-green-500' : asset.change < 0 ? 'text-red-500' : 'text-gray-500'}`}>
                    {asset.change > 0 ? '+' : ''}{asset.change}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-6 text-center text-text-secondary text-sm">
        <p>Esta é uma interface mockada. Os dados não são reais.</p>
      </div>
    </div>
  );
}