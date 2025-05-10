using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using walletApi.API.DTOs;
using walletApi.Domain.Interfaces;  // <-- IWalletFiatService

namespace walletApi.API.Controllers
{
    [ApiController]
    [Route("api/[controller]/fiat")]
    public class WalletFiatController : ControllerBase
    {
        private readonly IWalletFiatService _service;   // interface

        public WalletFiatController(IWalletFiatService service)  // uso da interface
        {
            _service = service;
        }

        [HttpGet("{userId}")]
        public async Task<IActionResult> GetUserFiatWallets(int userId)
        {
            var wallets = await _service.GetUserWallets(userId);
            var dtos = wallets.Select(w => new WalletFiatDTO {
                Id       = w.Id,
                UserId   = w.UserId,
                Currency = w.Currency,
                Balance  = w.Balance
            });
            return Ok(dtos);
        }

        [HttpPost]
        public async Task<IActionResult> Create(CreateWalletFiatDTO input)
        {
            var w = await _service.Create(input.UserId, input.Currency);
            return CreatedAtAction(nameof(GetUserFiatWallets), new { userId = w.UserId }, new WalletFiatDTO {
                Id = w.Id,
                UserId = w.UserId,
                Currency = w.Currency,
                Balance = w.Balance
            });
        }

        [HttpPatch("{walletId}/balance")]
        public async Task<IActionResult> AdjustBalance(int walletId, [FromQuery] decimal delta)
        {
            var w = await _service.AdjustBalance(walletId, delta);
            return Ok(new { w.Id, w.Balance });
        }
    }
}