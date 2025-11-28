using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using WalletApi.DTOs;
using WalletApi.Services;

namespace WalletApi.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class WalletController : ControllerBase
{
    private readonly IWalletService _service;
    private readonly WalletApi.Infrastructure.Data.WalletDbContext _db;

    public WalletController(IWalletService service, WalletApi.Infrastructure.Data.WalletDbContext db)
    {
        _service = service;
        _db = db;
    }

    [HttpPost("buy")]
    public async Task<IActionResult> Buy([FromBody] BuyRequest dto)
    {
        var result = await _service.BuyAsync(dto);
        if (!result.IsSuccess) return BadRequest(result.Error);
        return Ok(result.Data);
    }

    [HttpPost("sell")]
    public async Task<IActionResult> Sell([FromBody] SellRequest dto)
    {
        var result = await _service.SellAsync(dto);
        if (!result.IsSuccess) return BadRequest(result.Error);
        return Ok(result.Data);
    }

    [HttpPost("swap")]
    public async Task<IActionResult> Swap([FromBody] SwapRequest dto)
    {
        var result = await _service.SwapAsync(dto);
        if (!result.IsSuccess) return BadRequest(result.Error);
        return Ok(result.Data);
    }

    // GET api/wallet/wallets?accountId={accountId}
    [HttpGet("wallets")]
    public async Task<IActionResult> GetWallets([FromQuery] Guid? accountId)
    {
        if (accountId == null)
        {
            var all = await _db.Wallets.ToListAsync();
            return Ok(all);
        }
        var list = await _db.Wallets.Where(w => w.IdAccount == accountId).ToListAsync();
        return Ok(list);
    }

    // GET api/wallet/wallets/{id}
    [HttpGet("wallets/{id}")]
    public async Task<IActionResult> GetWalletById(Guid id)
    {
        var w = await _db.Wallets.FindAsync(id);
        if (w == null) return NotFound();
        return Ok(w);
    }

    // GET api/wallet/positions/{walletId}
    [HttpGet("positions/{walletId}")]
    public async Task<IActionResult> GetPositions(Guid walletId)
    {
        var positions = await _db.WalletPositions
            .Where(p => p.IdWallet == walletId)
            .Join(_db.Currencies, p => p.IdCurrency, c => c.IdCurrency, (p, c) => new {
                p.IdWalletPosition,
                p.IdWallet,
                p.IdCurrency,
                CurrencySymbol = c.Symbol,
                CurrencyName = c.Name,
                p.Amount,
                p.AvgPrice,
                p.UpdatedAt
            }).ToListAsync();
        return Ok(positions);
    }

    // GET api/wallet/transactions?accountId={accountId}
    [HttpGet("transactions")]
    public async Task<IActionResult> GetTransactions([FromQuery] Guid? accountId)
    {
        var q = _db.Transactions.AsQueryable();
        if (accountId != null) q = q.Where(t => t.IdAccount == accountId);
        var list = await q.OrderByDescending(t => t.CreatedAt).ToListAsync();
        return Ok(list);
    }

    // GET api/wallet/transactions/{id}
    [HttpGet("transactions/{id}")]
    public async Task<IActionResult> GetTransactionById(Guid id)
    {
        var tx = await _db.Transactions.FindAsync(id);
        if (tx == null) return NotFound();

        var cripto = await _db.TransactionCriptos.FindAsync(id);
        var fiat = await _db.TransactionFiats.FindAsync(id);

        return Ok(new { tx, cripto, fiat });
    }

    // GET api/wallet/currencies
    [AllowAnonymous]
    [HttpGet("currencies")]
    public async Task<IActionResult> GetCurrencies()
    {
        var list = await _db.Currencies.ToListAsync();
        return Ok(list);
    }
}
