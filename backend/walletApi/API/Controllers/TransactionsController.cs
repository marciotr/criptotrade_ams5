using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WalletApi.API.DTOs;
using WalletApi.Application.Interfaces;
using WalletApi.Infrastructure.Data;

namespace WalletApi.API.Controllers;

[ApiController]
[Authorize]
[Route("api/transactions")]
public class TransactionsController : WalletControllerBase
{
    private readonly IWalletService _service;
    private readonly WalletDbContext _db;

    public TransactionsController(IWalletService service, WalletDbContext db, IConfiguration configuration) : base(configuration)
    {
        _service = service;
        _db = db;
    }

    [HttpPost("buy")]
    public async Task<IActionResult> Buy([FromBody] BuyRequest dto)
    {
        var u = GetUserGuid();
        if (u != null)
        {
            var userGuid = u.Value;
            var account = await _db.Accounts.FirstOrDefaultAsync(a => a.IdUser == userGuid);
            if (account != null)
            {
                if (dto.IdAccount == Guid.Empty) dto.IdAccount = account.IdAccount;
                if (dto.IdWallet == Guid.Empty)
                {
                    var w = await _db.Wallets.FirstOrDefaultAsync(x => x.IdAccount == account.IdAccount);
                    if (w != null) dto.IdWallet = w.IdWallet;
                }
            }
        }

        var result = await _service.BuyAsync(dto);
        if (!result.IsSuccess) return BadRequest(result.Error);
        return Ok(result.Data);
    }

    [HttpPost("sell")]
    public async Task<IActionResult> Sell([FromBody] SellRequest dto)
    {
        var u2 = GetUserGuid();
        if (u2 != null)
        {
            var userGuid = u2.Value;
            var account = await _db.Accounts.FirstOrDefaultAsync(a => a.IdUser == userGuid);
            if (account != null)
            {
                if (dto.IdAccount == Guid.Empty) dto.IdAccount = account.IdAccount;
                if (dto.IdWallet == Guid.Empty)
                {
                    var w = await _db.Wallets.FirstOrDefaultAsync(x => x.IdAccount == account.IdAccount);
                    if (w != null) dto.IdWallet = w.IdWallet;
                }
            }
        }

        var result = await _service.SellAsync(dto);
        if (!result.IsSuccess) return BadRequest(result.Error);
        return Ok(result.Data);
    }

    [HttpPost("swap")]
    public async Task<IActionResult> Swap([FromBody] SwapRequest dto)
    {
        var u3 = GetUserGuid();
        if (u3 != null)
        {
            var userGuid = u3.Value;
            var account = await _db.Accounts.FirstOrDefaultAsync(a => a.IdUser == userGuid);
            if (account != null)
            {
                if (dto.IdAccount == Guid.Empty) dto.IdAccount = account.IdAccount;
                if (dto.IdWallet == Guid.Empty)
                {
                    var w = await _db.Wallets.FirstOrDefaultAsync(x => x.IdAccount == account.IdAccount);
                    if (w != null) dto.IdWallet = w.IdWallet;
                }
            }
        }

        var result = await _service.SwapAsync(dto);
        if (!result.IsSuccess) return BadRequest(result.Error);
        return Ok(result.Data);
    }

    [HttpGet]
    public async Task<IActionResult> GetTransactions([FromQuery] Guid? accountId)
    {
        var q = _db.Transactions.AsQueryable();
        if (accountId != null) q = q.Where(t => t.IdAccount == accountId);
        var list = await q.OrderByDescending(t => t.CreatedAt).ToListAsync();
        return Ok(list);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetTransactionById(Guid id)
    {
        var tx = await _db.Transactions.FindAsync(id);
        if (tx == null) return NotFound();

        var cripto = await _db.TransactionCriptos.FindAsync(id);
        var fiat = await _db.TransactionFiats.FindAsync(id);

        return Ok(new { tx, cripto, fiat });
    }

    [HttpPost]
    public async Task<IActionResult> CreateTransaction([FromBody] dynamic payload)
    {
        try
        {
            Guid accountId = Guid.Empty;
            if (payload.IdAccount != null) accountId = Guid.Parse((string)payload.IdAccount.ToString());

            var tx = new WalletApi.Domain.Entities.Transaction
            {
                IdTransaction = Guid.NewGuid(),
                IdAccount = accountId,
                Type = payload.Type ?? "GENERIC",
                TotalAmount = payload.TotalAmount != null ? (decimal)payload.TotalAmount : 0m,
                Fee = payload.Fee != null ? (decimal)payload.Fee : 0m,
                Status = payload.Status ?? "PENDING",
                CreatedAt = DateTime.UtcNow
            };

            await _db.Transactions.AddAsync(tx);
            await _db.SaveChangesAsync();
            return Ok(new { txId = tx.IdTransaction });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }
}
