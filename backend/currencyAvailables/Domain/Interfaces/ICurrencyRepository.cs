public interface ICurrencyRepository
{
    IEnumerable<Currency> GetAll();
    Currency? GetById(int id);
    void Add(Currency currency);
    void Update(Currency currency);
    void Delete(Currency currency);
    void SaveChanges();
}
