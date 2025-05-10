using System.Collections.Generic;
using System.Threading.Tasks;
using walletApi.Domain.Entities;
using walletApi.Domain.Interfaces;

namespace walletApi.Services
{
    public class WalletCryptoService : IWalletCryptoService
    {
        private readonly IWalletCryptoRepository _repo;
        public WalletCryptoService(IWalletCryptoRepository repo) => _repo = repo;

        public Task<IEnumerable<WalletCrypto>> GetUserWallets(int userId)
            => _repo.GetByUserAsync(userId);

        public Task<WalletCrypto> Create(int userId, string symbol, string address)
        {
            var w = new WalletCrypto { UserId = userId, Symbol = symbol, Address = address, Balance = 0 };
            return _repo.CreateAsync(w);
        }

        public async Task<WalletCrypto> AdjustBalance(int id, decimal delta)
        {
            var w = await _repo.GetByIdAsync(id) 
                    ?? throw new KeyNotFoundException($"WalletCrypto {id} not found");
            w.Balance += delta;
            return await _repo.UpdateAsync(w);
        }
    }
}