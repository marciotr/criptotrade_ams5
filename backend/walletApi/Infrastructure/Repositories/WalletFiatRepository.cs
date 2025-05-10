using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using walletApi.Domain.Entities;
using walletApi.Domain.Interfaces;
using walletApi.Infrastructure.Data;

namespace walletApi.Infrastructure.Repositories
{
    public class WalletFiatRepository : IWalletFiatRepository
    {
        private readonly WalletDbContext _db;
        public WalletFiatRepository(WalletDbContext db) => _db = db;

        public async Task<WalletFiat?> GetByIdAsync(int id) =>
            await _db.WalletFiats.FindAsync(id);

        public async Task<IEnumerable<WalletFiat>> GetByUserAsync(int userId) =>
            await _db.WalletFiats
                     .AsNoTracking()
                     .Where(w => w.UserId == userId)
                     .ToListAsync();

        public async Task<WalletFiat> CreateAsync(WalletFiat wallet)
        {
            _db.WalletFiats.Add(wallet);
            await _db.SaveChangesAsync();
            return wallet;
        }

        public async Task<WalletFiat> UpdateAsync(WalletFiat wallet)
        {
            _db.WalletFiats.Update(wallet);
            await _db.SaveChangesAsync();
            return wallet;
        }
    }
}