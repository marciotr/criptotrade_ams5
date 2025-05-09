
using System.Collections.Generic;
using System.Threading.Tasks;



    public interface ICurrencyRepository
    {
        Task<IEnumerable<Currency>> GetAllAsync();
    }

