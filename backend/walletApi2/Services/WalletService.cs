using System;
using System.Collections.Concurrent;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using WalletApi2.Domain.Entities;
using WalletApi2.Domain.Interfaces;

namespace WalletApi2.Services
{
    public class WalletService : IWalletService
    {
        // Simple in-memory store: userId -> Wallet
        private static readonly ConcurrentDictionary<int, Wallet> _store = new ConcurrentDictionary<int, Wallet>();
        private static int _nextId = 1;

        public Task<Wallet> GetWalletByUserIdAsync(int userId)
        {
            _store.TryGetValue(userId, out var wallet);
            return Task.FromResult(wallet);
        }

        public Task<Wallet> CreateWalletForUserAsync(int userId)
        {
            // If wallet exists, return it
            if (_store.TryGetValue(userId, out var existing))
            {
                return Task.FromResult(existing);
            }

            // Generate a mock address and public key
            var keyPair = GenerateMockKeyPair(userId);

            var wallet = new Wallet
            {
                Id = System.Threading.Interlocked.Increment(ref _nextId),
                UserId = userId,
                Address = keyPair.address,
                PublicKey = keyPair.publicKey,
                CreatedAt = DateTime.UtcNow
            };

            _store[userId] = wallet;

            return Task.FromResult(wallet);
        }

        private (string address, string publicKey) GenerateMockKeyPair(int userId)
        {
            // Use a deterministic seed per user for reproducible demo values
            var seed = BitConverter.GetBytes(userId ^ Environment.TickCount);
            using var sha = SHA256.Create();
            var hash = sha.ComputeHash(seed.Concat(Guid.NewGuid().ToByteArray()).ToArray());
            var address = "addr_" + Convert.ToHexString(hash).Substring(0, 32);

            // For public key, produce another hash
            var pkHash = sha.ComputeHash(hash.Concat(Encoding.UTF8.GetBytes("pub" + userId)).ToArray());
            var publicKey = "pk_" + Convert.ToHexString(pkHash).Substring(0, 64);

            return (address, publicKey);
        }
    }
}
