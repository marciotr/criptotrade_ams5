using System.Collections.Generic;
using System.Threading.Tasks;
using walletApi.Domain.Entities;
using walletApi.Domain.Interfaces;

namespace walletApi.Services
{
    public class WalletFiatService : IWalletFiatService
    {
        private readonly IWalletFiatRepository _repo;
        public WalletFiatService(IWalletFiatRepository repo) => _repo = repo;

        public Task<IEnumerable<WalletFiat>> GetUserWallets(int userId)
            => _repo.GetByUserAsync(userId);

        public Task<WalletFiat> Create(int userId, string currency)
        {
            var w = new WalletFiat { UserId = userId, Currency = currency, Balance = 0 };
            return _repo.CreateAsync(w);
        }

        public async Task<WalletFiat> AdjustBalance(int id, decimal delta)
        {
            var w = await _repo.GetByIdAsync(id) 
                    ?? throw new KeyNotFoundException($"WalletFiat {id} not found");
            w.Balance += delta;
            return await _repo.UpdateAsync(w);
        }
    }
}