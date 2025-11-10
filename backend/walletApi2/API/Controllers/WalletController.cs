using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using WalletApi2.API.DTOs;
using WalletApi2.Domain.Interfaces;

namespace WalletApi2.API.Controllers
{
    [ApiController]
    [Route("api/wallet")]
    [Authorize]
    public class WalletController : ControllerBase
    {
        private readonly IWalletService _walletService;
        private readonly ILogger<WalletController> _logger;

        public WalletController(IWalletService walletService, ILogger<WalletController> logger)
        {
            _walletService = walletService;
            _logger = logger;
        }

        [HttpPost]
        public async Task<IActionResult> CreateWallet()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (claim == null || string.IsNullOrWhiteSpace(claim.Value))
            {
                _logger.LogWarning("Missing NameIdentifier claim on CreateWallet");
                return Unauthorized();
            }

            if (!int.TryParse(claim.Value, out var userId))
            {
                _logger.LogWarning("Invalid NameIdentifier claim value on CreateWallet: {ClaimValue}", claim.Value);
                return Unauthorized();
            }

            var wallet = await _walletService.CreateWalletForUserAsync(userId);
            if (wallet == null) return BadRequest(new { message = "Unable to create wallet" });

            var resp = new WalletResponse
            {
                WalletId = wallet.Id,
                Address = wallet.Address,
                PublicKey = wallet.PublicKey
            };

            return Ok(resp);
        }

        [HttpGet]
        public async Task<IActionResult> GetWallet()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (claim == null || string.IsNullOrWhiteSpace(claim.Value))
            {
                _logger.LogWarning("Missing NameIdentifier claim on GetWallet");
                return Unauthorized();
            }

            if (!int.TryParse(claim.Value, out var userId))
            {
                _logger.LogWarning("Invalid NameIdentifier claim value on GetWallet: {ClaimValue}", claim.Value);
                return Unauthorized();
            }

            var wallet = await _walletService.GetWalletByUserIdAsync(userId);
            if (wallet == null) return NotFound();

            var resp = new WalletResponse
            {
                WalletId = wallet.Id,
                Address = wallet.Address,
                PublicKey = wallet.PublicKey
            };

            return Ok(resp);
        }
    }
}
