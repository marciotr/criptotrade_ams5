#nullable enable

using System;
using System.Linq;
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

            // Create service instance using the test DbContext
            var service = new AssetBalanceService(_dbContext, _logger);

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

            var service = new AssetBalanceService(_dbContext, NullLogger<AssetBalanceService>.Instance);

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

            var service = new AssetBalanceService(_dbContext, NullLogger<AssetBalanceService>.Instance);

            // Act: try to adjust balance for non-existent user
            var result = await service.AdjustBalanceAtomicAsync(999, "BTC", 50m);

            // Assert: should return false
            Assert.False(result);

            // No transaction history entries should be created
            var historyEntries = await _dbContext.TransactionHistories.ToListAsync();
            Assert.Empty(historyEntries);
        }

        [Fact]
        public async Task AdjustBalanceAtomicAsync_ConcurrentDebits_PreventsLostUpdate()
        {
            // Use a shared in-memory SQLite database (file:...;cache=shared) so multiple
            // connections can open and transact concurrently without nested-transaction errors.
            const string connStr = "Data Source=file:concurrentTest?mode=memory&cache=shared";

            // Master connection keeps the in-memory DB alive for the duration of the test
            using var masterConn = new SqliteConnection(connStr);
            await masterConn.OpenAsync();

            var masterOptions = new DbContextOptionsBuilder<WalletDbContext>()
                .UseSqlite(masterConn)
                .Options;

            // Create schema and seed initial balance using the master context
            using (var masterCtx = new WalletDbContext(masterOptions))
            {
                await masterCtx.Database.EnsureCreatedAsync();

                var initial = new UserAssetBalance
                {
                    UserId = 101,
                    AssetSymbol = "BTC",
                    AvailableAmount = 1000m,
                    LockedAmount = 0m,
                    AverageAcquisitionPrice = 0m,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                await masterCtx.UserAssetBalances.AddAsync(initial);
                await masterCtx.SaveChangesAsync();

                // Parameters: 100 concurrent debits of -10 each -> total 100 * 10 = 1000
                const int concurrentOps = 100;
                const decimal delta = -10m;

                // Act: run many concurrent tasks each using its own DbContext/connection instance
                var tasks = new Task<bool>[concurrentOps];
                for (int i = 0; i < concurrentOps; i++)
                {
                    tasks[i] = Task.Run(async () =>
                    {
                        // Each task opens its own connection to the shared in-memory DB
                        await using var conn = new SqliteConnection(connStr);
                        await conn.OpenAsync();

                        var options = new DbContextOptionsBuilder<WalletDbContext>()
                            .UseSqlite(conn)
                            .Options;

                        await using var ctx = new WalletDbContext(options);
                        var svc = new AssetBalanceService(ctx, NullLogger<AssetBalanceService>.Instance);
                        return await svc.AdjustBalanceAtomicAsync(101, "BTC", delta);
                    });
                }

                var results = await Task.WhenAll(tasks);

                // Force EF to refresh tracked state so we read the committed values from the DB
                masterCtx.ChangeTracker.Clear();

                // Assert 1: final balance should be 0 (1000 - 100 * 10)
                var balance = await masterCtx.UserAssetBalances.SingleAsync(b => b.UserId == 101 && b.AssetSymbol == "BTC");
                Assert.Equal(0m, balance.AvailableAmount);

                // Assert 2: exactly 100 calls succeeded
                var successCount = results.Count(r => r);
                Assert.Equal(concurrentOps, successCount);

                // Assert 3: exactly 100 transaction history records created
                var historyEntries = await masterCtx.TransactionHistories.ToListAsync();
                Assert.Equal(concurrentOps, historyEntries.Count);
            }
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

    public IDisposable BeginScope<TState>(TState state) where TState : notnull => NullScope.Instance;

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

#nullable disable
