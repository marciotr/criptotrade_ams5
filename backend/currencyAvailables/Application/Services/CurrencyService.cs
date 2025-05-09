
    public class CurrencyService : ICurrencyService
    {
        private readonly ICurrencyRepository _repository;

        public CurrencyService(ICurrencyRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<CurrencyDTO>> GetAllAsync()
        {
            var currencies = await _repository.GetAllAsync();
            return currencies.Select(c => new CurrencyDTO
            {
                Id = c.Id,
                Name = c.Name,
                Description = c.Description,
                Backing = c.Backing,
                Status = c.Status
            });
        }
    }

