using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WalletApi.DTOs;
using WalletApi.Infrastructure.Data;
using WalletApi.Services;

namespace WalletApi.Controllers;

[ApiController]
[Authorize]
[Route("api/transactions")]
public class FiatController : WalletControllerBase
{
    private readonly WalletDbContext _db;
    private readonly ICurrencyCatalogClient _currencyClient;

    public FiatController(WalletDbContext db, ICurrencyCatalogClient currencyClient, IConfiguration configuration) : base(configuration)
    {
        _db = db;
        _currencyClient = currencyClient;
    }

    [HttpPost("deposit/fiat")]
    public async Task<IActionResult> DepositFiat([FromBody] DepositFiatRequest dto)
    {
        var u3 = GetUserGuid();
        if (u3 == null) return Unauthorized();
        var userGuid = u3.Value;

        var account = await _db.Accounts.FirstOrDefaultAsync(a => a.IdUser == userGuid);
        if (account == null)
        {
            account = new WalletApi.Domain.Entities.Account { IdAccount = Guid.NewGuid(), IdUser = userGuid, AvailableBalance = 0, LockedBalance = 0, Status = "ACTIVE" };
            await _db.Accounts.AddAsync(account);
        }

        var symbol = (dto.Currency ?? string.Empty).Trim().ToUpperInvariant();
        if (string.IsNullOrEmpty(symbol))
        {
            return BadRequest(new { message = "Moeda obrigatória" });
        }

        var currency = await _currencyClient.GetBySymbolAsync(symbol);
        if (currency == null)
        {
            return BadRequest(new { message = "Moeda não autorizada pela plataforma" });
        }

        var wallet = await _db.Wallets.FirstOrDefaultAsync(w => w.IdAccount == account.IdAccount);
        if (wallet == null)
        {
            wallet = new WalletApi.Domain.Entities.Wallet { IdWallet = Guid.NewGuid(), IdAccount = account.IdAccount, Name = "Default", CreatedAt = DateTime.UtcNow };
            await _db.Wallets.AddAsync(wallet);
        }

        var tx = new WalletApi.Domain.Entities.Transaction
        {
            IdTransaction = Guid.NewGuid(),
            IdAccount = account.IdAccount,
            Type = "DEPOSIT_FIAT",
            TotalAmount = dto.Amount,
            Fee = 0,
            Status = "COMPLETED",
            CreatedAt = DateTime.UtcNow
        };
        await _db.Transactions.AddAsync(tx);

        var tf = new WalletApi.Domain.Entities.TransactionFiat
        {
            IdTransaction = tx.IdTransaction,
            Provider = dto.Method ?? "INTERNAL",
            PaymentMethod = dto.Method,
            PaymentInfo = dto.ReferenceId,
            ExternalRef = dto.ReferenceId
        };
        await _db.TransactionFiats.AddAsync(tf);

        var position = await _db.WalletPositions.FirstOrDefaultAsync(p => p.IdWallet == wallet.IdWallet && p.IdCurrency == currency.Id);
        if (position == null)
        {
            position = new WalletApi.Domain.Entities.WalletPosition { IdWalletPosition = Guid.NewGuid(), IdWallet = wallet.IdWallet, IdCurrency = currency.Id, Amount = dto.Amount, AvgPrice = 1m, UpdatedAt = DateTime.UtcNow };
            await _db.WalletPositions.AddAsync(position);
        }
        else
        {
            position.Amount += dto.Amount;
            position.UpdatedAt = DateTime.UtcNow;
            _db.WalletPositions.Update(position);
        }

        account.AvailableBalance += dto.Amount;
        _db.Accounts.Update(account);

        await _db.SaveChangesAsync();

        return Ok(new { txId = tx.IdTransaction });
    }

    [HttpPost("withdraw/fiat")]
    public async Task<IActionResult> WithdrawFiat([FromBody] WithdrawFiatRequest dto)
    {
        var u = GetUserGuid();
        if (u == null) return Unauthorized();
        var userGuid = u.Value;

        var account = await _db.Accounts.FirstOrDefaultAsync(a => a.IdUser == userGuid);
        if (account == null) return NotFound(new { message = "Account not found" });

        var currency = await _currencyClient.GetBySymbolAsync(dto.Currency);
        if (currency == null) return NotFound(new { message = "Currency not found" });

        var wallet = await _db.Wallets.FirstOrDefaultAsync(w => w.IdAccount == account.IdAccount);
        if (wallet == null) return NotFound(new { message = "Wallet not found" });

        var position = await _db.WalletPositions.FirstOrDefaultAsync(p => p.IdWallet == wallet.IdWallet && p.IdCurrency == currency.Id);
        if (position == null || position.Amount < dto.Amount) return BadRequest(new { message = "Saldo Insuficiente!" });

        var tx = new WalletApi.Domain.Entities.Transaction
        {
            IdTransaction = Guid.NewGuid(),
            IdAccount = account.IdAccount,
            Type = "WITHDRAW_FIAT",
            TotalAmount = dto.Amount,
            Fee = 0,
            Status = "COMPLETED",
            CreatedAt = DateTime.UtcNow
        };
        await _db.Transactions.AddAsync(tx);

        var tf = new WalletApi.Domain.Entities.TransactionFiat
        {
            IdTransaction = tx.IdTransaction,
            Provider = dto.Method ?? "INTERNAL",
            PaymentMethod = dto.Method,
            PaymentInfo = dto.Destination,
            ExternalRef = null
        };
        await _db.TransactionFiats.AddAsync(tf);

        position.Amount -= dto.Amount;
        position.UpdatedAt = DateTime.UtcNow;
        _db.WalletPositions.Update(position);

        await _db.SaveChangesAsync();

        return Ok(new { txId = tx.IdTransaction });
    }
}
