using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using walletApi.Domain.Entities;
using walletApi.Domain.Interfaces;

namespace walletApi.Application.Services
{
    public class WalletService : IWalletService
    {
        private readonly IWalletRepository _walletRepository;
        
        public WalletService(IWalletRepository walletRepository)
        {
            _walletRepository = walletRepository;
        }
        
        public async Task<IEnumerable<Wallet>> GetAllWalletsAsync()
        {
            return await _walletRepository.GetAllWalletsAsync();
        }
        
        public async Task<Wallet> GetWalletByIdAsync(int id)
        {
            return await _walletRepository.GetWalletByIdAsync(id);
        }
        
        public async Task<IEnumerable<Wallet>> GetWalletsByUserIdAsync(int userId)
        {
            return await _walletRepository.GetWalletsByUserIdAsync(userId);
        }
        
        public async Task<Wallet> CreateWalletAsync(Wallet wallet)
        {
            var existingWallet = await _walletRepository.GetWalletByUserAndCurrencyAsync(wallet.UserId, wallet.Currency);
            if (existingWallet != null)
                throw new InvalidOperationException("Wallet already exists for this user and currency");
                
            return await _walletRepository.CreateWalletAsync(wallet);
        }
        
        public async Task<bool> UpdateWalletBalanceAsync(int walletId, decimal amount)
        {
            var wallet = await _walletRepository.GetWalletByIdAsync(walletId);
            if (wallet == null)
                return false;
                
            wallet.Balance += amount;
            if (wallet.Balance < 0)
                throw new InvalidOperationException("Insufficient funds");
                
            await _walletRepository.UpdateWalletAsync(wallet);
            return true;
        }
        
        public async Task<IEnumerable<Transaction>> GetTransactionsByWalletIdAsync(int walletId)
        {
            return await _walletRepository.GetTransactionsByWalletIdAsync(walletId);
        }
        
        public async Task<Transaction> AddTransactionAsync(int walletId, Transaction transaction)
        {
            var wallet = await _walletRepository.GetWalletByIdAsync(walletId);
            if (wallet == null)
                throw new KeyNotFoundException("Wallet not found");
                
            transaction.WalletId = walletId;
            
            // Update wallet balance based on transaction type
            decimal amountChange = 0;
            
            switch (transaction.Type)
            {
                case TransactionType.Deposit:
                case TransactionType.Purchase:
                    amountChange = transaction.Amount;
                    break;
                case TransactionType.Withdrawal:
                case TransactionType.Sale:
                case TransactionType.Fee:
                    amountChange = -transaction.Amount;
                    if (wallet.Balance < Math.Abs(amountChange))
                        throw new InvalidOperationException("Insufficient funds");
                    break;
            }
            
            wallet.Balance += amountChange;
            await _walletRepository.UpdateWalletAsync(wallet);
            
            return await _walletRepository.AddTransactionAsync(transaction);
        }
    }
}