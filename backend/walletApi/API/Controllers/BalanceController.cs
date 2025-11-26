using System;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Linq;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WalletApi2.API.DTOs;
using WalletApi2.Domain.Interfaces;

namespace WalletApi2.API.Controllers
{
    [ApiController]
    [Route("api/balance")]
    [Authorize]
    public class BalanceController : ControllerBase
    {
        private readonly IAssetBalanceService _assetBalanceService;
        private readonly Microsoft.Extensions.Logging.ILogger<BalanceController> _logger;

        public BalanceController(IAssetBalanceService assetBalanceService, Microsoft.Extensions.Logging.ILogger<BalanceController> logger)
        {
            _assetBalanceService = assetBalanceService;
            _logger = logger;
        }

    // GET api/balance
    [HttpGet]
    public async Task<IActionResult> GetAssetBalances()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (claim == null || string.IsNullOrWhiteSpace(claim.Value))
            {
                _logger.LogWarning("Missing NameIdentifier claim on GET balances");
                return Unauthorized();
            }

            if (!int.TryParse(claim.Value, out var userId))
            {
                _logger.LogWarning("Invalid NameIdentifier claim value on GET balances: {ClaimValue}", claim.Value);
                return Unauthorized();
            }

            var balances = await _assetBalanceService.GetAssetBalancesByUserId(userId);

            var response = balances.Select(b => new AssetBalanceResponse
            {
                AssetSymbol = b.AssetSymbol,
                AvailableAmount = b.AvailableAmount,
                LockedAmount = b.LockedAmount
            }).ToList();

            return Ok(response);
        }

        [HttpPatch("{assetSymbol}")]
        public async Task<IActionResult> AdjustBalance([FromRoute] string assetSymbol, [FromBody] AdjustBalanceRequest request)
        {
            if (request == null) return BadRequest();

            _logger.LogInformation("Adjusting balance for Asset {Asset} with Delta {Delta}", assetSymbol, request.DeltaAmount);

            // Extract user id from JWT claims
            var claim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (claim == null || string.IsNullOrWhiteSpace(claim.Value))
            {
                _logger.LogWarning("Missing NameIdentifier claim");
                return Unauthorized();
            }

            if (!int.TryParse(claim.Value, out var userId))
            {
                _logger.LogWarning("Invalid NameIdentifier claim value: {ClaimValue}", claim.Value);
                return Unauthorized();
            }

            var ok = await _assetBalanceService.AdjustBalanceAtomicAsync(userId, assetSymbol, request.DeltaAmount);

            if (ok) return Ok(new { message = "Balance adjusted" });

            return BadRequest(new { message = "Insufficient funds or operation failed" });
        }
    }
}
