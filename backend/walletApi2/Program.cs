using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using WalletApi2.Infrastructure;
using Microsoft.OpenApi.Models;
using WalletApi2.Infrastructure.Repositories;
using WalletApi2.Domain.Interfaces;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
// Swagger / OpenAPI
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Wallet API", Version = "v1" });
});
// keep AddOpenApi if present for other tooling, but AddSwaggerGen is required for the default Swagger middleware
builder.Services.AddOpenApi();

// CORS - allow all origins for development/testing (local dev only)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAllOrigins", policyBuilder =>
    {
        policyBuilder.AllowAnyOrigin()
                     .AllowAnyMethod()
                     .AllowAnyHeader();
    });
});

// Register WalletDbContext with SQLite
builder.Services.AddDbContext<WalletDbContext>(options =>
    options.UseSqlite("Data Source=wallet.db"));

// Register generic repository
builder.Services.AddScoped(typeof(WalletApi2.Domain.Interfaces.IRepository<>), typeof(WalletApi2.Infrastructure.Repositories.GenericRepository<>));
// Register AssetBalanceService
builder.Services.AddScoped<WalletApi2.Domain.Interfaces.IAssetBalanceService, WalletApi2.Services.AssetBalanceService>();

// JWT Authentication configuration (development placeholders)
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new Microsoft.IdentityModel.Tokens.TokenValidationParameters
    {
        ValidateIssuer = false, // development only; set true in production
        ValidateAudience = false, // development only; set true in production
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new Microsoft.IdentityModel.Tokens.SymmetricSecurityKey(
            System.Text.Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"] ?? "ReplaceWithYourKey"))
    };
});

var app = builder.Build();

// Apply pending EF migrations at startup
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<WalletDbContext>();
    db.Database.Migrate();
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    // Enable swagger middleware for development
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        // Ensure the UI points to the JSON served by Swashbuckle
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Wallet API v1");
        // leave RoutePrefix as default ('swagger') so UI is available at /swagger
    });
    // Keep MapOpenApi for additional OpenAPI mapping if needed by other tooling
    app.MapOpenApi();
}

app.UseRouting();
app.UseHttpsRedirection();

var summaries = new[]
{
    "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
};

app.MapGet("/weatherforecast", () =>
{
    var forecast =  Enumerable.Range(1, 5).Select(index =>
        new WeatherForecast
        (
            DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
            Random.Shared.Next(-20, 55),
            summaries[Random.Shared.Next(summaries.Length)]
        ))
        .ToArray();
    return forecast;
})
.WithName("GetWeatherForecast");

// Enable CORS (development only)
app.UseCors("AllowAllOrigins");

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();

record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}
