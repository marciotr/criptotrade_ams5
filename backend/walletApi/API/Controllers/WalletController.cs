using System.Collections.Generic;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using WalletApi2.API.DTOs;
using WalletApi2.Domain.Interfaces;

namespace WalletApi2.API.Controllers
{
    [ApiController]
    [Route("api/wallets")]
    [Authorize]
    public class WalletController : ControllerBase
    {
        private readonly IWalletService? _walletService;
        private readonly ILogger<WalletController> _logger;

        public WalletController(IWalletService? walletService, ILogger<WalletController> logger)
        {
            _walletService = walletService;
            _logger = logger;
        }

        [HttpPost]
        public IActionResult Create([FromBody] CreateWalletRequest request)
        {
            if (request == null) return BadRequest();

            var mock = new WalletResponse { WalletId = 123, Address = "addr_mock", PublicKey = "pub_mock" };
            return CreatedAtAction(nameof(GetById), new { id = mock.WalletId }, mock);
        }

        [HttpGet]
        public IActionResult List()
        {
            var list = new List<WalletResponse>
            {
                new WalletResponse { WalletId = 1, Address = "addr1", PublicKey = "pub1" },
                new WalletResponse { WalletId = 2, Address = "addr2", PublicKey = "pub2" }
            };

            return Ok(list);
        }

        [HttpGet("{id}")]
        public IActionResult GetById(int id)
        {
            var resp = new WalletResponse { WalletId = id, Address = "addr_specific", PublicKey = "pub_specific" };
            return Ok(resp);
        }

        [HttpPatch("{id}")]
        public IActionResult Patch(int id, [FromBody] UpdateWalletRequest request)
        {
            if (request == null) return BadRequest();
            return Ok(new { message = "Wallet updated", id, newName = request.NewName });
        }

        [HttpPost("transfer")]
        public IActionResult Transfer([FromBody] TransferRequest request)
        {
            if (request == null) return BadRequest();
            return Ok(new { message = "Transfer scheduled (mock)", request.FromWalletId, request.ToWalletId, request.AssetSymbol, request.Amount });
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            return NoContent();
        }
    }
}
