namespace WalletApi.Application.Interfaces;

public class CurrencyCatalogItem
{
    public Guid Id { get; set; }
    public Guid IdCurrency => Id;
    public string Symbol { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public decimal CurrentPrice { get; set; }
    public decimal PriceChangePercent { get; set; }

    public bool IsFiat
    {
        get
        {
            var fiatSymbols = new HashSet<string>(StringComparer.OrdinalIgnoreCase) { "USD", "USDT", "USDC", "EUR", "BRL", "GBP", "JPY", "CAD", "AUD" };
            if (!string.IsNullOrEmpty(Symbol) && fiatSymbols.Contains(Symbol)) return true;
            var n = (Name ?? string.Empty).ToLowerInvariant();
            if (n.Contains("dollar") || n.Contains("dólar") || n.Contains("euro") || n.Contains("real") || n.Contains("yen")) return true;
            return false;
        }
    }
}

public interface ICurrencyCatalogClient
{
    Task<CurrencyCatalogItem?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IEnumerable<CurrencyCatalogItem>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<CurrencyCatalogItem?> GetBySymbolAsync(string symbol, CancellationToken cancellationToken = default);
    Task<CurrencyCatalogItem?> CreateAsync(CurrencyCatalogItem item, CancellationToken cancellationToken = default);
}
