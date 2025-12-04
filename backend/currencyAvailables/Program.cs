using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using System.Text;
using CurrencyAvailables.Infrastructure.Data;
using CurrencyAvailables.Domain.Entities;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddAuthorization();
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
        options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Currency API",
        Version = "v1",
        Description = "API para gerenciamento de moedas",
        Contact = new OpenApiContact
        {
            Name = "Cauan Ortiz",
            Email = "cauan.ortiz@fatec.sp.gov.br"
        }
    });
});

builder.Services.AddApplicationServices();

// Register services
builder.Services.AddHttpClient();


// Adicione a configuração do CORS aqui
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", builder =>
    {
        builder
            .AllowAnyOrigin()
            .AllowAnyMethod()
            .AllowAnyHeader()
            .WithExposedHeaders("Authorization");
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "User API V1");
        options.RoutePrefix = string.Empty;
    });
}

app.UseHttpsRedirection();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<CurrencyDbContext>();
    db.Database.EnsureCreated();

    if (!db.Currencies.Any())
    {
        var usd = new Currency("USD", "US Dollar", "FIAT", "ACTIVE");
        usd.AddHistory(new History(usd.Id, DateTime.UtcNow, 1.0m));
        db.Currencies.Add(usd);
        db.SaveChanges();
    }
}

// Adicione o middleware do CORS antes do Authentication e Authorization
app.UseCors("AllowAll");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers()
   .RequireCors("AllowAll");

app.Run();