using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using WalletApi2.Domain.Entities;
using WalletApi2.Domain.Enums;
using WalletApi2.Domain.Interfaces;
using WalletApi2.Infrastructure;

namespace WalletApi2.Services
{
    public class AssetBalanceService : IAssetBalanceService
    {
        private readonly WalletDbContext _dbContext;
        private readonly IRepository<TransactionHistory> _historyRepository;
        private readonly Microsoft.Extensions.Logging.ILogger<AssetBalanceService> _logger;

        public AssetBalanceService(WalletDbContext dbContext, IRepository<TransactionHistory> historyRepository, Microsoft.Extensions.Logging.ILogger<AssetBalanceService> logger)
        {
            _dbContext = dbContext;
            _historyRepository = historyRepository;
            _logger = logger;
        }

        public async Task<bool> AdjustBalanceAtomicAsync(int userId, string assetSymbol, decimal deltaAmount)
        {
            if (string.IsNullOrWhiteSpace(assetSymbol)) throw new ArgumentException("assetSymbol is required", nameof(assetSymbol));

            // Execute atomic update with parameterization to avoid SQL injection
            var now = DateTime.UtcNow;

            // Build WHERE clause: if debiting (deltaAmount < 0), require sufficient AvailableAmount
            FormattableString updateSql;
            if (deltaAmount < 0)
            {
                var absDelta = Math.Abs(deltaAmount);
                updateSql = $"UPDATE UserAssetBalances SET AvailableAmount = AvailableAmount + {deltaAmount}, UpdatedAt = {now} WHERE UserId = {userId} AND AssetSymbol = {assetSymbol} AND AvailableAmount >= {absDelta}";
            }
            else
            {
                updateSql = $"UPDATE UserAssetBalances SET AvailableAmount = AvailableAmount + {deltaAmount}, UpdatedAt = {now} WHERE UserId = {userId} AND AssetSymbol = {assetSymbol}";
            }

            // Use an explicit transaction to ensure both UPDATE and INSERT are atomic
            await using var transaction = await _dbContext.Database.BeginTransactionAsync();
            _logger.LogInformation("Transaction started for UserId {UserId}, Asset {AssetSymbol}, Delta {Delta}", userId, assetSymbol, deltaAmount);
            try
            {
                var affected = await _dbContext.Database.ExecuteSqlInterpolatedAsync(updateSql);

                if (affected > 0)
                {
                    // Create transaction history
                    var tx = new TransactionHistory
                    {
                        UserId = userId,
                        AssetSymbol = assetSymbol,
                        Amount = deltaAmount,
                        Type = deltaAmount > 0 ? TransactionType.DEPOSIT : TransactionType.WITHDRAW,
                        Status = TransactionStatus.COMPLETED,
                        PriceAt = 0m, // unknown in this context
                        CreatedAt = now
                    };

                    await _historyRepository.AddAsync(tx);
                    await _historyRepository.SaveChangesAsync();

                    await transaction.CommitAsync();
                    _logger.LogInformation("Transaction committed for UserId {UserId}", userId);
                    return true;
                }

                await transaction.RollbackAsync();
                _logger.LogInformation("Transaction rolled back for UserId {UserId} - no rows affected", userId);
                return false;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Transaction rolled back due to error for UserId {UserId}", userId);
                throw;
            }
        }
    }
}
