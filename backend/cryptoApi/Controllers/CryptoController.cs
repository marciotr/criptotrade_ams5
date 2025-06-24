using Microsoft.AspNetCore.Mvc;
using cryptoApi.Application.Interfaces;
using cryptoApi.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Globalization;

namespace cryptoApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CryptoController : ControllerBase
    {
        private readonly ICryptoService _cryptoService;

        public CryptoController(ICryptoService cryptoService)
        {
            _cryptoService = cryptoService;
        }

        [HttpGet("prices")]
        public async Task<IActionResult> GetAllPrices()
        {
            var prices = await _cryptoService.GetAllPricesAsync();
            return Ok(prices);
        }

        [HttpGet("tickers")]
        public async Task<IActionResult> Get24hTickers()
        {
            var tickers = await _cryptoService.Get24hTickersAsync();
            return Ok(tickers);
        }

        [HttpGet("ticker/{symbol}")]
        public async Task<IActionResult> Get24hTicker(string symbol)
        {
            var ticker = await _cryptoService.Get24hTickerAsync(symbol);
            return Ok(ticker);
        }

        [HttpGet("orderbook/{symbol}")]
        public async Task<IActionResult> GetOrderBook(string symbol, [FromQuery] int limit = 100)
        {
            var orderBook = await _cryptoService.GetOrderBookAsync(symbol, limit);
            return Ok(orderBook);
        }

        [HttpGet("trades/{symbol}")]
        public async Task<IActionResult> GetRecentTrades(string symbol, [FromQuery] int limit = 500)
        {
            var trades = await _cryptoService.GetRecentTradesAsync(symbol, limit);
            return Ok(trades);
        }

        [HttpGet("klines/{symbol}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> GetKlines(
            [FromRoute] string symbol,
            [FromQuery] string interval = "15m",
            [FromQuery] int limit = 500)
        {
            // Valid intervals according to Binance API docs
            var validIntervals = new[] {
                "1m", "3m", "5m", "15m", "30m",
                "1h", "2h", "4h", "6h", "8h", "12h",
                "1d", "3d", "1w", "1M"
            };

            if (string.IsNullOrWhiteSpace(symbol))
            {
                return BadRequest("Symbol cannot be empty");
            }

            if (!validIntervals.Contains(interval.ToLower()))
            {
                return BadRequest($"Invalid interval. Valid intervals are: {string.Join(", ", validIntervals)}");
            }

            if (limit <= 0 || limit > 1000)
            {
                return BadRequest("Limit must be between 1 and 1000");
            }

            try
            {
                var klines = await _cryptoService.GetKlinesAsync(symbol, interval, limit);
                return Ok(klines);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error fetching klines: {ex.Message}");
            }
        }

        [HttpGet("health")]
        public IActionResult Health()
        {
            return Ok(new
            {
                status = "healthy",
                service = "crypto",
                timestamp = DateTime.UtcNow
            });
        }

        [HttpGet("gainers")]
        public async Task<IActionResult> GetTopGainers([FromQuery] int limit = 10)
        {
            try
            {
                var tickers = await _cryptoService.Get24hTickersAsync();
                if (tickers == null || !tickers.Any())
                    return Ok(new List<CryptoTickerDTO>());

                // Filtra pares que terminam em USDT com variação positiva já como decimal
                var gainers = tickers
                    .Where(t => t.Symbol?.EndsWith("USDT") == true && t.PriceChangePercent > 0)
                    .OrderByDescending(t => t.PriceChangePercent)
                    .Take(limit)
                    .ToList();

                return Ok(gainers);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error fetching gainers: {ex.Message}");
            }
        }

        [HttpGet("losers")]
        public async Task<IActionResult> GetTopLosers([FromQuery] int limit = 10)
        {
            try
            {
                var tickers = await _cryptoService.Get24hTickersAsync();
                if (tickers == null || !tickers.Any())
                    return Ok(new List<CryptoTickerDTO>());

                // Filtra pares USDT com variação negativa diretamente em decimal
                var losers = tickers
                    .Where(t => t.Symbol?.EndsWith("USDT") == true && t.PriceChangePercent < 0)
                    .OrderBy(t => t.PriceChangePercent)
                    .Take(limit)
                    .ToList();

                return Ok(losers);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error fetching losers: {ex.Message}");
            }
        }

        [HttpGet("trending")]
        public async Task<IActionResult> GetTrending([FromQuery] int limit = 10)
        {
            try
            {
                var tickers = await _cryptoService.Get24hTickersAsync();
                if (tickers == null || !tickers.Any())
                    return Ok(new List<CryptoTickerDTO>());

                // Ordena diretamente pelo volume cotado (QuoteVolume) como decimal
                var trending = tickers
                    .Where(t => t.Symbol?.EndsWith("USDT") == true)
                    .OrderByDescending(t => t.QuoteVolume)
                    .Take(limit)
                    .ToList();

                return Ok(trending);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error fetching trending: {ex.Message}");
            }
        }

    }
}