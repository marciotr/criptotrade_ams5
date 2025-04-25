using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
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
        
        public async Task<IEnumerable<Wallet>> GetAllWalletsAsync()
        {
            return await _context.Wallets.ToListAsync();
        }
        
        public async Task<Wallet> GetWalletByIdAsync(int id)
        {
            return await _context.Wallets
                .Include(w => w.Transactions)
                .FirstOrDefaultAsync(w => w.Id == id);
        }
        
        public async Task<IEnumerable<Wallet>> GetWalletsByUserIdAsync(int userId)
        {
            return await _context.Wallets
                .Where(w => w.UserId == userId)
                .ToListAsync();
        }
        
        public async Task<Wallet> GetWalletByUserAndCurrencyAsync(int userId, string currency)
        {
            return await _context.Wallets
                .FirstOrDefaultAsync(w => w.UserId == userId && w.Currency == currency);
        }
        
        public async Task<Wallet> CreateWalletAsync(Wallet wallet)
        {
            _context.Wallets.Add(wallet);
            await _context.SaveChangesAsync();
            return wallet;
        }
        
        public async Task UpdateWalletAsync(Wallet wallet)
        {
            wallet.UpdatedAt = DateTime.UtcNow;
            _context.Entry(wallet).State = EntityState.Modified;
            await _context.SaveChangesAsync();
        }
        
        public async Task<bool> WalletExistsAsync(int id)
        {
            return await _context.Wallets.AnyAsync(w => w.Id == id);
        }
        
        public async Task<IEnumerable<Transaction>> GetTransactionsByWalletIdAsync(int walletId)
        {
            return await _context.Transactions
                .Where(t => t.WalletId == walletId)
                .OrderByDescending(t => t.CreatedAt)
                .ToListAsync();
        }
        
        public async Task<Transaction> AddTransactionAsync(Transaction transaction)
        {
            _context.Transactions.Add(transaction);
            await _context.SaveChangesAsync();
            return transaction;
        }
    }
}