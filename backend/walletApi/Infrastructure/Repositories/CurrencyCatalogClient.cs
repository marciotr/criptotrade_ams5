using System.Net.Http.Json;
using WalletApi.Application.Interfaces;

namespace WalletApi.Infrastructure.Repositories;

public class CurrencyCatalogClient : ICurrencyCatalogClient
{
    private readonly HttpClient _httpClient;

    public CurrencyCatalogClient(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    public async Task<CurrencyCatalogItem?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        try
        {
            var response = await _httpClient.GetAsync($"/currency/{id}", cancellationToken);
            if (!response.IsSuccessStatusCode) return null;

            var body = await response.Content.ReadAsStringAsync(cancellationToken);
            if (string.IsNullOrWhiteSpace(body)) return null;

            try
            {
                using var doc = System.Text.Json.JsonDocument.Parse(body);
                var root = doc.RootElement;

                // Sevieria: a API pode retornar { value: { ... } } ou diretamente { ... }
                System.Text.Json.JsonElement obj;
                if (root.ValueKind == System.Text.Json.JsonValueKind.Object && root.TryGetProperty("value", out var valueProp) && valueProp.ValueKind == System.Text.Json.JsonValueKind.Object)
                {
                    obj = valueProp;
                }
                else if (root.ValueKind == System.Text.Json.JsonValueKind.Object)
                {
                    obj = root;
                }
                else
                {
                    var all = await GetAllAsync(cancellationToken);
                    return all.FirstOrDefault(c => c.Id == id);
                }

                // id
                Guid rid = id;
                if (obj.TryGetProperty("id", out var idProp) && idProp.ValueKind == System.Text.Json.JsonValueKind.String)
                {
                    Guid.TryParse(idProp.GetString(), out rid);
                }
                else if (obj.TryGetProperty("Id", out var idProp2) && idProp2.ValueKind == System.Text.Json.JsonValueKind.String)
                {
                    Guid.TryParse(idProp2.GetString(), out rid);
                }

                // symbol/name
                string sym = string.Empty;
                if (obj.TryGetProperty("symbol", out var s1) && s1.ValueKind == System.Text.Json.JsonValueKind.String) sym = s1.GetString() ?? string.Empty;
                else if (obj.TryGetProperty("Symbol", out var s2) && s2.ValueKind == System.Text.Json.JsonValueKind.String) sym = s2.GetString() ?? string.Empty;

                string name = string.Empty;
                if (obj.TryGetProperty("name", out var n1) && n1.ValueKind == System.Text.Json.JsonValueKind.String) name = n1.GetString() ?? string.Empty;
                else if (obj.TryGetProperty("Name", out var n2) && n2.ValueKind == System.Text.Json.JsonValueKind.String) name = n2.GetString() ?? string.Empty;

                decimal currentPrice = 0m;
                decimal priceChangePercent = 0m;
                if (obj.TryGetProperty("histories", out var hProp) && hProp.ValueKind == System.Text.Json.JsonValueKind.Array)
                {
                    decimal firstPrice = 0m;
                    decimal lastPrice = 0m;
                    bool firstSet = false;
                    foreach (var h in hProp.EnumerateArray())
                    {
                        // suporta tanto objeto { value: X, when: ... } quanto números/strings simples
                        decimal val = 0m;
                        if (h.ValueKind == System.Text.Json.JsonValueKind.Object && h.TryGetProperty("value", out var vprop))
                        {
                            if (vprop.ValueKind == System.Text.Json.JsonValueKind.Number) val = vprop.GetDecimal();
                            else if (vprop.ValueKind == System.Text.Json.JsonValueKind.String) Decimal.TryParse(vprop.GetString(), out val);
                        }
                        else if (h.ValueKind == System.Text.Json.JsonValueKind.Number) val = h.GetDecimal();
                        else if (h.ValueKind == System.Text.Json.JsonValueKind.String) Decimal.TryParse(h.GetString(), out val);

                        if (val > 0)
                        {
                            if (!firstSet) { firstPrice = val; firstSet = true; }
                            lastPrice = val;
                        }
                    }

                    if (lastPrice > 0) currentPrice = lastPrice;
                    if (firstPrice > 0 && lastPrice > 0 && firstPrice != lastPrice)
                    {
                        priceChangePercent = ((lastPrice - firstPrice) / firstPrice) * 100m;
                    }
                }

                // tenta ler mudança explícita de 24h se presente no objeto (substitui o valor calculado)
                if (obj.TryGetProperty("priceChangePercent", out var pcp) && (pcp.ValueKind == System.Text.Json.JsonValueKind.Number || pcp.ValueKind == System.Text.Json.JsonValueKind.String))
                {
                    if (pcp.ValueKind == System.Text.Json.JsonValueKind.Number) priceChangePercent = pcp.GetDecimal();
                    else Decimal.TryParse(pcp.GetString(), out priceChangePercent);
                }

                var isFiatGuess = new HashSet<string>(StringComparer.OrdinalIgnoreCase) { "USD", "USDT", "USDC", "EUR", "BRL", "GBP", "JPY", "CAD", "AUD" };
                if (currentPrice == 0m && !string.IsNullOrEmpty(sym) && isFiatGuess.Contains(sym)) currentPrice = 1.0m;

                // Se ainda zero e parecer um símbolo de cripto, tenta buscar o ticker de mercado via gateway
                try
                {
                    if (currentPrice == 0m && !string.IsNullOrEmpty(sym) && !isFiatGuess.Contains(sym))
                    {
                        var pair = sym.ToUpperInvariant() + "USDT";
                        var resp = await _httpClient.GetAsync($"/crypto/ticker/{pair}", cancellationToken);
                        if (resp.IsSuccessStatusCode)
                        {
                            var txt = await resp.Content.ReadAsStringAsync(cancellationToken);
                            try
                            {
                                using var doc2 = System.Text.Json.JsonDocument.Parse(txt);
                                var r2 = doc2.RootElement;
                                if (r2.ValueKind == System.Text.Json.JsonValueKind.Object)
                                {
                                    if (r2.TryGetProperty("lastPrice", out var lp3))
                                    {
                                        if (lp3.ValueKind == System.Text.Json.JsonValueKind.Number) currentPrice = lp3.GetDecimal();
                                        else if (lp3.ValueKind == System.Text.Json.JsonValueKind.String) { if (Decimal.TryParse(lp3.GetString(), out var p3)) currentPrice = p3; }
                                    }
                                    else if (r2.TryGetProperty("LastPrice", out var lp4))
                                    {
                                        if (lp4.ValueKind == System.Text.Json.JsonValueKind.Number) currentPrice = lp4.GetDecimal();
                                        else if (lp4.ValueKind == System.Text.Json.JsonValueKind.String) { if (Decimal.TryParse(lp4.GetString(), out var p4)) currentPrice = p4; }
                                    }
                                    // também tenta ler a porcentagem de mudança a partir do ticker
                                    if (r2.TryGetProperty("priceChangePercent", out var pcpTicker))
                                    {
                                        if (pcpTicker.ValueKind == System.Text.Json.JsonValueKind.Number) priceChangePercent = pcpTicker.GetDecimal();
                                        else Decimal.TryParse(pcpTicker.GetString(), out priceChangePercent);
                                    }
                                }
                            }
                            catch { /* ignora erros de parse */ }
                        }
                    }
                }
                catch { /* ignore network errors */ }

                return new CurrencyCatalogItem { Id = rid, Symbol = sym, Name = name, CurrentPrice = currentPrice, PriceChangePercent = priceChangePercent };
            }
            catch (System.Text.Json.JsonException je)
            {
                Console.WriteLine($"[CurrencyCatalogClient] GetByIdAsync JSON parse failed: {je.Message}");
                var all = await GetAllAsync(cancellationToken);
                return all.FirstOrDefault(c => c.Id == id);
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[CurrencyCatalogClient] GetByIdAsync failed: {ex.Message}");
            try
            {
                var all = await GetAllAsync(cancellationToken);
                return all.FirstOrDefault(c => c.Id == id);
            }
            catch (Exception ex2)
            {
                Console.WriteLine($"[CurrencyCatalogClient] GetByIdAsync fallback failed: {ex2.Message}");
                return null;
            }
        }
    }

    public async Task<IEnumerable<CurrencyCatalogItem>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            var resp = await _httpClient.GetAsync("/currency", cancellationToken);
            if (!resp.IsSuccessStatusCode) return Enumerable.Empty<CurrencyCatalogItem>();

            // Lê o corpo da resposta como texto e faz parse robusto para suportar
            // tanto um array JSON direto quanto um objeto envelope como { value: [...] }
            var body = await resp.Content.ReadAsStringAsync(cancellationToken);
            if (string.IsNullOrWhiteSpace(body)) return Enumerable.Empty<CurrencyCatalogItem>();

            var mapped = new List<CurrencyCatalogItem>();
            try
            {
                using var doc = System.Text.Json.JsonDocument.Parse(body);
                System.Text.Json.JsonElement root = doc.RootElement;

                System.Text.Json.JsonElement arrayElement;
                if (root.ValueKind == System.Text.Json.JsonValueKind.Array)
                {
                    arrayElement = root;
                }
                else if (root.ValueKind == System.Text.Json.JsonValueKind.Object && root.TryGetProperty("value", out var v) && v.ValueKind == System.Text.Json.JsonValueKind.Array)
                {
                    arrayElement = v;
                }
                else
                {
                    return Enumerable.Empty<CurrencyCatalogItem>();
                }

                foreach (var json in arrayElement.EnumerateArray())
            {
                try
                {
                        Guid rid = Guid.Empty;
                        if (json.TryGetProperty("id", out var idProp) && idProp.ValueKind == System.Text.Json.JsonValueKind.String)
                        {
                            Guid.TryParse(idProp.GetString(), out rid);
                        }
                        if (rid == Guid.Empty && json.TryGetProperty("Id", out var idProp2) && idProp2.ValueKind == System.Text.Json.JsonValueKind.String)
                        {
                            Guid.TryParse(idProp2.GetString(), out rid);
                        }

                        string sym = string.Empty;
                        if (json.TryGetProperty("symbol", out var s1) && s1.ValueKind == System.Text.Json.JsonValueKind.String) sym = s1.GetString() ?? string.Empty;
                        else if (json.TryGetProperty("Symbol", out var s2) && s2.ValueKind == System.Text.Json.JsonValueKind.String) sym = s2.GetString() ?? string.Empty;

                        string name = string.Empty;
                        if (json.TryGetProperty("name", out var n1) && n1.ValueKind == System.Text.Json.JsonValueKind.String) name = n1.GetString() ?? string.Empty;
                        else if (json.TryGetProperty("Name", out var n2) && n2.ValueKind == System.Text.Json.JsonValueKind.String) name = n2.GetString() ?? string.Empty;

                        decimal currentPrice = 0m;
                        decimal priceChangePercent = 0m;
                        if (json.TryGetProperty("histories", out var hProp) && hProp.ValueKind == System.Text.Json.JsonValueKind.Array)
                        {
                            decimal firstPrice = 0m;
                            decimal lastPrice = 0m;
                            bool firstSet = false;
                            foreach (var h in hProp.EnumerateArray())
                            {
                                decimal val = 0m;
                                if (h.ValueKind == System.Text.Json.JsonValueKind.Object && h.TryGetProperty("value", out var vprop))
                                {
                                    if (vprop.ValueKind == System.Text.Json.JsonValueKind.Number) val = vprop.GetDecimal();
                                    else if (vprop.ValueKind == System.Text.Json.JsonValueKind.String) Decimal.TryParse(vprop.GetString(), out val);
                                }
                                else if (h.ValueKind == System.Text.Json.JsonValueKind.Number) val = h.GetDecimal();
                                else if (h.ValueKind == System.Text.Json.JsonValueKind.String) Decimal.TryParse(h.GetString(), out val);

                                if (val > 0)
                                {
                                    if (!firstSet) { firstPrice = val; firstSet = true; }
                                    lastPrice = val;
                                }
                            }

                            if (lastPrice > 0) currentPrice = lastPrice;
                            if (firstPrice > 0 && lastPrice > 0 && firstPrice != lastPrice)
                            {
                                priceChangePercent = ((lastPrice - firstPrice) / firstPrice) * 100m;
                            }
                        }

                        // tenta ler mudança explícita de 24h se presente (substitui o valor calculado)
                        if (json.TryGetProperty("priceChangePercent", out var pcpAll) && (pcpAll.ValueKind == System.Text.Json.JsonValueKind.Number || pcpAll.ValueKind == System.Text.Json.JsonValueKind.String))
                        {
                            if (pcpAll.ValueKind == System.Text.Json.JsonValueKind.Number) priceChangePercent = pcpAll.GetDecimal();
                            else Decimal.TryParse(pcpAll.GetString(), out priceChangePercent);
                        }

                        // Se nenhum preço em histórico for encontrado e o símbolo indicar fiat, usa 1.0 como padrão
                        var isFiatGuess = new HashSet<string>(StringComparer.OrdinalIgnoreCase) { "USD", "USDT", "USDC", "EUR", "BRL", "GBP", "JPY", "CAD", "AUD" };
                        if (currentPrice == 0m && !string.IsNullOrEmpty(sym) && isFiatGuess.Contains(sym)) currentPrice = 1.0m;

                        mapped.Add(new CurrencyCatalogItem { Id = rid == Guid.Empty ? Guid.NewGuid() : rid, Symbol = sym, Name = name, CurrentPrice = currentPrice, PriceChangePercent = priceChangePercent });
                }
                catch { /* pula entradas malformadas */ }
            }

                return mapped;
            }
            catch (System.Text.Json.JsonException)
            {
                return Enumerable.Empty<CurrencyCatalogItem>();
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[CurrencyCatalogClient] GetAllAsync failed: {ex.Message}");
            return Enumerable.Empty<CurrencyCatalogItem>();
        }
    }

    public async Task<CurrencyCatalogItem?> GetBySymbolAsync(string symbol, CancellationToken cancellationToken = default)
    {
        try
        {
            var all = await GetAllAsync(cancellationToken);
            return all.FirstOrDefault(c => string.Equals(c.Symbol, symbol, StringComparison.OrdinalIgnoreCase));
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[CurrencyCatalogClient] GetBySymbolAsync failed: {ex.Message}");
            return null;
        }
    }

    public async Task<CurrencyCatalogItem?> CreateAsync(CurrencyCatalogItem item, CancellationToken cancellationToken = default)
    {
        try
        {
            // O serviço currencyAvailables espera um formato CurrencyDto: Symbol, Name, Backing, Status (Id opcional)
            var payload = new
            {
                Id = item.Id,
                Symbol = item.Symbol,
                Name = item.Name,
                Backing = item.IsFiat ? "FIAT" : "CRYPTO",
                Status = "ACTIVE"
            };

            var resp = await _httpClient.PostAsJsonAsync("/currency", payload, cancellationToken);
            if (!resp.IsSuccessStatusCode)
            {
                var body = await resp.Content.ReadAsStringAsync(cancellationToken);
                Console.WriteLine($"[CurrencyCatalogClient] CreateAsync: non-success status {(int)resp.StatusCode} {resp.ReasonPhrase}; body={body}");
                return null;
            }

            // Tenta desserializar o DTO retornado para o nosso DTO local (alguns campos podem estar ausentes)
            var created = await resp.Content.ReadFromJsonAsync<CurrencyCatalogItem>(cancellationToken: cancellationToken);
            if (created != null) return created;

            // Se a forma da resposta for diferente, tenta ler como `dynamic` genérico e mapear
            var dyn = await resp.Content.ReadFromJsonAsync<dynamic>(cancellationToken: cancellationToken);
            if (dyn == null) return null;
            try
            {
                var id = Guid.Parse((string)dyn.id ?? (string)dyn.Id ?? item.Id.ToString());
                var sym = (string)dyn.symbol ?? (string)dyn.Symbol ?? item.Symbol;
                var name = (string)dyn.name ?? (string)dyn.Name ?? item.Name;
                return new CurrencyCatalogItem { Id = id, Symbol = sym, Name = name, CurrentPrice = item.CurrentPrice };
            }
            catch
            {
                return null;
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[CurrencyCatalogClient] CreateAsync failed: {ex.Message}");
            return null;
        }
    }
}
