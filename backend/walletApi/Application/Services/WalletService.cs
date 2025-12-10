using Microsoft.EntityFrameworkCore;
using WalletApi.API.DTOs;
using WalletApi.Application.Interfaces;
using WalletApi.Infrastructure.Data;
using WalletApi.Domain.Entities;

namespace WalletApi.Application.Services;

public class WalletService : IWalletService
{
    private readonly WalletDbContext _db;
    private readonly ICurrencyCatalogClient _currencyCatalogClient;
    private readonly IHttpClientFactory _httpFactory;

    public WalletService(WalletDbContext db, ICurrencyCatalogClient currencyCatalogClient, IHttpClientFactory httpFactory)
    {
        _db = db;
        _currencyCatalogClient = currencyCatalogClient;
        _httpFactory = httpFactory;
    }

    public async Task<OperationResult> BuyAsync(BuyRequest dto)
    {
        using var tx = await _db.Database.BeginTransactionAsync();
        try
        {
            // Busca os dados da moeda no catálogo central (currencyAPI)
            var currency = await _currencyCatalogClient.GetByIdAsync(dto.IdCurrency);
            if (currency == null) return OperationResult.Failure("Moeda não encontrada no catálogo");

            var account = await _db.Accounts.FindAsync(dto.IdAccount);
            if (account == null) return OperationResult.Failure("Account not found");

            if (account.AvailableBalance < dto.FiatAmount)
            {
                return OperationResult.Failure("Saldo Insuficiente!");
            }

            var tDebit = new Transaction
            {
                IdTransaction = Guid.NewGuid(),
                IdAccount = dto.IdAccount,
                Type = "BUY_DEBIT",
                TotalAmount = dto.FiatAmount,
                Fee = dto.Fee,
                Status = "COMPLETED",
                CreatedAt = DateTime.UtcNow
            };

            if (currency.CurrentPrice <= 0)
            {
                Console.WriteLine($"[BuyAsync] Currency before fallback: Id={currency.Id} Symbol='{currency.Symbol}' CurrentPrice={currency.CurrentPrice}");
                // tenta buscar preço de mercado ao vivo no serviço de cripto via gateway
                try
                {
                    var client = _httpFactory.CreateClient();
                    client.BaseAddress = new Uri("http://localhost:5102");
                    // assume market pair against USDT
                    var pair = (currency.Symbol ?? string.Empty).ToUpperInvariant() + "USDT";
                    var resp = await client.GetAsync($"/crypto/ticker/{pair}");
                    if (resp.IsSuccessStatusCode)
                    {
                        var bodyText = await resp.Content.ReadAsStringAsync();
                        try
                        {
                            using var doc = System.Text.Json.JsonDocument.Parse(bodyText);
                            var root = doc.RootElement;
                            decimal last = 0m;
                            if (root.ValueKind == System.Text.Json.JsonValueKind.Object)
                            {
                                if (root.TryGetProperty("lastPrice", out var lp))
                                {
                                    if (lp.ValueKind == System.Text.Json.JsonValueKind.Number) last = lp.GetDecimal();
                                    else if (lp.ValueKind == System.Text.Json.JsonValueKind.String) Decimal.TryParse(lp.GetString(), out last);
                                }
                                else if (root.TryGetProperty("LastPrice", out var lp2))
                                {
                                    if (lp2.ValueKind == System.Text.Json.JsonValueKind.Number) last = lp2.GetDecimal();
                                    else if (lp2.ValueKind == System.Text.Json.JsonValueKind.String) Decimal.TryParse(lp2.GetString(), out last);
                                }
                            }

                            if (last > 0)
                            {
                                currency.CurrentPrice = last;
                                Console.WriteLine($"[BuyAsync] Fallback parsed lastPrice={last} and set currency.CurrentPrice");
                            }
                            else
                            {
                                Console.WriteLine($"[BuyAsync] Fallback parsed no valid lastPrice from ticker response: {bodyText}");
                            }
                        }
                        catch (System.Text.Json.JsonException je)
                        {
                            Console.WriteLine($"[BuyAsync] Failed parsing ticker JSON: {je.Message}");
                        }
                    }
                }
                catch {  }
                Console.WriteLine($"[BuyAsync] Currency after fallback: Id={currency.Id} Symbol='{currency.Symbol}' CurrentPrice={currency.CurrentPrice}");
            }

            if (currency.CurrentPrice <= 0)
            {
                return OperationResult.Failure("Preço da moeda inválido (zero)");
            }

            var criptoAmount = (dto.FiatAmount - dto.Fee) / currency.CurrentPrice;

            var tCredit = new Transaction
            {
                IdTransaction = Guid.NewGuid(),
                IdAccount = dto.IdAccount,
                Type = "BUY_CREDIT",
                TotalAmount = dto.FiatAmount,
                Fee = 0,
                Status = "COMPLETED",
                CreatedAt = DateTime.UtcNow,
                RelatedTransactionId = tDebit.IdTransaction
            };

            // Evita definir RelatedTransactionId de forma circular em ambas as transações.
            // Mantém a relação unidirecional: o crédito referencia o débito.

            await _db.Transactions.AddRangeAsync(tDebit, tCredit);

            var tc = new TransactionCripto
            {
                IdTransaction = tCredit.IdTransaction,
                IdCurrency = dto.IdCurrency,
                ExchangeRate = currency.CurrentPrice,
                CriptoAmount = criptoAmount
            };

            await _db.TransactionCriptos.AddAsync(tc);

            // Determina a fonte de financiamento fiat: prefere posição fiat na carteira (USDT/USD/USDC), caso contrário usa account.AvailableBalance
            decimal fiatNeeded = dto.FiatAmount;

            Domain.Entities.WalletPosition? fiatPosition = null;
            if (dto.IdWallet != Guid.Empty)
            {
                // Tenta encontrar uma posição fiat dentro da carteira (USD/USDT/USDC).
                // Procuramos posições da carteira para este wallet e comparamos o
                // símbolo no catálogo com símbolos fiat comuns. Isso mantém os fundos
                // fiat dentro da carteira sincronizados quando uma compra é executada.
                var walletPositions = await _db.WalletPositions
                    .Where(p => p.IdWallet == dto.IdWallet)
                    .ToListAsync();

                var fiatSymbols = new HashSet<string>(StringComparer.OrdinalIgnoreCase) { "USD", "USDT", "USDC" };
                foreach (var wp in walletPositions)
                {
                    try
                    {
                        var c = await _currencyCatalogClient.GetByIdAsync(wp.IdCurrency);
                        if (c != null && !string.IsNullOrEmpty(c.Symbol) && fiatSymbols.Contains(c.Symbol.Trim().ToUpperInvariant()))
                        {
                            fiatPosition = wp;
                            break;
                        }
                    }
                    catch
                    {
                    }
                }
            }

            if (fiatPosition != null)
            {
                if (fiatPosition.Amount < fiatNeeded) return OperationResult.Failure("Insufficient fiat wallet balance");
                fiatPosition.Amount -= fiatNeeded;
                fiatPosition.UpdatedAt = DateTime.UtcNow;
                _db.WalletPositions.Update(fiatPosition);
            }
            else
            {
                // fallback para o saldo da conta
                if (account.AvailableBalance < fiatNeeded) return OperationResult.Failure("Insufficient fiat balance");
                account.AvailableBalance -= fiatNeeded;
                _db.Accounts.Update(account);
            }

            // atualiza a posição na carteira
            var position = await _db.WalletPositions
                .FirstOrDefaultAsync(p => p.IdWallet == dto.IdWallet && p.IdCurrency == dto.IdCurrency);

            if (position == null)
            {
                position = new WalletPosition
                {
                    IdWalletPosition = Guid.NewGuid(),
                    IdWallet = dto.IdWallet,
                    IdCurrency = dto.IdCurrency,
                    Amount = criptoAmount,
                    AvgPrice = currency.CurrentPrice,
                    UpdatedAt = DateTime.UtcNow
                };
                await _db.WalletPositions.AddAsync(position);
                // cria um lote representando esta compra (se solicitado)
                if (dto.CreateNewLot)
                {
                    var lot = new WalletPositionLot
                    {
                        IdWalletPositionLot = Guid.NewGuid(),
                        IdWallet = dto.IdWallet,
                        IdCurrency = dto.IdCurrency,
                        OriginalAmount = criptoAmount,
                        RemainingAmount = criptoAmount,
                        AvgPrice = currency.CurrentPrice,
                        CreatedAt = DateTime.UtcNow
                    };
                    await _db.WalletPositionLots.AddAsync(lot);
                }
            }
            else
            {
                var totalValueOld = position.Amount * position.AvgPrice;
                var totalValueNew = criptoAmount * currency.CurrentPrice;
                var newAmount = position.Amount + criptoAmount;
                position.AvgPrice = newAmount > 0 ? (totalValueOld + totalValueNew) / newAmount : currency.CurrentPrice;
                position.Amount = newAmount;
                position.UpdatedAt = DateTime.UtcNow;
                _db.WalletPositions.Update(position);

                // cria um lote para esta compra adicional (se solicitado)
                if (dto.CreateNewLot)
                {
                    var lot = new WalletPositionLot
                    {
                        IdWalletPositionLot = Guid.NewGuid(),
                        IdWallet = dto.IdWallet,
                        IdCurrency = dto.IdCurrency,
                        OriginalAmount = criptoAmount,
                        RemainingAmount = criptoAmount,
                        AvgPrice = currency.CurrentPrice,
                        CreatedAt = DateTime.UtcNow
                    };
                    await _db.WalletPositionLots.AddAsync(lot);
                }
            }

            await _db.SaveChangesAsync();
            await tx.CommitAsync();

            // Retorna metadados úteis para o frontend: quanto foi gasto e o preço executado
            var usdSpent = dto.FiatAmount;
            var priceUsd = currency.CurrentPrice;
            var resultPayload = new
            {
                DebitTransaction = tDebit.IdTransaction,
                CreditTransaction = tCredit.IdTransaction,
                usdSpent,
                priceUsd,
                currency = new { Id = currency.Id, currency.Symbol, currency.Name },
                position = new { position.IdWalletPosition, position.IdCurrency, position.Amount, position.AvgPrice }
            };

            return OperationResult.Ok(resultPayload);
        }
        catch (Exception ex)
        {
            await tx.RollbackAsync();
            return OperationResult.Failure(ex.Message);
        }
    }

    public async Task<OperationResult> SellAsync(SellRequest dto)
    {
        using var tx = await _db.Database.BeginTransactionAsync();
        try
        {
            var position = await _db.WalletPositions
                .FirstOrDefaultAsync(p => p.IdWallet == dto.IdWallet && p.IdCurrency == dto.IdCurrency);
            if (position == null || position.Amount < dto.CriptoAmount)
                return OperationResult.Failure("Insufficient crypto amount");

            var currency = await _currencyCatalogClient.GetByIdAsync(dto.IdCurrency);
            if (currency == null) return OperationResult.Failure("Moeda não encontrada no catálogo");

            var tDebit = new Transaction
            {
                IdTransaction = Guid.NewGuid(),
                IdAccount = dto.IdAccount,
                Type = "SELL_DEBIT",
                TotalAmount = dto.CriptoAmount * currency.CurrentPrice,
                Fee = dto.Fee,
                Status = "COMPLETED",
                CreatedAt = DateTime.UtcNow
            };

            var tCredit = new Transaction
            {
                IdTransaction = Guid.NewGuid(),
                IdAccount = dto.IdAccount,
                Type = "SELL_CREDIT",
                TotalAmount = dto.CriptoAmount * currency.CurrentPrice - dto.Fee,
                Fee = 0,
                Status = "COMPLETED",
                CreatedAt = DateTime.UtcNow,
                RelatedTransactionId = tDebit.IdTransaction
            };

            // Evita FK circular: mantém a relação unidirecional (crédito referencia o débito)

            await _db.Transactions.AddRangeAsync(tDebit, tCredit);

            var tc = new TransactionCripto
            {
                IdTransaction = tDebit.IdTransaction,
                IdCurrency = dto.IdCurrency,
                ExchangeRate = currency.CurrentPrice,
                CriptoAmount = -dto.CriptoAmount
            };

            await _db.TransactionCriptos.AddAsync(tc);

            // consome lotes: se foi enviado um IdWalletPositionLot específico, consome primeiro desse lote
            decimal realizedPnL = 0m;
            var remainingToSell = dto.CriptoAmount;

            if (dto.IdWalletPositionLot.HasValue && dto.IdWalletPositionLot != Guid.Empty)
            {
                var targetLot = await _db.WalletPositionLots
                    .FirstOrDefaultAsync(l => l.IdWalletPositionLot == dto.IdWalletPositionLot.Value && l.IdWallet == dto.IdWallet && l.IdCurrency == dto.IdCurrency && l.RemainingAmount > 0);

                if (targetLot == null)
                {
                    return OperationResult.Failure("Lote especificado não encontrado ou sem saldo");
                }

                var toConsumeFromLot = dto.LotAmount.HasValue && dto.LotAmount.Value > 0 ? Math.Min(dto.LotAmount.Value, targetLot.RemainingAmount) : Math.Min(targetLot.RemainingAmount, remainingToSell);
                toConsumeFromLot = Math.Min(toConsumeFromLot, remainingToSell);

                if (toConsumeFromLot > 0)
                {
                    realizedPnL += (currency.CurrentPrice - targetLot.AvgPrice) * toConsumeFromLot;
                    targetLot.RemainingAmount -= toConsumeFromLot;
                    remainingToSell -= toConsumeFromLot;
                    _db.WalletPositionLots.Update(targetLot);
                }
            }

            // se ainda restar, consome demais lotes FIFO
            if (remainingToSell > 0)
            {
                var lots = await _db.WalletPositionLots
                    .Where(l => l.IdWallet == dto.IdWallet && l.IdCurrency == dto.IdCurrency && l.RemainingAmount > 0)
                    .OrderBy(l => l.CreatedAt)
                    .ToListAsync();

                foreach (var lot in lots)
                {
                    if (remainingToSell <= 0) break;
                    // caso tenhamos já consumido the target lot above, skip if it's now zero
                    var consume = Math.Min(lot.RemainingAmount, remainingToSell);
                    if (consume <= 0) continue;
                    // lucro realizado por este lote
                    realizedPnL += (currency.CurrentPrice - lot.AvgPrice) * consume;
                    lot.RemainingAmount -= consume;
                    remainingToSell -= consume;
                    _db.WalletPositionLots.Update(lot);
                }

                if (remainingToSell > 0)
                {
                    // não deveria acontecer pois checamos saldo antes
                    return OperationResult.Failure("Erro ao consumir lotes: saldo insuficiente nos lotes");
                }
            }

            // atualiza a posição consolidada
            position.Amount -= dto.CriptoAmount;
            position.UpdatedAt = DateTime.UtcNow;
            _db.WalletPositions.Update(position);

            // credita os proventos fiat de volta para a carteira ou conta
            try
            {
                var proceeds = dto.CriptoAmount * currency.CurrentPrice - dto.Fee;
                if (proceeds < 0) proceeds = 0m;

                Domain.Entities.WalletPosition? fiatPosition = null;
                if (dto.IdWallet != Guid.Empty)
                {
                    var walletPositions = await _db.WalletPositions
                        .Where(p => p.IdWallet == dto.IdWallet)
                        .ToListAsync();

                    var fiatSymbols = new HashSet<string>(StringComparer.OrdinalIgnoreCase) { "USD", "USDT", "USDC" };
                    foreach (var wp in walletPositions)
                    {
                        try
                        {
                            var c = await _currencyCatalogClient.GetByIdAsync(wp.IdCurrency);
                            if (c != null && !string.IsNullOrEmpty(c.Symbol) && fiatSymbols.Contains(c.Symbol.Trim().ToUpperInvariant()))
                            {
                                fiatPosition = wp;
                                break;
                            }
                        }
                        catch
                        {
                            // ignora falhas por posição e continua
                        }
                    }
                }

                if (fiatPosition != null)
                {
                    fiatPosition.Amount += proceeds;
                    fiatPosition.UpdatedAt = DateTime.UtcNow;
                    _db.WalletPositions.Update(fiatPosition);
                }
                else
                {
                    // fallback para o saldo da conta
                    var account = await _db.Accounts.FindAsync(dto.IdAccount);
                    if (account != null)
                    {
                        account.AvailableBalance += proceeds;
                        _db.Accounts.Update(account);
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[SellAsync] Error crediting fiat proceeds: {ex.Message}");
            }

            // se a posição atingir zero, remove-a para manter a UI limpa
            if (position.Amount == 0m)
            {
                _db.WalletPositions.Remove(position);
            }

            await _db.SaveChangesAsync();
            await tx.CommitAsync();

            return OperationResult.Ok(new { DebitTransaction = tDebit.IdTransaction, CreditTransaction = tCredit.IdTransaction, RealizedPnL = realizedPnL });
        }
        catch (Exception ex)
        {
            await tx.RollbackAsync();
            return OperationResult.Failure(ex.Message);
        }
    }

    public async Task<OperationResult> SwapAsync(SwapRequest dto)
    {
        using var tx = await _db.Database.BeginTransactionAsync();
        try
        {
            var currencyA = await _currencyCatalogClient.GetByIdAsync(dto.IdCurrencyOut);
            var currencyB = await _currencyCatalogClient.GetByIdAsync(dto.IdCurrencyIn);
            if (currencyA == null || currencyB == null) return OperationResult.Failure("Moeda não encontrada no catálogo");

            var positionA = await _db.WalletPositions
                .FirstOrDefaultAsync(p => p.IdWallet == dto.IdWallet && p.IdCurrency == dto.IdCurrencyOut);
            if (positionA == null || positionA.Amount < dto.AmountOut)
                return OperationResult.Failure("Insufficient amount for swap");

            // determina o valor equivalente em fiat
            var fiatValue = dto.AmountOut * currencyA.CurrentPrice;
            if (currencyB.CurrentPrice <= 0)
            {
                return OperationResult.Failure("Preço da moeda destino inválido (zero)");
            }

            var amountIn = fiatValue / currencyB.CurrentPrice; // conversão básica

            var tOut = new Transaction
            {
                IdTransaction = Guid.NewGuid(),
                IdAccount = dto.IdAccount,
                Type = "SWAP_OUT",
                TotalAmount = fiatValue,
                Fee = dto.Fee,
                Status = "COMPLETED",
                CreatedAt = DateTime.UtcNow
            };

            var tIn = new Transaction
            {
                IdTransaction = Guid.NewGuid(),
                IdAccount = dto.IdAccount,
                Type = "SWAP_IN",
                TotalAmount = fiatValue,
                Fee = 0,
                Status = "COMPLETED",
                CreatedAt = DateTime.UtcNow,
                RelatedTransactionId = tOut.IdTransaction
            };

            // Evita FK circular: mantém a relação unidirecional (in referencia out)

            await _db.Transactions.AddRangeAsync(tOut, tIn);

            var tcOut = new TransactionCripto
            {
                IdTransaction = tOut.IdTransaction,
                IdCurrency = dto.IdCurrencyOut,
                ExchangeRate = currencyA.CurrentPrice,
                CriptoAmount = -dto.AmountOut
            };

            var tcIn = new TransactionCripto
            {
                IdTransaction = tIn.IdTransaction,
                IdCurrency = dto.IdCurrencyIn,
                ExchangeRate = currencyB.CurrentPrice,
                CriptoAmount = amountIn
            };

            await _db.TransactionCriptos.AddRangeAsync(tcOut, tcIn);

            // atualiza posições
            positionA.Amount -= dto.AmountOut;
            positionA.UpdatedAt = DateTime.UtcNow;
            _db.WalletPositions.Update(positionA);

            var positionB = await _db.WalletPositions
                .FirstOrDefaultAsync(p => p.IdWallet == dto.IdWallet && p.IdCurrency == dto.IdCurrencyIn);

            if (positionB == null)
            {
                positionB = new WalletPosition
                {
                    IdWalletPosition = Guid.NewGuid(),
                    IdWallet = dto.IdWallet,
                    IdCurrency = dto.IdCurrencyIn,
                    Amount = amountIn,
                    AvgPrice = currencyB.CurrentPrice,
                    UpdatedAt = DateTime.UtcNow
                };
                await _db.WalletPositions.AddAsync(positionB);
            }
            else
            {
                var totalValueOld = positionB.Amount * positionB.AvgPrice;
                var totalValueNew = amountIn * currencyB.CurrentPrice;
                var newAmount = positionB.Amount + amountIn;
                positionB.AvgPrice = newAmount > 0 ? (totalValueOld + totalValueNew) / newAmount : currencyB.CurrentPrice;
                positionB.Amount = newAmount;
                positionB.UpdatedAt = DateTime.UtcNow;
                _db.WalletPositions.Update(positionB);
            }

            await _db.SaveChangesAsync();
            await tx.CommitAsync();

            return OperationResult.Ok(new { OutTransaction = tOut.IdTransaction, InTransaction = tIn.IdTransaction });
        }
        catch (Exception ex)
        {
            await tx.RollbackAsync();
            return OperationResult.Failure(ex.Message);
        }
    }
}
