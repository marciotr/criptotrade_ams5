using System.Net.Http.Json;
using System.Text.Json;
using cryptoApi.DTOs; 

namespace cryptoApi.Infrastructure.ExternalServices
{
    public class BinanceApiClient
    {
        private readonly HttpClient _httpClient;

        public BinanceApiClient(HttpClient httpClient)
        {
            _httpClient = httpClient;
            _httpClient.BaseAddress = new Uri("https://api.binance.com");
        }

        // Preço atual
        public async Task<List<CryptoPriceDTO>> GetAllPricesAsync()
        {
            try
            {
                var response = await _httpClient.GetFromJsonAsync<List<CryptoPriceDTO>>("/api/v3/ticker/price");
                return response ?? new List<CryptoPriceDTO>();
            }
            catch (HttpRequestException ex)
            {
                Console.WriteLine($"Error calling Binance API: {ex.Message}");
                throw;
            }
        }

        // Informações detalhadas 24h
        public async Task<List<CryptoTickerDTO>> Get24hTickersAsync()
        {
            try
            {
                var response = await _httpClient.GetFromJsonAsync<List<CryptoTickerDTO>>("/api/v3/ticker/24hr");
                return response ?? new List<CryptoTickerDTO>();
            }
            catch (HttpRequestException ex)
            {
                Console.WriteLine($"Error getting 24h tickers: {ex.Message}");
                throw;
            }
        }

        // Informações detalhadas de uma criptomoeda específica
        public async Task<CryptoTickerDTO> Get24hTickerAsync(string symbol)
        {
            try
            {
                var response = await _httpClient.GetFromJsonAsync<CryptoTickerDTO>($"/api/v3/ticker/24hr?symbol={symbol.ToUpper()}");
                return response ?? new CryptoTickerDTO();
            }
            catch (HttpRequestException ex)
            {
                Console.WriteLine($"Error getting 24h ticker for {symbol}: {ex.Message}");
                throw;
            }
        }

        // Book de ofertas (profundidade do mercado)
        public async Task<dynamic> GetOrderBookAsync(string symbol, int limit = 100)
        {
            try
            {
                var response = await _httpClient.GetStringAsync($"/api/v3/depth?symbol={symbol}&limit={limit}");
                var result = JsonSerializer.Deserialize<dynamic>(response);
                return result ?? new {}; // Retorna um objeto vazio em vez de null
            }
            catch (HttpRequestException ex)
            {
                Console.WriteLine($"Error calling Binance API: {ex.Message}");
                throw;
            }
        }

        // Últimas negociações
        public async Task<dynamic> GetRecentTradesAsync(string symbol, int limit = 500)
        {
            try
            {
                var response = await _httpClient.GetFromJsonAsync<dynamic>($"/api/v3/trades?symbol={symbol.ToUpper()}&limit={limit}");
                return response;
            }
            catch (HttpRequestException ex)
            {
                Console.WriteLine($"Error getting recent trades for {symbol}: {ex.Message}");
                throw;
            }
        }

        // Klines data
        public async Task<dynamic> GetKlinesAsync(string symbol, string interval, int limit = 500)
        {
            try
            {
                // Ensure the symbol is uppercase and properly formatted
                symbol = symbol.ToUpperInvariant();
                if (!symbol.EndsWith("USDT"))
                {
                    symbol += "USDT";
                }

                // Build query parameters
                var queryParams = new List<string>
                {
                    $"symbol={symbol}",
                    $"interval={interval.ToLower()}", // Binance expects lowercase intervals
                    $"limit={limit}"
                };

                var requestUrl = $"/api/v3/klines?{string.Join("&", queryParams)}";
                
                // Log the request URL for debugging
                Console.WriteLine($"Requesting: {_httpClient.BaseAddress}{requestUrl}");

                var response = await _httpClient.GetAsync(requestUrl);
                
                if (!response.IsSuccessStatusCode)
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    throw new Exception($"Binance API error: {response.StatusCode} - {errorContent}");
                }

                var content = await response.Content.ReadAsStringAsync();
                return JsonSerializer.Deserialize<dynamic>(content);
            }
            catch (Exception ex)
            {
                throw new Exception($"Error fetching klines data: {ex.Message}", ex);
            }
        }

        // Adicione ao BinanceApiClient.cs
        public async Task<dynamic> GetKlinesAsync(string symbol, string interval, int limit = 500, 
                                                 long? startTime = null, long? endTime = null)
        {
            try
            {
                var queryParams = new List<string>
                {
                    $"symbol={symbol}",
                    $"interval={interval}",
                    $"limit={limit}"
                };
                
                if (startTime.HasValue)
                    queryParams.Add($"startTime={startTime}");
                    
                if (endTime.HasValue)
                    queryParams.Add($"endTime={endTime}");
                    
                var queryString = string.Join("&", queryParams);
                var response = await _httpClient.GetStringAsync($"/api/v3/klines?{queryString}");
                
                var result = JsonSerializer.Deserialize<dynamic>(response);
                return result;
            }
            catch (HttpRequestException ex)
            {
                Console.WriteLine($"Error calling Binance API: {ex.Message}");
                throw;
            }
        }
    }
}