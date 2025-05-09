using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using walletApi.Domain.Entities;
using walletApi.Domain.Interfaces;
using walletApi.Infrastructure.Data;

namespace walletApi.Infrastructure.Repositories
{
    public class WalletRepository : IWalletRepository
    {
        private readonly WalletDbContext _context;

        public WalletRepository(WalletDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Wallet>> GetAllAsync()
        {
            return await _context.Wallets.ToListAsync();
        }

        public async Task<Wallet> GetByIdAsync(int id)
        {
            return await _context.Wallets.FindAsync(id);
        }

        public async Task<IEnumerable<Wallet>> GetByUserIdAsync(int userId)
        {
            return await _context.Wallets
                .Where(w => w.UserId == userId)
                .ToListAsync();
        }

        public async Task<IEnumerable<Wallet>> GetByUserIdAndTypeAsync(int userId, WalletType type)
        {
            return await _context.Wallets
                .Where(w => w.UserId == userId && w.Type == type)
                .ToListAsync();
        }

        public async Task<Wallet> AddAsync(Wallet wallet)
        {
            _context.Wallets.Add(wallet);
            await _context.SaveChangesAsync();
            return wallet;
        }

        public async Task<Wallet> UpdateAsync(Wallet wallet)
        {
            _context.Entry(wallet).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return wallet;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var wallet = await _context.Wallets.FindAsync(id);
            if (wallet == null)
                return false;

            _context.Wallets.Remove(wallet);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<Transaction> AddTransactionAsync(Transaction transaction)
        {
            _context.Transactions.Add(transaction);
            await _context.SaveChangesAsync();
            return transaction;
        }

        public async Task<IEnumerable<Transaction>> GetTransactionsAsync(int walletId)
        {
            return await _context.Transactions
                .Where(t => t.WalletId == walletId)
                .OrderByDescending(t => t.TransactionDate)
                .ToListAsync();
        }

        public async Task<IEnumerable<Transaction>> GetRecentTransactionsAsync(int walletId, int count = 10)
        {
            return await _context.Transactions
                .Where(t => t.WalletId == walletId)
                .OrderByDescending(t => t.CreatedAt)
                .Take(count)
                .ToListAsync();
        }
    }
}