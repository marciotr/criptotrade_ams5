public class CurrencyService : ICurrencyService
{
    private readonly ICurrencyRepository _repository;

    public CurrencyService(ICurrencyRepository repository)
    {
        _repository = repository;
    }

    public IEnumerable<CurrencyDTO> GetAllCurrencies()
    {
        var currencies = _repository.GetAll();
        return currencies.Select(c => new CurrencyDTO
        {
            Id = c.Id,
            Name = c.Name,
            Description = c.Description,
            Backing = c.Backing,
            Status = c.Status
        });
    }

    public CurrencyDTO? GetCurrencyById(int id)
    {
        var currency = _repository.GetById(id);
        if (currency == null)
            return null;

        return new CurrencyDTO
        {
            Id = currency.Id,
            Name = currency.Name,
            Description = currency.Description,
            Backing = currency.Backing,
            Status = currency.Status
        };
    }

    public CurrencyDTO RegisterCurrency(CurrencyDTO currencyDto)
    {
        var currency = new Currency
        {
            Name = currencyDto.Name,
            Description = currencyDto.Description,
            Backing = currencyDto.Backing,
            Status = currencyDto.Status
        };

        _repository.Add(currency);
        _repository.SaveChanges();

        currencyDto.Id = currency.Id;
        return currencyDto;
    }

    public CurrencyDTO? UpdateCurrency(int id, CurrencyDTO currencyDto)
    {
        var existing = _repository.GetById(id);
        if (existing == null)
            return null;

        existing.Name = currencyDto.Name;
        existing.Description = currencyDto.Description;
        existing.Backing = currencyDto.Backing;
        existing.Status = currencyDto.Status;

        _repository.Update(existing);
        _repository.SaveChanges();

        return currencyDto;
    }

    public bool DeleteCurrency(int id)
    {
        var existing = _repository.GetById(id);
        if (existing == null)
            return false;

        _repository.Delete(existing);
        _repository.SaveChanges();

        return true;
    }
}
