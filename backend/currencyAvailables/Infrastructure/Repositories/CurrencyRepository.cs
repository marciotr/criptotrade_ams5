public class CurrencyRepository : ICurrencyRepository
{
    private readonly CurrencyDbContext _context;

    public CurrencyRepository(CurrencyDbContext context)
    {
        _context = context;
    }

    public IEnumerable<Currency> GetAll()
    {
        return _context.Currencies.ToList();
    }

    public Currency? GetById(int id)
    {
        return _context.Currencies.Find(id);
    }

    public void Add(Currency currency)
    {
        _context.Currencies.Add(currency);
    }

    public void Update(Currency currency)
    {
        _context.Currencies.Update(currency);
    }

    public void Delete(Currency currency)
    {
        _context.Currencies.Remove(currency);
    }

    public void SaveChanges()
    {
        _context.SaveChanges();
    }
}
