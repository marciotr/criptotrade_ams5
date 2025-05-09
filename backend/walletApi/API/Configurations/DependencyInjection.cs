using walletApi.Domain.Interfaces;
using walletApi.Infrastructure.Data;
using walletApi.Infrastructure.Repositories;
using walletApi.Application.Services;
using Microsoft.EntityFrameworkCore;

namespace walletApi.API.Configurations
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddApplicationServices(this IServiceCollection services, IConfiguration configuration = null)
        {
            services.AddScoped<IWalletRepository, WalletRepository>();
            services.AddScoped<IWalletService, WalletService>();
            
            // Use a configuração passada ou a configuração padrão
            services.AddDbContext<WalletDbContext>(options =>
                options.UseSqlite(configuration?.GetConnectionString("DefaultConnection") ?? 
                "Data Source=Infrastructure/Data/walletdb.sqlite"));
            
            return services;
        }
    }
}