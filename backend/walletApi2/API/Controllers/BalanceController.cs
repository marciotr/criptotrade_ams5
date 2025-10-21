using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WalletApi2.API.DTOs;
using WalletApi2.Domain.Interfaces;

namespace WalletApi2.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
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

        [HttpPatch("{userId:int}")]
        public async Task<IActionResult> AdjustBalance(int userId, [FromBody] AdjustBalanceRequest request)
        {
            if (request == null) return BadRequest();

            _logger.LogInformation("Adjusting balance for UserId {UserId} with Delta {Delta}", userId, request.DeltaAmount);

            // Extract user id from JWT claims
            var claim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (claim == null) return Forbid();

            if (!int.TryParse(claim.Value, out var claimUserId)) return Forbid();

            if (claimUserId != userId) return Unauthorized();

            var ok = await _assetBalanceService.AdjustBalanceAtomicAsync(userId, request.AssetSymbol, request.DeltaAmount);

            if (!ok) return NotFound();

            return Ok();
        }
    }
}
