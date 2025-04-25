using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using walletApi.Domain.Entities;
using walletApi.Domain.Interfaces;
using walletApi.Application.Services;

namespace walletApi.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class WalletController : ControllerBase
    {
        private readonly IWalletService _walletService;
        
        public WalletController(IWalletService walletService)
        {
            _walletService = walletService;
        }
        
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Wallet>>> GetAllWallets()
        {
            var wallets = await _walletService.GetAllWalletsAsync();
            return Ok(wallets);
        }
        
        [HttpGet("user/{userId}")]
        public async Task<ActionResult<IEnumerable<Wallet>>> GetWalletsByUser(int userId)
        {
            var wallets = await _walletService.GetWalletsByUserIdAsync(userId);
            return Ok(wallets);
        }
        
        [HttpPost]
        public async Task<ActionResult<Wallet>> CreateWallet([FromBody] Wallet wallet)
        {
            try
            {
                var createdWallet = await _walletService.CreateWalletAsync(wallet);
                return CreatedAtAction(nameof(GetWallet), new { id = createdWallet.Id }, createdWallet);
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(ex.Message);
            }
        }
        
        [HttpGet("{id}")]
        public async Task<ActionResult<Wallet>> GetWallet(int id)
        {
            var wallet = await _walletService.GetWalletByIdAsync(id);
            
            if (wallet == null)
                return NotFound();
                
            return Ok(wallet);
        }
        
        [HttpGet("{walletId}/transactions")]
        public async Task<ActionResult<IEnumerable<Transaction>>> GetTransactions(int walletId)
        {
            try
            {
                var transactions = await _walletService.GetTransactionsByWalletIdAsync(walletId);
                return Ok(transactions);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
        }
        
        [HttpPost("{walletId}/transactions")]
        public async Task<ActionResult<Transaction>> AddTransaction(int walletId, [FromBody] Transaction transaction)
        {
            try
            {
                var createdTransaction = await _walletService.AddTransactionAsync(walletId, transaction);
                return CreatedAtAction(nameof(GetTransactions), new { walletId = walletId }, createdTransaction);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}