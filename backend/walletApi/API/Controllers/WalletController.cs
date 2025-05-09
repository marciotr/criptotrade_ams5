using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using walletApi.Domain.Entities;  
using walletApi.Infrastructure.Data;  
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace walletApi.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class WalletController : ControllerBase
    {
        private readonly WalletDbContext _context;

        public WalletController(WalletDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Wallet>>> GetWallets()
        {
            return await _context.Wallets.ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Wallet>> GetWallet(int id)
        {
            var wallet = await _context.Wallets.FindAsync(id);

            if (wallet == null)
            {
                return NotFound();
            }

            return wallet;
        }

        [HttpGet("user/{userId}")]
        public async Task<ActionResult<IEnumerable<Wallet>>> GetUserWallets(int userId)
        {
            var wallets = await _context.Wallets
                .Where(w => w.UserId == userId)
                .ToListAsync();

            return wallets;
        }

        // Novo endpoint para obter apenas carteiras fiduciárias
        [HttpGet("user/{userId}/fiat")]
        public async Task<ActionResult<IEnumerable<Wallet>>> GetUserFiatWallets(int userId)
        {
            var wallets = await _context.Wallets
                .Where(w => w.UserId == userId && w.Type == WalletType.Fiat)
                .ToListAsync();

            return wallets;
        }

        // Novo endpoint para obter apenas carteiras de criptomoedas
        [HttpGet("user/{userId}/crypto")]
        public async Task<ActionResult<IEnumerable<Wallet>>> GetUserCryptoWallets(int userId)
        {
            var wallets = await _context.Wallets
                .Where(w => w.UserId == userId && w.Type == WalletType.Crypto)
                .ToListAsync();

            return wallets;
        }

        [HttpPost]
        public async Task<ActionResult<Wallet>> CreateWallet(Wallet wallet)
        {
            // Verificar se a carteira já existe para o usuário e moeda
            var existingWallet = await _context.Wallets
                .FirstOrDefaultAsync(w => w.UserId == wallet.UserId && 
                                        w.Currency == wallet.Currency &&
                                        w.Type == wallet.Type);

            if (existingWallet != null)
            {
                return BadRequest($"User already has a {wallet.Type} wallet for {wallet.Currency}");
            }

            _context.Wallets.Add(wallet);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetWallet), new { id = wallet.Id }, wallet);
        }

        // Novo endpoint para depósito fictício em carteira fiduciária
        [HttpPost("deposit/fiat")]
        public async Task<ActionResult<Transaction>> DepositFiat(FiatDepositRequest request)
        {
            try
            {
                using var dbTransaction = await _context.Database.BeginTransactionAsync();
                
                try
                {
                    // In a microservices architecture, we trust the userId coming from the authenticated request
                    // since user verification should happen at the API gateway or auth service level
                    
                    // Step 1: Find or create the wallet
                    var wallet = await _context.Wallets
                        .FirstOrDefaultAsync(w => w.UserId == request.UserId && 
                                                  w.Currency == request.Currency && 
                                                  w.Type == WalletType.Fiat);

                    if (wallet == null)
                    {
                        // Create a new fiat wallet for this currency without checking the Users table
                        wallet = new Wallet
                        {
                            UserId = request.UserId,  // We trust this ID comes from authenticated user
                            Currency = request.Currency,
                            Balance = 0,
                            Type = WalletType.Fiat,
                            CreatedAt = DateTime.UtcNow
                        };

                        _context.Wallets.Add(wallet);
                        await _context.SaveChangesAsync();
                    }

                    // Step 2: Create the transaction
                    var transaction = new Transaction
                    {
                        WalletId = wallet.Id,  // Now we have a valid wallet ID
                        Amount = request.Amount,
                        Currency = request.Currency,
                        Description = $"Deposit via {request.Method}",
                        Type = TransactionType.Deposit,
                        Status = TransactionStatus.Completed,
                        TransactionDate = DateTime.UtcNow,
                        CreatedAt = DateTime.UtcNow
                    };

                    // Step 3: Update wallet balance
                    wallet.Balance += request.Amount;
                    wallet.UpdatedAt = DateTime.UtcNow;
                    
                    // Step 4: Save changes
                    _context.Transactions.Add(transaction);
                    await _context.SaveChangesAsync();
                    
                    // Step 5: Commit transaction
                    await dbTransaction.CommitAsync();

                    return Ok(transaction);
                }
                catch (Exception ex)
                {
                    await dbTransaction.RollbackAsync();
                    throw new Exception($"Error processing deposit: {ex.Message}", ex);
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while processing your deposit", error = ex.Message });
            }
        }

        // Atualizar este método para aceitar transferências entre carteiras
        [HttpPost("transfer")]
        public async Task<ActionResult> TransferBetweenWallets(TransferRequest request)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            
            try
            {
                // Verificar carteira de origem
                var sourceWallet = await _context.Wallets.FindAsync(request.SourceWalletId);
                if (sourceWallet == null)
                {
                    return NotFound("Source wallet not found");
                }

                // Verificar carteira de destino
                var destinationWallet = await _context.Wallets.FindAsync(request.DestinationWalletId);
                if (destinationWallet == null)
                {
                    return NotFound("Destination wallet not found");
                }

                // Verificar se tem saldo suficiente
                if (sourceWallet.Balance < request.Amount)
                {
                    return BadRequest("Insufficient balance in source wallet");
                }

                // Verificar se os usuários são os mesmos
                if (sourceWallet.UserId != destinationWallet.UserId)
                {
                    return BadRequest("Cannot transfer between different users");
                }

                // Debitar da origem
                sourceWallet.Balance -= request.Amount;
                sourceWallet.UpdatedAt = DateTime.UtcNow;

                // Creditar no destino (usando taxa de conversão se for o caso)
                decimal convertedAmount = request.Amount * request.ConversionRate;
                destinationWallet.Balance += convertedAmount;
                destinationWallet.UpdatedAt = DateTime.UtcNow;

                // Registrar transações
                var sourceTransaction = new Transaction
                {
                    WalletId = sourceWallet.Id,
                    Type = TransactionType.Withdrawal,
                    Amount = request.Amount,
                    Currency = sourceWallet.Currency,
                    Description = $"Transfer to {destinationWallet.Currency} wallet",
                    Status = TransactionStatus.Completed,
                    TransactionDate = DateTime.UtcNow
                };

                var destinationTransaction = new Transaction
                {
                    WalletId = destinationWallet.Id,
                    Type = TransactionType.Deposit,
                    Amount = convertedAmount,
                    Currency = destinationWallet.Currency,
                    Description = $"Transfer from {sourceWallet.Currency} wallet",
                    Status = TransactionStatus.Completed,
                    TransactionDate = DateTime.UtcNow
                };

                _context.Transactions.Add(sourceTransaction);
                _context.Transactions.Add(destinationTransaction);

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(new { 
                    message = "Transfer completed successfully",
                    sourceWallet,
                    destinationWallet
                });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, $"Error processing transfer: {ex.Message}");
            }
        }

        // Demais métodos existentes...
    }

    public class FiatDepositRequest
    {
        public int UserId { get; set; }
        public string Currency { get; set; } = "USD";
        public decimal Amount { get; set; }
        public string Method { get; set; } = "Bank Transfer";
    }

    public class TransferRequest
    {
        public int SourceWalletId { get; set; }
        public int DestinationWalletId { get; set; }
        public decimal Amount { get; set; }
        public decimal ConversionRate { get; set; } = 1.0m;
    }
}