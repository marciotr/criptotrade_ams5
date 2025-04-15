using Microsoft.OpenApi.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using cryptoApi.Infrastructure.ExternalServices;
using cryptoApi.Application.Interfaces;
using cryptoApi.Application.Services;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

var configuration = builder.Configuration;
var key = Encoding.ASCII.GetBytes(configuration["Jwt:Key"] ?? throw new ArgumentNullException("Jwt:Key is missing"));

// Configurar autenticação JWT
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = false,
        ValidateAudience = false
    };
});

// Adicionar serviços básicos
builder.Services.AddAuthorization();
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// Configurar Swagger
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Crypto API",
        Version = "v1",
        Description = "API para consumo de dados de criptomoedas",
        Contact = new OpenApiContact
        {
            Name = "Cauan Ortiz",
            Email = "cauan.ortiz@fatec.sp.gov.br"
        }
    });

    // Adicionar suporte para JWT no Swagger
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        In = ParameterLocation.Header,
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        BearerFormat = "JWT",
        Scheme = "bearer",
        Description = "Insira seu token JWT."
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// Registrar serviços específicos da API de criptomoedas
builder.Services.AddHttpClient();
builder.Services.AddSingleton<BinanceApiClient>();
builder.Services.AddScoped<ICryptoService, CryptoService>();
builder.Services.AddScoped<ICryptoHistoryService, CryptoHistoryService>();
builder.Services.AddScoped<ICryptoMarketService, CryptoMarketService>();

// Adicionar cache em memória para melhorar performance com dados externos
builder.Services.AddMemoryCache();

// Configurar CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", builder =>
    {
        builder
            .AllowAnyOrigin()
            .AllowAnyMethod()
            .AllowAnyHeader();
    });
});

var app = builder.Build();

// Configurar o pipeline de HTTP
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "Crypto API V1");
        options.RoutePrefix = string.Empty;
    });
}

app.UseHttpsRedirection();

// Aplicar CORS
app.UseCors("AllowAll");

app.UseAuthentication();
app.UseAuthorization();

// Mapear controladores
app.MapControllers();

app.Run();