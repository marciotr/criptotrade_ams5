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
            return await _walletRepository.GetAllAsync();
        }

        public async Task<Wallet> GetWalletByIdAsync(int id)
        {
            return await _walletRepository.GetByIdAsync(id);
        }

        public async Task<IEnumerable<Wallet>> GetUserWalletsAsync(int userId)
        {
            return await _walletRepository.GetByUserIdAsync(userId);
        }

        public async Task<IEnumerable<Wallet>> GetUserWalletsByTypeAsync(int userId, WalletType type)
        {
            return await _walletRepository.GetByUserIdAndTypeAsync(userId, type);
        }

        public async Task<Wallet> CreateWalletAsync(Wallet wallet)
        {
            wallet.CreatedAt = DateTime.UtcNow;
            return await _walletRepository.AddAsync(wallet);
        }

        public async Task<Wallet> UpdateWalletAsync(Wallet wallet)
        {
            wallet.UpdatedAt = DateTime.UtcNow;
            return await _walletRepository.UpdateAsync(wallet);
        }

        public async Task<bool> DeleteWalletAsync(int id)
        {
            return await _walletRepository.DeleteAsync(id);
        }

        public async Task<Transaction> AddTransactionAsync(int walletId, Transaction transaction)
        {
            var wallet = await _walletRepository.GetByIdAsync(walletId);
            if (wallet == null)
            {
                throw new Exception("Wallet not found");
            }

            // Atualizar o saldo da carteira
            switch (transaction.Type)
            {
                case TransactionType.Deposit:
                case TransactionType.Purchase:
                    wallet.Balance += transaction.Amount;
                    break;
                case TransactionType.Withdrawal:
                case TransactionType.Sale:
                case TransactionType.Fee:
                    wallet.Balance -= transaction.Amount;
                    break;
            }

            wallet.UpdatedAt = DateTime.UtcNow;
            await _walletRepository.UpdateAsync(wallet);

            transaction.WalletId = walletId;
            return await _walletRepository.AddTransactionAsync(transaction);
        }

        public async Task<IEnumerable<Transaction>> GetWalletTransactionsAsync(int walletId)
        {
            return await _walletRepository.GetTransactionsAsync(walletId);
        }

        public async Task<IEnumerable<Transaction>> GetRecentTransactionsAsync(int walletId, int count = 10)
        {
            return await _walletRepository.GetRecentTransactionsAsync(walletId, count);
        }
    }
}