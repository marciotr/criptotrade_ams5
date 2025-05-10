using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using walletApi.Domain.Entities;
using walletApi.Domain.Interfaces;
using walletApi.Infrastructure.Data;

namespace walletApi.Infrastructure.Repositories
{
    public class WalletCryptoRepository : IWalletCryptoRepository
    {
        private readonly WalletDbContext _db;
        public WalletCryptoRepository(WalletDbContext db) => _db = db;

        public async Task<WalletCrypto?> GetByIdAsync(int id) =>
            await _db.WalletCryptos.FindAsync(id);

        public async Task<IEnumerable<WalletCrypto>> GetByUserAsync(int userId) =>
            await _db.WalletCryptos
                .AsNoTracking()
                .Where(w => w.UserId == userId)
                .ToListAsync();

        public async Task<WalletCrypto> CreateAsync(WalletCrypto wallet)
        {
            _db.WalletCryptos.Add(wallet);
            await _db.SaveChangesAsync();
            return wallet;
        }

        public async Task<WalletCrypto> UpdateAsync(WalletCrypto wallet)
        {
            _db.WalletCryptos.Update(wallet);
            await _db.SaveChangesAsync();
            return wallet;
        }
    }
}