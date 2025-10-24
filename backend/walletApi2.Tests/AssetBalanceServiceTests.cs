using System;
using System.Threading.Tasks;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using WalletApi2.Domain.Entities;
using WalletApi2.Domain.Enums;
using WalletApi2.Infrastructure;
using WalletApi2.Infrastructure.Repositories;
using WalletApi2.Services;
using Microsoft.Extensions.Logging;
using Xunit;

namespace WalletApi2.Tests
{
    public class AssetBalanceServiceTests : IDisposable
    {
        private readonly SqliteConnection _connection;
        private readonly WalletDbContext _dbContext;
    private readonly ListLogger<AssetBalanceService> _logger;

        public AssetBalanceServiceTests()
        {
            // Create and open SQLite in-memory connection. Keep it open for the lifetime of the test class.
            _connection = new SqliteConnection("DataSource=:memory:");
            _connection.Open();

            var options = new DbContextOptionsBuilder<WalletDbContext>()
                .UseSqlite(_connection)
                .Options;

            _dbContext = new WalletDbContext(options);

            // create an in-memory list logger to capture messages
            _logger = new ListLogger<AssetBalanceService>();

            // Ensure database schema is created based on the model (migrations not required for tests)
            _dbContext.Database.EnsureCreated();
        }

        [Fact]
        public async Task AdjustBalanceAtomicAsync_PositiveDelta_SucceedsAndRecordsTransaction()
        {
            // Arrange: insert initial balance for UserId 101, BTC = 100
            var initial = new UserAssetBalance
            {
                UserId = 101,
                AssetSymbol = "BTC",
                AvailableAmount = 100m,
                LockedAmount = 0m,
                AverageAcquisitionPrice = 0m,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _dbContext.UserAssetBalances.AddAsync(initial);
            await _dbContext.SaveChangesAsync();

            // Create repository and service instances using the test DbContext
            var historyRepo = new GenericRepository<TransactionHistory>(_dbContext);
            var service = new AssetBalanceService(_dbContext, historyRepo, _logger);

            // Act: adjust balance by +50
            var result = await service.AdjustBalanceAtomicAsync(101, "BTC", 50m);

            // Assert: operation returned true
            Assert.True(result);

            // Reload the balance from the database
            var balance = await _dbContext.UserAssetBalances.SingleAsync(b => b.UserId == 101 && b.AssetSymbol == "BTC");
            Assert.Equal(150m, balance.AvailableAmount);

            // Assert transaction history entry exists with Amount = 50 (exactly one record)
            var historyEntries = await _dbContext.TransactionHistories.ToListAsync();
            Assert.Single(historyEntries);
            var tx = historyEntries[0];
            Assert.Equal(50m, tx.Amount);
            Assert.Equal(TransactionStatus.COMPLETED, tx.Status);

            // Ensure no rollback message was logged
            var logs = _logger.LogEntries;
            Assert.DoesNotContain(logs, l => l.Contains("Transaction rolled back"));
        }

        [Fact]
        public async Task AdjustBalanceAtomicAsync_NegativeDeltaInsufficientFunds_FailsAndRollsBack()
        {
            // Arrange: insert initial balance for UserId 101, BTC = 100
            var initial = new UserAssetBalance
            {
                UserId = 101,
                AssetSymbol = "BTC",
                AvailableAmount = 100m,
                LockedAmount = 0m,
                AverageAcquisitionPrice = 0m,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _dbContext.UserAssetBalances.AddAsync(initial);
            await _dbContext.SaveChangesAsync();

            var historyRepo = new GenericRepository<TransactionHistory>(_dbContext);
            var service = new AssetBalanceService(_dbContext, historyRepo, NullLogger<AssetBalanceService>.Instance);

            // Act: try to withdraw 150 (delta = -150)
            var result = await service.AdjustBalanceAtomicAsync(101, "BTC", -150m);

            // Assert: should return false
            Assert.False(result);

            // Balance should remain unchanged
            var balance = await _dbContext.UserAssetBalances.SingleAsync(b => b.UserId == 101 && b.AssetSymbol == "BTC");
            Assert.Equal(100m, balance.AvailableAmount);

            // No transaction history entries should be created
            var historyEntries = await _dbContext.TransactionHistories.ToListAsync();
            Assert.Empty(historyEntries);
        }

        [Fact]
        public async Task AdjustBalanceAtomicAsync_UserNotFound_ReturnsFalseAndNoChange()
        {
            // Arrange: ensure no user with id 999 exists
            // (Db is empty at this point in the test class lifecycle)

            var historyRepo = new GenericRepository<TransactionHistory>(_dbContext);
            var service = new AssetBalanceService(_dbContext, historyRepo, NullLogger<AssetBalanceService>.Instance);

            // Act: try to adjust balance for non-existent user
            var result = await service.AdjustBalanceAtomicAsync(999, "BTC", 50m);

            // Assert: should return false
            Assert.False(result);

            // No transaction history entries should be created
            var historyEntries = await _dbContext.TransactionHistories.ToListAsync();
            Assert.Empty(historyEntries);
        }

        public void Dispose()
        {
            _dbContext?.Dispose();
            _connection?.Close();
            _connection?.Dispose();
        }
    }

    // Simple in-memory logger to capture log messages during tests
    public class ListLogger<T> : ILogger<T>
    {
        public System.Collections.Generic.List<string> LogEntries { get; } = new();

        public IDisposable BeginScope<TState>(TState state) => NullScope.Instance;

        public bool IsEnabled(LogLevel logLevel) => true;

        public void Log<TState>(LogLevel logLevel, EventId eventId, TState state, Exception? exception, Func<TState, Exception?, string> formatter)
        {
            try
            {
                var message = formatter(state, exception);
                if (exception != null) message += " | Exception: " + exception.Message;
                LogEntries.Add(message);
            }
            catch
            {
                // ignore logging failures in tests
            }
        }

        private class NullScope : IDisposable
        {
            public static NullScope Instance { get; } = new NullScope();
            public void Dispose() { }
        }
    }
}
