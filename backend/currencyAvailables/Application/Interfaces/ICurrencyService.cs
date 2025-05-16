
public interface ICurrencyService{
    IEnumerable<CurrencyDTO> GetAllCurrencies();
    CurrencyDTO? GetCurrencyById(int id);
    CurrencyDTO RegisterCurrency(CurrencyDTO currencyDto);
    CurrencyDTO? UpdateCurrency(int id, CurrencyDTO currencyDto);
    bool DeleteCurrency(int id);
}


